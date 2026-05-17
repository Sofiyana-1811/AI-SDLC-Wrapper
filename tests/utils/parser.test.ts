import {
  extractSection,
  extractList,
  extractComplexity,
  extractFileList,
  parsePlanResponse,
  parseReviewResponse,
} from '../../src/utils/parser';

describe('Parser Utils', () => {
  describe('extractSection', () => {
    it('should extract section content', () => {
      const text = `
## User Story
As a user, I want to login

## Acceptance Criteria
- Criterion 1
- Criterion 2
      `;
      
      const section = extractSection(text, 'User Story');
      expect(section).toBe('As a user, I want to login');
    });

    it('should handle sections with colons', () => {
      const text = '## User Story: Login Feature\nContent here';
      const section = extractSection(text, 'User Story');
      expect(section).toBe('Login Feature\nContent here');
    });

    it('should return empty string for non-existent section', () => {
      const text = '## Some Section\nContent';
      const section = extractSection(text, 'Non Existent');
      expect(section).toBe('');
    });
  });

  describe('extractList', () => {
    it('should extract bullet list items', () => {
      const text = `
## Acceptance Criteria
- Criterion 1
- Criterion 2
- Criterion 3
      `;
      
      const list = extractList(text, 'Acceptance Criteria');
      expect(list).toEqual(['Criterion 1', 'Criterion 2', 'Criterion 3']);
    });

    it('should extract numbered list items', () => {
      const text = `
## Requirements
1. Requirement 1
2. Requirement 2
3. Requirement 3
      `;
      
      const list = extractList(text, 'Requirements');
      expect(list).toEqual(['Requirement 1', 'Requirement 2', 'Requirement 3']);
    });

    it('should return empty array for non-existent section', () => {
      const text = '## Some Section\nContent';
      const list = extractList(text, 'Non Existent');
      expect(list).toEqual([]);
    });
  });

  describe('extractComplexity', () => {
    it('should extract low complexity', () => {
      const text = '## Estimated Complexity\nLow - Simple change';
      const complexity = extractComplexity(text);
      expect(complexity).toBe('low');
    });

    it('should extract high complexity', () => {
      const text = '## Estimated Complexity\nHigh - Complex refactoring';
      const complexity = extractComplexity(text);
      expect(complexity).toBe('high');
    });

    it('should default to medium', () => {
      const text = '## Estimated Complexity\nSomewhat complex';
      const complexity = extractComplexity(text);
      expect(complexity).toBe('medium');
    });
  });

  describe('extractFileList', () => {
    it('should extract files with reasons', () => {
      const text = `
## Files to Modify
- \`src/app.ts\` - Add middleware
- \`src/routes/auth.ts\` - Apply rate limiter
      `;
      
      const files = extractFileList(text, 'Files to Modify');
      expect(files).toEqual([
        { path: 'src/app.ts', reason: 'Add middleware' },
        { path: 'src/routes/auth.ts', reason: 'Apply rate limiter' },
      ]);
    });

    it('should handle files without backticks', () => {
      const text = `
## Files to Create
- src/middleware/limiter.ts - Rate limiter config
      `;
      
      const files = extractFileList(text, 'Files to Create');
      expect(files).toEqual([
        { path: 'src/middleware/limiter.ts', reason: 'Rate limiter config' },
      ]);
    });
  });

  describe('parsePlanResponse', () => {
    it('should parse complete plan response', () => {
      const response = `
# Feature Analysis: Test Feature

## User Story
As a user, I want to test

## Acceptance Criteria
- Criterion 1
- Criterion 2

## Technical Requirements
- Requirement 1
- Requirement 2

## Dependencies
- express-rate-limit

## Implementation Approach
Use middleware pattern

## Files to Modify
- \`src/app.ts\` - Add config

## Files to Create
- \`src/middleware/test.ts\` - Test middleware

## Test Strategy
Unit and integration tests

## Estimated Complexity
Low - Simple implementation
      `;
      
      const { requirements, implementationPlan } = parsePlanResponse(response);
      
      expect(requirements.userStory).toBe('As a user, I want to test');
      expect(requirements.acceptanceCriteria).toHaveLength(2);
      expect(requirements.technicalRequirements).toHaveLength(2);
      expect(requirements.dependencies).toHaveLength(1);
      expect(requirements.estimatedComplexity).toBe('low');
      
      expect(implementationPlan.approach).toBe('Use middleware pattern');
      expect(implementationPlan.filesToModify).toHaveLength(1);
      expect(implementationPlan.filesToCreate).toHaveLength(1);
      expect(implementationPlan.testStrategy).toBe('Unit and integration tests');
    });
  });

  describe('parseReviewResponse', () => {
    it('should parse review with issues', () => {
      const response = `
# Code Review Summary

## Summary
Overall good implementation with some issues

## Critical Issues
- Security vulnerability in auth

## Major Issues
- Missing error handling
- Insufficient tests

## Minor Issues
- Code style inconsistency
      `;
      
      const review = parseReviewResponse(response);
      
      expect(review.summary).toContain('Overall good implementation');
      expect(review.issues).toHaveLength(4);
      expect(review.issues.filter(i => i.severity === 'critical')).toHaveLength(1);
      expect(review.issues.filter(i => i.severity === 'major')).toHaveLength(2);
      expect(review.issues.filter(i => i.severity === 'minor')).toHaveLength(1);
      expect(review.approved).toBe(false);
    });

    it('should mark as approved when no critical issues', () => {
      const response = `
# Code Review

## Summary
Looks good! Approved.

## Minor Issues
- Small style issue
      `;
      
      const review = parseReviewResponse(response);
      
      expect(review.approved).toBe(true);
      expect(review.issues).toHaveLength(1);
    });
  });
});

// Made with Bob
