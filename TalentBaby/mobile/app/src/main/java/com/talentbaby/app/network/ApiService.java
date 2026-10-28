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

public interface ApiService {
    // Authentication
    @POST("auth/signup")
    Call<AuthResponse> signup(@Body Map<String, String> credentials);

    @POST("auth/login")
    Call<AuthResponse> login(@Body Map<String, String> credentials);

    // User Profile
    @GET("users/profile")
    Call<ApiResponse<User>> getProfile();

    @PUT("users/profile")
    Call<ApiResponse<User>> updateProfile(@Body Map<String, Object> updates);

    // Babies
    @GET("babies")
    Call<ApiResponse<List<Baby>>> getBabies();

    @GET("babies/active")
    Call<ApiResponse<Baby>> getActiveBaby();

    @POST("babies")
    Call<ApiResponse<Baby>> createBaby(@Body Map<String, Object> baby);

    @GET("babies/{id}")
    Call<ApiResponse<Baby>> getBaby(@Path("id") int id);

    @PUT("babies/{id}")
    Call<ApiResponse<Baby>> updateBaby(@Path("id") int id, @Body Map<String, Object> baby);

    @DELETE("babies/{id}")
    Call<ApiResponse<Object>> deleteBaby(@Path("id") int id);

    // Set active baby for current user
    @PUT("users/active-baby")
    Call<ApiResponse<Object>> setActiveBaby(@Body Map<String, Object> body);

    // Activities
    @GET("activities")
    Call<ApiResponse<List<Activity>>> getActivities(
            @Query("category") String category,
            @Query("sub_category") String subCategory,
            @Query("month") Integer month,
            @Query("search") String search
    );

    @GET("activities/{id}")
    Call<ApiResponse<Activity>> getActivity(@Path("id") int id);

    @GET("activities/baby/{babyId}")
    Call<ApiResponse<List<Activity>>> getBabyActivities(@Path("babyId") int babyId);

    @GET("activities/baby/{babyId}/daily")
    Call<ApiResponse<List<DailyActivity>>> getDailyActivities(@Path("babyId") int babyId);

    @POST("activities/baby/{babyId}/daily/{slot}/complete")
    Call<ApiResponse<Object>> completeDailySlot(
            @Path("babyId") int babyId,
            @Path("slot") int slot
    );

    @POST("activities/{id}/complete")
    Call<ApiResponse<Object>> completeActivity(
            @Path("id") int id,
            @Body Map<String, Object> data
    );

    @POST("activities/{id}/difficulty")
    Call<ApiResponse<Object>> setDifficultyFeedback(
            @Path("id") int id,
            @Body Map<String, Object> body
    );

    @GET("activities/sub-categories")
    Call<ApiResponse<List<String>>> getActivitySubCategories();

    // Milestone Definitions
    @GET("milestone-definitions/month/{month}")
    Call<ApiResponse<Map<String, List<MilestoneDefinition>>>> getMilestoneDefinitionsByMonth(
            @Path("month") int month
    );

    @GET("milestone-definitions")
    Call<ApiResponse<List<MilestoneDefinition>>> getMilestoneDefinitions(
            @Query("month") Integer month,
            @Query("milestone_type") String milestoneType
    );

    // Baby Milestones
    @GET("baby-milestones/{babyId}")
    Call<ApiResponse<List<BabyMilestone>>> getBabyMilestones(
            @Path("babyId") int babyId,
            @Query("month") Integer month
    );

    @GET("baby-milestones/{babyId}/report")
    Call<ApiResponse<Map<String, Object>>> getMilestoneReport(
            @Path("babyId") int babyId,
            @Query("month") Integer month
    );

    @POST("baby-milestones")
    Call<ApiResponse<BabyMilestone>> upsertBabyMilestone(@Body Map<String, Object> body);

    @DELETE("baby-milestones/{id}")
    Call<ApiResponse<Object>> deleteBabyMilestone(@Path("id") int id);

    // Feeding
    @GET("feeding/baby/{babyId}")
    Call<ApiResponse<List<FeedingRecord>>> getFeedings(
            @Path("babyId") int babyId,
            @Query("start_date") String startDate,
            @Query("end_date") String endDate
    );

    @POST("feeding")
    Call<ApiResponse<FeedingRecord>> logFeeding(@Body Map<String, Object> body);

    @DELETE("feeding/{id}")
    Call<ApiResponse<Object>> deleteFeeding(@Path("id") int id);

    // Sleep
    @GET("sleep/baby/{babyId}")
    Call<ApiResponse<List<SleepSession>>> getSleepSessions(
            @Path("babyId") int babyId,
            @Query("start_date") String startDate,
            @Query("end_date") String endDate
    );

    @POST("sleep")
    Call<ApiResponse<SleepSession>> logSleep(@Body Map<String, Object> body);

    @DELETE("sleep/{id}")
    Call<ApiResponse<Object>> deleteSleep(@Path("id") int id);

    // Diaper
    @GET("diaper/baby/{babyId}")
    Call<ApiResponse<List<DiaperChange>>> getDiaperChanges(
            @Path("babyId") int babyId,
            @Query("start_date") String startDate,
            @Query("end_date") String endDate
    );

    @POST("diaper")
    Call<ApiResponse<DiaperChange>> logDiaper(@Body Map<String, Object> body);

    @DELETE("diaper/{id}")
    Call<ApiResponse<Object>> deleteDiaper(@Path("id") int id);

    // Growth
    @GET("growth/baby/{babyId}")
    Call<ApiResponse<List<GrowthRecord>>> getGrowthRecords(@Path("babyId") int babyId);

    @POST("growth")
    Call<ApiResponse<GrowthRecord>> logGrowth(@Body Map<String, Object> body);

    @DELETE("growth/{id}")
    Call<ApiResponse<Object>> deleteGrowth(@Path("id") int id);

    // Daily Updates / Tips
    @GET("daily-updates/baby/{babyId}/today")
    Call<ApiResponse<List<DailyUpdate>>> getTodayUpdates(@Path("babyId") int babyId);

    @GET("daily-updates/age/{ageInMonths}")
    Call<ApiResponse<List<DailyUpdate>>> getUpdatesByAge(@Path("ageInMonths") int ageInMonths);

    // Recipes
    @GET("recipes")
    Call<ApiResponse<List<Recipe>>> getRecipes(
            @Query("category") String category,
            @Query("target") String target
    );

    @GET("recipes/{id}")
    Call<ApiResponse<Recipe>> getRecipe(@Path("id") int id);

    @GET("recipes/baby/{babyId}")
    Call<ApiResponse<List<Recipe>>> getBabyRecipes(@Path("babyId") int babyId);

    @GET("recipes/baby/age-group/{group}")
    Call<ApiResponse<List<Recipe>>> getBabyRecipesByAgeGroup(
            @Path("group") String group,
            @Query("meal_slot") String mealSlot
    );

    @GET("recipes/favorites")
    Call<ApiResponse<List<Recipe>>> getFavoriteRecipes();

    @POST("recipes/{id}/favorite")
    Call<ApiResponse<Object>> addRecipeToFavorites(@Path("id") int id);

    @DELETE("recipes/{id}/favorite")
    Call<ApiResponse<Object>> removeRecipeFromFavorites(@Path("id") int id);

    // Articles
    @GET("articles")
    Call<ApiResponse<List<Article>>> getArticles(
            @Query("category") String category,
            @Query("month") Integer month
    );

    @GET("articles/{id}")
    Call<ApiResponse<Article>> getArticle(@Path("id") int id);

    @GET("articles/search")
    Call<ApiResponse<List<Article>>> searchArticles(@Query("q") String query);

    @GET("articles/bookmarked")
    Call<ApiResponse<List<Article>>> getBookmarkedArticles();

    @POST("articles/{id}/bookmark")
    Call<ApiResponse<Object>> bookmarkArticle(@Path("id") int id);

    @DELETE("articles/{id}/bookmark")
    Call<ApiResponse<Object>> unbookmarkArticle(@Path("id") int id);

    // Stories
    @GET("stories")
    Call<ApiResponse<List<Story>>> getStories(
            @Query("age_months") Integer ageMonths,
            @Query("search") String search
    );

    @GET("stories/{id}")
    Call<ApiResponse<Story>> getStory(@Path("id") int id);

    @GET("stories/bookmarked")
    Call<ApiResponse<List<Story>>> getBookmarkedStories();

    @POST("stories/{id}/bookmark")
    Call<ApiResponse<Object>> bookmarkStory(@Path("id") int id);

    @DELETE("stories/{id}/bookmark")
    Call<ApiResponse<Object>> unbookmarkStory(@Path("id") int id);
}
