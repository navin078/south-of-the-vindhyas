import json

INPUT_FILE = "railwaystations.geojson"
OUTPUT_FILE = "south-india-railwaystations.geojson"

def is_sri_lanka_station(feature):
    lon, lat = feature["geometry"]["coordinates"]
    return lat < 9.8 and lon > 79.7

def is_outside_region(feature):
    lon, lat = feature["geometry"]["coordinates"]
    return lat > 24.5

with open(INPUT_FILE, "r", encoding="utf-8") as f:
	data = json.load(f)

before = len(data["features"])

data["features"] = [
feature
for feature in data["features"]
if not is_sri_lanka_station(feature)
and not is_outside_region(feature)
]

after = len(data["features"])

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
	json.dump(data, f)

print(f"Removed {before - after} features")
print(f"Remaining {after} features")
print(f"Wrote {OUTPUT_FILE}")

