package com.talentbaby.app.ui.splash;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;

import com.talentbaby.app.MainActivity;
import com.talentbaby.app.R;
import com.talentbaby.app.activities.GetStartedWelcomeActivity;
import com.talentbaby.app.activities.GlobalActivity;
import com.talentbaby.app.utils.TokenManager;

public class SplashActivity extends GlobalActivity {

    private static final long SPLASH_DURATION_MS = 2000;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);

        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            Intent intent;
            if (TokenManager.isLoggedIn(this)) {
                intent = new Intent(this, MainActivity.class);
            } else {
                intent = new Intent(this, GetStartedWelcomeActivity.class);
            }
            startActivity(intent);
            overridePendingTransition(0, 0);
            finish();
        }, SPLASH_DURATION_MS);
    }
}
