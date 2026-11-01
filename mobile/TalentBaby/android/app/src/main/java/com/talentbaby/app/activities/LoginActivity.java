package com.talentbaby.app.activities;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Patterns;
import android.view.View;
import android.view.inputmethod.InputMethodManager;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import com.talentbaby.app.GlobalData;
import com.talentbaby.app.R;
import com.talentbaby.app.MainActivity;
import com.talentbaby.app.utils.TokenManager;

public class LoginActivity extends GlobalActivity {

    private static final String PREFS_REMEMBER = "remember_me_prefs";
    private static final String KEY_SAVED_EMAIL = "saved_email";

    private TextView editTextEmail;
    private TextView buttonLogin;
    private ProgressBar progressBar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (TokenManager.isLoggedIn(this)) {
            navigateToMain();
            return;
        }

        setContentView(R.layout.activity_login);

        editTextEmail = findViewById(R.id.editTextEmail);
        buttonLogin = findViewById(R.id.buttonLogin);
        progressBar = findViewById(R.id.progressBar);

        View btnBack = findViewById(R.id.btnBack);
        if (btnBack != null) btnBack.setOnClickListener(v -> onBackPressed());

        restoreSavedEmail();
        editTextEmail.addTextChangedListener(emailWatcher);
        buttonLogin.setOnClickListener(v -> sendOtp());
        updateSendOtpState();
    }

    private void restoreSavedEmail() {
        SharedPreferences prefs = getSharedPreferences(PREFS_REMEMBER, Context.MODE_PRIVATE);
        String savedEmail = prefs.getString(KEY_SAVED_EMAIL, "");
        editTextEmail.setText(savedEmail);
    }

    private final TextWatcher emailWatcher = new TextWatcher() {
        @Override public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
        @Override public void onTextChanged(CharSequence s, int start, int before, int count) {
            updateSendOtpState();
        }
        @Override public void afterTextChanged(Editable s) {}
    };

    private void updateSendOtpState() {
        boolean valid = isEmailValid();
        buttonLogin.setEnabled(valid);
        buttonLogin.setBackgroundResource(valid ? R.drawable.bg_teal_button_large : R.drawable.bg_disabled_pill);
        buttonLogin.setTextColor(getColor(valid ? android.R.color.white : R.color.design_gray));
    }

    private boolean isEmailValid() {
        String email = editTextEmail.getText() != null
                ? editTextEmail.getText().toString().trim() : "";
        return Patterns.EMAIL_ADDRESS.matcher(email).matches();
    }

    private void sendOtp() {
        String email = editTextEmail.getText() != null
                ? editTextEmail.getText().toString().trim() : "";

        if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            Toast.makeText(this, getString(R.string.valid_email_required), Toast.LENGTH_SHORT).show();
            return;
        }

        hideKeyboard();
        saveEmail(email);
        GlobalData.setLoginEmail(email);
        GlobalData.setAuthEntryMethod("login_email");
        Toast.makeText(this, getString(R.string.send_otp), Toast.LENGTH_SHORT).show();
    }

    private void saveEmail(String email) {
        SharedPreferences prefs = getSharedPreferences(PREFS_REMEMBER, Context.MODE_PRIVATE);
        prefs.edit().putString(KEY_SAVED_EMAIL, email).apply();
    }

    private void hideKeyboard() {
        InputMethodManager imm = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
        if (imm != null) {
            imm.hideSoftInputFromWindow(editTextEmail.getWindowToken(), 0);
        }
    }

    private void setLoading(boolean loading) {
        progressBar.setVisibility(loading ? View.VISIBLE : View.GONE);
        buttonLogin.setEnabled(!loading);
        buttonLogin.setAlpha(loading ? 0.6f : 1f);
    }

    private void navigateToMain() {
        Intent intent = new Intent(this, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }
}
