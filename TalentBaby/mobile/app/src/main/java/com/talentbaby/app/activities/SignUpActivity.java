package com.talentbaby.app.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.textfield.TextInputEditText;
import com.talentbaby.app.MainActivity;
import com.talentbaby.app.activities.AddBabyActivity;
import com.talentbaby.app.R;
import com.talentbaby.app.models.AuthResponse;
import com.talentbaby.app.network.ApiService;
import com.talentbaby.app.utils.ApiClient;
import com.talentbaby.app.utils.TokenManager;

import java.util.HashMap;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class SignUpActivity extends AppCompatActivity {

    private TextInputEditText editTextFullName;
    private TextInputEditText editTextEmail;
    private TextInputEditText editTextPassword;
    private TextInputEditText editTextConfirmPassword;
    private TextView buttonSignUp;
    private ProgressBar progressBar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_signup);

        editTextFullName = findViewById(R.id.editTextFullName);
        editTextEmail = findViewById(R.id.editTextEmail);
        editTextPassword = findViewById(R.id.editTextPassword);
        editTextConfirmPassword = findViewById(R.id.editTextConfirmPassword);
        buttonSignUp = findViewById(R.id.buttonSignUp);
        progressBar = findViewById(R.id.progressBar);

        View btnBack = findViewById(R.id.btnBack);
        if (btnBack != null) btnBack.setOnClickListener(v -> onBackPressed());

        buttonSignUp.setOnClickListener(v -> signUp());

        findViewById(R.id.textViewLogin).setOnClickListener(v -> {
            startActivity(new Intent(this, LoginActivity.class));
            finish();
        });
    }

    private void signUp() {
        String fullName = editTextFullName.getText() != null
                ? editTextFullName.getText().toString().trim() : "";
        String email = editTextEmail.getText() != null
                ? editTextEmail.getText().toString().trim() : "";
        String password = editTextPassword.getText() != null
                ? editTextPassword.getText().toString().trim() : "";
        String confirmPassword = editTextConfirmPassword.getText() != null
                ? editTextConfirmPassword.getText().toString().trim() : "";

        if (email.isEmpty() || password.isEmpty() || confirmPassword.isEmpty()) {
            Toast.makeText(this, getString(R.string.field_required), Toast.LENGTH_SHORT).show();
            return;
        }

        if (password.length() < 6) {
            Toast.makeText(this, getString(R.string.password_too_short), Toast.LENGTH_SHORT).show();
            return;
        }

        if (!password.equals(confirmPassword)) {
            Toast.makeText(this, getString(R.string.passwords_do_not_match), Toast.LENGTH_SHORT).show();
            return;
        }

        setLoading(true);

        Map<String, String> body = new HashMap<>();
        body.put("email", email);
        body.put("password", password);
        if (!fullName.isEmpty()) {
            body.put("fullName", fullName);
        }

        ApiService apiService = ApiClient.getClient().create(ApiService.class);
        apiService.signup(body).enqueue(new Callback<AuthResponse>() {
            @Override
            public void onResponse(Call<AuthResponse> call, Response<AuthResponse> response) {
                setLoading(false);
                if (response.isSuccessful() && response.body() != null
                        && response.body().getData() != null) {
                    AuthResponse.AuthData data = response.body().getData();
                    TokenManager.saveToken(SignUpActivity.this, data.getToken());
                    if (data.getUser() != null) {
                        TokenManager.saveUserId(SignUpActivity.this, data.getUser().getId());
                    }
                    Toast.makeText(SignUpActivity.this,
                            getString(R.string.signup_success), Toast.LENGTH_SHORT).show();
                    navigateToAddBaby();
                } else {
                    String msg = "Sign up failed";
                    if (response.errorBody() != null) {
                        try { msg = response.errorBody().string(); } catch (Exception ignored) {}
                    }
                    Toast.makeText(SignUpActivity.this, msg, Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<AuthResponse> call, Throwable t) {
                setLoading(false);
                Toast.makeText(SignUpActivity.this,
                        getString(R.string.network_error), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void setLoading(boolean loading) {
        progressBar.setVisibility(loading ? View.VISIBLE : View.GONE);
        buttonSignUp.setEnabled(!loading);
        buttonSignUp.setAlpha(loading ? 0.6f : 1f);
    }

    private void navigateToAddBaby() {
        Intent intent = new Intent(this, AddBabyActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }
}
