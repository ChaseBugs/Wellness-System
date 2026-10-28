# Baby Grow App

## Overview
A mobile app to help parents track and monitor their baby's growth, development milestones, health records, and daily activities.

---

## Features

### Core Features
- **Growth Tracking** — Log weight, height, and head circumference over time with chart visualization
- **Milestone Tracker** — Track developmental milestones (rolling, crawling, walking, first words) by age
- **Feeding Log** — Track breastfeeding, bottle feeding (time, duration, amount)
- **Sleep Tracker** — Log sleep/wake cycles with duration and quality notes
- **Diaper Log** — Track diaper changes (wet/dirty/dry) with timestamps
- **Vaccination Schedule** — Track completed and upcoming vaccines with reminders
- **Health Records** — Store doctor visits, allergies, medications, and notes
- **Daily Activity Log** — Tummy time, play, bath, and mood tracking

### Additional Features
- **Growth Percentile Charts** — WHO/CDC standard growth chart comparison
- **Multiple Baby Profiles** — Support for twins or multiple children
- **Caregiver Sharing** — Share access with partner, grandparents, or nanny
- **Photo Timeline** — Add photos tied to milestones or dates
- **Reminders & Notifications** — Feeding intervals, sleep schedules, vaccine reminders
- **Export Reports** — PDF export of health records for doctor visits

---

## Application Logic

### Growth Chart Logic
- Store measurements with timestamps
- Calculate percentile using WHO Child Growth Standards (LMS method)
- Render line chart with age on X-axis and measurement on Y-axis
- Overlay percentile bands (3rd, 15th, 50th, 85th, 97th)

### Milestone Logic
- Define milestone list per age range (e.g., 3–4 months: holds head up)
- Mark milestone as achieved with date
- Flag delayed milestones if not achieved within expected window (show alert, not diagnosis)

### Feeding Timer Logic
- Start/stop timer for breastfeeding (left/right breast tracking)
- Calculate average feed interval to predict next feed time
- Alert if baby hasn't fed within a defined threshold (e.g., 4 hours for newborns)

### Sleep Pattern Logic
- Log start/end sleep times
- Calculate total sleep per day and compare against age-appropriate recommendations
- Visualize sleep blocks on a timeline chart

---

## Challenges

| Challenge | Description |
|-----------|-------------|
| WHO Percentile Calculation | Implementing the LMS statistical method accurately for growth charts |
| Real-time Sync | Syncing logs between multiple caregivers without conflicts |
| Offline Support | App must work without internet; sync when back online |
| Data Privacy | Baby health data is sensitive — requires encryption and secure storage |
| Timezone Handling | Families may travel; logs must be timezone-aware |
| Notification Scheduling | Dynamic reminders that adjust based on actual feeding/sleep patterns |
| Accessibility | Parents often use the app one-handed while holding a baby |

---

## Recommended Tech Stack
- **Mobile**: Android Native (Java) — min SDK API 24 (Android 7.0+)
- **Backend**: Node.js + Express.js + PostgreSQL
- **HTTP Client**: Retrofit 2 + OkHttp
- **Charts**: MPAndroidChart — WHO growth percentile curves, sleep timeline bar chart
- **Local DB / Offline**: Room Database (Jetpack) + WorkManager — offline-first logs, background sync
- **Image Loading**: Glide — milestone photo display
- **Auth**: Firebase Auth (Android SDK) — email + Google Sign-In; family invite via Firebase Dynamic Links
- **Push Notifications**: Firebase Cloud Messaging (FCM) — feeding, vaccine, and sleep reminders
- **Image Storage**: Firebase Storage — milestone photos
- **PDF Export**: iText 7 for Android — health record PDF for doctor visits
- **Architecture**: MVVM + LiveData + ViewModel (Android Jetpack)
