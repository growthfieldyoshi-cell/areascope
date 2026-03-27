/**
 * 自治体名の読み仮名を一括生成するスクリプト
 *
 * Usage:
 *   node scripts/fill-municipality-readings.mjs                  # 本番実行
 *   node scripts/fill-municipality-readings.mjs --dry-run        # DB更新なし
 *   node scripts/fill-municipality-readings.mjs --dry-run --limit=50
 */
import { config } from 'dotenv';
import pg from 'pg';
import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';
import { toKatakana, toHiragana } from 'wanakana';

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

// ── 半角カタカナ → 全角カタカナ ──────────────────────────
function halfToFullKatakana(str) {
  const HALF_KANA = 'ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロヮワヰヱヲンヴヵヶ';
  const HALF_KANA_CHARS = 'ｧｱｨｲｩｳｪｴｫｵｶｶﾞｷｷﾞｸｸﾞｹｹﾞｺｺﾞｻｻﾞｼｼﾞｽｽﾞｾｾﾞｿｿﾞﾀﾀﾞﾁﾁﾞｯﾂﾂﾞﾃﾃﾞﾄﾄﾞﾅﾆﾇﾈﾉﾊﾊﾞﾊﾟﾋﾋﾞﾋﾟﾌﾌﾞﾌﾟﾍﾍﾞﾍﾟﾎﾎﾞﾎﾟﾏﾐﾑﾒﾓｬﾔｭﾕｮﾖﾗﾘﾙﾚﾛﾜﾜｲｴｦﾝｳﾞｶｹ';
  // wanakana の toKatakana はひらがな→カタカナ。半角→全角は別処理が必要。
  // 簡易的に String.prototype.replace で対応
  let result = str;
  // 濁点・半濁点の合成を先に処理
  result = result.replace(/[\uff66-\uff9f][\uff9e\uff9f]?/g, (match) => {
    const map = {
      'ｶﾞ':'ガ','ｷﾞ':'ギ','ｸﾞ':'グ','ｹﾞ':'ゲ','ｺﾞ':'ゴ',
      'ｻﾞ':'ザ','ｼﾞ':'ジ','ｽﾞ':'ズ','ｾﾞ':'ゼ','ｿﾞ':'ゾ',
      'ﾀﾞ':'ダ','ﾁﾞ':'ヂ','ﾂﾞ':'ヅ','ﾃﾞ':'デ','ﾄﾞ':'ド',
      'ﾊﾞ':'バ','ﾋﾞ':'ビ','ﾌﾞ':'ブ','ﾍﾞ':'ベ','ﾎﾞ':'ボ',
      'ﾊﾟ':'パ','ﾋﾟ':'ピ','ﾌﾟ':'プ','ﾍﾟ':'ペ','ﾎﾟ':'ポ',
      'ｳﾞ':'ヴ',
    };
    if (map[match]) return map[match];
    // 単独半角カタカナ
    const singleMap = {
      'ｦ':'ヲ','ｧ':'ァ','ｨ':'ィ','ｩ':'ゥ','ｪ':'ェ','ｫ':'ォ',
      'ｬ':'ャ','ｭ':'ュ','ｮ':'ョ','ｯ':'ッ','ｰ':'ー',
      'ｱ':'ア','ｲ':'イ','ｳ':'ウ','ｴ':'エ','ｵ':'オ',
      'ｶ':'カ','ｷ':'キ','ｸ':'ク','ｹ':'ケ','ｺ':'コ',
      'ｻ':'サ','ｼ':'シ','ｽ':'ス','ｾ':'セ','ｿ':'ソ',
      'ﾀ':'タ','ﾁ':'チ','ﾂ':'ツ','ﾃ':'テ','ﾄ':'ト',
      'ﾅ':'ナ','ﾆ':'ニ','ﾇ':'ヌ','ﾈ':'ネ','ﾉ':'ノ',
      'ﾊ':'ハ','ﾋ':'ヒ','ﾌ':'フ','ﾍ':'ヘ','ﾎ':'ホ',
      'ﾏ':'マ','ﾐ':'ミ','ﾑ':'ム','ﾒ':'メ','ﾓ':'モ',
      'ﾔ':'ヤ','ﾕ':'ユ','ﾖ':'ヨ',
      'ﾗ':'ラ','ﾘ':'リ','ﾙ':'ル','ﾚ':'レ','ﾛ':'ロ',
      'ﾜ':'ワ','ﾝ':'ン',
    };
    return singleMap[match.charAt(0)] ?? match;
  });
  return result;
}

// ── 全角カタカナ → ひらがな ──────────────────────────────
function katakanaToHiragana(str) {
  return str.replace(/[\u30A1-\u30F6]/g, c =>
    String.fromCharCode(c.charCodeAt(0) - 0x60)
  );
}

// ── メイン処理 ────────────────────────────────────────────
async function main() {
  // kuroshiro 初期化（フォールバック用）
  const kuroshiro = new Kuroshiro.default();
  await kuroshiro.init(new KuromojiAnalyzer());
  console.log('kuroshiro 初期化完了');

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('DB 接続完了');

  try {
    const limitClause = limit ? `LIMIT ${limit}` : '';
    const { rows: municipalities } = await client.query(`
      SELECT code, municipality, municipality_kana
      FROM municipalities
      WHERE municipality_name_hiragana IS NULL OR municipality_name_hiragana = ''
      ORDER BY code
      ${limitClause}
    `);
    console.log(`対象自治体数: ${municipalities.length}`);

    if (municipalities.length === 0) {
      console.log('更新対象なし');
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    let fallbackCount = 0;

    for (let i = 0; i < municipalities.length; i += BATCH_SIZE) {
      const batch = municipalities.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      console.log(`\n--- batch ${batchNum} (${batch.length}件) ---`);

      if (!dryRun) {
        await client.query('BEGIN');
      }

      try {
        for (const row of batch) {
          try {
            let katakana;
            let usedFallback = false;

            if (row.municipality_kana && row.municipality_kana.trim() !== '') {
              // 半角カタカナ → 全角カタカナ
              katakana = halfToFullKatakana(row.municipality_kana);
            } else {
              // フォールバック: kuroshiro で municipality から変換
              const converted = await kuroshiro.convert(row.municipality, {
                to: 'katakana',
                mode: 'normal',
              });
              katakana = converted;
              usedFallback = true;
              fallbackCount++;
            }

            const hiragana = katakanaToHiragana(katakana);
            const initialKana = getInitialKanaGroup(hiragana);

            if (dryRun) {
              console.log(
                `[DRY] ${row.municipality} → ` +
                `ひらがな: ${hiragana}, カタカナ: ${katakana}, ` +
                `頭文字: ${initialKana}` +
                `${usedFallback ? ' (fallback)' : ''}`
              );
            } else {
              await client.query(
                `UPDATE municipalities
                 SET municipality_name_hiragana = $1,
                     municipality_name_katakana = $2,
                     municipality_name_initial_kana = $3
                 WHERE code = $4`,
                [hiragana, katakana, initialKana, row.code]
              );
            }

            successCount++;
          } catch (err) {
            errorCount++;
            console.error(
              `[ERROR] code=${row.code}, municipality=${row.municipality}: ${err.message}`
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

    console.log(`\n=== 完了 ===`);
    console.log(`成功: ${successCount}件 / エラー: ${errorCount}件 / フォールバック: ${fallbackCount}件`);
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
