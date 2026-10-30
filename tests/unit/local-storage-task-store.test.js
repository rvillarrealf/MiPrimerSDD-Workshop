import assert from 'node:assert/strict';
import test from 'node:test';
import { createLocalStorageTaskStore, TASKS_STORAGE_KEY } from '../../src/persistence/local-storage-task-store.js';

function createStorage(initialValue = null) {
  let value = initialValue;

  return {
    getItem: () => value,
    setItem: (_key, nextValue) => {
      value = nextValue;
    },
    readValue: () => value,
  };
}

test('serializes tasks as JSON and loads them again', async () => {
  const storage = createStorage();
  const store = createLocalStorageTaskStore(storage);
  const tasks = [{ id: 'one', title: 'Task', description: '', status: 'pending', createdAt: '2026-10-29T12:00:00.000Z' }];

  await store.saveTasks(tasks);

  assert.equal(storage.readValue(), JSON.stringify(tasks));
  assert.deepEqual(await store.loadTasks(), tasks);
});

test('loads an empty collection when no value has been stored', async () => {
  const store = createLocalStorageTaskStore(createStorage());

  assert.deepEqual(await store.loadTasks(), []);
});

test('surfaces storage write failures', async () => {
  const store = createLocalStorageTaskStore({
    getItem: () => null,
    setItem: () => {
      throw new Error('Quota exceeded');
    },
  });

  await assert.rejects(store.saveTasks([]), /quota exceeded/i);
});

test('surfaces read failures', async () => {
  const store = createLocalStorageTaskStore({
    getItem: () => {
      throw new Error('Storage unavailable');
    },
    setItem: () => {},
  });

  await assert.rejects(store.loadTasks(), /storage unavailable/i);
});

test('surfaces failures while obtaining the storage implementation', async () => {
  const store = createLocalStorageTaskStore(() => {
    throw new Error('Storage access denied');
  });

  await assert.rejects(store.loadTasks(), /storage access denied/i);
});

test('does not overwrite malformed stored data', async () => {
  const storage = createStorage('{malformed');
  const store = createLocalStorageTaskStore(storage);

  await assert.rejects(store.loadTasks(), /stored tasks/i);
  assert.equal(storage.readValue(), '{malformed');
  assert.equal(TASKS_STORAGE_KEY, 'curso-pswe-07.tasks');
});

test('rejects malformed task records without overwriting the stored value', async () => {
  const serialized = '[{"id":"task","title":" ","status":"unknown"}]';
  const storage = createStorage(serialized);
  const store = createLocalStorageTaskStore(storage);

  await assert.rejects(store.loadTasks(), /stored tasks are malformed/i);
  assert.equal(storage.readValue(), serialized);
});
