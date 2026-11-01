# Girl's Health Management App

## Overview
A women's health app for tracking menstrual cycles, ovulation, reproductive health, mood, symptoms, and overall wellness — with privacy as a core design principle.
Reference apps: Flo (https://flo.health), Period Tracker (org.iggymedia.periodtracker)

---

## Features

### Core Features
- **Period Tracking** — Log period start/end dates; predict next period based on cycle history
- **Cycle Calendar** — Visual calendar showing period days, ovulation window, fertile window, PMS phase
- **Symptom Logging** — Log daily symptoms: cramps, bloating, headache, acne, breast tenderness, etc.
- **Mood Tracking** — Log mood (happy, sad, anxious, irritable) per day
- **Flow Intensity** — Log flow level: spotting, light, medium, heavy
- **Ovulation Prediction** — Predict fertile window using cycle average and optionally BBT/OPK data
- **Pregnancy Mode** — Switch to pregnancy tracking mode: due date, trimester milestones, weight, symptoms
- **Health Insights** — Cycle analysis, average length, regularity reports

### Additional Features
- **Daily Health Log** — Log sleep, water intake, exercise, weight, temperature (BBT)
- **Reminders** — Period reminder, pill/contraceptive reminder, ovulation alert
- **Partner Mode** — Share cycle info with a partner (with consent)
- **Doctor Report Export** — Export cycle history as PDF for gynecologist
- **Articles & Education** — In-app health articles on reproductive health, nutrition, wellness
- **Spotting & Irregularity Alerts** — Flag cycles that are unusually short, long, or irregular
- **Contraceptive Tracker** — Log pill taken/missed, IUD placement date, etc.
- **Anonymous Mode** — Use app without account; local data only

---

## Application Logic

### Cycle Prediction Logic
- Store history of cycle start dates
- Calculate average cycle length over last 3–6 cycles
- Predicted next period = last period start + average cycle length
- Fertile window = ovulation day ± 2 days; ovulation ≈ cycle day (average_length − 14)
- Confidence indicator: higher with more cycle history

### BBT (Basal Body Temperature) Logic
- User logs temperature each morning before getting up
- Chart temperature over cycle days
- Identify biphasic pattern: lower pre-ovulation, rise post-ovulation (confirms ovulation occurred)
- Overlay on cycle calendar

### Symptom Correlation Logic
- Aggregate symptom logs by cycle phase (menstrual, follicular, ovulatory, luteal)
- Surface patterns: "You often experience headaches on days 24–26"
- Used to prepare user for what to expect in upcoming cycle phase

### Irregularity Detection Logic
- Flag if cycle length < 21 or > 35 days
- Flag if period is more than 7 days late vs. prediction
- Flag spotting outside period window
- Recommend consulting a doctor (not a diagnosis)

---

## Challenges

| Challenge | Description |
|-----------|-------------|
| Data Privacy & Sensitivity | Period and reproductive data is highly sensitive; requires strong encryption and no unauthorized sharing |
| Prediction Accuracy | Cycles vary; predictions must be honest about uncertainty, not misleadingly precise |
| Irregular Cycle Handling | Algorithm must gracefully handle very irregular cycles without crashing or producing nonsense |
| Legal/Regulatory Risk | Post-Roe concerns in some regions mean user data must not be accessible to third parties under any circumstances |
| Medical Disclaimer | App gives health insights but must not replace medical advice; needs careful UX language |
| Onboarding Data | App predictions improve with history; new users have no history — need smart cold-start defaults |
| Multiple Tracking Modes | Period, pregnancy, postpartum, and perimenopause all need different logic and UX |
| Anonymous / No-Account Mode | Supporting full functionality without cloud account for privacy-first users |

---

## Recommended Tech Stack
- **Mobile**: Android Native (Java) — min SDK API 24 (Android 7.0+)
- **Backend**: Node.js + Express.js + PostgreSQL (end-to-end encrypted data, optional cloud sync)
- **HTTP Client**: Retrofit 2 + OkHttp
- **Local DB / Offline**: Room Database + SQLCipher (AES-256 encryption at rest) — all cycle data encrypted locally
- **Charts**: MPAndroidChart — cycle calendar view, BBT temperature chart, symptom phase heatmap
- **Auth**: Firebase Auth (Android SDK) + Android BiometricPrompt API (fingerprint/face lock for app access)
- **Push Notifications**: Firebase Cloud Messaging (FCM) + Android AlarmManager — period reminders, pill reminders
- **PDF Export**: iText 7 for Android — doctor report with cycle history
- **Anonymous Mode**: Local-only Room Database with no Firebase account required; UUID-based identity
- **Architecture**: MVVM + LiveData + ViewModel (Android Jetpack)
