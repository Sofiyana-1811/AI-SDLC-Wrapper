import { ContextManager } from '../../src/core/context-manager';
import { TaskStore } from '../../src/core/task-store';
import { Task, AccumulatedContext, ContextMetadata } from '../../src/core/types';

// Mock TaskStore
jest.mock('../../src/core/task-store');

describe('ContextManager', () => {
  let contextManager: ContextManager;
  let mockStore: jest.Mocked<TaskStore>;
  let mockTask: Task;

  beforeEach(() => {
    mockStore = new TaskStore() as jest.Mocked<TaskStore>;
    contextManager = new ContextManager(mockStore);

    // Create a mock task
    mockTask = {
      id: 'test-task-1',
      title: 'Test Task',
      description: 'Test description',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      accumulatedContext: {},
    };
  });

  describe('storeContext', () => {
    it('should store context with metadata', async () => {
      mockStore.getTask.mockResolvedValue(mockTask);
      mockStore.updateTask.mockResolvedValue(mockTask);

      const testData: any = { test: 'data' };
      const metadata: Omit<ContextMetadata, 'gatheredAt'> = {
        source: 'TestSource',
        stage: 'analyze',
        tokenEstimate: 100,
        reusable: true,
      };

      await contextManager.storeContext('test-task-1', 'repository', testData, metadata);

      expect(mockStore.updateTask).toHaveBeenCalledWith('test-task-1', {
        accumulatedContext: expect.objectContaining({
          repository: testData,
          repositoryMeta: expect.objectContaining({
            source: 'TestSource',
            stage: 'analyze',
            tokenEstimate: 100,
            reusable: true,
            gatheredAt: expect.any(String),
          }),
        }),
      });
    });

    it('should throw error for non-existent task', async () => {
      mockStore.getTask.mockResolvedValue(null);

      await expect(
        contextManager.storeContext('non-existent', 'repository', {}, {
          source: 'Test',
          stage: 'analyze',
          tokenEstimate: 0,
          reusable: true,
        })
      ).rejects.toThrow('Task non-existent not found');
    });

    it('should preserve existing context when adding new context', async () => {
      const existingContext: AccumulatedContext = {
        requirements: { 
          userStory: 'test',
          acceptanceCriteria: [],
          technicalRequirements: [],
          dependencies: [],
          estimatedComplexity: 'low',
        },
      };
      
      mockTask.accumulatedContext = existingContext;
      mockStore.getTask.mockResolvedValue(mockTask);
      mockStore.updateTask.mockResolvedValue(mockTask);

      await contextManager.storeContext('test-task-1', 'repository', { test: 'data' } as any, {
        source: 'Test',
        stage: 'analyze',
        tokenEstimate: 100,
        reusable: true,
      });

      expect(mockStore.updateTask).toHaveBeenCalledWith('test-task-1', {
        accumulatedContext: expect.objectContaining({
          requirements: existingContext.requirements,
          repository: { test: 'data' } as any,
        }),
      });
    });
  });

  describe('getContext', () => {
    it('should return context if it exists and is reusable', async () => {
      const testData: any = { test: 'data' };
      mockTask.accumulatedContext = {
        repository: testData as any,
        repositoryMeta: {
          source: 'Test',
          stage: 'analyze',
          tokenEstimate: 100,
          reusable: true,
          gatheredAt: new Date().toISOString(),
        },
      };
      mockStore.getTask.mockResolvedValue(mockTask);

      const result = await contextManager.getContext('test-task-1', 'repository');

      expect(result).toEqual(testData);
    });

    it('should return null if context is not reusable', async () => {
      mockTask.accumulatedContext = {
        repository: { test: 'data' } as any,
        repositoryMeta: {
          source: 'Test',
          stage: 'analyze',
          tokenEstimate: 100,
          reusable: false,
          gatheredAt: new Date().toISOString(),
        },
      };
      mockStore.getTask.mockResolvedValue(mockTask);

      const result = await contextManager.getContext('test-task-1', 'repository');

      expect(result).toBeNull();
    });

    it('should return null if context does not exist', async () => {
      mockStore.getTask.mockResolvedValue(mockTask);

      const result = await contextManager.getContext('test-task-1', 'repository');

      expect(result).toBeNull();
    });

    it('should fall back to legacy artifacts', async () => {
      const legacyData: any = { test: 'legacy' };
      mockTask.artifacts = {
        repoContext: legacyData as any,
      };
      mockStore.getTask.mockResolvedValue(mockTask);

      const result = await contextManager.getContext('test-task-1', 'repository');

      expect(result).toEqual(legacyData);
    });

    it('should return null for non-existent task', async () => {
      mockStore.getTask.mockResolvedValue(null);

      const result = await contextManager.getContext('non-existent', 'repository');

      expect(result).toBeNull();
    });
  });

  describe('hasContext', () => {
    it('should return true if context exists', async () => {
      mockTask.accumulatedContext = {
        repository: { test: 'data' } as any,
        repositoryMeta: {
          source: 'Test',
          stage: 'analyze',
          tokenEstimate: 100,
          reusable: true,
          gatheredAt: new Date().toISOString(),
        },
      };
      mockStore.getTask.mockResolvedValue(mockTask);

      const result = await contextManager.hasContext('test-task-1', 'repository');

      expect(result).toBe(true);
    });

    it('should return false if context does not exist', async () => {
      mockStore.getTask.mockResolvedValue(mockTask);

      const result = await contextManager.hasContext('test-task-1', 'repository');

      expect(result).toBe(false);
    });
  });

  describe('getAllContext', () => {
    it('should return all accumulated context', async () => {
      const context: AccumulatedContext = {
        repository: { test: 'data' } as any,
        requirements: {
          userStory: 'test',
          acceptanceCriteria: [],
          technicalRequirements: [],
          dependencies: [],
          estimatedComplexity: 'low',
        },
      };
      mockTask.accumulatedContext = context;
      mockStore.getTask.mockResolvedValue(mockTask);

      const result = await contextManager.getAllContext('test-task-1');

      expect(result).toEqual(context);
    });

    it('should migrate from legacy artifacts', async () => {
      mockTask.artifacts = {
        repoContext: { test: 'legacy' } as any,
        requirements: {
          userStory: 'test',
          acceptanceCriteria: [],
          technicalRequirements: [],
          dependencies: [],
          estimatedComplexity: 'low',
        },
      };
      mockStore.getTask.mockResolvedValue(mockTask);

      const result = await contextManager.getAllContext('test-task-1');

      expect(result).toEqual({
        repository: { test: 'legacy' } as any,
        requirements: mockTask.artifacts?.requirements,
        implementationPlan: undefined,
        codeChanges: undefined,
        reviewReport: undefined,
        prDescription: undefined,
      });
    });

    it('should return null for non-existent task', async () => {
      mockStore.getTask.mockResolvedValue(null);

      const result = await contextManager.getAllContext('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getTokenUsage', () => {
    it('should calculate total token usage', async () => {
      mockTask.accumulatedContext = {
        repository: { test: 'data' } as any,
        repositoryMeta: {
          source: 'Test',
          stage: 'analyze',
          tokenEstimate: 100,
          reusable: true,
          gatheredAt: new Date().toISOString(),
        },
        requirements: {
          userStory: 'test',
          acceptanceCriteria: [],
          technicalRequirements: [],
          dependencies: [],
          estimatedComplexity: 'low',
        },
        requirementsMeta: {
          source: 'Test',
          stage: 'analyze',
          tokenEstimate: 200,
          reusable: true,
          gatheredAt: new Date().toISOString(),
        },
      };
      mockStore.getTask.mockResolvedValue(mockTask);

      const result = await contextManager.getTokenUsage('test-task-1');

      expect(result).toBe(300);
    });

    it('should return 0 for task without context', async () => {
      mockStore.getTask.mockResolvedValue(mockTask);

      const result = await contextManager.getTokenUsage('test-task-1');

      expect(result).toBe(0);
    });

    it('should return 0 for non-existent task', async () => {
      mockStore.getTask.mockResolvedValue(null);

      const result = await contextManager.getTokenUsage('non-existent');

      expect(result).toBe(0);
    });
  });

  describe('getContextMetadata', () => {
    it('should return metadata for existing context', async () => {
      const metadata: ContextMetadata = {
        source: 'Test',
        stage: 'analyze',
        tokenEstimate: 100,
        reusable: true,
        gatheredAt: new Date().toISOString(),
      };
      mockTask.accumulatedContext = {
        repository: { test: 'data' } as any,
        repositoryMeta: metadata,
      };
      mockStore.getTask.mockResolvedValue(mockTask);

      const result = await contextManager.getContextMetadata('test-task-1', 'repository');

      expect(result).toEqual(metadata);
    });

    it('should return null if metadata does not exist', async () => {
      mockStore.getTask.mockResolvedValue(mockTask);

      const result = await contextManager.getContextMetadata('test-task-1', 'repository');

      expect(result).toBeNull();
    });
  });

  describe('clearContext', () => {
    it('should clear specific context and its metadata', async () => {
      mockTask.accumulatedContext = {
        repository: { test: 'data' } as any,
        repositoryMeta: {
          source: 'Test',
          stage: 'analyze',
          tokenEstimate: 100,
          reusable: true,
          gatheredAt: new Date().toISOString(),
        },
        requirements: {
          userStory: 'test',
          acceptanceCriteria: [],
          technicalRequirements: [],
          dependencies: [],
          estimatedComplexity: 'low',
        },
      };
      mockStore.getTask.mockResolvedValue(mockTask);
      mockStore.updateTask.mockResolvedValue(mockTask);

      await contextManager.clearContext('test-task-1', 'repository');

      expect(mockStore.updateTask).toHaveBeenCalledWith('test-task-1', {
        accumulatedContext: expect.objectContaining({
          requirements: mockTask.accumulatedContext?.requirements,
        }),
      });

      const updateCall = mockStore.updateTask.mock.calls[0][1];
      expect(updateCall.accumulatedContext).not.toHaveProperty('repository');
      expect(updateCall.accumulatedContext).not.toHaveProperty('repositoryMeta');
    });

    it('should do nothing if task does not exist', async () => {
      mockStore.getTask.mockResolvedValue(null);

      await contextManager.clearContext('non-existent', 'repository');

      expect(mockStore.updateTask).not.toHaveBeenCalled();
    });

    it('should do nothing if context does not exist', async () => {
      mockStore.getTask.mockResolvedValue(mockTask);

      await contextManager.clearContext('test-task-1', 'repository');

      expect(mockStore.updateTask).not.toHaveBeenCalled();
    });
  });
});

// Made with Bob
