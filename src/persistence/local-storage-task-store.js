export const TASKS_STORAGE_KEY = 'curso-pswe-07.tasks';

function isTask(value) {
  return value !== null
    && typeof value === 'object'
    && typeof value.id === 'string'
    && value.id.length > 0
    && typeof value.title === 'string'
    && value.title.trim().length > 0
    && (value.description === undefined || typeof value.description === 'string')
    && (value.status === 'pending' || value.status === 'done')
    && typeof value.createdAt === 'string'
    && !Number.isNaN(Date.parse(value.createdAt));
}

function describeError(error) {
  return error instanceof Error ? error.message : String(error);
}

export function createLocalStorageTaskStore(storageSource = () => globalThis.localStorage) {
  return {
    async loadTasks() {
      let serialized;
      try {
        const storage = typeof storageSource === 'function' ? storageSource() : storageSource;
        serialized = storage.getItem(TASKS_STORAGE_KEY);
      } catch (error) {
        throw new Error(`Saved tasks could not be read: ${describeError(error)}`, { cause: error });
      }

      if (serialized === null) {
        return [];
      }

      let tasks;
      try {
        tasks = JSON.parse(serialized);
      } catch (error) {
        throw new Error(`Stored tasks are malformed: ${describeError(error)}`, { cause: error });
      }

      if (!Array.isArray(tasks) || !tasks.every(isTask)) {
        throw new Error('Stored tasks are malformed: expected an array of valid tasks.');
      }

      return tasks.map((task) => ({ ...task, description: task.description ?? '' }));
    },

    async saveTasks(tasks) {
      try {
        const storage = typeof storageSource === 'function' ? storageSource() : storageSource;
        storage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
      } catch (error) {
        throw new Error(`Tasks could not be saved: ${describeError(error)}`, { cause: error });
      }
    },
  };
}
