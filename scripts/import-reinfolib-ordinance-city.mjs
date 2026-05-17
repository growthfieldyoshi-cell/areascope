/**
 * 不動産情報ライブラリ API (XIT001) — 政令指定都市の市単位集約 取得・集計スクリプト (案C)。
 *
 * 行政区コードでAPI取得し、AreaScope上は親市コードに集約して保存・集計する。
 * 対象政令市・区・年は TARGETS / YEAR / QUARTERS 定数で指定する。
 *
 * 実行: node --env-file=.env.local scripts/import-reinfolib-ordinance-city.mjs
 *
 * 処理フロー (quarterごとに / 区ごとにDELETEしない):
 *   1. 対象政令市の全区を XIT001 で取得
 *   2. 取得結果をメモリ上に集約 (municipality_code_6 は親市コードに統一)
 *   3. 1トランザクションで: 親市コード×year×quarter の transaction/contract を無条件DELETE
 *   4. 全区分をまとめてINSERT
 *   5. quarterly集計を UPSERT
 *   6. 全quarter完了後、runAnnual=true なら raw年間全件から annual集計を UPSERT
 *
 * 注意:
 *  - 既存テーブル (municipalities / stations) は変更しない。municipalities に区は追加しない。
 *  - APIキー / DATABASE_URL は process.env からのみ読み込み、ログ出力しない。
 */

import pg from "pg";

// ---- 対象政令市の設定 ------------------------------------------------------
const YEAR = 2024;
const QUARTERS = [1, 2, 3, 4];
const RUN_ANNUAL = true; // 全quarter処理後に 2024年通年集計を行うか

// 対象政令市。parentCode6 に区データを集約する。wardJis は行政区の5桁jisコード。
const TARGETS = [
  {
    name: "千葉市",
    parentCode6: "121002",
    wardJis: ["12101", "12102", "12103", "12104", "12105", "12106"],
  },
];

const PROPERTY_TYPE_MAP = {
  "宅地(土地)": "land",
  "宅地(土地と建物)": "land_and_building",
  "中古マンション等": "used_condominium",
  "農地": "farmland",
  "林地": "forest",
};
const PRICE_CATEGORY_MAP = {
  "不動産取引価格情報": "transaction",
  "成約価格情報": "contract",
};

const API_KEY = process.env.REINFOLIB_API_KEY;
const DB_URL = process.env.DATABASE_URL;
if (!API_KEY || !DB_URL) {
  console.error("REINFOLIB_API_KEY / DATABASE_URL が未設定です。`node --env-file=.env.local` で実行してください。");
  process.exit(1);
}

const INSERT_RAW_SQL = `
  INSERT INTO real_estate_transactions_raw (
    municipality_code_6, property_type, price_category,
    transaction_year, transaction_quarter,
    type_raw, price_category_raw, region, prefecture, municipality,
    district_name, district_code, trade_price, price_per_unit, unit_price,
    area, land_shape, frontage, total_floor_area, building_year,
    structure, floor_plan, building_use, purpose, direction,
    classification, breadth, city_planning, coverage_ratio, floor_area_ratio,
    period_raw, renovation, remarks, raw_payload, source
  ) VALUES (
    $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
    $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35
  )`;

// quarterly集計 UPSERT (親市コード×year×quarter)
const AGGREGATE_QUARTERLY_SQL = `
WITH src AS (
  SELECT
    municipality_code_6, property_type,
    transaction_year AS year, transaction_quarter AS quarter, price_category,
    CASE WHEN trade_price    ~ '^[0-9]+(\\.[0-9]+)?$' THEN trade_price::numeric    END AS price_n,
    CASE WHEN unit_price     ~ '^[0-9]+(\\.[0-9]+)?$' THEN unit_price::numeric     END AS unit_n,
    CASE WHEN price_per_unit ~ '^[0-9]+(\\.[0-9]+)?$' THEN price_per_unit::numeric END AS ppu_n,
    CASE WHEN area           ~ '^[0-9]+(\\.[0-9]+)?$' THEN area::numeric           END AS area_n
  FROM real_estate_transactions_raw
  WHERE municipality_code_6 = $1 AND transaction_year = $2 AND transaction_quarter = $3
),
calc AS (
  SELECT src.*,
    COALESCE(ppu_n, CASE WHEN unit_n IS NOT NULL THEN round(unit_n * 3.305785, 2) END) AS tsubo_n
  FROM src
),
agg AS (
  SELECT
    municipality_code_6, property_type, year, quarter, price_category,
    COUNT(*)::int AS transaction_count,
    round(percentile_cont(0.5) WITHIN GROUP (ORDER BY price_n)::numeric)::bigint AS median_price,
    round(avg(price_n))::bigint                                                 AS avg_price,
    round(percentile_cont(0.5) WITHIN GROUP (ORDER BY unit_n)::numeric, 2)       AS median_price_per_sqm,
    round(avg(unit_n), 2)                                                       AS avg_price_per_sqm,
    round(percentile_cont(0.5) WITHIN GROUP (ORDER BY tsubo_n)::numeric, 2)      AS median_price_per_tsubo,
    round(avg(tsubo_n), 2)                                                      AS avg_price_per_tsubo,
    round(percentile_cont(0.5) WITHIN GROUP (ORDER BY area_n)::numeric, 2)       AS median_area_sqm,
    round(avg(area_n), 2)                                                       AS avg_area_sqm,
    (COUNT(*) < 10)                                                             AS is_low_sample
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
  transaction_count = EXCLUDED.transaction_count,
  median_price = EXCLUDED.median_price, avg_price = EXCLUDED.avg_price,
  median_price_per_sqm = EXCLUDED.median_price_per_sqm, avg_price_per_sqm = EXCLUDED.avg_price_per_sqm,
  median_price_per_tsubo = EXCLUDED.median_price_per_tsubo, avg_price_per_tsubo = EXCLUDED.avg_price_per_tsubo,
  median_area_sqm = EXCLUDED.median_area_sqm, avg_area_sqm = EXCLUDED.avg_area_sqm,
  is_low_sample = EXCLUDED.is_low_sample, computed_at = EXCLUDED.computed_at
RETURNING 1
`;

// annual集計 UPSERT (親市コード×year: quarterで絞らず raw年間全件から中央値を再計算)
const AGGREGATE_ANNUAL_SQL = `
WITH src AS (
  SELECT
    municipality_code_6, property_type,
    transaction_year AS year, price_category,
    CASE WHEN trade_price    ~ '^[0-9]+(\\.[0-9]+)?$' THEN trade_price::numeric    END AS price_n,
    CASE WHEN unit_price     ~ '^[0-9]+(\\.[0-9]+)?$' THEN unit_price::numeric     END AS unit_n,
    CASE WHEN price_per_unit ~ '^[0-9]+(\\.[0-9]+)?$' THEN price_per_unit::numeric END AS ppu_n,
    CASE WHEN area           ~ '^[0-9]+(\\.[0-9]+)?$' THEN area::numeric           END AS area_n
  FROM real_estate_transactions_raw
  WHERE municipality_code_6 = $1 AND transaction_year = $2
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
  transaction_count = EXCLUDED.transaction_count,
  median_price = EXCLUDED.median_price, avg_price = EXCLUDED.avg_price,
  median_price_per_sqm = EXCLUDED.median_price_per_sqm, avg_price_per_sqm = EXCLUDED.avg_price_per_sqm,
  median_price_per_tsubo = EXCLUDED.median_price_per_tsubo, avg_price_per_tsubo = EXCLUDED.avg_price_per_tsubo,
  median_area_sqm = EXCLUDED.median_area_sqm, avg_area_sqm = EXCLUDED.avg_area_sqm,
  is_low_sample = EXCLUDED.is_low_sample, updated_at = now()
RETURNING 1
`;

// 1政令市×1四半期分: 全区を取得 -> raw一括置換 -> quarterly集計 (1トランザクション)
async function processQuarter(client, city, quarter) {
  console.log(`\n--- ${city.name} ${YEAR}年Q${quarter} ---`);
  const allRows = [];
  for (const wardJis of city.wardJis) {
    const params = new URLSearchParams({
      year: String(YEAR), quarter: String(quarter), city: wardJis,
    });
    const res = await fetch(`https://www.reinfolib.mlit.go.jp/ex-api/external/XIT001?${params}`, {
      headers: { "Ocp-Apim-Subscription-Key": API_KEY },
    });
    const body = await res.json();
    if (body.status !== "OK" || !Array.isArray(body.data)) {
      throw new Error(`API応答が不正 (city=${wardJis} Q${quarter}): status=${body.status}`);
    }
    for (const r of body.data) {
      const propertyType = PROPERTY_TYPE_MAP[r.Type];
      const priceCategory = PRICE_CATEGORY_MAP[r.PriceCategory];
      if (!propertyType) throw new Error(`未知の Type (city=${wardJis}): ${JSON.stringify(r.Type)}`);
      if (!priceCategory) throw new Error(`未知の PriceCategory (city=${wardJis}): ${JSON.stringify(r.PriceCategory)}`);
      allRows.push({ record: r, propertyType, priceCategory });
    }
    console.log(`  [取得] city=${wardJis} ${body.data[0]?.Municipality ?? "(0件)"} : ${body.data.length}件`);
  }

  await client.query("BEGIN");
  // 区ごとにDELETEしない。親市コード×year×quarter の transaction/contract を一括DELETE
  const del = await client.query(
    `DELETE FROM real_estate_transactions_raw
      WHERE municipality_code_6 = $1 AND transaction_year = $2 AND transaction_quarter = $3
        AND price_category IN ('transaction', 'contract')`,
    [city.parentCode6, YEAR, quarter],
  );
  let insertCount = 0;
  for (const { record: r, propertyType, priceCategory } of allRows) {
    await client.query(INSERT_RAW_SQL, [
      city.parentCode6, propertyType, priceCategory, YEAR, quarter,
      r.Type, r.PriceCategory, r.Region, r.Prefecture, r.Municipality,
      r.DistrictName, r.DistrictCode, r.TradePrice, r.PricePerUnit, r.UnitPrice,
      r.Area, r.LandShape, r.Frontage, r.TotalFloorArea, r.BuildingYear,
      r.Structure, r.FloorPlan, r.Use, r.Purpose, r.Direction,
      r.Classification, r.Breadth, r.CityPlanning, r.CoverageRatio, r.FloorAreaRatio,
      r.Period, r.Renovation, r.Remarks, JSON.stringify(r), "mlit_reinfolib",
    ]);
    insertCount++;
  }
  const agg = await client.query(AGGREGATE_QUARTERLY_SQL, [city.parentCode6, YEAR, quarter]);
  await client.query("COMMIT");

  console.log(`  Q${quarter}: 取得${allRows.length}件 / DELETE ${del.rowCount} / INSERT ${insertCount} / quarterly UPSERT ${agg.rowCount}`);
  return { quarter, apiCount: allRows.length, deleteCount: del.rowCount, insertCount, quarterlyRows: agg.rowCount };
}

const client = new pg.Client({ connectionString: DB_URL, keepAlive: true });
client.on("error", (e) => console.error("pg client error:", e.message));

try {
  await client.connect();

  for (const city of TARGETS) {
    // 親市コードの実在確認 (FK参照先)
    const parent = await client.query(
      `SELECT code, municipality FROM municipalities WHERE code = $1`,
      [city.parentCode6],
    );
    if (parent.rowCount !== 1) {
      throw new Error(`親市コード ${city.parentCode6} が municipalities に見つかりません`);
    }
    console.log(`\n========== ${parent.rows[0].municipality} (code6=${city.parentCode6}) / ${city.wardJis.length}区 ==========`);

    // quarterごとに 取得 → raw一括置換 → quarterly集計
    const perQuarter = [];
    for (const q of QUARTERS) {
      perQuarter.push(await processQuarter(client, city, q));
    }

    // 全quarter完了後、annual集計 (raw年間全件から再計算)
    let annualRows = 0;
    if (RUN_ANNUAL) {
      const annual = await client.query(AGGREGATE_ANNUAL_SQL, [city.parentCode6, YEAR]);
      annualRows = annual.rowCount;
      console.log(`\nannual集計 UPSERT: ${annualRows}`);
    }

    // ---- 市ごとの確認SELECT ------------------------------------------------
    console.log(`\n=== ${city.name} 処理サマリ (quarter別) ===`);
    console.table(perQuarter);

    console.log(`=== raw: ${city.name}${city.parentCode6} / ${YEAR} quarter別件数 ===`);
    console.table((await client.query(
      `SELECT transaction_quarter AS quarter, COUNT(*)::int AS c
         FROM real_estate_transactions_raw
        WHERE municipality_code_6=$1 AND transaction_year=$2
        GROUP BY transaction_quarter ORDER BY transaction_quarter`,
      [city.parentCode6, YEAR],
    )).rows);
    const rawTotal = await client.query(
      `SELECT COUNT(*)::int AS c FROM real_estate_transactions_raw
        WHERE municipality_code_6=$1 AND transaction_year=$2`,
      [city.parentCode6, YEAR],
    );
    console.log(`${city.name} raw総件数 (${YEAR}):`, rawTotal.rows[0].c);

    console.log(`=== raw: property_type別 / price_category別 (${city.name} ${YEAR}) ===`);
    console.table((await client.query(
      `SELECT property_type, COUNT(*)::int AS c FROM real_estate_transactions_raw
        WHERE municipality_code_6=$1 AND transaction_year=$2
        GROUP BY property_type ORDER BY property_type`,
      [city.parentCode6, YEAR],
    )).rows);
    console.table((await client.query(
      `SELECT price_category, COUNT(*)::int AS c FROM real_estate_transactions_raw
        WHERE municipality_code_6=$1 AND transaction_year=$2
        GROUP BY price_category ORDER BY price_category`,
      [city.parentCode6, YEAR],
    )).rows);

    console.log(`=== quarterly集計行数 (${city.name} ${YEAR}) ===`);
    console.log((await client.query(
      `SELECT COUNT(*)::int AS c FROM real_estate_market_stats
        WHERE municipality_code_6=$1 AND year=$2`,
      [city.parentCode6, YEAR],
    )).rows[0].c, "行");

    console.log(`=== annual集計 (${city.name} ${YEAR}) — transaction集計サンプル ===`);
    console.table((await client.query(
      `SELECT property_type, transaction_count, median_price, avg_price,
              median_price_per_sqm, median_price_per_tsubo, median_area_sqm, is_low_sample
         FROM real_estate_market_stats_annual
        WHERE municipality_code_6=$1 AND year=$2 AND price_category='transaction'
        ORDER BY transaction_count DESC`,
      [city.parentCode6, YEAR],
    )).rows);
  }

  const annualTotal = await client.query(`SELECT COUNT(*)::int AS c FROM real_estate_market_stats_annual`);
  console.log("\nannual総件数 (全体):", annualTotal.rows[0].c);
} catch (err) {
  try { await client.query("ROLLBACK"); } catch {}
  console.error("ERROR:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
