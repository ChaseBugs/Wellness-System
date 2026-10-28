package com.talentbaby.app.models;

import com.google.gson.annotations.SerializedName;

public class AuthResponse {
    @SerializedName("message")
    private String message;

    @SerializedName("data")
    private AuthData data;

    public AuthResponse() {
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
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

        @SerializedName("token")
        private String token;

        public AuthData() {
        }

        public User getUser() {
            return user;
        }

        public void setUser(User user) {
            this.user = user;
        }

        public String getToken() {
            return token;
        }

        public void setToken(String token) {
            this.token = token;
        }
    }
}
