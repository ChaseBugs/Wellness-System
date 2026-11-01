package com.talentbaby.app.models;

import com.google.gson.annotations.SerializedName;

/** Wellness Platform /auth/register and /auth/login: { data: { user, tokens: { accessToken, refreshToken } } }. */
public class AuthResponse {
    @SerializedName("data")
    private AuthData data;

    public AuthResponse() {
    }

    public AuthData getData() {
        return data;
    }

    public void setData(AuthData data) {
        this.data = data;
    }

    public static class AuthData {
        @SerializedName("user")
        private User user;

        @SerializedName("tokens")
        private Tokens tokens;

        public AuthData() {
        }

        public User getUser() {
            return user;
        }

        public void setUser(User user) {
            this.user = user;
        }

        public Tokens getTokens() {
            return tokens;
        }

        public String getToken() {
            return tokens != null ? tokens.getAccessToken() : null;
        }

        public String getRefreshToken() {
            return tokens != null ? tokens.getRefreshToken() : null;
        }
    }

    public static class Tokens {
        @SerializedName("accessToken")
        private String accessToken;

        @SerializedName("refreshToken")
        private String refreshToken;

        public String getAccessToken() {
            return accessToken;
        }

        public String getRefreshToken() {
            return refreshToken;
        }
    }
}
