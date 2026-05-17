/**
 * マイグレーション実行前チェック用の一時スクリプト (SELECTのみ)。
 *
 * 実行: node --env-file=.env.local scripts/verify-real-estate-migration.mjs
 *
 * 注意:
 *  - SELECT クエリのみ。CREATE / ALTER / DROP / INSERT / UPDATE / DELETE は一切行わない。
 *  - DATABASE_URL は process.env からのみ読み込む。
 */

import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL が未設定です。`node --env-file=.env.local` で実行してください。");
  process.exit(1);
}

const sql = neon(url);

console.log("=== 2. real_estate系テーブルの既存有無 ===");
const existing = await sql`
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('real_estate_transactions_raw', 'real_estate_market_stats')
`;
console.log("既存テーブル:", existing.length ? existing.map((r) => r.table_name) : "(なし)");
console.log();

console.log("=== 3. municipalities.code の形式確認 ===");
const fmt = await sql`
  SELECT
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE code IS NULL) AS null_code_count,
    COUNT(*) FILTER (WHERE code !~ '^[0-9]{6}$') AS invalid_code_count
  FROM municipalities
`;
console.log(fmt[0]);
console.log();

console.log("=== 4. municipalities.code の重複確認 ===");
const dup = await sql`
  SELECT code, COUNT(*) AS cnt
  FROM municipalities
  GROUP BY code
  HAVING COUNT(*) > 1
`;
console.log("重複件数:", dup.length);
if (dup.length) console.log(dup);
console.log();

console.log("=== 5. municipalities.code の制約確認 (FK参照先) ===");
const cons = await sql`
  SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
   AND tc.table_schema = kcu.table_schema
  WHERE tc.table_schema = 'public'
    AND tc.table_name = 'municipalities'
    AND kcu.column_name = 'code'
`;
console.log(cons.length ? cons : "(code列に紐づく制約なし)");
console.log();

// FK は code の型一致も重要なため、参考として code 列の型も確認
console.log("=== 参考: municipalities.code の列定義 ===");
const coltype = await sql`
  SELECT column_name, data_type, is_nullable, is_generated
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'municipalities' AND column_name = 'code'
`;
console.log(coltype[0]);
