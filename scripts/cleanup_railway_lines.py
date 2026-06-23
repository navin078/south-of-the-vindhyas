import json

INPUT_FILE = "railwaylines.geojson"
OUTPUT_FILE = "south-india-railways.geojson"


def is_outside_region(feature):
    geometry = feature.get("geometry")
    if not geometry:
        return False

    coords = geometry.get("coordinates")
    if not coords:
        return False

    geom_type = geometry.get("type")

    if geom_type == "LineString":
        points = coords

    elif geom_type == "MultiLineString":
        points = [p for line in coords for p in line]

    else:
        return False

    return any(lat > 24.5 for lon, lat in points)

def is_sri_lanka(feature):
	geometry = feature.get("geometry")
	if not geometry:
		return False

	coords = geometry.get("coordinates")
	if not coords:
    		return False

	geom_type = geometry.get("type")

	if geom_type == "MultiLineString":
    		points = [p for line in coords for p in line]
	elif geom_type == "LineString":
    		points = coords
	else:
    		return False

# Same logic as your JavaScript
# Delete if ANY coordinate is south of 9.8 AND east of 79.7
	return any(lat < 9.8 and lon > 79.7 for lon, lat in points)

with open(INPUT_FILE, "r", encoding="utf-8") as f:
	data = json.load(f)

before = len(data["features"])

data["features"] = [
feature
for feature in data["features"]
if not is_sri_lanka(feature)
and not is_outside_region(feature)
]

after = len(data["features"])

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
	json.dump(data, f)

print(f"Removed {before - after} features")
print(f"Remaining {after} features")
print(f"Wrote {OUTPUT_FILE}")

