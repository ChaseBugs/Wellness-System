package com.talentbaby.app.activities;

import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.view.MotionEvent;
import android.view.inputmethod.InputMethodManager;
import android.content.Context;
import android.widget.Button;
import android.widget.DatePicker;
import android.widget.LinearLayout;
import android.widget.RadioGroup;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.checkbox.MaterialCheckBox;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;
import com.talentbaby.app.MainActivity;
import com.talentbaby.app.R;
import com.talentbaby.app.models.ApiResponse;
import com.talentbaby.app.models.Baby;
import com.talentbaby.app.network.ApiService;
import com.talentbaby.app.utils.ApiClient;

import java.util.Calendar;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class AddBabyActivity extends AppCompatActivity {

    private LinearLayout layoutStep1;
    private LinearLayout layoutStep2;

    private TextInputEditText editBabyName;
    private TextView btnGirl;
    private TextView btnBoy;
    private TextInputLayout layoutBirthDate;
    private TextInputEditText editBirthDate;
    private MaterialCheckBox checkboxPremature;
    private TextInputLayout layoutScheduledDob;
    private TextInputEditText editScheduledDob;
    private TextView textScheduledDobHint;

    private TextInputEditText editParentName;
    private RadioGroup radioGroupRelationship;

    private Button buttonContinue;
    private ApiService apiService;

    private String selectedGender = "male"; // default Boy
    private int currentStep = 1;
    private boolean isEditMode = false;
    private int babyId = -1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_add_baby);

        apiService = ApiClient.getClient().create(ApiService.class);

        babyId = getIntent().getIntExtra("baby_id", -1);
        isEditMode = (babyId != -1);

        initViews();
        loadParentProfile();
        prefillIfEditing();
    }

    private void initViews() {
        layoutStep1 = findViewById(R.id.layoutStep1);
        layoutStep2 = findViewById(R.id.layoutStep2);

        editBabyName = findViewById(R.id.editBabyName);
        btnGirl = findViewById(R.id.btnGirl);
        btnBoy = findViewById(R.id.btnBoy);
        layoutBirthDate = findViewById(R.id.layoutBirthDate);
        editBirthDate = findViewById(R.id.editBirthDate);
        checkboxPremature = findViewById(R.id.checkboxPremature);
        layoutScheduledDob = findViewById(R.id.layoutScheduledDob);
        editScheduledDob = findViewById(R.id.editScheduledDob);
        textScheduledDobHint = findViewById(R.id.textScheduledDobHint);

        editParentName = findViewById(R.id.editParentName);
        radioGroupRelationship = findViewById(R.id.radioGroupRelationship);

        buttonContinue = findViewById(R.id.buttonContinue);

        findViewById(R.id.btnBack).setOnClickListener(v -> {
            if (currentStep == 2) {
                showStep(1);
            } else {
                finish();
            }
        });

        // Gender toggle
        btnBoy.setOnClickListener(v -> selectGender("male"));
        btnGirl.setOnClickListener(v -> selectGender("female"));

        // Date picker
        setupDateField(editBirthDate, layoutBirthDate);
        setupDateField(editScheduledDob, layoutScheduledDob);
        editBabyName.addTextChangedListener(inputWatcher);
        editBirthDate.addTextChangedListener(inputWatcher);
        editScheduledDob.addTextChangedListener(inputWatcher);
        editParentName.addTextChangedListener(inputWatcher);
        radioGroupRelationship.setOnCheckedChangeListener((group, checkedId) -> updateContinueState());

        // Premature checkbox
        checkboxPremature.setOnCheckedChangeListener((cb, checked) -> {
            layoutScheduledDob.setVisibility(checked ? View.VISIBLE : View.GONE);
            textScheduledDobHint.setVisibility(checked ? View.VISIBLE : View.GONE);
            updateContinueState();
        });

        // Continue button
        buttonContinue.setOnClickListener(v -> {
            if (currentStep == 1) {
                if (validateStep1()) {
                    showStep(2);
                }
            } else {
                saveBaby();
            }
        });

        selectGender(selectedGender);
        updateContinueState();
    }

    private final TextWatcher inputWatcher = new TextWatcher() {
        @Override public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
        @Override public void onTextChanged(CharSequence s, int start, int before, int count) {
            updateContinueState();
        }
        @Override public void afterTextChanged(Editable s) {}
    };

    private void selectGender(String gender) {
        selectedGender = gender;
        if ("male".equals(gender)) {
            btnBoy.setBackgroundResource(R.drawable.bg_teal_button);
            btnBoy.setTextColor(getColor(android.R.color.white));
            btnGirl.setBackground(null);
            btnGirl.setTextColor(getColor(R.color.text_secondary));
        } else {
            btnGirl.setBackgroundResource(R.drawable.bg_teal_button);
            btnGirl.setTextColor(getColor(android.R.color.white));
            btnBoy.setBackground(null);
            btnBoy.setTextColor(getColor(R.color.text_secondary));
        }
    }

    private void showDatePicker(TextInputEditText target) {
        Calendar cal = Calendar.getInstance();
        String existing = target.getText() != null ? target.getText().toString().trim() : "";
        if (!existing.isEmpty()) {
            try {
                String[] parts = existing.split("-");
                if (parts.length == 3) {
                    cal.set(
                            Integer.parseInt(parts[0]),
                            Integer.parseInt(parts[1]) - 1,
                            Integer.parseInt(parts[2])
                    );
                }
            } catch (NumberFormatException ignored) {
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
                    String date = String.format(
                            Locale.US,
                            "%04d-%02d-%02d",
                            picker.getYear(),
                            picker.getMonth() + 1,
                            picker.getDayOfMonth()
                    );
                    target.setText(date);
                })
                .setNegativeButton(android.R.string.cancel, null)
                .show();
    }

    private void setupDateField(TextInputEditText target, View container) {
        target.setFocusable(false);
        target.setFocusableInTouchMode(false);
        target.setCursorVisible(false);
        target.setInputType(0);
        View.OnClickListener pickerClick = v -> showDatePicker(target);
        target.setOnClickListener(pickerClick);
        if (container != null) {
            container.setOnClickListener(pickerClick);
        }
        View.OnTouchListener pickerTouch = (v, event) -> {
            if (event.getAction() == MotionEvent.ACTION_UP) {
                InputMethodManager imm = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
                if (imm != null) imm.hideSoftInputFromWindow(target.getWindowToken(), 0);
                showDatePicker(target);
                return true;
            }
            return true;
        };
        target.setOnTouchListener(pickerTouch);
        if (container != null) {
            container.setOnTouchListener(pickerTouch);
        }
    }

    private boolean validateStep1() {
        String name = editBabyName.getText() != null ? editBabyName.getText().toString().trim() : "";
        String dob = editBirthDate.getText() != null ? editBirthDate.getText().toString().trim() : "";
        if (name.isEmpty() || dob.isEmpty()) {
            Toast.makeText(this, getString(R.string.field_required), Toast.LENGTH_SHORT).show();
            return false;
        }
        if (checkboxPremature.isChecked()) {
            String scheduledDob = editScheduledDob.getText() != null ? editScheduledDob.getText().toString().trim() : "";
            if (scheduledDob.isEmpty()) {
                Toast.makeText(this, getString(R.string.field_required), Toast.LENGTH_SHORT).show();
                return false;
            }
        }
        return true;
    }

    private boolean validateStep2() {
        String parentName = editParentName.getText() != null ? editParentName.getText().toString().trim() : "";
        if (parentName.isEmpty() || radioGroupRelationship.getCheckedRadioButtonId() == -1) {
            Toast.makeText(this, getString(R.string.field_required), Toast.LENGTH_SHORT).show();
            return false;
        }
        return true;
    }

    private void showStep(int step) {
        currentStep = step;
        layoutStep1.setVisibility(step == 1 ? View.VISIBLE : View.GONE);
        layoutStep2.setVisibility(step == 2 ? View.VISIBLE : View.GONE);
        buttonContinue.setText(step == 2
                ? getString(R.string.save)
                : getString(R.string.continue_btn));
        updateContinueState();
    }

    private void loadParentProfile() {
        apiService.getProfile().enqueue(new Callback<ApiResponse<com.talentbaby.app.models.User>>() {
            @Override
            public void onResponse(Call<ApiResponse<com.talentbaby.app.models.User>> call,
                                   Response<ApiResponse<com.talentbaby.app.models.User>> response) {
                if (!response.isSuccessful() || response.body() == null || response.body().getData() == null) return;
                com.talentbaby.app.models.User user = response.body().getData();
                if (user.getFullName() != null) editParentName.setText(user.getFullName());
                preselectRelationship(user.getRelationToBaby());
            }
            @Override public void onFailure(Call<ApiResponse<com.talentbaby.app.models.User>> call, Throwable t) {}
        });
    }

    private void prefillIfEditing() {
        if (!isEditMode) return;
        String name = getIntent().getStringExtra("baby_name");
        String dob = getIntent().getStringExtra("baby_birth_date");
        String gender = getIntent().getStringExtra("baby_gender");
        if (name != null) editBabyName.setText(name);
        if (dob != null) editBirthDate.setText(dob);
        if ("female".equalsIgnoreCase(gender)) selectGender("female");
        else selectGender("male");
        buttonContinue.setText(getString(R.string.save));
    }

    private void saveBaby() {
        if (currentStep == 2 && !validateStep2()) return;

        String name = editBabyName.getText() != null ? editBabyName.getText().toString().trim() : "";
        String birthDate = checkboxPremature.isChecked()
                && editScheduledDob.getText() != null
                && !editScheduledDob.getText().toString().trim().isEmpty()
                ? editScheduledDob.getText().toString().trim()
                : (editBirthDate.getText() != null ? editBirthDate.getText().toString().trim() : "");

        if (name.isEmpty() || birthDate.isEmpty()) {
            Toast.makeText(this, getString(R.string.field_required), Toast.LENGTH_SHORT).show();
            return;
        }

        Map<String, Object> body = new HashMap<>();
        body.put("name", name);
        body.put("birth_date", birthDate);
        body.put("gender", selectedGender);

        buttonContinue.setEnabled(false);

        Callback<ApiResponse<Baby>> callback = new Callback<ApiResponse<Baby>>() {
            @Override
            public void onResponse(Call<ApiResponse<Baby>> call, Response<ApiResponse<Baby>> response) {
                buttonContinue.setEnabled(true);
                if (response.isSuccessful() && response.body() != null) {
                    Baby baby = response.body().getData();
                    if (baby != null) {
                        // Save active baby id so rest of the app can use it
                        com.talentbaby.app.utils.TokenManager tokenManager =
                                new com.talentbaby.app.utils.TokenManager(AddBabyActivity.this);
                        tokenManager.saveActiveBabyId(baby.getId());
                    }
                    saveParentRelation(() -> {
                        if (isEditMode) finish();
                        else navigateToMain();
                    });
                } else {
                    Toast.makeText(AddBabyActivity.this,
                            getString(R.string.network_error), Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Baby>> call, Throwable t) {
                buttonContinue.setEnabled(true);
                Toast.makeText(AddBabyActivity.this,
                        getString(R.string.network_error), Toast.LENGTH_SHORT).show();
            }
        };

        if (isEditMode) {
            apiService.updateBaby(babyId, body).enqueue(callback);
        } else {
            apiService.createBaby(body).enqueue(callback);
        }
    }

    private void saveParentRelation(Runnable onComplete) {
        // Resolve selected relation radio button
        int checkedId = radioGroupRelationship.getCheckedRadioButtonId();
        if (checkedId == -1) {
            onComplete.run();
            return;
        }

        android.widget.RadioButton rb = radioGroupRelationship.findViewById(checkedId);
        if (rb == null) {
            onComplete.run();
            return;
        }

        String relation = rb.getText().toString().toLowerCase().trim();
        if (relation.isEmpty()) {
            onComplete.run();
            return;
        }

        Map<String, Object> profileUpdate = new HashMap<>();
        String parentName = editParentName.getText() != null ? editParentName.getText().toString().trim() : "";
        if (!parentName.isEmpty()) profileUpdate.put("full_name", parentName);
        profileUpdate.put("relation_to_baby", relation);
        apiService.updateProfile(profileUpdate).enqueue(new Callback<ApiResponse<com.talentbaby.app.models.User>>() {
            @Override
            public void onResponse(Call<ApiResponse<com.talentbaby.app.models.User>> call,
                                   Response<ApiResponse<com.talentbaby.app.models.User>> response) {
                onComplete.run();
            }
            @Override
            public void onFailure(Call<ApiResponse<com.talentbaby.app.models.User>> call, Throwable t) {
                onComplete.run();
            }
        });
    }

    private void preselectRelationship(String relation) {
        if (relation == null) return;
        String normalized = relation.toLowerCase(Locale.US).trim();
        int id = -1;
        if (normalized.equals(getString(R.string.rel_father).toLowerCase(Locale.US))) id = R.id.radioFather;
        else if (normalized.equals(getString(R.string.rel_mother).toLowerCase(Locale.US))) id = R.id.radioMother;
        else if (normalized.equals(getString(R.string.rel_grandfather).toLowerCase(Locale.US))) id = R.id.radioGrandfather;
        else if (normalized.equals(getString(R.string.rel_grandmother).toLowerCase(Locale.US))) id = R.id.radioGrandmother;
        else if (normalized.equals(getString(R.string.rel_babysitter).toLowerCase(Locale.US))) id = R.id.radioBabysitter;
        else if (normalized.equals(getString(R.string.rel_aunt).toLowerCase(Locale.US))) id = R.id.radioAunt;
        else if (normalized.equals(getString(R.string.rel_uncle).toLowerCase(Locale.US))) id = R.id.radioUncle;
        else if (normalized.equals(getString(R.string.rel_development_professional).toLowerCase(Locale.US))) id = R.id.radioDevelopmentProfessional;
        else if (normalized.equals(getString(R.string.rel_other).toLowerCase(Locale.US))) id = R.id.radioOther;
        if (id != -1) radioGroupRelationship.check(id);
    }

    private void updateContinueState() {
        if (buttonContinue == null) return;
        boolean valid = currentStep == 1 ? isStep1Ready() : isStep2Ready();
        buttonContinue.setEnabled(valid);
        buttonContinue.setTextColor(getColor(valid ? android.R.color.white : R.color.design_gray));
        buttonContinue.setBackgroundResource(valid ? R.drawable.bg_teal_button_large : R.drawable.bg_disabled_pill);
    }

    private boolean isStep1Ready() {
        String name = editBabyName.getText() != null ? editBabyName.getText().toString().trim() : "";
        String dob = editBirthDate.getText() != null ? editBirthDate.getText().toString().trim() : "";
        String scheduledDob = editScheduledDob.getText() != null ? editScheduledDob.getText().toString().trim() : "";
        return !name.isEmpty() && !dob.isEmpty() && (!checkboxPremature.isChecked() || !scheduledDob.isEmpty());
    }

    private boolean isStep2Ready() {
        String parentName = editParentName.getText() != null ? editParentName.getText().toString().trim() : "";
        return !parentName.isEmpty() && radioGroupRelationship.getCheckedRadioButtonId() != -1;
    }

    private void navigateToMain() {
        Intent intent = new Intent(this, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }
}
