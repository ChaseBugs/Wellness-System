# Foodvisor Scraping Data Notes

Last checked: 2026-05-06

## Current Database Status

Foodvisor currently has `393,822` food records in MongoDB.

| Source | DB records | Local source rows | Status |
| --- | ---: | ---: | --- |
| USDA FoodData Central API | 10,268 | API based | Imported with nutrient values |
| ComprehensiveFoodDatabase USDA Non-Branded | 18,946 | 26,076 | Imported as name/category records |
| ComprehensiveFoodDatabase USDA Branded | 364,587 | 370,905 | Imported as brand/name/category records |
| ComprehensiveFoodDatabase Menustat | 0 | 110,939 | Not imported yet |
| Curated Foodvisor foods | 21 | Local seed data | Imported with detailed fields |

Offline image asset counts:

| Asset type | Count | Folder |
| --- | ---: | --- |
| Generated ComprehensiveFoodDatabase SVG images | 383,533 | `backend/public/images/foods` |
| Generated USDA FDC SVG images | 10,268 | `backend/public/images/foods` |

## Source Files

The local ComprehensiveFoodDatabase project is here:

```text
foodvisor/food data/ComprehensiveFoodDatabase-master
```

The source-list files used by the importer are:

```text
image_scraping/src_data/usda_no_branded.txt
image_scraping/src_data/usda_branded.txt
image_scraping/src_data/menustat.txt
```

These files mostly contain food names, brand/name pairs, or restaurant/item pairs. They do not include the full nutrient tables locally.

## Data Quality Rules

Use USDA FoodData Central as the primary source for correct nutrition values.

ComprehensiveFoodDatabase local lists are useful for:

- Expanding searchable food names.
- Adding branded packaged food names.
- Adding restaurant/menu item names.
- Creating offline image coverage.
- Helping admins review and fill missing details.

ComprehensiveFoodDatabase local lists are not enough for:

- Accurate calories.
- Accurate macros.
- Vitamins/minerals.
- GI values.
- Daily value percentages.
- Medical/diet recommendations.

For those fields, use USDA FDC API, verified vendor data, or admin/manual review.

## Import Commands

Run from:

```powershell
cd foodvisor\backend
```

Import all ComprehensiveFoodDatabase local lists:

```powershell
npm run import:comprehensive
```

Import only specific sources:

```powershell
$env:CFD_SOURCES='usda_no_branded'
npm run import:comprehensive

$env:CFD_SOURCES='usda_branded'
npm run import:comprehensive

$env:CFD_SOURCES='menustat'
npm run import:comprehensive
```

Run with a limit for testing:

```powershell
$env:CFD_IMPORT_LIMIT='1000'
npm run import:comprehensive
```

Clear the limit:

```powershell
Remove-Item Env:\CFD_IMPORT_LIMIT -ErrorAction SilentlyContinue
```

Useful environment variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `CFD_DATA_ROOT` | `../food data/ComprehensiveFoodDatabase-master` | Local dataset path |
| `CFD_SOURCES` | `usda_no_branded,usda_branded,menustat` | Source lists to import |
| `CFD_IMPORT_LIMIT` | unlimited | Max new records for a run |
| `CFD_BATCH_SIZE` | `1000` | Mongo bulk write batch size |
| `CFD_IMAGE_MODE` | `generated` | Create local generated SVG images |

## Image Strategy

The Foodvisor backend importer creates offline SVG images for each imported ComprehensiveFoodDatabase record.

Stored path example:

```text
backend/public/images/foods/cfd-usda_branded-<hash>-<food-name>.svg
```

Database field example:

```text
imageUrl: /images/foods/cfd-usda_branded-<hash>-<food-name>.svg
```

The backend serves images from:

```text
http://localhost:4000/images/foods/...
```

The generated SVGs are reliable for offline usage but are not real food photos.

## Real Image Scraping

The local image scraper is:

```text
food data/ComprehensiveFoodDatabase-master/image_scraping/scripts/scrape_food_images.py
```

Install Python dependencies if needed:

```powershell
cd "foodvisor\food data\ComprehensiveFoodDatabase-master"
python -m pip install -r requirements.txt
```

Run a small image scrape:

```powershell
cd "foodvisor\food data\ComprehensiveFoodDatabase-master\image_scraping\scripts"
python scrape_food_images.py --source ../src_data/usda_no_branded.txt --out ../imgs/usda_non_branded --limit 100 --workers 2
```

The scraper behavior:

1. Tries Google Images.
2. Falls back to Wikimedia Commons.
3. Generates a local JPEG fallback if no remote image is usable.
4. Skips existing image files, so it can be rerun.

Use low limits and worker counts for remote scraping because Google/Wikimedia can block, rate-limit, or return no accurate image for exact packaged food names.

## MenuWithNutrition Scraper

The MenuWithNutrition scraper is:

```text
food data/ComprehensiveFoodDatabase-master/web_scraping/menuwithnutrition/scrape.py
```

Test run:

```powershell
cd "foodvisor\food data\ComprehensiveFoodDatabase-master\web_scraping\menuwithnutrition"
python scrape.py --restaurant-limit 2 --food-limit 20 --output sample_menu_with_nutrition.csv
```

Full scrape:

```powershell
python scrape.py --output menu_with_nutrition_scrape.csv
```

Full scrape can take a long time and depends on remote website availability.

## Admin Review

Imported ComprehensiveFoodDatabase records are marked:

```text
doctor_verified: false
```

Admin should review especially:

- Calories and macros.
- Vitamins and minerals.
- Allergens.
- Ingredients.
- Diet use cases.
- Caution groups.
- Image accuracy if real scraped images are used.

## Pending Work

Menustat import has not been completed yet. To run it:

```powershell
cd foodvisor\backend
$env:CFD_SOURCES='menustat'
Remove-Item Env:\CFD_IMPORT_LIMIT -ErrorAction SilentlyContinue
npm run import:comprehensive
```

After Menustat import, verify counts:

```powershell
node --input-type=module -e "import 'dotenv/config'; import mongoose from 'mongoose'; await mongoose.connect(process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/foodvisor'); const col=mongoose.connection.collection('foods'); console.log(await col.countDocuments({dataSource:'ComprehensiveFoodDatabase Menustat'})); await mongoose.disconnect();"
```
