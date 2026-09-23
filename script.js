// P.R.I.S.M. Core JavaScript
// This file handles behavior for the dashboard.

const STORAGE_KEY = "prism.todos";
const NOTES_KEY = "prism.notes";
const PROFILE_KEY = "prism.profile";

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
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
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

  clockElement.textContent = timeString;
  greetingElement.textContent = `${greeting}, student operator.`;
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

  if (accountName) {
    const firstName = profile.name ? profile.name.trim().split(" ")[0] : "Student";
    accountName.textContent = firstName;
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
}

function hideDashboard() {
  document.body.classList.remove("dashboard-ready");
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

function initializeProfileSetup() {
  const profileForm = document.getElementById("profile-form");
  const googleButton = document.getElementById("google-login");
  const existingProfile = getProfile();

  if (existingProfile) {
    showDashboard(existingProfile);
    return;
  }

  hideDashboard();

  googleButton.addEventListener("click", () => {
    createGoogleProfile();
  });

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

  setInterval(updateClock, 1000);
}

document.addEventListener("DOMContentLoaded", initializeDashboard);
