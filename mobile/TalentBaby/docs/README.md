# 🌱 Talent Baby

A comprehensive mobile application for tracking baby growth, development milestones, and personalized talent development from birth to 10 years.

## ✨ Features

### 📏 Growth & Health Tracking
- Height/weight charts with WHO standards
- Head circumference tracking
- Vaccination reminders and records
- BMI calculation and percentile tracking
- Growth chart visualizations

### 🧠 Development Milestones
- Cognitive milestones tracking
- Motor skills development
- Social & emotional development
- Language development
- Alerts for potential delays (general guidance)

### 🌟 Talent Development System (Unique Feature)
- **7 Talent Categories**: Creativity, Music Sensitivity, Logical Thinking, Language Ability, Physical Coordination, Social Leadership, Curiosity & Problem-Solving
- Mini assessments (fun, parent-guided activities)
- Personalized talent paths and recommendations
- Weekly "talent missions"
- Progress tracking with badges
- AI-generated insights and recommendations

### 📸 Memory Timeline
- Monthly photo/video timeline
- Auto-generated "growth story" for each child
- Smart tags (first smile, first steps, first words)
- Memory organization by date

### 📚 Activity & Materials Library
- Age-appropriate activities (0-10 years)
- Indoor/outdoor activity ideas
- STEM, art, music, language, emotional skills activities
- Personalized material recommendations (books, toys, games)
- Activity assignment and completion tracking

### 👤 User Features
- Multiple baby profiles per user
- User profile management
- Notification preferences
- Multi-language support (English, Korean)

## 🏗️ Project Structure

```
Talent-Baby/
├── mobile/          # Android Native Frontend
│   ├── app/         # Android application module
│   └── build.gradle # Project-level Gradle config
└── backend/         # Express.js Backend
    ├── src/         # TypeScript source code
    ├── database/    # Database schema and migrations
    └── logs/        # Application logs
```

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 18.18.0
- **Language**: TypeScript 5.3.3
- **Framework**: Express.js 4.18.2
- **Database**: PostgreSQL (pg 8.11.3)
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Validation**: express-validator 7.0.1
- **Logging**: Winston 3.11.0
- **API Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, Compression

### Mobile
- **Language**: Java 8
- **Min SDK**: 24 (Android 7.0)
- **Target SDK**: 33 (Android 13)
- **Networking**: Retrofit 2.9.0, OkHttp 4.11.0
- **Database**: Room 2.5.0
- **UI**: Material Design Components

## Mobile UI Notes

- Home screen date selector animation: tapping the left or right date in Today's Development Plan keeps the existing date-selection logic, but visually slides the three date labels as a horizontal strip. The activities list then fades/slides in after the selected date refreshes.

## 🚀 Quick Start

### Backend Setup

1. **Prerequisites**: 
   - Node.js 18.18.0
   - PostgreSQL database

2. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Create `.env` file** with required variables:
   ```env
   NODE_ENV=development
   PORT=3004
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=talent_baby_db
   DB_USER=postgres
   DB_PASSWORD=your_password_here
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRES_IN=7d
   LOG_LEVEL=info
   ```

5. **Setup PostgreSQL database**:
   ```bash
   # Create database
   createdb talent_baby_db
   
   # Run schema
   psql -U postgres -d talent_baby_db -f database/schema.sql
   ```

6. **Run development server**:
   ```bash
   npm run dev
   ```

7. **Access API Documentation**: 
   - Swagger UI: `http://localhost:3004/api-docs`
   - Health Check: `http://localhost:3004/health`

### Mobile Setup

1. **Prerequisites**:
   - Android Studio
   - JDK 8 or higher
   - Android SDK 24+

2. **Open project** in Android Studio

3. **Sync Gradle files**

4. **Ensure backend is running** (see Backend Setup above)

5. **Update API base URL** if needed (default: `http://10.0.2.2:3004` for emulator)

6. **Run on emulator or physical device**

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Register new user
- `POST /api/v1/auth/login` - Login user

### Users
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `GET /api/v1/users/notifications/preferences` - Get notification preferences
- `PUT /api/v1/users/notifications/preferences` - Update notification preferences

### Babies
- `GET /api/v1/babies` - Get all babies for user
- `POST /api/v1/babies` - Create baby profile
- `GET /api/v1/babies/:id` - Get baby by ID
- `PUT /api/v1/babies/:id` - Update baby profile
- `DELETE /api/v1/babies/:id` - Delete baby profile

### Growth Tracking
- `GET /api/v1/growth/baby/:babyId` - Get growth records
- `POST /api/v1/growth` - Create growth record
- `PUT /api/v1/growth/:id` - Update growth record
- `DELETE /api/v1/growth/:id` - Delete growth record
- `GET /api/v1/growth/baby/:babyId/chart` - Get growth chart data

### Milestones
- `GET /api/v1/milestones/baby/:babyId` - Get milestones
- `POST /api/v1/milestones` - Create milestone
- `PUT /api/v1/milestones/:id` - Update milestone
- `DELETE /api/v1/milestones/:id` - Delete milestone

### Talent Development
- `GET /api/v1/talents/categories` - Get talent categories
- `GET /api/v1/talents/baby/:babyId/assessments` - Get assessments
- `POST /api/v1/talents/assessments` - Create assessment
- `GET /api/v1/talents/baby/:babyId/progress` - Get talent progress
- `GET /api/v1/talents/baby/:babyId/missions` - Get talent missions
- `POST /api/v1/talents/missions` - Create talent mission

### Activities
- `GET /api/v1/activities` - Get activities (with filters)
- `GET /api/v1/activities/baby/:babyId` - Get baby's activities
- `POST /api/v1/activities/assign` - Assign activity to baby

### Materials
- `GET /api/v1/materials` - Get materials (with filters)
- `GET /api/v1/materials/baby/:babyId/recommendations` - Get recommendations

### Memories
- `GET /api/v1/memories/baby/:babyId` - Get memories
- `POST /api/v1/memories` - Create memory
- `PUT /api/v1/memories/:id` - Update memory
- `DELETE /api/v1/memories/:id` - Delete memory
- `GET /api/v1/memories/baby/:babyId/timeline` - Get memory timeline

All endpoints (except auth) require JWT authentication via `Authorization: Bearer <token>` header.

## 🗄️ Database Schema

The database includes tables for:
- Users and authentication
- Baby profiles
- Growth records with WHO percentiles
- Vaccination records
- Development milestones
- Talent categories and assessments
- Talent progress and missions
- Activity library and assignments
- Material recommendations
- Memory timeline
- Growth stories
- AI insights

See `backend/database/schema.sql` for complete schema.

## 🏛️ Architecture

### Backend
- **Layered Architecture**: Controllers → Services → Repositories → Database
- **Dependency Injection**: Constructor injection
- **Repository Pattern**: Abstract database operations
- **Service Layer**: Business logic separation

### Frontend
- **Activity-Based**: Current architecture
- **Repository Pattern**: For data management
- **MVVM/MVP**: Recommended for future migration

## 📝 Development

See `.cursorrules` for detailed development guidelines and architecture patterns.

## 🔒 Security

- JWT token authentication
- Password hashing with bcryptjs
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- CORS configuration
- Helmet for security headers

## 📄 License

ISC
