package com.heightincrease.app.viewmodel;

import com.heightincrease.app.model.OnboardingProfile;

public class OnboardingViewModel extends BaseViewModel<OnboardingProfile> {
    private int step;

    public OnboardingViewModel() {
        state = new OnboardingProfile();
    }

    public int getStep() {
        return step;
    }

    public boolean next() {
        if (step >= 3) {
            return true;
        }
        step++;
        return false;
    }

    public void previous() {
        if (step > 0) {
            step--;
        }
    }

    public void setGender(String gender) {
        state.gender = gender;
    }

    public void increase() {
        if (step == 1 && state.age < 80) {
            state.age++;
        } else if (step == 2 && state.heightCm < 230) {
            state.heightCm++;
        } else if (step == 3 && state.minutes < 60) {
            state.minutes++;
        }
    }

    public void decrease() {
        if (step == 1 && state.age > 4) {
            state.age--;
        } else if (step == 2 && state.heightCm > 90) {
            state.heightCm--;
        } else if (step == 3 && state.minutes > 5) {
            state.minutes--;
        }
    }
}
