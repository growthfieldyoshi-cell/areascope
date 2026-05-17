# AreaScope 現行DB仕様 (実DB基準)

不動産情報ライブラリAPI連携の設計用に、実DB (Neon PostgreSQL, `DATABASE_URL` 接続) のスキーマを基準として記録する。
**`schema_v2.sql` の記述とは乖離があるため、本書を正とする。**

接続: `lib/db.ts` → `@neondatabase/serverless` → `process.env.DATABASE_URL`
確認日: 2026-05-08

---

## 1. 既存テーブル一覧 (public)

不動産連携で参照する主要3テーブル + 隣接テーブル:

| テーブル | 用途 | 行数 |
|---|---|---|
| `prefectures` | 都道府県マスタ (`prefecture_slug` の唯一の正本) | 47 |
| `municipalities` | 市区町村マスタ | 1,741 |
| `stations` | 駅マスタ | 10,141 |
| `municipality_populations` | 市区町村×年の人口 (`municipality_code` = 5桁JIS) | - |
| `station_municipality` | 駅×市区町村の多対多 (`municipality_code` = 5桁JIS) | - |

その他: `lines`, `display_lines`, `display_line_members`, `populations`, `station_passengers`, `station_reading_overrides`, `stations_master`, `stations_v2`, `municipality_populations_backup`, `municipality_populations_old`。

---

## 2. `prefectures` 実カラム

| カラム | 型 | 備考 |
|---|---|---|
| `prefecture_code` | text | **PK**, 2桁 (`'01'`〜`'47'`) |
| `prefecture_name` | text | NOT NULL (例: `北海道`) |
| `prefecture_slug` | text | UNIQUE NOT NULL (例: `hokkaido`) |
| `region_name` | text | |
| `station_count` | integer | default 0 |
| `municipality_count` | integer | default 0 |
| `created_at` / `updated_at` | timestamptz | |

---

## 3. `municipalities` 実カラム

| カラム | 型 | 備考 |
|---|---|---|
| `code` | text | **PK**, **6桁** (例: `131067`) |
| `prefecture` | text | NOT NULL (例: `東京都`) ※`prefecture_name` ではない |
| `municipality` | text | NOT NULL (例: `台東区`) ※`municipality_name` ではない |
| `prefecture_kana` | text | |
| `municipality_kana` | text | |
| `code5` | text | |
| `jis_code` | varchar(5) | **UNIQUE**, 生成列 `LEFT(code, 5)` (5桁JIS) |
| `municipality_name_hiragana` | text | |
| `municipality_name_katakana` | text | |
| `municipality_name_initial_kana` | text | |
| `url_slug` | text | **現状 1,741件すべて空** (`stations.municipality_slug` 側に slug は存在) |
| `is_public` | boolean | NOT NULL default true |
| `is_indexable` | boolean | NOT NULL default true |

被参照FK:
- `stations.municipality_code_normalized` → `municipalities.code`
- `station_municipality.municipality_code` → `municipalities.jis_code`

`schema_v2.sql` で記載されている `municipality_code` / `municipality_name` / `municipality_slug` / `prefecture_name` / `prefecture_slug` / `city_type` / `population_latest` は **実DBには存在しない**。

---

## 4. `stations` 実カラム (主要のみ)

| カラム | 型 | 備考 |
|---|---|---|
| `station_key` | text | **PK** |
| `slug` | text | UNIQUE NOT NULL |
| `station_name` / `_kana` / `_hiragana` / `_katakana` / `_initial_kana` | text | |
| `line_key` / `line_name` / `line_slug` | text | |
| `prefecture_name` / `prefecture_slug` | text | 非正規化 (10,141件中NULL 0件) |
| `municipality_name` / `municipality_slug` | text | 非正規化 (10,141件中NULL 0件) |
| `municipality_code` | text | **5桁** 生コード (例: `13106`) |
| `municipality_code_normalized` | text | **6桁** (例: `131067`)、**FK → municipalities.code** |
| `municipality_id` | integer | |
| `station_group_key` / `station_group_slug` / `station_group_name` | text | |
| `lat` / `lng` | numeric(10,6) | |
| `data_status` | text | `'active' / 'closed' / 'planned'` |
| `is_public` / `is_indexable` | boolean | |
| `url_slug` | text | |

JOINに使う重要点:
- 5桁JISが必要なAPI ←→ `stations.municipality_code` または `municipalities.jis_code`
- `municipalities` への100%整合JOIN ←→ `stations.municipality_code_normalized = municipalities.code`

---

## 5. JOIN 接続マトリクス (実測値)

| 用途 | JOIN条件 | マッチ件数 |
|---|---|---|
| 駅 → 市区町村 (推奨) | `stations.municipality_code_normalized = municipalities.code` | **10,141 / 10,141 (100%)** |
| 駅 → 市区町村 (5桁経由) | `stations.municipality_code = municipalities.jis_code` | 8,295 / 10,141 |
| 駅 → 市区町村 (6桁同士、桁ズレ) | `stations.municipality_code = municipalities.code` | **0 / 10,141** ← 使ってはいけない |
| 市区町村 → 都道府県 | `LEFT(municipalities.code, 2) = prefectures.prefecture_code` | 1,741 / 1,741 (100%) |

---

## 6. 不動産情報ライブラリAPI連携で使うキー

採用方針 (今回確定):

- **APIへ渡す側のキー = 5桁JIS = `jis_code`**
  - `stations.municipality_code` または `municipalities.jis_code`
- **AreaScope内JOIN用 = 6桁 = `municipality_code_6`**
  - 値は `municipalities.code` と一致させ、駅側からは `stations.municipality_code_normalized` 経由で結合する
- **既存テーブル (`municipalities` / `stations`) のカラム名変更・データ更新は行わない**
- **`prefecture_slug` の正本は `prefectures.prefecture_slug` のみ** (`municipalities` には無い)

URL組み立てに必要な slug:
- `prefecture_slug`: `prefectures` から取得
- `municipality_slug`: `stations.municipality_slug` を当面使用 (`municipalities.url_slug` は全件空のため利用不可)
- `station_group_slug`: `stations.station_group_slug` をそのまま使用

---

## 7. 駅 → 不動産集計の参照クエリ (設計案)

不動産DB側の `real_estate_market_stats` を駅ページで参照する想定:

```sql
SELECT
  s.station_group_slug,
  s.station_name,
  s.prefecture_slug,
  s.municipality_slug,
  s.municipality_code             AS jis_code,                 -- 5桁
  s.municipality_code_normalized  AS municipality_code_6,      -- 6桁
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

## 8. 不動産DBテーブル CREATE TABLE 案 レビュー

> 本セクションはレビューのみ。マイグレーションは別途実施予定。

### 8.1 `real_estate_transactions_raw` 提案

```sql
CREATE TABLE IF NOT EXISTS real_estate_transactions_raw (
  id                  BIGSERIAL PRIMARY KEY,
  jis_code            VARCHAR(5)  NOT NULL,
  municipality_code_6 TEXT        NOT NULL
                       REFERENCES municipalities(code) ON UPDATE CASCADE,
  property_type       TEXT        NOT NULL,    -- 例: 'land' / 'house' / 'condo' / 'forest' 等 API仕様に合わせる
  transaction_period  TEXT        NOT NULL,    -- 例: '2024Q3' API側の期間粒度に従う
  transaction_year    SMALLINT,                -- 集計用に冗長保持
  transaction_quarter SMALLINT,                -- 同上 (1-4)
  price               BIGINT,                  -- 円
  area_sqm            NUMERIC(12,2),
  price_per_sqm       NUMERIC(14,2),
  raw_payload         JSONB        NOT NULL,   -- API元レスポンス1件分
  source              TEXT         NOT NULL DEFAULT 'mlit_real_estate_lib',
  fetched_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_re_tx_raw_jis_code
  ON real_estate_transactions_raw (jis_code);
CREATE INDEX IF NOT EXISTS idx_re_tx_raw_muni6
  ON real_estate_transactions_raw (municipality_code_6);
CREATE INDEX IF NOT EXISTS idx_re_tx_raw_period
  ON real_estate_transactions_raw (transaction_year, transaction_quarter);
CREATE INDEX IF NOT EXISTS idx_re_tx_raw_payload_gin
  ON real_estate_transactions_raw USING GIN (raw_payload);
```

レビューコメント:
- ✅ `jis_code` を `VARCHAR(5)` にして `municipalities.jis_code` (varchar(5)) と型一致。
- ✅ `municipality_code_6` を `TEXT` で `municipalities.code` と型一致 → FK可能。
- ⚠️ APIキー未着のため `property_type` の正規化値はAPI仕様確認後に CHECK制約追加を検討。
- ⚠️ 重複取り込み防止が必要なら、API側のレスポンスに一意IDがあるか確認後 `UNIQUE (source, external_id)` カラムを追加するのが望ましい。今回は `BIGSERIAL` でブランクから入れる前提。
- ⚠️ FK `ON UPDATE CASCADE` はあっても `ON DELETE` は明示せず実DB既定 (NO ACTION) でOK。市区町村が消えるケースは事実上ない。
- ❓ `transaction_period` (TEXT) と `transaction_year`/`transaction_quarter` の二重持ちは集計クエリで便利だが冗長。API応答の粒度確定後に片方へ寄せる選択肢あり。

### 8.2 `real_estate_market_stats` 提案

```sql
CREATE TABLE IF NOT EXISTS real_estate_market_stats (
  jis_code             VARCHAR(5)  NOT NULL,
  municipality_code_6  TEXT        NOT NULL
                        REFERENCES municipalities(code) ON UPDATE CASCADE,
  property_type        TEXT        NOT NULL,
  year                 SMALLINT    NOT NULL,
  transaction_count    INTEGER     NOT NULL,
  median_price         BIGINT,
  avg_price            BIGINT,
  median_price_per_sqm NUMERIC(14,2),
  avg_price_per_sqm    NUMERIC(14,2),
  is_low_sample        BOOLEAN     NOT NULL DEFAULT false,
  computed_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (municipality_code_6, property_type, year)
);

CREATE INDEX IF NOT EXISTS idx_re_stats_jis_code
  ON real_estate_market_stats (jis_code);
CREATE INDEX IF NOT EXISTS idx_re_stats_year
  ON real_estate_market_stats (year);
CREATE INDEX IF NOT EXISTS idx_re_stats_property_type
  ON real_estate_market_stats (property_type);
```

レビューコメント:
- ✅ 駅ページからのJOINキー (`municipality_code_6 = stations.municipality_code_normalized`) と整合。
- ✅ 表示単位 (市区町村×物件種別×年) を PK に採用しているので UPSERT 容易。
- ✅ `is_low_sample` を持つことで、サンプル少のとき UI 側で「参考値」表記に切替可能。
- ⚠️ `property_type` の値域は API 仕様確定後に `CHECK (property_type IN (...))` か `ENUM` 型で固める。
- ⚠️ `jis_code` は導出可能 (`LEFT(municipality_code_6, 5)`) だが、API再呼び出し時のキーとして冗長保持する方針なら現状でOK。気になるなら `GENERATED ALWAYS AS (LEFT(municipality_code_6, 5)) STORED` にすれば不整合の余地が消える。
- ❓ 集計対象期間 (年だけ / 年Q別) は API 粒度で再検討。`year` のみだと四半期の鮮度感が出ない。
- ❓ `currency` を持つかは要件次第 (国交省ライブラリは円のみなので不要の判断もあり)。

---

## 9. 今回適用しないこと (確認用)

- ❌ `municipalities` / `stations` のカラム名変更
- ❌ `municipalities.url_slug` への slug 投入
- ❌ `real_estate_*` テーブルの CREATE / ALTER / INSERT / UPDATE / DELETE
- ✅ ドキュメント整備のみ (本ファイル)
- ✅ SELECT による構造・整合性確認のみ実施済み
