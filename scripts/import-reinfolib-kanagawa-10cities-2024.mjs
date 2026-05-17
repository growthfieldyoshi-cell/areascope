/**
 * 不動産情報ライブラリ API (XIT001) — 神奈川県 新規10市 / 2024年 全四半期 の取得・集計スクリプト。
 *
 * 対象: 横須賀・逗子・三浦・秦野・大和・伊勢原・海老名・座間・南足柄・綾瀬 の10市 × 2024 Q1〜Q4。
 * 既存投入済み6市・政令市区は対象外。全国取得・他年度取得は行わない。
 * 処理: 市×四半期ごとに API取得 -> raw バッチ置換 -> quarterly集計 UPSERT。
 *       全市完了後に annual (2024年通年) 集計を UPSERT。
 *
 * 実行: node --env-file=.env.local scripts/import-reinfolib-kanagawa-10cities-2024.mjs
 *
 * 注意:
 *  - 既存テーブル (municipalities / stations) は変更しない。書き込みは real_estate_* のみ。
 *  - APIキー / DATABASE_URL は process.env からのみ読み込み、ログ出力しない。
 */

import pg from "pg";

// ---- 固定条件 --------------------------------------------------------------
const YEAR = 2024;
const QUARTERS = [1, 2, 3, 4];
// 神奈川県 新規10市の5桁JISコード (6桁は実DBから取得)
const TARGET_JIS = [
  "14201", "14208", "14210", "14211", "14213",
  "14214", "14215", "14216", "14217", "14218",
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

// quarterly集計 UPSERT (1市×1四半期: municipality_code_6 / year / quarter)
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

// annual集計 UPSERT (2024年通年: quarterで絞らず raw年間全件から中央値再計算)
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
  transaction_count = EXCLUDED.transaction_count,
  median_price = EXCLUDED.median_price, avg_price = EXCLUDED.avg_price,
  median_price_per_sqm = EXCLUDED.median_price_per_sqm, avg_price_per_sqm = EXCLUDED.avg_price_per_sqm,
  median_price_per_tsubo = EXCLUDED.median_price_per_tsubo, avg_price_per_tsubo = EXCLUDED.avg_price_per_tsubo,
  median_area_sqm = EXCLUDED.median_area_sqm, avg_area_sqm = EXCLUDED.avg_area_sqm,
  is_low_sample = EXCLUDED.is_low_sample, updated_at = now()
RETURNING 1
`;

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

// 1市×1四半期: API取得 -> raw置換 -> quarterly集計 (1トランザクション)
async function processCityQuarter(client, code6, name, jis, quarter) {
  const params = new URLSearchParams({ year: String(YEAR), quarter: String(quarter), city: jis });
  const res = await fetch(`https://www.reinfolib.mlit.go.jp/ex-api/external/XIT001?${params}`, {
    headers: { "Ocp-Apim-Subscription-Key": API_KEY },
  });
  const body = await res.json();
  if (body.status !== "OK" || !Array.isArray(body.data)) {
    throw new Error(`API応答が不正 (${name} Q${quarter}): status=${body.status}`);
  }
  const records = body.data;

  const rows = records.map((r, i) => {
    const propertyType = PROPERTY_TYPE_MAP[r.Type];
    const priceCategory = PRICE_CATEGORY_MAP[r.PriceCategory];
    if (!propertyType) throw new Error(`未知の Type (${name} Q${quarter}[${i}]): ${JSON.stringify(r.Type)}`);
    if (!priceCategory) throw new Error(`未知の PriceCategory (${name} Q${quarter}[${i}]): ${JSON.stringify(r.PriceCategory)}`);
    return { record: r, propertyType, priceCategory };
  });
  const priceCategories = [...new Set(rows.map((x) => x.priceCategory))];

  await client.query("BEGIN");

  let deleteCount = 0;
  for (const pc of priceCategories) {
    const del = await client.query(
      `DELETE FROM real_estate_transactions_raw
        WHERE municipality_code_6 = $1 AND transaction_year = $2
          AND transaction_quarter = $3 AND price_category = $4`,
      [code6, YEAR, quarter, pc],
    );
    deleteCount += del.rowCount;
  }

  let insertCount = 0;
  for (const { record: r, propertyType, priceCategory } of rows) {
    await client.query(INSERT_RAW_SQL, [
      code6, propertyType, priceCategory, YEAR, quarter,
      r.Type, r.PriceCategory, r.Region, r.Prefecture, r.Municipality,
      r.DistrictName, r.DistrictCode, r.TradePrice, r.PricePerUnit, r.UnitPrice,
      r.Area, r.LandShape, r.Frontage, r.TotalFloorArea, r.BuildingYear,
      r.Structure, r.FloorPlan, r.Use, r.Purpose, r.Direction,
      r.Classification, r.Breadth, r.CityPlanning, r.CoverageRatio, r.FloorAreaRatio,
      r.Period, r.Renovation, r.Remarks, JSON.stringify(r), "mlit_reinfolib",
    ]);
    insertCount++;
  }

  const agg = await client.query(AGGREGATE_QUARTERLY_SQL, [code6, YEAR, quarter]);
  await client.query("COMMIT");

  return { apiCount: records.length, deleteCount, insertCount, quarterlyRows: agg.rowCount };
}

const client = new pg.Client({ connectionString: DB_URL });
let apiRequests = 0;

try {
  await client.connect();

  // jis_code -> 6桁 code を実DBから確認
  const cities = [];
  for (const jis of TARGET_JIS) {
    const m = await client.query(
      `SELECT code, municipality FROM municipalities WHERE jis_code = $1`,
      [jis],
    );
    if (m.rowCount !== 1) throw new Error(`municipalities に jis_code=${jis} が ${m.rowCount} 件`);
    cities.push({ jis, code6: m.rows[0].code, name: m.rows[0].municipality });
  }

  // 市×四半期ごとに raw投入 + quarterly集計
  const perCity = {};
  for (const c of cities) {
    perCity[c.name] = { jis: c.jis, code6: c.code6, q: {}, delete: 0, insert: 0, quarterly: 0 };
    for (const q of QUARTERS) {
      const r = await processCityQuarter(client, c.code6, c.name, c.jis, q);
      apiRequests++;
      perCity[c.name].q[q] = r.apiCount;
      perCity[c.name].delete += r.deleteCount;
      perCity[c.name].insert += r.insertCount;
      perCity[c.name].quarterly += r.quarterlyRows;
      console.log(`[OK] ${c.name} Q${q} api=${r.apiCount} del=${r.deleteCount} ins=${r.insertCount} q-stats=${r.quarterlyRows}`);
    }
  }

  // 全市の annual (2024年通年) 集計
  const code6List = cities.map((c) => c.code6);
  const annual = await client.query(AGGREGATE_ANNUAL_SQL, [code6List, YEAR]);
  console.log(`[OK] annual集計 UPSERT=${annual.rowCount}`);

  // 集計 annual行数を市別に取得
  const annualByCity = await client.query(
    `SELECT m.municipality, COUNT(*)::int AS c
       FROM real_estate_market_stats_annual a JOIN municipalities m ON m.code = a.municipality_code_6
      WHERE a.municipality_code_6 = ANY($1) AND a.year = $2
      GROUP BY m.municipality ORDER BY m.municipality`,
    [code6List, YEAR],
  );
  const annualMap = Object.fromEntries(annualByCity.rows.map((r) => [r.municipality, r.c]));

  console.log("\n=== API取得件数 (自治体 × 四半期) ===");
  console.table(Object.entries(perCity).map(([name, v]) => ({
    name, jis: v.jis, code6: v.code6,
    Q1: v.q[1], Q2: v.q[2], Q3: v.q[3], Q4: v.q[4],
    合計: v.q[1] + v.q[2] + v.q[3] + v.q[4],
  })));

  console.log("=== raw投入 / quarterly / annual (自治体別) ===");
  console.table(Object.entries(perCity).map(([name, v]) => ({
    name, DELETE: v.delete, INSERT: v.insert,
    quarterlyRows: v.quarterly, annualRows: annualMap[name] ?? 0,
  })));

  const rawTotal = await client.query(`SELECT COUNT(*)::int AS c FROM real_estate_transactions_raw`);
  const qTotal = await client.query(`SELECT COUNT(*)::int AS c FROM real_estate_market_stats`);
  const aTotal = await client.query(`SELECT COUNT(*)::int AS c FROM real_estate_market_stats_annual`);
  const rawAdded = Object.values(perCity).reduce((s, v) => s + v.insert, 0);
  console.log("APIリクエスト数  :", apiRequests);
  console.log("raw追加件数      :", rawAdded);
  console.log("raw総件数        :", rawTotal.rows[0].c);
  console.log("quarterly総件数  :", qTotal.rows[0].c);
  console.log("annual総件数     :", aTotal.rows[0].c);
  console.log();

  console.log("=== raw: property_type別 (今回10市/2024) ===");
  console.table((await client.query(
    `SELECT property_type, COUNT(*)::int AS c FROM real_estate_transactions_raw
      WHERE municipality_code_6 = ANY($1) AND transaction_year = $2
      GROUP BY property_type ORDER BY property_type`,
    [code6List, YEAR],
  )).rows);

  console.log("=== raw: price_category別 (今回10市/2024) ===");
  console.table((await client.query(
    `SELECT price_category, COUNT(*)::int AS c FROM real_estate_transactions_raw
      WHERE municipality_code_6 = ANY($1) AND transaction_year = $2
      GROUP BY price_category ORDER BY price_category`,
    [code6List, YEAR],
  )).rows);

  console.log("=== annual: is_low_sample 件数 (今回10市) ===");
  console.table((await client.query(
    `SELECT is_low_sample, COUNT(*)::int AS c FROM real_estate_market_stats_annual
      WHERE municipality_code_6 = ANY($1) AND year = $2
      GROUP BY is_low_sample ORDER BY is_low_sample`,
    [code6List, YEAR],
  )).rows);

  console.log("=== 異常値チェック: annual median_price < 100万 または > 100億 (transaction) ===");
  const anomaly = await client.query(
    `SELECT m.municipality, a.property_type, a.transaction_count, a.median_price
       FROM real_estate_market_stats_annual a JOIN municipalities m ON m.code = a.municipality_code_6
      WHERE a.municipality_code_6 = ANY($1) AND a.year = $2 AND a.price_category = 'transaction'
        AND (a.median_price < 1000000 OR a.median_price > 10000000000)
      ORDER BY m.municipality, a.property_type`,
    [code6List, YEAR],
  );
  console.log(anomaly.rowCount ? "" : "(該当なし)");
  if (anomaly.rowCount) console.table(anomaly.rows);

  console.log("=== 市区町村ページ表示対象 (annual transaction で表示3種を持つ市) ===");
  const displayable = await client.query(
    `SELECT COUNT(DISTINCT municipality_code_6)::int AS c
       FROM real_estate_market_stats_annual
      WHERE year = $1 AND price_category = 'transaction'
        AND property_type IN ('land','land_and_building','used_condominium')
        AND median_price IS NOT NULL`,
    [YEAR],
  );
  console.log("表示対象 市区町村数 (annual全体):", displayable.rows[0].c);
} catch (err) {
  try { await client.query("ROLLBACK"); } catch {}
  console.error("ERROR:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
