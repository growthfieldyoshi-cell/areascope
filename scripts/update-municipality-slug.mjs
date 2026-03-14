import kuromoji from 'kuromoji';
import { toRomaji } from 'wanakana';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

const tokenizer = await new Promise((resolve, reject) => {
  kuromoji.builder({ dicPath: 'node_modules/kuromoji/dict' }).build((err, t) => {
    if (err) reject(err);
    else resolve(t);
  });
});

const rows = await sql`SELECT DISTINCT municipality_name, municipality_code FROM stations`;

for (const row of rows) {
  const name = row.municipality_name;
  const tokens = tokenizer.tokenize(name);
  const reading = tokens.map(t => t.reading ?? t.surface_form).join('');
  const romaji = toRomaji(reading).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  await sql`UPDATE stations SET municipality_slug = ${romaji} WHERE municipality_name = ${name}`;
  console.log(`${name} → ${romaji}`);
}

console.log('完了');