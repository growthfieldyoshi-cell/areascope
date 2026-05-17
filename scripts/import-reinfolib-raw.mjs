/**
 * 不動産情報ライブラリ API (XIT001) raw投入テスト用スクリプト。
 *
 * 固定条件 (茅ヶ崎市 / 2024年Q1) の1リクエストのみ。
 * real_estate_transactions_raw への DELETE→INSERT (バッチ置換) を行う。
 *
 * 実行: node --env-file=.env.local scripts/import-reinfolib-raw.mjs
 *
 * 注意:
 *  - 全国取得・ループ取得・他市区町村/他年度/他quarterの取得は行わない。
 *  - real_estate_market_stats には一切書き込まない。
 *  - APIキー / DATABASE_URL は process.env からのみ読み込み、ログ出力しない。
 */

import pg from "pg";

// ---- 固定条件 --------------------------------------------------------------
const CITY = "14207"; // 茅ヶ崎市 5桁JISコード
const YEAR = 2024;
const QUARTER = 1;

// ---- 正規化マッピング ------------------------------------------------------
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

// ---- 環境変数 --------------------------------------------------------------
const API_KEY = process.env.REINFOLIB_API_KEY;
const DB_URL = process.env.DATABASE_URL;
if (!API_KEY || !DB_URL) {
  console.error("REINFOLIB_API_KEY / DATABASE_URL が未設定です。`node --env-file=.env.local` で実行してください。");
  process.exit(1);
}

const client = new pg.Client({ connectionString: DB_URL });

try {
  await client.connect();

  // ---- 1. jis_code=14207 に対応する6桁 municipalities.code を実DBから取得 ----
  const muniRes = await client.query(
    `SELECT code, municipality, prefecture FROM municipalities WHERE jis_code = $1`,
    [CITY],
  );
  if (muniRes.rowCount !== 1) {
    throw new Error(`municipalities に jis_code=${CITY} が ${muniRes.rowCount} 件 (1件であるべき)`);
  }
  const municipalityCode6 = muniRes.rows[0].code;
  console.log("=== municipality_code_6 確認 ===");
  console.log("jis_code           :", CITY);
  console.log("municipality_code_6:", municipalityCode6);
  console.log("municipality名     :", muniRes.rows[0].prefecture, muniRes.rows[0].municipality);
  console.log();

  // ---- 2. XIT001 を1リクエストだけ取得 -------------------------------------
  const params = new URLSearchParams({ year: String(YEAR), quarter: String(QUARTER), city: CITY });
  const url = `https://www.reinfolib.mlit.go.jp/ex-api/external/XIT001?${params}`;
  console.log("=== API取得 ===");
  console.log("条件:", { city: CITY, year: YEAR, quarter: QUARTER });
  const res = await fetch(url, { headers: { "Ocp-Apim-Subscription-Key": API_KEY } });
  console.log("HTTP status:", res.status, res.statusText);
  const body = await res.json();
  if (body.status !== "OK" || !Array.isArray(body.data)) {
    throw new Error(`API応答が不正: status=${body.status}`);
  }
  const records = body.data;
  console.log("data件数   :", records.length);
  console.log();

  // ---- 3. 正規化 (未知の値は即エラーで検知) --------------------------------
  const rows = records.map((r, i) => {
    const propertyType = PROPERTY_TYPE_MAP[r.Type];
    const priceCategory = PRICE_CATEGORY_MAP[r.PriceCategory];
    if (!propertyType) throw new Error(`未知の Type[${i}]: ${JSON.stringify(r.Type)}`);
    if (!priceCategory) throw new Error(`未知の PriceCategory[${i}]: ${JSON.stringify(r.PriceCategory)}`);
    return { record: r, propertyType, priceCategory };
  });
  const priceCategories = [...new Set(rows.map((x) => x.priceCategory))];

  // ---- 4. DELETE→INSERT をトランザクションで実行 ---------------------------
  await client.query("BEGIN");

  // バッチ置換: city × year × quarter × price_category 単位で既存rawを削除
  let deleteCount = 0;
  for (const pc of priceCategories) {
    const del = await client.query(
      `DELETE FROM real_estate_transactions_raw
        WHERE municipality_code_6 = $1 AND transaction_year = $2
          AND transaction_quarter = $3 AND price_category = $4`,
      [municipalityCode6, YEAR, QUARTER, pc],
    );
    deleteCount += del.rowCount;
  }

  const insertSql = `
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

  let insertCount = 0;
  for (const { record: r, propertyType, priceCategory } of rows) {
    await client.query(insertSql, [
      municipalityCode6, propertyType, priceCategory,
      YEAR, QUARTER,
      r.Type, r.PriceCategory, r.Region, r.Prefecture, r.Municipality,
      r.DistrictName, r.DistrictCode, r.TradePrice, r.PricePerUnit, r.UnitPrice,
      r.Area, r.LandShape, r.Frontage, r.TotalFloorArea, r.BuildingYear,
      r.Structure, r.FloorPlan, r.Use, r.Purpose, r.Direction,
      r.Classification, r.Breadth, r.CityPlanning, r.CoverageRatio, r.FloorAreaRatio,
      r.Period, r.Renovation, r.Remarks, JSON.stringify(r), "mlit_reinfolib",
    ]);
    insertCount++;
  }

  await client.query("COMMIT");

  console.log("=== DB投入結果 ===");
  console.log("DELETE件数:", deleteCount);
  console.log("INSERT件数:", insertCount);
  console.log();

  // ---- 5. 投入後の確認SELECT ----------------------------------------------
  const total = await client.query(`SELECT COUNT(*)::int AS c FROM real_estate_transactions_raw`);
  console.log("raw総件数 :", total.rows[0].c);
  console.log();

  console.log("=== property_type別件数 ===");
  const byType = await client.query(
    `SELECT property_type, COUNT(*)::int AS c FROM real_estate_transactions_raw
      GROUP BY property_type ORDER BY property_type`,
  );
  console.table(byType.rows);

  console.log("=== price_category別件数 ===");
  const byCat = await client.query(
    `SELECT price_category, COUNT(*)::int AS c FROM real_estate_transactions_raw
      GROUP BY price_category ORDER BY price_category`,
  );
  console.table(byCat.rows);

  console.log("=== municipality_code_6 / jis_code / year / quarter 確認 ===");
  const keys = await client.query(
    `SELECT municipality_code_6, jis_code, transaction_year, transaction_quarter, COUNT(*)::int AS c
       FROM real_estate_transactions_raw
      GROUP BY municipality_code_6, jis_code, transaction_year, transaction_quarter`,
  );
  console.table(keys.rows);
} catch (err) {
  try { await client.query("ROLLBACK"); } catch {}
  console.error("ERROR:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
