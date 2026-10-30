import { createTaskService } from './application/task-service.js';
import { createLocalStorageTaskStore } from './persistence/local-storage-task-store.js';
import { createTaskDetailView } from './ui/task-detail-view.js';
import { createTaskForm } from './ui/task-form.js';
import { createTaskListView } from './ui/task-list-view.js';
import './styles.css';

document.title = 'Curso-PSWE-07';

const app = document.querySelector('#app');
const taskStore = createLocalStorageTaskStore();
let taskService;
let activeFilter = 'all';
let selectedTaskId = null;
let detailError = '';

function renderList() {
  app.replaceChildren(createTaskListView({
    tasks: taskService.getVisibleTasks(activeFilter),
    filter: activeFilter,
    onFilterChange(filter) {
      activeFilter = filter;
      renderList();
    },
    onAddTask() {
      renderForm();
    },
    onOpenTask(id) {
      selectedTaskId = id;
      detailError = '';
      renderDetail();
    },
  }));
}

function renderForm(task = null) {
  app.replaceChildren(createTaskForm({
    task,
    onCancel() {
      if (task) {
        renderDetail();
      } else {
        renderList();
      }
    },
    async onSave(values) {
      if (task) {
        await taskService.updateTask(task.id, values);
        renderDetail();
      } else {
        await taskService.createTask(values);
        renderList();
      }
    },
  }));
}

function renderDetail() {
  const task = taskService.getTask(selectedTaskId);
  if (!task) {
    selectedTaskId = null;
    renderList();
    return;
  }
  app.replaceChildren(createTaskDetailView(task, {
    errorMessage: detailError,
    onBack() {
      selectedTaskId = null;
      detailError = '';
      renderList();
    },
    onEdit() {
      renderForm(task);
    },
    async onStatusChange() {
      try {
        await taskService.setStatus(task.id, task.status === 'done' ? 'pending' : 'done');
        detailError = '';
      } catch (error) {
        detailError = `The change was not saved. ${error.message}`;
      }
      renderDetail();
    },
    async onDelete() {
      try {
        await taskService.deleteTask(task.id);
        selectedTaskId = null;
        detailError = '';
        renderList();
      } catch (error) {
        detailError = `The task was not deleted. ${error.message}`;
        renderDetail();
      }
    },
  }));
}

async function loadApplication() {
  app.replaceChildren();
  const loading = document.createElement('p');
  loading.className = 'loading-message';
  loading.textContent = 'Loading tasks…';
  app.append(loading);

  try {
    const tasks = await taskStore.loadTasks();
    taskService = createTaskService({ taskStore, initialTasks: tasks });
    renderList();
  } catch (error) {
    const screen = document.createElement('section');
    screen.className = 'task-panel load-error';
    screen.setAttribute('aria-labelledby', 'app-heading');
    const heading = document.createElement('h1');
    heading.id = 'app-heading';
    heading.textContent = 'Curso-PSWE-07';
    const message = document.createElement('p');
    message.setAttribute('role', 'alert');
    message.textContent = `Saved tasks could not load. ${error.message}`;
    const retryButton = document.createElement('button');
    retryButton.type = 'button';
    retryButton.className = 'button button-primary';
    retryButton.textContent = 'Retry';
    retryButton.addEventListener('click', loadApplication);
    screen.append(heading, message, retryButton);
    app.replaceChildren(screen);
  }
}

loadApplication();
