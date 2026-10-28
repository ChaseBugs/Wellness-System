package com.talentbaby.app.activities;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.view.MotionEvent;
import android.view.View;
import android.view.inputmethod.InputMethodManager;
import android.widget.DatePicker;
import android.widget.EditText;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import com.talentbaby.app.R;
import com.talentbaby.app.models.ApiResponse;
import com.talentbaby.app.models.Baby;
import com.talentbaby.app.models.User;
import com.talentbaby.app.network.ApiService;
import com.talentbaby.app.utils.ApiClient;
import com.talentbaby.app.utils.TokenManager;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class BabyProfileActivity extends AppCompatActivity {
    private static final String[] RELATIONSHIPS = {
            "Father", "Mother", "Grandfather", "Grandmother", "Babysitter",
            "Aunt", "Uncle", "Development Professional"
    };

    private ApiService apiService;
    private int babyId = -1;
    private String selectedGender = "female";
    private String selectedBirthDate = "";

    private TextView tabGirl;
    private TextView tabBoy;
    private EditText editBabyName;
    private TextView textDob;
    private Switch switchPremature;
    private TextView textRelationship;
    private TextView textCountry;
    private EditText editParentName;
    private TextView buttonUpdate;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_baby_profile);

        apiService = ApiClient.getClient().create(ApiService.class);
        babyId = getIntent().getIntExtra("baby_id", TokenManager.getBabyId(this));

        bindViews();
        setupListeners();
        loadProfile();
        loadBaby();
    }

    private void bindViews() {
        tabGirl = findViewById(R.id.tabBabyGirl);
        tabBoy = findViewById(R.id.tabBabyBoy);
        editBabyName = findViewById(R.id.editProfileBabyName);
        textDob = findViewById(R.id.textProfileDob);
        switchPremature = findViewById(R.id.switchPremature);
        textRelationship = findViewById(R.id.textProfileRelationship);
        textCountry = findViewById(R.id.textProfileCountry);
        editParentName = findViewById(R.id.editProfileParentName);
        buttonUpdate = findViewById(R.id.btnUpdateBabyProfile);
    }

    private void setupListeners() {
        findViewById(R.id.btnBackBabyProfile).setOnClickListener(v -> finish());
        tabGirl.setOnClickListener(v -> selectGender("female"));
        tabBoy.setOnClickListener(v -> selectGender("male"));
        setupDobPicker();
        textRelationship.setOnClickListener(v -> showRelationshipPicker());
        textCountry.setOnClickListener(v ->
                Toast.makeText(this, getString(R.string.united_states), Toast.LENGTH_SHORT).show());
        buttonUpdate.setOnClickListener(v -> updateBabyProfile());
    }

    private void setupDobPicker() {
        View dobRow = findViewById(R.id.layoutProfileDob);
        View.OnClickListener pickerClick = v -> showDatePicker();
        dobRow.setOnClickListener(pickerClick);
        textDob.setOnClickListener(pickerClick);

        View.OnTouchListener pickerTouch = (v, event) -> {
            if (event.getAction() == MotionEvent.ACTION_UP) {
                InputMethodManager imm = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
                if (imm != null) imm.hideSoftInputFromWindow(v.getWindowToken(), 0);
                showDatePicker();
                return true;
            }
            return true;
        };
        dobRow.setOnTouchListener(pickerTouch);
        textDob.setOnTouchListener(pickerTouch);
    }

    private void loadBaby() {
        if (babyId != -1) {
            apiService.getBaby(babyId).enqueue(new Callback<ApiResponse<Baby>>() {
                @Override
                public void onResponse(@NonNull Call<ApiResponse<Baby>> call,
                                       @NonNull Response<ApiResponse<Baby>> response) {
                    if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                        bindBaby(response.body().getData());
                    } else {
                        loadActiveBaby();
                    }
                }

                @Override
                public void onFailure(@NonNull Call<ApiResponse<Baby>> call, @NonNull Throwable t) {
                    loadActiveBaby();
                }
            });
        } else {
            loadActiveBaby();
        }
    }

    private void loadActiveBaby() {
        apiService.getActiveBaby().enqueue(new Callback<ApiResponse<Baby>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<Baby>> call,
                                   @NonNull Response<ApiResponse<Baby>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    bindBaby(response.body().getData());
                } else {
                    Toast.makeText(BabyProfileActivity.this, getString(R.string.add_baby_first), Toast.LENGTH_SHORT).show();
                    finish();
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<Baby>> call, @NonNull Throwable t) {
                Toast.makeText(BabyProfileActivity.this, getString(R.string.network_error), Toast.LENGTH_SHORT).show();
                finish();
            }
        });
    }

    private void loadProfile() {
        apiService.getProfile().enqueue(new Callback<ApiResponse<User>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<User>> call,
                                   @NonNull Response<ApiResponse<User>> response) {
                if (!response.isSuccessful() || response.body() == null || response.body().getData() == null) return;
                User user = response.body().getData();
                if (user.getFullName() != null) editParentName.setText(user.getFullName());
                if (user.getRelationToBaby() != null && !user.getRelationToBaby().isEmpty()) {
                    textRelationship.setText(formatRelationship(user.getRelationToBaby()));
                }
            }

            @Override public void onFailure(@NonNull Call<ApiResponse<User>> call, @NonNull Throwable t) {}
        });
    }

    private void bindBaby(Baby baby) {
        babyId = baby.getId();
        TokenManager.saveBabyId(this, baby.getId());
        editBabyName.setText(baby.getName() != null ? baby.getName() : "");
        selectedGender = normalizeGender(baby.getGender());
        selectGender(selectedGender);
        selectedBirthDate = normalizeDate(baby.getBirthDate());
        textDob.setText(displayDate(selectedBirthDate));
    }

    private void selectGender(String gender) {
        selectedGender = gender;
        boolean girl = "female".equals(gender);
        tabGirl.setBackgroundResource(girl ? R.drawable.bg_teal_button : android.R.color.transparent);
        tabBoy.setBackgroundResource(girl ? android.R.color.transparent : R.drawable.bg_teal_button);
        tabGirl.setTextColor(getColor(girl ? android.R.color.white : R.color.article_header));
        tabBoy.setTextColor(getColor(girl ? R.color.article_header : android.R.color.white));
    }

    private void showDatePicker() {
        Calendar cal = Calendar.getInstance();
        if (!selectedBirthDate.isEmpty()) {
            try {
                Date date = new SimpleDateFormat("yyyy-MM-dd", Locale.US).parse(selectedBirthDate);
                if (date != null) cal.setTime(date);
            } catch (ParseException ignored) {
                cal = Calendar.getInstance();
            }
        }

        DatePicker picker = new DatePicker(this);
        picker.init(
                cal.get(Calendar.YEAR),
                cal.get(Calendar.MONTH),
                cal.get(Calendar.DAY_OF_MONTH),
                null
        );

        new AlertDialog.Builder(this)
                .setView(picker)
                .setPositiveButton(android.R.string.ok, (dialog, which) -> {
                    selectedBirthDate = String.format(
                            Locale.US,
                            "%04d-%02d-%02d",
                            picker.getYear(),
                            picker.getMonth() + 1,
                            picker.getDayOfMonth()
                    );
                    textDob.setText(displayDate(selectedBirthDate));
                })
                .setNegativeButton(android.R.string.cancel, null)
                .show();
    }

    private void showRelationshipPicker() {
        new AlertDialog.Builder(this)
                .setItems(RELATIONSHIPS, (dialog, which) -> textRelationship.setText(RELATIONSHIPS[which]))
                .show();
    }

    private void updateBabyProfile() {
        String babyName = editBabyName.getText() != null ? editBabyName.getText().toString().trim() : "";
        if (babyName.isEmpty() || selectedBirthDate.isEmpty()) {
            Toast.makeText(this, getString(R.string.field_required), Toast.LENGTH_SHORT).show();
            return;
        }

        buttonUpdate.setEnabled(false);

        Map<String, Object> babyBody = new HashMap<>();
        babyBody.put("name", babyName);
        babyBody.put("birth_date", selectedBirthDate);
        babyBody.put("gender", selectedGender);

        apiService.updateBaby(babyId, babyBody).enqueue(new Callback<ApiResponse<Baby>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<Baby>> call,
                                   @NonNull Response<ApiResponse<Baby>> response) {
                if (response.isSuccessful()) {
                    updateParentProfile();
                } else {
                    buttonUpdate.setEnabled(true);
                    Toast.makeText(BabyProfileActivity.this, getString(R.string.network_error), Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<Baby>> call, @NonNull Throwable t) {
                buttonUpdate.setEnabled(true);
                Toast.makeText(BabyProfileActivity.this, getString(R.string.network_error), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void updateParentProfile() {
        Map<String, Object> profileBody = new HashMap<>();
        String parentName = editParentName.getText() != null ? editParentName.getText().toString().trim() : "";
        if (!parentName.isEmpty()) profileBody.put("full_name", parentName);
        profileBody.put("relation_to_baby", textRelationship.getText().toString().toLowerCase(Locale.US));

        apiService.updateProfile(profileBody).enqueue(new Callback<ApiResponse<User>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<User>> call,
                                   @NonNull Response<ApiResponse<User>> response) {
                buttonUpdate.setEnabled(true);
                Toast.makeText(BabyProfileActivity.this, getString(R.string.success), Toast.LENGTH_SHORT).show();
                setResult(RESULT_OK, new Intent());
                finish();
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<User>> call, @NonNull Throwable t) {
                buttonUpdate.setEnabled(true);
                Toast.makeText(BabyProfileActivity.this, getString(R.string.network_error), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private String normalizeGender(String gender) {
        return "male".equalsIgnoreCase(gender) || "boy".equalsIgnoreCase(gender) ? "male" : "female";
    }

    private String normalizeDate(String date) {
        if (date == null || date.length() < 10) return "";
        return date.substring(0, 10);
    }

    private String displayDate(String date) {
        if (date == null || date.isEmpty()) return "";
        try {
            Date parsed = new SimpleDateFormat("yyyy-MM-dd", Locale.US).parse(date);
            return parsed != null ? new SimpleDateFormat("MMM d, yyyy", Locale.US).format(parsed) : date;
        } catch (ParseException e) {
            return date;
        }
    }

    private String formatRelationship(String relation) {
        String trimmed = relation.trim();
        for (String option : RELATIONSHIPS) {
            if (option.equalsIgnoreCase(trimmed)) return option;
        }
        if (trimmed.isEmpty()) return getString(R.string.rel_mother);
        return Character.toUpperCase(trimmed.charAt(0)) + trimmed.substring(1);
    }
}
