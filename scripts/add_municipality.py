# -*- coding: utf-8 -*-
#!/usr/bin/env python3

import pandas as pd
import geopandas as gpd
from shapely.geometry import Point

STATIONS_CSV = "data/stations_master.csv"
MUNICIPALITIES_GEOJSON = "data/municipalities/N03-23_230101.geojson"
OUTPUT_CSV = "data/stations_master_with_municipality.csv"

print("stations load")
stations_df = pd.read_csv(STATIONS_CSV, dtype=str)

print("municipalities load")
muni_gdf = gpd.read_file(MUNICIPALITIES_GEOJSON)

if muni_gdf.crs is None or muni_gdf.crs.to_epsg() != 4326:
    muni_gdf = muni_gdf.to_crs(epsg=4326)

stations_df["lat"] = pd.to_numeric(stations_df["lat"], errors="coerce")
stations_df["lng"] = pd.to_numeric(stations_df["lng"], errors="coerce")

geometry = [
    Point(lng, lat) if pd.notna(lat) and pd.notna(lng) else None
    for lat, lng in zip(stations_df["lat"], stations_df["lng"])
]

stations_gdf = gpd.GeoDataFrame(
    stations_df,
    geometry=geometry,
    crs="EPSG:4326"
)

muni_slim = muni_gdf[["N03_001", "N03_003", "N03_004", "N03_007", "geometry"]].copy()

def normalize(row):
    pref = "" if pd.isna(row["N03_001"]) else str(row["N03_001"])
    city = "" if pd.isna(row["N03_003"]) else str(row["N03_003"])
    ward = "" if pd.isna(row["N03_004"]) else str(row["N03_004"])

    # 東京23区は区をそのまま使う
    if pref == "東京都" and ward.endswith("区"):
        return ward

    # 政令指定都市の区は市に寄せる
    if city.endswith("市") and ward.endswith("区"):
        return city

    return ward

muni_slim["prefecture"] = muni_slim["N03_001"].astype(str)
muni_slim["municipality"] = muni_slim.apply(normalize, axis=1)
muni_slim["municipality_code"] = muni_slim["N03_007"].astype(str)

muni_slim = muni_slim[["prefecture", "municipality", "municipality_code", "geometry"]]

print("spatial join")

joined = gpd.sjoin(
    stations_gdf,
    muni_slim,
    how="left",
    predicate="within"
)

joined = joined[~joined.index.duplicated(keep="first")]

stations_df["prefecture"] = joined["prefecture"].values
stations_df["municipality"] = joined["municipality"].values
stations_df["municipality_code"] = joined["municipality_code"].values

print("export csv")

cols = [
    "station_key",
    "station_name",
    "line_name",
    "prefecture",
    "municipality",
    "municipality_code",
    "operator_name",
    "slug",
    "lat",
    "lng"
]

result_df = stations_df[cols]

result_df.to_csv(OUTPUT_CSV, index=False, encoding="utf-8")

print("complete")
print("total:", len(result_df))
print("municipality filled:", result_df["municipality"].notna().sum())
print("municipality empty:", result_df["municipality"].isna().sum())