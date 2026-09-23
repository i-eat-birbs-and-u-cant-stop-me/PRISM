// P.R.I.S.M. Core JavaScript
// This file handles behavior for the dashboard.

const STORAGE_KEY = "prism.todos";
const NOTES_KEY = "prism.notes";
const PROFILE_KEY = "prism.profile";
const THEME_KEY = "prism.theme";
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

function getProfile() {
  const saved = localStorage.getItem(PROFILE_KEY);

  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved);
  } catch (error) {
    console.warn("Could not parse saved profile.", error);
    return null;
  }
}

function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

function getTodos() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return [
      { id: Date.now(), text: "Review math notes", done: false },
      { id: Date.now() + 1, text: "Finish science lab", done: false }
    ];
  }

  try {
    return JSON.parse(saved);
  } catch (error) {
    console.warn("Could not parse saved tasks. Starting fresh.", error);
    return [];
  }
}

function saveTodos(todoItems) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todoItems));
}

function renderTodos() {
  const todoList = document.getElementById("todo-list");
  const todoItems = getTodos();

  todoList.innerHTML = "";

  todoItems.forEach((item) => {
    const li = document.createElement("li");
    li.className = `todo-item ${item.done ? "done" : ""}`;

    const left = document.createElement("div");
    left.className = "todo-left";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo-checkbox";
    checkbox.checked = item.done;
    checkbox.addEventListener("change", () => {
      const currentTodos = getTodos();
      const updatedTodos = currentTodos.map((todo) =>
        todo.id === item.id ? { ...todo, done: !todo.done } : todo
      );
      saveTodos(updatedTodos);
      renderTodos();
    });

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = item.text;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "todo-delete";
    deleteButton.textContent = "X";
    deleteButton.setAttribute("aria-label", `Delete task: ${item.text}`);
    deleteButton.addEventListener("click", () => {
      const filteredTodos = getTodos().filter((todo) => todo.id !== item.id);
      saveTodos(filteredTodos);
      renderTodos();
    });

    left.appendChild(checkbox);
    left.appendChild(text);
    li.appendChild(left);
    li.appendChild(deleteButton);
    todoList.appendChild(li);
  });
}

function addTodo(event) {
  event.preventDefault();

  const input = document.getElementById("todo-input");
  const text = input.value.trim();

  if (!text) {
    return;
  }

  const currentTodos = getTodos();
  currentTodos.push({
    id: Date.now(),
    text,
    done: false
  });

  saveTodos(currentTodos);
  input.value = "";
  renderTodos();
}

function updateClock() {
  const clockElement = document.getElementById("clock");
  const greetingElement = document.getElementById("greeting");
  const dateElement = document.getElementById("date");

  const now = new Date();
  const timeString = now.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });

  const dateString = now.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const hour = now.getHours();
  let greeting = "Good evening";

  if (hour < 12) {
    greeting = "Good morning";
  } else if (hour < 18) {
    greeting = "Good afternoon";
  }

  const profile = getProfile();
  const firstName = profile && profile.name ? profile.name.trim().split(" ")[0] : "student operator";

  clockElement.textContent = timeString;
  greetingElement.textContent = `${greeting}, ${firstName}.`;
  dateElement.textContent = dateString;
}

function loadNotes() {
  return localStorage.getItem(NOTES_KEY) || "";
}

function saveNotes(content) {
  localStorage.setItem(NOTES_KEY, content);
}

function initializeNotes() {
  const notesInput = document.getElementById("notes-input");

  if (!notesInput) {
    return;
  }

  notesInput.value = loadNotes();
  notesInput.addEventListener("input", (event) => {
    saveNotes(event.target.value);
  });
}

function initializePriorityList() {
  const priorityItems = document.querySelectorAll("#priority-list li");

  priorityItems.forEach((item) => {
    const checkbox = item.querySelector("input");
    if (!checkbox) {
      return;
    }

    checkbox.addEventListener("change", () => {
      item.classList.toggle("done", checkbox.checked);
    });

    if (checkbox.checked) {
      item.classList.add("done");
    }
  });
}

function applyProfileToDashboard(profile) {
  const accountName = document.getElementById("account-name");
  const greeting = document.getElementById("greeting");
  const schoolTag = document.getElementById("profile-school-tag");
  const profileNameCard = document.getElementById("profile-name-card");
  const profileSchoolCard = document.getElementById("profile-school-card");
  const profileGradeCard = document.getElementById("profile-grade-card");
  const profileGoalCard = document.getElementById("profile-goal-card");

  if (accountName) {
    const firstName = profile.name ? profile.name.trim().split(" ")[0] : "Student";
    accountName.textContent = firstName;
  }

  if (schoolTag) {
    schoolTag.textContent = profile.school || "School";
  }

  if (profileNameCard) {
    profileNameCard.textContent = profile.name || "Student";
  }

  if (profileSchoolCard) {
    profileSchoolCard.textContent = profile.school || "School";
  }

  if (profileGradeCard) {
    profileGradeCard.textContent = profile.grade || "Grade";
  }

  if (profileGoalCard) {
    profileGoalCard.textContent = profile.goal || "Stay consistent";
  }

  if (greeting) {
    const now = new Date();
    const hour = now.getHours();
    let greetingText = "Good evening";

    if (hour < 12) {
      greetingText = "Good morning";
    } else if (hour < 18) {
      greetingText = "Good afternoon";
    }

    const firstName = profile.name ? profile.name.trim().split(" ")[0] : "student operator";
    greeting.textContent = `${greetingText}, ${firstName}.`;
  }
}

function showDashboard(profile) {
  document.body.classList.add("dashboard-ready");
  applyProfileToDashboard(profile);
  updateClock();

  if (!window.__prismClockInterval) {
    window.__prismClockInterval = setInterval(updateClock, 1000);
  }
}

function hideDashboard() {
  document.body.classList.remove("dashboard-ready");
}

function logoutFromDashboard() {
  localStorage.removeItem(PROFILE_KEY);
  location.reload();
}

function resetProfileFromDashboard() {
  localStorage.removeItem(PROFILE_KEY);

  const profileForm = document.getElementById("profile-form");
  if (profileForm) {
    profileForm.reset();
  }

  location.reload();
}

function decodeJwtPayload(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const json = decodeURIComponent(
    atob(padded)
      .split("")
      .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join("")
  );

  return JSON.parse(json);
}

function handleGoogleResponse(response) {
  if (!response || !response.credential) {
    return;
  }

  const payload = decodeJwtPayload(response.credential);
  const profile = {
    name: payload.name || payload.given_name || "Google Student",
    school: payload.hd || "Your School",
    grade: "Student",
    goal: "Stay organized and keep momentum with weekly goals.",
    provider: "google",
    email: payload.email || ""
  };

  saveProfile(profile);
  showDashboard(profile);
}

function initializeGoogleLogin() {
  const googleButton = document.getElementById("google-login");

  if (!googleButton || !window.google || !window.google.accounts || !window.google.accounts.id) {
    return;
  }

  const isGoogleClientConfigured = GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

  if (!isGoogleClientConfigured) {
    googleButton.addEventListener("click", () => {
      window.alert("Google OAuth is not configured yet. Replace YOUR_GOOGLE_CLIENT_ID with a real Google client ID in script.js to enable real sign-in.");
    });
    return;
  }

  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleResponse
  });

  googleButton.addEventListener("click", () => {
    window.google.accounts.id.prompt();
  });
}

function createGoogleProfile() {
  const profile = {
    name: "Google Student",
    school: "Your School",
    grade: "12th Grade",
    goal: "Stay organized and keep momentum with weekly goals.",
    provider: "google"
  };

  saveProfile(profile);
  showDashboard(profile);
}

function openSettings() {
  const dropdown = document.getElementById("settings-dropdown");
  if (!dropdown) {
    return;
  }

  const profile = getProfile();
  if (!profile) {
    return;
  }

  document.getElementById("settings-name").value = profile.name || "";
  document.getElementById("settings-school").value = profile.school || "";
  document.getElementById("settings-grade").value = profile.grade || "";
  document.getElementById("settings-goal").value = profile.goal || "";

  dropdown.classList.remove("hidden");
}

function closeSettings() {
  const dropdown = document.getElementById("settings-dropdown");
  if (!dropdown) {
    return;
  }

  dropdown.classList.add("hidden");
}

function saveSettings(profileUpdate) {
  const currentProfile = getProfile() || {};
  const updatedProfile = {
    ...currentProfile,
    ...profileUpdate,
    provider: currentProfile.provider || "manual"
  };

  saveProfile(updatedProfile);
  applyProfileToDashboard(updatedProfile);
  closeSettings();
}

function applyTheme(themeName) {
  const validThemes = ["cyberpunk", "violet", "sunset"];
  const nextTheme = validThemes.includes(themeName) ? themeName : "cyberpunk";
  document.body.dataset.theme = nextTheme;
  localStorage.setItem(THEME_KEY, nextTheme);

  document.querySelectorAll(".theme-option").forEach((button) => {
    const isActive = button.dataset.theme === nextTheme;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function initializeSettingsNavigation() {
  const menuButtons = document.querySelectorAll(".menu-item");
  const panels = document.querySelectorAll(".settings-panel");

  if (!menuButtons.length || !panels.length) {
    return;
  }

  menuButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedPanel = button.dataset.panel;

      menuButtons.forEach((item) => item.classList.toggle("active", item === button));
      panels.forEach((panel) => {
        panel.classList.toggle("active", panel.dataset.panel === selectedPanel);
      });
    });
  });

  const storedTheme = localStorage.getItem(THEME_KEY) || "cyberpunk";
  applyTheme(storedTheme);

  document.querySelectorAll(".theme-option").forEach((button) => {
    button.addEventListener("click", () => {
      applyTheme(button.dataset.theme);
    });
  });
}

function initializeProfileSetup() {
  const profileForm = document.getElementById("profile-form");
  const googleButton = document.getElementById("google-login");
  const existingProfile = getProfile();
  const logoutButton = document.getElementById("logout-button");
  const resetButton = document.getElementById("reset-profile-button");
  const settingsButton = document.getElementById("settings-button");
  const closeSettingsButton = document.getElementById("close-settings");
  const settingsForm = document.getElementById("settings-form");
  const dropdown = document.getElementById("settings-dropdown");

  initializeSettingsNavigation();

  if (logoutButton) {
    logoutButton.addEventListener("click", logoutFromDashboard);
  }

  if (resetButton) {
    resetButton.addEventListener("click", resetProfileFromDashboard);
  }

  if (settingsButton) {
    settingsButton.addEventListener("click", () => {
      const isHidden = dropdown && dropdown.classList.contains("hidden");
      if (isHidden) {
        openSettings();
      } else {
        closeSettings();
      }
    });
  }

  if (closeSettingsButton) {
    closeSettingsButton.addEventListener("click", closeSettings);
  }

  if (dropdown) {
    dropdown.addEventListener("click", (event) => {
      if (event.target === dropdown) {
        closeSettings();
      }
    });
  }

  if (settingsForm) {
    settingsForm.addEventListener("submit", (event) => {
      event.preventDefault();

      saveSettings({
        name: document.getElementById("settings-name").value.trim() || "Student Operator",
        school: document.getElementById("settings-school").value.trim() || "School",
        grade: document.getElementById("settings-grade").value.trim() || "Grade",
        goal: document.getElementById("settings-goal").value.trim() || "Stay consistent."
      });
    });
  }

  if (existingProfile) {
    showDashboard(existingProfile);

    if (window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
      setTimeout(openSettings, 400);
    }

    return;
  }

  hideDashboard();

  initializeGoogleLogin();

  if (googleButton && googleButton.dataset.fallback === "manual") {
    googleButton.addEventListener("click", () => {
      createGoogleProfile();
    });
  }

  profileForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const profile = {
      name: document.getElementById("profile-name").value.trim() || "Student Operator",
      school: document.getElementById("profile-school").value.trim() || "School",
      grade: document.getElementById("profile-grade").value.trim() || "Grade",
      goal: document.getElementById("profile-goal").value.trim() || "Stay consistent.",
      provider: "manual"
    };

    saveProfile(profile);
    showDashboard(profile);
    setTimeout(openSettings, 300);
  });
}

function initializeDashboard() {
  initializeProfileSetup();

  const profile = getProfile();
  if (!profile) {
    return;
  }

  updateClock();
  renderTodos();
  initializeNotes();
  initializePriorityList();

  const form = document.getElementById("todo-form");
  if (form) {
    form.addEventListener("submit", addTodo);
  }

  if (!window.__prismClockInterval) {
    window.__prismClockInterval = setInterval(updateClock, 1000);
  }
}

document.addEventListener("DOMContentLoaded", initializeDashboard);
