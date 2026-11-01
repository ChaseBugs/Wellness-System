package com.heightincrease.app.viewmodel;

import com.heightincrease.app.repository.RemoteRepository;

/** Email sign-in or account creation against the platform's shared account service. */
public class SignInViewModel extends BaseViewModel<Boolean> {
    private final RemoteRepository remote;

    public SignInViewModel(RemoteRepository remote) {
        this.remote = remote;
        state = false;
    }

    /** Returns a validation message, or null when the request was sent. */
    public String submit(String email, String password, boolean create, Runnable onChange) {
        if (!email.contains("@")) {
            return "Enter a valid email address.";
        }
        if (password.length() < 8) {
            return "The password needs at least 8 characters.";
        }
        remote.signIn(email.trim(), password, create, track(ignored -> state = true, onChange));
        return null;
    }
}
