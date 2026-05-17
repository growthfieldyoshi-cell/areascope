# 不動産情報ライブラリAPI連携 マイグレーション計画 (DDL案)

作成: 2026-05-17
ステータス: **DDL案レビュー段階 / 実行保留 (CREATE未実施)**

関連:
- [real-estate-db-plan.md](./real-estate-db-plan.md) — 設計方針と API 実応答確認結果 (§3.6)
- [../README_DB_CURRENT.md](../README_DB_CURRENT.md) — 実DB構造の正本

> 本ファイルは **SQLファイル案の作成とレビューのみ**。CREATE / ALTER / INSERT / UPDATE / DELETE は一切実行しない。

---

## 1. 追加予定テーブル

| テーブル | 役割 | 主キー / 一意性 |
|---|---|---|
| `real_estate_transactions_raw` | XIT001 API応答1件分の原データ保管 (TEXT中心 + JSONB) | `id BIGSERIAL` のみ (行単位UNIQUEなし) |
| `real_estate_market_stats` | 表示・ランキング用の集計済みテーブル (数値化済み) | `(municipality_code_6, property_type, year, quarter, price_category)` |

両テーブルとも `municipality_code_6 → municipalities(code)` で外部キー接続。
API再取得キーとなる5桁 `jis_code` は `LEFT(municipality_code_6, 5)` の **生成列** で持ち、手動値との不整合余地を排除する。

---

## 2. `real_estate_transactions_raw` 方針

### 2.1 設計原則
- **API応答の元項目は TEXT 中心で保存**。XIT001 は全フィールドが文字列・欠損は空文字 `""` で返るため、取込時の型変換失敗を避け、原データを無加工で保持する。
- 数値化 (`TradePrice` → BIGINT 等) は **raw では行わず**、`market_stats` 構築時に `NULLIF(x,'')::numeric` で実施する。
- `external_id` が API に存在しないため、**1件単位の UNIQUE 制約は置かない**。
- `raw_payload JSONB` に API レスポンス1件をそのまま保持し、再集計・項目追加に備える。

### 2.2 取込運用 (冪等性の担保)
- XIT001 は `city × year × quarter` で全件を一括返却する。`PriceCategory`(取引価格/成約価格)は混在し得る。
- 重複防止は UNIQUE ではなく **バッチ置換** で担保する:

  ```
  BEGIN;
    DELETE FROM real_estate_transactions_raw
     WHERE jis_code = $1 AND transaction_year = $2
       AND transaction_quarter = $3 AND price_category = $4;
    INSERT INTO real_estate_transactions_raw (...) VALUES ...;  -- 取得分を一括投入
  COMMIT;
  ```

- 置換単位 = **`city(jis_code) × year × quarter × price_category`**。この4列に複合インデックスを張り、DELETE を高速化する。
- 再取得しても結果が同一になる (冪等)。

### 2.3 保持するAPI元項目 (TEXT)
`Type` は正規化値 `property_type` に変換して保持、それ以外の主要項目は原値を TEXT で保持する。
`type_raw` に元の日本語表記も残し、マッピング検証を可能にする。

---

## 3. `real_estate_market_stats` 方針

- 駅ページ / 市区町村ページ / ランキング表示用の **集計済みテーブル**。
- raw を `property_type × year × quarter × price_category` で GROUP BY し、数値化した中央値・平均・件数を保持する。
- **PK / UNIQUE**: `(municipality_code_6, property_type, year, quarter, price_category)`
  - 集計表示の最小単位そのもの。UPSERT (`ON CONFLICT ... DO UPDATE`) で再集計を反映できる。
- 保持指標: `transaction_count` / `median_price` / `avg_price` / `median_price_per_sqm` / `avg_price_per_sqm` / `median_area_sqm`。
- `is_low_sample`: 件数が閾値未満のとき true。UI 側で「参考値」表記に切替える前提。
- 通貨カラムは持たない (国交省ライブラリは円のみ)。

---

## 4. `property_type` 正規化案

API の `Type` (日本語文字列) を AreaScope 内コード値へマッピングする。値域は5種で安定・少数のため、**ルックアップテーブルは作らず CHECK 制約 + アプリ側マッピング定数**で固める。

| API `Type` (元値) | 正規化値 `property_type` |
|---|---|
| `宅地(土地)` | `land` |
| `宅地(土地と建物)` | `land_and_building` |
| `中古マンション等` | `used_condominium` |
| `農地` | `farmland` |
| `林地` | `forest` |

- 茅ヶ崎市2024Q1サンプルでは `中古マンション等` / `宅地(土地)` / `宅地(土地と建物)` の3種を実観測。`農地` / `林地` は仕様上の残り2種。
- マッピング定数の置き場所案: `lib/realEstate/propertyType.ts` 等 (実装フェーズで確定)。
- マッピング表にない `Type` 値が来た場合は取込を失敗させ、値域変化を検知する。

---

## 5. `price_category` の扱い

- API の `PriceCategory` は `不動産取引価格情報`(取引価格) と `成約価格情報`(成約価格) の2種。`priceClassification` パラメータ未指定だと両方が混在して返る。
- **集計軸に含める**。`market_stats` の PK / `raw` の置換単位の両方に `price_category` を入れる。
- 正規化値:

  | API `PriceCategory` | 正規化値 `price_category` | リクエスト `priceClassification` |
  |---|---|---|
  | `不動産取引価格情報` | `transaction` | `01` |
  | `成約価格情報` | `contract` | `02` |

- **検討事項 (未確定)**: 初期表示で
  - (A) `transaction`(取引価格)のみ表示し `contract` は当面非表示で蓄積だけ行う、か
  - (B) 取引価格 / 成約価格を UI 上で明示的に分けて両方見せる
  - 成約価格は2021年以降のみ・件数が少ない傾向 → 初期は (A) を推奨。DDLは両対応で設計済みなので方針変更時もスキーマ変更不要。

---

## 6. DDL案 (実行しない)

> 下記は `migrations/` に置く想定の SQL 案。**本計画段階では実行しない。**

### 6.1 `real_estate_transactions_raw`

```sql
CREATE TABLE IF NOT EXISTS real_estate_transactions_raw (
  id                  BIGSERIAL PRIMARY KEY,

  -- 接続キー
  municipality_code_6 TEXT        NOT NULL
                       REFERENCES municipalities(code) ON UPDATE CASCADE,
  jis_code            VARCHAR(5)
                       GENERATED ALWAYS AS (LEFT(municipality_code_6, 5)) STORED,

  -- 正規化済みの集計軸
  property_type       TEXT        NOT NULL,   -- land / land_and_building / used_condominium / farmland / forest
  price_category      TEXT        NOT NULL,   -- transaction / contract
  transaction_year    SMALLINT    NOT NULL,   -- Period から抽出 (例: 2024)
  transaction_quarter SMALLINT    NOT NULL,   -- Period から抽出 (1-4)

  -- API元項目 (XIT001 レスポンス) を TEXT 中心で無加工保持。欠損は空文字のまま。
  type_raw            TEXT,                   -- Type           取引の種類 (日本語原値)
  price_category_raw  TEXT,                   -- PriceCategory  価格情報区分 (日本語原値)
  region              TEXT,                   -- Region         地域分類
  prefecture          TEXT,                   -- Prefecture     都道府県名
  municipality        TEXT,                   -- Municipality   市区町村名
  district_name       TEXT,                   -- DistrictName   地区名
  district_code       TEXT,                   -- DistrictCode   地区コード (更新で変わり得る/一意キー不可)
  trade_price         TEXT,                   -- TradePrice     取引価格(総額)
  price_per_unit      TEXT,                   -- PricePerUnit   坪単価
  unit_price          TEXT,                   -- UnitPrice      ㎡単価
  area                TEXT,                   -- Area           面積(㎡)
  land_shape          TEXT,                   -- LandShape      土地の形状
  frontage            TEXT,                   -- Frontage       間口
  total_floor_area    TEXT,                   -- TotalFloorArea 延床面積(㎡)
  building_year       TEXT,                   -- BuildingYear   建築年 (和暦表記の文字列)
  structure           TEXT,                   -- Structure      建物構造
  floor_plan          TEXT,                   -- FloorPlan      間取り
  building_use        TEXT,                   -- Use            用途
  purpose             TEXT,                   -- Purpose        今後の利用目的
  direction           TEXT,                   -- Direction      前面道路の方位
  classification      TEXT,                   -- Classification 前面道路の種類
  breadth             TEXT,                   -- Breadth        前面道路幅員(m)
  city_planning       TEXT,                   -- CityPlanning   都市計画用途地域
  coverage_ratio      TEXT,                   -- CoverageRatio  建蔽率(%)
  floor_area_ratio    TEXT,                   -- FloorAreaRatio 容積率(%)
  period_raw          TEXT,                   -- Period         取引時点 (例: '2024年第1四半期')
  renovation          TEXT,                   -- Renovation     改装有無
  remarks             TEXT,                   -- Remarks        取引の事情等

  -- 原レスポンスとメタ情報
  raw_payload         JSONB       NOT NULL,   -- API応答1件分をそのまま保持
  source              TEXT        NOT NULL DEFAULT 'mlit_reinfolib',
  fetched_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_re_tx_raw_property_type
    CHECK (property_type IN ('land','land_and_building','used_condominium','farmland','forest')),
  CONSTRAINT chk_re_tx_raw_price_category
    CHECK (price_category IN ('transaction','contract')),
  CONSTRAINT chk_re_tx_raw_quarter
    CHECK (transaction_quarter BETWEEN 1 AND 4)
);

-- バッチ置換 (city × year × quarter × price_category) の DELETE 高速化
CREATE INDEX IF NOT EXISTS idx_re_tx_raw_batch
  ON real_estate_transactions_raw (jis_code, transaction_year, transaction_quarter, price_category);
-- 集計クエリ用
CREATE INDEX IF NOT EXISTS idx_re_tx_raw_muni6
  ON real_estate_transactions_raw (municipality_code_6, property_type, transaction_year, transaction_quarter);
-- JSONB 検索用
CREATE INDEX IF NOT EXISTS idx_re_tx_raw_payload_gin
  ON real_estate_transactions_raw USING GIN (raw_payload);
```

### 6.2 `real_estate_market_stats`

```sql
CREATE TABLE IF NOT EXISTS real_estate_market_stats (
  municipality_code_6  TEXT        NOT NULL
                        REFERENCES municipalities(code) ON UPDATE CASCADE,
  jis_code             VARCHAR(5)
                        GENERATED ALWAYS AS (LEFT(municipality_code_6, 5)) STORED,
  property_type        TEXT        NOT NULL,
  price_category       TEXT        NOT NULL,
  year                 SMALLINT    NOT NULL,
  quarter              SMALLINT    NOT NULL,

  -- 数値化済みの集計指標
  transaction_count    INTEGER     NOT NULL,
  median_price         BIGINT,                -- 円
  avg_price            BIGINT,                -- 円
  median_price_per_sqm NUMERIC(14,2),
  avg_price_per_sqm    NUMERIC(14,2),
  median_area_sqm      NUMERIC(12,2),
  is_low_sample        BOOLEAN     NOT NULL DEFAULT false,
  computed_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  PRIMARY KEY (municipality_code_6, property_type, year, quarter, price_category),

  CONSTRAINT chk_re_stats_property_type
    CHECK (property_type IN ('land','land_and_building','used_condominium','farmland','forest')),
  CONSTRAINT chk_re_stats_price_category
    CHECK (price_category IN ('transaction','contract')),
  CONSTRAINT chk_re_stats_quarter
    CHECK (quarter BETWEEN 1 AND 4)
);

-- 駅ページ JOIN (municipality_code_6) は PK 先頭列でカバー。以下は横断検索用。
CREATE INDEX IF NOT EXISTS idx_re_stats_period
  ON real_estate_market_stats (year DESC, quarter DESC);
CREATE INDEX IF NOT EXISTS idx_re_stats_property_type
  ON real_estate_market_stats (property_type, price_category);
CREATE INDEX IF NOT EXISTS idx_re_stats_jis_code
  ON real_estate_market_stats (jis_code);
```

### 6.3 DDL案の要点
- 行単位 UNIQUE は置かず、`raw` の重複防止はバッチ置換で担保 (`idx_re_tx_raw_batch` が DELETE を支える)。
- `jis_code` は両テーブルとも **生成列** (`LEFT(municipality_code_6,5)`) → 手動値ズレを構造的に排除。
- `property_type` / `price_category` / `quarter` は **CHECK 制約**で値域を固定。
- `market_stats` の PK に `quarter` と `price_category` を含め、四半期粒度・価格区分の両軸に対応。
- `raw` の API元項目は全て TEXT。数値化は `market_stats` 構築 SQL 側で実施。
- FK は `ON UPDATE CASCADE` のみ。`ON DELETE` は既定 (NO ACTION) — 市区町村削除は事実上発生しない。

---

## 7. まだ未確定の判断事項

| # | 事項 | 選択肢 / メモ |
|---|---|---|
| 1 | 初期表示で `contract`(成約価格) を出すか | §5 参照。初期は `transaction` のみ表示を推奨。DDLは両対応済み。 |
| 2 | `is_low_sample` の閾値 | 何件未満を「参考値」とするか (例: `transaction_count < 10`)。集計バッチ実装時に決定。 |
| 3 | 集計の中央値算出方法 | SQL `percentile_cont(0.5)` で算出する想定。極端値の除外 (上下数%トリム) を行うか。 |
| 4 | `building_year` の和暦パース | XIT001 は建築年を和暦文字列で返す。`market_stats` で西暦数値が必要なら変換ロジックを別途定義。今回のDDLでは raw に文字列保持のみ。 |
| 5 | `migrations/` の配置と実行方式 | 既存マイグレーションの命名・適用手段 (手動 / ツール) に合わせる。実行は別タスク。 |
| 6 | 集計バッチの起動方法 | Vercel Cron か手動スクリプトか。`real-estate-db-plan.md §3.4` の継続検討事項。 |
| 7 | リテンション方針 | `raw` の古い四半期データを保持し続けるか、アーカイブするか。当面は全保持想定。 |
| 8 | `price` 数値の桁 | `BIGINT` で十分 (取引総額は最大でも数百億円規模)。要件次第で再確認。 |
| 9 | `district_code` の利用可否 | 更新で変わり得るため一意キー・継続キーには使わない。地区名表示の補助のみ。 |

---

## 8. 今回適用しないこと (確認用)

- ❌ `real_estate_transactions_raw` / `real_estate_market_stats` の CREATE TABLE 実行
- ❌ ALTER TABLE / INSERT / UPDATE / DELETE
- ❌ API大量取得・ループ取得
- ❌ 駅ページ / 市区町村ページへの表示実装
- ❌ 既存ページ・既存テーブルの修正
- ✅ 本ファイル (DDL案 + レビュー) の作成のみ
