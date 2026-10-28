package com.talentbaby.app;

import android.content.Intent;
import android.os.Bundle;
import android.view.MenuItem;
import android.view.View;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.view.GravityCompat;
import androidx.drawerlayout.widget.DrawerLayout;
import androidx.fragment.app.Fragment;

import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.google.android.material.navigation.NavigationView;
import com.talentbaby.app.activities.AddBabyActivity;
import com.talentbaby.app.activities.BabyProfileActivity;
import com.talentbaby.app.activities.GlobalActivity;
import com.talentbaby.app.activities.LoginActivity;
import com.talentbaby.app.activities.ParentingSupportActivity;
import com.talentbaby.app.fragments.ActivitiesFragment;
import com.talentbaby.app.fragments.HomeFragment;
import com.talentbaby.app.models.ApiResponse;
import com.talentbaby.app.models.Baby;
import com.talentbaby.app.models.User;
import com.talentbaby.app.network.ApiService;
import com.talentbaby.app.ui.knowledge.KnowledgeFragment;
import com.talentbaby.app.ui.milestones.MilestonesFragment;
import com.talentbaby.app.utils.ApiClient;
import com.talentbaby.app.utils.TokenManager;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MainActivity extends GlobalActivity {

    private DrawerLayout drawerLayout;
    private BottomNavigationView bottomNavigation;
    private NavigationView navigationView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (!TokenManager.isLoggedIn(this)) {
            navigateToLogin();
            return;
        }

        setContentView(R.layout.activity_main);

        drawerLayout = findViewById(R.id.drawerLayout);
        bottomNavigation = findViewById(R.id.bottom_navigation);
        navigationView = findViewById(R.id.navigationView);

        setupBottomNavigation();
        setupSidebar();
        loadSidebarUserInfo();
        loadSidebarBabyInfo();

        if (savedInstanceState == null) {
            bottomNavigation.setSelectedItemId(R.id.nav_home);
        }
    }

    private void setupBottomNavigation() {
        bottomNavigation.setOnItemSelectedListener(item -> {
            Fragment fragment = null;
            int id = item.getItemId();

            if (id == R.id.nav_home) {
                fragment = new HomeFragment();
            } else if (id == R.id.nav_activities) {
                fragment = new ActivitiesFragment();
            } else if (id == R.id.nav_milestones) {
                fragment = new MilestonesFragment();
            } else if (id == R.id.nav_knowledge) {
                fragment = new KnowledgeFragment();
            }

            if (fragment != null) {
                getSupportFragmentManager()
                        .beginTransaction()
                        .replace(R.id.fragment_container, fragment)
                        .commit();
                return true;
            }
            return false;
        });
    }

    private void setupSidebar() {
        navigationView.setNavigationItemSelectedListener(item -> {
            drawerLayout.closeDrawer(GravityCompat.START);
            int id = item.getItemId();

            if (id == R.id.menu_logout) {
                confirmLogout();
            } else if (id == R.id.menu_delete_account) {
                confirmDeleteAccount();
            } else if (id == R.id.menu_upgrade) {
                Toast.makeText(this, getString(R.string.sidebar_upgrade), Toast.LENGTH_SHORT).show();
            } else if (id == R.id.menu_add_baby) {
                startActivity(new Intent(this, AddBabyActivity.class));
            } else if (id == R.id.menu_add_partner) {
                Toast.makeText(this, getString(R.string.sidebar_add_partner), Toast.LENGTH_SHORT).show();
            } else if (id == R.id.menu_invite) {
                Toast.makeText(this, getString(R.string.sidebar_invite), Toast.LENGTH_SHORT).show();
            } else if (id == R.id.menu_parenting_support) {
                openParentingSupport();
            } else if (id == R.id.menu_rate_us) {
                Toast.makeText(this, getString(R.string.sidebar_rate_us), Toast.LENGTH_SHORT).show();
            } else if (id == R.id.menu_terms) {
                Toast.makeText(this, getString(R.string.sidebar_terms), Toast.LENGTH_SHORT).show();
            } else if (id == R.id.menu_privacy) {
                Toast.makeText(this, getString(R.string.sidebar_privacy), Toast.LENGTH_SHORT).show();
            } else if (id == R.id.menu_corporate) {
                Toast.makeText(this, getString(R.string.sidebar_corporate), Toast.LENGTH_SHORT).show();
            }
            return false;
        });

        // Header: active baby edit and add baby actions
        View headerView = navigationView.getHeaderView(0);
        headerView.findViewById(R.id.layoutSidebarBaby).setOnClickListener(v -> {
            drawerLayout.closeDrawer(GravityCompat.START);
            openActiveBabyProfile();
        });
        headerView.findViewById(R.id.btnEditActiveBaby).setOnClickListener(v -> {
            drawerLayout.closeDrawer(GravityCompat.START);
            openActiveBabyProfile();
        });
        headerView.findViewById(R.id.textAddBaby).setOnClickListener(v -> {
            drawerLayout.closeDrawer(GravityCompat.START);
            startActivity(new Intent(this, AddBabyActivity.class));
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (navigationView != null) {
            loadSidebarBabyInfo();
        }
    }

    private void loadSidebarUserInfo() {
        ApiService apiService = ApiClient.getClient().create(ApiService.class);
        apiService.getProfile().enqueue(new Callback<ApiResponse<User>>() {
            @Override
            public void onResponse(Call<ApiResponse<User>> call, Response<ApiResponse<User>> response) {
                if (response.isSuccessful() && response.body() != null
                        && response.body().getData() != null) {
                    User user = response.body().getData();
                    View header = navigationView.getHeaderView(0);
                    TextView textEmail = header.findViewById(R.id.textUserEmail);
                    TextView textInitials = header.findViewById(R.id.textAvatarInitials);
                    if (textEmail != null && user.getEmail() != null) {
                        textEmail.setText(user.getEmail());
                    }
                    if (textInitials != null && user.getFullName() != null && !user.getFullName().isEmpty()) {
                        textInitials.setText(user.getFullName().substring(0, 1).toUpperCase());
                    }
                    loadSidebarBabyInfo();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<User>> call, Throwable t) {
                // sidebar will show defaults
            }
        });
    }

    private void loadSidebarBabyInfo() {
        ApiService apiService = ApiClient.getClient().create(ApiService.class);
        apiService.getActiveBaby().enqueue(new Callback<ApiResponse<Baby>>() {
            @Override
            public void onResponse(Call<ApiResponse<Baby>> call, Response<ApiResponse<Baby>> response) {
                if (!response.isSuccessful() || response.body() == null || response.body().getData() == null) return;
                Baby baby = response.body().getData();
                TokenManager.saveBabyId(MainActivity.this, baby.getId());
                View header = navigationView.getHeaderView(0);
                TextView babyName = header.findViewById(R.id.textBabyName);
                TextView initials = header.findViewById(R.id.textAvatarInitials);
                if (babyName != null && baby.getName() != null) babyName.setText(baby.getName());
                if (initials != null && baby.getName() != null && !baby.getName().isEmpty()) {
                    initials.setText(baby.getName().substring(0, 1).toUpperCase());
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Baby>> call, Throwable t) {
                // Sidebar keeps defaults.
            }
        });
    }

    // --- Public methods for fragments ---

    public void openDrawer() {
        drawerLayout.openDrawer(GravityCompat.START);
    }

    public void switchToTab(int tabId) {
        bottomNavigation.setSelectedItemId(tabId);
    }

    public void openParentingSupport() {
        startActivity(new Intent(this, ParentingSupportActivity.class));
    }

    private void openActiveBabyProfile() {
        Intent intent = new Intent(this, BabyProfileActivity.class);
        int activeBabyId = TokenManager.getBabyId(this);
        if (activeBabyId != -1) {
            intent.putExtra("baby_id", activeBabyId);
        }
        startActivity(intent);
    }

    // --- Back press: close drawer if open ---

    @Override
    public void onBackPressed() {
        if (drawerLayout.isDrawerOpen(GravityCompat.START)) {
            drawerLayout.closeDrawer(GravityCompat.START);
        } else {
            super.onBackPressed();
        }
    }

    // --- Dialogs ---

    private void confirmLogout() {
        new AlertDialog.Builder(this)
                .setMessage(getString(R.string.confirm_logout))
                .setPositiveButton(getString(R.string.yes), (d, w) -> logout())
                .setNegativeButton(getString(R.string.no), null)
                .show();
    }

    private void confirmDeleteAccount() {
        new AlertDialog.Builder(this)
                .setMessage(getString(R.string.confirm_delete_account))
                .setPositiveButton(getString(R.string.yes), (d, w) -> {
                    // TODO: call delete account API
                    logout();
                })
                .setNegativeButton(getString(R.string.no), null)
                .show();
    }

    private void logout() {
        TokenManager.clearToken(this);
        navigateToLogin();
    }

    private void navigateToLogin() {
        Intent intent = new Intent(this, LoginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }
}
