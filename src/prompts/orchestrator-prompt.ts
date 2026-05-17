import { Task, RepoContext, OrchestratorOptions } from '../core/types';

/**
 * Generate the master prompt for Bob's orchestrator skill
 */
export function generateOrchestratorPrompt(
  task: Task,
  repoContext: RepoContext,
  options: OrchestratorOptions = {}
): string {
  const autoApprove = options.autoApprove ?? false;
  const skipStages = options.skipStages ?? [];
  
  return `# Execute Complete SDLC Workflow

Use the **sdlc-orchestrator** skill to complete this feature from requirements to PR-ready code.

## Feature Details

**Title**: ${task.title}

${task.description ? `**Description**: ${task.description}\n` : ''}**Task ID**: ${task.id}

**Auto-approve**: ${autoApprove}

${skipStages.length > 0 ? `**Skip Stages**: ${skipStages.join(', ')}\n` : ''}
## Repository Context

### Project Information
- **Type**: ${repoContext.projectType}
- **Framework**: ${repoContext.framework || 'N/A'}
- **Language**: ${repoContext.language}
- **Dependencies**: ${Object.keys(repoContext.dependencies).slice(0, 10).join(', ')}${Object.keys(repoContext.dependencies).length > 10 ? ', ...' : ''}

### Project Structure Patterns
${repoContext.patterns.routePattern ? `- **Routes**: \`${repoContext.patterns.routePattern}\`` : ''}
${repoContext.patterns.controllerPattern ? `- **Controllers**: \`${repoContext.patterns.controllerPattern}\`` : ''}
${repoContext.patterns.testPattern ? `- **Tests**: \`${repoContext.patterns.testPattern}\`` : ''}

### Relevant Files
${repoContext.relevantFiles.slice(0, 15).map(f => `- \`${f.path}\` - ${f.reason} (confidence: ${Math.round(f.confidence * 100)}%)`).join('\n')}
${repoContext.relevantFiles.length > 15 ? `\n... and ${repoContext.relevantFiles.length - 15} more files` : ''}

## Execution Instructions

Execute all SDLC stages in sequence using the orchestrator skill:

1. **ANALYZE**: Use sdlc-plan skill to create requirements and implementation plan
2. **IMPLEMENT**: Use sdlc-code skill to write production-quality code
3. **REVIEW**: Use sdlc-review skill to ensure code quality and security
4. **DELIVER**: Use sdlc-deliver skill to generate PR description

${!autoApprove ? `
### Approval Gates

Since auto-approve is **disabled**, please:
- Request confirmation before starting each stage
- Wait for user approval to proceed
- Document approval decisions in the output
` : `
### Auto-Approval Mode

Since auto-approve is **enabled**:
- Execute all stages automatically
- No user confirmation required
- Proceed through all stages unless errors occur
`}

## Expected Output Format

Return your complete response in the following JSON structure:

\`\`\`json
{
  "status": "success",
  "completedStages": ["analyze", "implement", "review", "deliver"],
  "artifacts": {
    "requirements": {
      "userStory": "As a... I want... So that...",
      "acceptanceCriteria": ["Criterion 1", "Criterion 2", "..."],
      "technicalRequirements": ["Requirement 1", "Requirement 2", "..."],
      "dependencies": ["dependency-1", "dependency-2"],
      "estimatedComplexity": "low|medium|high",
      "risks": ["Risk 1", "Risk 2"]
    },
    "implementationPlan": {
      "approach": "High-level implementation strategy",
      "filesToModify": [
        {"path": "src/file.ts", "reason": "Why this file needs changes"}
      ],
      "filesToCreate": [
        {"path": "src/new-file.ts", "purpose": "Purpose of this file"}
      ],
      "testStrategy": "How to test this feature"
    },
    "codeChanges": {
      "branch": "feature/${task.id.toLowerCase()}",
      "filesModified": ["src/file1.ts", "src/file2.ts"],
      "filesAdded": ["src/new-file.ts"],
      "filesDeleted": [],
      "linesAdded": 150,
      "linesDeleted": 20,
      "commits": [
        {
          "hash": "abc123",
          "message": "Implement feature",
          "timestamp": "2026-05-17T10:00:00Z"
        }
      ]
    },
    "reviewReport": {
      "summary": "Overall review summary",
      "issues": [
        {
          "severity": "critical|major|minor",
          "category": "Security|Performance|Quality|...",
          "description": "Issue description",
          "file": "src/file.ts",
          "line": 42,
          "suggestion": "How to fix"
        }
      ],
      "approved": true,
      "reviewedAt": "2026-05-17T11:00:00Z"
    },
    "prDescription": {
      "title": "Add feature X",
      "body": "Complete PR description in markdown format",
      "labels": ["enhancement", "backend"],
      "reviewers": []
    }
  },
  "approvals": {
    "analyze": true,
    "implement": true,
    "review": true,
    "deliver": true
  },
  "errors": []
}
\`\`\`

## Important Notes

- Follow all existing project patterns and conventions
- Write production-quality, well-tested code
- Ensure all acceptance criteria are met
- Handle errors gracefully and provide rollback guidance
- Return the complete JSON structure even if some stages fail
- If a stage fails, set status to "partial" and include error details

## Begin Execution

Please execute the orchestrator skill now and return the complete results.`;
}

/**
 * Generate a simplified orchestrator prompt without full repo context
 */
export function generateSimpleOrchestratorPrompt(
  task: Task,
  options: OrchestratorOptions = {}
): string {
  const autoApprove = options.autoApprove ?? false;
  
  return `# Execute Complete SDLC Workflow

Use the **sdlc-orchestrator** skill to complete this feature.

## Feature Details

**Title**: ${task.title}
${task.description ? `**Description**: ${task.description}\n` : ''}**Task ID**: ${task.id}
**Auto-approve**: ${autoApprove}

## Instructions

Execute all SDLC stages (analyze, implement, review, deliver) and return results in JSON format as specified in the sdlc-orchestrator skill documentation.

${!autoApprove ? 'Request approval before each stage.' : 'Execute all stages automatically.'}

Please begin execution now.`;
}

/**
 * Generate prompt for resuming a partially completed workflow
 */
export function generateResumeOrchestratorPrompt(
  task: Task,
  repoContext: RepoContext,
  completedStages: string[],
  options: OrchestratorOptions = {}
): string {
  const remainingStages = ['analyze', 'implement', 'review', 'deliver']
    .filter(stage => !completedStages.includes(stage));
  
  return `# Resume SDLC Workflow

Continue the orchestrator workflow for task **${task.id}**.

## Completed Stages
${completedStages.map(s => `- ✓ ${s}`).join('\n')}

## Remaining Stages
${remainingStages.map(s => `- ⏳ ${s}`).join('\n')}

## Instructions

Use the **sdlc-orchestrator** skill to complete the remaining stages:
${remainingStages.map((s, i) => `${i + 1}. ${s.toUpperCase()}`).join('\n')}

Return results in the standard JSON format, including both completed and new artifacts.

Please continue execution now.`;
}

/**
 * Format orchestrator input as JSON for debugging
 */
export function formatOrchestratorInput(
  task: Task,
  repoContext: RepoContext,
  options: OrchestratorOptions = {}
): string {
  return JSON.stringify({
    title: task.title,
    description: task.description,
    autoApprove: options.autoApprove ?? false,
    repoContext: {
      projectType: repoContext.projectType,
      framework: repoContext.framework,
      language: repoContext.language,
      patterns: repoContext.patterns,
    },
    skipStages: options.skipStages ?? [],
  }, null, 2);
}

// Made with Bob