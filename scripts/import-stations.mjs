import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';

const sql = neon(process.env.DATABASE_URL);

const fileContent = readFileSync('./public/station_data.js', 'utf8');
const match = fileContent.match(/const STATION_DATA = (\[[\s\S]*\]);/);
const stations = eval(match[1]);

console.log(`総駅数: ${stations.length}`);

const batchSize = 100;
for (let i = 0; i < stations.length; i += batchSize) {
  const batch = stations.slice(i, i + batchSize);
  for (const s of batch) {
    await sql`
      INSERT INTO stations (station_name, line_name, prefecture, passengers_2011, passengers_2012, passengers_2013, passengers_2014, passengers_2015, passengers_2016, passengers_2017, passengers_2018, passengers_2019, passengers_2020, passengers_2021)
      VALUES (${s.name}, ${s.line}, ${s.pref}, ${s.data[0]}, ${s.data[1]}, ${s.data[2]}, ${s.data[3]}, ${s.data[4]}, ${s.data[5]}, ${s.data[6]}, ${s.data[7]}, ${s.data[8]}, ${s.data[9]}, ${s.data[10]})
    `;
  }
  console.log(`${i + batch.length} / ${stations.length} 完了`);
}

console.log('インポート完了！');