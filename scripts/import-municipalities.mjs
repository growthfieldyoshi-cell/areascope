import fs from "fs";
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

async function main() {
  const csv = fs.readFileSync("scripts/municipalities.csv", "utf8");

  const lines = csv.split("\n").slice(1);

  console.log("municipalities:", lines.length);

  let inserted = 0;

  for (const line of lines) {
    if (!line.trim()) continue;

    const [code, prefecture, municipality, prefecture_kana, municipality_kana] =
      line.split(",");

    await sql`
      INSERT INTO municipalities
      (code, prefecture, municipality, prefecture_kana, municipality_kana)
      VALUES
      (${code}, ${prefecture}, ${municipality}, ${prefecture_kana}, ${municipality_kana})
    `;

    inserted++;

    if (inserted % 200 === 0) {
      console.log(`Inserted ${inserted}`);
    }
  }

  console.log("municipalities inserted:", inserted);
}

main();