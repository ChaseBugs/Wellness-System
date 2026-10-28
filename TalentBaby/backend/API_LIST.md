# Talent Baby API - Complete Endpoint List

**Base URL**: `http://localhost:8000/api/v1`  
**Authentication**: Bearer Token (JWT)  
**Documentation**: `http://localhost:8000/api-docs`

---

## 🔐 Authentication APIs

### POST `/auth/signup`
- **Description**: User registration
- **Body**: `{ email, password, full_name }`
- **Response**: `{ token, user }`

### POST `/auth/login`
- **Description**: User login
- **Body**: `{ email, password }`
- **Response**: `{ token, user }`

---

## 👤 User Management APIs

### GET `/users/profile`
- **Description**: Get current user profile
- **Auth**: Required

### PUT `/users/profile`
- **Description**: Update user profile
- **Body**: `{ full_name, phone_number, gender, birthdate, profile_picture_url }`
- **Auth**: Required

### GET `/users/notifications/preferences`
- **Description**: Get notification preferences
- **Auth**: Required

### PUT `/users/notifications/preferences`
- **Description**: Update notification preferences
- **Body**: `{ growth_milestone_alerts, vaccination_reminders, ... }`
- **Auth**: Required

---

## 👶 Baby Profile APIs

### GET `/babies`
- **Description**: Get all babies for authenticated user
- **Auth**: Required
- **Response**: `[{ id, name, birth_date, gender, ... }]`

### POST `/babies`
- **Description**: Create new baby profile
- **Body**: `{ name, birth_date, gender, birth_weight_kg, birth_height_cm }`
- **Auth**: Required

### GET `/babies/:id`
- **Description**: Get baby profile by ID
- **Auth**: Required

### PUT `/babies/:id`
- **Description**: Update baby profile
- **Body**: `{ name, birth_date, gender, profile_picture_url, ... }`
- **Auth**: Required

### DELETE `/babies/:id`
- **Description**: Delete baby profile
- **Auth**: Required

---

## 📈 Growth Tracking APIs

### GET `/growth/baby/:babyId`
- **Description**: Get growth records for a baby
- **Auth**: Required
- **Response**: `[{ id, record_date, weight_kg, height_cm, head_circumference_cm, percentiles }]`

### POST `/growth`
- **Description**: Create new growth record
- **Body**: `{ baby_id, record_date, weight_kg, height_cm, head_circumference_cm, notes }`
- **Auth**: Required

### PUT `/growth/:id`
- **Description**: Update growth record
- **Auth**: Required

### DELETE `/growth/:id`
- **Description**: Delete growth record
- **Auth**: Required

### GET `/growth/baby/:babyId/chart`
- **Description**: Get growth chart data with WHO percentiles
- **Auth**: Required

---

## 🍼 Feeding Tracker APIs

### GET `/feeding/baby/:babyId`
- **Description**: Get feeding records for a baby
- **Auth**: Required
- **Response**: `[{ id, feeding_type, feeding_date, amount_ml, duration_minutes, notes }]`

### POST `/feeding`
- **Description**: Create new feeding record
- **Body**: `{ baby_id, feeding_type, feeding_date, amount_ml, duration_minutes, notes }`
- **Auth**: Required
- **feeding_type**: `breastfeeding | formula | solid | mixed | pump`

### PUT `/feeding/:id`
- **Description**: Update feeding record
- **Auth**: Required

### DELETE `/feeding/:id`
- **Description**: Delete feeding record
- **Auth**: Required

### GET `/feeding/baby/:babyId/statistics`
- **Description**: Get feeding statistics
- **Auth**: Required

### GET `/feeding/baby/:babyId/patterns`
- **Description**: Get feeding patterns analysis
- **Auth**: Required

### GET `/feeding/baby/:babyId/recommendations`
- **Description**: Get feeding recommendations
- **Auth**: Required

---

## 😴 Sleep Tracker APIs

### GET `/sleep/baby/:babyId`
- **Description**: Get sleep sessions for a baby
- **Auth**: Required
- **Response**: `[{ id, sleep_type, start_time, end_time, duration_minutes, notes }]`

### POST `/sleep`
- **Description**: Create new sleep session
- **Body**: `{ baby_id, sleep_type, start_time, end_time, notes }`
- **Auth**: Required
- **sleep_type**: `nap | night | bedtime`

### PUT `/sleep/:id`
- **Description**: Update sleep session
- **Auth**: Required

### DELETE `/sleep/:id`
- **Description**: Delete sleep session
- **Auth**: Required

### GET `/sleep/baby/:babyId/statistics`
- **Description**: Get sleep statistics
- **Auth**: Required

### GET `/sleep/baby/:babyId/patterns`
- **Description**: Get sleep patterns analysis
- **Auth**: Required

### GET `/sleep/baby/:babyId/recommendations`
- **Description**: Get sleep recommendations
- **Auth**: Required

---

## 🧷 Diaper Tracker APIs

### GET `/diaper/baby/:babyId`
- **Description**: Get diaper changes for a baby
- **Auth**: Required
- **Response**: `[{ id, change_date, diaper_type, notes }]`

### POST `/diaper`
- **Description**: Create new diaper change record
- **Body**: `{ baby_id, change_date, diaper_type, notes }`
- **Auth**: Required
- **diaper_type**: `wet | dirty | both`

### PUT `/diaper/:id`
- **Description**: Update diaper change record
- **Auth**: Required

### DELETE `/diaper/:id`
- **Description**: Delete diaper change record
- **Auth**: Required

### GET `/diaper/baby/:babyId/statistics`
- **Description**: Get diaper statistics
- **Auth**: Required

### GET `/diaper/baby/:babyId/patterns`
- **Description**: Get diaper patterns analysis
- **Auth**: Required

---

## 🎯 Activity System APIs

### GET `/activities`
- **Description**: Get all activities (with filters)
- **Query**: `?age_months=6&category=physical&talent_category_id=1`
- **Auth**: Required

### GET `/activities/:id`
- **Description**: Get activity details
- **Auth**: Required

### GET `/activities/baby/:babyId/completed`
- **Description**: Get completed activities for a baby
- **Auth**: Required

### POST `/activities/:id/complete`
- **Description**: Mark activity as completed
- **Body**: `{ baby_id, completion_date, notes, video_url }`
- **Auth**: Required

---

## 📅 Daily Plan APIs

### GET `/daily-plan/baby/:babyId`
- **Description**: Get daily plan for a baby
- **Auth**: Required
- **Response**: `{ date, activities: [{ id, title, category, ... }] }`

### POST `/daily-plan/generate`
- **Description**: Generate new daily plan
- **Body**: `{ baby_id, date }`
- **Auth**: Required

### PUT `/daily-plan/:id`
- **Description**: Update daily plan
- **Auth**: Required

### GET `/daily-plan/baby/:babyId/history`
- **Description**: Get daily plans history
- **Auth**: Required

---

## 📰 Daily Updates APIs

### GET `/daily-updates/baby/:babyId`
- **Description**: Get daily updates for a baby (age-appropriate tips)
- **Auth**: Required
- **Response**: `[{ id, content_type, title, content, age_in_months }]`

### GET `/daily-updates/baby/:babyId/today`
- **Description**: Get today's daily update
- **Auth**: Required

---

## 🎥 Video Content APIs

### POST `/video/upload`
- **Description**: Upload video
- **Content-Type**: `multipart/form-data`
- **Body**: `{ file, baby_id, title, description, tags }`
- **Auth**: Required

### GET `/video/baby/:babyId`
- **Description**: Get videos for a baby
- **Auth**: Required
- **Response**: `[{ id, title, video_url, thumbnail_url, created_at }]`

### GET `/video/:id`
- **Description**: Get video details
- **Auth**: Required

### DELETE `/video/:id`
- **Description**: Delete video
- **Auth**: Required

### POST `/video/link/milestone`
- **Description**: Link video to milestone
- **Body**: `{ video_id, milestone_id }`
- **Auth**: Required

### POST `/video/link/activity`
- **Description**: Link video to activity completion
- **Body**: `{ video_id, baby_activity_id }`
- **Auth**: Required

### GET `/video/milestone/:milestoneId`
- **Description**: Get videos linked to milestone
- **Auth**: Required

### GET `/video/activity/:babyActivityId`
- **Description**: Get videos linked to activity
- **Auth**: Required

---

## 🏆 Milestone APIs

### GET `/milestones/baby/:babyId`
- **Description**: Get milestones for a baby
- **Query**: `?category=physical&status=achieved`
- **Auth**: Required

### POST `/milestones`
- **Description**: Create new milestone
- **Body**: `{ baby_id, milestone_type, title, description, achieved_date }`
- **Auth**: Required

### PUT `/milestones/:id`
- **Description**: Update milestone
- **Auth**: Required

### DELETE `/milestones/:id`
- **Description**: Delete milestone
- **Auth**: Required

### GET `/milestones/categories`
- **Description**: Get milestone categories
- **Auth**: Required

---

## ⭐ Talent Assessment APIs

### GET `/talents/categories`
- **Description**: Get all talent categories
- **Auth**: Required
- **Response**: `[{ id, name, description }]`

### GET `/talents/baby/:babyId/assessments`
- **Description**: Get assessments for a baby
- **Auth**: Required

### POST `/talents/baby/:babyId/assess`
- **Description**: Create new assessment
- **Body**: `{ talent_category_id, answers: [{ question_id, answer }] }`
- **Auth**: Required

### GET `/talents/baby/:babyId/category/:talentCategoryId/history`
- **Description**: Get assessment history for a category
- **Auth**: Required

### GET `/talents/baby/:babyId/analysis`
- **Description**: Get talent analysis for a baby
- **Auth**: Required

---

## 📚 Content Library APIs

### GET `/articles`
- **Description**: Get articles (with filters)
- **Query**: `?category=nutrition&search=feeding`
- **Auth**: Required

### GET `/articles/:id`
- **Description**: Get article details
- **Auth**: Required

### POST `/articles/:id/bookmark`
- **Description**: Bookmark an article
- **Auth**: Required

### DELETE `/articles/:id/bookmark`
- **Description**: Remove bookmark
- **Auth**: Required

### GET `/articles/bookmarked`
- **Description**: Get bookmarked articles
- **Auth**: Required

---

## 🎓 Expert Classes APIs

### GET `/expert-classes`
- **Description**: Get expert classes
- **Query**: `?type=live|on-demand`
- **Auth**: Required

### GET `/expert-classes/:id`
- **Description**: Get class details
- **Auth**: Required

### POST `/expert-classes/:id/enroll`
- **Description**: Enroll in a class
- **Auth**: Required

---

## 🥗 Recipe & Nutrition APIs

### GET `/recipes`
- **Description**: Get recipes
- **Query**: `?age_months=6&category=blw|pureed`
- **Auth**: Required

### GET `/recipes/:id`
- **Description**: Get recipe details
- **Auth**: Required

### POST `/recipes/:id/favorite`
- **Description**: Add recipe to favorites
- **Auth**: Required

### GET `/recipes/favorites`
- **Description**: Get favorite recipes
- **Auth**: Required

---

## 📸 Memories & Timeline APIs

### GET `/memories/baby/:babyId`
- **Description**: Get memories for a baby
- **Query**: `?type=photo|video&date_from=&date_to=`
- **Auth**: Required

### POST `/memories`
- **Description**: Create memory (photo/video)
- **Body**: `{ baby_id, memory_type, media_url, title, description, memory_date }`
- **Auth**: Required

### GET `/memories/:id`
- **Description**: Get memory details
- **Auth**: Required

### PUT `/memories/:id`
- **Description**: Update memory
- **Auth**: Required

### DELETE `/memories/:id`
- **Description**: Delete memory
- **Auth**: Required

---

## 🤰 Pregnancy Tracking APIs

### GET `/pregnancy`
- **Description**: Get pregnancy profile
- **Auth**: Required

### POST `/pregnancy`
- **Description**: Create pregnancy profile
- **Body**: `{ due_date, last_menstrual_period, ... }`
- **Auth**: Required

### GET `/pregnancy-tracking/week/:week`
- **Description**: Get week-by-week pregnancy content
- **Auth**: Required

### GET `/pregnancy-tracking/current`
- **Description**: Get current week information
- **Auth**: Required

---

## 🛠️ Tools & Calculators APIs

### POST `/calculators/due-date`
- **Description**: Calculate due date
- **Body**: `{ last_menstrual_period | conception_date | ultrasound_date }`
- **Auth**: Optional

### POST `/calculators/ovulation`
- **Description**: Calculate ovulation
- **Body**: `{ cycle_length, last_period_date }`
- **Auth**: Optional

### GET `/calculators/name-generator`
- **Description**: Generate baby names
- **Query**: `?gender=male|female&origin=english`
- **Auth**: Optional

---

## ⏰ Reminders APIs

### GET `/reminders`
- **Description**: Get reminders for user
- **Auth**: Required

### POST `/reminders`
- **Description**: Create reminder
- **Body**: `{ baby_id, reminder_type, scheduled_time, message }`
- **Auth**: Required

### PUT `/reminders/:id`
- **Description**: Update reminder
- **Auth**: Required

### DELETE `/reminders/:id`
- **Description**: Delete reminder
- **Auth**: Required

---

## 📊 Reports & Analytics APIs

### GET `/reports/baby/:babyId/growth`
- **Description**: Generate growth report
- **Auth**: Required

### GET `/reports/baby/:babyId/feeding`
- **Description**: Generate feeding report
- **Auth**: Required

### GET `/reports/baby/:babyId/sleep`
- **Description**: Generate sleep report
- **Auth**: Required

### GET `/reports/baby/:babyId/development`
- **Description**: Generate development report
- **Auth**: Required

---

## 👥 Community APIs

### GET `/community/posts`
- **Description**: Get community posts
- **Query**: `?category=feeding&search=`
- **Auth**: Required

### POST `/community/posts`
- **Description**: Create post
- **Body**: `{ title, content, category }`
- **Auth**: Required

### GET `/community/posts/:id`
- **Description**: Get post details
- **Auth**: Required

### POST `/community/posts/:id/like`
- **Description**: Like a post
- **Auth**: Required

### POST `/community/posts/:id/comments`
- **Description**: Add comment
- **Body**: `{ content }`
- **Auth**: Required

---

## 🛒 Registry APIs

### GET `/registry`
- **Description**: Get registry items
- **Auth**: Required

### POST `/registry/items`
- **Description**: Add item to registry
- **Body**: `{ name, category, description, link }`
- **Auth**: Required

### PUT `/registry/items/:id`
- **Description**: Update registry item
- **Auth**: Required

### DELETE `/registry/items/:id`
- **Description**: Remove registry item
- **Auth**: Required

---

## 📖 Guides APIs (NEW - To Implement)

### GET `/guides/sleep`
- **Description**: Get sleep guide content
- **Query**: `?age_months=6`
- **Auth**: Required

### GET `/guides/sleep/tips`
- **Description**: Get sleep tips by age
- **Query**: `?age_months=6`
- **Auth**: Required

### GET `/guides/sleep/schedule`
- **Description**: Get sleep schedule recommendations
- **Query**: `?age_months=6`
- **Auth**: Required

### GET `/guides/feeding`
- **Description**: Get feeding guide content
- **Query**: `?age_months=6`
- **Auth**: Required

### GET `/guides/feeding/tips`
- **Description**: Get feeding tips by age
- **Query**: `?age_months=6`
- **Auth**: Required

### GET `/guides/feeding/age-guide`
- **Description**: Get age-by-age feeding guide
- **Query**: `?age_months=6`
- **Auth**: Required

### GET `/guides/feeding/adequacy`
- **Description**: Check if baby is getting enough (nutritional analysis)
- **Query**: `?baby_id=1`
- **Auth**: Required

---

## 📚 Bedtime Stories APIs (NEW - To Implement)

### GET `/stories`
- **Description**: Get bedtime stories
- **Query**: `?category=adventure&age_months=6`
- **Auth**: Required

### GET `/stories/:id`
- **Description**: Get story details
- **Auth**: Required

### GET `/stories/:id/audio`
- **Description**: Get story audio URL
- **Auth**: Required

### POST `/stories/:id/favorite`
- **Description**: Add story to favorites
- **Auth**: Required

### GET `/stories/favorites`
- **Description**: Get favorite stories
- **Auth**: Required

### GET `/stories/categories`
- **Description**: Get story categories
- **Auth**: Required

---

## 🔍 Content Browse by Topic APIs (NEW - To Implement)

### GET `/content/topics`
- **Description**: Get all content topics
- **Auth**: Required

### GET `/content/topic/:topicId`
- **Description**: Get content by topic
- **Query**: `?type=article|story|activity`
- **Auth**: Required

### GET `/content/search`
- **Description**: Search content across all types
- **Query**: `?q=feeding&type=article|story|activity`
- **Auth**: Required

---

## 📝 Notes

- All endpoints require authentication except:
  - `/auth/signup`
  - `/auth/login`
  - `/calculators/*` (optional)
  - `/health` (health check)

- All timestamps are in ISO 8601 format
- All dates are in YYYY-MM-DD format
- Pagination: Use `?page=1&limit=20` for list endpoints
- Filtering: Use query parameters for filtering

---

**Last Updated**: Based on current implementation  
**Version**: 1.0.0
