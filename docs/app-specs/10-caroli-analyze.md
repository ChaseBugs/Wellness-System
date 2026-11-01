# Caroli Analyze — Calorie & Nutrition Tracker + Public API Service

## Overview
A calorie counting and nutrition tracking app that helps users log meals, track macronutrients, set dietary goals, and analyze eating habits to support weight management and healthy living.
Additionally, **Caroli exposes a public API service** so third-party apps (fitness apps, hospital systems, diet apps, etc.) can consume nutrition analysis, food lookup, calorie calculation, and AI photo estimation as a service.
Reference app: MyFitnessPal (https://apps.apple.com/us/app/myfitnesspal-calorie-counter/id341232718)

---

## Features

### Core Features
- **Food Diary** — Log breakfast, lunch, dinner, and snacks with calorie and macro info
- **Food Database** — Large searchable database of foods with nutritional data (calories, protein, fat, carbs, fiber, sugar)
- **Barcode Scanner** — Scan product barcodes to auto-fill nutritional data
- **Calorie Goal** — Set daily calorie target based on weight goal (lose/maintain/gain) and activity level
- **Macro Tracking** — Track protein, carbohydrates, fat, fiber as % of daily target
- **Water Intake Tracker** — Log glasses/ml of water per day
- **Exercise Log** — Log workouts and calories burned; net calories = consumed − burned
- **Progress Charts** — Weight trend, calorie intake trend, macro breakdown over time

### Additional Features
- **Meal Templates / Recipes** — Save custom meals and multi-ingredient recipes with auto-calculated nutrition
- **Restaurant Foods** — Popular restaurant menu items with nutritional data
- **Photo Food Log** — Take photo of meal; AI estimates calories and nutrition
- **Nutrition Insights** — Weekly nutrition report: average intake, best/worst day, nutrient deficiencies
- **Reminders** — Log meal reminders, water reminders
- **BMI & TDEE Calculator** — Calculate Body Mass Index and Total Daily Energy Expenditure
- **Integration** — Sync with Apple Health, Google Fit, or fitness wearables
- **Streak & Goals** — Daily logging streaks, weekly goal achievement

---

## Application Logic

### Calorie Goal Calculation Logic
- Input: age, gender, height, current weight, target weight, activity level
- Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor formula:
  - Male: `BMR = 10×weight(kg) + 6.25×height(cm) − 5×age + 5`
  - Female: `BMR = 10×weight(kg) + 6.25×height(cm) − 5×age − 161`
- TDEE = BMR × activity factor (1.2 sedentary → 1.9 very active)
- Calorie target = TDEE − deficit (e.g., −500 kcal/day for 0.5kg/week loss)

### Food Logging Logic
- User searches → select food + quantity + unit (g, oz, cup, piece)
- Nutritional values scale proportionally with quantity
- Daily totals = sum of all logged food entries
- Remaining = daily goal − consumed + burned from exercise

### Barcode Scanner Logic
- Scan barcode → query Open Food Facts API or internal DB
- If found: return food data for user to confirm
- If not found: prompt user to manually enter and contribute to DB

### AI Photo Estimation Logic
- User captures photo of plate
- Send to AI model (computer vision + nutrition DB lookup)
- Model identifies food items and estimates portion sizes
- Returns estimated nutritional breakdown (marked as approximate)

### Weight Progress Logic
- User logs weight periodically
- Calculate rolling average (7-day) to smooth daily fluctuation
- Trend line: project weight trajectory toward goal at current calorie deficit/surplus pace
- Alert if weight stagnates or moves opposite to goal

---

## Caroli Public API Service

Third-party developers register for an API key and consume Caroli's nutrition engine in their own apps — similar to how apps use Nutritionix or Edamam API.

### API Authentication

- Developer registers at `developer.caroli.app`
- Receives a secret API key + client ID
- All requests must include the key in the Authorization header:
  ```
  Authorization: Bearer <API_KEY>
  ```
- Rate limits enforced per plan tier (Free / Pro / Enterprise)

---

### API Plans & Rate Limits

| Plan | Requests/day | Photo Analysis | Price |
|------|-------------|----------------|-------|
| Free | 100 | No | $0 |
| Pro | 10,000 | Yes (500/day) | $29/mo |
| Enterprise | Unlimited | Yes | Custom |

---

### API Endpoints

#### 1. Food Search
Search food items by name and get full nutrition data.

```
GET /api/v1/food/search?q={query}&limit={n}&lang={lang_code}
```

**Request:**
```
GET /api/v1/food/search?q=banana&limit=5&lang=en
Authorization: Bearer <API_KEY>
```

**Response:**
```json
{
  "status": "success",
  "count": 2,
  "data": [
    {
      "food_id": "f_001234",
      "name": "Banana, raw",
      "brand": null,
      "serving_size": 100,
      "serving_unit": "g",
      "nutrition": {
        "calories": 89,
        "protein_g": 1.1,
        "carbs_g": 22.8,
        "fat_g": 0.3,
        "fiber_g": 2.6,
        "sugar_g": 12.2,
        "sodium_mg": 1
      }
    }
  ]
}
```

---

#### 2. Food Lookup by ID
Get full nutrition details for a specific food item.

```
GET /api/v1/food/{food_id}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "food_id": "f_001234",
    "name": "Banana, raw",
    "category": "Fruit",
    "nutrition_per_100g": { ... },
    "common_servings": [
      { "label": "1 medium (118g)", "grams": 118 },
      { "label": "1 large (136g)",  "grams": 136 }
    ]
  }
}
```

---

#### 3. Barcode Lookup
Look up food by product barcode (EAN-13 / UPC).

```
GET /api/v1/food/barcode/{barcode}
```

**Request:**
```
GET /api/v1/food/barcode/8850002102308
Authorization: Bearer <API_KEY>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "food_id": "f_009821",
    "name": "Thai Jasmine Rice",
    "brand": "Golden Phenix",
    "barcode": "8850002102308",
    "serving_size": 45,
    "serving_unit": "g",
    "nutrition": { ... }
  }
}
```

---

#### 4. Nutrition Calculator
Calculate nutrition for a quantity of a known food item.

```
POST /api/v1/nutrition/calculate
```

**Request body:**
```json
{
  "food_id": "f_001234",
  "quantity": 150,
  "unit": "g"
}
```

**Response:**
```json
{
  "status": "success",
  "food_name": "Banana, raw",
  "quantity": 150,
  "unit": "g",
  "nutrition": {
    "calories": 133.5,
    "protein_g": 1.65,
    "carbs_g": 34.2,
    "fat_g": 0.45,
    "fiber_g": 3.9,
    "sugar_g": 18.3
  }
}
```

---

#### 5. Recipe Nutrition
Calculate total and per-serving nutrition for a multi-ingredient recipe.

```
POST /api/v1/nutrition/recipe
```

**Request body:**
```json
{
  "recipe_name": "Fried Rice",
  "servings": 2,
  "ingredients": [
    { "food_id": "f_000112", "quantity": 200, "unit": "g" },
    { "food_id": "f_000089", "quantity": 2,   "unit": "piece" },
    { "food_id": "f_000451", "quantity": 15,  "unit": "ml" }
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "recipe_name": "Fried Rice",
  "servings": 2,
  "total_nutrition": {
    "calories": 620,
    "protein_g": 18.4,
    "carbs_g": 98.2,
    "fat_g": 14.1
  },
  "per_serving_nutrition": {
    "calories": 310,
    "protein_g": 9.2,
    "carbs_g": 49.1,
    "fat_g": 7.05
  }
}
```

---

#### 6. TDEE / Calorie Goal Calculator
Calculate BMR, TDEE, and recommended daily calorie target.

```
POST /api/v1/calculator/tdee
```

**Request body:**
```json
{
  "gender": "male",
  "age": 28,
  "height_cm": 175,
  "weight_kg": 75,
  "activity_level": "moderate",
  "goal": "lose"
}
```

Activity levels: `sedentary`, `light`, `moderate`, `active`, `very_active`
Goals: `lose`, `maintain`, `gain`

**Response:**
```json
{
  "status": "success",
  "bmr": 1798,
  "tdee": 2787,
  "calorie_target": 2287,
  "weekly_change_kg": -0.5,
  "macros_recommended": {
    "protein_g": 150,
    "carbs_g": 258,
    "fat_g": 76
  }
}
```

---

#### 7. AI Photo Analysis (Pro/Enterprise only)
Send a meal photo; get back identified food items and estimated nutrition.

```
POST /api/v1/analyze/photo
Content-Type: multipart/form-data
```

**Request:**
```
file: <image file>   (JPEG/PNG, max 5MB)
```

**Response:**
```json
{
  "status": "success",
  "confidence": "medium",
  "note": "Estimated values — portion sizes may vary",
  "items_detected": [
    {
      "name": "Steamed white rice",
      "estimated_quantity_g": 180,
      "nutrition": {
        "calories": 234,
        "protein_g": 4.3,
        "carbs_g": 51.2,
        "fat_g": 0.4
      }
    },
    {
      "name": "Stir-fried vegetables",
      "estimated_quantity_g": 120,
      "nutrition": {
        "calories": 85,
        "protein_g": 3.1,
        "carbs_g": 9.4,
        "fat_g": 3.8
      }
    }
  ],
  "total_nutrition": {
    "calories": 319,
    "protein_g": 7.4,
    "carbs_g": 60.6,
    "fat_g": 4.2
  }
}
```

---

#### 8. Error Responses

All errors follow a consistent format:

```json
{
  "status": "error",
  "code": "FOOD_NOT_FOUND",
  "message": "No food found for barcode 123456789"
}
```

| HTTP Code | Error Code | Meaning |
|-----------|-----------|---------|
| 400 | `INVALID_REQUEST` | Missing or invalid parameters |
| 401 | `UNAUTHORIZED` | Missing or invalid API key |
| 404 | `FOOD_NOT_FOUND` | Food ID / barcode not in database |
| 429 | `RATE_LIMIT_EXCEEDED` | Daily request limit reached |
| 413 | `FILE_TOO_LARGE` | Photo exceeds 5MB limit |
| 500 | `SERVER_ERROR` | Internal error |

---

### API Service Logic

#### API Key Auth Logic
- On each request: extract Bearer token → hash it → look up in `api_keys` table
- Check: key exists, is active, is not expired
- Increment `requests_today` counter (Redis atomic increment for performance)
- If `requests_today > plan_limit` → return 429

#### Rate Limit Logic
- Use Redis to track rolling window per API key: `ratelimit:{api_key}:{YYYY-MM-DD}`
- Key expires at midnight (TTL = seconds until end of day)
- Atomic `INCR` + check against plan limit
- Return `X-RateLimit-Remaining` and `X-RateLimit-Reset` headers in every response

#### Usage Tracking & Billing Logic
- Log each API call: api_key, endpoint, timestamp, response_time_ms, status_code
- Aggregate daily/monthly usage per developer for billing
- Pro plan: charge at end of month based on overage if exceeded (or hard-block)
- Dashboard shows developer their own usage stats

#### Photo Analysis Pipeline
- Receive image → validate size and format
- Resize to model input size (224×224 or 640×640 for YOLO)
- Run food detection model → get item list + bounding boxes
- For each detected item: estimate portion weight from bounding box area + depth heuristic
- Look up nutrition per 100g from food DB → scale to estimated portion
- Return results with confidence flag

---

### Developer Portal Features
- Register and manage API keys
- View usage dashboard (requests today, this month, by endpoint)
- Upgrade/downgrade plan
- API documentation with live playground (try endpoints in browser)
- Webhook setup — notify your server when daily limit is near (80% threshold)
- SDKs: provide wrapper libraries for Python, JavaScript, Flutter/Dart

---

## Challenges

| Challenge | Description |
|-----------|-------------|
| Food Database Coverage | Needs millions of food items; regional foods and local brands are hard to cover |
| Nutritional Data Accuracy | User-submitted data and even branded data can be inaccurate |
| Portion Estimation | Users struggle to estimate portion sizes accurately; hard to fix with UX alone |
| AI Photo Accuracy | Estimating calories from a photo is inherently imprecise |
| Barcode Coverage | Not all products are in Open Food Facts; gaps frustrate users |
| Health Integration | Apple Health and Google Fit APIs have strict requirements and permission flows |
| Eating Disorder Risk | App must handle unhealthy usage patterns carefully; avoid reinforcing harmful behaviors |
| Recipe Nutrition Calculation | Cooking changes food weight; calculating per-serving nutrition for home recipes is complex |
| API Rate Limit at Scale | Redis counters work at low scale; need distributed rate limiting for high traffic |
| Photo Analysis Latency | AI photo endpoint must respond in <3 seconds or developers will time out |
| API Versioning | Breaking changes to the API must be versioned (`/v1`, `/v2`) without breaking existing integrations |
| Food DB Localization | Third-party apps from other countries need local food items in their language |
| API Abuse Prevention | Bad actors may scrape the entire food DB via the search endpoint |
| Billing Accuracy | Usage counting must be exact — under-counting loses revenue; over-counting angers developers |

---

## Recommended Tech Stack

### App
- **Mobile**: Android Native (Java) — min SDK API 24 (Android 7.0+)
- **HTTP Client**: Retrofit 2 + OkHttp
- **Barcode Scanner**: Google ML Kit Barcode Scanning API (Android)
- **Camera**: CameraX (Android Jetpack) — meal photo capture for AI analysis
- **Charts**: MPAndroidChart — calorie trend, macro breakdown, weight progress
- **Local DB / Offline**: Room Database — food diary, custom meals, weight log
- **Health Sync**: Google Health Connect API (Android) — log calories and exercise
- **Auth**: Firebase Auth (Android SDK)
- **Push Notifications**: Firebase Cloud Messaging (FCM) — meal logging and water reminders
- **Image Loading**: Glide
- **Architecture**: MVVM + LiveData + ViewModel (Android Jetpack)

### API Service
- **API Framework**: Node.js + Express.js (REST)
- **Database**: PostgreSQL (food DB, user accounts, API keys, usage logs)
- **Rate Limiting**: Redis (`ioredis`) with atomic INCR per key per day
- **Auth**: API key hashed with bcrypt stored in DB; Bearer token on each request
- **Photo AI**: Python FastAPI microservice (YOLOv8 + TensorFlow Lite food classifier) — called internally by Express.js
- **API Docs**: Swagger / OpenAPI 3.0 (swagger-jsdoc + swagger-ui-express)
- **Developer Portal**: Next.js frontend for API key management and usage dashboard
- **Billing**: Stripe for Pro/Enterprise plan subscriptions and overage billing
- **Monitoring**: Prometheus + Grafana — API latency, error rate, requests/sec
- **Caching**: Redis — frequent food lookups cached (TTL: 24h) to reduce DB load
