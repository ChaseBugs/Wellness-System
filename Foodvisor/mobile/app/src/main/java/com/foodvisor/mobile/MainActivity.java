package com.foodvisor.mobile;

import android.app.Activity;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.Window;
import android.widget.Button;
import android.widget.EditText;
import android.widget.HorizontalScrollView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class MainActivity extends Activity {
    private int SKY;
    private int BLUSH;
    private int PAPER;
    private int CARD_SOFT;
    private int NAVY;
    private int INK;
    private int MUTED;
    private int RULE;
    private int GREEN;
    private int GREEN_SOFT;
    private int PROTEIN;
    private int FAT;
    private int CARBS;
    private int FIBER;

    private final NutritionModels.Profile profile = new NutritionModels.Profile();
    private DailyNutritionApi api;
    private EditText ageInput;
    private Button calculateButton;
    private TextView profileLine;
    private GoalRingView calorieRing;
    private LinearLayout macroGoalRow;
    private LinearLayout warningList;
    private LinearLayout resultList;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        loadPalette();
        api = new DailyNutritionApi(getString(R.string.daily_targets_api_base));
        styleSystemBars();
        buildScreen();
        requestCalculation();
    }

    private void loadPalette() {
        SKY = getColor(R.color.sky);
        BLUSH = getColor(R.color.blush);
        PAPER = getColor(R.color.paper);
        CARD_SOFT = getColor(R.color.card_soft);
        NAVY = getColor(R.color.navy);
        INK = getColor(R.color.ink);
        MUTED = getColor(R.color.muted);
        RULE = getColor(R.color.rule);
        GREEN = getColor(R.color.green);
        GREEN_SOFT = getColor(R.color.green_soft);
        PROTEIN = getColor(R.color.protein);
        FAT = getColor(R.color.fat);
        CARBS = getColor(R.color.carbs);
        FIBER = getColor(R.color.fiber);
    }

    private void styleSystemBars() {
        Window window = getWindow();
        window.setStatusBarColor(SKY);
        window.setNavigationBarColor(PAPER);
        window.getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
    }

    private void buildScreen() {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackground(new GradientDrawable(
                GradientDrawable.Orientation.TOP_BOTTOM,
                new int[]{SKY, BLUSH, Color.rgb(248, 251, 255)}
        ));

        ScrollView scrollView = new ScrollView(this);
        scrollView.setFillViewport(false);
        scrollView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        scrollView.setBackgroundColor(Color.TRANSPARENT);

        LinearLayout content = new LinearLayout(this);
        content.setOrientation(LinearLayout.VERTICAL);
        content.setPadding(dp(22), dp(38), dp(22), dp(24));
        scrollView.addView(content, new ScrollView.LayoutParams(-1, -2));

        content.addView(titleBlock());
        content.addView(goalBlock());
        content.addView(profileCard());

        warningList = new LinearLayout(this);
        warningList.setOrientation(LinearLayout.VERTICAL);
        warningList.setVisibility(View.GONE);
        content.addView(warningList);

        resultList = new LinearLayout(this);
        resultList.setOrientation(LinearLayout.VERTICAL);
        content.addView(resultList);

        root.addView(scrollView, new LinearLayout.LayoutParams(-1, 0, 1));
        root.addView(bottomAction(), new LinearLayout.LayoutParams(-1, dp(96)));
        setContentView(root);
    }

    private View titleBlock() {
        LinearLayout block = new LinearLayout(this);
        block.setOrientation(LinearLayout.VERTICAL);
        block.setGravity(Gravity.CENTER);

        TextView title = text("Here's your daily\nnutritional goal", 35, NAVY, Typeface.BOLD);
        title.setGravity(Gravity.CENTER);
        title.setTypeface(Typeface.create(Typeface.SERIF, Typeface.BOLD));
        title.setLineSpacing(dp(2), 1.0f);
        title.setIncludeFontPadding(false);
        block.addView(title);

        profileLine = text("", 13, MUTED, Typeface.BOLD);
        profileLine.setGravity(Gravity.CENTER);
        profileLine.setPadding(0, dp(12), 0, 0);
        block.addView(profileLine);

        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(-1, -2);
        params.bottomMargin = dp(28);
        block.setLayoutParams(params);
        return block;
    }

    private View goalBlock() {
        LinearLayout block = new LinearLayout(this);
        block.setOrientation(LinearLayout.VERTICAL);
        block.setGravity(Gravity.CENTER);

        calorieRing = new GoalRingView(this);
        calorieRing.setGoal(0);
        LinearLayout.LayoutParams ringParams = new LinearLayout.LayoutParams(dp(230), dp(230));
        block.addView(calorieRing, ringParams);

        macroGoalRow = new LinearLayout(this);
        macroGoalRow.setOrientation(LinearLayout.HORIZONTAL);
        macroGoalRow.setGravity(Gravity.CENTER);
        macroGoalRow.setPadding(0, dp(28), 0, dp(20));
        renderMacroGoals(null, null, null, null);
        block.addView(macroGoalRow, new LinearLayout.LayoutParams(-1, -2));

        CampSceneView camp = new CampSceneView(this);
        block.addView(camp, new LinearLayout.LayoutParams(-1, dp(156)));

        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(-1, -2);
        params.bottomMargin = dp(16);
        block.setLayoutParams(params);
        return block;
    }

    private View profileCard() {
        LinearLayout card = card(dp(18), PAPER, dp(28), dp(1), Color.argb(80, 216, 226, 239));
        card.setOrientation(LinearLayout.VERTICAL);

        LinearLayout header = new LinearLayout(this);
        header.setOrientation(LinearLayout.HORIZONTAL);
        header.setGravity(Gravity.CENTER_VERTICAL);

        LinearLayout copy = new LinearLayout(this);
        copy.setOrientation(LinearLayout.VERTICAL);
        copy.addView(label("PROFILE"));
        TextView title = text("Adjust nutrition profile", 21, INK, Typeface.BOLD);
        title.setPadding(0, dp(4), 0, 0);
        copy.addView(title);

        ageInput = new EditText(this);
        ageInput.setText(String.valueOf(profile.age));
        ageInput.setSingleLine(true);
        ageInput.setTextSize(18);
        ageInput.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        ageInput.setTextColor(INK);
        ageInput.setGravity(Gravity.CENTER);
        ageInput.setBackground(round(CARD_SOFT, dp(20), dp(1), RULE));
        ageInput.setPadding(dp(8), 0, dp(8), 0);

        header.addView(copy, new LinearLayout.LayoutParams(0, -2, 1));
        header.addView(ageInput, new LinearLayout.LayoutParams(dp(76), dp(56)));
        card.addView(header);

        card.addView(chipGroup("Gender", new Option[]{
                new Option("Male", "male"),
                new Option("Female", "female")
        }, profile.gender, value -> profile.gender = value));

        card.addView(chipGroup("Population", new Option[]{
                new Option("Child", "child"),
                new Option("Teen", "adolescent"),
                new Option("Adult", "adult"),
                new Option("Senior", "elderly")
        }, profile.populationGroup, value -> profile.populationGroup = value));

        card.addView(chipGroup("Stage", new Option[]{
                new Option("General", "general"),
                new Option("Pregnant", "pregnancy"),
                new Option("Preg. mid", "pregnancy_mid"),
                new Option("Lactation", "lactation")
        }, profile.lifeStage, value -> profile.lifeStage = value));

        card.addView(chipGroup("Activity", new Option[]{
                new Option("Low", "low"),
                new Option("Moderate", "moderate"),
                new Option("High", "high"),
                new Option("Heavy", "heavy")
        }, profile.physicalActivityLevel, value -> profile.physicalActivityLevel = value));

        return cardWithMargin(card, 0, 0, 0, dp(14));
    }

    private View chipGroup(String title, Option[] options, String selected, ChoiceHandler handler) {
        LinearLayout block = new LinearLayout(this);
        block.setOrientation(LinearLayout.VERTICAL);
        LinearLayout.LayoutParams blockParams = new LinearLayout.LayoutParams(-1, -2);
        blockParams.topMargin = dp(16);
        block.setLayoutParams(blockParams);

        TextView titleView = label(title.toUpperCase(Locale.US));
        titleView.setPadding(0, 0, 0, dp(8));
        block.addView(titleView);

        HorizontalScrollView scroller = new HorizontalScrollView(this);
        scroller.setHorizontalScrollBarEnabled(false);
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.HORIZONTAL);
        List<TextView> chips = new ArrayList<>();

        for (Option option : options) {
            TextView chip = text(option.label, 13, INK, Typeface.BOLD);
            chip.setGravity(Gravity.CENTER);
            chip.setPadding(dp(16), 0, dp(16), 0);
            LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(-2, dp(42));
            params.rightMargin = dp(8);
            row.addView(chip, params);
            chips.add(chip);
            chip.setOnClickListener(view -> {
                handler.onChoice(option.value);
                updateChips(chips, options, option.value);
            });
        }
        updateChips(chips, options, selected);
        scroller.addView(row);
        block.addView(scroller);
        return block;
    }

    private View bottomAction() {
        LinearLayout wrap = new LinearLayout(this);
        wrap.setGravity(Gravity.CENTER);
        wrap.setPadding(dp(22), dp(12), dp(22), dp(18));
        wrap.setBackgroundColor(PAPER);

        calculateButton = new Button(this);
        calculateButton.setAllCaps(false);
        calculateButton.setText("Recalculate");
        calculateButton.setTextSize(18);
        calculateButton.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        calculateButton.setTextColor(PAPER);
        calculateButton.setBackground(round(NAVY, dp(36), 0, NAVY));
        calculateButton.setOnClickListener(view -> requestCalculation());
        wrap.addView(calculateButton, new LinearLayout.LayoutParams(-1, dp(62)));
        return wrap;
    }

    private void requestCalculation() {
        try {
            profile.age = Integer.parseInt(ageInput.getText().toString().trim());
        } catch (NumberFormatException error) {
            showError("Age must be a number from 0 to 120.");
            return;
        }

        setLoading(true);
        updateProfileLine(profile);
        api.resolve(profile, new DailyNutritionApi.Callback() {
            @Override
            public void onSuccess(NutritionModels.Result result) {
                setLoading(false);
                updateProfileLine(result.profile);
                renderWarnings(result.warnings);
                renderTargets(result);
            }

            @Override
            public void onError(Exception error) {
                setLoading(false);
                renderWarnings(new ArrayList<>());
                showError("Could not reach the nutrition API. Start backend on port 4000 and try again.");
            }
        });
    }

    private void setLoading(boolean loading) {
        calculateButton.setEnabled(!loading);
        calculateButton.setText(loading ? "Calculating..." : "Recalculate");
    }

    private void renderWarnings(List<String> warnings) {
        warningList.removeAllViews();
        if (warnings.isEmpty()) {
            warningList.setVisibility(View.GONE);
            return;
        }
        warningList.setVisibility(View.VISIBLE);
        for (String warning : warnings) {
            TextView row = text(warning, 13, INK, Typeface.BOLD);
            row.setPadding(dp(14), dp(12), dp(14), dp(12));
            row.setBackground(round(Color.rgb(255, 252, 235), dp(18), dp(1), Color.rgb(246, 224, 142)));
            warningList.addView(cardWithMargin(row, 0, 0, 0, dp(8)));
        }
    }

    private void renderTargets(NutritionModels.Result result) {
        resultList.removeAllViews();

        NutritionModels.DailyTarget energy = findTarget(result.targets, "energy", "energy");
        NutritionModels.DailyTarget protein = findTarget(result.targets, "protein", "protein");
        NutritionModels.DailyTarget fat = findTarget(result.targets, "fat", "fat");
        NutritionModels.DailyTarget carbs = findTarget(result.targets, "carbohydrate", "carb");
        NutritionModels.DailyTarget fiber = findTarget(result.targets, "fiber", "fiber");

        calorieRing.setGoal(goalInt(energy));
        renderMacroGoals(protein, fat, carbs, fiber);

        TextView section = text("Daily nutrient details", 24, NAVY, Typeface.BOLD);
        section.setTypeface(Typeface.create(Typeface.SERIF, Typeface.BOLD));
        section.setGravity(Gravity.CENTER);
        section.setPadding(0, dp(18), 0, dp(12));
        resultList.addView(section);

        LinearLayout listCard = card(0, PAPER, dp(28), dp(1), RULE);
        listCard.setPadding(0, dp(6), 0, dp(6));
        listCard.setOrientation(LinearLayout.VERTICAL);
        int limit = Math.min(result.targets.size(), 30);
        for (int i = 0; i < limit; i++) {
            listCard.addView(targetRow(result.targets.get(i), i == limit - 1));
        }
        resultList.addView(cardWithMargin(listCard, 0, 0, 0, dp(18)));
    }

    private void renderMacroGoals(NutritionModels.DailyTarget protein, NutritionModels.DailyTarget fat,
                                  NutritionModels.DailyTarget carbs, NutritionModels.DailyTarget fiber) {
        if (macroGoalRow == null) {
            return;
        }
        macroGoalRow.removeAllViews();
        addMacroGoal("Protein", compactValue(protein, "0g"), PROTEIN);
        addMacroGoal("Fat", compactValue(fat, "0g"), FAT);
        addMacroGoal("Carbs", compactValue(carbs, "0g"), CARBS);
        addMacroGoal("Fiber", compactValue(fiber, "-"), FIBER);
    }

    private void addMacroGoal(String label, String value, int color) {
        LinearLayout item = new LinearLayout(this);
        item.setOrientation(LinearLayout.VERTICAL);
        item.setGravity(Gravity.CENTER);

        MacroGoalView bubble = new MacroGoalView(this);
        bubble.setValue(value, color);
        item.addView(bubble, new LinearLayout.LayoutParams(dp(76), dp(76)));

        TextView text = text(label, 14, INK, Typeface.BOLD);
        text.setGravity(Gravity.CENTER);
        text.setPadding(0, dp(8), 0, 0);
        item.addView(text, new LinearLayout.LayoutParams(-1, -2));

        macroGoalRow.addView(item, new LinearLayout.LayoutParams(0, -2, 1));
    }

    private View targetRow(NutritionModels.DailyTarget target, boolean last) {
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setGravity(Gravity.CENTER_VERTICAL);
        row.setPadding(dp(16), dp(14), dp(16), dp(14));

        TextView marker = text(markerText(target), 11, markerColor(target), Typeface.BOLD);
        marker.setGravity(Gravity.CENTER);
        marker.setBackground(round(markerBg(target), dp(16), 0, markerBg(target)));

        LinearLayout copy = new LinearLayout(this);
        copy.setOrientation(LinearLayout.VERTICAL);
        copy.setPadding(dp(13), 0, dp(8), 0);
        TextView name = text(target.label, 15, INK, Typeface.BOLD);
        TextView detail = text(target.detailLine(), 11, MUTED, Typeface.NORMAL);
        detail.setPadding(0, dp(2), 0, 0);
        copy.addView(name);
        copy.addView(detail);

        TextView value = text(target.valueLine(), 14, NAVY, Typeface.BOLD);
        value.setGravity(Gravity.RIGHT | Gravity.CENTER_VERTICAL);

        row.addView(marker, new LinearLayout.LayoutParams(dp(34), dp(34)));
        row.addView(copy, new LinearLayout.LayoutParams(0, -2, 1));
        row.addView(value, new LinearLayout.LayoutParams(dp(104), -1));

        if (!last) {
            LinearLayout wrap = new LinearLayout(this);
            wrap.setOrientation(LinearLayout.VERTICAL);
            wrap.addView(row);
            View divider = new View(this);
            divider.setBackgroundColor(Color.rgb(236, 241, 247));
            LinearLayout.LayoutParams dividerParams = new LinearLayout.LayoutParams(-1, dp(1));
            dividerParams.leftMargin = dp(62);
            wrap.addView(divider, dividerParams);
            return wrap;
        }
        return row;
    }

    private void showError(String message) {
        resultList.removeAllViews();
        calorieRing.setGoal(0);
        renderMacroGoals(null, null, null, null);
        LinearLayout card = card(dp(18), Color.rgb(255, 245, 245), dp(22), dp(1), Color.rgb(255, 205, 205));
        card.setOrientation(LinearLayout.VERTICAL);
        card.addView(label("API STATUS"));
        TextView text = text(message, 15, INK, Typeface.BOLD);
        text.setPadding(0, dp(8), 0, 0);
        card.addView(text);
        resultList.addView(cardWithMargin(card, 0, dp(14), 0, dp(18)));
    }

    private void updateProfileLine(NutritionModels.Profile value) {
        profileLine.setText(value.age + " years | " + value.gender + " | " + value.populationGroup + " | " + value.physicalActivityLevel);
    }

    private NutritionModels.DailyTarget findTarget(List<NutritionModels.DailyTarget> targets, String keyNeedle, String labelNeedle) {
        for (NutritionModels.DailyTarget target : targets) {
            String key = target.key == null ? "" : target.key.toLowerCase(Locale.US);
            String label = target.label == null ? "" : target.label.toLowerCase(Locale.US);
            if (key.contains(keyNeedle) || label.contains(labelNeedle)) {
                return target;
            }
        }
        return null;
    }

    private int goalInt(NutritionModels.DailyTarget target) {
        if (target == null || !target.hasGoal) {
            return 0;
        }
        return (int) Math.round(target.goal);
    }

    private String compactValue(NutritionModels.DailyTarget target, String fallback) {
        if (target == null || !target.hasGoal) {
            return fallback;
        }
        String unit = target.unit == null ? "" : target.unit
                .replace("/d", "")
                .replace("per day", "")
                .trim();
        return NutritionModels.format(target.goal) + unit;
    }

    private String markerText(NutritionModels.DailyTarget target) {
        if (!target.goalType.isEmpty()) {
            return target.goalType.substring(0, 1);
        }
        return "A";
    }

    private int markerColor(NutritionModels.DailyTarget target) {
        if ("AI".equals(target.goalType)) return GREEN;
        if ("EER".equals(target.goalType)) return Color.rgb(75, 139, 232);
        if ("RNI".equals(target.goalType)) return NAVY;
        return INK;
    }

    private int markerBg(NutritionModels.DailyTarget target) {
        if ("AI".equals(target.goalType)) return GREEN_SOFT;
        if ("EER".equals(target.goalType)) return Color.rgb(225, 241, 255);
        if (target.amdr != null && !target.amdr.isEmpty()) return Color.rgb(255, 252, 235);
        return CARD_SOFT;
    }

    private LinearLayout card(int padding, int color, int radius, int strokeWidth, int strokeColor) {
        LinearLayout view = new LinearLayout(this);
        view.setPadding(padding, padding, padding, padding);
        view.setBackground(round(color, radius, strokeWidth, strokeColor));
        return view;
    }

    private View cardWithMargin(View view, int left, int top, int right, int bottom) {
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(-1, -2);
        params.setMargins(left, top, right, bottom);
        view.setLayoutParams(params);
        return view;
    }

    private TextView label(String value) {
        TextView view = text(value, 10, MUTED, Typeface.BOLD);
        view.setLetterSpacing(0.12f);
        return view;
    }

    private TextView text(String value, int sp, int color, int style) {
        TextView view = new TextView(this);
        view.setText(value);
        view.setTextSize(sp);
        view.setTextColor(color);
        view.setTypeface(Typeface.DEFAULT, style);
        view.setIncludeFontPadding(true);
        return view;
    }

    private GradientDrawable round(int color, int radius, int strokeWidth, int strokeColor) {
        GradientDrawable drawable = new GradientDrawable();
        drawable.setColor(color);
        drawable.setCornerRadius(radius);
        if (strokeWidth > 0) {
            drawable.setStroke(strokeWidth, strokeColor);
        }
        return drawable;
    }

    private void updateChips(List<TextView> chips, Option[] options, String selected) {
        for (int i = 0; i < chips.size(); i++) {
            boolean active = options[i].value.equals(selected);
            TextView chip = chips.get(i);
            chip.setTextColor(active ? PAPER : INK);
            chip.setBackground(round(active ? NAVY : CARD_SOFT, dp(22), dp(1), active ? NAVY : RULE));
        }
    }

    private int dp(float value) {
        return (int) (value * getResources().getDisplayMetrics().density + 0.5f);
    }

    private float sp(float value) {
        return value * getResources().getDisplayMetrics().scaledDensity;
    }

    private interface ChoiceHandler {
        void onChoice(String value);
    }

    private static final class Option {
        final String label;
        final String value;

        Option(String label, String value) {
            this.label = label;
            this.value = value;
        }
    }

    private final class GoalRingView extends View {
        private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final RectF arc = new RectF();
        private int goal;

        GoalRingView(Activity context) {
            super(context);
        }

        void setGoal(int goal) {
            this.goal = Math.max(0, goal);
            invalidate();
        }

        @Override
        protected void onDraw(Canvas canvas) {
            super.onDraw(canvas);
            int size = Math.min(getWidth(), getHeight());
            float cx = getWidth() / 2f;
            float cy = getHeight() / 2f;
            float radius = size / 2f - dp(15);

            paint.setStyle(Paint.Style.FILL);
            paint.setColor(PAPER);
            canvas.drawCircle(cx, cy, radius - dp(8), paint);

            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeCap(Paint.Cap.ROUND);
            paint.setStrokeWidth(dp(16));
            paint.setColor(GREEN_SOFT);
            canvas.drawCircle(cx, cy, radius, paint);

            if (goal > 0) {
                arc.set(cx - radius, cy - radius, cx + radius, cy + radius);
                paint.setColor(GREEN);
                canvas.drawArc(arc, -95, 255, false, paint);
            }

            paint.setStyle(Paint.Style.FILL);
            paint.setTextAlign(Paint.Align.CENTER);
            paint.setTypeface(Typeface.create(Typeface.SERIF, Typeface.NORMAL));
            paint.setTextSize(sp(48));
            paint.setColor(INK);
            canvas.drawText(goal > 0 ? String.valueOf(goal) : "-", cx, cy - dp(3), paint);

            paint.setTypeface(Typeface.DEFAULT);
            paint.setTextSize(sp(18));
            paint.setColor(INK);
            canvas.drawText("Calorie goal", cx, cy + dp(36), paint);
        }
    }

    private final class MacroGoalView extends View {
        private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private String value = "-";
        private int ringColor = GREEN_SOFT;

        MacroGoalView(Activity context) {
            super(context);
        }

        void setValue(String value, int ringColor) {
            this.value = value;
            this.ringColor = ringColor;
            invalidate();
        }

        @Override
        protected void onDraw(Canvas canvas) {
            super.onDraw(canvas);
            float cx = getWidth() / 2f;
            float cy = getHeight() / 2f;
            float radius = Math.min(getWidth(), getHeight()) / 2f - dp(6);

            paint.setStyle(Paint.Style.FILL);
            paint.setColor(PAPER);
            canvas.drawCircle(cx, cy, radius, paint);

            paint.setStyle(Paint.Style.STROKE);
            paint.setStrokeWidth(dp(8));
            paint.setColor(ringColor);
            canvas.drawCircle(cx, cy, radius - dp(4), paint);

            paint.setStyle(Paint.Style.FILL);
            paint.setTextAlign(Paint.Align.CENTER);
            paint.setTypeface(Typeface.DEFAULT_BOLD);
            paint.setTextSize(sp(19));
            paint.setColor(INK);
            canvas.drawText(value, cx, cy + dp(7), paint);
        }
    }

    private final class CampSceneView extends View {
        private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);

        CampSceneView(Activity context) {
            super(context);
        }

        @Override
        protected void onDraw(Canvas canvas) {
            super.onDraw(canvas);
            float w = getWidth();
            float h = getHeight();
            float grassY = h * 0.58f;

            paint.setStyle(Paint.Style.FILL);
            paint.setColor(Color.rgb(191, 217, 47));
            canvas.drawRect(0, grassY, w, h * 0.72f, paint);

            drawTree(canvas, w * 0.08f, grassY + dp(8), 0.75f);
            drawTree(canvas, w * 0.16f, grassY - dp(4), 1.08f);
            drawTree(canvas, w * 0.26f, grassY + dp(8), 0.78f);
            drawTree(canvas, w * 0.88f, grassY - dp(2), 1.05f);
            drawTree(canvas, w * 0.97f, grassY + dp(9), 0.74f);
            drawTent(canvas, w * 0.66f, grassY);
            drawFire(canvas, w * 0.52f, grassY + dp(2));

            paint.setColor(Color.rgb(200, 236, 252));
            paint.setStrokeCap(Paint.Cap.ROUND);
            paint.setStrokeWidth(dp(12));
            canvas.drawLine(w * 0.1f, h * 0.78f, w * 0.92f, h * 0.78f, paint);
            paint.setStrokeWidth(dp(9));
            canvas.drawLine(w * 0.2f, h * 0.9f, w * 0.82f, h * 0.9f, paint);
            paint.setColor(Color.argb(180, 255, 255, 255));
            canvas.drawLine(w * 0.08f, h * 0.88f, w * 0.38f, h * 0.88f, paint);
            canvas.drawLine(w * 0.54f, h * 0.88f, w * 0.68f, h * 0.88f, paint);
        }

        private void drawTree(Canvas canvas, float x, float baseY, float scale) {
            paint.setColor(Color.rgb(82, 123, 39));
            float s = dp(48) * scale;
            float[] top = {x, baseY - s, x - s * 0.44f, baseY, x + s * 0.44f, baseY};
            canvas.drawPath(path(top), paint);
            float[] middle = {x, baseY - s * 0.65f, x - s * 0.58f, baseY + s * 0.26f, x + s * 0.58f, baseY + s * 0.26f};
            canvas.drawPath(path(middle), paint);
            float[] bottom = {x, baseY - s * 0.22f, x - s * 0.72f, baseY + s * 0.54f, x + s * 0.72f, baseY + s * 0.54f};
            canvas.drawPath(path(bottom), paint);
        }

        private void drawTent(Canvas canvas, float x, float y) {
            paint.setColor(Color.rgb(244, 173, 75));
            float[] tent = {x - dp(36), y, x, y - dp(58), x + dp(54), y};
            canvas.drawPath(path(tent), paint);
            paint.setColor(Color.rgb(77, 49, 36));
            float[] door = {x, y - dp(54), x + dp(18), y, x - dp(6), y};
            canvas.drawPath(path(door), paint);
        }

        private void drawFire(Canvas canvas, float x, float y) {
            paint.setStrokeWidth(dp(8));
            paint.setStrokeCap(Paint.Cap.ROUND);
            paint.setColor(Color.rgb(114, 72, 35));
            canvas.drawLine(x - dp(18), y + dp(20), x + dp(18), y + dp(32), paint);
            canvas.drawLine(x + dp(18), y + dp(20), x - dp(18), y + dp(32), paint);
            paint.setStyle(Paint.Style.FILL);
            paint.setColor(Color.rgb(255, 178, 69));
            canvas.drawOval(new RectF(x - dp(12), y - dp(5), x + dp(13), y + dp(30)), paint);
            paint.setColor(Color.rgb(255, 242, 96));
            canvas.drawOval(new RectF(x - dp(5), y + dp(8), x + dp(8), y + dp(31)), paint);
            paint.setStyle(Paint.Style.FILL);
        }

        private android.graphics.Path path(float[] points) {
            android.graphics.Path path = new android.graphics.Path();
            path.moveTo(points[0], points[1]);
            for (int i = 2; i < points.length; i += 2) {
                path.lineTo(points[i], points[i + 1]);
            }
            path.close();
            return path;
        }
    }
}
