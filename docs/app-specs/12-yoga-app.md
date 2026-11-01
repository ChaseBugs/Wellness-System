# Yoga App

## Overview
A mobile app for guided yoga practice — offering pose libraries, structured classes, personalized plans, live or pre-recorded sessions, progress tracking, and meditation features.
Reference app: Pocket Yoga (https://apps.apple.com/us/app/pocket-yoga/id347400507)

---

## Features

### Core Features
- **Pose Library** — Illustrated and video guide for 100+ yoga poses with name (Sanskrit + English), instructions, benefits, and modifications
- **Guided Classes** — Pre-recorded video sessions by duration (10, 20, 45, 60 min) and level (beginner, intermediate, advanced)
- **Class Categories** — Morning yoga, relaxation, strength, flexibility, balance, prenatal, yin, vinyasa, etc.
- **Practice Plans** — Multi-week structured programs (e.g., "30-Day Beginner Journey")
- **Session Timer** — Customizable practice with pose sequences, hold durations, and audio cues
- **Meditation & Breathing** — Guided meditation and pranayama breathing exercises
- **Favorites** — Save favorite poses and classes

### Additional Features
- **Progress Tracker** — Log completed sessions; streak calendar; total practice time
- **Pose Difficulty Progression** — Suggest progressions as user levels up (e.g., advance from Tree Pose to Eagle Pose)
- **Music Integration** — Background ambient music during practice (curated playlists)
- **AI Pose Correction** — Camera-based real-time feedback on pose alignment using pose estimation
- **Live Classes** — Schedule and join live sessions with an instructor
- **Community** — Share practice logs, join challenges, follow other practitioners
- **Offline Download** — Download classes for offline practice
- **Apple Health / Google Fit Sync** — Log yoga minutes as exercise

---

## Application Logic

### Session Builder Logic
- User selects: duration target, focus area, difficulty level
- System selects a sequence of poses matching criteria
- Each pose has: duration (seconds), transition cue, audio instruction
- Session plays as a guided timer: count down hold time, voice cue to next pose

### Pose Recommendation Logic
- Beginner users start with foundational poses (Mountain, Child's Pose, Downward Dog)
- As user logs practice sessions, system unlocks intermediate → advanced poses
- Suggest related poses: "You practiced Warrior I, try Warrior II next"

### AI Pose Correction Logic (Advanced Feature)
- Access device camera during session (opt-in)
- Use MediaPipe Pose or TensorFlow Lite pose estimation to extract 33 keypoints
- Compare keypoint angles against reference pose angles (e.g., knee angle in Warrior II = 90°)
- Display visual feedback overlay and text corrections in real-time

### Progress & Streak Logic
- A practice day counts if at least one session was completed
- Streak increments each consecutive day with practice
- Weekly stats: sessions completed, total minutes, poses practiced
- Monthly heatmap calendar of activity

### Practice Plan Logic
- Plan is a sequence of daily sessions (some days may be rest days)
- User starts plan → locked to that day's session
- Completing a session marks the day done; progress advances
- Missed days do not expire the plan but are flagged for optional catch-up

---

## Challenges

| Challenge | Description |
|-----------|-------------|
| Video Streaming Quality | High-quality video without buffering during uninterrupted yoga sessions |
| Offline Video Storage | Downloaded classes take significant storage; need smart caching and cleanup |
| AI Pose Estimation Accuracy | Pose estimation varies with lighting, clothing, and camera angle |
| Content Production | Requires professional yoga video production and instructor partnerships |
| Pose Instruction Accessibility | Instructions must be clear for complete beginners with no prior yoga knowledge |
| Session Interruption Handling | Phone calls or notifications during practice must be handled gracefully |
| Diverse Body Types | Pose illustrations and instructions must account for different body types and limitations |
| Live Class Scheduling | Time zones, instructor availability, and real-time video infrastructure |

---

## Recommended Tech Stack
- **Mobile**: Android Native (Java) — min SDK API 24 (Android 7.0+)
- **Backend**: Node.js + Express.js + PostgreSQL
- **HTTP Client**: Retrofit 2 + OkHttp
- **Video Streaming**: ExoPlayer — HLS streaming via AWS CloudFront or Cloudflare Stream
- **Offline Video**: ExoPlayer DownloadManager — HLS segment caching for offline practice
- **AI Pose Correction**: MediaPipe Pose Android SDK + TensorFlow Lite (on-device, 33 keypoints at 30 fps)
- **Camera**: CameraX (Android Jetpack) — live pose correction camera feed
- **Live Classes**: Agora.io Android SDK — real-time group video (up to 20 participants)
- **Audio Cues**: Android MediaPlayer — pre-recorded pose instruction audio files
- **Local DB / Offline**: Room Database — session logs, practice history, downloaded class metadata
- **Auth**: Firebase Auth (Android SDK)
- **Push Notifications**: Firebase Cloud Messaging (FCM) — class reminders, streak alerts
- **Health Sync**: Google Health Connect API (Android) — log yoga minutes as exercise
- **Image Loading**: Glide
- **Architecture**: MVVM + LiveData + ViewModel (Android Jetpack)


Yoga and Mobile Usage
In 2026, the "Yoga Studio" is often in your pocket. Mobile technology has revolutionized how people practice:

App Growth: The yoga and meditation app market is valued at over $9 billion.

AI Personalization: Modern apps now use Artificial Intelligence to analyze a user's form through the phone camera or to create custom sequences based on heart rate and stress levels.

Hybrid Models: Most practitioners now use a "hybrid" approach—attending in-person classes once or twice a week while using mobile apps (like Glo, Daily Yoga, or Down Dog) for daily home practice.

Convenience: Mobile usage has lowered the "barrier to entry," allowing beginners to learn the basics privately before stepping into a public studio.

---

## Mentor-Trainee Platform Layer

### User Roles

#### Mentor
- A certified yoga instructor or personal coach who manages one or more trainees
- Can create and publish personalized practice plans, assign sessions, and set goals per trainee
- Reviews AI-generated form reports and adds manual annotations or voice notes
- Monitors trainee progress through a dedicated dashboard (completion rates, pose scores, biometric trends)
- Schedules in-person sessions and app-guided homework on a shared calendar
- Can build and reuse plan templates across multiple trainees
- Receives automated weekly digests and real-time alerts (missed sessions, form flags)

**Unique Mentor Capabilities**

**Video Lesson Studio**
- Record lessons directly in-app using the device camera, or upload pre-recorded video files
- Add chapter markers, pose name overlays, hold-duration cues, and transition instructions while editing
- Set metadata per lesson: difficulty level, duration, target body area, required props
- Publish lessons privately (assigned trainees only) or to the public marketplace for other users to purchase
- Lessons go through a self-review step before publishing — mentor can preview exactly what trainees see

**Trainee Video Review (Check & Correct)**
- Trainee uploads a video of themselves practicing a pose or sequence for mentor review
- Mentor receives a notification with a "pending review" badge on that trainee's profile
- Mentor review tools:
  - **Draw on frame** — freehand annotation directly on the video frame (highlight joint angles, alignment issues)
  - **Timestamped comments** — tap any point in the timeline to attach a text or voice note (e.g., "0:32 — knee caving inward, press outward")
  - **Voice-over recording** — record a spoken response that plays over the trainee's video
  - **Side-by-side comparison** — split screen between trainee's clip and the reference pose video
  - **Pose score** — rate the attempt per pose (1–5 stars or percentage alignment score)
  - **Status tag** — mark as "Approved ✓", "Needs Practice 🔄", or "Do Not Attempt ⚠ (injury risk)"
- Trainee receives the annotated review in their feed and must acknowledge before the session is marked complete

**Custom Pose & Sequence Builder**
- Mentor can create custom poses not in the standard library: upload reference image or video, add cue text, set keypoint targets for AI comparison
- Build custom sequences (flows) from standard + custom poses and reuse them across plans

**Assessment Rubric**
- Mentor defines a custom scoring rubric per pose (e.g., for Warrior II: knee at 90°, arms parallel to floor, gaze forward)
- AI uses the rubric when evaluating trainee recordings — scores are relative to mentor's standards, not a generic baseline
- Rubric can be shared with other mentors

**Certification & Badges**
- Mentor awards achievement badges to trainees (e.g., "Mastered Headstand", "Completed 30-Day Core Program")
- Badges appear on the trainee's profile and can be shared to social media
- Mentor can create custom badge designs for their own program

**Live Group Class**
- Host a live session for multiple trainees simultaneously (video call with up to 20 participants)
- Trainees' cameras are optional; mentor's camera is the primary stream
- Mentor can spotlight a trainee's video to give live individual feedback to the group

**Scheduling & Booking**
- Mentor sets available time slots per week for live 1-on-1 or group sessions
- Trainees book directly from the app — calendar syncs both sides
- Automated reminders 24h and 1h before each session

**Mentor Profile & Portfolio**
- Public profile page with: specializations, certifications, years of experience, teaching style, languages
- Student count, average rating, and published lesson count displayed
- Trainees can discover and request to follow a mentor from the public profile

**Revenue & Billing**
- Mentor sets a monthly subscription price per trainee or a one-time fee for a specific plan
- In-app payments handled by the platform (Stripe); mentor receives a payout minus platform fee
- Can offer free trials or discount codes

#### Trainee
- A student paired with one or more mentors, or practicing independently
- Follows a plan assigned by their mentor (daily sessions, rest days, homework)
- Can record practice sessions for AI form analysis and mentor review
- Receives mentor feedback directly in the app as annotated video overlays or voice notes
- Sees a shared calendar showing upcoming in-person sessions and assigned app sessions
- Tracks personal progress: streak, total practice time, pose improvement scores, XP/level
- Can message their mentor and acknowledge received feedback

---

### Role: Mentor vs Trainee

The app supports two modes — **Trainee** and **Mentor**. Mentors get a dashboard to manage students; trainees get the standard practice UI.

---

### Feature Expansion: AI Personalization (Mentor Context)

**Async Form Review**
- Trainee records a practice session → AI runs pose estimation and generates an alignment report (keypoint angles, deviation scores per pose)
- Mentor receives the report in their dashboard — can annotate the video frame, add voice notes, mark corrections
- Trainee receives mentor-annotated feedback with visual overlays

**Biometric-Aware Plan Adaptation**
- If trainee wears Apple Watch / Wear OS, heart rate and HRV (stress indicator) sync daily
- High HRV stress day → AI flags to mentor: "Consider swapping tomorrow's power flow for restorative"
- Mentor can auto-approve AI suggestions or manually override
- Low resting heart rate trend over weeks → AI signals fitness improvement → mentor prompted to escalate difficulty

**Injury Flag System**
- AI detects potentially dangerous form patterns (hyperextended knee, collapsing lower back)
- Sends mentor an alert before trainee practices the flagged pose again
- Mentor can add a "modification required" note that shows in-session for the trainee

**AI Plan Generator**
- Mentor inputs trainee's intake data (injuries, goals, experience, available days/week)
- AI generates a draft multi-week plan
- Mentor reviews, edits, and publishes — not fully automated, mentor stays in control

---

### Feature Expansion: Hybrid Model (Mentor Context)

**Shared Calendar**
- Mentor and trainee share a session calendar
- In-person sessions are marked separately from app-guided sessions
- Trainee sees their week: "Mon — in-person with mentor | Wed, Fri — app session (assigned)"

**Post-Session Mentor Notes**
- After every in-person session, mentor opens the trainee's profile and logs what was practiced, specific corrections made, and what to focus on next time
- Notes appear in trainee's app under "My Mentor's Notes"

**Homework Assignment**
- Mentor assigns specific poses or classes as practice between in-person sessions
- Trainee sees "Assigned by Mentor" badge on those sessions
- Mentor sees completion status when trainee finishes

**Live Check-In (short form)**
- A 5-minute live video call inside the app (not a full class)
- Mentor watches trainee hold 2–3 poses and gives real-time verbal feedback
- Useful for quick form checks between full in-person sessions

---

### Feature Expansion: Convenience / Lower Barrier (Mentor Context)

**Trainee Onboarding Flow**
- New trainee fills intake form: injuries, body limitations, goals, experience level, available days/week
- Intake data pre-populates the AI Plan Generator for the mentor
- Mentor doesn't need to manually interview trainee — data is already structured

**Plan Template Library**
- Mentor builds reusable templates: "4-Week Beginner Hip Opener", "Pre-Natal Trimester 2 Flow"
- Templates can be assigned to multiple trainees with one tap, then customized per person
- Mentors can publish templates to a marketplace for other mentors to buy/use

**Mentor Dashboard**
- At-a-glance view: who practiced today, who missed, who has a form alert
- Shows trainee name, current plan day, last practice date, and pending actions
- One-tap to open any trainee's full profile, plan, and session history

**Weekly Progress Digest (auto-generated)**
- Every Sunday, mentor receives a digest per trainee: sessions completed vs assigned, pose consistency scores, biometric trend (if available), AI-suggested plan adjustment for next week

---

### New Application Logic

**Mentor Plan Assignment Logic**
- Mentor creates a plan (sequence of daily sessions with rest days) and assigns it to a trainee with a start date
- System locks trainee to that day's session until completed
- Mentor can push mid-plan edits (swap a session) — trainee receives a notification

**Feedback Delivery Logic**
- After AI analysis, mentor annotates a video frame → stored as an annotation object (timestamp, keypoint reference, text/audio note)
- Trainee app plays back the recorded session with overlay annotations appearing at the correct timestamp
- Annotations are read-only for trainee, editable by mentor until trainee marks them "acknowledged"

**Adaptive Difficulty Logic**
- Each week, if completion rate ≥ 90% and average pose score ≥ 80% → AI flags "ready to progress" → mentor is prompted
- If completion rate < 60% → AI flags "struggling" → mentor prompted to simplify or reach out
- If HRV stress score exceeds threshold on 3+ days in a week → suggest swapping next power session with restorative

---

### New Challenges

| Challenge | Description |
|-----------|-------------|
| Mentor ↔ Trainee Data Sync | Plan edits by mentor must push to trainee in real-time without disrupting an active session |
| AI Annotation Accuracy | Flagging dangerous form must have low false positives — wrong alerts erode mentor trust |
| Biometric Privacy | Heart rate and stress data is sensitive health data (HIPAA-adjacent) — requires explicit consent and encrypted storage |
| Mentor Cognitive Load | Dashboard with 20+ trainees must surface the most important alerts without overwhelming the mentor |
| Async Feedback Latency | Trainees expect quick feedback; mentor may review reports hours later — set expectation clearly in UI |