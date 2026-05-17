import fs from 'fs/promises';
import path from 'path';
import { TaskStore } from '../../src/core/task-store';

describe('TaskStore', () => {
  const testDir = path.join(__dirname, '../.test-data');
  let taskStore: TaskStore;

  beforeEach(async () => {
    // Create test directory
    await fs.mkdir(testDir, { recursive: true });
    taskStore = new TaskStore(testDir);
    await taskStore.initialize();
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('initialize', () => {
    it('should create tasks directory', async () => {
      const tasksDir = path.join(testDir, 'tasks');
      const exists = await fs.access(tasksDir).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    });
  });

  describe('createTask', () => {
    it('should create task with unique ID', async () => {
      const task = await taskStore.createTask('Test feature');
      
      expect(task.id).toMatch(/^FEATURE-\d{3}$/);
      expect(task.title).toBe('Test feature');
      expect(task.status).toBe('draft');
      expect(task.createdAt).toBeDefined();
      expect(task.updatedAt).toBeDefined();
    });

    it('should create task with description', async () => {
      const task = await taskStore.createTask('Test feature', 'Test description');
      
      expect(task.description).toBe('Test description');
    });

    it('should generate sequential IDs', async () => {
      const task1 = await taskStore.createTask('Feature 1');
      const task2 = await taskStore.createTask('Feature 2');
      
      expect(task1.id).toBe('FEATURE-001');
      expect(task2.id).toBe('FEATURE-002');
    });
  });

  describe('getTask', () => {
    it('should retrieve existing task', async () => {
      const created = await taskStore.createTask('Test feature');
      const retrieved = await taskStore.getTask(created.id);
      
      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.title).toBe(created.title);
    });

    it('should return null for non-existent task', async () => {
      const task = await taskStore.getTask('FEATURE-999');
      expect(task).toBeNull();
    });
  });

  describe('updateTask', () => {
    it('should update task properties', async () => {
      const task = await taskStore.createTask('Test feature');
      
      const updated = await taskStore.updateTask(task.id, {
        status: 'ready',
        description: 'Updated description',
      });
      
      expect(updated.status).toBe('ready');
      expect(updated.description).toBe('Updated description');
      expect(updated.updatedAt).not.toBe(task.updatedAt);
    });

    it('should merge artifacts', async () => {
      const task = await taskStore.createTask('Test feature');
      
      await taskStore.updateTask(task.id, {
        artifacts: {
          requirements: {
            userStory: 'As a user...',
            acceptanceCriteria: ['Criterion 1'],
            technicalRequirements: ['Requirement 1'],
            dependencies: [],
            estimatedComplexity: 'low',
          },
        },
      });
      
      const updated = await taskStore.getTask(task.id);
      expect(updated?.artifacts.requirements).toBeDefined();
      expect(updated?.artifacts.requirements?.userStory).toBe('As a user...');
    });

    it('should throw error for non-existent task', async () => {
      await expect(
        taskStore.updateTask('FEATURE-999', { status: 'ready' })
      ).rejects.toThrow('Task FEATURE-999 not found');
    });
  });

  describe('updateStatus', () => {
    it('should update task status', async () => {
      const task = await taskStore.createTask('Test feature');
      
      const updated = await taskStore.updateStatus(task.id, 'analyzing');
      
      expect(updated.status).toBe('analyzing');
    });
  });

  describe('listTasks', () => {
    it('should return empty array when no tasks', async () => {
      const tasks = await taskStore.listTasks();
      expect(tasks).toEqual([]);
    });

    it('should list all tasks', async () => {
      await taskStore.createTask('Feature 1');
      await taskStore.createTask('Feature 2');
      await taskStore.createTask('Feature 3');
      
      const tasks = await taskStore.listTasks();
      expect(tasks).toHaveLength(3);
    });

    it('should sort tasks by creation date (newest first)', async () => {
      const task1 = await taskStore.createTask('Feature 1');
      await new Promise(resolve => setTimeout(resolve, 10));
      const task2 = await taskStore.createTask('Feature 2');
      await new Promise(resolve => setTimeout(resolve, 10));
      const task3 = await taskStore.createTask('Feature 3');
      
      const tasks = await taskStore.listTasks();
      expect(tasks[0].id).toBe(task3.id);
      expect(tasks[1].id).toBe(task2.id);
      expect(tasks[2].id).toBe(task1.id);
    });
  });

  describe('deleteTask', () => {
    it('should delete existing task', async () => {
      const task = await taskStore.createTask('Test feature');
      
      await taskStore.deleteTask(task.id);
      
      const retrieved = await taskStore.getTask(task.id);
      expect(retrieved).toBeNull();
    });
  });

  describe('isInitialized', () => {
    it('should return true when initialized', async () => {
      const initialized = await taskStore.isInitialized();
      expect(initialized).toBe(true);
    });

    it('should return false when not initialized', async () => {
      const newStore = new TaskStore(path.join(testDir, 'non-existent'));
      const initialized = await newStore.isInitialized();
      expect(initialized).toBe(false);
    });
  });
});

// Made with Bob
