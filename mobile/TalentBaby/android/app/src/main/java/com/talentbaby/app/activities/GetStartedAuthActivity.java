package com.talentbaby.app.activities;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Toast;

import com.talentbaby.app.GlobalData;
import com.talentbaby.app.R;

public class GetStartedAuthActivity extends GlobalActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_get_started_auth);

        findViewById(R.id.btnBack).setOnClickListener(v -> finish());

        findViewById(R.id.btnEmail).setOnClickListener(v -> {
            GlobalData.setAuthEntryMethod("email");
            startActivity(new Intent(this, SignUpActivity.class));
        });

        findViewById(R.id.btnGoogle).setOnClickListener(v -> {
            GlobalData.setAuthEntryMethod("google");
            Toast.makeText(this, "Google Sign-In coming soon", Toast.LENGTH_SHORT).show();
        });
    }
}
