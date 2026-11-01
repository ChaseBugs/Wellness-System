# Height Increase Mobile

Native Android Java project for the Height Increase app. It uses only the Android SDK (no third-party libraries).

## Screens

| Screen | What works |
| --- | --- |
| SplashActivity | Skips onboarding once it is done |
| OnboardingActivity | Gender, age, height, daily minutes; saved on the device, synced after sign-in |
| PlanActivity | Published training plans (START plays them), weekly workout goal, this week's progress, My training, More (nutrition, sleep), streak (🔥) and Q&A (💡) |
| WorkoutActivity | Get-ready countdown, timed exercises with rest, pause / previous / skip / +20s rest, beeps, quit confirmation; finishing completes the plan session and adds minutes and exercises to today's log |
| MyTrainingActivity, AddExerciseActivity | The user's own exercise list from published exercises (duration adjustable, reorder, delete), kept on the device and played by WorkoutActivity |
| DiscoverActivity | Published articles with their expert-review state |
| ReportsActivity | This week's workouts, average sleep and minutes, week strip with workout days, streak, height (edit), sleep tracker, BMI with WHO adult bands (no category under 18), weight, history |
| SleepActivity | Records last night's sleep from bedtime and wake-up time |
| HistoryActivity | The last 30 days of logs |
| ProfileActivity | Account (sign in / out), workout settings (sound, countdown), general settings (units, notifications; saved on the account), language, rate, share, Q&A, feedback |
| SignInActivity | Email sign-in or account creation with the shared Wellness account |

Signed out, the catalog, My training editing and settings work; anything that records data asks the user to sign in first.

## Architecture

The project keeps screen code in `activities`, UI state in `viewmodel`, app data in `repository`, data objects in `model` and the HTTP client in `network`. Shared native view builders live in `ui`.

- `network/ApiClient`: blocking `HttpURLConnection` client for the Wellness Platform backend (repo-root `backend/`). It sends `X-App-Code: height-increase`, unwraps the `{ success, data, meta }` envelope, and on a 401 refreshes the token pair once through `auth/refresh`.
- `network/Session`: access and refresh tokens in `SharedPreferences`.
- `repository/RemoteRepository`: runs calls on a background thread and reports back on the main thread.
- `repository/ProfileStore`: the onboarding answers. After sign-in, gender goes to `PATCH apps/height-increase/profile` and height to `POST apps/height-increase/measurements`, once. Age stays on the device.
- `repository/AppRepository`: static screen content (settings rows, Q&A).
- `repository/MyTrainingStore`, `repository/SettingsStore`: the user's own exercise list and device settings in `SharedPreferences`.
- `ui/Dialogs`: measurement dialogs with KG/LB and CM/IN toggles (values are stored in metric).

The catalog (`apps/height-increase/articles`, `/training-plans`, `/exercises`) is public. Workouts use `routines/:id` and `sessions` (Routine Engine), records use `logs`, `measurements` and `goals`, and `reports?today=` returns the streak counted from the user's local date. Reports and measurements need an account, because height and body data stay in the user's own HeightIncrease records.

Product rules from the strategy apply to the copy: no promises that the app increases height, no height projections, and no calorie-burn figures without a validated estimate.

## Backend

Start the platform first, from the repo-root `backend/`: `npm run db:local && npm run seed && npm run import:legacy:height && npm run dev`. The emulator reaches it at `http://10.0.2.2:4500/api/v1/` (`ApiClient.BASE_URL`); on a device, use the host's LAN IP.

Imported training plans are drafts until an expert reviews and publishes them in the admin (`/height/training-plans`), so a fresh database may show only the smoke test's sample plan.

## Build

Open this `android` folder (`mobile/HeightIncrease/android`) in Android Studio. The project has no Gradle wrapper; from the command line, use another app's wrapper with JDK 17:

```bash
cd ../../Foodvisor/android
./gradlew.bat -p ../../HeightIncrease/android assembleDebug
```
