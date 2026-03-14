import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { readFileSync } from "fs";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const fileContent = readFileSync("./public/station_data.js", "utf8");
const match = fileContent.match(/const STATION_DATA = (\[[\s\S]*\]);/);
const stations = eval(match[1]);

console.log(`総駅数: ${stations.length}`);

const YEARS = [2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021];

let matched = 0;
let skipped = 0;

for (const s of stations) {
  const rows = await sql`
    SELECT station_key FROM stations
    WHERE station_name = ${s.name}
      AND line_name = ${s.line}
    LIMIT 1
  `;

  if (rows.length === 0) {
    skipped++;
    continue;
  }

  const station_key = rows[0].station_key;

  for (let i = 0; i < YEARS.length; i++) {
    const year = YEARS[i];
    const passengers = s.data[i] || null;
    await sql`
      INSERT INTO station_passengers (station_key, year, passengers, source)
      VALUES (${station_key}, ${year}, ${passengers}, 'station_data.js')
      ON CONFLICT (station_key, year) DO NOTHING
    `;
  }

  matched++;
  if (matched % 500 === 0) console.log(`${matched} 駅完了...`);
}

console.log(`完了: マッチ ${matched}駅 / スキップ ${skipped}駅`);