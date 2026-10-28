# Foodvisor Native Mobile

Native Android Java implementation of the FoodVisor mobile UI set under `design/ui` and the companion `design/FoodVisor` prototype.

The launcher starts `DesignFlowActivity`, a full-screen step-by-step implementation of all 79 screenshots from `design/ui`. Tap the right side or swipe left for the next screen, tap the left side or swipe right for the previous screen, tap the center to see the current workflow/step, and use volume down/up to jump between workflows.

## Screen Structure

Each major reference UI is implemented as its own Activity. Shared visual language, cards, chips, charts, glyphs, and drawing helpers live in `app/src/main/java/com/foodvisor/mobile/ui/Ui.java`.

- First-run: `SplashActivity`, `WelcomeActivity`, `SignInActivity`, `GoalSetupActivity`, `BasicProfileActivity`, `PermissionsActivity`, `PlanRevealActivity`
- App tabs: `TodayActivity`, `DiaryActivity`, `CaptureActivity`, `InsightsActivity`, `ProfileActivity`
- Detail flows: `BarcodeActivity`, `PhotoAiActivity`, `RecipeActivity`, `GoalsActivity`
- Developer screens: `DevConsoleActivity`, `DevPlaygroundActivity`

`AppNav.java` owns bottom-tab navigation between the main app Activities. The older `MainActivity` and `OnboardingActivity` remain in the project for API-calculator reference behavior, but the launcher now starts `DesignFlowActivity`.

## Run

1. Start the backend from the repository root:

   ```bash
   npm run dev:backend
   ```

2. Open `mobile/` in Android Studio.
3. Sync Gradle and run the `app` configuration on an emulator.

The default API base URL is `http://10.0.2.2:4000/api`, which points from the Android emulator to the host machine backend.

You can also build from the command line:

```bash
./gradlew assembleDebug
```
