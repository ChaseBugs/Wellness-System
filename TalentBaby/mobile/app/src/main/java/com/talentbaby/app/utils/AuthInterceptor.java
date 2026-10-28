package com.talentbaby.app.utils;

import com.talentbaby.app.TalentBabyApplication;
import okhttp3.Interceptor;
import okhttp3.Request;
import okhttp3.Response;
import java.io.IOException;

public class AuthInterceptor implements Interceptor {
    @Override
    public Response intercept(Chain chain) throws IOException {
        Request original = chain.request();
        
        // Get token from TokenManager
        String token = TokenManager.getToken(TalentBabyApplication.getAppContext());
        
        Request.Builder requestBuilder = original.newBuilder();
        
        // Add auth header if token exists
        if (token != null && !token.isEmpty()) {
            requestBuilder.header("Authorization", "Bearer " + token);
        }
        
        requestBuilder.header("Content-Type", "application/json");
        requestBuilder.header("Accept", "application/json");
        
        Request request = requestBuilder.build();
        return chain.proceed(request);
    }
}
