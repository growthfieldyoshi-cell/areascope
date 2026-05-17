# 不動産取引価格 2024年通年集計テーブル設計案 (DDLレビュー)

作成: 2026-05-17
ステータス: **DDL案レビュー段階 / DB変更未実施**

関連:
- [real-estate-migration-plan.md](./real-estate-migration-plan.md) — quarterly テーブル(`real_estate_market_stats`)の設計
- [real-estate-db-plan.md](./real-estate-db-plan.md) — 全体方針と API実応答確認結果
- [../README_DB_CURRENT.md](../README_DB_CURRENT.md) — 実DB構造の正本

> 本ファイルは **DDL案の作成とレビューのみ**。CREATE / ALTER / INSERT / UPDATE / DELETE およびマイグレーションSQLファイル作成は行わない。

---

## 1. 背景と目的

- 神奈川県6市について 2024年 Q1〜Q4 の raw投入・四半期集計(`real_estate_market_stats`)が完了済み。
- 市区町村ページは現在 `real_estate_market_stats` の **最新 quarter** を表示しているが、四半期単体は件数のブレ・季節性が出やすく、ページ表示としては **年間通年集計の方が安定**。
- そこで、**2024年通年の集計を保持する `real_estate_market_stats_annual`** を新設する。
- 本フェーズはDDL案の確定まで。マイグレーション・集計実装・ページ改修は後続。

---

## 2. annualテーブル設計案

テーブル名: **`real_estate_market_stats_annual`**

| カラム | 型 | 備考 |
|---|---|---|
| `municipality_code_6` | `TEXT` NOT NULL | FK → `municipalities(code)` |
| `jis_code` | `VARCHAR(5)` 生成列 | `GENERATED ALWAYS AS (LEFT(municipality_code_6,5)) STORED` |
| `property_type` | `TEXT` NOT NULL | land / land_and_building / used_condominium / farmland / forest |
| `year` | `SMALLINT` NOT NULL | 集計対象年 (例: 2024) |
| `price_category` | `TEXT` NOT NULL | transaction / contract |
| `transaction_count` | `INTEGER` NOT NULL | 年間取引件数 (全四半期合算) |
| `median_price` | `BIGINT` | 年間全件からの中央値 (円) |
| `avg_price` | `BIGINT` | 年間全件の平均 (円) |
| `median_price_per_sqm` | `NUMERIC(14,2)` | ㎡単価の中央値 |
| `avg_price_per_sqm` | `NUMERIC(14,2)` | ㎡単価の平均 |
| `median_price_per_tsubo` | `NUMERIC(14,2)` | 坪単価の中央値 |
| `avg_price_per_tsubo` | `NUMERIC(14,2)` | 坪単価の平均 |
| `median_area_sqm` | `NUMERIC(12,2)` | 面積の中央値 |
| `avg_area_sqm` | `NUMERIC(12,2)` | 面積の平均 |
| `is_low_sample` | `BOOLEAN` NOT NULL DEFAULT false | サンプル少なら true |
| `created_at` | `TIMESTAMPTZ` NOT NULL DEFAULT now() | 行作成時刻 |
| `updated_at` | `TIMESTAMPTZ` NOT NULL DEFAULT now() | 再集計UPSERT時に now() で更新 |

**主キー**: `(municipality_code_6, property_type, year, price_category)`
**FK**: `municipality_code_6 → municipalities(code) ON UPDATE CASCADE`

---

## 3. DDL案 (実行しない)

```sql
CREATE TABLE IF NOT EXISTS real_estate_market_stats_annual (
  municipality_code_6    TEXT        NOT NULL
                          REFERENCES municipalities(code) ON UPDATE CASCADE,
  jis_code               VARCHAR(5)
                          GENERATED ALWAYS AS (LEFT(municipality_code_6, 5)) STORED,
  property_type          TEXT        NOT NULL,
  year                   SMALLINT    NOT NULL,
  price_category         TEXT        NOT NULL,

  transaction_count      INTEGER     NOT NULL,
  median_price           BIGINT,
  avg_price              BIGINT,
  median_price_per_sqm   NUMERIC(14,2),
  avg_price_per_sqm      NUMERIC(14,2),
  median_price_per_tsubo NUMERIC(14,2),
  avg_price_per_tsubo    NUMERIC(14,2),
  median_area_sqm        NUMERIC(12,2),
  avg_area_sqm           NUMERIC(12,2),
  is_low_sample          BOOLEAN     NOT NULL DEFAULT false,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),

  PRIMARY KEY (municipality_code_6, property_type, year, price_category),

  CONSTRAINT chk_re_annual_muni6_format
    CHECK (municipality_code_6 ~ '^[0-9]{6}$'),
  CONSTRAINT chk_re_annual_property_type
    CHECK (property_type IN ('land','land_and_building','used_condominium','farmland','forest')),
  CONSTRAINT chk_re_annual_price_category
    CHECK (price_category IN ('transaction','contract')),
  CONSTRAINT chk_re_annual_year
    CHECK (year >= 2000 AND year <= 2100)
);

-- 横断検索用 (municipality_code_6 検索は PK 先頭列でカバー)
CREATE INDEX IF NOT EXISTS idx_re_annual_year
  ON real_estate_market_stats_annual (year);
CREATE INDEX IF NOT EXISTS idx_re_annual_property_type
  ON real_estate_market_stats_annual (property_type, price_category);
CREATE INDEX IF NOT EXISTS idx_re_annual_jis_code
  ON real_estate_market_stats_annual (jis_code);
```

### 3.1 DDL案の要点
- PKは `(municipality_code_6, property_type, year, price_category)` — **`quarter` を持たない**のが quarterly テーブルとの最大の違い。UPSERT (`ON CONFLICT ... DO UPDATE`) で再集計を反映。
- `jis_code` は `LEFT(municipality_code_6,5)` の **生成列** — quarterly テーブルと同方針で手動値ズレを排除。
- `municipality_code_6` / `property_type` / `price_category` / `year` を **CHECK制約**で値域固定。`year` は `2000〜2100` の軽い健全性チェック。
- FK は `municipality_code_6 → municipalities(code)`。`ON UPDATE CASCADE` のみ(`ON DELETE` は既定 NO ACTION)。
- 時刻カラムは quarterly の `computed_at` 1本ではなく **`created_at` / `updated_at` の2本**。`created_at` は初回INSERT時のみ、`updated_at` は再集計UPSERTのたびに `now()` で更新する想定。
- 数値型は quarterly テーブルと完全に揃える(`BIGINT` 円 / `NUMERIC(14,2)` 単価 / `NUMERIC(12,2)` 面積)。

---

## 4. quarterly stats との違い

| 観点 | `real_estate_market_stats` (quarterly) | `real_estate_market_stats_annual` (本案) |
|---|---|---|
| 集計単位 | 市区町村 × 種別 × 年 × **四半期** × 価格区分 | 市区町村 × 種別 × **年** × 価格区分 |
| PK | `(..., year, quarter, price_category)` | `(..., year, price_category)` — quarter なし |
| `quarter` カラム | あり | **なし** |
| 時刻カラム | `computed_at` | `created_at` + `updated_at` |
| 集計元 | raw の 1四半期分 | raw の **年間全四半期分** |
| 用途 | 鮮度・四半期推移の確認 | 市区町村ページの安定表示 (主) |
| `transaction_count` | 1四半期の件数 (数十件規模) | 1年間の件数 (おおむね4倍規模) |

---

## 5. 年間集計ロジック案

**重要方針**: annual の中央値は **四半期中央値の平均ではなく、rawの年間全件から中央値を再計算**する。

理由:
- 「中央値の平均」は統計的に正しい年間中央値にならない(四半期ごとに件数・分布が異なるため)。
- raw (`real_estate_transactions_raw`) には2024年Q1〜Q4の全取引が保持済みなので、年間全件をまとめて `percentile_cont(0.5)` で1回算出するのが正確。

集計SQL案(quarterly集計の `WHERE`/`GROUP BY` から `quarter` を外した形):

```sql
WITH src AS (
  SELECT
    municipality_code_6, property_type,
    transaction_year AS year, price_category,
    CASE WHEN trade_price    ~ '^[0-9]+(\.[0-9]+)?$' THEN trade_price::numeric    END AS price_n,
    CASE WHEN unit_price     ~ '^[0-9]+(\.[0-9]+)?$' THEN unit_price::numeric     END AS unit_n,
    CASE WHEN price_per_unit ~ '^[0-9]+(\.[0-9]+)?$' THEN price_per_unit::numeric END AS ppu_n,
    CASE WHEN area           ~ '^[0-9]+(\.[0-9]+)?$' THEN area::numeric           END AS area_n
  FROM real_estate_transactions_raw
  WHERE municipality_code_6 = $1 AND transaction_year = $2   -- quarter で絞らない = 年間全件
),
calc AS (
  SELECT src.*,
    COALESCE(ppu_n, CASE WHEN unit_n IS NOT NULL THEN round(unit_n * 3.305785, 2) END) AS tsubo_n
  FROM src
)
SELECT
  municipality_code_6, property_type, year, price_category,
  COUNT(*)::int AS transaction_count,
  round(percentile_cont(0.5) WITHIN GROUP (ORDER BY price_n)::numeric)::bigint  AS median_price,
  round(avg(price_n))::bigint                                                  AS avg_price,
  round(percentile_cont(0.5) WITHIN GROUP (ORDER BY unit_n)::numeric, 2)        AS median_price_per_sqm,
  round(avg(unit_n), 2)                                                        AS avg_price_per_sqm,
  round(percentile_cont(0.5) WITHIN GROUP (ORDER BY tsubo_n)::numeric, 2)       AS median_price_per_tsubo,
  round(avg(tsubo_n), 2)                                                       AS avg_price_per_tsubo,
  round(percentile_cont(0.5) WITHIN GROUP (ORDER BY area_n)::numeric, 2)        AS median_area_sqm,
  round(avg(area_n), 2)                                                        AS avg_area_sqm,
  (COUNT(*) < 10) AS is_low_sample                                             -- 閾値は §7 で要確定
FROM calc
GROUP BY municipality_code_6, property_type, year, price_category
```

- TEXTのraw値は正規表現 `^[0-9]+(\.[0-9]+)?$` で数値判定し、空文字・非数値は NULL 化(quarterly と同一ロジック)。
- 坪単価は `price_per_unit` を優先、空で `unit_price` が数値なら `unit_price × 3.305785` で補完(quarterly と同一)。
- `percentile_cont` は double precision を返すため `::numeric` キャストを挟む(quarterly で確認済みの注意点)。
- このSELECTを `INSERT ... ON CONFLICT (municipality_code_6, property_type, year, price_category) DO UPDATE SET ..., updated_at = now()` で UPSERT する。

---

## 6. 市区町村ページ表示方針 (将来実装、今回は変更しない)

優先順位:
1. **annual データがあれば annual を表示**(`real_estate_market_stats_annual`、`price_category = 'transaction'`)
2. annual が無ければ **最新 quarter を表示**(現行どおり `real_estate_market_stats` の最新 year/quarter)
3. どちらも無ければ **不動産セクションを非表示**(現行の挙動を維持)

実装メモ(後続フェーズ用):
- 表示コンポーネント `RealEstateSection` は現状 quarterly 行を受け取る。annual 対応時は「集計種別(annual/quarterly)」と期間ラベル(「2024年通年」/「2024年第4四半期」)を渡せるよう拡張が必要。
- 1・2 を1クエリで解決するなら、annual を優先する `COALESCE` 的なクエリ、または annual を先に引いて空なら quarterly を引く2段構成。
- **本フェーズではページ・コンポーネントは一切変更しない。**

---

## 7. 未確定事項・注意点

| # | 事項 | メモ |
|---|---|---|
| 1 | `is_low_sample` の年間閾値 | quarterly は `count < 10`。年間は件数が約4倍になるため、同じ10では大半が false になる。年間用に閾値を引き上げる(例: `< 20` 〜 `< 30`)か、quarterly と揃えるか要確定 |
| 2 | `updated_at` の更新手段 | UPSERT の `DO UPDATE SET ... updated_at = now()` で明示更新する想定。トリガーは設けない(集計バッチが単一の書き込み経路のため) |
| 3 | 対象年の範囲 | 現状 raw は2024年のみ。annual も当面2024年の1行/グループ。複数年蓄積時も `year` がPKに含まれるため設計変更不要 |
| 4 | quarterly テーブルとの併存 | annual は quarterly を置換せず**併存**。quarterly は四半期推移の分析用に残す |
| 5 | 集計対象 raw の完全性 | annual 集計は「その年のQ1〜Q4 raw がすべて投入済み」が前提。一部四半期欠損のまま集計すると過少な年間値になる。集計実行前に四半期の揃いを確認する運用が必要 |
| 6 | `forest` / `farmland` の少数サンプル | 年間でも件数が少なく(6市2024で forest 12件 / farmland 25件)、`is_low_sample=true` になりやすい。ページ表示で「参考値」表記の前提を維持 |
| 7 | 政令市区 | 本テーブルも `municipality_code_6 → municipalities(code)` FK のため、区が `municipalities` に無い限り区データは保持不可。政令市区対応は別フェーズ(quarterly と同じ制約) |
| 8 | マイグレーション化 | 本DDL案の確定後、`migrations/` に `..._create_real_estate_annual.sql` を作成 → レビュー → 適用、の順で別フェーズ実施 |

---

## 8. 今回適用しないこと (確認用)

- ❌ `real_estate_market_stats_annual` の CREATE TABLE / マイグレーションSQLファイル作成
- ❌ ALTER / INSERT / UPDATE / DELETE
- ❌ API追加取得・集計実行
- ❌ 市区町村ページ・`RealEstateSection` の変更
- ✅ 本ファイル (DDL案 + レビュー) の作成のみ
