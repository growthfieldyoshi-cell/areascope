/**
 * 不動産情報ライブラリ API (XIT001) 実レスポンス確認用の一時スクリプト。
 *
 * 目的: DB設計の未確定項目を埋めるため、1リクエストだけ実行してレスポンス構造を確認する。
 * 実行: node --env-file=.env.local scripts/test-reinfolib-api.mjs
 *
 * 注意:
 *  - APIキーは process.env.REINFOLIB_API_KEY からのみ読み込む (直書き禁止)。
 *  - APIキーはログに出力しない。
 *  - 1リクエストのみ。ループ取得・全国取得は行わない。
 */

const API_KEY = process.env.REINFOLIB_API_KEY;
if (!API_KEY) {
  console.error("REINFOLIB_API_KEY が未設定です。`node --env-file=.env.local` で実行してください。");
  process.exit(1);
}

// 茅ヶ崎市 (神奈川県) / 2024年 第1四半期 のみ取得
const params = new URLSearchParams({
  year: "2024",
  quarter: "1",
  city: "14207", // 茅ヶ崎市 5桁JISコード
});
const url = `https://www.reinfolib.mlit.go.jp/ex-api/external/XIT001?${params}`;

console.log("=== テスト条件 ===");
console.log("endpoint : https://www.reinfolib.mlit.go.jp/ex-api/external/XIT001");
console.log("params   :", Object.fromEntries(params));
console.log("apiKeyLen:", API_KEY.length, "(値は非表示)");
console.log();

const res = await fetch(url, {
  headers: { "Ocp-Apim-Subscription-Key": API_KEY },
});

console.log("=== HTTPレスポンス ===");
console.log("HTTP status :", res.status, res.statusText);
console.log("content-type:", res.headers.get("content-type"));
console.log();

const body = await res.json();

console.log("=== レスポンス トップレベル ===");
console.log("keys        :", Object.keys(body));
console.log("status      :", body.status);
console.log("data length :", Array.isArray(body.data) ? body.data.length : "(配列でない)");
console.log();

if (Array.isArray(body.data) && body.data.length > 0) {
  const first = body.data[0];
  console.log("=== 1件目レコードのフィールド一覧 ===");
  for (const [k, v] of Object.entries(first)) {
    console.log(`  ${k.padEnd(20)} = ${JSON.stringify(v)}`);
  }
  console.log();

  // 全レコード横断で出現するキーの和集合 (レコードごとに欠落キーがある可能性の確認)
  const allKeys = new Set();
  for (const r of body.data) for (const k of Object.keys(r)) allKeys.add(k);
  console.log("=== 全レコード横断のキー和集合 ===");
  console.log([...allKeys].sort().join(", "));
  console.log();

  const distinct = (key) => [...new Set(body.data.map((r) => r[key]))];
  console.log("=== 主要フィールドの distinct 値 ===");
  console.log("Type            :", distinct("Type"));
  console.log("PriceCategory   :", distinct("PriceCategory"));
  console.log("Period          :", distinct("Period"));
  console.log("MunicipalityCode:", distinct("MunicipalityCode"));
  console.log("Municipality    :", distinct("Municipality"));
  console.log("Region          :", distinct("Region"));
  console.log("Use (先頭10件)  :", distinct("Use").slice(0, 10));
  console.log("DistrictCode    :", distinct("DistrictCode").slice(0, 10), "...");
}
