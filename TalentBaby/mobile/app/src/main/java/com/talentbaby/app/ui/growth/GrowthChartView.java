package com.talentbaby.app.ui.growth;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.util.AttributeSet;
import android.util.TypedValue;
import android.view.View;

/**
 * Renders a growth reference chart with 3 colored band zones (blush/peach/coral)
 * matching the LittleBloom GrowthChart design.
 */
public class GrowthChartView extends View {

    private boolean isWeight = true;
    private int ageRangeOffset = 0; // 0=0-6mo, 1=6-12mo, 2=12-18mo

    private final Paint bandPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint axisPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint labelPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint gridPaint = new Paint(Paint.ANTI_ALIAS_FLAG);

    public GrowthChartView(Context context) { super(context); init(); }
    public GrowthChartView(Context context, AttributeSet attrs) { super(context, attrs); init(); }
    public GrowthChartView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr); init();
    }

    private void init() {
        axisPaint.setColor(0xFFE8DCCF);
        axisPaint.setStrokeWidth(dp(1));
        axisPaint.setStyle(Paint.Style.STROKE);

        labelPaint.setColor(0xFF9A8A80);
        labelPaint.setTextSize(sp(10));
        labelPaint.setAntiAlias(true);

        gridPaint.setColor(0xFFE8DCCF);
        gridPaint.setStrokeWidth(dp(0.5f));
        gridPaint.setStyle(Paint.Style.STROKE);
    }

    public void setMode(boolean isWeight, int ageRangeOffset) {
        this.isWeight = isWeight;
        this.ageRangeOffset = ageRangeOffset;
        invalidate();
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);

        float w = getWidth();
        float h = getHeight();
        float padL = dp(36);
        float padR = dp(12);
        float padT = dp(10);
        float padB = dp(30);

        float chartW = w - padL - padR;
        float chartH = h - padT - padB;

        // Y-axis labels & values
        int[] yVals = isWeight ? new int[]{3, 6, 9, 12} : new int[]{50, 58, 67, 75};
        int yMin = yVals[0];
        int yMax = yVals[yVals.length - 1];

        // Draw horizontal grid lines + y labels
        for (int i = 0; i < yVals.length; i++) {
            float frac = (float)(yVals[i] - yMin) / (yMax - yMin);
            float y = padT + chartH - frac * chartH;
            canvas.drawLine(padL, y, padL + chartW, y, gridPaint);
            canvas.drawText(String.valueOf(yVals[i]), dp(2), y + sp(4), labelPaint);
        }

        // X-axis line
        canvas.drawLine(padL, padT + chartH, padL + chartW, padT + chartH, axisPaint);

        // X-axis labels (months 0–6 offset by ageRangeOffset*6)
        int startMonth = ageRangeOffset * 6;
        for (int i = 0; i <= 6; i++) {
            float x = padL + i * (chartW / 6f);
            String lbl = String.valueOf(startMonth + i);
            float lblW = labelPaint.measureText(lbl);
            canvas.drawText(lbl, x - lblW / 2, padT + chartH + dp(14), labelPaint);
        }

        // "Months" label
        String monthsLbl = "Months";
        canvas.drawText(monthsLbl, padL + chartW / 2 - labelPaint.measureText(monthsLbl) / 2,
                padT + chartH + dp(26), labelPaint);

        // Y-axis label (rotated)
        canvas.save();
        canvas.rotate(-90, dp(10), padT + chartH / 2);
        String yLbl = isWeight ? "Weight (kg)" : "Height (cm)";
        canvas.drawText(yLbl, dp(10) - labelPaint.measureText(yLbl) / 2, padT + chartH / 2 + sp(4), labelPaint);
        canvas.restore();

        // Draw bands — wide zone (blush), mid zone (peach), narrow zone (coral)
        // Band points are fractions of chartW/chartH from design SVG paths
        drawBand(canvas, padL, padT, chartW, chartH,
                new float[]{0f, 0.7f, 0.54f, 0.9f, 0.23f, 1f, 0.53f},
                new float[]{0.44f, 0.11f, 0.39f, 0.36f, 0.67f, 0.58f, 0.78f},
                0x33FCE4D6); // blush, opacity 0.2

        drawBand(canvas, padL, padT, chartW, chartH,
                new float[]{0f, 0.7f, 0.54f, 0.9f, 0.23f, 1f, 0.53f},
                new float[]{0.4f, 0.08f, 0.36f, 0.31f, 0.58f, 0.47f, 0.69f},
                0x55F9D0B8); // peach, opacity 0.33

        drawBand(canvas, padL, padT, chartW, chartH,
                new float[]{0f, 0.7f, 0.54f, 0.9f, 1f, 0.54f, 0.23f},
                new float[]{0.36f, 0.06f, 0.33f, 0.28f, 0.42f, 0.36f, 0.47f},
                0x55F08B6B); // coral, opacity 0.33
    }

    /** Draws a filled curved band using quadratic bezier approximation. */
    private void drawBand(Canvas canvas, float padL, float padT,
                          float chartW, float chartH,
                          float[] xFracs, float[] yFracs, int color) {
        if (xFracs.length < 3) return;

        bandPaint.setColor(color);
        bandPaint.setStyle(Paint.Style.FILL);

        Path path = new Path();
        float x0 = padL + xFracs[0] * chartW;
        float y0 = padT + yFracs[0] * chartH;
        path.moveTo(x0, y0);

        // Forward curve (top of band)
        for (int i = 1; i < xFracs.length - 1; i += 2) {
            float cx = padL + xFracs[i] * chartW;
            float cy = padT + yFracs[i] * chartH;
            float ex = (i + 1 < xFracs.length) ? padL + xFracs[i + 1] * chartW : cx;
            float ey = (i + 1 < yFracs.length) ? padT + yFracs[i + 1] * chartH : cy;
            path.quadTo(cx, cy, ex, ey);
        }

        // Return path along bottom (slightly lower)
        float offset = chartH * 0.12f;
        for (int i = xFracs.length - 1; i > 0; i -= 2) {
            float cx = padL + xFracs[Math.max(0, i - 1)] * chartW;
            float cy = padT + yFracs[Math.max(0, i - 1)] * chartH + offset;
            float ex = padL + xFracs[Math.max(0, i - 2)] * chartW;
            float ey = (i - 2 >= 0 && i - 2 < yFracs.length)
                    ? padT + yFracs[i - 2] * chartH + offset : cy;
            path.quadTo(cx, cy, ex, ey);
        }

        path.close();
        canvas.drawPath(path, bandPaint);
    }

    private float dp(float v) {
        return TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v,
                getResources().getDisplayMetrics());
    }

    private float sp(float v) {
        return TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_SP, v,
                getResources().getDisplayMetrics());
    }
}
