function sortNewestFirst(tasks) {
  return tasks
    .map((task, index) => ({ task, index }))
    .sort((left, right) => {
      const difference = Date.parse(right.task.createdAt) - Date.parse(left.task.createdAt);
      return difference || left.index - right.index;
    })
    .map(({ task }) => task);
}

function requireTitle(title) {
  if (typeof title !== 'string' || title.trim().length === 0) {
    throw new Error('A task title is required.');
  }
  return title.trim();
}

export function createTaskService({
  taskStore,
  initialTasks = [],
  now = () => new Date(),
  createId = () => globalThis.crypto.randomUUID(),
}) {
  if (!taskStore) {
    throw new TypeError('A task store is required.');
  }

  let tasks = sortNewestFirst(initialTasks.slice());

  async function persist(nextTasks) {
    await taskStore.saveTasks(nextTasks);
    tasks = sortNewestFirst(nextTasks);
  }

  return {
    getTasks() {
      return tasks.slice();
    },

    getTask(id) {
      return tasks.find((task) => task.id === id);
    },

    getVisibleTasks(filter = 'all') {
      if (!['all', 'pending', 'done'].includes(filter)) {
        throw new Error(`Unknown task filter: ${filter}`);
      }
      return tasks.filter((task) => filter === 'all' || task.status === filter);
    },

    async createTask({ title, description = '' }) {
      const task = {
        id: createId(),
        title: requireTitle(title),
        description,
        status: 'pending',
        createdAt: now().toISOString(),
      };
      await persist([...tasks, task]);
      return task;
    },

    async updateTask(id, { title, description = '' }) {
      const currentTask = this.getTask(id);
      if (!currentTask) {
        throw new Error('The task no longer exists.');
      }
      const updatedTask = {
        ...currentTask,
        title: requireTitle(title),
        description,
      };
      await persist(tasks.map((task) => (task.id === id ? updatedTask : task)));
      return updatedTask;
    },

    async setStatus(id, status) {
      if (status !== 'pending' && status !== 'done') {
        throw new Error('Task status must be pending or done.');
      }
      const currentTask = this.getTask(id);
      if (!currentTask) {
        throw new Error('The task no longer exists.');
      }
      const updatedTask = { ...currentTask, status };
      await persist(tasks.map((task) => (task.id === id ? updatedTask : task)));
      return updatedTask;
    },

    async deleteTask(id) {
      if (!this.getTask(id)) {
        throw new Error('The task no longer exists.');
      }
      await persist(tasks.filter((task) => task.id !== id));
    },
  };
}
