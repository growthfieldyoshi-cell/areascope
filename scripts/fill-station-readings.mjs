/**
 * 駅名の読み仮名を一括生成するスクリプト
 *
 * Usage:
 *   node scripts/fill-station-readings.mjs                  # 本番実行
 *   node scripts/fill-station-readings.mjs --dry-run        # DB更新なし
 *   node scripts/fill-station-readings.mjs --dry-run --limit=100
 */
import { config } from 'dotenv';
import fs from 'fs';
import pg from 'pg';
import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';
import { toKatakana, toRomaji } from 'wanakana';

config({ path: '.env.local' });

// ── CLI args ──────────────────────────────────────────────
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limitArg = args.find(a => a.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : null;

const BATCH_SIZE = 500;

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

// ── 変換結果の検証 ────────────────────────────────────────
function hasKanji(text) {
  return /[\u4E00-\u9FFF々〆ヵヶ]/.test(text);
}

function hasKatakana(text) {
  return /[\u30A0-\u30FF]/.test(text);
}

function validateGeneratedReading(hiragana) {
  const reasons = [];
  if (!hiragana || hiragana.trim() === '') reasons.push('empty');
  if (hasKanji(hiragana)) reasons.push('kanji_remains');
  if (hasKatakana(hiragana)) reasons.push('katakana_remains');
  return { ok: reasons.length === 0, reasons };
}

// ── url_slug 生成 ─────────────────────────────────────────
function buildUrlSlug(hiragana) {
  const romaji = toRomaji(hiragana);
  return romaji
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ── メイン処理 ────────────────────────────────────────────
async function main() {
  // kuroshiro 初期化
  const kuroshiro = new Kuroshiro.default();
  await kuroshiro.init(new KuromojiAnalyzer());
  console.log('kuroshiro 初期化完了');

  // DB 接続
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('DB 接続完了');

  try {
    // override テーブルを読み込む (station_group_slug ベース)
    const overrides = new Map();
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'station_reading_overrides'
      ) AS exists
    `);
    if (tableCheck.rows[0].exists) {
      const ovRes = await client.query(
        `SELECT station_group_slug, station_name_hiragana, station_name_katakana, station_name_initial_kana
         FROM station_reading_overrides`
      );
      for (const row of ovRes.rows) {
        overrides.set(row.station_group_slug, row);
      }
      console.log(`override 件数: ${overrides.size}`);
    } else {
      console.log('station_reading_overrides テーブルなし → override なしで処理継続');
    }

    // 対象駅を取得
    const limitClause = limit ? `LIMIT ${limit}` : '';
    const { rows: stations } = await client.query(`
      SELECT station_group_slug, station_name, url_slug
      FROM stations
      WHERE station_name_hiragana IS NULL OR station_name_hiragana = ''
      ORDER BY station_group_slug
      ${limitClause}
    `);
    console.log(`対象駅数: ${stations.length}`);

    if (stations.length === 0) {
      console.log('更新対象なし');
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    const flagged = [];

    // バッチ処理
    for (let i = 0; i < stations.length; i += BATCH_SIZE) {
      const batch = stations.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      console.log(`\n--- batch ${batchNum} (${batch.length}件) ---`);

      if (!dryRun) {
        await client.query('BEGIN');
      }

      try {
        for (const row of batch) {
          try {
            // override 優先 (station_group_slug ベース)
            const ov = overrides.get(row.station_group_slug);
            let hiragana, katakana, initialKana;

            if (ov) {
              hiragana = ov.station_name_hiragana;
              katakana = ov.station_name_katakana || toKatakana(hiragana);
              initialKana = ov.station_name_initial_kana || getInitialKanaGroup(hiragana);
            } else {
              hiragana = await kuroshiro.convert(row.station_name, {
                to: 'hiragana',
                mode: 'normal',
              });
              katakana = toKatakana(hiragana);
              initialKana = getInitialKanaGroup(hiragana);
            }
            const urlSlug = buildUrlSlug(hiragana);

            // override 経由は検証スキップ（人手で確認済みの前提）
            if (!ov) {
              const validation = validateGeneratedReading(hiragana);
              if (!validation.ok) {
                const reason = validation.reasons.join(';');
                flagged.push({ slug: row.station_group_slug, name: row.station_name, hiragana, katakana, initialKana, reason });
                console.log(`[FLAGGED] ${row.station_name} (${row.station_group_slug}): ${reason}`);
                continue;
              }
            }

            if (dryRun) {
              console.log(
                `[DRY] ${row.station_name} → ` +
                `ひらがな: ${hiragana}, カタカナ: ${katakana}, ` +
                `頭文字: ${initialKana}, slug: ${urlSlug}` +
                `${ov ? ' (override)' : ''}` +
                `${row.url_slug ? ' (url_slug既存→スキップ)' : ''}`
              );
            } else {
              // url_slug は未設定のときだけ更新
              if (row.url_slug) {
                await client.query(
                  `UPDATE stations
                   SET station_name_hiragana = $1,
                       station_name_katakana = $2,
                       station_name_initial_kana = $3
                   WHERE station_group_slug = $4`,
                  [hiragana, katakana, initialKana, row.station_group_slug]
                );
              } else {
                await client.query(
                  `UPDATE stations
                   SET station_name_hiragana = $1,
                       station_name_katakana = $2,
                       station_name_initial_kana = $3,
                       url_slug = $4
                   WHERE station_group_slug = $5`,
                  [hiragana, katakana, initialKana, urlSlug, row.station_group_slug]
                );
              }
            }

            successCount++;
          } catch (err) {
            errorCount++;
            console.error(
              `[ERROR] station_name=${row.station_name}, ` +
              `station_group_slug=${row.station_group_slug}: ${err.message}`
            );
          }
        }

        if (!dryRun) {
          await client.query('COMMIT');
          console.log(`batch ${batchNum} COMMIT (${batch.length}件)`);
        }
      } catch (batchErr) {
        if (!dryRun) {
          await client.query('ROLLBACK');
          console.error(`batch ${batchNum} ROLLBACK: ${batchErr.message}`);
        }
      }
    }

    // flagged 駅を CSV 出力
    if (flagged.length > 0) {
      const csvPath = 'scripts/flagged-stations.csv';
      const header = 'station_group_slug,station_name,hiragana,katakana,initial_kana,reason';
      const rows = flagged.map(f =>
        [f.slug, f.name, f.hiragana, f.katakana, f.initialKana, f.reason]
          .map(v => `"${(v ?? '').replace(/"/g, '""')}"`)
          .join(',')
      );
      fs.writeFileSync(csvPath, [header, ...rows].join('\n') + '\n', 'utf-8');
      console.log(`\nflagged 駅を ${csvPath} に出力 (${flagged.length}件)`);
    }

    console.log(`\n=== 完了 ===`);
    console.log(`成功: ${successCount}件 / スキップ: ${flagged.length}件（flagged） / エラー: ${errorCount}件`);
    if (dryRun) console.log('(dry-run のため DB 更新なし)');
  } finally {
    await client.end();
    console.log('DB 切断');
  }
}

main().catch(err => {
  console.error('致命的エラー:', err);
  process.exit(1);
});
