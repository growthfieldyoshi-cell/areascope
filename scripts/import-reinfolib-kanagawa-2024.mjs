/**
 * 不動産情報ライブラリ API (XIT001) — 神奈川県6市 / 2024年 全四半期 の取得・集計スクリプト。
 *
 * 対象: 茅ヶ崎・平塚・鎌倉・藤沢・小田原・厚木 の6市 × 2024年 Q1〜Q4。
 * 政令市区は対象外。全国取得・他年度取得は行わない。
 * 処理: 市×四半期ごとに API取得 -> raw バッチ置換 (DELETE->INSERT) -> market_stats 集計 UPSERT。
 *
 * 実行: node --env-file=.env.local scripts/import-reinfolib-kanagawa-2024.mjs
 *
 * 注意:
 *  - 既存テーブル (municipalities / stations) は変更しない。書き込みは real_estate_* のみ。
 *  - APIキー / DATABASE_URL は process.env からのみ読み込み、ログ出力しない。
 */

import pg from "pg";

// ---- 固定条件 --------------------------------------------------------------
const YEAR = 2024;
const QUARTERS = [1, 2, 3, 4];
// 神奈川県6市の5桁JISコード (6桁 municipality_code_6 は実DBから取得)
const TARGET_JIS = ["14207", "14203", "14204", "14205", "14206", "14212"];

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

// 集計 UPSERT (1市×1四半期分: municipality_code_6 / year / quarter で raw を集計)
const AGGREGATE_SQL = `
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

// 1市×1四半期を取得して raw置換+集計する
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

  const agg = await client.query(AGGREGATE_SQL, [code6, YEAR, quarter]);
  await client.query("COMMIT");

  return { apiCount: records.length, deleteCount, insertCount, statsRows: agg.rowCount };
}

const client = new pg.Client({ connectionString: DB_URL });
let apiRequests = 0;

try {
  await client.connect();

  // jis_code -> 6桁 code を実DBから一括確認
  const cities = [];
  for (const jis of TARGET_JIS) {
    const m = await client.query(
      `SELECT code, municipality FROM municipalities WHERE jis_code = $1`,
      [jis],
    );
    if (m.rowCount !== 1) throw new Error(`municipalities に jis_code=${jis} が ${m.rowCount} 件`);
    cities.push({ jis, code6: m.rows[0].code, name: m.rows[0].municipality });
  }

  // 市×四半期ごとに処理
  const perCity = {};
  for (const c of cities) {
    perCity[c.name] = { jis: c.jis, code6: c.code6, q: {}, delete: 0, insert: 0, stats: 0 };
    for (const q of QUARTERS) {
      const r = await processCityQuarter(client, c.code6, c.name, c.jis, q);
      apiRequests++;
      perCity[c.name].q[q] = r.apiCount;
      perCity[c.name].delete += r.deleteCount;
      perCity[c.name].insert += r.insertCount;
      perCity[c.name].stats += r.statsRows;
      console.log(`[OK] ${c.name} Q${q} api=${r.apiCount} del=${r.deleteCount} ins=${r.insertCount} stats=${r.statsRows}`);
    }
  }

  // ---- 集計結果サマリ -------------------------------------------------------
  const code6List = cities.map((c) => c.code6);

  console.log("\n=== API取得件数 (自治体 × 四半期) ===");
  console.table(
    Object.entries(perCity).map(([name, v]) => ({
      name, jis: v.jis, code6: v.code6,
      Q1: v.q[1], Q2: v.q[2], Q3: v.q[3], Q4: v.q[4],
      合計: v.q[1] + v.q[2] + v.q[3] + v.q[4],
    })),
  );

  console.log("=== raw投入 / market_stats集計 (自治体別) ===");
  console.table(
    Object.entries(perCity).map(([name, v]) => ({
      name, DELETE: v.delete, INSERT: v.insert, statsRows: v.stats,
    })),
  );

  const rawTotal = await client.query(`SELECT COUNT(*)::int AS c FROM real_estate_transactions_raw`);
  const statsTotal = await client.query(`SELECT COUNT(*)::int AS c FROM real_estate_market_stats`);
  console.log("APIリクエスト数  :", apiRequests);
  console.log("raw総件数        :", rawTotal.rows[0].c);
  console.log("market_stats総件数:", statsTotal.rows[0].c);
  console.log();

  console.log("=== raw: property_type別件数 (対象6市/2024) ===");
  console.table((await client.query(
    `SELECT property_type, COUNT(*)::int AS c FROM real_estate_transactions_raw
      WHERE municipality_code_6 = ANY($1) AND transaction_year = $2
      GROUP BY property_type ORDER BY property_type`,
    [code6List, YEAR],
  )).rows);

  console.log("=== raw: price_category別件数 (対象6市/2024) ===");
  console.table((await client.query(
    `SELECT price_category, COUNT(*)::int AS c FROM real_estate_transactions_raw
      WHERE municipality_code_6 = ANY($1) AND transaction_year = $2
      GROUP BY price_category ORDER BY price_category`,
    [code6List, YEAR],
  )).rows);

  console.log("=== market_stats: is_low_sample 件数 ===");
  console.table((await client.query(
    `SELECT is_low_sample, COUNT(*)::int AS c FROM real_estate_market_stats
      WHERE municipality_code_6 = ANY($1) AND year = $2
      GROUP BY is_low_sample ORDER BY is_low_sample`,
    [code6List, YEAR],
  )).rows);

  console.log("=== 異常値チェック: median_price < 100万 または > 100億 (transaction) ===");
  const anomaly = await client.query(
    `SELECT m.municipality, s.property_type, s.quarter, s.transaction_count, s.median_price
       FROM real_estate_market_stats s
       JOIN municipalities m ON m.code = s.municipality_code_6
      WHERE s.municipality_code_6 = ANY($1) AND s.year = $2 AND s.price_category = 'transaction'
        AND (s.median_price < 1000000 OR s.median_price > 10000000000)
      ORDER BY m.municipality, s.quarter, s.property_type`,
    [code6List, YEAR],
  );
  console.log(anomaly.rowCount ? "" : "(該当なし)");
  if (anomaly.rowCount) console.table(anomaly.rows);
} catch (err) {
  try { await client.query("ROLLBACK"); } catch {}
  console.error("ERROR:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
