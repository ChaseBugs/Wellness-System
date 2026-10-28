# Height Increase Mobile

Native Android Java project for the Height Increase app.

## Screens

- SplashActivity
- OnboardingActivity
- PlanActivity
- DiscoverActivity
- ReportsActivity
- ProfileActivity
- QaActivity

## Architecture

The project keeps screen code in `activities`, UI state in `viewmodel`, app data in `repository`, and data objects in `model`. Shared native view builders live in `ui`.

## Build

Open the `mobile` folder in Android Studio, or run:

```powershell
$env:ANDROID_HOME='C:\Users\arthu\AppData\Local\Android\Sdk'
$env:JAVA_HOME='C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot'
gradle assembleDebug
```
