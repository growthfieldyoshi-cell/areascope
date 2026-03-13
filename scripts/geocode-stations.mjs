import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

async function reverseGeocode(lat, lng) {

  const url =
  `https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat=${lat}&lon=${lng}`;

  const res = await fetch(url);
  const json = await res.json();

  return json?.results?.muniCd ?? null;
}

async function main() {

  const stations = await sql`
    SELECT slug, lat, lng
    FROM stations
    WHERE municipality_code IS NULL
  `;

  console.log("stations:", stations.length);

  for (const s of stations) {

    const muni = await reverseGeocode(s.lat, s.lng);

    if (!muni) continue;

    await sql`
      UPDATE stations
      SET municipality_code = ${muni}
      WHERE slug = ${s.slug}
    `;

    console.log(s.slug, muni);

    await new Promise(r => setTimeout(r, 200));
  }

  console.log("finished");

}

main();

