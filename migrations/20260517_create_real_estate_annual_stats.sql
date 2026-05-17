-- =============================================================================
-- Migration: 20260517_create_real_estate_annual_stats
-- 不動産取引価格 年間通年集計テーブルの新規作成
--
-- 対象テーブル:
--   - real_estate_market_stats_annual : 市区町村 × 物件種別 × 年 × 価格区分 の通年集計
--
-- 設計根拠: docs/real-estate-annual-stats-plan.md
--
-- 注意:
--   * 既存テーブル (municipalities / stations / real_estate_transactions_raw /
--     real_estate_market_stats) は一切変更しない。
--   * annual は quarterly テーブル real_estate_market_stats を置換せず併存する。
--   * 年間中央値は「四半期中央値の平均」ではなく raw の年間全件から再計算する想定
--     (集計ロジックは別フェーズ。本ファイルはテーブル定義のみ)。
-- =============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS real_estate_market_stats_annual (
  -- 接続キー -------------------------------------------------------------------
  municipality_code_6    TEXT        NOT NULL
                          REFERENCES municipalities(code) ON UPDATE CASCADE,
  -- API再取得キー (5桁JIS)。municipality_code_6 から導出する生成列。
  jis_code               VARCHAR(5)
                          GENERATED ALWAYS AS (LEFT(municipality_code_6, 5)) STORED,

  -- 集計軸 ---------------------------------------------------------------------
  property_type          TEXT        NOT NULL,
  year                   INTEGER     NOT NULL,
  price_category         TEXT        NOT NULL,

  -- 数値化済みの集計指標 (年間全件から算出) -----------------------------------
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

  -- 時刻 -----------------------------------------------------------------------
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),

  -- 通年集計の最小単位をそのまま PK にする (UPSERT 容易)
  PRIMARY KEY (municipality_code_6, property_type, year, price_category),

  -- 制約 -----------------------------------------------------------------------
  CONSTRAINT chk_re_annual_muni6_format
    CHECK (municipality_code_6 ~ '^[0-9]{6}$'),
  CONSTRAINT chk_re_annual_property_type
    CHECK (property_type IN ('land','land_and_building','used_condominium','farmland','forest')),
  CONSTRAINT chk_re_annual_price_category
    CHECK (price_category IN ('transaction','contract')),
  CONSTRAINT chk_re_annual_year
    CHECK (year >= 2000 AND year <= 2100)
);

-- 横断検索用 (municipality_code_6 検索は PK 先頭列でカバーされるため専用INDEX不要)
CREATE INDEX IF NOT EXISTS idx_re_annual_year
  ON real_estate_market_stats_annual (year);

CREATE INDEX IF NOT EXISTS idx_re_annual_property_type
  ON real_estate_market_stats_annual (property_type, price_category);

CREATE INDEX IF NOT EXISTS idx_re_annual_jis_code
  ON real_estate_market_stats_annual (jis_code);

COMMIT;

-- =============================================================================
-- ロールバック (手動実行用 / 本マイグレーションには含めない)
--   DROP TABLE IF EXISTS real_estate_market_stats_annual;
-- =============================================================================
