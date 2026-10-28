package com.foodvisor.mobile;

import android.app.Activity;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.View;
import android.view.Window;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.Toast;

import java.io.IOException;
import java.io.InputStream;

public class DesignFlowActivity extends Activity {
    private static final String ASSET_DIR = "design_ui/";

    private static final Workflow[] WORKFLOWS = {
            new Workflow("Splash", new String[]{"00_splash.png"}),
            new Workflow("Get Started", new String[]{
                    "01_get_started_00.png",
                    "01_get_started_01.png",
                    "01_get_started_02.png",
                    "01_get_started_03.png",
                    "01_get_started_04.png",
                    "01_get_started_05.png",
                    "01_get_started_06.png",
                    "01_get_started_07.png",
                    "01_get_started_finished.png"
            }),
            new Workflow("Goal & profile", new String[]{
                    "02_setting_profile_00.png",
                    "02_setting_profile_01.png",
                    "02_setting_profile_02.png",
                    "02_setting_profile_03.png",
                    "02_setting_profile_04.png",
                    "02_setting_profile_05.png",
                    "02_setting_profile_06.png",
                    "02_setting_profile_07.png",
                    "02_setting_profile_08.png",
                    "02_setting_profile_09.png",
                    "02_setting_profile_10.png",
                    "02_setting_profile_11.png",
                    "02_setting_profile_12.png",
                    "02_setting_profile_13.png",
                    "02_setting_profile_14.png",
                    "02_setting_profile_15.png"
            }),
            new Workflow("Environment", new String[]{
                    "03_setting_environment_00.png",
                    "03_setting_environment_01.png",
                    "03_setting_environment_02.png",
                    "03_setting_environment_03.png",
                    "03_setting_environment_04.png",
                    "03_setting_environment_05.png",
                    "03_setting_environment_06.png"
            }),
            new Workflow("Habits", new String[]{
                    "04_setting_habits_00.png",
                    "04_setting_habits_01.png",
                    "04_setting_habits_02.png",
                    "04_setting_habits_03.png",
                    "04_setting_habits_04.png",
                    "04_setting_habits_05.png",
                    "04_setting_habits_06.png",
                    "04_setting_habits_07.png",
                    "04_setting_habits_08.png",
                    "04_setting_habits_09.png",
                    "04_setting_habits_10.png",
                    "04_setting_habits_11.png"
            }),
            new Workflow("Your Needs", new String[]{
                    "05_you_needs_00.png",
                    "05_you_needs_01.png",
                    "05_you_needs_02.png"
            }),
            new Workflow("Activity Reveal", new String[]{
                    "06_loading activity.png",
                    "07_dice activity.png"
            }),
            new Workflow("Daily Nutrition", new String[]{
                    "08_daily_nutrition_00.png",
                    "08_daily_nutrition_01.png",
                    "08_daily_nutrition_02.png",
                    "08_daily_nutrition_03.png",
                    "08_daily_nutrition_04.png"
            }),
            new Workflow("Profile", new String[]{
                    "10_profile_00.png",
                    "10_profile_01.png",
                    "10_profile_02.png",
                    "10_profile_03.png"
            }),
            new Workflow("Journal Entry", new String[]{"11_journal_00.png"}),
            new Workflow("Activity List", new String[]{
                    "12_activity_list_00.png",
                    "12_activity_list_01.png",
                    "12_activity_list_02.png",
                    "12_activity_list_03.png",
                    "12_activity_list_04.png",
                    "12_activity_list_05.png",
                    "12_activity_list_06.png",
                    "12_activity_list_07.png",
                    "12_activity_list_08.png"
            }),
            new Workflow("Welcome Back", new String[]{
                    "13_welcome_back_00.png",
                    "13_welcome_back_01.png",
                    "13_welcome_back_02.png",
                    "13_welcome_back_03.png",
                    "13_welcome_back_04.png",
                    "13_welcome_back_05.png"
            }),
            new Workflow("Journal", new String[]{
                    "14_Journal_00.png",
                    "14_Journal_01.png",
                    "14_Journal_02.png",
                    "14_Journal_03.png"
            })
    };

    private ImageView imageView;
    private Bitmap currentBitmap;
    private int workflowIndex;
    private int stepIndex;
    private float downX;
    private float downY;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setStatusBarColor(android.graphics.Color.BLACK);
        getWindow().setNavigationBarColor(android.graphics.Color.BLACK);
        hideSystemUi();

        if (savedInstanceState != null) {
            workflowIndex = savedInstanceState.getInt("workflowIndex", 0);
            stepIndex = savedInstanceState.getInt("stepIndex", 0);
        }

        imageView = new ImageView(this);
        imageView.setBackgroundColor(android.graphics.Color.BLACK);
        imageView.setScaleType(ImageView.ScaleType.FIT_XY);
        imageView.setAdjustViewBounds(false);
        imageView.setOnTouchListener(this::handleTouch);

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(android.graphics.Color.BLACK);
        root.addView(imageView, new FrameLayout.LayoutParams(-1, -1));
        setContentView(root);

        showCurrent(false);
    }

    @Override
    protected void onResume() {
        super.onResume();
        hideSystemUi();
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        outState.putInt("workflowIndex", workflowIndex);
        outState.putInt("stepIndex", stepIndex);
    }

    @Override
    protected void onDestroy() {
        recycleBitmap();
        super.onDestroy();
    }

    @Override
    public void onBackPressed() {
        if (!move(-1)) {
            super.onBackPressed();
        }
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_VOLUME_DOWN) {
            moveWorkflow(1);
            return true;
        }
        if (keyCode == KeyEvent.KEYCODE_VOLUME_UP) {
            moveWorkflow(-1);
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    private boolean handleTouch(View view, MotionEvent event) {
        if (event.getAction() == MotionEvent.ACTION_DOWN) {
            downX = event.getX();
            downY = event.getY();
            return true;
        }

        if (event.getAction() != MotionEvent.ACTION_UP) {
            return true;
        }

        float dx = event.getX() - downX;
        float dy = event.getY() - downY;
        float width = Math.max(1, view.getWidth());

        if (Math.abs(dx) > width * 0.18f && Math.abs(dx) > Math.abs(dy)) {
            move(dx < 0 ? 1 : -1);
        } else if (event.getX() > width * 0.64f) {
            move(1);
        } else if (event.getX() < width * 0.36f) {
            move(-1);
        } else {
            showProgressToast();
        }

        hideSystemUi();
        return true;
    }

    private boolean move(int direction) {
        Workflow workflow = WORKFLOWS[workflowIndex];
        int nextStep = stepIndex + direction;

        if (nextStep >= 0 && nextStep < workflow.files.length) {
            stepIndex = nextStep;
            showCurrent(true);
            return true;
        }

        int nextWorkflow = workflowIndex + direction;
        if (nextWorkflow < 0 || nextWorkflow >= WORKFLOWS.length) {
            showProgressToast();
            return false;
        }

        workflowIndex = nextWorkflow;
        stepIndex = direction > 0 ? 0 : WORKFLOWS[workflowIndex].files.length - 1;
        showCurrent(true);
        return true;
    }

    private void moveWorkflow(int direction) {
        int nextWorkflow = workflowIndex + direction;
        if (nextWorkflow < 0 || nextWorkflow >= WORKFLOWS.length) {
            showProgressToast();
            return;
        }

        workflowIndex = nextWorkflow;
        stepIndex = 0;
        showCurrent(true);
    }

    private void showCurrent(boolean announce) {
        Workflow workflow = WORKFLOWS[workflowIndex];
        String file = workflow.files[stepIndex];

        try (InputStream stream = getAssets().open(ASSET_DIR + file)) {
            BitmapFactory.Options options = new BitmapFactory.Options();
            options.inPreferredConfig = Bitmap.Config.RGB_565;
            Bitmap bitmap = BitmapFactory.decodeStream(stream, null, options);
            recycleBitmap();
            currentBitmap = bitmap;
            imageView.setImageBitmap(currentBitmap);
            imageView.setContentDescription(workflow.name + ", step " + (stepIndex + 1) + " of " + workflow.files.length);
            if (announce) {
                showProgressToast();
            }
        } catch (IOException error) {
            Toast.makeText(this, "Missing design asset: " + file, Toast.LENGTH_LONG).show();
        }
    }

    private void showProgressToast() {
        Workflow workflow = WORKFLOWS[workflowIndex];
        Toast.makeText(
                this,
                workflow.name + "  " + (stepIndex + 1) + "/" + workflow.files.length + "  (" + absoluteStep() + "/" + totalScreens() + ")",
                Toast.LENGTH_SHORT
        ).show();
    }

    private int absoluteStep() {
        int count = stepIndex + 1;
        for (int i = 0; i < workflowIndex; i++) {
            count += WORKFLOWS[i].files.length;
        }
        return count;
    }

    private int totalScreens() {
        int count = 0;
        for (Workflow workflow : WORKFLOWS) {
            count += workflow.files.length;
        }
        return count;
    }

    private void recycleBitmap() {
        if (currentBitmap != null) {
            currentBitmap.recycle();
            currentBitmap = null;
        }
    }

    private void hideSystemUi() {
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        );
    }

    private static final class Workflow {
        final String name;
        final String[] files;

        Workflow(String name, String[] files) {
            this.name = name;
            this.files = files;
        }
    }
}
