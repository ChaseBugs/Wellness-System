package com.talentbaby.app.ui.home;

import android.content.Context;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import com.talentbaby.app.models.ApiResponse;
import com.talentbaby.app.models.Activity;
import com.talentbaby.app.models.Baby;
import com.talentbaby.app.models.DailyActivity;
import com.talentbaby.app.models.User;
import com.talentbaby.app.network.ApiService;
import com.talentbaby.app.utils.TokenManager;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Locale;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class HomeViewModel extends ViewModel {

    private final MutableLiveData<User> userLiveData = new MutableLiveData<>();
    private final MutableLiveData<Baby> babyLiveData = new MutableLiveData<>();
    private final MutableLiveData<List<DailyActivity>> activitiesLiveData = new MutableLiveData<>();
    private final MutableLiveData<Boolean> isLoadingLiveData = new MutableLiveData<>(false);
    private final MutableLiveData<String> errorLiveData = new MutableLiveData<>();

    private ApiService apiService;
    private Context appContext;

    public void init(ApiService apiService, Context context) {
        this.apiService = apiService;
        this.appContext = context.getApplicationContext();
    }

    public LiveData<User> getUser() { return userLiveData; }
    public LiveData<Baby> getBaby() { return babyLiveData; }
    public LiveData<List<DailyActivity>> getActivities() { return activitiesLiveData; }
    public LiveData<Boolean> isLoading() { return isLoadingLiveData; }
    public LiveData<String> getError() { return errorLiveData; }

    public void loadUserProfile() {
        apiService.getProfile().enqueue(new Callback<ApiResponse<User>>() {
            @Override
            public void onResponse(Call<ApiResponse<User>> call, Response<ApiResponse<User>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    userLiveData.setValue(response.body().getData());
                }
            }
            @Override
            public void onFailure(Call<ApiResponse<User>> call, Throwable t) { }
        });
    }

    public void loadBabies() {
        isLoadingLiveData.setValue(true);
        if (apiService != null) {
            isLoadingLiveData.setValue(false);
            activitiesLiveData.setValue(demoDailyActivities());
            return;
        }

        apiService.getBabies().enqueue(new Callback<ApiResponse<List<Baby>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Baby>>> call, Response<ApiResponse<List<Baby>>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    List<Baby> babies = response.body().getData();
                    if (!babies.isEmpty()) {
                        Baby first = babies.get(0);
                        babyLiveData.setValue(first);
                        if (appContext != null) {
                            TokenManager.saveBabyId(appContext, first.getId());
                        }
                        loadDailyActivities(first.getId());
                    } else {
                        isLoadingLiveData.setValue(false);
                        activitiesLiveData.setValue(demoDailyActivities());
                    }
                } else {
                    isLoadingLiveData.setValue(false);
                    activitiesLiveData.setValue(demoDailyActivities());
                }
            }
            @Override
            public void onFailure(Call<ApiResponse<List<Baby>>> call, Throwable t) {
                isLoadingLiveData.setValue(false);
                errorLiveData.setValue(t.getMessage());
                activitiesLiveData.setValue(demoDailyActivities());
            }
        });
    }

    /** Called by the date selector when the user picks a different day. */
    public void loadActivitiesForDate(Calendar date) {
        int babyId = appContext != null ? TokenManager.getBabyId(appContext) : -1;
        if (babyId == -1) {
            activitiesLiveData.setValue(demoDailyActivities());
            return;
        }

        // Format date as yyyy-MM-dd for the API (falls back to today's activities if API unsupported)
        String dateStr = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(date.getTime());
        isLoadingLiveData.setValue(true);
        // Re-use the daily activities endpoint; backend can accept an optional ?date= param
        apiService.getDailyActivities(babyId).enqueue(new Callback<ApiResponse<List<DailyActivity>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<DailyActivity>>> call,
                                   Response<ApiResponse<List<DailyActivity>>> response) {
                isLoadingLiveData.setValue(false);
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    List<DailyActivity> data = response.body().getData();
                    activitiesLiveData.setValue(data.isEmpty() ? demoDailyActivities() : data);
                } else {
                    activitiesLiveData.setValue(demoDailyActivities());
                }
            }
            @Override
            public void onFailure(Call<ApiResponse<List<DailyActivity>>> call, Throwable t) {
                isLoadingLiveData.setValue(false);
                activitiesLiveData.setValue(demoDailyActivities());
            }
        });
    }

    private void loadDailyActivities(int babyId) {
        apiService.getDailyActivities(babyId).enqueue(new Callback<ApiResponse<List<DailyActivity>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<DailyActivity>>> call,
                                   Response<ApiResponse<List<DailyActivity>>> response) {
                isLoadingLiveData.setValue(false);
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    List<DailyActivity> data = response.body().getData();
                    activitiesLiveData.setValue(data.isEmpty() ? demoDailyActivities() : data);
                } else {
                    activitiesLiveData.setValue(demoDailyActivities());
                }
            }
            @Override
            public void onFailure(Call<ApiResponse<List<DailyActivity>>> call, Throwable t) {
                isLoadingLiveData.setValue(false);
                errorLiveData.setValue(t.getMessage());
                activitiesLiveData.setValue(demoDailyActivities());
            }
        });
    }

    private List<DailyActivity> demoDailyActivities() {
        List<DailyActivity> items = new ArrayList<>();
        items.add(demoDailyActivity(1, "Eye Movement", "Hand-Eye-Spatial", "cognitive", 5, 6245, true));
        items.add(demoDailyActivity(2, "Recognizing Hands", "Self Awareness", "cognitive", 0, 3820, false));
        items.add(demoDailyActivity(3, "Cycle Movement", "Muscle development", "physical", 0, 5140, false));
        items.add(demoDailyActivity(4, "Stand-Up On Legs", "Gross Motor", "physical", 0, 2994, false));
        items.add(demoDailyActivity(5, "Hand Games", "Bonding", "social", 0, 2575, false));
        return items;
    }

    private DailyActivity demoDailyActivity(int slot, String title, String subCategory, String category,
                                            int duration, int doneCount, boolean completed) {
        Activity activity = new Activity();
        activity.setId(100 + slot);
        activity.setTitle(title);
        activity.setSubCategory(subCategory);
        activity.setCategory(category);
        activity.setDurationMinutes(duration);
        activity.setMinAgeMonths(3);
        activity.setMaxAgeMonths(6);
        activity.setDoneCount(doneCount);

        DailyActivity dailyActivity = new DailyActivity();
        dailyActivity.setDailyId(1000 + slot);
        dailyActivity.setSlot(slot);
        dailyActivity.setCompleted(completed);
        dailyActivity.setActivity(activity);
        return dailyActivity;
    }
}
