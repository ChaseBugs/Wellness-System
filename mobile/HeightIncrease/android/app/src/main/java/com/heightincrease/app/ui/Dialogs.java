package com.heightincrease.app.ui;

import android.app.Activity;
import android.app.AlertDialog;
import android.graphics.Typeface;
import android.text.InputType;
import android.view.Gravity;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import java.util.List;
import java.util.Locale;

/** Measurement dialogs in the design's style: a number field with metric/imperial toggles, CANCEL / SAVE. */
public final class Dialogs {
    private Dialogs() {
    }

    public interface OnSave {
        /** Returns an error message to keep the dialog open, or null to close it. */
        String save(double[] metricValues);
    }

    /** One number field. Values are entered in either unit and returned in the metric unit. */
    public static final class Measure {
        final String label;
        final String metricUnit;
        final String imperialUnit;
        /** imperial = metric * factor */
        final double factor;
        final Double initialMetric;
        final double min;
        final double max;
        EditText input;
        boolean imperial;

        public Measure(String label, String metricUnit, String imperialUnit, double factor, Double initialMetric,
                       double min, double max, boolean imperial) {
            this.label = label;
            this.metricUnit = metricUnit;
            this.imperialUnit = imperialUnit;
            this.factor = factor;
            this.initialMetric = initialMetric;
            this.min = min;
            this.max = max;
            this.imperial = imperial;
        }

        public static Measure weight(Double kg, boolean imperial) {
            return new Measure("Weight", "KG", "LB", 2.20462, kg, 2, 300, imperial);
        }

        public static Measure height(Double cm, boolean imperial) {
            return new Measure("Height", "CM", "IN", 1 / 2.54, cm, 40, 250, imperial);
        }

        Double metricValue() {
            try {
                double value = Double.parseDouble(input.getText().toString().trim().replace(',', '.'));
                return imperial ? value / factor : value;
            } catch (NumberFormatException error) {
                return null;
            }
        }
    }

    public static void measures(Activity activity, String title, List<Measure> measures, OnSave onSave) {
        LinearLayout body = Ui.vertical(activity);
        body.setPadding(Ui.dp(activity, 24), Ui.dp(activity, 8), Ui.dp(activity, 24), 0);
        for (Measure measure : measures) {
            body.addView(Ui.text(activity, measure.label, 24, Palette.TEXT, Typeface.BOLD),
                    Ui.mlp(activity, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, 0, 12, 0, 6));
            body.addView(measureRow(activity, measure));
        }
        AlertDialog dialog = new AlertDialog.Builder(activity)
                .setTitle(title)
                .setView(body)
                .setNegativeButton("CANCEL", null)
                .setPositiveButton("SAVE", null)
                .create();
        dialog.setOnShowListener(shown -> dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(v -> {
            double[] values = new double[measures.size()];
            for (int i = 0; i < measures.size(); i++) {
                Measure measure = measures.get(i);
                Double value = measure.metricValue();
                if (value == null || value < measure.min || value > measure.max) {
                    Toast.makeText(activity, "Enter a valid " + measure.label.toLowerCase(Locale.US) + ".", Toast.LENGTH_SHORT).show();
                    return;
                }
                values[i] = value;
            }
            String error = onSave.save(values);
            if (error == null) {
                dialog.dismiss();
            } else {
                Toast.makeText(activity, error, Toast.LENGTH_SHORT).show();
            }
        }));
        dialog.show();
    }

    private static LinearLayout measureRow(Activity activity, Measure measure) {
        LinearLayout row = Ui.horizontal(activity);
        EditText input = new EditText(activity);
        input.setInputType(InputType.TYPE_CLASS_NUMBER | InputType.TYPE_NUMBER_FLAG_DECIMAL);
        input.setTextSize(22);
        input.setSingleLine(true);
        input.setTextColor(Palette.TEXT);
        // Typing replaces the prefilled value.
        input.setSelectAllOnFocus(true);
        measure.input = input;
        row.addView(input, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));

        TextView metric = unitChip(activity, measure.metricUnit);
        TextView imperial = unitChip(activity, measure.imperialUnit);
        Runnable refresh = () -> {
            styleChip(activity, metric, !measure.imperial);
            styleChip(activity, imperial, measure.imperial);
        };
        metric.setOnClickListener(v -> switchUnit(measure, false, refresh));
        imperial.setOnClickListener(v -> switchUnit(measure, true, refresh));
        row.addView(metric, Ui.mlp(activity, Ui.dp(activity, 52), Ui.dp(activity, 44), 12, 0, 0, 0));
        row.addView(imperial, Ui.mlp(activity, Ui.dp(activity, 52), Ui.dp(activity, 44), 10, 0, 0, 0));
        refresh.run();
        if (measure.initialMetric != null) {
            input.setText(format(measure.imperial ? measure.initialMetric * measure.factor : measure.initialMetric));
        }
        return row;
    }

    private static void switchUnit(Measure measure, boolean imperial, Runnable refresh) {
        if (measure.imperial == imperial) {
            return;
        }
        Double metricValue = measure.metricValue();
        measure.imperial = imperial;
        if (metricValue != null) {
            measure.input.setText(format(imperial ? metricValue * measure.factor : metricValue));
        }
        refresh.run();
    }

    private static TextView unitChip(Activity activity, String label) {
        TextView chip = Ui.text(activity, label, 18, Palette.MUTED, Typeface.NORMAL);
        chip.setGravity(Gravity.CENTER);
        return chip;
    }

    private static void styleChip(Activity activity, TextView chip, boolean selected) {
        chip.setTextColor(selected ? android.graphics.Color.WHITE : Palette.MUTED);
        chip.setBackground(selected ? Ui.bg(Palette.BLUE, 4, activity)
                : Ui.strokeBg(android.graphics.Color.WHITE, Palette.MUTED, 1, 4, activity));
    }

    public static String format(double value) {
        return String.format(Locale.US, "%.1f", value);
    }
}
