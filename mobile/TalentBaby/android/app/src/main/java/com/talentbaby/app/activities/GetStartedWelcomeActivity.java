package com.talentbaby.app.activities;

import android.content.Intent;
import android.os.Bundle;

import com.talentbaby.app.GlobalData;
import com.talentbaby.app.R;

public class GetStartedWelcomeActivity extends GlobalActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_get_started_welcome);
        GlobalData.clearOnboarding();

        findViewById(R.id.btnGetStarted).setOnClickListener(v ->
                startActivity(new Intent(this, GetStartedInfoActivity.class)));

        findViewById(R.id.textAlreadyUser).setOnClickListener(v -> {
            GlobalData.setAuthEntryMethod("existing_user");
            startActivity(new Intent(this, LoginActivity.class));
        });
    }
}
