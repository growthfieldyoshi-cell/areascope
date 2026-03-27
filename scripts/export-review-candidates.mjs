/**
 * 読み仮名レビュー候補を CSV 出力するスクリプト
 *
 * Usage:
 *   node scripts/export-review-candidates.mjs
 *   node scripts/export-review-candidates.mjs --limit=500
 */
import { config } from 'dotenv';
import fs from 'fs';
import pg from 'pg';
import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';
import { toKatakana } from 'wanakana';

config({ path: '.env.local' });

const args = process.argv.slice(2);
const limitArg = args.find(a => a.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : null;

// ── 検出ルール ────────────────────────────────────────────
function hasKanji(text) {
  return /[\u4E00-\u9FFF々〆ヵヶ]/.test(text);
}

function hasKatakana(text) {
  return /[\u30A0-\u30FF]/.test(text);
}

const SPECIAL_CHARS = /[神社ヶケヵ之ノ]/;

function detectReasons(stationName, hiragana) {
  const reasons = [];
  if (hasKanji(hiragana)) reasons.push('kanji_remains');
  if (hasKatakana(hiragana)) reasons.push('katakana_remains');
  if (SPECIAL_CHARS.test(stationName)) reasons.push('special_char');
  if (hiragana && hiragana.length >= 20) reasons.push('long_reading');
  return reasons;
}

// ── 五十音グループ判定 ────────────────────────────────────
const INITIAL_KANA_MAP = [
  { group: 'あ', chars: 'あいうえお' },
  { group: 'か', chars: 'かきくけこがぎぐげご' },
  { group: 'さ', chars: 'さしすせそざじずぜぞ' },
  { group: 'た', chars: 'たちつてとだぢづでど' },
  { group: 'な', chars: 'なにぬねの' },
  { group: 'は', chars: 'はひふへほばびぶべぼぱぴぷぺぽ' },
  { group: 'ま', chars: 'まみむめも' },
  { group: 'や', chars: 'やゆよ' },
  { group: 'ら', chars: 'らりるれろ' },
  { group: 'わ', chars: 'わをん' },
];

function getInitialKanaGroup(hiragana) {
  if (!hiragana) return 'その他';
  const first = hiragana.charAt(0);
  for (const { group, chars } of INITIAL_KANA_MAP) {
    if (chars.includes(first)) return group;
  }
  return 'その他';
}

// ── メイン処理 ────────────────────────────────────────────
async function main() {
  const kuroshiro = new Kuroshiro.default();
  await kuroshiro.init(new KuromojiAnalyzer());
  console.log('kuroshiro 初期化完了');

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('DB 接続完了');

  try {
    const limitClause = limit ? `LIMIT ${limit}` : '';
    const { rows: stations } = await client.query(`
      SELECT DISTINCT station_group_slug, station_name
      FROM stations
      WHERE station_group_slug IS NOT NULL
      ORDER BY station_group_slug
      ${limitClause}
    `);
    console.log(`対象駅数: ${stations.length}`);

    const candidates = [];
    let processed = 0;

    for (const row of stations) {
      try {
        const hiragana = await kuroshiro.convert(row.station_name, {
          to: 'hiragana',
          mode: 'normal',
        });
        const katakana = toKatakana(hiragana);
        const initialKana = getInitialKanaGroup(hiragana);
        const reasons = detectReasons(row.station_name, hiragana);

        if (reasons.length > 0) {
          candidates.push({
            slug: row.station_group_slug,
            name: row.station_name,
            hiragana,
            katakana,
            initialKana,
            reason: reasons.join(';'),
          });
        }
      } catch (err) {
        console.error(`[ERROR] ${row.station_name}: ${err.message}`);
      }

      processed++;
      if (processed % 500 === 0) console.log(`${processed}件処理...`);
    }

    // CSV 出力
    const csvPath = 'scripts/review-candidates.csv';
    const header = 'station_group_slug,station_name,generated_hiragana,generated_katakana,generated_initial_kana,reason';
    const csvRows = candidates.map(c =>
      [c.slug, c.name, c.hiragana, c.katakana, c.initialKana, c.reason]
        .map(v => `"${(v ?? '').replace(/"/g, '""')}"`)
        .join(',')
    );
    fs.writeFileSync(csvPath, [header, ...csvRows].join('\n') + '\n', 'utf-8');

    console.log(`\n=== 完了 ===`);
    console.log(`処理: ${processed}件, レビュー候補: ${candidates.length}件`);
    console.log(`出力: ${csvPath}`);
  } finally {
    await client.end();
    console.log('DB 切断');
  }
}

main().catch(err => {
  console.error('致命的エラー:', err);
  process.exit(1);
});
