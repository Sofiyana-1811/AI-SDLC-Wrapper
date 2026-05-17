import { AccumulatedContext, ContextMetadata } from './types';
import { TaskStore } from './task-store';

/**
 * ContextManager handles accumulation and reuse of context across SDLC stages.
 * It stores context with metadata to track source, timing, and reusability.
 */
export class ContextManager {
  private store: TaskStore;
  
  constructor(store: TaskStore) {
    this.store = store;
  }
  
  /**
   * Store context with metadata
   */
  async storeContext(
    taskId: string,
    contextKey: keyof AccumulatedContext,
    data: any,
    metadata: Omit<ContextMetadata, 'gatheredAt'>
  ): Promise<void> {
    const task = await this.store.getTask(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);
    
    const fullMetadata: ContextMetadata = {
      ...metadata,
      gatheredAt: new Date().toISOString(),
    };
    
    // Initialize accumulatedContext if it doesn't exist
    const accumulatedContext = task.accumulatedContext || {};
    
    await this.store.updateTask(taskId, {
      accumulatedContext: {
        ...accumulatedContext,
        [contextKey]: data,
        [`${contextKey}Meta`]: fullMetadata,
      },
    });
  }
  
  /**
   * Get context if it exists and is reusable
   */
  async getContext<T>(
    taskId: string,
    contextKey: keyof AccumulatedContext
  ): Promise<T | null> {
    const task = await this.store.getTask(taskId);
    if (!task) return null;
    
    // Try new accumulated context first
    if (task.accumulatedContext) {
      const data = task.accumulatedContext[contextKey];
      const metaKey = `${contextKey}Meta` as keyof AccumulatedContext;
      const meta = task.accumulatedContext[metaKey] as ContextMetadata | undefined;
      
      // Check if context exists and is reusable
      if (data && meta?.reusable) {
        return data as T;
      }
    }
    
    // Fall back to legacy artifacts for backward compatibility
    if (task.artifacts) {
      const legacyKey = contextKey === 'repository' ? 'repoContext' : contextKey;
      const legacyData = task.artifacts[legacyKey as keyof typeof task.artifacts];
      if (legacyData) {
        return legacyData as T;
      }
    }
    
    return null;
  }
  
  /**
   * Check if context exists
   */
  async hasContext(
    taskId: string,
    contextKey: keyof AccumulatedContext
  ): Promise<boolean> {
    const context = await this.getContext(taskId, contextKey);
    return context !== null;
  }
  
  /**
   * Get all accumulated context for a task
   */
  async getAllContext(taskId: string): Promise<AccumulatedContext | null> {
    const task = await this.store.getTask(taskId);
    if (!task) return null;
    
    // Return new format if available
    if (task.accumulatedContext && Object.keys(task.accumulatedContext).length > 0) {
      return task.accumulatedContext;
    }
    
    // Migrate from legacy artifacts if needed
    if (task.artifacts && Object.keys(task.artifacts).length > 0) {
      const migratedContext: AccumulatedContext = {
        requirements: task.artifacts.requirements,
        repository: task.artifacts.repoContext,
        implementationPlan: task.artifacts.implementationPlan,
        codeChanges: task.artifacts.codeChanges,
        reviewReport: task.artifacts.reviewReport,
        prDescription: task.artifacts.prDescription,
      };
      return migratedContext;
    }
    
    return null;
  }
  
  /**
   * Calculate total token usage from accumulated context
   */
  async getTokenUsage(taskId: string): Promise<number> {
    const task = await this.store.getTask(taskId);
    if (!task || !task.accumulatedContext) return 0;
    
    let total = 0;
    const context = task.accumulatedContext;
    
    // Sum up all token estimates from metadata
    Object.keys(context).forEach(key => {
      if (key.endsWith('Meta')) {
        const meta = context[key as keyof AccumulatedContext];
        if (meta && typeof meta === 'object' && 'tokenEstimate' in meta) {
          total += (meta as ContextMetadata).tokenEstimate;
        }
      }
    });
    
    return total;
  }
  
  /**
   * Get context metadata
   */
  async getContextMetadata(
    taskId: string,
    contextKey: keyof AccumulatedContext
  ): Promise<ContextMetadata | null> {
    const task = await this.store.getTask(taskId);
    if (!task || !task.accumulatedContext) return null;
    
    const metaKey = `${contextKey}Meta` as keyof AccumulatedContext;
    const meta = task.accumulatedContext[metaKey];
    
    if (meta && typeof meta === 'object' && 'source' in meta) {
      return meta as ContextMetadata;
    }
    
    return null;
  }
  
  /**
   * Clear specific context (useful for invalidation)
   */
  async clearContext(
    taskId: string,
    contextKey: keyof AccumulatedContext
  ): Promise<void> {
    const task = await this.store.getTask(taskId);
    if (!task || !task.accumulatedContext) return;
    
    // Check if the context key exists before clearing
    if (!(contextKey in task.accumulatedContext)) return;
    
    const accumulatedContext = { ...task.accumulatedContext };
    delete accumulatedContext[contextKey];
    
    const metaKey = `${contextKey}Meta` as keyof AccumulatedContext;
    delete accumulatedContext[metaKey];
    
    await this.store.updateTask(taskId, {
      accumulatedContext,
    });
  }
}

// Made with Bob
