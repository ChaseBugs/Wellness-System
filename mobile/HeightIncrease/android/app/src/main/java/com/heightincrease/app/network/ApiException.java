package com.heightincrease.app.network;

/** A failed platform call: an HTTP error envelope, or no connection to the backend. */
public class ApiException extends Exception {
    public final int status;
    public final String code;

    public ApiException(int status, String code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }

    public static ApiException offline(Exception cause) {
        ApiException error = new ApiException(0, "OFFLINE", "Can't reach the server. Check your connection.");
        error.initCause(cause);
        return error;
    }
}
