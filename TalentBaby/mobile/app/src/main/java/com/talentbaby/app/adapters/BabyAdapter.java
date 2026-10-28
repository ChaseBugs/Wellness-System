package com.talentbaby.app.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.talentbaby.app.R;
import com.talentbaby.app.models.Baby;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class BabyAdapter extends RecyclerView.Adapter<BabyAdapter.ViewHolder> {
    private final List<Baby> babies;
    private final OnBabyClickListener listener;

    public interface OnBabyClickListener {
        void onBabyClick(Baby baby);
    }

    public BabyAdapter(List<Baby> babies, OnBabyClickListener listener) {
        this.babies = babies;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_baby, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        holder.bind(babies.get(position));
    }

    @Override
    public int getItemCount() {
        return babies.size();
    }

    class ViewHolder extends RecyclerView.ViewHolder {
        private final TextView textName;
        private final TextView textAge;
        private final ImageView imageEdit;

        ViewHolder(@NonNull View itemView) {
            super(itemView);
            textName = itemView.findViewById(R.id.textBabyName);
            textAge = itemView.findViewById(R.id.textBabyAge);
            imageEdit = itemView.findViewById(R.id.imageEditBaby);
        }

        void bind(Baby baby) {
            textName.setText(baby.getName());

            if (baby.getBirthDate() != null) {
                int months = calculateAgeInMonths(baby.getBirthDate());
                String gender = baby.getGender() != null ? " - " + baby.getGender() : "";
                textAge.setText(months + " months old" + gender);
            } else {
                textAge.setText("");
            }

            imageEdit.setOnClickListener(v -> listener.onBabyClick(baby));
            itemView.setOnClickListener(v -> listener.onBabyClick(baby));
        }

        private int calculateAgeInMonths(String birthDate) {
            try {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
                Date birth = sdf.parse(birthDate);
                if (birth == null) return 0;
                Calendar birthCal = Calendar.getInstance();
                birthCal.setTime(birth);
                Calendar now = Calendar.getInstance();
                int months = (now.get(Calendar.YEAR) - birthCal.get(Calendar.YEAR)) * 12
                        + (now.get(Calendar.MONTH) - birthCal.get(Calendar.MONTH));
                return Math.max(0, months);
            } catch (Exception e) {
                return 0;
            }
        }
    }
}
