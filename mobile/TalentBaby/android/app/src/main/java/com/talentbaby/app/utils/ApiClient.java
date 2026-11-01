package com.talentbaby.app.utils;

import okhttp3.OkHttpClient;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import java.util.concurrent.TimeUnit;

/**
 * Wellness Platform backend (repo-root backend/). Auth endpoints sit at the API root
 * (auth/register, auth/refresh); BabyGrow endpoints are under apps/babygrow/.
 */
public class ApiClient {
    public static final String APP_CODE = "babygrow";

    static final String BASE_URL = "http://10.0.2.2:4500/api/v1/"; // Emulator
    // For physical device, use: "http://<your-local-ip>:4500/api/v1/"

    // Images are served from /static on the same server.
    private static final String SERVER_URL = "http://10.0.2.2:4500/";

    private static Retrofit retrofit = null;

    public static Retrofit getClient() {
        if (retrofit == null) {
            HttpLoggingInterceptor logging = new HttpLoggingInterceptor();
            logging.setLevel(HttpLoggingInterceptor.Level.BODY);

            OkHttpClient client = new OkHttpClient.Builder()
                    .addInterceptor(logging)
                    .addInterceptor(new AuthInterceptor())
                    .authenticator(new TokenAuthenticator())
                    .connectTimeout(30, TimeUnit.SECONDS)
                    .readTimeout(30, TimeUnit.SECONDS)
                    .writeTimeout(30, TimeUnit.SECONDS)
                    .build();

            retrofit = new Retrofit.Builder()
                    .baseUrl(BASE_URL)
                    .client(client)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build();
        }
        return retrofit;
    }

    public static String getBaseUrl() {
        return SERVER_URL;
    }
}
