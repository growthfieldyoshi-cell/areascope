import 'dotenv/config';
import kuromoji from 'kuromoji';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

const tokenizer = await new Promise((resolve, reject) => {
  kuromoji.builder({ dicPath: 'node_modules/kuromoji/dict' }).build((err, t) => {
    if (err) reject(err);
    else resolve(t);
  });
});

const rows = await sql`SELECT DISTINCT station_name FROM stations WHERE station_name_kana IS NULL OR station_name_kana = ''`;

console.log(`対象駅名: ${rows.length}件`);

let count = 0;
for (const row of rows) {
  const name = row.station_name;
  const tokens = tokenizer.tokenize(name);
  const kana = tokens.map(t => t.reading ?? t.surface_form).join('');
  const hiragana = kana.replace(/[\u30A1-\u30F6]/g, c =>
    String.fromCharCode(c.charCodeAt(0) - 0x60)
  );
  await sql`UPDATE stations SET station_name_kana = ${hiragana} WHERE station_name = ${name}`;
  count++;
  if (count % 100 === 0) console.log(`${count}件完了...`);
}

console.log(`完了: ${count}件更新`);