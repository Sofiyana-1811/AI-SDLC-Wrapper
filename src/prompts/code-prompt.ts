import { Task } from '../core/types';

/**
 * Generate a prompt for Bob Code mode to implement the feature
 */
export function generateCodePrompt(task: Task): string {
  if (!task.artifacts?.requirements || !task.artifacts?.implementationPlan) {
    throw new Error('Task must have requirements and implementation plan');
  }
  
  const { requirements, implementationPlan, repoContext } = task.artifacts;
  
  return `# Implementation: ${task.title}

Use the sdlc-code skill to implement this feature.

## Requirements Summary

${requirements.userStory}

## Acceptance Criteria

${requirements.acceptanceCriteria.map((criterion, i) => `${i + 1}. ${criterion}`).join('\n')}

## Technical Requirements

${requirements.technicalRequirements.map(req => `- ${req}`).join('\n')}

${requirements.dependencies.length > 0 ? `## Dependencies

${requirements.dependencies.map(dep => `- ${dep}`).join('\n')}
` : ''}

## Implementation Approach

${implementationPlan.approach}

## Files to Modify

${implementationPlan.filesToModify.map(f => `- \`${f.path}\`: ${f.reason}`).join('\n')}

${implementationPlan.filesToCreate.length > 0 ? `## Files to Create

${implementationPlan.filesToCreate.map(f => `- \`${f.path}\`: ${f.purpose}`).join('\n')}
` : ''}

## Test Strategy

${implementationPlan.testStrategy}

${repoContext ? `## Project Context

- **Framework**: ${repoContext.framework || 'N/A'}
- **Language**: ${repoContext.language}
${repoContext.patterns.routePattern ? `- **Route Pattern**: ${repoContext.patterns.routePattern}` : ''}
${repoContext.patterns.controllerPattern ? `- **Controller Pattern**: ${repoContext.patterns.controllerPattern}` : ''}
${repoContext.patterns.testPattern ? `- **Test Pattern**: ${repoContext.patterns.testPattern}` : ''}
` : ''}

## Instructions

Follow the sdlc-code skill principles:

1. **Follow Existing Patterns**: Match the project's code style and architecture
2. **Write Clear Code**: Use descriptive names, avoid clever tricks
3. **Handle Errors**: Validate inputs, provide meaningful error messages
4. **Think About Edge Cases**: Consider what could go wrong
5. **Write Tests**: Ensure code is testable and tested
6. **Document When Needed**: Complex logic deserves explanation

Please implement this feature step-by-step, confirming each file change before proceeding to the next.`;
}

// Made with Bob
