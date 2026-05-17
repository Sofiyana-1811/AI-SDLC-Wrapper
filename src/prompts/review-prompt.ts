import { Task } from '../core/types';
import { GitDiff } from '../git/operations';

/**
 * Generate instructions for Bob code review
 */
export function generateReviewPrompt(task: Task, diff: GitDiff): string {
  return `# Code Review: ${task.title}

Use Bob's \`/review\` command to analyze the changes for this feature.

## Changes Summary

- **Files Changed**: ${diff.summary.filesChanged}
- **Lines Added**: ${diff.summary.insertions}
- **Lines Deleted**: ${diff.summary.deletions}

## Files Modified

${diff.files.map(f => `- \`${f.path}\` (${f.status}): +${f.additions} -${f.deletions}`).join('\n')}

${task.artifacts.requirements ? `## Original Requirements

### User Story
${task.artifacts.requirements.userStory}

### Acceptance Criteria
${task.artifacts.requirements.acceptanceCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}
` : ''}

## Review Focus Areas

Use the sdlc-review skill to check:

1. **Code Quality**
   - Readability and clarity
   - Naming conventions
   - Code organization
   - DRY principle adherence

2. **Security**
   - Input validation
   - Authentication/authorization
   - SQL injection prevention
   - XSS prevention
   - No hardcoded secrets

3. **Performance**
   - Algorithm efficiency
   - Database query optimization
   - Resource management

4. **Testing**
   - Test coverage
   - Edge cases covered
   - Integration tests

5. **Documentation**
   - Code comments for complex logic
   - API documentation
   - README updates

## Instructions

1. In Bob IDE, run: \`/review\`
2. Bob will analyze all changes in the current branch
3. Review Bob's findings and address any issues
4. Re-run \`/review\` after making fixes
5. Once approved, return here to continue

After review is complete, copy Bob's review summary and paste it when prompted.`;
}

/**
 * Generate a simple review checklist
 */
export function generateReviewChecklist(): string {
  return `## Code Review Checklist

Before marking the review as complete, ensure:

- [ ] All acceptance criteria are met
- [ ] Code follows project conventions
- [ ] No hardcoded values or secrets
- [ ] Proper error handling implemented
- [ ] Tests included and passing
- [ ] No console.log or debug code
- [ ] Documentation updated
- [ ] No TODO comments left
- [ ] Linter passing
- [ ] No security vulnerabilities`;
}

// Made with Bob
