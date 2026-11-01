# Workout App

## Overview
A mobile app for guided strength and conditioning training — offering exercise libraries, structured workout programs, custom routine builders, real-time set/rep tracking, progress analytics, and form-correction features.
Reference apps: Nike Training Club, Fitbod, JEFIT, StrongLifts 5x5

---

## Features

### Core Features
- **Exercise Library** — Illustrated and video guide for 300+ exercises with name, target muscle group, equipment required, instructions, and common mistakes
- **Workout Programs** — Pre-built multi-week programs (e.g., "8-Week Strength Builder", "30-Day Home HIIT", "Push/Pull/Legs Split")
- **Workout Categories** — Strength, hypertrophy, HIIT, mobility, calisthenics, powerlifting, fat loss, beginner
- **Set/Rep Tracker** — Log every set with reps × weight; auto rest timer between sets; previous-session comparison ("last time: 5×80kg")
- **Custom Routine Builder** — Drag-and-drop exercises into a routine, set sets/reps/rest per exercise, save and reuse
- **Progress Charts** — Volume per muscle group, 1RM estimation per lift, body weight trend, body measurement log
- **Workout History** — Calendar of completed sessions; tap any day to view details
- **Plate Calculator** — Compute barbell plate loadout for a target weight (e.g., 100kg → 20kg bar + 2×20kg + 2×20kg)

### Additional Features
- **AI Form Correction** — Camera-based real-time feedback on lift form using pose estimation (squat depth, bar path, knee tracking)
- **Heart Rate Integration** — Sync with Apple Watch / Wear OS / Polar HRM for in-workout HR zones
- **Auto Progressive Overload** — App suggests next session's weight based on last session's RPE and rep completion
- **Body Measurement Tracking** — Log weight, body-fat %, chest/waist/arm/thigh circumference with photo timeline
- **Macro / Calorie Tracking Integration** — Optional integration with calorie tracker for training-day vs rest-day intake targets
- **Apple Health / Google Fit Sync** — Log workout duration, calories burned, HR data
- **Music Integration** — Spotify / Apple Music in-app controls during workout
- **Offline Mode** — All exercise videos and current program downloadable for offline gym use
- **Community / Leaderboards** — Optional social feed: PR posts, weekly volume leaderboard among friends
- **Coach / Trainer Mode** — Trainers can build programs and assign to clients (mentor-trainee pattern, see Yoga app)

---

## Application Logic

### Workout Session Logic
- User starts a routine → app loads exercise list with target sets × reps × weight
- For each set: user enters reps and weight, taps "Done" → rest timer auto-starts (default by exercise type: 60s isolation, 120s compound, 180s heavy compound)
- Skip / drop set / add set / swap exercise mid-workout supported
- Session ends when all exercises complete or user taps "Finish" — saves to history with total duration and volume

### Progressive Overload Logic
- For each exercise, store last N sessions (sets × reps × weight × RPE)
- If last session: completed all reps at RPE ≤ 8 → suggest +2.5kg (compounds) / +1.25kg (isolation)
- If failed any set or RPE = 10 → suggest same weight next session (deload trigger after 3 failures: −10%)
- 1RM estimation: Epley formula `1RM = weight × (1 + reps/30)`

### Volume & Recovery Logic
- Per muscle group, track weekly volume (sets × reps × weight)
- Compare against research-backed targets (e.g., 10–20 sets/week per muscle for hypertrophy)
- Flag undertrained groups ("Back: 4 sets this week — below recommended 10")
- Flag overtrained groups based on rolling average

### AI Form Correction Logic (Advanced Feature)
- Access device camera during set (opt-in, gym-friendly: clip phone on tripod)
- Use MediaPipe Pose / TensorFlow Lite to extract 33 keypoints at 30 fps
- Per-exercise rubric (e.g., squat: hip below knee at bottom, knees track toes, neutral spine)
- Real-time visual overlay + post-set summary: "3/5 reps full depth, 1 knee valgus on rep 4"

### Plate Calculator Logic
- Input target weight + bar weight + available plates (default Olympic plates: 25, 20, 15, 10, 5, 2.5, 1.25 kg per side)
- Greedy algorithm: subtract bar, divide by 2 (per side), greedy fit largest plates first

### Workout Program Progression Logic
- Program is a sequence of daily sessions (some days are rest)
- User starts program → locked to today's session (or rest day reminder)
- Completing session marks day done, advances to next session
- Missed days: optional "catch up" mode (shift schedule) or "skip and continue"

---

## Challenges

| Challenge | Description |
|-----------|-------------|
| In-Gym UX | Sweaty hands, wet screens, gloves — buttons must be large, gestures forgiving, screen always on |
| AI Form Estimation Accuracy | Bar/equipment occludes keypoints; baggy clothes hide joints; gym lighting varies |
| Exercise Library Coverage | 300+ exercises require professional video production for every variation (bench press: barbell, dumbbell, machine, incline, decline) |
| Equipment Variety | Home users have no equipment; gym users have everything — one library must serve both |
| Rest Timer Reliability | Timer must run when phone is locked or in pocket; must vibrate / play sound reliably |
| Wearable HR Integration | Different APIs for Apple Watch, Wear OS, Polar, Garmin, Whoop — fragmented ecosystem |
| Data Density | Power users log 10+ exercises × 3–5 sets daily — UI must surface trends without burying details |
| Privacy | Body measurements, photos, HR data are health data — encrypted storage and explicit consent required |

---

## Recommended Tech Stack
- **Mobile**: Android Native (Kotlin) — min SDK API 24 (Android 7.0+)
- **Backend**: Node.js + Express.js + PostgreSQL
- **HTTP Client**: Retrofit 2 + OkHttp
- **Video**: ExoPlayer — HLS streaming via AWS CloudFront for exercise demonstrations
- **Offline Video**: ExoPlayer DownloadManager — cached HLS segments per program
- **AI Form Correction**: MediaPipe Pose Android SDK + TensorFlow Lite (33 keypoints, 30 fps on-device)
- **Camera**: CameraX (Android Jetpack)
- **Wearables / HR**: Health Services API (Wear OS), Apple HealthKit (iOS counterpart), Polar BLE SDK
- **Local DB / Offline**: Room Database — workout logs, exercise library cache, current program state
- **Auth**: Firebase Auth (Android SDK)
- **Push Notifications**: Firebase Cloud Messaging (FCM) — workout reminders, rest day alerts, PR celebrations
- **Health Sync**: Google Health Connect API (Android)
- **Charts**: MPAndroidChart — volume / 1RM / body-weight progression charts
- **Image Loading**: Glide
- **Architecture**: MVVM + LiveData + ViewModel + Hilt DI (Android Jetpack)
