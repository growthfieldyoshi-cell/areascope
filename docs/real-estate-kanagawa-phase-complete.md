# 不動産情報ライブラリAPI連携 — 神奈川県フェーズ 完了メモ

作成: 2026-05-17
ステータス: **神奈川県フェーズ完了**

関連:
- [real-estate-db-plan.md](./real-estate-db-plan.md) — 全体方針・API実応答確認
- [real-estate-migration-plan.md](./real-estate-migration-plan.md) — raw / quarterly テーブル設計
- [real-estate-annual-stats-plan.md](./real-estate-annual-stats-plan.md) — annual テーブル設計
- [real-estate-ordinance-city-plan.md](./real-estate-ordinance-city-plan.md) — 政令市区対応 設計案 (案C採用)
- [../README_DB_CURRENT.md](../README_DB_CURRENT.md) — 実DB構造の正本

---

## 1. 概要

国土交通省「不動産情報ライブラリ」API (XIT001 不動産価格(取引価格・成約価格)情報取得API) を連携し、
**市区町村ページに「不動産取引価格の目安」セクションを表示**する機能を追加した。

神奈川県フェーズで完了したこと:
- XIT001 からの取引価格データ取得 → 原データ保存 (raw) → 四半期集計 (quarterly) → 通年集計 (annual) までのパイプライン構築
- 神奈川県の **通常市16市 + 政令市3市 = 計19市** について 2024年Q1〜Q4 のデータを取得・集計
- 市区町村ページに **2024年通年** の取引価格中央値(土地＋建物 / 土地 / 中古マンション等)を表示

AreaScope上で表示できるようになったもの:
- 各市区町村ページの「不動産取引価格の目安」セクション
- 物件種別ごとの取引価格中央値・面積中央値・取引件数(土地は㎡単価・坪単価も)
- 出典表記(国土交通省 不動産情報ライブラリ)と集計期間「2024年通年」

---

## 2. 対象範囲

### 通常市 (16市)
横須賀市 / 平塚市 / 鎌倉市 / 藤沢市 / 小田原市 / 茅ヶ崎市 / 逗子市 / 三浦市 / 秦野市 / 厚木市 /
大和市 / 伊勢原市 / 海老名市 / 座間市 / 南足柄市 / 綾瀬市

- いずれも `municipalities` に存在する通常市。市の5桁JISコードで XIT001 を取得。
- 2024年 Q1〜Q4 の raw保存・quarterly集計・annual集計まで完了。

### 政令市 (3市)
横浜市 / 川崎市 / 相模原市

- **案C「政令市は市単位に集約して表示」を採用**。
- 行政区コードで XIT001 を取得し、親市の `municipality_code_6` に集約して保存・集計:
  - 横浜市18区 → `141003` に集約
  - 川崎市7区 → `141305` に集約
  - 相模原市3区 → `141500` に集約
- `municipalities` に区レコードは追加していない。既存の市区町村ページ構造も変更していない。

### 表示対象
- 神奈川県では **通常市16市 + 政令市3市 = 計19市** で「不動産取引価格の目安」セクションが表示される。
- 表示期間は **「2024年通年」**。

---

## 3. データ構造

3テーブル構成。いずれも `municipality_code_6 → municipalities(code)` で外部キー接続。

| テーブル | 役割 | 粒度 / キー |
|---|---|---|
| `real_estate_transactions_raw` | XIT001応答1件分の原データ保管 (TEXT中心 + `raw_payload JSONB`) | 1取引1行。`id BIGSERIAL`。行単位UNIQUEなし |
| `real_estate_market_stats` | 四半期集計 (quarterly) | PK `(municipality_code_6, property_type, year, quarter, price_category)` |
| `real_estate_market_stats_annual` | 通年集計 (annual) | PK `(municipality_code_6, property_type, year, price_category)` |

役割:
- **raw**: APIレスポンスを無加工 (TEXT) で保管する一次データ。数値項目も文字列のまま保持し、`raw_payload` に応答1件全体をJSONBで保持。再集計の元になる。
- **quarterly**: raw を市区町村×種別×年×四半期×価格区分で集計した数値化済みデータ。四半期推移の確認用。
- **annual**: raw を市区町村×種別×年×価格区分で集計した通年データ。市区町村ページの主表示。

raw のバッチ置換単位は `municipality_code_6 × year × quarter × price_category`。
`jis_code` は両 stats テーブルとも `LEFT(municipality_code_6, 5)` の生成列。

---

## 4. 政令市対応方針 (案C)

- **案C「政令市は市単位に集約して表示」を採用**。XIT001 は政令市の市コード(例: 横浜市 14100)を受け付けず HTTP 404 になり、**行政区コードでしか取得できない**ため。
- 行政区コード(例: 横浜市西区 14103)で取得し、AreaScope上は **親市の `municipality_code_6` に集約**して保存・集計する。
- 区由来の情報は失わず、各rawレコードの以下に保持する:
  - `municipality` — 区を含む元値(例: 「横浜市西区」)
  - `district_name` — 地区名
  - `district_code` — 地区コード
  - `raw_payload` — APIレスポンス1件全体
- **`municipalities` に区レコードは追加しない**。stations が既に政令市を市単位に正規化(`municipality_code_normalized`)しているため、案Cは既存サイト構造と整合する。

### raw投入ルール (重要)
政令市では **区ごとにDELETEしてはいけない**。区ごとに親市コードでDELETEすると、先に投入した区のデータが消える。
正しい手順 (親市×quarterごと):
1. 対象政令市の全区をAPI取得する
2. 取得結果をメモリ上にまとめる
3. `親市コード × year × quarter` について `price_category IN ('transaction','contract')` を**一括DELETE**
4. 全区分のレコードを**まとめてINSERT**
5. DELETE→INSERT は1トランザクションで行う

---

## 5. ページ表示仕様

市区町村ページ「不動産取引価格の目安」セクションの表示優先順位:
1. `real_estate_market_stats_annual` にデータがあれば **annual を表示**(期間ラベル「YYYY年通年」)
2. annual が無ければ `real_estate_market_stats` の **最新 quarter を表示**(期間ラベル「YYYY年第Q四半期」)
3. どちらも無ければ **不動産セクション自体を非表示**

その他の表示ルール:
- `price_category = 'transaction'`(取引価格)のみ表示。成約価格 (`contract`) は集計・保持はするが表示しない。
- 表示対象 `property_type` は **3種のみ**、固定順:
  1. `land_and_building` → 土地＋建物
  2. `land` → 土地
  3. `used_condominium` → 中古マンション等
- `farmland`(農地)/ `forest`(林地)は **DBには保持するが市区町村ページでは表示しない**。
- 主指標は中央値(平均は非表示)。`median_price` がNULLの種別は非表示。㎡単価・坪単価がNULLの項目は非表示(土地以外はNULLになる)。
- `is_low_sample` が true の種別は「取引件数が少ないため参考値です」と表示。
- 金額は万円単位に整形。
- 神奈川県の対象19市はいずれも **2024年通年表示**。

---

## 6. 主要な注意点

- **annual中央値は「四半期中央値の平均」ではなく、raw の年間全件から再計算する**。
  四半期ごとに件数・分布が異なるため、中央値の平均は正しい年間中央値にならない。
  annual集計は `WHERE transaction_year = <年>`(quarterで絞らない)で `percentile_cont(0.5)` を1回算出する。
- **政令市は親市単位に集約しているため、区別ページは存在しない**。区粒度の情報は raw に残っているので、
  将来「区ページ」が必要になれば raw から区別に再集計できる(案B/案Aへの移行余地あり)。
- **APIキーはログに出さない**。`process.env.REINFOLIB_API_KEY` からのみ読み込み、コードへの直書き・ログ出力をしない。
- **API取得は小さくテストしてから拡張する**。1リクエスト確認 → 1市 → 複数市 → 政令市1市 → 政令市複数、と段階的に進めた。
- **全国展開の前に、都道府県ごとの政令市の有無を確認する**。政令市は行政区取得+親市集約が必要。
- 異常値チェックで `farmland`/`forest` が低額・少数フラグされることがあるが、林地・農地は構造的に低単価かつ少数で、
  多くは実勢どおり。品質監視では property_type 別に閾値を分けるのが望ましい。
- `is_low_sample` の閾値は quarterly が `count < 10`、annual が `count < 20`(年間は件数が約4倍になるため)。

---

## 7. 次の展開候補

- **千葉県** — 政令市は千葉市(行政区あり)。通常市多数。
- **埼玉県** — 政令市はさいたま市(行政区あり)。通常市多数。
- **静岡県** — 政令市は静岡市・浜松市(いずれも行政区あり)。
- **東京都** — 23区は**特別区**であり独立した地方公共団体(`municipalities` に存在)。
  政令市の行政区とは異なり通常市と同じ扱いで取得できる。一方、八王子市など多摩地域の市は通常市。
  「政令市の行政区」対応とは別問題なので混同しないよう注意。
- 全国展開の前に整えるべきもの:
  - 取得スクリプトの汎用化(通常市用 / 政令市用の対象リストを都道府県単位で生成できるようにする)
  - 対象自治体リストの自動生成(`municipalities` から通常市を抽出、政令市は行政区コード一覧を持つ)
  - 政令市ごとの「行政区jisコード一覧 → 親市6桁コード」マッピングの整備
  - API取得量・実行時間の見積り(政令市は区数ぶんのリクエストになる)

---

## 8. 神奈川県フェーズで作成した主な資産

- マイグレーション: `migrations/20260517_create_real_estate_tables.sql` / `..._add_tsubo_columns.sql` / `..._create_real_estate_annual_stats.sql`
- 取得・集計スクリプト: `scripts/import-reinfolib-*.mjs` / `scripts/aggregate-real-estate-*.mjs` / `scripts/import-reinfolib-ordinance-city.mjs`(政令市汎用)
- 表示コンポーネント: `components/RealEstateSection.tsx`(市区町村ページに組込み済み)
- 設計ドキュメント: 本ファイル冒頭の「関連」を参照
