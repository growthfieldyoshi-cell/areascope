/**
 * 2022年・2023年の駅乗降者数データを station_passengers に追加するスクリプト
 *
 * データソース：国土数値情報 S12 GeoJSON（CC BY 4.0）
 *   - S12-23: 2022年データ（S12_053）
 *   - S12-24: 2023年データ（S12_057）
 *
 * Usage:
 *   node scripts/import-passengers-2022-2023.mjs --dry-run
 *   node scripts/import-passengers-2022-2023.mjs
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { readFileSync } from "fs";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
const dryRun = process.argv.includes("--dry-run");

const GEOJSON_2022 = "/Users/yoshihikomasuda/projects/data/S12-23_GML/UTF-8/S12-23_NumberOfPassengers.geojson";
const GEOJSON_2023 = "/Users/yoshihikomasuda/projects/data/S12-24_GML/UTF-8/S12-24_NumberOfPassengers.geojson";

const BATCH_SIZE = 100;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

function loadGeoJSON(path) {
  const raw = readFileSync(path, "utf8");
  return JSON.parse(raw).features;
}

function normalizePassengers(raw) {
  if (raw === null || raw === undefined) return { value: null, isNull: true, invalid: false };
  if (raw === "") return { value: null, isNull: true, invalid: false };
  const num = Number(raw);
  if (Number.isNaN(num)) return { value: null, isNull: false, invalid: true, raw: String(raw) };
  return { value: num, isNull: false, invalid: false };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── stations 全件Map ─────────────────────────────────────
// key: "station_name||line_name||operator_name"
// value: station_key (単一一致) | "MULTIPLE" (複数一致)
async function buildStationMap() {
  console.log("stations テーブルを全件取得中...");
  const rows = await sql`
    SELECT station_key, station_name, line_name, operator_name
    FROM stations
  `;
  console.log(`stations: ${rows.length}件`);

  const map = new Map();
  for (const r of rows) {
    const k = `${r.station_name}||${r.line_name}||${r.operator_name}`;
    if (map.has(k)) {
      map.set(k, "MULTIPLE");
    } else {
      map.set(k, r.station_key);
    }
  }
  return map;
}

// ── バッチINSERT（リトライ付き） ─────────────────────────
async function batchInsert(rows) {
  if (rows.length === 0) return 0;

  const keys = rows.map((r) => r.stationKey);
  const years = rows.map((r) => r.year);
  const passengers = rows.map((r) => r.passengers);
  const sources = rows.map((r) => r.source);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await sql`
        INSERT INTO station_passengers (station_key, year, passengers, source)
        SELECT * FROM unnest(
          ${keys}::text[],
          ${years}::smallint[],
          ${passengers}::int[],
          ${sources}::text[]
        )
        ON CONFLICT (station_key, year) DO NOTHING
        RETURNING 1
      `;
      return res.length;
    } catch (err) {
      console.error(`  batch INSERT 失敗 (attempt ${attempt}/${MAX_RETRIES}): ${err.message}`);
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS);
      } else {
        throw err;
      }
    }
  }
  return 0;
}

// ── メイン処理 ────────────────────────────────────────────
async function processFile(features, year, propKey, sourceLabel, stationMap) {
  const stats = {
    total: features.length,
    inserted: 0,
    skipped_no_match: 0,
    skipped_multiple: 0,
    skipped_invalid: 0,
    null_count: 0,
  };
  const failures = [];
  const batch = [];

  for (const feat of features) {
    const p = feat.properties;
    const stationName = p.S12_001;
    const operatorName = p.S12_002;
    const lineName = p.S12_003;

    const mapKey = `${stationName}||${lineName}||${operatorName}`;
    const mapVal = stationMap.get(mapKey);

    if (mapVal === undefined) {
      stats.skipped_no_match++;
      failures.push({ year, station: stationName, line: lineName, operator: operatorName, reason: "no_match" });
      continue;
    }

    if (mapVal === "MULTIPLE") {
      stats.skipped_multiple++;
      failures.push({ year, station: stationName, line: lineName, operator: operatorName, reason: "multiple_match" });
      continue;
    }

    const norm = normalizePassengers(p[propKey]);

    if (norm.invalid) {
      stats.skipped_invalid++;
      failures.push({ year, station: stationName, line: lineName, operator: operatorName, reason: `invalid_value(${norm.raw})` });
      continue;
    }

    if (norm.isNull) stats.null_count++;

    if (!dryRun) {
      batch.push({ stationKey: mapVal, year, passengers: norm.value, source: sourceLabel });

      if (batch.length >= BATCH_SIZE) {
        const count = await batchInsert(batch);
        stats.inserted += count;
        batch.length = 0;
      }
    } else {
      stats.inserted++;
    }
  }

  // 残りをフラッシュ
  if (!dryRun && batch.length > 0) {
    const count = await batchInsert(batch);
    stats.inserted += count;
    batch.length = 0;
  }

  return { stats, failures };
}

async function main() {
  console.log(dryRun ? "=== DRY RUN ===" : "=== 本番実行 ===");
  console.log("");

  const stationMap = await buildStationMap();
  console.log(`stationMap: ${stationMap.size}エントリ`);
  console.log("");

  // --- 2022年 ---
  console.log("--- 2022年データ (S12-23, S12_053) ---");
  const features2022 = loadGeoJSON(GEOJSON_2022);
  console.log(`GeoJSON features: ${features2022.length}`);
  const r2022 = await processFile(features2022, 2022, "S12_053", "S12_2022", stationMap);

  // --- 2023年 ---
  console.log("");
  console.log("--- 2023年データ (S12-24, S12_057) ---");
  const features2023 = loadGeoJSON(GEOJSON_2023);
  console.log(`GeoJSON features: ${features2023.length}`);
  const r2023 = await processFile(features2023, 2023, "S12_057", "S12_2023", stationMap);

  // --- 年ごとの集計ログ ---
  console.log("");
  console.log("========== 集計 ==========");
  for (const [label, r] of [["2022", r2022], ["2023", r2023]]) {
    const s = r.stats;
    console.log(`${label}:`);
    console.log(`  total: ${s.total}`);
    console.log(`  inserted: ${s.inserted}`);
    console.log(`  skipped_no_match: ${s.skipped_no_match}`);
    console.log(`  skipped_multiple: ${s.skipped_multiple}`);
    console.log(`  skipped_invalid: ${s.skipped_invalid}`);
    console.log(`  null_count: ${s.null_count}`);
  }

  // --- マッチ失敗ログ（ユニーク化） ---
  const allFailures = [...r2022.failures, ...r2023.failures];
  const uniqueFailures = new Map();
  for (const f of allFailures) {
    const key = `${f.year}||${f.station}||${f.line}||${f.operator}||${f.reason}`;
    if (!uniqueFailures.has(key)) uniqueFailures.set(key, f);
  }
  if (uniqueFailures.size > 0) {
    console.log("");
    console.log(`--- マッチ失敗・スキップ詳細（ユニーク ${uniqueFailures.size}件） ---`);
    for (const f of uniqueFailures.values()) {
      console.log(`  [${f.year}] [${f.reason}] ${f.station} / ${f.line} / ${f.operator}`);
    }
  }

  // --- 年度別件数確認 ---
  if (!dryRun) {
    console.log("");
    console.log("--- DB 年度別件数 ---");
    const counts = await sql`
      SELECT year, COUNT(*) as cnt
      FROM station_passengers
      GROUP BY year
      ORDER BY year
    `;
    for (const r of counts) {
      console.log(`  ${r.year}年: ${r.cnt}件`);
    }
  }

  console.log("");
  console.log("完了");
}

main().catch((err) => {
  console.error("致命的エラー:", err);
  process.exit(1);
});
