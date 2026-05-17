import { z } from 'zod';

// Task status lifecycle
export const TaskStatusSchema = z.enum([
  'draft',        // Just created
  'analyzing',    // Requirements being gathered
  'ready',        // Ready for implementation
  'implementing', // Code being written
  'reviewing',    // Under code review
  'complete'      // PR ready
]);

export type TaskStatus = z.infer<typeof TaskStatusSchema>;

// Requirements artifact
export const RequirementsSchema = z.object({
  userStory: z.string(),
  acceptanceCriteria: z.array(z.string()),
  technicalRequirements: z.array(z.string()),
  dependencies: z.array(z.string()),
  estimatedComplexity: z.enum(['low', 'medium', 'high']),
  risks: z.array(z.string()).optional(),
});

export type Requirements = z.infer<typeof RequirementsSchema>;

// Repository context
export const FileNodeSchema: z.ZodType<FileNode> = z.lazy(() =>
  z.object({
    name: z.string(),
    path: z.string(),
    type: z.enum(['file', 'directory']),
    children: z.array(FileNodeSchema).optional(),
  })
);

export type FileNode = {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
};

export const RepoContextSchema = z.object({
  projectType: z.string(),
  framework: z.string().optional(),
  language: z.string(),
  dependencies: z.record(z.string()),
  fileTree: z.array(FileNodeSchema),
  patterns: z.object({
    routePattern: z.string().optional(),
    controllerPattern: z.string().optional(),
    testPattern: z.string().optional(),
  }),
  relevantFiles: z.array(z.object({
    path: z.string(),
    reason: z.string(),
    confidence: z.number(),
  })),
});

export type RepoContext = z.infer<typeof RepoContextSchema>;

// Implementation plan
export const ImplementationPlanSchema = z.object({
  approach: z.string(),
  filesToModify: z.array(z.object({
    path: z.string(),
    reason: z.string(),
  })),
  filesToCreate: z.array(z.object({
    path: z.string(),
    purpose: z.string(),
  })),
  testStrategy: z.string(),
  rollbackPlan: z.string().optional(),
});

export type ImplementationPlan = z.infer<typeof ImplementationPlanSchema>;

// Code changes tracking
export const CodeChangesSchema = z.object({
  branch: z.string(),
  filesModified: z.array(z.string()),
  filesAdded: z.array(z.string()),
  filesDeleted: z.array(z.string()),
  linesAdded: z.number(),
  linesDeleted: z.number(),
  commits: z.array(z.object({
    hash: z.string(),
    message: z.string(),
    timestamp: z.string(),
  })),
});

export type CodeChanges = z.infer<typeof CodeChangesSchema>;

// Review report
export const ReviewReportSchema = z.object({
  summary: z.string(),
  issues: z.array(z.object({
    severity: z.enum(['critical', 'major', 'minor']),
    category: z.string(),
    description: z.string(),
    file: z.string().optional(),
    line: z.number().optional(),
    suggestion: z.string().optional(),
  })),
  approved: z.boolean(),
  reviewedAt: z.string(),
});

export type ReviewReport = z.infer<typeof ReviewReportSchema>;

// PR description
export const PRDescriptionSchema = z.object({
  title: z.string(),
  body: z.string(),
  labels: z.array(z.string()).optional(),
  reviewers: z.array(z.string()).optional(),
});

export type PRDescription = z.infer<typeof PRDescriptionSchema>;

// Context metadata tracking
export const ContextMetadataSchema = z.object({
  source: z.string(),           // Where context came from
  gatheredAt: z.string(),       // When it was gathered
  stage: z.string(),            // Which stage gathered it
  tokenEstimate: z.number(),    // Estimated token count
  reusable: z.boolean(),        // Can be reused in later stages
});

export type ContextMetadata = z.infer<typeof ContextMetadataSchema>;

// Accumulated context storage
export const AccumulatedContextSchema = z.object({
  // Repository context (gathered once in analyze)
  repository: RepoContextSchema.optional(),
  repositoryMeta: ContextMetadataSchema.optional(),
  
  // Requirements (from analyze stage)
  requirements: RequirementsSchema.optional(),
  requirementsMeta: ContextMetadataSchema.optional(),
  
  // Implementation plan (from analyze stage)
  implementationPlan: ImplementationPlanSchema.optional(),
  implementationPlanMeta: ContextMetadataSchema.optional(),
  
  // Code changes (from generate stage)
  codeChanges: CodeChangesSchema.optional(),
  codeChangesMeta: ContextMetadataSchema.optional(),
  
  // Review report (from review stage)
  reviewReport: ReviewReportSchema.optional(),
  reviewReportMeta: ContextMetadataSchema.optional(),
  
  // PR description (from pr stage)
  prDescription: PRDescriptionSchema.optional(),
  prDescriptionMeta: ContextMetadataSchema.optional(),
  
  // Git information (gathered as needed)
  gitDiff: z.any().optional(),
  gitDiffMeta: ContextMetadataSchema.optional(),
  
  // Commit history
  commits: z.array(z.any()).optional(),
  commitsMeta: ContextMetadataSchema.optional(),
});

export type AccumulatedContext = z.infer<typeof AccumulatedContextSchema>;

// Main task schema
export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  status: TaskStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  
  // Legacy artifacts (for backward compatibility)
  artifacts: z.object({
    requirements: RequirementsSchema.optional(),
    repoContext: RepoContextSchema.optional(),
    implementationPlan: ImplementationPlanSchema.optional(),
    codeChanges: CodeChangesSchema.optional(),
    reviewReport: ReviewReportSchema.optional(),
    prDescription: PRDescriptionSchema.optional(),
  }).optional(),
  
  // New accumulated context with metadata
  accumulatedContext: AccumulatedContextSchema.optional(),
});

export type Task = z.infer<typeof TaskSchema>;

// Configuration
export const ConfigSchema = z.object({
  version: z.string(),
  projectType: z.string(),
  framework: z.string().optional(),
  language: z.string(),
  initializedAt: z.string(),
  automation: z.object({
    autoApprove: z.boolean(),
    approvalTimeout: z.number(),
    retryOnFailure: z.boolean(),
    maxRetries: z.number(),
  }).optional(),
  orchestrator: z.object({
    enabled: z.boolean(),
    defaultMode: z.enum(['interactive', 'auto']),
    skipStages: z.array(z.string()),
  }).optional(),
});

export type Config = z.infer<typeof ConfigSchema>;

// Orchestrator types
export const OrchestratorInputSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  autoApprove: z.boolean(),
  repoContext: RepoContextSchema,
  skipStages: z.array(z.string()).optional(),
});

export type OrchestratorInput = z.infer<typeof OrchestratorInputSchema>;

export const OrchestratorResultSchema = z.object({
  status: z.enum(['success', 'partial', 'failed']),
  completedStages: z.array(z.string()),
  artifacts: z.object({
    requirements: RequirementsSchema.optional(),
    implementationPlan: ImplementationPlanSchema.optional(),
    codeChanges: CodeChangesSchema.optional(),
    reviewReport: ReviewReportSchema.optional(),
    prDescription: PRDescriptionSchema.optional(),
  }),
  approvals: z.record(z.boolean()),
  errors: z.array(z.object({
    stage: z.string(),
    message: z.string(),
    recoverable: z.boolean().optional(),
  })).optional(),
});

export type OrchestratorResult = z.infer<typeof OrchestratorResultSchema>;

// Approval configuration
export const ApprovalConfigSchema = z.object({
  enabled: z.boolean(),
  timeout: z.number(),
  requireConfirmation: z.boolean(),
});

export type ApprovalConfig = z.infer<typeof ApprovalConfigSchema>;

export const ApprovalHistorySchema = z.object({
  taskId: z.string(),
  stage: z.string(),
  approved: z.boolean(),
  timestamp: z.string(),
  reason: z.string().optional(),
});

export type ApprovalHistory = z.infer<typeof ApprovalHistorySchema>;

// Orchestrator options
export interface OrchestratorOptions {
  autoApprove?: boolean;
  interactive?: boolean;
  skipStages?: string[];
}

// Made with Bob
