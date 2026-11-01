# Health-Track (Detect System) — Using AI Model

## Overview
An AI-powered health monitoring and early detection app that analyzes user health data — vitals, symptoms, lifestyle inputs, and wearable data — to detect potential health issues early and provide personalized health insights.

---

## Features

### Core Features
- **Symptom Checker** — User inputs current symptoms; AI provides possible conditions and urgency level
- **Vital Signs Logging** — Log blood pressure, heart rate, blood glucose, SpO2, temperature
- **Wearable Integration** — Pull data from Apple Watch, Fitbit, Garmin, or similar wearables
- **AI Health Risk Assessment** — Analyze logged data patterns to flag potential risk indicators
- **Health Timeline** — Full history of vitals, symptoms, and AI alerts in a timeline view
- **Personalized Insights** — Trend analysis and personalized health tips based on user data
- **Medication Tracker** — Log medications, dosages, schedules; get missed dose alerts
- **Doctor Report** — Generate shareable health summary report for doctor visits

### Detection Modules (AI-Powered)
- **Skin Condition Detection** — Analyze skin lesion photos for signs of dermatological conditions
- **Respiratory Analysis** — Cough detection and classification via microphone
- **Mental Health Screening** — PHQ-9 / GAD-7 validated questionnaires with trend tracking
- **Diabetes Risk Scoring** — FINDRISC or ADA risk calculator based on lifestyle inputs
- **Hypertension Risk** — Blood pressure trend analysis with alert thresholds
- **Sleep Apnea Screening** — Sleep pattern and snoring analysis (if wearable provides data)

### Additional Features
- **Emergency SOS** — One-tap emergency contact + location sharing
- **Health Goals** — Set and track targets (blood pressure under 120/80, steps per day)
- **Reminders** — Medication, vital logging, hydration, exercise reminders
- **Community / Support** — Connect with others managing similar conditions (moderated)

---

## Application Logic

### Symptom Checker Logic
- User selects body area → picks symptoms from a curated list (or types free-form)
- NLP model maps free-form text to standardized medical symptom terms
- Inference engine or trained model (e.g., fine-tuned on symptom–condition dataset) returns:
  - Top 3–5 possible conditions with probability/confidence
  - Urgency level: self-care / see a doctor soon / go to ER immediately
- Always appended with medical disclaimer

### Vital Signs Anomaly Detection Logic
- Establish baseline from first 2 weeks of user data
- Statistical anomaly detection: flag readings > 2 standard deviations from user's personal baseline
- Rule-based hard alerts (e.g., SpO2 < 90% = critical alert regardless of baseline)
- Trend alerts: "Your blood pressure has been consistently elevated for 5 days"

### Skin Detection Logic
- User photographs skin lesion
- Image preprocessed (resize, normalize) → sent to CNN model (trained on ISIC dataset)
- Model classifies: benign / suspicious / malignant (melanoma risk)
- Return confidence score and recommendation (low risk: monitor / high risk: see dermatologist)

### Risk Score Logic
- FINDRISC (Diabetes): 8-question form → weighted score → risk category (low/moderate/high/very high)
- Hypertension: JNC 8 or AHA/ACC guidelines applied to logged BP readings and user profile
- Scores stored with date; show trend over time

---

## Challenges

| Challenge | Description |
|-----------|-------------|
| Medical AI Liability | AI health insights must be carefully scoped; incorrect outputs could cause harm or legal issues |
| Model Accuracy & Bias | Health AI models must be validated across diverse populations; bias can cause harm |
| Regulatory Compliance | May require FDA, CE, or local health authority clearance depending on features |
| Data Privacy | Extremely sensitive data; requires HIPAA / PDPA compliance and strong encryption |
| Wearable API Fragmentation | Apple Health, Google Fit, Fitbit, Garmin all have different APIs and data models |
| Cold Start | New users have no baseline; early insights will be low quality |
| False Positives | Generating too many alerts erodes trust; false negatives are dangerous |
| Offline AI Inference | On-device inference needed for privacy and offline use; model size must be optimized |

---

## Recommended Tech Stack
- **Mobile**: Android Native (Java) — min SDK API 24 (Android 7.0+)
- **Backend**: Node.js + Express.js + PostgreSQL (TimescaleDB extension for vitals time-series)
- **HTTP Client**: Retrofit 2 + OkHttp
- **On-Device AI**: TensorFlow Lite for Android — skin lesion classifier, cough sound classifier (runs offline)
- **Symptom NLP (Server)**: BioBERT / ClinicalBERT fine-tuned model served via Python FastAPI microservice, called internally by Express.js
- **Skin Detection (Server)**: EfficientNet CNN (ISIC 2020 dataset) served via FastAPI microservice
- **Camera**: CameraX (Android Jetpack) — skin lesion photo capture
- **Audio**: Android AudioRecord API — cough recording for respiratory analysis
- **Wearable Sync**: Google Health Connect API (Android) — pulls data from Fitbit, Garmin, Wear OS
- **Security**: SQLCipher for Room Database (AES-256 at rest); TLS 1.3 in transit
- **Push Notifications**: Firebase Cloud Messaging (FCM) — medication and vital logging reminders
- **PDF Reports**: iText 7 for Android — health summary PDF for doctor visits
- **Auth**: Firebase Auth (Android SDK)
- **Architecture**: MVVM + LiveData + ViewModel (Android Jetpack)
