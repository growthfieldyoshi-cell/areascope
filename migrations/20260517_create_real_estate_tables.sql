-- =============================================================================
-- Migration: 20260517_create_real_estate_tables
-- 不動産情報ライブラリAPI (XIT001) 連携テーブルの新規作成
--
-- 対象テーブル:
--   - real_estate_transactions_raw : API応答1件分の原データ (TEXT中心 + JSONB)
--   - real_estate_market_stats     : 表示・ランキング用の集計済みテーブル
--
-- 設計根拠: docs/real-estate-migration-plan.md / docs/real-estate-db-plan.md
--
-- 注意:
--   * 既存テーブル (municipalities / stations 等) は一切変更しない。
--   * API応答に行単位の一意IDが無いため UNIQUE 制約は置かず、
--     raw の重複防止は (jis_code, year, quarter, price_category) 単位の
--     バッチ置換 (DELETE -> INSERT) 運用で担保する。
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. real_estate_transactions_raw
--    XIT001 レスポンスの元項目を TEXT 中心で無加工保持する原データテーブル。
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS real_estate_transactions_raw (
  id                  BIGSERIAL PRIMARY KEY,

  -- 接続キー -------------------------------------------------------------------
  municipality_code_6 TEXT        NOT NULL
                       REFERENCES municipalities(code) ON UPDATE CASCADE,
  -- API再取得キー (5桁JIS)。municipality_code_6 から導出する生成列。
  jis_code            VARCHAR(5)
                       GENERATED ALWAYS AS (LEFT(municipality_code_6, 5)) STORED,

  -- 正規化済みの集計軸 ---------------------------------------------------------
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

  -- 原レスポンスとメタ情報 -----------------------------------------------------
  raw_payload         JSONB       NOT NULL,   -- API応答1件分をそのまま保持
  source              TEXT        NOT NULL DEFAULT 'mlit_reinfolib',
  fetched_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- 制約 -----------------------------------------------------------------------
  CONSTRAINT chk_re_tx_raw_muni6_format
    CHECK (municipality_code_6 ~ '^[0-9]{6}$'),
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

-- 集計クエリ (市区町村 × 物件種別 × 期間) 用
CREATE INDEX IF NOT EXISTS idx_re_tx_raw_muni6
  ON real_estate_transactions_raw (municipality_code_6, property_type, transaction_year, transaction_quarter);

-- JSONB 検索用
CREATE INDEX IF NOT EXISTS idx_re_tx_raw_payload_gin
  ON real_estate_transactions_raw USING GIN (raw_payload);


-- -----------------------------------------------------------------------------
-- 2. real_estate_market_stats
--    raw を集計し数値化済みの指標を保持する表示・ランキング用テーブル。
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS real_estate_market_stats (
  -- 接続キー -------------------------------------------------------------------
  municipality_code_6  TEXT        NOT NULL
                        REFERENCES municipalities(code) ON UPDATE CASCADE,
  -- API再取得キー (5桁JIS)。municipality_code_6 から導出する生成列。
  jis_code             VARCHAR(5)
                        GENERATED ALWAYS AS (LEFT(municipality_code_6, 5)) STORED,

  -- 集計軸 ---------------------------------------------------------------------
  property_type        TEXT        NOT NULL,
  price_category       TEXT        NOT NULL,
  year                 SMALLINT    NOT NULL,
  quarter              SMALLINT    NOT NULL,

  -- 数値化済みの集計指標 -------------------------------------------------------
  transaction_count    INTEGER     NOT NULL,
  median_price         BIGINT,                -- 円
  avg_price            BIGINT,                -- 円
  median_price_per_sqm NUMERIC(14,2),
  avg_price_per_sqm    NUMERIC(14,2),
  median_area_sqm      NUMERIC(12,2),
  is_low_sample        BOOLEAN     NOT NULL DEFAULT false,
  computed_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- 表示の最小単位をそのまま PK にする (UPSERT 容易)
  PRIMARY KEY (municipality_code_6, property_type, year, quarter, price_category),

  -- 制約 -----------------------------------------------------------------------
  CONSTRAINT chk_re_stats_muni6_format
    CHECK (municipality_code_6 ~ '^[0-9]{6}$'),
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

COMMIT;

-- =============================================================================
-- ロールバック (手動実行用 / 本マイグレーションには含めない)
--   DROP TABLE IF EXISTS real_estate_market_stats;
--   DROP TABLE IF EXISTS real_estate_transactions_raw;
-- =============================================================================
