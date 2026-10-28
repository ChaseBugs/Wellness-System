# AR/AI Hair Style App

## Overview
A mobile app that uses augmented reality and AI to let users virtually try on hairstyles from a curated in-app style library in real time using their phone camera — then connect with nearby salons or stylists to book the look.

---

## Features

### Core Features
- **Style Library** — Browse 500+ curated hairstyles filtered by length (short/medium/long), gender, texture (straight/wavy/curly/coily), and occasion
- **Live AR Try-On** — Tap any style from the library to instantly overlay it on the live camera feed using real-time face mesh tracking
- **Selfie-Based Try-On** — Upload a photo and apply any listed style statically with AI-powered hair segmentation
- **AI Style Recommender** — Analyzes face shape, skin tone, and hair texture to recommend the most flattering styles from the library
- **Save & Share** — Save before/after comparisons and share to Instagram, TikTok, or WhatsApp
- **Salon Booking** — Find nearby salons, show them the selected style, and book an appointment in-app

### Additional Features
- **Hair Health Scanner** — Analyze scalp and hair condition from a photo (dryness, oiliness, breakage, thinning) and suggest treatments
- **Style History** — Timeline of all styles tried with ratings and notes
- **Trending Styles Feed** — Curated daily feed of trending cuts from the style library, surfaced by popularity and season
- **Celebrity Match** — Match the user's face shape to celebrity hairstyles available in the library and try them on instantly
- **Stylist Portfolio** — Stylists can upload before/after work; users browse, pick a style, and book directly
- **Step-by-Step Guides** — DIY tutorials linked to each style in the library for at-home trims and braids
- **Virtual Consultation** — Video call with a licensed stylist to plan a look before booking

---

## Application Logic

### Face Shape Detection Logic
- Capture frontal face photo or live frame
- Run facial landmark detection (68 key points: jaw, cheekbones, forehead width, chin)
- Classify face shape using geometric ratios:
  ```
  Oval:      forehead ≈ jaw, face length > width × 1.5
  Round:     width ≈ length, soft jaw
  Square:    forehead ≈ jaw ≈ cheekbones, angular jaw
  Heart:     forehead > jaw, narrow chin
  Oblong:    face length >> width, narrow throughout
  Diamond:   cheekbones > forehead > jaw
  ```
- Map each shape to a ranked list of flattering styles and styles to avoid
- Confidence score shown to user — low confidence prompts a retake or manual selection

### AR Hair Overlay Logic
- Use device camera stream at 30 fps
- Run face mesh model (MediaPipe or ARKit Face Anchor) to get 468 facial landmarks per frame
- Hair segmentation model separates existing hair from face/background (pixel-wise mask)
- Warp 3D hair mesh to align with user's head pose (pitch, yaw, roll from face landmarks)
- Apply lighting estimation from ARCore/ARKit to shade the virtual hair realistically
- Blend virtual hair layer with camera feed at 60%–85% opacity (adjustable)
- Maintain temporal consistency across frames to prevent flickering (Kalman filter on landmark positions)

### Style Library & Try-On Flow Logic
- Style library is stored as a structured catalog: each style entry contains name, category tags, preview image, 3D mesh asset, and compatible face shapes
- User opens the library → browses or searches → taps a style card → AR try-on launches immediately with that style loaded
- Style switching: user swipes left/right in the try-on view to cycle through styles without leaving the camera screen
- Each style mesh is pre-rigged to the standard head template; at runtime it is warped to the user's head dimensions derived from face landmarks (interpupillary distance used as scale reference)
- Library is updated server-side (new styles pushed via CDN); app downloads only metadata on launch and fetches mesh assets on first try-on (cached locally after that)

### AI Style Recommendation Logic
- Input features: face shape, hair texture (straight/wavy/curly/coily), hair density (fine/medium/thick), preferred length, occasion tag
- Recommendation model: content-based filtering using a style feature matrix
  - Each style is tagged with: face shapes it suits, textures it works on, maintenance level (low/medium/high), occasion suitability
- Score each style: `score = Σ (feature_match_weight × match_score)`
- Return top 10 styles ranked by score; user can filter by maintenance level or occasion
- Collect explicit feedback (thumbs up/down on suggestions) to fine-tune personal weights over sessions

### Hair Health Scanner Logic
- User photographs scalp under good lighting (guided overlay for positioning)
- Run image classifier on scalp region patches:
  - Oiliness: sebum shine detection (high-brightness patches near roots)
  - Dryness / flakiness: texture variance in scalp region
  - Thinning: hair density estimation per cm² vs. reference baseline
  - Breakage: detect short broken strands in mid-shaft or ends region
- Output a hair health score (0–100) with category breakdown
- Suggest products and routines matched to detected conditions

### Salon Booking Logic
- User selects a style from the library → app packages: style image, style name, style ID, and any notes
- Show nearby salons (radius configurable: 2 km default) sorted by rating and next available slot
- Stylist receives the style brief as part of the booking details
- Booking confirmation via push notification and calendar event
- Post-appointment: user prompted to upload a photo of the result and rate the stylist

---

## Challenges

| Challenge | Description |
|-----------|-------------|
| Real-Time AR Performance | Hair mesh warping at 30+ fps on mid-range Android devices without thermal throttling |
| Diverse Hair Textures | AR and segmentation models trained mostly on straight hair; accuracy drops for coily and loc'd hair |
| Hair Occlusion | Glasses, earrings, and accessories partially occlude the hair region and must be handled correctly |
| Model Bias | Style recommendations must avoid reinforcing Eurocentric beauty standards as the default |
| Stylist Quality Control | User-submitted stylist portfolios need moderation to prevent fake or misleading before/afters |
| Privacy | Facial data is sensitive — on-device processing preferred; no raw face images stored server-side |
| Thin / Bald Regions | Users with significant hair loss may get poor AR results; graceful fallback needed |

---

## Recommended Tech Stack
- **Mobile**: Android Native (Java) — min SDK API 24 (Android 7.0+)
- **Backend**: Node.js + Express.js + PostgreSQL — user profiles, style library catalog, booking records
- **HTTP Client**: Retrofit 2 + OkHttp
- **AR Framework**: ARCore Android SDK — face mesh tracking, head pose estimation (pitch/yaw/roll), lighting estimation
- **Face Landmark Detection**: MediaPipe Face Mesh Android SDK — 468 landmarks at 30 fps on-device
- **Hair Segmentation**: TensorFlow Lite for Android — on-device semantic segmentation (MODNet or custom-trained)
- **3D Hair Rendering**: SceneView (ARCore + Filament renderer for Android) — 3D hair mesh overlay on camera feed
- **Camera**: CameraX (Android Jetpack) — live AR camera feed and selfie photo upload
- **AI Recommendations**: Collaborative filtering model served via Python FastAPI microservice, called via Express.js
- **Salon Booking**: REST API + Stripe Android SDK — in-app booking deposits
- **Push Notifications**: Firebase Cloud Messaging (FCM) — booking confirmations and appointment reminders
- **Image / Mesh Storage**: AWS S3 (via backend) — style mesh assets, user saved looks, stylist portfolios
- **Image Loading**: Glide
- **Auth**: Firebase Auth (Android SDK) — email + Google Sign-In
- **Architecture**: MVVM + LiveData + ViewModel (Android Jetpack)
