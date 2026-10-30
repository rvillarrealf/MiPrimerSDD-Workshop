function createButton(label, className, onClick) {
  const button = document.createElement('button');
  button.className = className;
  button.type = 'button';
  button.textContent = label;
  button.addEventListener('click', onClick);
  return button;
}

export function createTaskListView({ tasks, filter, onFilterChange, onAddTask, onOpenTask }) {
  const screen = document.createElement('section');
  screen.className = 'list-screen';

  const header = document.createElement('header');
  header.className = 'app-header';
  const heading = document.createElement('h1');
  heading.textContent = 'Curso-PSWE-07';
  header.append(heading, createButton('Add task', 'button button-primary add-task-button', onAddTask));

  const filters = document.createElement('nav');
  filters.className = 'filter-list';
  filters.setAttribute('aria-label', 'Filter tasks');
  for (const option of ['all', 'pending', 'done']) {
    const label = option[0].toUpperCase() + option.slice(1);
    const button = createButton(
      label,
      `filter-button${filter === option ? ' is-active' : ''}`,
      () => onFilterChange(option),
    );
    button.setAttribute('aria-pressed', String(filter === option));
    filters.append(button);
  }

  const taskList = document.createElement('div');
  taskList.className = 'task-list';
  taskList.setAttribute('aria-live', 'polite');
  if (tasks.length === 0) {
    const emptyState = document.createElement('p');
    emptyState.className = 'empty-state';
    emptyState.textContent = filter === 'all'
      ? 'No tasks yet. Add one to get started.'
      : `Nothing here yet. No ${filter} tasks match this filter.`;
    taskList.append(emptyState);
  } else {
    for (const task of tasks) {
      const row = createButton(
        '',
        `task-row${task.status === 'done' ? ' is-done' : ''}`,
        () => onOpenTask(task.id),
      );
      row.dataset.taskRow = '';
      row.setAttribute('aria-label', `${task.title}, ${task.status === 'done' ? 'Done' : 'Pending'}`);

      const indicator = document.createElement('span');
      indicator.className = 'status-indicator';
      indicator.setAttribute('aria-hidden', 'true');
      const content = document.createElement('span');
      content.className = 'task-row-content';
      const title = document.createElement('span');
      title.className = 'task-title';
      title.textContent = task.title;
      const status = document.createElement('span');
      status.className = 'task-row-status';
      status.textContent = task.status === 'done' ? 'Done' : 'Pending';
      content.append(title, status);
      row.append(indicator, content);
      taskList.append(row);
    }
  }

  screen.append(header, filters, taskList);
  return screen;
}
