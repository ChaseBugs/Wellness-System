package com.talentbaby.app.network;

import com.talentbaby.app.models.Activity;
import com.talentbaby.app.models.ApiResponse;
import com.talentbaby.app.models.Article;
import com.talentbaby.app.models.AuthResponse;
import com.talentbaby.app.models.Baby;
import com.talentbaby.app.models.BabyMilestone;
import com.talentbaby.app.models.DailyActivity;
import com.talentbaby.app.models.DailyUpdate;
import com.talentbaby.app.models.DiaperChange;
import com.talentbaby.app.models.FeedingRecord;
import com.talentbaby.app.models.GrowthRecord;
import com.talentbaby.app.models.MilestoneDefinition;
import com.talentbaby.app.models.Recipe;
import com.talentbaby.app.models.SleepSession;
import com.talentbaby.app.models.Story;
import com.talentbaby.app.models.User;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Path;
import retrofit2.http.Query;
import java.util.List;
import java.util.Map;

/**
 * Wellness Platform API. Ids are UUID strings. Accounts are shared across the Wellness apps
 * (auth/*); everything BabyGrow-specific is under apps/babygrow/.
 */
public interface ApiService {
    String APP = "apps/babygrow/";

    // Authentication: body { email, password, displayName }
    @POST("auth/register")
    Call<AuthResponse> signup(@Body Map<String, String> credentials);

    @POST("auth/login")
    Call<AuthResponse> login(@Body Map<String, String> credentials);

    // Caregiver profile
    @GET(APP + "profile")
    Call<ApiResponse<User>> getProfile();

    @PUT(APP + "profile")
    Call<ApiResponse<User>> updateProfile(@Body Map<String, Object> updates);

    // Children (body keys: name, birthDate, sex, birthWeightKg, birthHeightCm, avatarUrl)
    @GET(APP + "children")
    Call<ApiResponse<List<Baby>>> getBabies();

    @GET(APP + "profile/active-child")
    Call<ApiResponse<Baby>> getActiveBaby();

    @POST(APP + "children")
    Call<ApiResponse<Baby>> createBaby(@Body Map<String, Object> baby);

    @GET(APP + "children/{id}")
    Call<ApiResponse<Baby>> getBaby(@Path("id") String id);

    @PUT(APP + "children/{id}")
    Call<ApiResponse<Baby>> updateBaby(@Path("id") String id, @Body Map<String, Object> baby);

    @DELETE(APP + "children/{id}")
    Call<Void> deleteBaby(@Path("id") String id);

    // Set the active child for the current user: body { childId }
    @PUT(APP + "profile/active-child")
    Call<ApiResponse<Baby>> setActiveBaby(@Body Map<String, Object> body);

    // Activities
    @GET(APP + "activities")
    Call<ApiResponse<List<Activity>>> getActivities(
            @Query("category") String category,
            @Query("subCategory") String subCategory,
            @Query("month") Integer month,
            @Query("search") String search
    );

    @GET(APP + "activities/{id}")
    Call<ApiResponse<Activity>> getActivity(@Path("id") String id);

    @GET(APP + "children/{babyId}/daily-activities")
    Call<ApiResponse<List<DailyActivity>>> getDailyActivities(@Path("babyId") String babyId, @Query("date") String date);

    @POST(APP + "children/{babyId}/daily-activities/{slot}/complete")
    Call<ApiResponse<Object>> completeDailySlot(
            @Path("babyId") String babyId,
            @Path("slot") int slot
    );

    // body { rating, difficultyFeedback, notes }
    @POST(APP + "children/{babyId}/activities/{id}/complete")
    Call<ApiResponse<Object>> completeActivity(
            @Path("babyId") String babyId,
            @Path("id") String id,
            @Body Map<String, Object> data
    );

    // body { feedback: too_easy | just_right | too_hard }
    @POST(APP + "children/{babyId}/activities/{id}/difficulty")
    Call<ApiResponse<Object>> setDifficultyFeedback(
            @Path("babyId") String babyId,
            @Path("id") String id,
            @Body Map<String, Object> body
    );

    @GET(APP + "activities/sub-categories")
    Call<ApiResponse<List<String>>> getActivitySubCategories();

    // Milestone definitions
    @GET(APP + "milestone-definitions/month/{month}")
    Call<ApiResponse<Map<String, List<MilestoneDefinition>>>> getMilestoneDefinitionsByMonth(
            @Path("month") int month
    );

    @GET(APP + "milestone-definitions")
    Call<ApiResponse<List<MilestoneDefinition>>> getMilestoneDefinitions(
            @Query("month") Integer month,
            @Query("type") String milestoneType
    );

    // Child milestones: with month, every definition of that month plus the child's answer
    @GET(APP + "children/{babyId}/milestones")
    Call<ApiResponse<List<BabyMilestone>>> getBabyMilestones(
            @Path("babyId") String babyId,
            @Query("month") Integer month
    );

    // { total, yes, almost, no, unanswered, byType: { physical: { total, yes, ... } } }
    @GET(APP + "children/{babyId}/milestones/report")
    Call<ApiResponse<Map<String, Object>>> getMilestoneReport(
            @Path("babyId") String babyId,
            @Query("month") Integer month
    );

    // body { status: yes | almost | no, achievedOn, notes }
    @PUT(APP + "children/{babyId}/milestones/{milestoneId}")
    Call<ApiResponse<BabyMilestone>> upsertBabyMilestone(
            @Path("babyId") String babyId,
            @Path("milestoneId") String milestoneId,
            @Body Map<String, Object> body
    );

    @DELETE(APP + "children/{babyId}/milestones/{milestoneId}")
    Call<Void> deleteBabyMilestone(@Path("babyId") String babyId, @Path("milestoneId") String milestoneId);

    // Feeding / sleep / diaper views over care logs (from/to are ISO date-times)
    @GET(APP + "children/{babyId}/feedings")
    Call<ApiResponse<List<FeedingRecord>>> getFeedings(
            @Path("babyId") String babyId,
            @Query("from") String startDate,
            @Query("to") String endDate
    );

    // body { feedingType: breast | bottle | formula | solid | pumping, startTime, endTime, amountMl, side, notes }
    @POST(APP + "children/{babyId}/feedings")
    Call<ApiResponse<FeedingRecord>> logFeeding(@Path("babyId") String babyId, @Body Map<String, Object> body);

    @GET(APP + "children/{babyId}/sleeps")
    Call<ApiResponse<List<SleepSession>>> getSleepSessions(
            @Path("babyId") String babyId,
            @Query("from") String startDate,
            @Query("to") String endDate
    );

    // body { sleepType: nap | night, startTime, endTime, qualityRating, notes }
    @POST(APP + "children/{babyId}/sleeps")
    Call<ApiResponse<SleepSession>> logSleep(@Path("babyId") String babyId, @Body Map<String, Object> body);

    @GET(APP + "children/{babyId}/diapers")
    Call<ApiResponse<List<DiaperChange>>> getDiaperChanges(
            @Path("babyId") String babyId,
            @Query("from") String startDate,
            @Query("to") String endDate
    );

    // body { diaperType: wet | dirty | mixed | dry, changeTime, notes }
    @POST(APP + "children/{babyId}/diapers")
    Call<ApiResponse<DiaperChange>> logDiaper(@Path("babyId") String babyId, @Body Map<String, Object> body);

    // Feedings, sleeps and diapers are all care logs.
    @DELETE(APP + "children/{babyId}/care-logs/{id}")
    Call<Void> deleteCareLog(@Path("babyId") String babyId, @Path("id") String id);

    // Growth
    @GET(APP + "children/{babyId}/growth-records")
    Call<ApiResponse<List<GrowthRecord>>> getGrowthRecords(@Path("babyId") String babyId);

    // body { measuredOn: YYYY-MM-DD, heightCm, weightKg, headCircumferenceCm, notes }
    @POST(APP + "children/{babyId}/growth-records")
    Call<ApiResponse<GrowthRecord>> logGrowth(@Path("babyId") String babyId, @Body Map<String, Object> body);

    @DELETE(APP + "children/{babyId}/growth-records/{id}")
    Call<Void> deleteGrowth(@Path("babyId") String babyId, @Path("id") String id);

    // Daily updates / tips
    @GET(APP + "children/{babyId}/daily-updates/today")
    Call<ApiResponse<List<DailyUpdate>>> getTodayUpdates(@Path("babyId") String babyId);

    @GET(APP + "daily-updates")
    Call<ApiResponse<List<DailyUpdate>>> getUpdatesByAge(@Query("ageInMonths") int ageInMonths);

    // Recipes
    @GET(APP + "recipes")
    Call<ApiResponse<List<Recipe>>> getRecipes(
            @Query("category") String category,
            @Query("target") String target
    );

    @GET(APP + "recipes/{id}")
    Call<ApiResponse<Recipe>> getRecipe(@Path("id") String id);

    @GET(APP + "children/{babyId}/recipes")
    Call<ApiResponse<List<Recipe>>> getBabyRecipes(@Path("babyId") String babyId);

    @GET(APP + "recipes/age-group/{group}")
    Call<ApiResponse<List<Recipe>>> getBabyRecipesByAgeGroup(
            @Path("group") String group,
            @Query("mealSlot") String mealSlot
    );

    @GET(APP + "recipes/favorites")
    Call<ApiResponse<List<Recipe>>> getFavoriteRecipes();

    @PUT(APP + "recipes/{id}/favorite")
    Call<ApiResponse<Object>> addRecipeToFavorites(@Path("id") String id);

    @DELETE(APP + "recipes/{id}/favorite")
    Call<ApiResponse<Object>> removeRecipeFromFavorites(@Path("id") String id);

    // Articles
    @GET(APP + "articles")
    Call<ApiResponse<List<Article>>> getArticles(
            @Query("category") String category,
            @Query("month") Integer month
    );

    @GET(APP + "articles/{id}")
    Call<ApiResponse<Article>> getArticle(@Path("id") String id);

    @GET(APP + "articles/search")
    Call<ApiResponse<List<Article>>> searchArticles(@Query("q") String query);

    @GET(APP + "articles/bookmarked")
    Call<ApiResponse<List<Article>>> getBookmarkedArticles();

    @PUT(APP + "articles/{id}/bookmark")
    Call<ApiResponse<Object>> bookmarkArticle(@Path("id") String id);

    @DELETE(APP + "articles/{id}/bookmark")
    Call<ApiResponse<Object>> unbookmarkArticle(@Path("id") String id);

    // Stories
    @GET(APP + "stories")
    Call<ApiResponse<List<Story>>> getStories(
            @Query("ageMonths") Integer ageMonths,
            @Query("search") String search
    );

    @GET(APP + "stories/{id}")
    Call<ApiResponse<Story>> getStory(@Path("id") String id);

    @GET(APP + "stories/bookmarked")
    Call<ApiResponse<List<Story>>> getBookmarkedStories();

    @PUT(APP + "stories/{id}/bookmark")
    Call<ApiResponse<Object>> bookmarkStory(@Path("id") String id);

    @DELETE(APP + "stories/{id}/bookmark")
    Call<ApiResponse<Object>> unbookmarkStory(@Path("id") String id);
}
