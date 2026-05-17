/**
 * real_estate_transactions_raw -> real_estate_market_stats_annual 年間集計投入スクリプト。
 *
 * 対象: 神奈川県6市 / year=2024。raw の 2024年 Q1〜Q4 全件を年間集計する。
 * 年間中央値は「四半期中央値の平均」ではなく、raw の年間全件から percentile_cont(0.5) を
 * 1回算出する (docs/real-estate-annual-stats-plan.md §5)。
 *
 * 実行: node --env-file=.env.local scripts/aggregate-real-estate-annual-stats.mjs
 *
 * 注意:
 *  - API取得は行わない (raw の既存データのみ集計)。
 *  - real_estate_transactions_raw は読み取りのみ。書き込み先は real_estate_market_stats_annual のみ。
 *  - DATABASE_URL は process.env からのみ読み込む。
 */

import pg from "pg";

// ---- 固定条件 --------------------------------------------------------------
const YEAR = 2024;
// 神奈川県6市の6桁 municipality_code_6
const TARGET_CODE6 = ["142077", "142034", "142042", "142051", "142069", "142123"];

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
  console.error("DATABASE_URL が未設定です。`node --env-file=.env.local` で実行してください。");
  process.exit(1);
}

const client = new pg.Client({ connectionString: DB_URL });

// 年間集計 UPSERT:
//  - WHERE は transaction_year のみ (quarter で絞らない = Q1〜Q4 全件)
//  - GROUP BY に quarter を含めない
//  - is_low_sample は年間集計のため transaction_count < 20
//  - ON CONFLICT 時は updated_at のみ now() 更新、created_at は初回INSERT値を保持
const UPSERT_SQL = `
WITH src AS (
  SELECT
    municipality_code_6, property_type,
    transaction_year AS year, price_category,
    CASE WHEN trade_price    ~ '^[0-9]+(\\.[0-9]+)?$' THEN trade_price::numeric    END AS price_n,
    CASE WHEN unit_price     ~ '^[0-9]+(\\.[0-9]+)?$' THEN unit_price::numeric     END AS unit_n,
    CASE WHEN price_per_unit ~ '^[0-9]+(\\.[0-9]+)?$' THEN price_per_unit::numeric END AS ppu_n,
    CASE WHEN area           ~ '^[0-9]+(\\.[0-9]+)?$' THEN area::numeric           END AS area_n
  FROM real_estate_transactions_raw
  WHERE municipality_code_6 = ANY($1) AND transaction_year = $2
),
calc AS (
  SELECT src.*,
    COALESCE(ppu_n, CASE WHEN unit_n IS NOT NULL THEN round(unit_n * 3.305785, 2) END) AS tsubo_n
  FROM src
),
agg AS (
  SELECT
    municipality_code_6, property_type, year, price_category,
    COUNT(*)::int AS transaction_count,
    round(percentile_cont(0.5) WITHIN GROUP (ORDER BY price_n)::numeric)::bigint AS median_price,
    round(avg(price_n))::bigint                                                 AS avg_price,
    round(percentile_cont(0.5) WITHIN GROUP (ORDER BY unit_n)::numeric, 2)       AS median_price_per_sqm,
    round(avg(unit_n), 2)                                                       AS avg_price_per_sqm,
    round(percentile_cont(0.5) WITHIN GROUP (ORDER BY tsubo_n)::numeric, 2)      AS median_price_per_tsubo,
    round(avg(tsubo_n), 2)                                                      AS avg_price_per_tsubo,
    round(percentile_cont(0.5) WITHIN GROUP (ORDER BY area_n)::numeric, 2)       AS median_area_sqm,
    round(avg(area_n), 2)                                                       AS avg_area_sqm,
    (COUNT(*) < 20)                                                             AS is_low_sample
  FROM calc
  GROUP BY municipality_code_6, property_type, year, price_category
)
INSERT INTO real_estate_market_stats_annual (
  municipality_code_6, property_type, year, price_category,
  transaction_count, median_price, avg_price,
  median_price_per_sqm, avg_price_per_sqm,
  median_price_per_tsubo, avg_price_per_tsubo,
  median_area_sqm, avg_area_sqm, is_low_sample
)
SELECT
  municipality_code_6, property_type, year, price_category,
  transaction_count, median_price, avg_price,
  median_price_per_sqm, avg_price_per_sqm,
  median_price_per_tsubo, avg_price_per_tsubo,
  median_area_sqm, avg_area_sqm, is_low_sample
FROM agg
ON CONFLICT (municipality_code_6, property_type, year, price_category)
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
  updated_at             = now()
RETURNING 1
`;

try {
  await client.connect();

  // ---- 集計元 raw の確認 ----------------------------------------------------
  console.log("=== raw集計元 (6市 / 2024 Q1〜Q4) ===");
  const rawTotal = await client.query(
    `SELECT COUNT(*)::int AS c FROM real_estate_transactions_raw
      WHERE municipality_code_6 = ANY($1) AND transaction_year = $2`,
    [TARGET_CODE6, YEAR],
  );
  console.log("対象件数:", rawTotal.rows[0].c);

  console.log("--- 自治体別件数 ---");
  console.table((await client.query(
    `SELECT m.municipality, COUNT(*)::int AS c
       FROM real_estate_transactions_raw r
       JOIN municipalities m ON m.code = r.municipality_code_6
      WHERE r.municipality_code_6 = ANY($1) AND r.transaction_year = $2
      GROUP BY m.municipality ORDER BY m.municipality`,
    [TARGET_CODE6, YEAR],
  )).rows);

  console.log("--- property_type別 ---");
  console.table((await client.query(
    `SELECT property_type, COUNT(*)::int AS c FROM real_estate_transactions_raw
      WHERE municipality_code_6 = ANY($1) AND transaction_year = $2
      GROUP BY property_type ORDER BY property_type`,
    [TARGET_CODE6, YEAR],
  )).rows);

  console.log("--- price_category別 ---");
  console.table((await client.query(
    `SELECT price_category, COUNT(*)::int AS c FROM real_estate_transactions_raw
      WHERE municipality_code_6 = ANY($1) AND transaction_year = $2
      GROUP BY price_category ORDER BY price_category`,
    [TARGET_CODE6, YEAR],
  )).rows);

  // ---- 年間集計 UPSERT ------------------------------------------------------
  const upsert = await client.query(UPSERT_SQL, [TARGET_CODE6, YEAR]);
  console.log("\n=== annual投入結果 ===");
  console.log("UPSERT件数:", upsert.rowCount);
  console.log("annual総件数:", (await client.query(
    `SELECT COUNT(*)::int AS c FROM real_estate_market_stats_annual`,
  )).rows[0].c);

  // ---- 確認SELECT ----------------------------------------------------------
  console.log("\n=== 自治体別 annual集計行数 ===");
  console.table((await client.query(
    `SELECT m.municipality, COUNT(*)::int AS annual_rows
       FROM real_estate_market_stats_annual a
       JOIN municipalities m ON m.code = a.municipality_code_6
      WHERE a.municipality_code_6 = ANY($1) AND a.year = $2
      GROUP BY m.municipality ORDER BY m.municipality`,
    [TARGET_CODE6, YEAR],
  )).rows);

  console.log("=== is_low_sample 件数 ===");
  console.table((await client.query(
    `SELECT is_low_sample, COUNT(*)::int AS c FROM real_estate_market_stats_annual
      WHERE municipality_code_6 = ANY($1) AND year = $2
      GROUP BY is_low_sample ORDER BY is_low_sample`,
    [TARGET_CODE6, YEAR],
  )).rows);

  console.log("=== NULL健全性 (annual全行) ===");
  console.log((await client.query(
    `SELECT COUNT(*)::int AS rows,
       COUNT(*) FILTER (WHERE median_price IS NULL) AS null_median_price,
       COUNT(*) FILTER (WHERE avg_price IS NULL)    AS null_avg_price
     FROM real_estate_market_stats_annual
     WHERE municipality_code_6 = ANY($1) AND year = $2`,
    [TARGET_CODE6, YEAR],
  )).rows[0]);

  console.log("\n=== annual集計結果サンプル (transaction) ===");
  console.table((await client.query(
    `SELECT m.municipality, a.property_type, a.price_category, a.transaction_count,
            a.median_price, a.avg_price, a.median_price_per_sqm, a.median_price_per_tsubo,
            a.median_area_sqm, a.avg_area_sqm, a.is_low_sample
       FROM real_estate_market_stats_annual a
       JOIN municipalities m ON m.code = a.municipality_code_6
      WHERE a.municipality_code_6 = ANY($1) AND a.year = $2 AND a.price_category = 'transaction'
      ORDER BY m.municipality, a.transaction_count DESC`,
    [TARGET_CODE6, YEAR],
  )).rows);
} catch (err) {
  console.error("ERROR:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
