package com.talentbaby.app.ui.knowledge;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;

import com.talentbaby.app.MainActivity;
import com.talentbaby.app.R;
import com.talentbaby.app.activities.NutritionRecipesActivity;
import com.talentbaby.app.activities.StoryTimeActivity;
import com.talentbaby.app.activities.WisdomInsightsActivity;

public class KnowledgeFragment extends Fragment {

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_knowledge, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        applyColors(view);
        setupClickListeners(view);
    }

    private void applyColors(View view) {
        view.setBackgroundColor(ContextCompat.getColor(requireContext(), R.color.white));
    }

    private void setupClickListeners(View view) {
        view.findViewById(R.id.btnMenuLibrary).setOnClickListener(v -> {
            if (getActivity() instanceof MainActivity) {
                ((MainActivity) getActivity()).openDrawer();
            }
        });

        view.findViewById(R.id.btnParentingSupportLibrary).setOnClickListener(v ->
                startActivity(new Intent(requireContext(), com.talentbaby.app.activities.ParentingSupportActivity.class)));

        view.findViewById(R.id.cardWisdom).setOnClickListener(v ->
                startActivity(new Intent(requireContext(), WisdomInsightsActivity.class)));

        view.findViewById(R.id.cardNutrition).setOnClickListener(v ->
                startActivity(new Intent(requireContext(), NutritionRecipesActivity.class)));

        view.findViewById(R.id.cardStories).setOnClickListener(v ->
                startActivity(new Intent(requireContext(), StoryTimeActivity.class)));

    }
}
