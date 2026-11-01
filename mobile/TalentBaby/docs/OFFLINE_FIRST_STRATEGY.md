# TalentBaby Offline-First Strategy

## goal

TalentBaby The mobile app is backend Core functions must work even without a server. Include static content in the app bundle, User input data is stored inside the device. SQLiteSave it to. Even if the server is needed again later, the same Repository Make online synchronization possible on the interface.

## Current structure summary

- Android The app is Java It is a native app based on.
- `mobile/app/src/main/java/com/talentbaby/app/network/ApiService.java`to Retrofit APIis defined.
- multiple screens `ApiClient.getClient().create(ApiService.class)`Call directly.
- Current server address is `mobile/app/src/main/java/com/talentbaby/app/utils/ApiClient.java`of `http://10.0.2.2:3004/api/v1/`is fixed on.
- The backend is Express + PostgreSQL + Prisma It is a structure, The seed data is `backend/database/migrations`Wow `backend/database/generated-ui-*.json`is in.
- There are two main sources of images..
  - mobile bundle: `mobile/app/src/main/res/drawable-nodpi`, About 44, about 9MB
  - backend public assets: `backend/public/images`, About 486, about 40MB
- Some demo data is already inside the app Java exists as code.
  - `mobile/app/src/main/java/com/talentbaby/app/data/NutritionDemoData.java`
  - `mobile/app/src/main/java/com/talentbaby/app/data/StoryDemoData.java`

## conclusion

The recommended structure is "SQLite + bundled assets" It's a mixed method..

SQLiteSearch for, filter, relationship, Insert structured data needed for user records. image, audio, Large binaries like video SQLitewithout putting it in `assets/` or `res/drawable-nodpi`Put it as a file in. SQLiteIn `asset_path` or `image_asset_name`save only.

## Supports two visions simultaneously

This project BabyCenterexpression content/Tracker Vision Department Kineduexpression activity/milestone/You must have a daily plan and vision at the same time.

To achieve this, the data model is divided into two branches and managed in the same local repository..

1. BabyCenter series
   - articles
   - stories
   - nutrition guides
   - recipes
   - growth records
   - feeding, sleep, diaper tracker
   - pregnancy/checklist/calculator series, Expand as needed

2. Kinedu series
   - activities
   - daily activities
   - milestone definitions
   - baby milestones
   - talent categories
   - talent assessments
   - activity completion history
   - milestone/activity video attachment metadata

App screen separates the two visions DBDo not divide by, one `LocalTalentBabyDatabase`in Repositorydon't read much. So that's home, daily plan, milestone, article, Nutrition screens can share the same baby profile and age calculation.

## Data storage principles

### SQLiteWhat to put in

- user profile, local auth placeholder
- babies, active baby
- growth_records
- feeding_records
- sleep_sessions
- diaper_changes
- activities
- daily_activities
- activity_completion
- milestone_definitions
- baby_milestones
- articles
- stories
- recipes
- nutrition_categories
- nutrition_foods
- recipe_ingredients
- bookmarks/favorites
- local media metadata

### assets or resWhat to put in

- activity thumbnails
- nutrition/recipe images
- story images
- onboarding/home/library images
- bundled video thumbnails
- short offline videos, When needed `assets/videos/`
- prebuilt seed JSON or SQLite DB file

### SQLiteDo not put in

- large image blob
- video blob
- audio blob
- temporary cache files

## Android Implementation direction

### 1step: local DB Add layer

`app/build.gradle`to Roomadd.

```gradle
implementation 'androidx.room:room-runtime:2.6.1'
annotationProcessor 'androidx.room:room-compiler:2.6.1'
```

Recommended Package Structure:

```text
mobile/app/src/main/java/com/talentbaby/app/local/
  LocalTalentBabyDatabase.java
  dao/
  entity/
  mapper/
  seed/
  repository/
```

### 2step: API Remove direct calls

on the screen `ApiService`Do not use directly. For example:

```text
ActivityRepository
BabyRepository
TrackerRepository
MilestoneRepository
ContentRepository
NutritionRepository
StoryRepository
```

RepositoryFrom the inside Local DBread. If you need server synchronization later Repository inside RemoteDataSourceJust add.

### 3step: Backend seed data conversion

Current backend migration SQLand JSONfor app seedConvert to.

Recommended deliverables:

```text
mobile/app/src/main/assets/offline/talent_baby_seed.db
mobile/app/src/main/assets/offline/manifest.json
mobile/app/src/main/assets/images/activities/*.png
mobile/app/src/main/assets/images/nutrition/**/*.png
```

When you first run the app Room prepackaged databaseor copy it to, JSON seedread insertdo. Because there is a lot of data and relationships, ultimately prepackaged SQLite DBis more stable.

### 4step: Image path unification

Current backend data `image_url`silver `/images/activities/xxx.png` It's the same server path.. Offline, convert as follows:.

```text
/images/activities/Balancing.png
assets://images/activities/Balancing.png
```

or SQLiteOnly place relative paths in.

```text
images/activities/Balancing.png
```

Glide Create a loading utility for the server URL Remove assembly code.

```text
ImageLoader.load(imageView, imageRef)
```

This utility `localImageResId`, `assets/`, `file://`, `http://`handle all.

### 5step: Local login mode

In a completely offline app JWT Login becomes less meaningful. The following method is realistic:.

- first run: parents name, Only receive email or nickname local user create
- Leave password login as an optional feature
- existing `TokenManager`is `SessionManager`reduce the role to
- active babyis SQLite or SharedPreferencesSave it to

### 6step: Daily Plan local algorithm

You can create a daily plan even without a server..

input:

- active baby age in months
- completed activities
- milestone status
- Preferred Category or Goal
- date

rules:

- of the corresponding month activity bring a candidate
- Activities completed in the last 7 days are given low priority.
- physical, cognitive, communication, social-emotional strike a balance
- day 3-5dog slotcreates
- `baby_daily_activities`Save it and show the same plan on the same date

## priority

### Phase 1: the app backend Turns on without and makes the main tab visible

- Room DB add
- prepackaged seed DB or JSON seed add
- local user / baby create
- articles, stories, recipes, activities, milestonesread locally
- image asset path loading
- Login/Sign up offline onboardingreplaced with

### Phase 2: Save user history

- growth
- feeding
- sleep
- diaper
- activity completion
- baby milestone status
- bookmarks/favorites

### Phase 3: local personalization

- daily plan generation
- milestone report
- growth chart summary
- nutrition recommendation
- talent assessment scoring

### Phase 4: Selective sync

If there is a possibility of saving the server later without completely abandoning it, sync queuePut it.

- local_changes table
- sync_status: pending, synced, conflict
- updated_at, deleted_at
- stable uuid primary key

## Implementation precautions

- PostgreSQL The array type is SQLiteseparate from join table or JSON textchange to.
- of the server `SERIAL id`is likely to crash locally, so in the long run UUIDPut together.
- all image files APKIf you put it in APKgets bigger. Current backend public About 40 images onlyMBSo compressed, WebP conversion, feature pack Consider whether to separate.
- User-recorded videos are assetsnot app-private storageSave it to SQLitePut only the file path and metadata in.
- Web Admin is not needed for offline app runtime. However, it is maintained as a content creation tool., export scriptby SQLite seedI like the way you make it..

## Recommendation Decision

The best direction to go right now is:.

1. Backend is content creation/Maintain for management purposes.
2. Mobile app runtime backend to operate without Room + bundled assetsswitch to.
3. `ApiService`A structure that calls directly from the screen Repository wrap in layers.
4. All static content is in the app seed DBWow assetsincludes with.
5. user data SQLiteSave it to.
6. Future online features are optional syncAttach it with.

If you do this BabyCenterexpression information/with tracker Kineduexpression activity/While maintaining all daily plans in one app,, Serverless deployment is possible.

## implemented Delta Sync skeleton

at this stage backendIn public delta sync APIadded.

```text
GET /api/v1/content-sync/manifest
GET /api/v1/content-sync/delta?since=<iso_timestamp>&include_assets=true
```

`manifest`is the current content version on the server and asset Return the copy separately.. `delta`The app has `since` Changed after version rowsWow `asset_since` Images changed after version asset returns a list.

Android The following local storage was added to the app:.

```text
talent_baby_offline.db
  offline_content_rows
  offline_assets
  offline_sync_state
```

If there is a network when the app starts `ContentSyncManager`of the server `contentVersion`, `assetVersion`Compare each with the local version.. Only applies to higher server versions rows or assetsDownload and, If there is no network, this process is silently skipped. offline Users are not blocked from running apps.

Currently at this stage "Basis for receiving data"is. In the next step, each screen Retrofit make a direct call RepositoryWrap it with, first `offline_content_rows`After reading online Only when you need the feature backend APIYou can change it to call ..
