package com.talentbaby.app.models;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class ApiResponse<T> {
    @SerializedName("message")
    private String message;

    @SerializedName("data")
    private T data;

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public T getData() { return data; }
    public void setData(T data) { this.data = data; }
}
