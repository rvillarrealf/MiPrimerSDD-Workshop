/**
 * @typedef {object} TaskStore
 * @property {() => Promise<Array<{id: string, title: string, description: string, status: 'pending' | 'done', createdAt: string}>>} loadTasks
 * @property {(tasks: Array<{id: string, title: string, description: string, status: 'pending' | 'done', createdAt: string}>) => Promise<void>} saveTasks
 */

export {};
