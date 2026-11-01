package com.talentbaby.app.fragments;

import android.app.AlertDialog;
import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.talentbaby.app.R;
import com.talentbaby.app.activities.AddBabyActivity;
import com.talentbaby.app.activities.BabyProfileActivity;
import com.talentbaby.app.activities.LoginActivity;
import com.talentbaby.app.adapters.BabyAdapter;
import com.talentbaby.app.models.ApiResponse;
import com.talentbaby.app.models.Baby;
import com.talentbaby.app.models.User;
import com.talentbaby.app.network.ApiService;
import com.talentbaby.app.utils.ApiClient;
import com.talentbaby.app.utils.TokenManager;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.ArrayList;
import java.util.List;

public class ProfileFragment extends Fragment {
    private TextView textUserName;
    private TextView textUserEmail;
    private RecyclerView recyclerBabies;
    private Button buttonAddBaby;
    private ProgressBar progressBar;
    private BabyAdapter babyAdapter;
    private List<Baby> babies = new ArrayList<>();
    private ApiService apiService;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_profile, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        apiService = ApiClient.getClient().create(ApiService.class);
        initViews(view);
        setupRecyclerView();
        loadProfile();
        loadBabies();
    }

    @Override
    public void onResume() {
        super.onResume();
        loadBabies();
    }

    private void initViews(View view) {
        textUserName = view.findViewById(R.id.textUserName);
        textUserEmail = view.findViewById(R.id.textUserEmail);
        recyclerBabies = view.findViewById(R.id.recyclerBabies);
        buttonAddBaby = view.findViewById(R.id.buttonAddBaby);
        progressBar = view.findViewById(R.id.progressBar);

        view.findViewById(R.id.btnMenuProfile).setOnClickListener(v -> {
            if (getActivity() instanceof com.talentbaby.app.MainActivity) {
                ((com.talentbaby.app.MainActivity) getActivity()).openDrawer();
            }
        });

        buttonAddBaby.setOnClickListener(v -> {
            Intent intent = new Intent(getActivity(), AddBabyActivity.class);
            startActivity(intent);
        });

        view.findViewById(R.id.layoutLogout).setOnClickListener(v -> showLogoutDialog());
    }

    private void setupRecyclerView() {
        babyAdapter = new BabyAdapter(babies, baby -> {
            Intent intent = new Intent(getActivity(), BabyProfileActivity.class);
            intent.putExtra("baby_id", baby.getId());
            intent.putExtra("baby_name", baby.getName());
            intent.putExtra("baby_birth_date", baby.getBirthDate());
            intent.putExtra("baby_gender", baby.getGender());
            startActivity(intent);
        });
        recyclerBabies.setLayoutManager(new LinearLayoutManager(getContext()));
        recyclerBabies.setAdapter(babyAdapter);
    }

    private void loadProfile() {
        apiService.getProfile().enqueue(new Callback<ApiResponse<User>>() {
            @Override
            public void onResponse(Call<ApiResponse<User>> call, Response<ApiResponse<User>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    User user = response.body().getData();
                    textUserName.setText(user.getFullName() != null ? user.getFullName() : "User");
                    textUserEmail.setText(user.getEmail() != null ? user.getEmail() : "");
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<User>> call, Throwable t) {
                // Silently fail
            }
        });
    }

    private void loadBabies() {
        apiService.getBabies().enqueue(new Callback<ApiResponse<List<Baby>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Baby>>> call, Response<ApiResponse<List<Baby>>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    babies.clear();
                    babies.addAll(response.body().getData());
                    babyAdapter.notifyDataSetChanged();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Baby>>> call, Throwable t) {
                // Silently fail
            }
        });
    }

    private void showLogoutDialog() {
        if (getContext() == null) return;
        new AlertDialog.Builder(getContext())
                .setTitle(getString(R.string.logout))
                .setMessage(getString(R.string.logout_confirm))
                .setPositiveButton(getString(R.string.yes), (dialog, which) -> {
                    TokenManager.clearToken(requireContext());
                    Intent intent = new Intent(getActivity(), LoginActivity.class);
                    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                    startActivity(intent);
                    if (getActivity() != null) getActivity().finish();
                })
                .setNegativeButton(getString(R.string.no), null)
                .show();
    }
}
