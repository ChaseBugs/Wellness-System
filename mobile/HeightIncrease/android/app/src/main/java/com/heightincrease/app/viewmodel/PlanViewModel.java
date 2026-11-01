package com.heightincrease.app.viewmodel;

import com.heightincrease.app.model.Goal;
import com.heightincrease.app.model.PlanCard;
import com.heightincrease.app.model.ReportData;
import com.heightincrease.app.repository.AppRepository;
import com.heightincrease.app.repository.RemoteRepository;

import java.util.ArrayList;
import java.util.List;

/**
 * Published training plans from the platform, followed by the user's own "My training" card. Signed
 * in, it also holds the weekly workout goal and this week's workout days.
 */
public class PlanViewModel extends BaseViewModel<List<PlanCard>> {
    private final AppRepository repository;
    private final RemoteRepository remote;
    private Goal goal;
    private int weekWorkouts;
    private int streakDays;

    public PlanViewModel(AppRepository repository, RemoteRepository remote) {
        this.repository = repository;
        this.remote = remote;
        state = withMyTraining(new ArrayList<>());
    }

    public void load(Runnable onChange) {
        remote.trainingPlans(track(plans -> state = withMyTraining(new ArrayList<>(plans)), onChange));
        loadProgress(onChange);
    }

    /** Reloads the goal and the week (after a workout or a goal change). */
    public void loadProgress(Runnable onChange) {
        if (!remote.isSignedIn()) {
            goal = null;
            weekWorkouts = 0;
            streakDays = 0;
            return;
        }
        remote.weeklyGoal(new RemoteRepository.Callback<Goal>() {
            @Override
            public void onSuccess(Goal value) {
                goal = value;
                onChange.run();
            }

            @Override
            public void onError(String message) {
            }
        });
        remote.report(new RemoteRepository.Callback<ReportData>() {
            @Override
            public void onSuccess(ReportData value) {
                weekWorkouts = value.summary.workoutCount;
                streakDays = value.summary.streakDays;
                onChange.run();
            }

            @Override
            public void onError(String message) {
            }
        });
    }

    public void saveGoal(int daysPerWeek, RemoteRepository.Callback<Goal> callback) {
        remote.saveWeeklyGoal(goal, daysPerWeek, new RemoteRepository.Callback<Goal>() {
            @Override
            public void onSuccess(Goal value) {
                goal = value;
                callback.onSuccess(value);
            }

            @Override
            public void onError(String message) {
                callback.onError(message);
            }
        });
    }

    public Goal goal() {
        return goal;
    }

    public int weekWorkouts() {
        return weekWorkouts;
    }

    public int streakDays() {
        return streakDays;
    }

    /** This week's progress toward the goal (0-100); without a goal, toward working out every day. */
    public int weekProgress() {
        int target = goal == null ? 7 : goal.daysPerWeek;
        return Math.min(100, Math.round(weekWorkouts * 100f / target));
    }

    /** True when the platform has no published plan yet (only "My training" is left). */
    public boolean noPublishedPlans() {
        return state.size() <= 1;
    }

    private List<PlanCard> withMyTraining(List<PlanCard> plans) {
        plans.add(repository.myTrainingCard());
        return plans;
    }
}
