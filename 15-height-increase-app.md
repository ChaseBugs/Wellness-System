# Height Increase App

## Overview
A mobile app designed to help users — primarily teenagers and young adults — maximize their natural height potential through evidence-based exercise routines, nutrition guidance, sleep optimization, and posture correction.

---

## Features

### Core Features
- **Height & Growth Tracker** — Log height measurements over time with trend chart visualization
- **Exercise Routines** — Guided stretching, yoga, and resistance exercises that support spinal decompression and posture
- **Posture Analyzer** — Camera-based posture check using device camera (side-profile analysis)
- **Sleep Tracker** — Growth hormone is released during deep sleep; track sleep duration and quality
- **Nutrition Guide** — Calcium, Vitamin D, zinc, and protein intake recommendations by age/weight
- **Bone Age Awareness** — Inform users about growth plate status by age range
- **Daily Reminder & Routine Scheduler** — Push reminders for exercises, sleep time, and meals
- **Progress Journal** — Notes and photo timeline tied to height measurements

### Additional Features
- **BMI & Body Proportion Tracker** — Track weight, leg length, torso ratio
- **Predicted Height Calculator** — Mid-parental height formula (father + mother height ÷ 2 ± 6.5 cm)
- **Growth Percentile Chart** — Compare height against WHO/CDC age-gender standards
- **Streak & Gamification** — Daily exercise streaks, badges, and level-up rewards
- **Community & Leaderboard** — Optional anonymous height progress sharing
- **Expert Tips Feed** — Short articles on height myths, effective exercises, and nutrition

---

## Application Logic

### Height Trend Logic
- Store height measurements with date and time
- Render line chart with date on X-axis and height (cm/inch) on Y-axis
- Calculate monthly and weekly growth rate
- Overlay predicted adult height based on current growth velocity

### Exercise Routine Logic
- Define exercise library (e.g., hanging bar, cobra stretch, pelvic tilt, jump rope)
- Each exercise has: duration, sets/reps, target muscle group, animation/video
- Build daily schedule: Morning (stretching) → Afternoon (resistance) → Evening (yoga)
- Track completion per session; calculate weekly consistency percentage

### Sleep Optimization Logic
- Recommend 8–10 hours for users under 20 (peak growth hormone window: 10 PM–2 AM)
- Alert if logged sleep duration falls below threshold
- Calculate sleep debt over a 7-day rolling window

### Predicted Height Formula
```
Boys:  (Father_cm + Mother_cm + 13) / 2  ±  8.5 cm
Girls: (Father_cm + Mother_cm - 13) / 2  ±  8.5 cm
```
Display predicted range with 95% confidence band.

### Nutrition Tracker Logic
- Daily calcium target: 1000–1300 mg (age 9–18), 1000 mg (adult)
- Vitamin D target: 600 IU/day (teens), 800 IU (adults)
- Log meals and auto-calculate nutrient totals from food database
- Flag deficiencies with recommended food sources

---

## Challenges

| Challenge | Description |
|-----------|-------------|
| Posture Detection Accuracy | Camera-based posture analysis requires ML model calibration for different body types |
| Medical Accuracy | Must avoid overclaiming; growth plates close at ~18 (girls) / ~21 (boys) — app must communicate this clearly |
| Measurement Consistency | Users measure height differently (morning vs. evening height differs by ~1–2 cm) |
| Nutrition Database | Maintaining an accurate, localized food nutrition database |
| Motivation Retention | Users expect fast results; gamification needed to sustain long-term engagement |
| Age Gating | Core target is minors — requires COPPA/child data privacy compliance |
| Myth Busting | Many users believe unscientific claims; content must be evidence-based |

---

## Recommended Tech Stack
- **Mobile**: Android Native (Java) — min SDK API 24 (Android 7.0+)
- **Backend**: Node.js + Express.js + PostgreSQL
- **HTTP Client**: Retrofit 2 + OkHttp
- **Charts**: MPAndroidChart — height trend line chart, WHO/CDC percentile overlay, weekly consistency bar chart
- **Posture AI**: TensorFlow Lite + MediaPipe Pose Android SDK — on-device side-profile posture analysis via CameraX
- **Camera**: CameraX (Android Jetpack) — posture photo/video capture
- **Local DB / Offline**: Room Database — height measurements, exercise logs, meal logs
- **Nutrition DB**: Open Food Facts API or Nutritionix API (via Express.js backend)
- **Auth**: Firebase Auth (Android SDK)
- **Push Notifications**: Firebase Cloud Messaging (FCM) — exercise, sleep, and meal reminders
- **Image Loading**: Glide
- **Architecture**: MVVM + LiveData + ViewModel (Android Jetpack)
