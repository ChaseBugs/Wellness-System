# Wellness Ecosystem 2027

## A mobile app group for health, fitness, nutrition, and beauty built on BabyGrow, FoodVisior, and HeightIncrease

Starting with the three existing apps—BabyGrow, FoodVisior, and HeightIncrease—this strategy outlines a Wellness Ecosystem that could eventually support 12–15 apps.

The core strategy is:

- **Multi-app:** Acquire new users through standalone apps in Google Play and the App Store.
- **Multi-category:** Expand across Family, Nutrition, Fitness, Mindfulness, and Beauty.
- **Shared platform:** Run common accounts, content, AI, subscriptions, analytics, and recommendations.
- **Cross-app growth:** Connect users naturally to other apps that meet their next need.
- **Portfolio management:** Invest more in strong apps; combine or discontinue weak ones.

Launching 15 apps at once is not recommended. First validate a portfolio of six to eight apps, including the existing three, then expand.

## 1. Overall app portfolio

**Wellness Group:** Health · Family · Nutrition · Fitness · Beauty

| Product line | Candidate apps | Purpose |
| --- | --- | --- |
| **Family & Growth** | BabyGrow; HeightIncrease; Kids Nutrition; Pregnancy Tracker | Growth and family health |
| **Food & Nutrition** | FoodVisior; Healthy Recipes; Cookies & Baking; Meal Planner | Food, eating habits, and cooking |
| **Fitness & Mind** | Daily Workout; Daily Yoga; Stretch & Posture; Sleep & Meditation | Exercise, recovery, and mental well-being |
| **Beauty & Self-Care** | Makeup Tutorial; Skincare Routine; Face Yoga; Haircare Guide | Beauty and self-care |

**Shared Wellness Platform:** Identity · Membership · Content CMS · AI · Analytics · Recommendations

These 16 apps are long-term product candidates. The plan does not call for launching all 16 as standalone apps.

## 2. Detailed plans by category

### A. Family & Growth

**Primary audience:** Pregnant people, parents, and caregivers of growing children.

This product line helps families track growth and healthy habits over time. Because trust matters in this category, the main value should come from reliable records and an experience people continue to use, rather than content alone.

| App | Core features | Main monetization |
| --- | --- | --- |
| BabyGrow **(existing)** | Growth records, feeding and sleep logs, developmental checklists, caregiver sharing | Premium records and reports |
| HeightIncrease **(existing)** | Height records, growth trends, posture and activity routines, nutrition content for growing children | Program subscription |
| Kids Nutrition | Age-specific meal plans, allergy filters, support for picky eating, lunchbox recipes | Meal-plan packages |
| Pregnancy Tracker | Week-by-week information, checklists, appointment records, birth preparation | Premium content |

**Connection strategy:** If BabyGrow users frequently look for meal tracking, recommend Kids Nutrition. As children get older, connect families to age-appropriate growth and activity features.

Growth predictions and physical development features must use validated standards. Do not promise that a particular exercise or diet will make a child taller.

### B. Food & Nutrition

**Primary audience:** People managing their weight, people who exercise at home, cooking enthusiasts, and family meal planners.

Use FoodVisior as the starting point, expanding from food recognition and logging into actual cooking and meal-plan execution.

| App | Core features | Main monetization |
| --- | --- | --- |
| FoodVisior **(existing)** | Food-photo analysis, estimated nutrition information, meal logging, goal tracking | AI analysis and subscriptions |
| Healthy Recipes | Healthy recipes, ingredient search, cooking instructions, shopping lists | Premium recipes |
| Cookies & Baking | Cookie and dessert recipes, quantity conversion, step-by-step baking timers | Ads and recipe packs |
| Meal Planner | Automatically generated seven-day plans, budget and nutrition goals, shopping lists | Meal-plan generation subscription |

**Example user flow:**

1. **FoodVisior:** Log today's meals and analyze estimated nutrition.
2. **Healthy Recipes:** Recommend a dinner recipe that fits the user's food goals.
3. **Meal Planner:** Turn selected dishes into a seven-day plan and shopping list.
4. **FoodVisior:** Log the meals the user actually makes and eats, completing the loop.

Each app adds a useful capability to the others; the relationship goes beyond simple cross-promotion.

### C. Fitness & Mind

**Primary audience:** Exercise beginners, office workers, people managing their weight, and people who need stretching or rest.

Daily routines, streaks, and personalized programs can encourage repeat use.

| App | Core features | Main monetization |
| --- | --- | --- |
| Daily Workout | Goal-based exercise plans, videos and timers, workout logs, weekly reports | Exercise-program subscription |
| Daily Yoga | Beginner, morning, and evening yoga; 10–30-minute sessions; classes by difficulty | Content subscription |
| Stretch & Posture | Office stretching, flexibility exercises, posture awareness reminders | Ads and Premium |
| Sleep & Meditation | Sleep routines, meditation, breathing exercises, sleep audio | Audio-content subscription |

To build efficiently, Workout, Yoga, and Stretch should reuse one exercise engine:

`Routine → Exercise → Set/Duration → Completion → Progress`

The user-facing apps and brands can differ while the exercise player, timers, progress tracking, and reminders share the same technology.

### D. Beauty & Self-Care

**Primary audience:** Makeup beginners, skincare users, and beauty-content consumers.

Beauty relates to health and wellness, but its purchase motivations and search keywords differ. It therefore makes sense as a separate product line.

| App | Core features | Main monetization |
| --- | --- | --- |
| Makeup Tutorial | Occasion-based makeup, tutorials, step-by-step guides, product lists | Ads and affiliate revenue |
| Skincare Routine | Morning and evening routines, product logs, usage reminders, skincare journal | Premium routines |
| Face Yoga | Facial-exercise content, routines, progress logs | Program subscription |
| Haircare Guide | Haircare routines, hairstyle guides, product information | Affiliate revenue and ads |

There is no need to build all four Beauty apps immediately. Launch whichever of Makeup Tutorial and Skincare Routine shows stronger demand, then expand. Claims about Face Yoga's cosmetic benefits must stay within what scientific evidence supports.

## 3. Which apps should launch first?

These priorities assume that actual usage data from the current apps is not yet available.

| Rank | App | Decision | Reason |
| ---: | --- | --- | --- |
| 1 | Healthy Recipes | Build first | Can connect immediately to FoodVisior |
| 2 | Daily Workout | Build first | Combines exercise with food management |
| 3 | Daily Yoga | Build next | Reuses the Workout engine |
| 4 | Sleep & Meditation | Build next | Expands daily-habit coverage |
| 5 | Skincare Routine | Market test | Potential for repeat use |
| 6 | Makeup Tutorial | Market test | Independent acquisition and affiliate-revenue opportunity |
| 7 | Kids Nutrition | Conditional build | Decide based on BabyGrow user demand |
| 8 | Cookies & Baking | Content first | Validate within the recipes app first |
| 9 | Meal Planner | Feature first | Build first as a Healthy Recipes feature |
| 10 | Pregnancy Tracker | Long-term candidate | Needs a distinct demand case and medical review |

The first target portfolio is **six apps**: the three existing apps plus Healthy Recipes, Daily Workout, and Daily Yoga. Connect those six, measure performance, and then decide whether to expand beyond ten apps.

## 4. The core of the ecosystem: a shared platform

Building six completely independent apps would sharply increase development and maintenance costs. Keep each app's interface and core experience distinct while sharing recurring capabilities.

```text
Mobile apps
BabyGrow · FoodVisior · HeightIncrease · Recipes · Workout · Yoga
                         ↓
Wellness API Gateway
  Identity        Accounts and login
  Subscription    Subscription and payment verification
  Content         Recipes, exercises, and video
  Recommendation  Cross-app recommendations
  Notification    Alerts and reminders
  AI Services     Food and content analysis
                         ↓
PostgreSQL         User profiles and records
Object Storage     Images and video
Analytics          Events and revenue
                         ↓
Wellness Admin Dashboard
Content · App performance · Subscribers · Campaigns · Experiments
```

### Seven shared modules

| Module | Function | Reused by |
| --- | --- | --- |
| Account SDK | Email and social login; profile management | All apps |
| Billing SDK | In-app purchases, subscription status, purchase restoration | All apps |
| Analytics SDK | Sessions, conversions, retention, cross-app journeys | All apps |
| Content Engine | Recipes, video, images, translations, search | Recipes, Workout, Yoga, Beauty |
| Routine Engine | Scheduling, timers, repetition, completion records | Workout, Yoga, Skincare |
| Notification Engine | Timed reminders, re-engagement of inactive users | All apps |
| Recommendation Engine | Related content and app recommendations | All apps |

A small team does not need multiple microservices from day one. Start with one modular backend and split services when usage or operations justify it.

### Suggested initial technology stack

| Area | Initial approach |
| --- | --- |
| Mobile | Keep the existing app stacks and add shared SDKs |
| Backend | Node.js/NestJS, or a backend the team already knows |
| Database | PostgreSQL |
| Cache | Add Redis when needed |
| Authentication | Firebase Auth or OIDC-based authentication |
| Subscriptions | StoreKit, Google Play Billing, and server-side verification |
| Analytics | Firebase Analytics and BigQuery, or PostHog |
| Content | Headless CMS and object storage/CDN |
| AI | APIs for specific use cases; queue-based asynchronous processing |

Cross-app subscription sharing does not happen automatically. The source strategy notes that Apple provides guidance on sharing subscription benefits across apps, but the apps' subscription products under the same developer account and server-managed entitlements still require deliberate setup. Google Play likewise calls for server-side purchase verification and subscription-state synchronization.

## 5. Data to share—and data to keep separate

Design these boundaries from the beginning.

**Data managed centrally:**

- Login account and user ID
- Installation and activity status for each app
- Subscription and purchase entitlements
- Language, country, and notification settings
- Interests and goals the user has agreed to share

**Data kept separate and shared only with specific consent:**

- Child growth and development records in BabyGrow
- Meal and health-related records in FoodVisior
- Growth and body information in HeightIncrease
- Body measurements and activity records in Workout
- Sensitive skin information in Skincare

Child and health data must not be freely combined for marketing. The source strategy notes that Apple restricts advertising and marketing uses of Health/Fitness data, while Google Play applies separate rules to advertising and cross-promotion in apps directed at children.

For example, to recommend a diet aligned with a FoodVisior user's workout goal, share only the necessary information and only after that user explicitly agrees to connect Workout.

## 6. The cross-app growth engine

An ecosystem can reduce the need to pay for every new user through advertising. Recommendations should respond to what the user is trying to do next, rather than simply advertising another app.

### Cross-app recommendation matrix

| Current app | Recommend | Trigger |
| --- | --- | --- |
| BabyGrow | Kids Nutrition or Recipes | User looks for family-meal content |
| FoodVisior | Healthy Recipes | User wants to prepare a meal for a specific diet |
| FoodVisior | Daily Workout | User chooses an exercise goal |
| HeightIncrease | Stretch & Posture | User shows interest in posture or activity routines |
| Daily Workout | Daily Yoga | User needs recovery or rest |
| Daily Yoga | Sleep & Meditation | User looks for a sleep routine after evening yoga |
| Healthy Recipes | FoodVisior | User wants to log the nutrition of a prepared meal |
| Makeup Tutorial | Skincare Routine | User views pre-makeup skin-preparation content |

### Example 30-day journey: Nutrition + Fitness

1. **Day 1 — FoodVisior acquisition:** A user analyzes a food photo and selects a meal-management goal.
2. **Day 3 — Healthy Recipes recommendation:** After logging a meal, the user sees a related recipe and can open that exact recipe in the other app.
3. **Day 7 — Weekly Meal Plan:** The user builds a seven-day plan from saved recipes.
4. **Day 14 — Daily Workout connection:** A user who has also shown interest in exercise sees a beginner-friendly ten-minute program.
5. **Day 30 — Wellness Pass offer:** Once a user regularly uses two or more apps, introduce the value of a combined membership.

The days are illustrative, not fixed send dates. In production, use actual behavior, recommendation frequency limits, and user opt-outs.

### Example cross-app growth calculation

Assume **100,000 monthly active FoodVisior users**:

| Funnel step | Example value | Calculation |
| --- | ---: | --- |
| Recommendation impressions | 35,000 | 35% of monthly active users |
| Recommendation clicks | 2,800 | 8% of impressions |
| New installs | 840 | 30% of clicks |

**Illustrative monthly cross-app installs: 840.** This is a hypothetical simulation, not observed conversion data. Confirm valid installs using app-store attribution and user deduplication.

The most important outcomes are the **D30 retention and incremental revenue of cross-app users**, not the install count alone. Installing another app without using it creates little ecosystem value.

## 7. Unified membership: Wellness Pass

Offer individual-app subscriptions alongside a combined membership, instead of forcing every user into a single subscription.

| Tier | Illustrative monthly price | Benefits |
| --- | ---: | --- |
| Free | $0 | Free content and basic features; basic logging and routines, with ads where applicable |
| App Pro | $4.99 | Premium features in one app |
| Wellness Pass | $9.99 | Premium features across eligible apps |

These prices are starting hypotheses. Adjust them using actual subscription conversions and payment behavior by region. Annual plans are also worth testing. The source strategy cites RevenueCat's 2026 report as indicating a high share of annual subscriptions in Health & Fitness.

Implementation must ensure that:

- A purchase made in another app can be restored under the same account.
- Existing entitlements are checked before purchase to prevent duplicate purchases.
- Platform purchase history and server-side entitlements stay aligned.
- Duplicate subscriptions, refunds, expirations, and plan changes are handled.

## 8. Content Factory: a cost-effective way to expand

Separate creation and management systems for every recipe, workout, yoga, and beauty product would become expensive. Manage them through one **Content Factory**.

| Shared content field | Recipes | Yoga / Workout | Beauty |
| --- | --- | --- | --- |
| Title and description | Recipe name | Exercise name | Tutorial name |
| Category | Breakfast, lunch, dessert | Beginner, stretching | Everyday, party |
| Time required | Cooking time | Session length | Makeup time |
| Steps | Cooking instructions | Exercise movements | Makeup steps |
| Images and video | Food images | Movement videos | Guide videos |
| Difficulty | Easy to hard | Beginner to advanced | Beginner to advanced |
| Personalization tags | Ingredients, allergies | Goals, exercise intensity | Style, skin type |

A shared CMS can centralize content writing, translation, review, and publishing schedules. The underlying model still needs category-specific fields: recipes need nutrition and allergy data, while exercise content needs movement safety, sets, and rest periods.

### Priority AI use cases

| Priority | AI capability | Product |
| ---: | --- | --- |
| 1 | Assist with food-image and ingredient analysis | FoodVisior |
| 2 | Recommend recipes from available ingredients | Healthy Recipes |
| 3 | Assemble routines around user goals | Daily Workout |
| 4 | Draft content tags, search metadata, and translations | All apps |
| 5 | Produce a personalized wellness summary | Only across apps the user agreed to connect |

AI does not need to be the central feature of every app. Prioritize personalization and discovery of reviewed content over allowing AI to invent unverified nutrition calculations or exercise prescriptions.

## 9. Twelve-month execution roadmap

**Illustrative 2027 launch plan:**

| Quarter | Months | Focus | Work |
| --- | --- | --- | --- |
| Q1 | 1–3 | Build the shared foundation | Analyze the three existing apps; build the Account and Analytics SDKs; establish a shared Content CMS |
| Q2 | 4–6 | Expand into Nutrition + Fitness | Build Healthy Recipes and Daily Workout; test cross-app recommendations |
| Q3 | 7–9 | Improve retention and integration | Launch Daily Yoga and Wellness Pass; optimize recommendations and subscriptions |
| Q4 | 10–12 | Validate and expand the portfolio | Test a Beauty MVP; expand content and ASO; choose the following year's apps |

Adjust timing based on the existing code quality, content readiness, and team capacity.

### Launch decision KPIs

These are **illustrative internal targets**, not industry averages.

| Measure | Initial test target |
| --- | --- |
| New-app D7 retention | At least 20% |
| New-app D30 retention | At least 8–15% |
| First completion of a core feature | At least 60% |
| Cross-app click-through rate | At least 5% |
| D7 retention after a cross-app install | At least 20% |
| Subscription conversion | Validate through tests by price and country |
| Crash-free sessions | At least 99.5% |

If an app misses a target, distinguish acquisition quality, onboarding, content value, and technical problems before deciding to discontinue it.

## 10. Operating team

A six-app portfolio does not require a dedicated team for each app.

| Role | Illustrative initial staffing | Responsibility |
| --- | ---: | --- |
| Product Lead | 1 | Portfolio, KPIs, roadmap |
| Mobile Developers | 2 | App development and shared SDKs |
| Backend Developer | 1 | APIs, data, subscriptions |
| Designer | 1 | Shared design system and app UX |
| Content Manager | 1 | Recipe and workout content operations |
| Growth / ASO | 1 | Store optimization, experiments, conversion |
| QA / expert reviewers | Part-time or outsourced | Quality and health-information review |

One model is **seven core team members plus outside experts as needed**. Maintenance of the existing three apps or a larger video-production program may require additional people.

## 11. When should you build a separate super app?

Do not build a combined super app at the start. A focused standalone app can match a clear store-search intent. An app containing everything may make it harder for new users to recognize the feature they need.

As the ecosystem grows, consider an integrated hub called **Wellness Home**.

```text
Wellness Home — example dashboard

Your Wellness Today
View routines and progress from connected apps in one place.

Daily Tasks: 2/3       Active Days: 4       Connected Apps: 3

Connected Apps
  FoodVisior       Open meal log
  Daily Workout    Continue today's workout
  Daily Yoga       View a 10-minute stretching session

Navigation: Home · Apps · Routine · Profile
```

Consider building this hub when:

- A meaningful group of customers actually uses at least three apps.
- Clear demand for a unified dashboard is confirmed.
- Wellness Pass reaches a meaningful subscriber base.

Until then, cross-app deep links, a shared account, and shared subscription benefits should be enough.

## 12. Recommended business structure

| Stage | Aim | Components |
| --- | --- | --- |
| **1 — Portfolio** | Establish the products | BabyGrow · FoodVisior · HeightIncrease · Healthy Recipes · Daily Workout · Daily Yoga |
| **2 — Platform** | Improve cost efficiency | Account · Subscription · Content · Analytics · Cross-App SDK |
| **3 — Growth** | Increase user value | ASO · Cross-installs · Habit retention · Personalized content · Wellness Pass |
| **4 — Expansion** | Grow the business | Sleep · Skincare · Makeup · Kids Nutrition · New categories |

The business advantage comes from users arriving with a specific need, continuing to get value from related apps, and sharing content, technology, and subscription infrastructure so the marginal cost of adding an app decreases.

### Three immediate actions

1. **Analyze the three existing apps.** Compare acquisition countries, user age groups, DAU/MAU, retention, and revenue to find the strongest asset.
2. **Build Healthy Recipes and Daily Workout MVPs.** Prioritize the two new apps most likely to connect with existing users.
3. **Build a shared Growth/Analytics SDK.** Measure acquisition source, cross-app journeys, and subscription entitlements to decide whether the portfolio should expand.

Next, explicitly assign each app a role: **Acquisition App** (brings in users), **Engagement App** (drives repeat use), or **Monetization App** (earns revenue). Those roles will shape the Wellness Ecosystem's business model more than the raw number of apps.

---

*Translation note: This document preserves the strategy, examples, and numerical assumptions in the supplied Korean text. The source mentioned Apple Developer Documentation, Google Play policies, and RevenueCat's 2026 report without supplying links; those references have not been independently verified here.*
