# Code Review: {{TASK_TITLE}}

Use Bob's `/review` command to analyze the changes for this feature.

## Changes Summary

- **Files Changed**: {{FILES_CHANGED}}
- **Lines Added**: {{LINES_ADDED}}
- **Lines Deleted**: {{LINES_DELETED}}

## Files Modified

{{FILES_LIST}}

{{#if REQUIREMENTS}}
## Original Requirements

### User Story
{{USER_STORY}}

### Acceptance Criteria
{{ACCEPTANCE_CRITERIA}}
{{/if}}

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

1. In Bob IDE, run: `/review`
2. Bob will analyze all changes in the current branch
3. Review Bob's findings and address any issues
4. Re-run `/review` after making fixes
5. Once approved, return here to continue

After review is complete, copy Bob's review summary and paste it when prompted.