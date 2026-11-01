package com.talentbaby.app.offline.sync;

import android.content.Context;
import android.net.ConnectivityManager;
import android.net.NetworkCapabilities;
import android.net.NetworkInfo;

import com.talentbaby.app.utils.TokenManager;

public class OfflineModeManager {
    private final Context context;

    public OfflineModeManager(Context context) {
        this.context = context.getApplicationContext();
    }

    public boolean hasNetwork() {
        ConnectivityManager manager = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
        if (manager == null) return false;

        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            NetworkCapabilities capabilities = manager.getNetworkCapabilities(manager.getActiveNetwork());
            return capabilities != null
                    && capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET);
        }

        NetworkInfo info = manager.getActiveNetworkInfo();
        return info != null && info.isConnected();
    }

    public boolean isLoggedInOnlineUser() {
        return TokenManager.isLoggedIn(context);
    }

    public boolean canUseOnlineAccountFeatures() {
        return hasNetwork() && isLoggedInOnlineUser();
    }
}
