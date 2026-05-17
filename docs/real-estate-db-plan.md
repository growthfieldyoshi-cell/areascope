# 不動産情報ライブラリAPI連携 DB設計プラン

最終更新: 2026-05-17
ステータス: **設計確定 / 実応答確認済み / 実装保留 (DDL未着手)**

関連: [../README_DB_CURRENT.md](../README_DB_CURRENT.md) — 実DB構造の正本

---

## 1. 確定済み方針

### 1.1 接続キー
- **APIへ渡すキー = 5桁JISコード = `jis_code`**
  - 値の出所: `municipalities.jis_code` (varchar(5), 生成列 `LEFT(code, 5)`) / `stations.municipality_code`
- **AreaScope内JOIN用キー = 6桁コード = `municipality_code_6`**
  - 値は `municipalities.code` と完全一致させる
  - 駅側からは `stations.municipality_code_normalized` で結合 (実測 10,141件 / 10,141件 = 100%整合)

### 1.2 不可侵ルール
- 既存 `municipalities` / `stations` の **カラム名変更は行わない**
- 既存テーブルへの **データ更新も行わない** (`municipalities.url_slug` を埋める作業も別議題)
- `prefecture_slug` の正本は `prefectures.prefecture_slug` のみ
- `municipality_slug` 表示用には当面 `stations.municipality_slug` を利用

### 1.3 新設テーブル (確定構造)

| テーブル | 役割 | 主キー |
|---|---|---|
| `real_estate_transactions_raw` | 国交省API応答1件分の原データ保管 (JSONB込み) | `id BIGSERIAL` |
| `real_estate_market_stats` | 市区町村×物件種別×年の集計表示用 | `(municipality_code_6, property_type, year)` |

両テーブルとも `municipality_code_6 → municipalities(code)` で外部キー接続。
`jis_code` は冗長保持し、API再取得時のキーとしても使う。

---

## 2. 設計レビュー結果サマリ

### 2.1 `real_estate_transactions_raw`

| 観点 | 判定 | 内容 |
|---|---|---|
| 型整合 | ✅ | `jis_code VARCHAR(5)` / `municipality_code_6 TEXT` で `municipalities` と一致 |
| FK | ✅ | `municipality_code_6 → municipalities(code) ON UPDATE CASCADE` |
| インデックス | ✅ | `jis_code`, `municipality_code_6`, `(year, quarter)`, `raw_payload` GIN |
| 重複防止 | ⚠️ 要API確認 | 応答に一意IDがあるなら `UNIQUE (source, external_id)` を追加 |
| `property_type` 正規化 | ⚠️ 要API確認 | API確定後に CHECK 制約 or ルックアップテーブル化 |
| 期間カラム冗長性 | ❓ 要API確認 | `transaction_period TEXT` と `year`/`quarter` の二重持ちは API 粒度を見て整理 |

### 2.2 `real_estate_market_stats`

| 観点 | 判定 | 内容 |
|---|---|---|
| PK | ✅ | `(municipality_code_6, property_type, year)` で UPSERT 容易 |
| 駅ページJOIN | ✅ | `rms.municipality_code_6 = stations.municipality_code_normalized` で結合可能 |
| `is_low_sample` | ✅ | サンプル少のとき UI で「参考値」表記に切替できる前提を確保 |
| `jis_code` 整合性 | ⚠️ | 冗長保持を維持するか、`GENERATED ALWAYS AS (LEFT(municipality_code_6, 5)) STORED` で不整合余地を排除するか要選択 |
| `property_type` 値域 | ⚠️ 要API確認 | API確定後に CHECK 追加 |
| 集計粒度 | ❓ 要API確認 | 年単位のみだと四半期の鮮度が出ない。`quarter SMALLINT` 追加を検討 |
| 通貨カラム | ❓ | 国交省ライブラリは円のみなので原則不要 |

### 2.3 駅ページ参照クエリ (確定形)

```sql
SELECT
  s.station_group_slug,
  s.station_name,
  s.prefecture_slug,
  s.municipality_slug,
  s.municipality_code             AS jis_code,
  s.municipality_code_normalized  AS municipality_code_6,
  m.municipality                  AS municipality_name,
  rms.property_type,
  rms.year,
  rms.transaction_count,
  rms.median_price,
  rms.avg_price_per_sqm,
  rms.is_low_sample
FROM stations s
JOIN municipalities m
  ON s.municipality_code_normalized = m.code
LEFT JOIN real_estate_market_stats rms
  ON rms.municipality_code_6 = s.municipality_code_normalized
WHERE s.station_group_slug = $1
  AND s.is_public = true
ORDER BY rms.year DESC, rms.property_type;
```

---

## 3. APIキー到着後に確定する項目

実装着手の前に、以下を国交省「不動産情報ライブラリ」API仕様書 + 実応答で確認し、本ドキュメントを更新してから DDL を切る。

### 3.1 API応答に `external_id` があるか
- **何のため**: `real_estate_transactions_raw` の重複取り込み防止 (`UNIQUE (source, external_id)`)
- **判断分岐**:
  - ある場合: 一意IDカラムを追加し UNIQUE 制約と UPSERT 用キーに採用
  - 無い場合: 取得バッチ単位で「全件削除 → 再投入」する運用にするか、`(jis_code, transaction_period, property_type, price, area_sqm, raw_payload_hash)` で代替一意キーを設計するか選択
- **確認方法**: APIキー到着後、1市区町村×1四半期のサンプル取得 → 応答 JSON のフィールド一覧から判定

### 3.2 `property_type` の元値と正規化ルール
- **何のため**: `real_estate_transactions_raw.property_type` / `real_estate_market_stats.property_type` の値域固め (CHECK 制約 / 参照テーブル化の判断)
- **確認内容**:
  - API応答上の生の表記 (例: `宅地(土地)`, `中古マンション等` などの日本語 vs コード値)
  - AreaScope内で扱う正規化値 (例: `land` / `house` / `condo` / `forest` / `farmland` …)
  - マッピング表をどこに持つか (定数 vs DBテーブル `real_estate_property_types`)
- **判断分岐**:
  - 値が少なく安定なら CHECK 制約 + コード内マッピング
  - 値が多い / 将来増える可能性ありならルックアップテーブル化

### 3.3 transaction の粒度が年単位か四半期単位か
- **何のため**: `real_estate_market_stats` の PK と `real_estate_transactions_raw` の期間カラム設計確定
- **確認内容**:
  - API応答が年単位か四半期単位 (`from`/`to` のパラメータ仕様)
  - 四半期単位の場合の確定タイミング (国交省側で四半期確定までのラグ)
- **判断分岐**:
  - 四半期単位で取得可能 → `real_estate_market_stats` に `quarter SMALLINT` を追加し PK を `(municipality_code_6, property_type, year, quarter)` に変更
  - 年単位のみ → 現状のPK維持
  - `real_estate_transactions_raw` の `transaction_period` / `transaction_year` / `transaction_quarter` の冗長性も合わせて整理

### 3.4 保存・キャッシュ・出典表記の扱い
- **保存**:
  - `real_estate_transactions_raw` を一次データとして保管 (`raw_payload JSONB`)、再集計を可能にする
  - リテンション (古いデータの削除/アーカイブ) ポリシーが必要か要件確認
- **キャッシュ**:
  - 駅ページ (現状 SSG/ISR 構成) で `real_estate_market_stats` を読む際の revalidate 戦略
  - 集計バッチを Vercel Cron / 手動スクリプトのどちらで回すか
- **出典表記**:
  - 国交省「不動産情報ライブラリ」利用規約に基づく出典文の文言確定
  - 表示位置 (駅ページ下部 / モーダル / フッター)
  - データ取得日 (`computed_at`) の併記要否
- **確認方法**: 国交省API利用規約とFAQ、AreaScope運営側の方針確認

### 3.5 上記4点が出揃ったら確定するDDL差分 (予告)
- `real_estate_transactions_raw`:
  - `external_id TEXT` の有無、`UNIQUE (source, external_id)` の追加可否
  - `property_type` への CHECK 追加可否
  - `transaction_period` / `year` / `quarter` の最終形
- `real_estate_market_stats`:
  - PKへの `quarter` 追加可否
  - `jis_code` 生成列化の採否
  - `property_type` への CHECK 追加可否

---

## 3.6 実応答確認結果 (2026-05-17)

`scripts/test-reinfolib-api.mjs` で **1リクエストのみ** 実行し、実レスポンスで §3.1〜§3.4 を確定した。

### テスト条件
| 項目 | 値 |
|---|---|
| API | XIT001 不動産価格(取引価格・成約価格)情報取得API |
| エンドポイント | `https://www.reinfolib.mlit.go.jp/ex-api/external/XIT001` |
| 認証ヘッダ | `Ocp-Apim-Subscription-Key` (Azure API Management 形式) |
| パラメータ | `year=2024` / `quarter=1` / `city=14207` (茅ヶ崎市) |
| 結果 | HTTP 200 / `status:"OK"` / `data` 配列 **222件** |

### レスポンス構造
- トップレベル: `{ status: "OK", data: [...] }`
- `data` は取引レコードの配列。各レコードは下記フィールドを持つ **フラットなオブジェクト**。
- **全フィールドが文字列型**。欠損値は `null` ではなく **空文字 `""`** で返る (取込時に `NULLIF(x,'')` 正規化が必須)。

| フィールド | 内容 | サンプル値 |
|---|---|---|
| `PriceCategory` | 価格情報区分 | `不動産取引価格情報` / `成約価格情報` |
| `Type` | 取引の種類 (= property_type 元値) | `中古マンション等` / `宅地(土地)` / `宅地(土地と建物)` |
| `Region` | 地域分類 | `住宅地` / `商業地` / `宅地見込地` / `""` |
| `MunicipalityCode` | 市区町村コード (5桁) | `14207` |
| `Prefecture` / `Municipality` | 都道府県名 / 市区町村名 | `神奈川県` / `茅ヶ崎市` |
| `DistrictName` | 地区名 | `汐見台` |
| `DistrictCode` | 地区コード (9桁 = 市区町村5桁+地区4桁) | `142070110` |
| `TradePrice` | 取引価格(総額・円) | `17000000` |
| `UnitPrice` | ㎡単価 | `""` (種別により空) |
| `PricePerUnit` | 坪単価 | `""` (種別により空) |
| `Area` | 面積(㎡) | `65` |
| `TotalFloorArea` | 延床面積(㎡) | (建物取引で値あり) |
| `Frontage` / `LandShape` | 間口 / 土地の形状 | (土地取引で値あり) |
| `FloorPlan` | 間取り | `３ＬＤＫ` |
| `BuildingYear` | 建築年 | (空のレコードあり。仕様上は **和暦表記** "平成6年" 等で返る) |
| `Structure` | 建物構造 | `ＲＣ` 等 |
| `Use` / `Purpose` | 用途 / 今後の利用目的 | `住宅` / `共同住宅、店舗` / `事務所` 等 |
| `Direction` / `Classification` / `Breadth` | 前面道路の方位/種類/幅員 | (土地取引で値あり) |
| `CityPlanning` | 都市計画用途地域 | `準住居地域` |
| `CoverageRatio` / `FloorAreaRatio` | 建蔽率 / 容積率(%) | `60` / `200` |
| `Period` | 取引時点 | `2024年第1四半期` |
| `Renovation` | 改装有無 | `改装済み` |
| `Remarks` | 取引の事情等 | `""` |

### §3.1 `external_id` の有無 → **無い**
- レコード単位の一意IDフィールドは **存在しない**。
- `DistrictCode` は「地区」コードであり、1取引に対応しない (222件中、同一 `DistrictCode` を多数レコードが共有)。さらに公式マニュアル上「データ更新タイミングで変更の可能性あり」と明記 → **一意キー・継続キーには使えない**。
- **結論**: `UNIQUE (source, external_id)` 案は採用不可。代替として下記いずれか:
  - (推奨) **取得バッチ単位で「該当 `(jis_code, year, quarter)` を全削除 → 再投入」**。APIは指定四半期の全件を一括返却するため、冪等な再投入が容易。
  - もしくは `raw_payload` のハッシュ列 (`raw_payload_hash`) で重複検出。

### §3.2 `property_type` の元値 → `Type` フィールド (日本語表記)
- 元値はコードではなく **日本語文字列**。今回観測: `中古マンション等` / `宅地(土地)` / `宅地(土地と建物)`。
- 仕様上の全値域 (5種、安定・少数): `宅地(土地)` / `宅地(土地と建物)` / `中古マンション等` / `林地` / `農地`。
- **結論**: 値が少なく安定 → **CHECK制約 + コード内マッピング** で十分 (ルックアップテーブル不要)。
  - 正規化マッピング案: `宅地(土地)→land` / `宅地(土地と建物)→house` / `中古マンション等→condo` / `林地→forest` / `農地→farmland`。

### §3.3 transaction 粒度 → **四半期単位**
- `Period` = `2024年第1四半期`。リクエストも `year` + `quarter` が必須。**年単位ではなく四半期単位**で確定。
- **結論**:
  - `real_estate_market_stats` の PK に `quarter SMALLINT` を追加 → `(municipality_code_6, property_type, year, quarter)`。
  - `real_estate_transactions_raw` は `Period` 文字列を `raw_payload` に保持しつつ、`transaction_year SMALLINT` / `transaction_quarter SMALLINT` に分解保持。`transaction_period TEXT` の独立カラムは冗長 → **不要 (削除案)**。

### §3.4 市区町村コードの扱い → **5桁JISコードでそのまま扱える**
- `MunicipalityCode` は `"14207"` の **5桁文字列**。`jis_code VARCHAR(5)` でそのまま受けられる。
- `municipality_code_6 = LEFT(MunicipalityCode,5)` ではなく、逆に **AreaScopeの6桁→API渡しは `LEFT(code,5)`** で従来方針どおり。`jis_code` 生成列化 (`GENERATED ALWAYS AS (LEFT(municipality_code_6,5)) STORED`) も問題なし。

### ページング・件数上限
- ページングパラメータ (`limit`/`offset`/カーソル) は **無い**。
- 1リクエストで指定 `city × year × quarter` の **全件を一括返却** (今回222件)。件数は `data.length` で取得。
- 全国・全期間ループは不要だが、市区町村×四半期の組合せ単位でのリクエスト設計になる。

### 出典表記・保存・キャッシュの注意点
- **出典表記**: 国交省「不動産情報ライブラリ」の利用規約に従い、表示画面に出典 (例: 「出典: 国土交通省 不動産情報ライブラリ」) と取得日の明記が必要。文言・表示位置は別途運営確認。
- **保存**: 一意IDが無いため `real_estate_transactions_raw` は「四半期バッチ削除→再投入」前提で設計。`raw_payload JSONB` に応答1件をそのまま保管。
- **キャッシュ/エンコード**: 応答は `application/json` (今回確認時)。マニュアル上 gzip エンコードの可能性あり (`fetch` は自動デコード)。
- **型**: 全フィールド文字列・欠損は空文字 → raw テーブルは **TEXT のまま保持**、数値化 (`NULLIF`+`::numeric`) は `market_stats` 集計時に行うのが安全。
- `PriceCategory` に `不動産取引価格情報` と `成約価格情報` が **混在** (`priceClassification` 未指定のため) → raw に `price_category` 列を持つか、取得時に `priceClassification` で絞るか要選択。

### DDL設計で修正が必要な点 (まとめ)
| 対象 | 当初案 | 修正後 |
|---|---|---|
| `real_estate_transactions_raw` 一意制約 | `UNIQUE (source, external_id)` | **削除**。四半期バッチ削除→再投入運用 (+任意で `raw_payload_hash`) |
| `transaction_period` カラム | `TEXT` 独立保持 | **不要**。`transaction_year`/`transaction_quarter` (SMALLINT) に分解 |
| `property_type` 制約 | 要確認 | **CHECK制約**で5値固定 + コード内マッピング (ルックアップ表は不要) |
| `real_estate_market_stats` PK | `(municipality_code_6, property_type, year)` | **`(municipality_code_6, property_type, year, quarter)`** に変更 |
| `price_category` の扱い | 未考慮 | 取引価格/成約価格の混在に対応する列 or 取得時フィルタを追加 |
| 数値カラム型 | 未確定 | raw は TEXT 保持、`market_stats` で数値化。欠損=空文字を考慮 |
| `jis_code` 生成列化 | 要選択 | API渡しは5桁でそのまま可。生成列化は採用して不整合排除を推奨 |

---

## 4. 今回までの作業範囲 (ログ)

| 日付 | 内容 |
|---|---|
| 2026-05-08 | 実DB構造確認 (SELECTのみ)、`README_DB_CURRENT.md` 作成 |
| 2026-05-08 | `real_estate_transactions_raw` / `real_estate_market_stats` のCREATE TABLE案レビュー、本ファイル作成 |
| 2026-05-17 | XIT001 APIを1リクエストのみ実行 (茅ヶ崎市/2024Q1)、§3.1〜§3.4を実応答で確定 (§3.6追記)、`scripts/test-reinfolib-api.mjs` 作成 |

### 未実施 (意図的に保留)
- ❌ `real_estate_*` テーブルの CREATE TABLE
- ❌ マイグレーションファイルの作成
- ❌ API取得スクリプト
- ❌ 駅ページ / 市区町村ページへの不動産データ表示実装
- ❌ 既存ページ・既存テーブルへの変更全般

次アクション: APIキー到着 → §3.1〜§3.4 を実応答で確定 → 本ファイル更新 → DDL作成 → マイグレーション実行。
