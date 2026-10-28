"use client";

import { ChevronLeft, ChevronRight, Images, Layers3, ListChecks, MonitorSmartphone } from "lucide-react";
import { useMemo, useState } from "react";

type Workflow = {
  id: string;
  title: string;
  description: string;
  outcome: string;
  files: string[];
};

const workflows: Workflow[] = [
  {
    id: "launch",
    title: "Launch",
    description: "Initial app splash and brand entry state.",
    outcome: "User sees the Foodvisor app opening state.",
    files: ["00_splash.png"]
  },
  {
    id: "get-started",
    title: "Get Started",
    description: "Intro carousel, account entry, and onboarding completion.",
    outcome: "User reaches the guided setup flow.",
    files: [
      "01_get_started_00.png",
      "01_get_started_01.png",
      "01_get_started_02.png",
      "01_get_started_03.png",
      "01_get_started_04.png",
      "01_get_started_05.png",
      "01_get_started_06.png",
      "01_get_started_07.png",
      "01_get_started_finished.png"
    ]
  },
  {
    id: "profile-setup",
    title: "Goal & Profile",
    description: "Gender, age, body metrics, goals, target pace, and profile confirmation.",
    outcome: "User profile data is collected for calorie and macro targeting.",
    files: [
      "02_setting_profile_00.png",
      "02_setting_profile_01.png",
      "02_setting_profile_02.png",
      "02_setting_profile_03.png",
      "02_setting_profile_04.png",
      "02_setting_profile_05.png",
      "02_setting_profile_06.png",
      "02_setting_profile_07.png",
      "02_setting_profile_08.png",
      "02_setting_profile_09.png",
      "02_setting_profile_10.png",
      "02_setting_profile_11.png",
      "02_setting_profile_12.png",
      "02_setting_profile_13.png",
      "02_setting_profile_14.png",
      "02_setting_profile_15.png"
    ]
  },
  {
    id: "environment",
    title: "Environment",
    description: "Lifestyle environment questions that tune nutrition recommendations.",
    outcome: "User context is captured for more relevant coaching.",
    files: [
      "03_setting_environment_00.png",
      "03_setting_environment_01.png",
      "03_setting_environment_02.png",
      "03_setting_environment_03.png",
      "03_setting_environment_04.png",
      "03_setting_environment_05.png",
      "03_setting_environment_06.png"
    ]
  },
  {
    id: "habits",
    title: "Habits",
    description: "Food preferences, activity habits, health context, and intake behavior.",
    outcome: "Habit signals are ready for plan personalization.",
    files: [
      "04_setting_habits_00.png",
      "04_setting_habits_01.png",
      "04_setting_habits_02.png",
      "04_setting_habits_03.png",
      "04_setting_habits_04.png",
      "04_setting_habits_05.png",
      "04_setting_habits_06.png",
      "04_setting_habits_07.png",
      "04_setting_habits_08.png",
      "04_setting_habits_09.png",
      "04_setting_habits_10.png",
      "04_setting_habits_11.png"
    ]
  },
  {
    id: "needs",
    title: "Your Needs",
    description: "Personalized need summary before the calculated nutrition target is revealed.",
    outcome: "User understands why the daily plan is tailored.",
    files: ["05_you_needs_00.png", "05_you_needs_01.png", "05_you_needs_02.png"]
  },
  {
    id: "activity-reveal",
    title: "Activity Reveal",
    description: "Loading and randomizing transition screens used before presenting results.",
    outcome: "User sees feedback while the plan is prepared.",
    files: ["06_loading activity.png", "07_dice activity.png"]
  },
  {
    id: "daily-nutrition",
    title: "Daily Nutrition",
    description: "Calorie goal and macro target reveal screens.",
    outcome: "User receives daily calorie, protein, fat, carb, and fiber targets.",
    files: [
      "08_daily_nutrition_00.png",
      "08_daily_nutrition_01.png",
      "08_daily_nutrition_02.png",
      "08_daily_nutrition_03.png",
      "08_daily_nutrition_04.png"
    ]
  },
  {
    id: "profile",
    title: "Profile",
    description: "Profile tab states for account, plan, goal, and app preferences.",
    outcome: "User can inspect and manage personal settings.",
    files: ["10_profile_00.png", "10_profile_01.png", "10_profile_02.png", "10_profile_03.png"]
  },
  {
    id: "journal-entry",
    title: "Journal Entry",
    description: "Initial journal screen for meal tracking.",
    outcome: "User can start logging meals.",
    files: ["11_journal_00.png"]
  },
  {
    id: "activity-list",
    title: "Activity List",
    description: "Activity search, selection, and logging workflow.",
    outcome: "User can add burned calories from activities.",
    files: [
      "12_activity_list_00.png",
      "12_activity_list_01.png",
      "12_activity_list_02.png",
      "12_activity_list_03.png",
      "12_activity_list_04.png",
      "12_activity_list_05.png",
      "12_activity_list_06.png",
      "12_activity_list_07.png",
      "12_activity_list_08.png"
    ]
  },
  {
    id: "welcome-back",
    title: "Welcome Back",
    description: "Returning-user check-in screens and prompts.",
    outcome: "User is reoriented into the plan after returning.",
    files: [
      "13_welcome_back_00.png",
      "13_welcome_back_01.png",
      "13_welcome_back_02.png",
      "13_welcome_back_03.png",
      "13_welcome_back_04.png",
      "13_welcome_back_05.png"
    ]
  },
  {
    id: "journal",
    title: "Journal",
    description: "Main journal tab with nutrition summary, offers, meals, and empty states.",
    outcome: "User can review the daily food log and continue tracking.",
    files: ["14_Journal_00.png", "14_Journal_01.png", "14_Journal_02.png", "14_Journal_03.png"]
  }
];

const totalScreens = workflows.reduce((count, workflow) => count + workflow.files.length, 0);

function screenLabel(file: string) {
  return file.replace(".png", "").replace(/_/g, " ");
}

function imageSrc(file: string) {
  return `/api/design-ui/${encodeURIComponent(file)}`;
}

export default function MobileUiWorkflows() {
  const [workflowIndex, setWorkflowIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const workflow = workflows[workflowIndex];
  const file = workflow.files[stepIndex];

  const coverage = useMemo(() => {
    const previousScreens = workflows.slice(0, workflowIndex).reduce((count, item) => count + item.files.length, 0);
    return previousScreens + stepIndex + 1;
  }, [stepIndex, workflowIndex]);

  function selectWorkflow(nextWorkflowIndex: number) {
    setWorkflowIndex(nextWorkflowIndex);
    setStepIndex(0);
  }

  function moveStep(direction: -1 | 1) {
    const nextStep = stepIndex + direction;
    if (nextStep >= 0 && nextStep < workflow.files.length) {
      setStepIndex(nextStep);
      return;
    }

    const nextWorkflow = workflowIndex + direction;
    if (nextWorkflow < 0 || nextWorkflow >= workflows.length) return;

    setWorkflowIndex(nextWorkflow);
    setStepIndex(direction > 0 ? 0 : workflows[nextWorkflow].files.length - 1);
  }

  return (
    <div className="page ui-workflows-page">
      <section className="ui-workflows-hero">
        <div>
          <p><MonitorSmartphone size={16} /> Mobile UI Reference</p>
          <h1>Design UI Workflows</h1>
          <span>All {totalScreens} screens from `design/ui`, grouped in the product flow order.</span>
        </div>
        <div className="ui-coverage">
          <strong>{coverage}</strong>
          <span>of {totalScreens} screens</span>
        </div>
      </section>

      <section className="ui-workflows-layout">
        <aside className="ui-workflow-sidebar" aria-label="UI workflows">
          <div className="ui-panel-heading">
            <ListChecks size={18} />
            <div>
              <strong>Workflow Order</strong>
              <span>{workflows.length} workflows</span>
            </div>
          </div>
          <div className="ui-workflow-list">
            {workflows.map((item, index) => (
              <button
                className={index === workflowIndex ? "active" : ""}
                key={item.id}
                onClick={() => selectWorkflow(index)}
                type="button"
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.files.length} screens</small>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <div className="ui-phone-stage">
          <div className="ui-stage-toolbar">
            <button onClick={() => moveStep(-1)} type="button" title="Previous screen">
              <ChevronLeft size={18} />
            </button>
            <div>
              <strong>{workflow.title}</strong>
              <span>Step {stepIndex + 1} of {workflow.files.length}</span>
            </div>
            <button onClick={() => moveStep(1)} type="button" title="Next screen">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="ui-phone-frame">
            <img alt={`${workflow.title} - ${screenLabel(file)}`} src={imageSrc(file)} />
          </div>
        </div>

        <aside className="ui-step-panel">
          <div className="ui-panel-heading">
            <Layers3 size={18} />
            <div>
              <strong>{workflow.title}</strong>
              <span>{workflow.outcome}</span>
            </div>
          </div>

          <p className="ui-workflow-description">{workflow.description}</p>

          <div className="ui-current-file">
            <span>Current asset</span>
            <strong>{file}</strong>
          </div>

          <div className="ui-step-grid" aria-label={`${workflow.title} screens`}>
            {workflow.files.map((item, index) => (
              <button
                className={index === stepIndex ? "active" : ""}
                key={item}
                onClick={() => setStepIndex(index)}
                type="button"
              >
                <img alt="" src={imageSrc(item)} />
                <span>{index + 1}</span>
              </button>
            ))}
          </div>
        </aside>
      </section>

      <section className="ui-all-screens">
        <div className="ui-panel-heading">
          <Images size={18} />
          <div>
            <strong>Complete Screen Coverage</strong>
            <span>Every file under design/ui is represented here.</span>
          </div>
        </div>
        <div className="ui-workflow-card-grid">
          {workflows.map((item, index) => (
            <button key={item.id} onClick={() => selectWorkflow(index)} type="button">
              <img alt="" src={imageSrc(item.files[0])} />
              <strong>{item.title}</strong>
              <span>{item.files.length} screens</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
