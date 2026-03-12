import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';

config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

const kuroshiro = new Kuroshiro.default();
await kuroshiro.init(new KuromojiAnalyzer());

const stations = await sql`SELECT id, station_name FROM stations WHERE romanized_name IS NULL`;
console.log(`対象駅数: ${stations.length}`);

let count = 0;
for (const s of stations) {
  const roman = await kuroshiro.convert(s.station_name, { to: 'romaji', mode: 'spaced' });
  const slug = roman.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  await sql`UPDATE stations SET romanized_name = ${slug} WHERE id = ${s.id}`;
  count++;
  if (count % 500 === 0) console.log(`${count}件完了...`);
}
console.log(`全${count}件完了！`);