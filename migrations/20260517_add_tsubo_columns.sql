-- =============================================================================
-- Migration: 20260517_add_tsubo_columns
-- real_estate_market_stats に坪単価系・平均面積カラムを追加
--
-- 背景:
--   raw -> market_stats 集計フェーズで、㎡単価に加えて坪単価および平均面積を
--   保持する要件が判明。20260517_create_real_estate_tables.sql 時点の
--   real_estate_market_stats には対応カラムが無いため追加する。
--
-- 追加カラム (すべて NULL 許容 / 既存行なしのためデフォルト不要):
--   - median_price_per_tsubo : 坪単価の中央値
--   - avg_price_per_tsubo    : 坪単価の平均
--   - avg_area_sqm           : 面積(㎡)の平均  ※中央値 median_area_sqm は作成済み
--
-- 注意:
--   * 対象は real_estate_market_stats のみ。
--     既存テーブル (municipalities / stations / real_estate_transactions_raw) は変更しない。
--   * ADD COLUMN のみ。DROP / RENAME / 型変更・データ更新は行わない。
--   * 現時点で real_estate_market_stats は 0 行のため、テーブル書き換えは即時完了する。
-- =============================================================================

BEGIN;

ALTER TABLE real_estate_market_stats
  ADD COLUMN IF NOT EXISTS median_price_per_tsubo NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS avg_price_per_tsubo    NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS avg_area_sqm           NUMERIC(12,2);

COMMIT;

-- =============================================================================
-- ロールバック (手動実行用 / 本マイグレーションには含めない)
--   ALTER TABLE real_estate_market_stats
--     DROP COLUMN IF EXISTS median_price_per_tsubo,
--     DROP COLUMN IF EXISTS avg_price_per_tsubo,
--     DROP COLUMN IF EXISTS avg_area_sqm;
-- =============================================================================
