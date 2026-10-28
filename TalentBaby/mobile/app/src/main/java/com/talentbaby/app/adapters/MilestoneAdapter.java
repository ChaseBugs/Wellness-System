package com.talentbaby.app.adapters;

import android.graphics.drawable.GradientDrawable;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.talentbaby.app.R;
import com.talentbaby.app.models.MilestoneDefinition;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;

public class MilestoneAdapter extends RecyclerView.Adapter<RecyclerView.ViewHolder> {

    private static final int TYPE_HEADER    = 0;
    private static final int TYPE_MILESTONE = 1;

    public interface OnStatusChangedListener {
        void onStatusChanged(int milestoneDefinitionId, String status);
    }

    /** Sealed list item — either a section header or a milestone row */
    private static class ListItem {
        final boolean isHeader;
        // header fields
        final String category;
        // milestone fields
        final MilestoneDefinition definition;
        final int indexInSection; // 1-based

        ListItem(String category) {
            this.isHeader = true;
            this.category = category;
            this.definition = null;
            this.indexInSection = 0;
        }

        ListItem(MilestoneDefinition def, int indexInSection) {
            this.isHeader = false;
            this.category = null;
            this.definition = def;
            this.indexInSection = indexInSection;
        }
    }

    // Ordered categories for display
    private static final String[] CATEGORY_ORDER = {
            "physical", "cognitive", "communication", "social_emotional"
    };

    private List<ListItem> flatList = new ArrayList<>();
    private Map<Integer, String> statusMap = new HashMap<>();
    private Set<String> collapsedSections = new HashSet<>();
    private OnStatusChangedListener listener;

    public MilestoneAdapter(OnStatusChangedListener listener) {
        this.listener = listener;
        for (String category : CATEGORY_ORDER) {
            collapsedSections.add(category);
        }
    }

    /**
     * Build a flat list from a grouped definitions map and current status map.
     * @param grouped   map from milestone_type → list of MilestoneDefinition
     * @param statusMap map from milestone_definition_id → status ("yes"/"no"/"almost")
     */
    public void setData(Map<String, List<MilestoneDefinition>> grouped, Map<Integer, String> statusMap) {
        this.lastGrouped = grouped;
        this.statusMap = statusMap != null ? statusMap : new HashMap<>();
        flatList.clear();

        for (String cat : CATEGORY_ORDER) {
            List<MilestoneDefinition> defs = grouped != null ? grouped.get(cat) : null;
            if (defs == null || defs.isEmpty()) continue;

            flatList.add(new ListItem(cat));
            if (!collapsedSections.contains(cat)) {
                int index = 1;
                for (MilestoneDefinition def : defs) {
                    flatList.add(new ListItem(def, index++));
                }
            }
        }
        notifyDataSetChanged();
    }

    public void updateStatus(int definitionId, String status) {
        if (status == null || status.isEmpty()) {
            statusMap.remove(definitionId);
        } else {
            statusMap.put(definitionId, status);
        }
        for (int i = 0; i < flatList.size(); i++) {
            ListItem item = flatList.get(i);
            if (!item.isHeader && item.definition != null && item.definition.getId() == definitionId) {
                notifyItemChanged(i);
                break;
            }
        }
    }

    @Override
    public int getItemViewType(int position) {
        return flatList.get(position).isHeader ? TYPE_HEADER : TYPE_MILESTONE;
    }

    @NonNull
    @Override
    public RecyclerView.ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        LayoutInflater inflater = LayoutInflater.from(parent.getContext());
        if (viewType == TYPE_HEADER) {
            View v = inflater.inflate(R.layout.item_milestone_header, parent, false);
            return new HeaderViewHolder(v);
        } else {
            View v = inflater.inflate(R.layout.item_milestone, parent, false);
            return new MilestoneViewHolder(v);
        }
    }

    @Override
    public void onBindViewHolder(@NonNull RecyclerView.ViewHolder holder, int position) {
        ListItem item = flatList.get(position);
        if (item.isHeader) {
            ((HeaderViewHolder) holder).bind(item.category, collapsedSections.contains(item.category));
            holder.itemView.setOnClickListener(v -> toggleSection(item.category));
        } else {
            String status = item.definition != null ? statusMap.get(item.definition.getId()) : null;
            ((MilestoneViewHolder) holder).bind(item.definition, item.indexInSection, status, listener);
        }
    }

    @Override
    public int getItemCount() {
        return flatList.size();
    }

    private void toggleSection(String category) {
        if (collapsedSections.contains(category)) {
            collapsedSections.remove(category);
        } else {
            collapsedSections.add(category);
        }
        // Rebuild flat list preserving current grouped data
        rebuildFromCollapsed();
    }

    /** Store last grouped data so we can rebuild after collapse/expand */
    private Map<String, List<MilestoneDefinition>> lastGrouped;

    private void rebuildFromCollapsed() {
        if (lastGrouped != null) {
            flatList.clear();
            for (String cat : CATEGORY_ORDER) {
                List<MilestoneDefinition> defs = lastGrouped.get(cat);
                if (defs == null || defs.isEmpty()) continue;
                flatList.add(new ListItem(cat));
                if (!collapsedSections.contains(cat)) {
                    int index = 1;
                    for (MilestoneDefinition def : defs) {
                        flatList.add(new ListItem(def, index++));
                    }
                }
            }
            notifyDataSetChanged();
        }
    }

    // ── View Holders ─────────────────────────────────────────────────────────

    static class HeaderViewHolder extends RecyclerView.ViewHolder {
        TextView textTitle;
        ImageView iconChevron;

        HeaderViewHolder(@NonNull View v) {
            super(v);
            textTitle  = v.findViewById(R.id.textSectionTitle);
            iconChevron = v.findViewById(R.id.iconSectionChevron);
        }

        void bind(String category, boolean collapsed) {
            textTitle.setText(labelForCategory(category));
            iconChevron.setRotation(0f);
            GradientDrawable bg = new GradientDrawable();
            bg.setColor(colorForCategory(category));
            bg.setCornerRadius(itemView.getResources().getDisplayMetrics().density * 16f);
            itemView.setBackground(bg);
        }

        private String labelForCategory(String cat) {
            if (cat == null) return "";
            switch (cat) {
                case "physical":         return "Physical";
                case "cognitive":        return "Cognitive";
                case "communication":    return "Communication";
                case "social_emotional": return "Social & Emotional";
                default:                 return cat;
            }
        }

        private int colorForCategory(String cat) {
            if (cat == null) return itemView.getContext().getColor(R.color.milestone_physical);
            switch (cat) {
                case "physical":
                    return itemView.getContext().getColor(R.color.milestone_physical);
                case "cognitive":
                    return itemView.getContext().getColor(R.color.milestone_cognitive);
                case "communication":
                    return itemView.getContext().getColor(R.color.milestone_communication);
                case "social_emotional":
                    return itemView.getContext().getColor(R.color.milestone_social);
                default:
                    return itemView.getContext().getColor(R.color.milestone_physical);
            }
        }
    }

    static class MilestoneViewHolder extends RecyclerView.ViewHolder {
        TextView textNumber;
        TextView textTitle;
        TextView btnYes;
        TextView btnNo;
        TextView btnAlmost;
        LinearLayout rowRelated;
        LinearLayout layoutRelatedContent;
        TextView textRelatedActivity;
        ImageView iconChevron;

        MilestoneViewHolder(@NonNull View v) {
            super(v);
            textNumber           = v.findViewById(R.id.textMilestoneNumber);
            textTitle            = v.findViewById(R.id.textMilestoneTitle);
            btnYes               = v.findViewById(R.id.btnStatusYes);
            btnNo                = v.findViewById(R.id.btnStatusNo);
            btnAlmost            = v.findViewById(R.id.btnStatusAlmost);
            rowRelated           = v.findViewById(R.id.rowRelatedActivities);
            layoutRelatedContent = v.findViewById(R.id.layoutRelatedActivitiesContent);
            textRelatedActivity  = v.findViewById(R.id.textRelatedActivity);
            iconChevron          = v.findViewById(R.id.iconRelatedActivitiesChevron);
        }

        void bind(MilestoneDefinition def, int indexInSection, String status,
                  OnStatusChangedListener listener) {
            if (def == null) return;

            textNumber.setText(indexInSection + ".");
            textTitle.setText(def.getQuestion() != null && !def.getQuestion().isEmpty()
                    ? def.getQuestion() : def.getTitle());

            applyStatus(status);

            // Status button listeners
            btnYes.setOnClickListener(v -> {
                if (listener != null)
                    listener.onStatusChanged(def.getId(), "yes".equals(status) ? "" : "yes");
            });
            btnNo.setOnClickListener(v -> {
                if (listener != null)
                    listener.onStatusChanged(def.getId(), "no".equals(status) ? "" : "no");
            });
            btnAlmost.setOnClickListener(v -> {
                if (listener != null)
                    listener.onStatusChanged(def.getId(), "almost".equals(status) ? "" : "almost");
            });

            // Related Activities
            String related = def.getRelatedActivity();
            if (related != null && !related.isEmpty()) {
                rowRelated.setVisibility(View.VISIBLE);
                textRelatedActivity.setText(related);
                layoutRelatedContent.setVisibility(View.GONE);
                iconChevron.setRotation(0f);

                rowRelated.setOnClickListener(v -> {
                    boolean expanded = layoutRelatedContent.getVisibility() == View.VISIBLE;
                    layoutRelatedContent.setVisibility(expanded ? View.GONE : View.VISIBLE);
                    iconChevron.setRotation(expanded ? 0f : 180f);
                });
            } else {
                rowRelated.setVisibility(View.GONE);
                layoutRelatedContent.setVisibility(View.GONE);
            }
        }

        private void applyStatus(String status) {
            resetButtons();
            if (status == null) return;
            switch (status) {
                case "yes":
                    btnYes.setBackgroundResource(R.drawable.bg_status_yes);
                    btnYes.setTextColor(itemView.getContext().getColor(android.R.color.white));
                    break;
                case "almost":
                    btnAlmost.setBackgroundResource(R.drawable.bg_status_almost);
                    btnAlmost.setTextColor(itemView.getContext().getColor(android.R.color.white));
                    break;
                case "no":
                    btnNo.setBackgroundResource(R.drawable.bg_status_no);
                    btnNo.setTextColor(itemView.getContext().getColor(android.R.color.white));
                    break;
            }
        }

        private void resetButtons() {
            int secondaryColor = itemView.getContext().getColor(R.color.text_secondary);
            btnYes.setBackgroundResource(R.drawable.bg_status_unselected);
            btnYes.setTextColor(secondaryColor);
            btnNo.setBackgroundResource(R.drawable.bg_status_unselected);
            btnNo.setTextColor(secondaryColor);
            btnAlmost.setBackgroundResource(R.drawable.bg_status_unselected);
            btnAlmost.setTextColor(secondaryColor);
        }
    }
}
