const state = {
  token: localStorage.getItem("height_admin_token") || "",
  user: JSON.parse(localStorage.getItem("height_admin_user") || "null"),
  active: "dashboard",
  modal: null
};

const resources = {
  users: {
    title: "Users",
    columns: ["name", "email", "role", "status", "streakDays", "points"],
    fields: [
      ["name", "text", true],
      ["email", "email", true],
      ["password", "password", false],
      ["role", "select:user,admin", true],
      ["status", "select:active,blocked", true],
      ["streakDays", "number", false],
      ["points", "number", false],
      ["measurements", "json", false]
    ]
  },
  exercises: {
    title: "Exercises",
    columns: ["title", "category", "durationSeconds", "difficulty", "doctor_verified", "setup", "isActive"],
    fields: [
      ["title", "text", true],
      ["slug", "text", false],
      ["category", "select:stretching,posture,strength,cardio,yoga,warmup,custom", true],
      ["durationSeconds", "number", true],
      ["calories", "number", false],
      ["difficulty", "select:beginner,intermediate,advanced", true],
      ["ageGroup", "text", false],
      ["imageUrl", "url", false],
      ["videoUrl", "url", false],
      ["equipment", "json", false],
      ["targetAreas", "json", false],
      ["steps", "json", false],
      ["tips", "json", false],
      ["doctor_verified", "checkbox", false],
      ["setup", "checkbox", false],
      ["sortOrder", "number", false],
      ["isActive", "checkbox", false]
    ]
  },
  "training-plans": {
    title: "Training Plans",
    columns: ["title", "level", "type", "estimatedMinutes", "doctor_verified", "setup", "isActive"],
    fields: [
      ["title", "text", true],
      ["subtitle", "text", false],
      ["description", "textarea", false],
      ["level", "select:beginner,intermediate,advanced", true],
      ["type", "select:featured,daily,weekly,custom-template", true],
      ["bannerImageUrl", "url", false],
      ["icon", "text", false],
      ["estimatedMinutes", "number", false],
      ["goal", "text", false],
      ["exercises", "json", false],
      ["tags", "json", false],
      ["doctor_verified", "checkbox", false],
      ["setup", "checkbox", false],
      ["isPremium", "checkbox", false],
      ["isActive", "checkbox", false],
      ["sortOrder", "number", false]
    ]
  },
  articles: {
    title: "Articles",
    columns: ["title", "category", "readMinutes", "doctor_verified", "setup", "isPublished"],
    fields: [
      ["title", "text", true],
      ["slug", "text", false],
      ["category", "select:nutrition,sleep,height-tips,reports,fashion,motivation,general", true],
      ["excerpt", "textarea", false],
      ["body", "textarea", true],
      ["imageUrl", "url", false],
      ["authorName", "text", false],
      ["readMinutes", "number", false],
      ["tags", "json", false],
      ["doctor_verified", "checkbox", false],
      ["setup", "checkbox", false],
      ["isFeatured", "checkbox", false],
      ["isPublished", "checkbox", false]
    ]
  },
  banners: {
    title: "Banners",
    columns: ["title", "placement", "priority", "setup", "isActive"],
    fields: [
      ["title", "text", true],
      ["subtitle", "textarea", false],
      ["placement", "select:home-top,home-card,reports-top,modal,discover", true],
      ["imageUrl", "url", false],
      ["icon", "text", false],
      ["ctaLabel", "text", false],
      ["ctaUrl", "text", false],
      ["backgroundColor", "text", false],
      ["startsAt", "datetime-local", false],
      ["endsAt", "datetime-local", false],
      ["setup", "checkbox", false],
      ["priority", "number", false],
      ["isActive", "checkbox", false]
    ]
  },
  notifications: {
    title: "Notifications",
    columns: ["title", "audience", "type", "setup", "isActive"],
    fields: [
      ["title", "text", true],
      ["message", "textarea", true],
      ["audience", "select:all,free,premium,inactive", true],
      ["type", "select:motivation,reminder,update,promotion", true],
      ["scheduledAt", "datetime-local", false],
      ["setup", "checkbox", false],
      ["isActive", "checkbox", false]
    ]
  },
  goals: {
    title: "Goals",
    columns: ["title", "type", "targetValue", "currentValue", "unit", "status"],
    fields: [
      ["user", "text", true],
      ["title", "text", true],
      ["type", "select:height,weight,workout,sleep,custom", true],
      ["targetValue", "number", false],
      ["currentValue", "number", false],
      ["unit", "text", false],
      ["startsAt", "datetime-local", false],
      ["dueAt", "datetime-local", false],
      ["status", "select:active,completed,cancelled", true]
    ]
  },
  logs: {
    title: "Daily Logs",
    columns: ["user", "date", "heightCm", "weightKg", "sleepHours", "workoutMinutes"],
    fields: [
      ["user", "text", true],
      ["date", "datetime-local", true],
      ["heightCm", "number", false],
      ["weightKg", "number", false],
      ["sleepHours", "number", false],
      ["waterGlasses", "number", false],
      ["mood", "select:great,good,okay,tired,bad", false],
      ["workoutMinutes", "number", false],
      ["completedExercises", "json", false],
      ["notes", "textarea", false]
    ]
  },
  settings: {
    title: "Settings",
    columns: ["key", "value", "setup", "description"],
    fields: [
      ["key", "text", true],
      ["value", "json", true],
      ["setup", "checkbox", false],
      ["description", "textarea", false]
    ]
  }
};

const navItems = [
  ["dashboard", "Dashboard"],
  ["users", "Users"],
  ["exercises", "Exercises"],
  ["training-plans", "Plans"],
  ["articles", "Articles"],
  ["banners", "Banners"],
  ["notifications", "Push"],
  ["goals", "Goals"],
  ["logs", "Logs"],
  ["settings", "Settings"]
];

const app = document.getElementById("app");

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function labelize(key) {
  return key.replaceAll("_", " ").replaceAll("-", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatValue(value) {
  if (value && typeof value === "object") {
    if (value.name || value.email) return escapeHtml(value.name || value.email);
    if (Array.isArray(value)) return escapeHtml(`${value.length} items`);
    return escapeHtml(JSON.stringify(value));
  }
  if (typeof value === "boolean") {
    return `<span class="badge ${value ? "" : "off"}">${value ? "Yes" : "No"}</span>`;
  }
  if (String(value || "").length > 90) {
    return `${escapeHtml(String(value).slice(0, 90))}...`;
  }
  return escapeHtml(value ?? "");
}

async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

function toast(message) {
  let node = document.querySelector(".toast");
  if (!node) {
    node = document.createElement("div");
    node.className = "toast";
    document.body.appendChild(node);
  }
  node.textContent = message;
  node.classList.add("show");
  clearTimeout(node.timer);
  node.timer = setTimeout(() => node.classList.remove("show"), 3200);
}

function renderLogin() {
  app.innerHTML = `
    <section class="login">
      <form class="login-box" id="loginForm">
        <h1>Height Increase Admin</h1>
        <p>Sign in to manage workouts, reports, articles, banners, and app data.</p>
        <div class="field">
          <label>Email</label>
          <input name="email" type="email" value="admin@height.local" required />
        </div>
        <div class="field">
          <label>Password</label>
          <input name="password" type="password" value="Admin123!" required />
        </div>
        <div class="field">
          <button class="btn primary" type="submit">Sign in</button>
        </div>
      </form>
    </section>
  `;

  document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(form.entries()))
      });
      if (data.user.role !== "admin") throw new Error("Admin account required");
      state.token = data.token;
      state.user = data.user;
      localStorage.setItem("height_admin_token", data.token);
      localStorage.setItem("height_admin_user", JSON.stringify(data.user));
      renderShell();
    } catch (error) {
      toast(error.message);
    }
  });
}

function renderShell() {
  app.innerHTML = `
    <section class="layout">
      <aside class="sidebar">
        <div class="brand"><span class="brand-mark">HI</span><span>Height Admin</span></div>
        <nav class="nav">
          ${navItems
            .map(([key, title]) => `<button data-nav="${key}" class="${state.active === key ? "active" : ""}">${title}</button>`)
            .join("")}
        </nav>
      </aside>
      <section class="content">
        <header class="topbar">
          <div>
            <strong>${escapeHtml(state.user?.name || "Admin")}</strong>
            <div class="muted">${escapeHtml(state.user?.email || "")}</div>
          </div>
          <button class="btn ghost" id="logoutBtn">Log out</button>
        </header>
        <div id="page"></div>
      </section>
    </section>
  `;

  document.querySelectorAll("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      state.active = button.dataset.nav;
      renderShell();
    });
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("height_admin_token");
    localStorage.removeItem("height_admin_user");
    state.token = "";
    state.user = null;
    renderLogin();
  });

  if (state.active === "dashboard") renderDashboard();
  else renderResource(state.active);
}

async function renderDashboard() {
  const page = document.getElementById("page");
  page.innerHTML = `<section class="page"><h1>Dashboard</h1><p class="muted">Loading dashboard...</p></section>`;

  try {
    const data = await api("/admin/stats");
    page.innerHTML = `
      <section class="page">
        <h1>Dashboard</h1>
        <div class="stats">
          ${Object.entries(data.totals)
            .map(([key, value]) => `<div class="stat"><b>${value}</b><span>${labelize(key)}</span></div>`)
            .join("")}
        </div>
        <section class="panel">
          <div class="panel-head"><h2>Latest Report Logs</h2></div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>User</th><th>Date</th><th>Height</th><th>Weight</th><th>Sleep</th><th>Workout</th></tr></thead>
              <tbody>
                ${(data.latestLogs || [])
                  .map(
                    (log) => `
                      <tr>
                        <td>${formatValue(log.user)}</td>
                        <td>${formatValue(new Date(log.date).toLocaleDateString())}</td>
                        <td>${formatValue(log.heightCm)}</td>
                        <td>${formatValue(log.weightKg)}</td>
                        <td>${formatValue(log.sleepHours)}</td>
                        <td>${formatValue(log.workoutMinutes)}</td>
                      </tr>`
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    `;
  } catch (error) {
    toast(error.message);
  }
}

async function renderResource(resource, query = "") {
  const config = resources[resource];
  const page = document.getElementById("page");
  page.innerHTML = `
    <section class="page">
      <h1>${config.title}</h1>
      <section class="panel">
        <div class="toolbar">
          <input id="searchInput" value="${escapeHtml(query)}" placeholder="Search ${config.title.toLowerCase()}" />
          <button class="btn primary" id="newBtn">Add ${config.title.slice(0, -1) || config.title}</button>
        </div>
        <div class="table-wrap"><table><tbody><tr><td>Loading...</td></tr></tbody></table></div>
      </section>
    </section>
  `;

  document.getElementById("newBtn").addEventListener("click", () => openForm(resource));
  document.getElementById("searchInput").addEventListener("keydown", (event) => {
    if (event.key === "Enter") renderResource(resource, event.currentTarget.value);
  });

  try {
    const data = await api(`/admin/${resource}?limit=50${query ? `&q=${encodeURIComponent(query)}` : ""}`);
    const table = page.querySelector("table");
    table.innerHTML = `
      <thead>
        <tr>
          ${config.columns.map((column) => `<th>${labelize(column)}</th>`).join("")}
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${(data.items || [])
          .map(
            (item) => `
              <tr>
                ${config.columns.map((column) => `<td>${formatValue(item[column])}</td>`).join("")}
                <td class="actions">
                  <button class="btn small" data-edit="${item._id}">Edit</button>
                  <button class="btn small danger" data-delete="${item._id}">Delete</button>
                </td>
              </tr>`
          )
          .join("") || `<tr><td colspan="${config.columns.length + 1}">No records found.</td></tr>`}
      </tbody>
    `;

    table.querySelectorAll("[data-edit]").forEach((button) => {
      const item = data.items.find((entry) => entry._id === button.dataset.edit);
      button.addEventListener("click", () => openForm(resource, item));
    });

    table.querySelectorAll("[data-delete]").forEach((button) => {
      button.addEventListener("click", () => deleteItem(resource, button.dataset.delete));
    });
  } catch (error) {
    toast(error.message);
  }
}

function inputHtml(field, item = {}) {
  const [name, type, required] = field;
  const raw = item[name];
  const label = labelize(name);
  const value = type === "json" ? JSON.stringify(raw ?? defaultValue(type), null, 2) : raw ?? defaultValue(type);
  const wide = ["textarea", "json"].includes(type) ? "wide" : "";

  if (type === "checkbox") {
    return `
      <div class="field ${wide}">
        <label>${label}</label>
        <select name="${name}" data-type="checkbox">
          <option value="true" ${value === true ? "selected" : ""}>Yes</option>
          <option value="false" ${value === false ? "selected" : ""}>No</option>
        </select>
      </div>
    `;
  }

  if (type.startsWith("select:")) {
    const options = type.slice(7).split(",");
    return `
      <div class="field ${wide}">
        <label>${label}</label>
        <select name="${name}" ${required ? "required" : ""}>
          ${options.map((option) => `<option value="${option}" ${value === option ? "selected" : ""}>${labelize(option)}</option>`).join("")}
        </select>
      </div>
    `;
  }

  if (type === "textarea" || type === "json") {
    return `
      <div class="field ${wide}">
        <label>${label}</label>
        <textarea name="${name}" data-type="${type}" ${required ? "required" : ""}>${escapeHtml(value)}</textarea>
      </div>
    `;
  }

  return `
    <div class="field ${wide}">
      <label>${label}</label>
      <input name="${name}" type="${type}" value="${escapeHtml(toInputDateValue(value, type))}" ${required ? "required" : ""} />
    </div>
  `;
}

function defaultValue(type) {
  if (type === "json") return [];
  if (type === "checkbox") return false;
  return "";
}

function toInputDateValue(value, type) {
  if (!value || type !== "datetime-local") return value ?? "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

function openForm(resource, item = null) {
  const config = resources[resource];
  const modal = document.createElement("div");
  modal.className = "modal open";
  modal.innerHTML = `
    <form class="modal-box" id="editForm">
      <div class="modal-head">
        <strong>${item ? "Edit" : "Add"} ${config.title}</strong>
        <button type="button" class="btn small ghost" data-close>Close</button>
      </div>
      <div class="form-grid">
        ${config.fields.map((field) => inputHtml(field, item || {})).join("")}
      </div>
      <div class="modal-actions">
        <button type="button" class="btn" data-close>Cancel</button>
        <button class="btn primary" type="submit">Save</button>
      </div>
    </form>
  `;
  document.body.appendChild(modal);
  modal.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", () => modal.remove()));
  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.remove();
  });
  modal.querySelector("#editForm").addEventListener("submit", (event) => saveItem(event, resource, item?._id, modal));
}

async function saveItem(event, resource, id, modal) {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = {};

  for (const element of form.elements) {
    if (!element.name) continue;
    if (element.value === "" && element.type !== "password") continue;

    const dataType = element.dataset.type;
    if (dataType === "json") {
      payload[element.name] = element.value ? JSON.parse(element.value) : [];
    } else if (dataType === "checkbox") {
      payload[element.name] = element.value === "true";
    } else if (element.type === "number") {
      payload[element.name] = Number(element.value);
    } else {
      payload[element.name] = element.value;
    }
  }

  try {
    await api(`/admin/${resource}${id ? `/${id}` : ""}`, {
      method: id ? "PATCH" : "POST",
      body: JSON.stringify(payload)
    });
    modal.remove();
    toast("Saved");
    renderResource(resource);
  } catch (error) {
    toast(error.message);
  }
}

async function deleteItem(resource, id) {
  if (!confirm("Delete this item?")) return;
  try {
    await api(`/admin/${resource}/${id}`, { method: "DELETE" });
    toast("Deleted");
    renderResource(resource);
  } catch (error) {
    toast(error.message);
  }
}

if (state.token) {
  renderShell();
} else {
  renderLogin();
}
