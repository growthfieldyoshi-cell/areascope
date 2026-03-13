#!/usr/bin/env python3
"""
stations_master.csv に prefecture を付与するスクリプト

【使い方】
  pip install geopandas pandas shapely

  python add_prefecture.py \
    --stations data/stations_master.csv \
    --prefectures data/prefectures.geojson \
    --out data/stations_master_with_prefecture.csv

【prefectures.geojson について】
  以下から取得できます（無償・商用可）:
  https://github.com/dataofjapan/land
  → japan.geojson をダウンロード（nam_ja プロパティに都道府県名が入っています）

  または国土数値情報「行政区域データ」:
  https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03-v3_1.html
  → ogr2ogr -f GeoJSON prefectures.geojson N03-22_GML/N03-22.xml

【prefectures.geojson のプロパティ候補】
  ソースによって都道府県名のプロパティキーが異なります。
  --pref-col オプションで指定してください（デフォルト: nam_ja）
  - dataofjapan/land     → nam_ja
  - 国土数値情報 N03     → N03_001
  - その他               → 実際のキーを確認して指定
"""

import argparse
import sys
from pathlib import Path

import pandas as pd

try:
    import geopandas as gpd
    from shapely.geometry import Point
except ImportError:
    print("ERROR: geopandas / shapely が必要です", file=sys.stderr)
    print("  pip install geopandas shapely", file=sys.stderr)
    sys.exit(1)


# ============================================================
# prefecture 列付与
# ============================================================

def add_prefecture(
    stations_csv: str,
    prefectures_geojson: str,
    output_csv: str,
    pref_col: str = "nam_ja",
) -> None:

    # --- 入力読み込み ---
    print(f"駅データ読み込み: {stations_csv}")
    stations_df = pd.read_csv(stations_csv, dtype=str)
    print(f"  {len(stations_df)} 件")

    required_cols = {"station_key", "lat", "lng"}
    missing = required_cols - set(stations_df.columns)
    if missing:
        print(f"ERROR: 必須列が見つかりません: {missing}", file=sys.stderr)
        sys.exit(1)

    print(f"都道府県ポリゴン読み込み: {prefectures_geojson}")
    pref_gdf = gpd.read_file(prefectures_geojson)
    print(f"  {len(pref_gdf)} フィーチャ, CRS: {pref_gdf.crs}")

    if pref_col not in pref_gdf.columns:
        print(f"ERROR: --pref-col '{pref_col}' が見つかりません", file=sys.stderr)
        print(f"  利用可能な列: {list(pref_gdf.columns)}", file=sys.stderr)
        sys.exit(1)

    # --- CRS を WGS84 に統一 ---
    if pref_gdf.crs is None or pref_gdf.crs.to_epsg() != 4326:
        print("  CRS を EPSG:4326 に変換")
        pref_gdf = pref_gdf.to_crs(epsg=4326)

    # --- 駅を GeoDataFrame に変換 ---
    print("Point ジオメトリを生成中...")
    valid_mask = stations_df["lat"].notna() & stations_df["lng"].notna()
    invalid_count = (~valid_mask).sum()
    if invalid_count > 0:
        print(f"  警告: lat/lng が欠損している駅: {invalid_count} 件 → prefecture=None")

    stations_df["lat_f"] = pd.to_numeric(stations_df["lat"], errors="coerce")
    stations_df["lng_f"] = pd.to_numeric(stations_df["lng"], errors="coerce")

    geometry = [
        Point(row.lng_f, row.lat_f) if pd.notna(row.lat_f) and pd.notna(row.lng_f) else None
        for row in stations_df.itertuples()
    ]
    stations_gdf = gpd.GeoDataFrame(stations_df, geometry=geometry, crs="EPSG:4326")

    # --- Spatial Join ---
    print("Spatial join 実行中...")
    pref_slim = pref_gdf[[pref_col, "geometry"]].rename(columns={pref_col: "prefecture"})

    joined = gpd.sjoin(
        stations_gdf,
        pref_slim,
        how="left",
        predicate="within",
    )

    # sjoin で重複が発生した場合は最初の1件を使用
    joined = joined[~joined.index.duplicated(keep="first")]

    # --- 結果整形 ---
    stations_df["prefecture"] = joined["prefecture"].values

    null_pref = stations_df["prefecture"].isna().sum()
    if null_pref > 0:
        print(f"  警告: どのポリゴンにも含まれなかった駅: {null_pref} 件")
        print("  (海上・国境付近の駅はポリゴン境界上に落ちることがあります)")
        print("  → 海上や県境付近の駅は手動補完が必要になる場合があります")

    # --- 列順を整えて出力 ---
    output_cols = [
        "station_key", "station_name", "line_name",
        "prefecture", "operator_name", "slug", "lat", "lng",
    ]
    # operator_name / slug が存在しない場合も安全に処理
    output_cols = [c for c in output_cols if c in stations_df.columns]

    # 上記以外の列があれば末尾に追加
    extra_cols = [c for c in stations_df.columns if c not in output_cols and c not in ("lat_f", "lng_f", "geometry")]
    final_cols = output_cols + extra_cols

    result_df = stations_df[final_cols]

    print(f"\n出力: {output_csv}")
    result_df.to_csv(output_csv, index=False, encoding="utf-8")
    print(f"✅ 完了: {len(result_df)} 件")
    print(f"  prefecture 付与済み: {result_df['prefecture'].notna().sum()} 件")
    print(f"  prefecture 未付与  : {result_df['prefecture'].isna().sum()} 件")
    print("\nサンプル (先頭3行):")
    print(result_df.head(3).to_string(index=False))


# ============================================================
# エントリポイント
# ============================================================

def main():
    parser = argparse.ArgumentParser(
        description="stations_master.csv に lat/lng → 都道府県 の spatial join で prefecture 列を追加"
    )
    parser.add_argument(
        "--stations",
        default="data/stations_master.csv",
        help="入力CSV (デフォルト: data/stations_master.csv)",
    )
    parser.add_argument(
        "--prefectures",
        default="data/prefectures.geojson",
        help="都道府県ポリゴンGeoJSON (デフォルト: data/prefectures.geojson)",
    )
    parser.add_argument(
        "--out",
        default="data/stations_master_with_prefecture.csv",
        help="出力CSV (デフォルト: data/stations_master_with_prefecture.csv)",
    )
    parser.add_argument(
        "--pref-col",
        default="nam_ja",
        help="GeoJSON内の都道府県名列名 (デフォルト: nam_ja / 国土数値情報なら N03_001)",
    )
    args = parser.parse_args()

    for path in [args.stations, args.prefectures]:
        if not Path(path).exists():
            print(f"ERROR: ファイルが見つかりません: {path}", file=sys.stderr)
            sys.exit(1)

    Path(args.out).parent.mkdir(parents=True, exist_ok=True)

    add_prefecture(
        stations_csv=args.stations,
        prefectures_geojson=args.prefectures,
        output_csv=args.out,
        pref_col=args.pref_col,
    )


if __name__ == "__main__":
    main()