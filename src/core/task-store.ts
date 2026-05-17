import fs from 'fs/promises';
import path from 'path';
import { Task, TaskSchema, TaskStatus } from './types';

export class TaskStore {
  private tasksDir: string;
  
  constructor(baseDir: string = '.ai-sdlc') {
    this.tasksDir = path.join(baseDir, 'tasks');
  }
  
  /**
   * Initialize the task store directory structure
   */
  async initialize(): Promise<void> {
    await fs.mkdir(this.tasksDir, { recursive: true });
  }
  
  /**
   * Create a new task with a unique ID
   */
  async createTask(title: string, description?: string): Promise<Task> {
    const tasks = await this.listTasks();
    const nextId = this.generateNextId(tasks);
    
    const task: Task = {
      id: nextId,
      title,
      description,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      artifacts: {},
    };
    
    await this.saveTask(task);
    return task;
  }
  
  /**
   * Get a task by ID
   */
  async getTask(id: string): Promise<Task | null> {
    try {
      const filePath = path.join(this.tasksDir, `${id}.json`);
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      return TaskSchema.parse(data);
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Update a task with partial data
   */
  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const task = await this.getTask(id);
    if (!task) {
      throw new Error(`Task ${id} not found`);
    }
    
    const updated: Task = {
      ...task,
      ...updates,
      updatedAt: new Date().toISOString(),
      // Merge artifacts if provided
      artifacts: updates.artifacts 
        ? { ...task.artifacts, ...updates.artifacts }
        : task.artifacts,
    };
    
    await this.saveTask(updated);
    return updated;
  }
  
  /**
   * Update task status
   */
  async updateStatus(id: string, status: TaskStatus): Promise<Task> {
    return this.updateTask(id, { status });
  }
  
  /**
   * Save a task to disk
   */
  async saveTask(task: Task): Promise<void> {
    const filePath = path.join(this.tasksDir, `${task.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(task, null, 2));
  }
  
  /**
   * List all tasks, sorted by creation date (newest first)
   */
  async listTasks(): Promise<Task[]> {
    try {
      const files = await fs.readdir(this.tasksDir);
      const tasks: Task[] = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const id = file.replace('.json', '');
          const task = await this.getTask(id);
          if (task) tasks.push(task);
        }
      }
      
      return tasks.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      return [];
    }
  }
  
  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<void> {
    const filePath = path.join(this.tasksDir, `${id}.json`);
    await fs.unlink(filePath);
  }
  
  /**
   * Check if task store is initialized
   */
  async isInitialized(): Promise<boolean> {
    try {
      await fs.access(this.tasksDir);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Generate the next task ID
   */
  private generateNextId(tasks: Task[]): string {
    const numbers = tasks
      .map(t => parseInt(t.id.replace('FEATURE-', '')))
      .filter(n => !isNaN(n));
    
    const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    return `FEATURE-${String(nextNum).padStart(3, '0')}`;
  }
}

// Made with Bob
