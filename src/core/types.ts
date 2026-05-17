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

// Main task schema
export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  status: TaskStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  
  artifacts: z.object({
    requirements: RequirementsSchema.optional(),
    repoContext: RepoContextSchema.optional(),
    implementationPlan: ImplementationPlanSchema.optional(),
    codeChanges: CodeChangesSchema.optional(),
    reviewReport: ReviewReportSchema.optional(),
    prDescription: PRDescriptionSchema.optional(),
  }),
});

export type Task = z.infer<typeof TaskSchema>;

// Configuration
export const ConfigSchema = z.object({
  version: z.string(),
  projectType: z.string(),
  framework: z.string().optional(),
  language: z.string(),
  initializedAt: z.string(),
});

export type Config = z.infer<typeof ConfigSchema>;

// Made with Bob
