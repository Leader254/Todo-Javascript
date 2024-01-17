// VARIABLES
const themeSwitcher = document.querySelector(".themeSwitcher");
const form = document.querySelector("#todo-form");
const formInput = document.querySelector("#form-input");
const todos = document.querySelector(".todos");
const remainingTasks = document.querySelector(".remaining-tasks");
const controls = document.getElementById("controls");
const filters = document.querySelectorAll(".filters button");
const filterAllButton = document.getElementById("all");
const filterCompletedButton = document.getElementById("completed");
const filterRemainButton = document.getElementById("remain");
const draggables = document.querySelectorAll(".draggable");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

if (localStorage.getItem("tasks")) {
  tasks.map((task) => {
    createTask(task);
  });
}

formInput.addEventListener("focus", () => {
  formInput.placeholder = "Currently typing";
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const inputValue = formInput.value;

  if (inputValue === "") {
    return;
  }

  const task = {
    name: inputValue,
    id: new Date().getTime(),
    isCompleted: false,
  };

  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));

  createTask(task);

  form.reset();
});

todos.addEventListener("keydown", (e) => {
  if (e.keyCode === 13) {
    e.preventDefault();

    e.target.blur();
  }
});

// CREATE TASK FUNCTION
function createTask(task) {
  const taskElement = document.createElement("li");

  taskElement.setAttribute("id", task.id);
  taskElement.setAttribute("draggable", "true");
  taskElement.setAttribute("class", "draggable");

  if (task.isCompleted) {
    taskElement.classList.add("complete");
  }

  const taskElementMarkup = `
    <div>
        <input type="checkbox" name="task-name" id="${task.id}" 
        ${task.isCompleted ? "checked" : ""}>
        <span ${!task.isCompleted ? "contenteditable" : ""}>${task.name}</span>
    </div>
    <button title="Remove ${task.name} task" class="remove-task">
        <svg viewBox="0 0 24 24" fill="none">
        <path d="M17.25 17.25L6.75 6.75" stroke="hsl(234, 11%, 52%)" stroke-width="1.5" stroke-linecap="round"
        stroke-linejoin="round" />
        <path d="M17.25 6.75L6.75 17.25" stroke="hsl(234, 11%, 52%)" stroke-width="1.5" stroke-linecap="round"
        stroke-linejoin="round" />
        </svg>
    </button> 
`;

  taskElement.innerHTML = taskElementMarkup;
  todos.appendChild(taskElement);

  countTasks();
}

// COUNT TASKS FUNCTION
function countTasks() {
  const completedTasksArray = tasks.filter((task) => task.isCompleted === true);

  remainingTasks.textContent = tasks.length - completedTasksArray.length;
}

// REMOVE TASK
todos.addEventListener("click", (e) => {
  if (
    e.target.classList.contains("remove-task") ||
    e.target.parentElement.classList.contains("remove-task") ||
    e.target.parentElement.parentElement.classList.contains("remove-task")
  ) {
    const taskId = e.target.closest("li").id;

    removeTask(taskId);
  }
});

// REMOVE TASK FUNCTION
function removeTask(taskId) {
  tasks = tasks.filter((task) => task.id !== parseInt(taskId));

  localStorage.setItem("tasks", JSON.stringify(tasks));

  document.getElementById(taskId).remove();

  countTasks();
}

// UPDATE TASK
todos.addEventListener("input", (e) => {
  const taskId = e.target.closest("li").id;
  updateTask(taskId, e.target);
});

// UPDATE TASK FUNCTION
function updateTask(taskId, el) {
  const task = tasks.find((task) => task.id === parseInt(taskId));

  if (el.hasAttribute("contenteditable")) {
    task.name = el.textContent;
  } else {
    const span = el.nextElementSibling;
    const parent = el.closest("li");

    task.isCompleted = !task.isCompleted;

    if (task.isCompleted) {
      span.removeAttribute("contenteditable");
      parent.classList.add("complete");
    } else {
      span.setAttribute("contenteditable", "true");
      parent.classList.remove("complete");
    }
  }

  localStorage.setItem("tasks", JSON.stringify(tasks));

  countTasks();
}

// ACTIVE CLASS
filters.forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector("button.active").classList.remove("active");
    btn.classList.add("active");
  });
});

// CLEAR ALL COMPLETED TASKS FUNCTION
const clear = document.querySelector(".clearCompleted");

clear.addEventListener("click", () => {
  // Get all the completed tasks using querySelectorAll method and pass in the CSS selector for completed tasks.
  const completedTasks = document.querySelectorAll(".todos li.complete");

  // Loop through the completed tasks and remove each task from the DOM using the remove method.
  completedTasks.forEach((task) => task.remove());
});

// FILTER TASKS FUNCTION
function filterTasks(filterType) {
  let filteredTasks = [];

  if (filterType == "all") {
    filteredTasks = tasks;
  } else if (filterType === "completed") {
    filteredTasks = tasks.filter((task) => task.isCompleted);
  } else if (filterType === "remain") {
    filteredTasks = tasks.filter((task) => !task.isCompleted);
  }

  // Clear the task list before re-populating it with the filtered tasks
  todos.innerHTML = "";

  // Add each task item to the task list
  filteredTasks.forEach((task) => {
    createTask(task);
  });
}

// Attach event listeners to the filter buttons.
filterAllButton.addEventListener("click", () => filterTasks("all"));
filterCompletedButton.addEventListener("click", () => filterTasks("completed"));
filterRemainButton.addEventListener("click", () => filterTasks("remain"));

// Initialize the task list to show all tasks by default.
filterTasks("all");

// DRAG AND DROP
new Sortable(todos, {
  animation: 200,
  easing: "cubic-bezier(1, 0, 0, 1)",
  preventOnFilter: true,
  ghostClass: "sortable-ghost",
});