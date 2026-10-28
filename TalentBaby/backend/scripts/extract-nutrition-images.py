from __future__ import annotations

import json
import re
import subprocess
from difflib import SequenceMatcher
from pathlib import Path
from statistics import median

import easyocr
from PIL import Image


BACKEND_ROOT = Path(__file__).resolve().parents[1]
PROJECT_ROOT = BACKEND_ROOT.parent
UI_ROOT = PROJECT_ROOT / "ui" / "babyG" / "nutritions"
PUBLIC_ROOT = BACKEND_ROOT / "public" / "images" / "nutrition"
RECIPE_DIR = PUBLIC_ROOT / "recipes"
MATERIAL_DIR = PUBLIC_ROOT / "materials"
OUTPUT_SQL = BACKEND_ROOT / "database" / "migrations" / "032_set_nutrition_image_urls.sql"

RECIPE_SOURCE_NAMES = {"List", "Breakfast", "Lunch", "Dinner", "Snack", "Snacks", "Lunch-Dinner"}
AGE_GROUP_RE = re.compile(r"^(0-6|7-11|12-17|18-24|25-30|31-36)$")


def slug(value: str) -> str:
    value = value.lower().replace("&", " and ")
    value = re.sub(r"[^a-z0-9]+", "-", value).strip("-")
    return value or "image"


def normalize(value: str) -> str:
    value = value.lower()
    value = value.replace("&", " and ")
    value = value.replace("yoghurt", "yogurt")
    value = re.sub(r"[^a-z0-9]+", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def clean_label(value: str) -> str:
    value = value.replace("…", "").replace("...", "")
    value = re.sub(r"[_:;|]+$", "", value)
    value = re.sub(r"[^A-Za-z0-9&+()' -]+", " ", value)
    value = re.sub(r"\s+", " ", value).strip()
    return value


def sql_quote(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def query_db(sql: str) -> list[dict[str, str]]:
    script = f"""
require('dotenv').config();
const {{ Client }} = require('pg');
(async () => {{
  const client = new Client({{ connectionString: process.env.DATABASE_URL }});
  await client.connect();
  const result = await client.query({json.dumps(sql)});
  console.log(JSON.stringify(result.rows));
  await client.end();
}})().catch((err) => {{
  console.error(err);
  process.exit(1);
}});
"""
    result = subprocess.run(
        ["node", "-e", script],
        cwd=BACKEND_ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(result.stdout)


def best_match(value: str, candidates: list[str], min_score: float = 0.72) -> str | None:
    cleaned = normalize(value)
    if not cleaned:
        return None

    best_name: str | None = None
    best_score = 0.0
    for candidate in candidates:
        norm = normalize(candidate)
        if not norm:
            continue
        score = SequenceMatcher(None, cleaned, norm).ratio()
        if cleaned in norm or norm in cleaned:
            score = max(score, 0.93)
        cleaned_tokens = set(cleaned.split())
        norm_tokens = set(norm.split())
        if cleaned_tokens and norm_tokens:
            overlap = len(cleaned_tokens & norm_tokens) / max(len(cleaned_tokens), len(norm_tokens))
            score = max(score, overlap * 0.92)
        if score > best_score:
            best_name = candidate
            best_score = score

    return best_name if best_score >= min_score else None


def nonwhite_ratio(image: Image.Image) -> float:
    thumb = image.convert("RGB").resize((48, 48))
    pixels = list(thumb.getdata())
    return sum(1 for r, g, b in pixels if not (r > 242 and g > 242 and b > 242)) / len(pixels)


def save_square(source: Image.Image, box: tuple[int, int, int, int], destination: Path) -> None:
    crop = source.crop(box).convert("RGB").resize((512, 512), Image.Resampling.LANCZOS)
    destination.parent.mkdir(parents=True, exist_ok=True)
    crop.save(destination, optimize=True)


def age_group_for(path: Path) -> str:
    for part in path.relative_to(UI_ROOT).parts:
        if AGE_GROUP_RE.match(part):
            return part
    return "unknown"


def slot_for(path: Path) -> str:
    for part in reversed(path.relative_to(UI_ROOT).parts):
        lower = part.lower()
        if lower in {"breakfast", "lunch", "dinner", "snack", "snacks"}:
            return "snack" if lower == "snacks" else lower
        if lower == "lunch-dinner":
            return "meal"
    return "mixed"


def ocr_boxes(reader: easyocr.Reader, image_path: Path):
    return reader.readtext(str(image_path), detail=1, paragraph=False)


def group_recipe_titles(boxes, width: int, height: int) -> list[tuple[float, str]]:
    lines = []
    for box, text, conf in boxes:
        xs = [point[0] for point in box]
        ys = [point[1] for point in box]
        x0, y0 = min(xs), min(ys)
        if conf < 0.35 or x0 < width * 0.28 or y0 < height * 0.38:
            continue
        label = clean_label(text)
        if not label:
            continue
        if normalize(label) in {"breakfast", "lunch", "dinner", "snacks", "veg"}:
            continue
        lines.append((y0, x0, label))

    groups: list[list[tuple[float, float, str]]] = []
    for y, x, text in sorted(lines):
        if not groups or y - groups[-1][-1][0] > 74:
            groups.append([])
        groups[-1].append((y, x, text))

    results = []
    for group in groups:
        label = clean_label(" ".join(item[2] for item in sorted(group)))
        if len(label) >= 4:
            results.append((min(item[0] for item in group), label))
    return results


def extract_recipe_images(reader: easyocr.Reader, recipe_titles: list[str]) -> dict[str, str]:
    recipe_images: dict[str, str] = {}
    sources = [
        path
        for path in UI_ROOT.rglob("*.png")
        if path.parent.name in RECIPE_SOURCE_NAMES
        and ("Recipe" in str(path.parent) or "Recipes" in str(path.parent) or path.parent.name == "List")
        and "Detail" not in path.parts
    ]

    for image_path in sorted(sources):
        image = Image.open(image_path)
        width, height = image.size
        size = int(width * 0.24)
        left = int(width * 0.055)
        age_group = age_group_for(image_path)
        meal_slot = slot_for(image_path)

        for title_y, raw_title in group_recipe_titles(ocr_boxes(reader, image_path), width, height):
            title = best_match(raw_title, recipe_titles)
            if not title or title in recipe_images:
                continue
            top = int(title_y - size * 0.34)
            top = max(0, min(top, height - size))
            box = (left, top, left + size, top + size)
            crop = image.crop(box)
            if nonwhite_ratio(crop) < 0.12:
                continue
            filename = f"{slug(title)}.png"
            save_square(image, box, RECIPE_DIR / filename)
            recipe_images[title] = f"/images/nutrition/recipes/{filename}"

    return recipe_images


EXCLUDED_MATERIAL_LABELS = {
    "nutrition recipes",
    "recipes for baby",
    "nutrition and benefits",
    "benefits",
    "month",
    "veg",
    "carbohydrates",
    "proteins",
    "vitamin a",
    "vitamin b",
    "vitamin c",
    "vitamin d",
    "vitamin e",
    "calcium",
    "iron",
    "iodine",
    "folate",
    "dha and ara",
    "zinc",
    "vitamin b12",
    "potassium",
}


def group_material_labels(boxes, width: int, height: int) -> list[tuple[float, float, str]]:
    candidates = []
    for box, text, conf in boxes:
        xs = [point[0] for point in box]
        ys = [point[1] for point in box]
        x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
        label = clean_label(text)
        norm = normalize(label)
        if conf < 0.35 or y0 < height * 0.36 or not label:
            continue
        if norm in EXCLUDED_MATERIAL_LABELS:
            continue
        if any(norm.startswith(prefix) for prefix in ["supply ", "allow ", "and ", "efficiently "]):
            continue
        if y1 - y0 > 80:
            continue
        candidates.append({"x": (x0 + x1) / 2, "y": y0, "label": label})

    groups: list[list[dict[str, float | str]]] = []
    for item in sorted(candidates, key=lambda row: (row["y"], row["x"])):
        match = None
        for group in groups:
            if abs(float(item["x"]) - median(float(row["x"]) for row in group)) < 92 and abs(float(item["y"]) - max(float(row["y"]) for row in group)) < 88:
                match = group
                break
        if match is None:
            groups.append([item])
        else:
            match.append(item)

    labels = []
    for group in groups:
        text = clean_label(" ".join(str(row["label"]) for row in sorted(group, key=lambda row: row["y"])))
        if len(text) >= 3:
            labels.append((median(float(row["x"]) for row in group), min(float(row["y"]) for row in group), text))
    return labels


def extract_material_images(reader: easyocr.Reader, food_names: list[str]) -> dict[str, str]:
    material_images: dict[str, str] = {}
    sources = sorted(UI_ROOT.rglob("Nutrition and Benefits/*.png"))

    for image_path in sources:
        image = Image.open(image_path)
        width, height = image.size
        size = int(width * 0.18)
        for center_x, label_y, raw_label in group_material_labels(ocr_boxes(reader, image_path), width, height):
            food_name = best_match(raw_label, food_names, min_score=0.68)
            if not food_name or food_name in material_images:
                continue

            left = int(center_x - size / 2)
            top = int(label_y - size - height * 0.014)
            if left < 0 or top < 0 or left + size > width or top + size > height:
                continue

            box = (left, top, left + size, top + size)
            crop = image.crop(box)
            ratio = nonwhite_ratio(crop)
            if ratio < 0.16 or ratio > 0.96:
                continue

            filename = f"{slug(food_name)}.png"
            save_square(image, box, MATERIAL_DIR / filename)
            material_images[food_name] = f"/images/nutrition/materials/{filename}"

    return material_images


def write_sql(recipe_images: dict[str, str], material_images: dict[str, str]) -> None:
    lines = [
        "-- Migration 032: Set recipe and nutrition material image URLs extracted from ui/babyG/nutritions.",
        "-- Images are square 512x512 PNG files under backend/public/images/nutrition.",
        "",
    ]

    for title, url in sorted(recipe_images.items()):
        lines.append(
            "UPDATE recipes SET image_url = "
            f"{sql_quote(url)} WHERE target = 'baby' AND language = 'en' AND lower(title) = lower({sql_quote(title)});"
        )

    if recipe_images:
        lines.append("")

    for name, url in sorted(material_images.items()):
        lines.append(
            "UPDATE nutrition_foods SET image_url = "
            f"{sql_quote(url)} WHERE language = 'en' AND lower(name) = lower({sql_quote(name)});"
        )

    lines.append("")
    lines.append("SELECT COUNT(*) AS recipe_images FROM recipes WHERE image_url LIKE '/images/nutrition/recipes/%';")
    lines.append("SELECT COUNT(*) AS material_images FROM nutrition_foods WHERE image_url LIKE '/images/nutrition/materials/%';")
    OUTPUT_SQL.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    RECIPE_DIR.mkdir(parents=True, exist_ok=True)
    MATERIAL_DIR.mkdir(parents=True, exist_ok=True)

    recipe_titles = [row["title"] for row in query_db("SELECT DISTINCT title FROM recipes WHERE target = 'baby' AND language = 'en'")]
    food_names = [row["name"] for row in query_db("SELECT DISTINCT name FROM nutrition_foods WHERE language = 'en'")]

    reader = easyocr.Reader(["en"], gpu=False, verbose=False)
    recipe_images = extract_recipe_images(reader, recipe_titles)
    material_images = extract_material_images(reader, food_names)
    write_sql(recipe_images, material_images)

    print(f"Extracted {len(recipe_images)} recipe images")
    print(f"Extracted {len(material_images)} material images")
    print(f"Wrote {OUTPUT_SQL}")


if __name__ == "__main__":
    main()
