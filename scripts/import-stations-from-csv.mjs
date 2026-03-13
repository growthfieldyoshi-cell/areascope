import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import fs from "fs"
import { parse } from "csv-parse/sync"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

const file = fs.readFileSync("data/stations_master_with_municipality.csv")

const records = parse(file, {
  columns: true,
  skip_empty_lines: true
})

console.log("records:", records.length)

for (const r of records) {
  await sql`
    INSERT INTO stations
    (
      station_key,
      station_name,
      line_name,
      operator_name,
      slug,
      lat,
      lng,
      municipality_code,
      prefecture_name,
      municipality_name
    )
    VALUES
    (
      ${r.station_key},
      ${r.station_name},
      ${r.line_name},
      ${r.operator_name},
      ${r.slug},
      ${r.lat},
      ${r.lng},
      ${r.municipality_code},
      ${r.prefecture},
      ${r.municipality}
    )
    ON CONFLICT (station_key) DO NOTHING
  `
}

console.log("Import finished")
