import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

const PREF_EN = {
  '北海道': 'hokkaido', '青森県': 'aomori', '岩手県': 'iwate',
  '宮城県': 'miyagi', '秋田県': 'akita', '山形県': 'yamagata',
  '福島県': 'fukushima', '茨城県': 'ibaraki', '栃木県': 'tochigi',
  '群馬県': 'gunma', '埼玉県': 'saitama', '千葉県': 'chiba',
  '東京都': 'tokyo', '神奈川県': 'kanagawa', '新潟県': 'niigata',
  '富山県': 'toyama', '石川県': 'ishikawa', '福井県': 'fukui',
  '山梨県': 'yamanashi', '長野県': 'nagano', '岐阜県': 'gifu',
  '静岡県': 'shizuoka', '愛知県': 'aichi', '三重県': 'mie',
  '滋賀県': 'shiga', '京都府': 'kyoto', '大阪府': 'osaka',
  '兵庫県': 'hyogo', '奈良県': 'nara', '和歌山県': 'wakayama',
  '鳥取県': 'tottori', '島根県': 'shimane', '岡山県': 'okayama',
  '広島県': 'hiroshima', '山口県': 'yamaguchi', '徳島県': 'tokushima',
  '香川県': 'kagawa', '愛媛県': 'ehime', '高知県': 'kochi',
  '福岡県': 'fukuoka', '佐賀県': 'saga', '長崎県': 'nagasaki',
  '熊本県': 'kumamoto', '大分県': 'oita', '宮崎県': 'miyazaki',
  '鹿児島県': 'kagoshima', '沖縄県': 'okinawa',
};

const stations = await sql`
  SELECT id, romanized_name, prefecture
  FROM stations
`;

console.log(`対象駅数: ${stations.length}`);

const slugMap = new Map();
let dupCount = 0;
let skipCount = 0;

for (const s of stations) {
  const roman = (s.romanized_name || '')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!roman) {
    console.log(`romanized_name不足でスキップ: id=${s.id}, prefecture=${s.prefecture}`);
    skipCount++;
    continue;
  }

  const prefEn = PREF_EN[s.prefecture] || 'japan';
  const base = `${roman}-${prefEn}`;

  let slug = base;
  let i = 2;

  while (slugMap.has(slug)) {
    slug = `${base}-${i}`;
    i++;
    dupCount++;
  }

  slugMap.set(slug, s.id);
}

console.log(`重複で連番付与: ${dupCount}件`);
console.log(`スキップ件数: ${skipCount}件`);

let count = 0;
for (const [slug, id] of slugMap) {
  await sql`UPDATE stations SET slug = ${slug} WHERE id = ${id}`;
  count++;
  if (count % 500 === 0) console.log(`${count}件完了...`);
}

console.log(`全${count}件完了！`);

const dups = await sql`
  SELECT slug, COUNT(*) as cnt
  FROM stations
  GROUP BY slug
  HAVING COUNT(*) > 1
  ORDER BY cnt DESC
  LIMIT 10
`;

console.log(`重複slug数: ${dups.length === 0 ? '0（問題なし）' : dups.length}`);
if (dups.length > 0) dups.forEach(d => console.log(d));