import { Task, RepoContext } from '../core/types';

/**
 * Generate a prompt for Bob Plan mode to analyze requirements
 */
export function generatePlanPrompt(task: Task, context: RepoContext): string {
  return `# Feature Analysis: ${task.title}

${task.description ? `## Description\n${task.description}\n\n` : ''}Use the sdlc-plan skill to analyze this feature request.

## Repository Context

- **Project Type**: ${context.projectType}
- **Framework**: ${context.framework || 'N/A'}
- **Language**: ${context.language}
- **Key Dependencies**: ${Object.keys(context.dependencies).slice(0, 10).join(', ')}

### Project Structure Patterns
${context.patterns.routePattern ? `- Routes: ${context.patterns.routePattern}` : ''}
${context.patterns.controllerPattern ? `- Controllers: ${context.patterns.controllerPattern}` : ''}
${context.patterns.testPattern ? `- Tests: ${context.patterns.testPattern}` : ''}

### Relevant Files
${context.relevantFiles.map(f => `- \`${f.path}\` - ${f.reason}`).join('\n')}

## Instructions

Follow the sdlc-plan skill process to create a comprehensive implementation plan. Provide:

1. **User Story**: Clear description in "As a... I want... So that..." format
2. **Acceptance Criteria**: Specific, testable requirements (numbered list)
3. **Technical Requirements**: Implementation details and constraints
4. **Dependencies**: External libraries or services needed
5. **Implementation Approach**: High-level strategy
6. **Files to Modify**: List with reasons for each file
7. **Files to Create**: New files needed with their purposes
8. **Test Strategy**: How to verify the implementation
9. **Estimated Complexity**: Low/Medium/High with justification
10. **Risks and Considerations**: Potential issues to watch for

Please provide your analysis in structured markdown format.`;
}

/**
 * Generate a simplified prompt without repository context
 */
export function generateSimplePlanPrompt(task: Task): string {
  return `# Feature Analysis: ${task.title}

${task.description ? `## Description\n${task.description}\n\n` : ''}Use the sdlc-plan skill to analyze this feature request.

## Instructions

Follow the sdlc-plan skill process to create a comprehensive implementation plan. Provide:

1. **User Story**: Clear description
2. **Acceptance Criteria**: Specific, testable requirements
3. **Technical Requirements**: Implementation details
4. **Dependencies**: External libraries needed
5. **Implementation Approach**: High-level strategy
6. **Files to Modify**: List with reasons
7. **Files to Create**: New files with purposes
8. **Test Strategy**: Verification approach
9. **Estimated Complexity**: Low/Medium/High
10. **Risks**: Potential issues

Please provide your analysis in structured markdown format.`;
}

// Made with Bob
