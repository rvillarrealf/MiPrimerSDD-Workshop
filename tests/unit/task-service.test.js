import assert from 'node:assert/strict';
import test from 'node:test';
import { createTaskService } from '../../src/application/task-service.js';

function createStore() {
  let savedTasks = [];

  return {
    loadTasks: async () => savedTasks,
    saveTasks: async (tasks) => {
      savedTasks = structuredClone(tasks);
    },
  };
}

test('creates trimmed pending tasks with unique identity and ISO timestamps', async () => {
  let id = 0;
  const service = createTaskService({
    taskStore: createStore(),
    now: () => new Date('2026-10-29T12:00:00.000Z'),
    createId: () => `task-${++id}`,
  });

  const first = await service.createTask({ title: '  Read  ', description: '  Book  ' });
  const second = await service.createTask({ title: 'Read' });

  assert.equal(first.title, 'Read');
  assert.equal(first.description, '  Book  ');
  assert.equal(first.status, 'pending');
  assert.equal(first.createdAt, '2026-10-29T12:00:00.000Z');
  assert.notEqual(first.id, second.id);
  assert.deepEqual(service.getTasks().map(({ id: taskId }) => taskId), ['task-1', 'task-2']);
});

test('rejects whitespace-only titles', async () => {
  const service = createTaskService({ taskStore: createStore() });

  await assert.rejects(service.createTask({ title: '   ' }), /title/i);
});

test('sorts newest first and preserves relative order for equal timestamps', async () => {
  let timestamp = 0;
  let id = 0;
  const service = createTaskService({
    taskStore: createStore(),
    now: () => new Date(Date.UTC(2026, 9, 29, 12, 0, timestamp++)),
    createId: () => `task-${++id}`,
  });

  await service.createTask({ title: 'First' });
  await service.createTask({ title: 'Second' });
  await service.createTask({ title: 'Third' });

  assert.deepEqual(service.getTasks().map(({ title }) => title), ['Third', 'Second', 'First']);
});

test('filters all, pending, and done tasks', async () => {
  const service = createTaskService({ taskStore: createStore() });
  const pending = await service.createTask({ title: 'Pending' });
  const done = await service.createTask({ title: 'Done' });
  await service.setStatus(done.id, 'done');

  assert.deepEqual(
    service.getVisibleTasks('all').map(({ id }) => id).sort(),
    [pending.id, done.id].sort(),
  );
  assert.deepEqual(service.getVisibleTasks('pending').map(({ id }) => id), [pending.id]);
  assert.deepEqual(service.getVisibleTasks('done').map(({ id }) => id), [done.id]);
});

test('updates and deletes tasks only after persistence succeeds', async () => {
  const service = createTaskService({ taskStore: createStore() });
  const task = await service.createTask({ title: 'Original' });

  const updated = await service.updateTask(task.id, { title: 'Updated', description: 'Details' });
  assert.equal(updated.title, 'Updated');
  assert.equal(updated.description, 'Details');
  await service.deleteTask(task.id);
  assert.deepEqual(service.getTasks(), []);
});

test('preserves the last saved task state when an update or deletion write fails', async () => {
  let failWrites = false;
  const taskStore = {
    loadTasks: async () => [],
    saveTasks: async () => {
      if (failWrites) {
        throw new Error('Storage unavailable');
      }
    },
  };
  const service = createTaskService({ taskStore });
  const task = await service.createTask({ title: 'Saved' });
  failWrites = true;

  await assert.rejects(service.updateTask(task.id, { title: 'Unsaved' }), /storage unavailable/i);
  await assert.rejects(service.setStatus(task.id, 'done'), /storage unavailable/i);
  await assert.rejects(service.deleteTask(task.id), /storage unavailable/i);
  assert.deepEqual(service.getTasks(), [task]);
});

test('initializes from loaded tasks while preserving identity and newest-first ordering', async () => {
  const loadedTasks = [
    { id: 'older', title: 'Older', description: '', status: 'pending', createdAt: '2026-10-28T12:00:00.000Z' },
    { id: 'newer', title: 'Newer', description: '', status: 'done', createdAt: '2026-10-29T12:00:00.000Z' },
  ];
  const service = createTaskService({ taskStore: createStore(), initialTasks: loadedTasks });

  assert.deepEqual(service.getTasks().map(({ id }) => id), ['newer', 'older']);
  assert.equal(service.getTask('older'), loadedTasks[0]);
  assert.equal(service.getTask('newer'), loadedTasks[1]);
});
