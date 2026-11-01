package com.heightincrease.app.activities;

import android.graphics.Typeface;
import android.os.Bundle;
import android.text.InputType;
import android.view.Gravity;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.heightincrease.app.ui.Palette;
import com.heightincrease.app.ui.Ui;
import com.heightincrease.app.viewmodel.SignInViewModel;

/** Email sign-in with the shared Wellness account; the same account works in the other apps. */
public class SignInActivity extends BaseActivity {
    private SignInViewModel viewModel;
    private EditText email;
    private EditText password;
    private TextView message;
    private TextView signIn;
    private TextView create;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        viewModel = new SignInViewModel(remote);

        // Not in the design; styled like the onboarding screens (white page, condensed title, pill button).
        LinearLayout root = page(android.graphics.Color.WHITE);
        root.setPadding(Ui.dp(this, 26), Ui.dp(this, 54), Ui.dp(this, 26), Ui.dp(this, 24));

        TextView back = Ui.text(this, "←", 30, Palette.MUTED, Typeface.NORMAL);
        back.setOnClickListener(v -> finish());
        root.addView(back);
        root.addView(Ui.heading(this, "Sign in 👋", 34, Palette.TEXT), Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 20, 18, 0, 0));
        TextView intro = Ui.text(this, "Save your workouts, sleep and height records to your Wellness account.",
                18, Palette.MUTED, Typeface.NORMAL);
        root.addView(intro, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 20, 8, 0, 36));

        email = field("Email", InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS);
        password = field("Password (8+ characters)", InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD);
        root.addView(email, fieldParams());
        root.addView(password, fieldParams());

        message = Ui.text(this, "", 16, Palette.MUTED, Typeface.NORMAL);
        message.setGravity(Gravity.CENTER);
        root.addView(message, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 4, 0, 16));

        signIn = Ui.button(this, "SIGN IN");
        signIn.setOnClickListener(v -> submit(false));
        root.addView(signIn, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 0, 0, 14));

        create = Ui.button(this, "CREATE ACCOUNT");
        create.setBackground(Ui.strokeBg(android.graphics.Color.WHITE, Palette.BLUE, 2, 34, this));
        create.setTextColor(Palette.BLUE);
        create.setOnClickListener(v -> submit(true));
        root.addView(create, Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 0, 0, 0));

        android.widget.ScrollView scroll = Ui.scroll(this, root);
        scroll.setBackgroundColor(android.graphics.Color.WHITE);
        setContentView(scroll);
    }

    private void submit(boolean createAccount) {
        if (viewModel.isLoading()) {
            return;
        }
        String invalid = viewModel.submit(email.getText().toString(), password.getText().toString(),
                createAccount, this::onResult);
        if (invalid != null) {
            message.setText(invalid);
            return;
        }
        message.setText(createAccount ? "Creating your account..." : "Signing in...");
        setEnabled(false);
    }

    private void onResult() {
        if (!alive()) {
            return;
        }
        if (viewModel.getState()) {
            finish();
            return;
        }
        setEnabled(true);
        message.setText(viewModel.getError());
    }

    private void setEnabled(boolean enabled) {
        signIn.setEnabled(enabled);
        create.setEnabled(enabled);
        signIn.setAlpha(enabled ? 1f : 0.5f);
        create.setAlpha(enabled ? 1f : 0.5f);
    }

    private EditText field(String hint, int inputType) {
        EditText field = new EditText(this);
        field.setHint(hint);
        field.setInputType(inputType);
        // Password input switches to a monospace typeface; keep the app font.
        field.setTypeface(Typeface.DEFAULT);
        field.setSingleLine(true);
        field.setTextSize(18);
        field.setTextColor(Palette.TEXT);
        field.setHintTextColor(Palette.MUTED);
        field.setBackground(Ui.bg(Palette.SOFT_GRAY, 16, this));
        field.setPadding(Ui.dp(this, 18), Ui.dp(this, 16), Ui.dp(this, 18), Ui.dp(this, 16));
        return field;
    }

    private LinearLayout.LayoutParams fieldParams() {
        return Ui.mlp(this, ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT, 0, 0, 0, 14);
    }
}
