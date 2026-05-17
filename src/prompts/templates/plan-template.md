# Feature Analysis: {{TASK_TITLE}}

{{#if TASK_DESCRIPTION}}
## Description
{{TASK_DESCRIPTION}}
{{/if}}

Use the sdlc-plan skill to analyze this feature request.

{{#if REPO_CONTEXT}}
## Repository Context

- **Project Type**: {{REPO_TYPE}}
- **Framework**: {{REPO_FRAMEWORK}}
- **Language**: {{REPO_LANGUAGE}}
- **Key Dependencies**: {{REPO_DEPENDENCIES}}

### Project Structure Patterns
{{#if ROUTE_PATTERN}}- Routes: {{ROUTE_PATTERN}}{{/if}}
{{#if CONTROLLER_PATTERN}}- Controllers: {{CONTROLLER_PATTERN}}{{/if}}
{{#if TEST_PATTERN}}- Tests: {{TEST_PATTERN}}{{/if}}

### Relevant Files
{{RELEVANT_FILES}}
{{/if}}

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

Please provide your analysis in structured markdown format.