function createButton(label, className, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = label;
  button.addEventListener('click', onClick);
  return button;
}

export function createTaskDetailView(task, { onBack, onEdit, onStatusChange, onDelete, errorMessage = '' }) {
  const screen = document.createElement('section');
  screen.className = 'detail-screen task-panel';

  const backButton = createButton('Back', 'button button-secondary back-button', onBack);
  const status = document.createElement('p');
  status.className = `status-label ${task.status === 'done' ? 'status-done' : 'status-pending'}`;
  status.textContent = task.status === 'done' ? 'Done' : 'Pending';
  const heading = document.createElement('h2');
  heading.className = 'detail-title';
  heading.textContent = task.title;
  const description = document.createElement('p');
  description.className = task.description ? 'detail-description' : 'detail-description muted';
  description.textContent = task.description || 'No description';

  if (errorMessage) {
    const message = document.createElement('p');
    message.className = 'form-message';
    message.setAttribute('role', 'alert');
    message.textContent = errorMessage;
    screen.append(message);
  }

  const actions = document.createElement('div');
  actions.className = 'detail-actions';
  const editButton = createButton('Edit', 'button button-primary', onEdit);
  const statusButton = createButton(
    task.status === 'done' ? 'Mark as not done' : 'Mark as done',
    'button button-secondary',
    onStatusChange,
  );
  const deleteButton = createButton('Delete', 'button button-danger', async () => {
    if (window.confirm('Delete this task? This action cannot be undone.')) {
      await onDelete();
    }
  });
  actions.append(editButton, statusButton, deleteButton);
  screen.prepend(backButton);
  screen.append(status, heading, description, actions);
  return screen;
}
