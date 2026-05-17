/**
 * real_estate_transactions_raw -> real_estate_market_stats 集計投入スクリプト。
 *
 * 固定条件 (茅ヶ崎市 142077 / 2024年Q1) の raw投入済みデータのみを対象に、
 * (municipality_code_6, property_type, year, quarter, price_category) 単位で集計し、
 * real_estate_market_stats へ UPSERT する。
 *
 * 実行: node --env-file=.env.local scripts/aggregate-real-estate-stats.mjs
 *
 * 注意:
 *  - API取得は行わない (rawの既存データのみ集計)。
 *  - real_estate_transactions_raw は読み取りのみ。INSERT/UPDATE/DELETEしない。
 *  - 書き込み先は real_estate_market_stats のみ。
 *  - DATABASE_URL は process.env からのみ読み込む。
 */

import pg from "pg";

// ---- 固定条件 --------------------------------------------------------------
const MUNI6 = "142077"; // 茅ヶ崎市 6桁コード
const YEAR = 2024;
const QUARTER = 1;

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
  console.error("DATABASE_URL が未設定です。`node --env-file=.env.local` で実行してください。");
  process.exit(1);
}

const client = new pg.Client({ connectionString: DB_URL });

// rawはTEXT。数値文字列のみ numeric にキャスト、空文字や数値化不能値は NULL。
// 坪単価: price_per_unit を優先、空で unit_price が数値なら unit_price * 3.305785 で補完。
const UPSERT_SQL = `
WITH src AS (
  SELECT
    municipality_code_6,
    property_type,
    transaction_year   AS year,
    transaction_quarter AS quarter,
    price_category,
    CASE WHEN trade_price    ~ '^[0-9]+(\\.[0-9]+)?$' THEN trade_price::numeric    END AS price_n,
    CASE WHEN unit_price     ~ '^[0-9]+(\\.[0-9]+)?$' THEN unit_price::numeric     END AS unit_n,
    CASE WHEN price_per_unit ~ '^[0-9]+(\\.[0-9]+)?$' THEN price_per_unit::numeric END AS ppu_n,
    CASE WHEN area           ~ '^[0-9]+(\\.[0-9]+)?$' THEN area::numeric           END AS area_n
  FROM real_estate_transactions_raw
  WHERE municipality_code_6 = $1
    AND transaction_year    = $2
    AND transaction_quarter = $3
),
calc AS (
  SELECT
    src.*,
    COALESCE(
      ppu_n,
      CASE WHEN unit_n IS NOT NULL THEN round(unit_n * 3.305785, 2) END
    ) AS tsubo_n
  FROM src
),
agg AS (
  SELECT
    municipality_code_6,
    property_type,
    year,
    quarter,
    price_category,
    COUNT(*)::int AS transaction_count,
    round(percentile_cont(0.5) WITHIN GROUP (ORDER BY price_n)::numeric)::bigint     AS median_price,
    round(avg(price_n))::bigint                                                     AS avg_price,
    round(percentile_cont(0.5) WITHIN GROUP (ORDER BY unit_n)::numeric, 2)           AS median_price_per_sqm,
    round(avg(unit_n), 2)                                                           AS avg_price_per_sqm,
    round(percentile_cont(0.5) WITHIN GROUP (ORDER BY tsubo_n)::numeric, 2)          AS median_price_per_tsubo,
    round(avg(tsubo_n), 2)                                                          AS avg_price_per_tsubo,
    round(percentile_cont(0.5) WITHIN GROUP (ORDER BY area_n)::numeric, 2)           AS median_area_sqm,
    round(avg(area_n), 2)                                                           AS avg_area_sqm,
    (COUNT(*) < 10)                                                    AS is_low_sample
  FROM calc
  GROUP BY municipality_code_6, property_type, year, quarter, price_category
)
INSERT INTO real_estate_market_stats (
  municipality_code_6, property_type, price_category, year, quarter,
  transaction_count, median_price, avg_price,
  median_price_per_sqm, avg_price_per_sqm,
  median_price_per_tsubo, avg_price_per_tsubo,
  median_area_sqm, avg_area_sqm, is_low_sample, computed_at
)
SELECT
  municipality_code_6, property_type, price_category, year, quarter,
  transaction_count, median_price, avg_price,
  median_price_per_sqm, avg_price_per_sqm,
  median_price_per_tsubo, avg_price_per_tsubo,
  median_area_sqm, avg_area_sqm, is_low_sample, now()
FROM agg
ON CONFLICT (municipality_code_6, property_type, year, quarter, price_category)
DO UPDATE SET
  transaction_count      = EXCLUDED.transaction_count,
  median_price           = EXCLUDED.median_price,
  avg_price              = EXCLUDED.avg_price,
  median_price_per_sqm   = EXCLUDED.median_price_per_sqm,
  avg_price_per_sqm      = EXCLUDED.avg_price_per_sqm,
  median_price_per_tsubo = EXCLUDED.median_price_per_tsubo,
  avg_price_per_tsubo    = EXCLUDED.avg_price_per_tsubo,
  median_area_sqm        = EXCLUDED.median_area_sqm,
  avg_area_sqm           = EXCLUDED.avg_area_sqm,
  is_low_sample          = EXCLUDED.is_low_sample,
  computed_at            = EXCLUDED.computed_at
RETURNING 1
`;

try {
  await client.connect();

  // ---- 集計元 raw の確認 ----------------------------------------------------
  console.log("=== 集計元raw ===");
  console.log("条件:", { municipality_code_6: MUNI6, year: YEAR, quarter: QUARTER });
  const rawCount = await client.query(
    `SELECT COUNT(*)::int AS c FROM real_estate_transactions_raw
      WHERE municipality_code_6 = $1 AND transaction_year = $2 AND transaction_quarter = $3`,
    [MUNI6, YEAR, QUARTER],
  );
  console.log("対象件数:", rawCount.rows[0].c);
  const rawByType = await client.query(
    `SELECT property_type, COUNT(*)::int AS c FROM real_estate_transactions_raw
      WHERE municipality_code_6 = $1 AND transaction_year = $2 AND transaction_quarter = $3
      GROUP BY property_type ORDER BY property_type`,
    [MUNI6, YEAR, QUARTER],
  );
  console.table(rawByType.rows);
  const rawByCat = await client.query(
    `SELECT price_category, COUNT(*)::int AS c FROM real_estate_transactions_raw
      WHERE municipality_code_6 = $1 AND transaction_year = $2 AND transaction_quarter = $3
      GROUP BY price_category ORDER BY price_category`,
    [MUNI6, YEAR, QUARTER],
  );
  console.table(rawByCat.rows);

  // ---- 集計 UPSERT ----------------------------------------------------------
  const upsert = await client.query(UPSERT_SQL, [MUNI6, YEAR, QUARTER]);
  console.log("=== market_stats投入結果 ===");
  console.log("UPSERT件数:", upsert.rowCount);
  const total = await client.query(`SELECT COUNT(*)::int AS c FROM real_estate_market_stats`);
  console.log("market_stats総件数:", total.rows[0].c);
  console.log();

  // ---- 集計結果サンプル -----------------------------------------------------
  console.log("=== 集計結果サンプル ===");
  const sample = await client.query(
    `SELECT property_type, price_category, transaction_count,
            median_price, avg_price, median_price_per_sqm, median_price_per_tsubo,
            median_area_sqm, avg_area_sqm, is_low_sample
       FROM real_estate_market_stats
      WHERE municipality_code_6 = $1 AND year = $2 AND quarter = $3
      ORDER BY property_type, price_category`,
    [MUNI6, YEAR, QUARTER],
  );
  console.table(sample.rows);

  // ---- NULL健全性チェック ---------------------------------------------------
  const nulls = await client.query(
    `SELECT
       COUNT(*)::int AS rows,
       COUNT(*) FILTER (WHERE median_price IS NULL)           AS null_median_price,
       COUNT(*) FILTER (WHERE avg_price IS NULL)              AS null_avg_price,
       COUNT(*) FILTER (WHERE median_price_per_sqm IS NULL)   AS null_median_per_sqm,
       COUNT(*) FILTER (WHERE median_price_per_tsubo IS NULL) AS null_median_per_tsubo,
       COUNT(*) FILTER (WHERE median_area_sqm IS NULL)        AS null_median_area,
       COUNT(*) FILTER (WHERE avg_area_sqm IS NULL)           AS null_avg_area,
       COUNT(*) FILTER (WHERE is_low_sample) AS low_sample_true,
       COUNT(*) FILTER (WHERE NOT is_low_sample) AS low_sample_false
     FROM real_estate_market_stats
     WHERE municipality_code_6 = $1 AND year = $2 AND quarter = $3`,
    [MUNI6, YEAR, QUARTER],
  );
  console.log("=== NULL健全性 / is_low_sample ===");
  console.log(nulls.rows[0]);
} catch (err) {
  console.error("ERROR:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
