export function createTaskForm({ task, onSave, onCancel }) {
  const section = document.createElement('section');
  section.className = 'task-panel form-panel';
  section.setAttribute('aria-labelledby', 'task-form-heading');

  const heading = document.createElement('h2');
  heading.id = 'task-form-heading';
  heading.textContent = task ? 'Edit task' : 'Add task';

  const form = document.createElement('form');
  form.className = 'task-form';
  const titleLabel = document.createElement('label');
  titleLabel.htmlFor = 'task-title';
  titleLabel.textContent = 'Title';
  const titleInput = document.createElement('input');
  titleInput.id = 'task-title';
  titleInput.name = 'title';
  titleInput.type = 'text';
  titleInput.autocomplete = 'off';
  titleInput.setAttribute('aria-required', 'true');
  titleInput.value = task?.title ?? '';

  const descriptionLabel = document.createElement('label');
  descriptionLabel.htmlFor = 'task-description';
  descriptionLabel.textContent = 'Description';
  const descriptionInput = document.createElement('textarea');
  descriptionInput.id = 'task-description';
  descriptionInput.name = 'description';
  descriptionInput.rows = 5;
  descriptionInput.value = task?.description ?? '';

  const message = document.createElement('p');
  message.className = 'form-message';
  message.setAttribute('role', 'alert');
  message.hidden = true;

  const actions = document.createElement('div');
  actions.className = 'form-actions';
  const saveButton = document.createElement('button');
  saveButton.className = 'button button-primary';
  saveButton.type = 'submit';
  saveButton.textContent = 'Save';
  const cancelButton = document.createElement('button');
  cancelButton.className = 'button button-secondary';
  cancelButton.type = 'button';
  cancelButton.textContent = 'Cancel';
  cancelButton.addEventListener('click', onCancel);
  actions.append(saveButton, cancelButton);

  form.append(titleLabel, titleInput, descriptionLabel, descriptionInput, message, actions);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    message.hidden = true;
    if (!titleInput.value.trim()) {
      message.textContent = 'Title is required.';
      message.hidden = false;
      titleInput.focus();
      return;
    }

    saveButton.disabled = true;
    try {
      await onSave({ title: titleInput.value, description: descriptionInput.value });
    } catch (error) {
      message.textContent = `This task was not saved. ${error.message}`;
      message.hidden = false;
    } finally {
      saveButton.disabled = false;
    }
  });

  section.append(heading, form);
  return section;
}
