package com.talentbaby.app.activities;

import android.content.Intent;
import android.content.ActivityNotFoundException;
import android.net.Uri;
import android.os.Bundle;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.talentbaby.app.R;

public class ParentingSupportActivity extends AppCompatActivity {
    private EditText editMessage;
    private String selectedTopic = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_parenting_support);

        editMessage = findViewById(R.id.editSupportMessage);
        findViewById(R.id.btnBackSupport).setOnClickListener(v -> finish());

        bindTopic(R.id.topicSleep);
        bindTopic(R.id.topicFeeding);
        bindTopic(R.id.topicMilestones);
        bindTopic(R.id.topicGrowth);

        findViewById(R.id.btnSendSupport).setOnClickListener(v -> sendSupportRequest());
    }

    private void bindTopic(int viewId) {
        TextView topic = findViewById(viewId);
        topic.setOnClickListener(v -> {
            selectedTopic = topic.getText().toString();
            String current = editMessage.getText() != null ? editMessage.getText().toString() : "";
            if (current.trim().isEmpty()) {
                editMessage.setText(selectedTopic + ": ");
                editMessage.setSelection(editMessage.length());
            }
        });
    }

    private void sendSupportRequest() {
        String message = editMessage.getText() != null ? editMessage.getText().toString().trim() : "";
        if (message.isEmpty()) {
            Toast.makeText(this, getString(R.string.field_required), Toast.LENGTH_SHORT).show();
            return;
        }

        Intent intent = new Intent(Intent.ACTION_SENDTO);
        intent.setData(Uri.parse("mailto:support@talentbaby.app"));
        intent.putExtra(Intent.EXTRA_SUBJECT, selectedTopic.isEmpty()
                ? getString(R.string.support_title)
                : getString(R.string.support_title) + " - " + selectedTopic);
        intent.putExtra(Intent.EXTRA_TEXT, message);

        try {
            startActivity(intent);
        } catch (ActivityNotFoundException e) {
            Toast.makeText(this, getString(R.string.support_sent), Toast.LENGTH_SHORT).show();
        }
    }
}
