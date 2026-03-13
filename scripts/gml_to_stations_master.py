import json
import csv
from pykakasi import kakasi

INPUT = "data/UTF-8/N02-22_Station.geojson"
OUTPUT = "data/stations_master.csv"

kks = kakasi()
kks.setMode("H", "a")
kks.setMode("K", "a")
kks.setMode("J", "a")
conv = kks.getConverter()

def slugify(text):
    return conv.do(text).lower().replace(" ", "").replace("'", "").replace("　", "")

with open(INPUT, encoding="utf-8") as f:
    geo = json.load(f)

rows = []
seen = set()

for feature in geo["features"]:
    prop = feature.get("properties", {})
    geom = feature.get("geometry", {})

    station_name = prop.get("N02_005")
    line_name = prop.get("N02_003")
    operator_name = prop.get("N02_004")
    coords = geom.get("coordinates")

    if not station_name or not line_name or not operator_name or not coords:
        continue

    if isinstance(coords[0], list):
        lng = coords[0][0]
        lat = coords[0][1]
    else:
        lng = coords[0]
        lat = coords[1]

    station_slug = slugify(station_name)
    line_slug = slugify(line_name)
    operator_slug = slugify(operator_name)

    station_key = f"{operator_slug}_{line_slug}_{station_slug}"
    slug = f"{station_slug}-{line_slug}-{operator_slug}"

    if station_key in seen:
        continue
    seen.add(station_key)

    rows.append([
        station_key,
        station_name,
        line_name,
        operator_name,
        slug,
        lat,
        lng
    ])

with open(OUTPUT, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow([
        "station_key",
        "station_name",
        "line_name",
        "operator_name",
        "slug",
        "lat",
        "lng"
    ])
    writer.writerows(rows)

print("stations_master.csv created:", len(rows))