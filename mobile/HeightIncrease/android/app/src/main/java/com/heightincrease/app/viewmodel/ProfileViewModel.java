package com.heightincrease.app.viewmodel;

import com.heightincrease.app.model.ProfileOption;
import com.heightincrease.app.repository.AppRepository;
import com.heightincrease.app.repository.ProfileStore;
import com.heightincrease.app.repository.RemoteRepository;

import java.util.List;

public class ProfileViewModel extends BaseViewModel<ProfileViewModel.State> {
    private final RemoteRepository remote;
    private final ProfileStore profiles;

    public ProfileViewModel(AppRepository repository, RemoteRepository remote, ProfileStore profiles) {
        this.remote = remote;
        this.profiles = profiles;
        state = new State(repository.settingsOptions(), repository.supportOptions());
    }

    public boolean isSignedIn() {
        return remote.isSignedIn();
    }

    public String email() {
        return remote.email();
    }

    public Integer onboardingHeightCm() {
        return profiles.isOnboarded() ? profiles.load().heightCm : null;
    }

    public void signOut(Runnable onChange) {
        remote.signOut(track(ignored -> { }, onChange));
    }

    public static class State {
        public final List<ProfileOption> settings;
        public final List<ProfileOption> support;

        public State(List<ProfileOption> settings, List<ProfileOption> support) {
            this.settings = settings;
            this.support = support;
        }
    }
}
