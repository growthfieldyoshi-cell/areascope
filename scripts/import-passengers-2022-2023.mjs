/**
 * 2022年・2023年の駅乗降者数データを station_passengers に再取り込みするスクリプト
 *
 * データソース：国土数値情報 S12-24 GeoJSON（CC BY 4.0）
 *   - S12-24 (2024年公開版) には 2022年・2023年の両方のデータが格納されている
 *     - 2022年: S12_050 (重複コード), S12_052 (備考), S12_053 (乗降客数)
 *     - 2023年: S12_054 (重複コード), S12_056 (備考), S12_057 (乗降客数)
 *
 * 重複コードの仕様:
 *   - 1 = 代表行: その (駅, 路線, 運営会社) の値を記載
 *   - 2 = 重複行: 常に 0（代表行の値を重複カウントしないため）
 *
 * 取り込みロジック:
 *   - 同一 (S12_001, S12_003, S12_002) の triple ごとに集約
 *   - 代表行（重複コード=1）の値と備考を採用
 *   - 代表行が見つからない場合は MAX(passengers) にフォールバック
 *   - ON CONFLICT (station_key, year) DO UPDATE で既存行を上書き（再取り込み対応）
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

const GEOJSON_S12_24 = "/Users/masudayoshihiko/Downloads/S12-24_GML/UTF-8/S12-24_NumberOfPassengers.geojson";

const BATCH_SIZE = 100;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// S12 フィールド定義（年ごと）
const YEAR_FIELDS = [
  { year: 2022, statusKey: "S12_050", noteKey: "S12_052", passengersKey: "S12_053", sourceLabel: "S12_2022" },
  { year: 2023, statusKey: "S12_054", noteKey: "S12_056", passengersKey: "S12_057", sourceLabel: "S12_2023" },
];

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

function normalizeNote(raw) {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim();
  if (s === "" || s === "-") return null;
  return s;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── stations 全件Map ─────────────────────────────────────
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

// ── バッチUPSERT（リトライ付き） ─────────────────────────
async function batchUpsert(rows) {
  if (rows.length === 0) return 0;

  const keys = rows.map((r) => r.stationKey);
  const years = rows.map((r) => r.year);
  const passengers = rows.map((r) => r.passengers);
  const sources = rows.map((r) => r.source);
  const notes = rows.map((r) => r.note);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await sql`
        INSERT INTO station_passengers (station_key, year, passengers, source, note)
        SELECT * FROM unnest(
          ${keys}::text[],
          ${years}::smallint[],
          ${passengers}::int[],
          ${sources}::text[],
          ${notes}::text[]
        )
        ON CONFLICT (station_key, year) DO UPDATE SET
          passengers = EXCLUDED.passengers,
          source     = EXCLUDED.source,
          note       = EXCLUDED.note
        RETURNING 1
      `;
      return res.length;
    } catch (err) {
      console.error(`  batch UPSERT 失敗 (attempt ${attempt}/${MAX_RETRIES}): ${err.message}`);
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS);
      } else {
        throw err;
      }
    }
  }
  return 0;
}

// ── メイン処理: 1年分を集約 + UPSERT ─────────────────────────
async function processYear(features, year, statusKey, noteKey, passengersKey, sourceLabel, stationMap) {
  // Step 1: (stationName, lineName, operatorName) ごとに集約
  //   - 代表行 (status==1) の値と備考を優先
  //   - 代表行の value が最大のものを採用（代表が複数あるケースに備える）
  //   - 代表行が無ければ MAX(value) にフォールバック
  const agg = new Map();

  for (const feat of features) {
    const p = feat.properties;
    const stationName = p.S12_001;
    const operatorName = p.S12_002;
    const lineName = p.S12_003;
    const key = `${stationName}||${lineName}||${operatorName}`;

    const norm = normalizePassengers(p[passengersKey]);
    const status = p[statusKey];
    const note = normalizeNote(p[noteKey]);

    let entry = agg.get(key);
    if (!entry) {
      entry = {
        stationName,
        lineName,
        operatorName,
        featureCount: 0,
        invalidCount: 0,
        repFound: false,
        repValue: null,
        repNote: null,
        maxAnyValue: null,
      };
      agg.set(key, entry);
    }

    entry.featureCount++;

    if (norm.invalid) {
      entry.invalidCount++;
      continue;
    }

    // 全行から最大値を計算（フォールバック用）
    if (norm.value != null && (entry.maxAnyValue === null || norm.value > entry.maxAnyValue)) {
      entry.maxAnyValue = norm.value;
    }

    // 代表行を記録
    if (status === 1) {
      if (!entry.repFound || (norm.value != null && norm.value > (entry.repValue ?? -1))) {
        entry.repFound = true;
        entry.repValue = norm.value; // 0 も NULL も許容
        entry.repNote = note;
      }
    }
  }

  // Step 2: 集約結果を UPSERT
  const stats = {
    triple_count: agg.size,
    feature_total: features.length,
    upserted: 0,
    skipped_no_match: 0,
    skipped_multiple: 0,
    skipped_all_invalid: 0,
    used_representative: 0,
    used_max_fallback: 0,
    null_count: 0,
  };
  const failures = [];
  const batch = [];

  for (const [key, entry] of agg) {
    const mapVal = stationMap.get(key);

    if (mapVal === undefined) {
      stats.skipped_no_match++;
      failures.push({ year, station: entry.stationName, line: entry.lineName, operator: entry.operatorName, reason: "no_match" });
      continue;
    }

    if (mapVal === "MULTIPLE") {
      stats.skipped_multiple++;
      failures.push({ year, station: entry.stationName, line: entry.lineName, operator: entry.operatorName, reason: "multiple_match" });
      continue;
    }

    if (entry.invalidCount === entry.featureCount) {
      stats.skipped_all_invalid++;
      continue;
    }

    let finalValue;
    let finalNote;
    if (entry.repFound) {
      finalValue = entry.repValue;
      finalNote = entry.repNote;
      stats.used_representative++;
    } else {
      finalValue = entry.maxAnyValue;
      finalNote = null;
      stats.used_max_fallback++;
    }

    if (finalValue === null) stats.null_count++;

    if (!dryRun) {
      batch.push({ stationKey: mapVal, year, passengers: finalValue, source: sourceLabel, note: finalNote });
      if (batch.length >= BATCH_SIZE) {
        stats.upserted += await batchUpsert(batch);
        batch.length = 0;
      }
    } else {
      stats.upserted++;
    }
  }

  if (!dryRun && batch.length > 0) {
    stats.upserted += await batchUpsert(batch);
    batch.length = 0;
  }

  return { stats, failures };
}

async function main() {
  console.log(dryRun ? "=== DRY RUN ===" : "=== 本番実行 ===");
  console.log(`GeoJSON: ${GEOJSON_S12_24}`);
  console.log("");

  const stationMap = await buildStationMap();
  console.log(`stationMap: ${stationMap.size}エントリ`);
  console.log("");

  console.log("GeoJSON 読み込み中...");
  const features = loadGeoJSON(GEOJSON_S12_24);
  console.log(`features: ${features.length}件`);
  console.log("");

  const results = [];
  for (const yf of YEAR_FIELDS) {
    console.log(`--- ${yf.year}年 (status=${yf.statusKey}, note=${yf.noteKey}, passengers=${yf.passengersKey}) ---`);
    const r = await processYear(features, yf.year, yf.statusKey, yf.noteKey, yf.passengersKey, yf.sourceLabel, stationMap);
    results.push({ year: yf.year, ...r });
    console.log("");
  }

  // --- 年ごとの集計ログ ---
  console.log("========== 集計 ==========");
  for (const r of results) {
    const s = r.stats;
    console.log(`${r.year}年:`);
    console.log(`  feature_total:       ${s.feature_total}`);
    console.log(`  triple_count (集約後): ${s.triple_count}`);
    console.log(`  upserted:            ${s.upserted}`);
    console.log(`  used_representative: ${s.used_representative}`);
    console.log(`  used_max_fallback:   ${s.used_max_fallback}`);
    console.log(`  null_count:          ${s.null_count}`);
    console.log(`  skipped_no_match:    ${s.skipped_no_match}`);
    console.log(`  skipped_multiple:    ${s.skipped_multiple}`);
    console.log(`  skipped_all_invalid: ${s.skipped_all_invalid}`);
  }

  // --- マッチ失敗ログ ---
  const allFailures = results.flatMap((r) => r.failures);
  const uniqueFailures = new Map();
  for (const f of allFailures) {
    const key = `${f.station}||${f.line}||${f.operator}||${f.reason}`;
    if (!uniqueFailures.has(key)) uniqueFailures.set(key, f);
  }
  if (uniqueFailures.size > 0) {
    console.log("");
    console.log(`--- マッチ失敗・スキップ詳細（ユニーク ${uniqueFailures.size}件、最初の20件） ---`);
    let i = 0;
    for (const f of uniqueFailures.values()) {
      console.log(`  [${f.year}] [${f.reason}] ${f.station} / ${f.line} / ${f.operator}`);
      if (++i >= 20) break;
    }
  }

  // --- 年度別件数確認 ---
  if (!dryRun) {
    console.log("");
    console.log("--- DB 年度別件数・0件数 ---");
    const counts = await sql`
      SELECT year, COUNT(*) AS cnt,
             COUNT(*) FILTER (WHERE passengers = 0) AS zero_cnt,
             COUNT(*) FILTER (WHERE passengers IS NULL) AS null_cnt,
             COUNT(*) FILTER (WHERE passengers > 0) AS pos_cnt
      FROM station_passengers
      GROUP BY year
      ORDER BY year
    `;
    for (const r of counts) {
      console.log(`  ${r.year}年: total=${r.cnt}, 0=${r.zero_cnt}, null=${r.null_cnt}, >0=${r.pos_cnt}`);
    }
  }

  console.log("");
  console.log("完了");
}

main().catch((err) => {
  console.error("致命的エラー:", err);
  process.exit(1);
});
