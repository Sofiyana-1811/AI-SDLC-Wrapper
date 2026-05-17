import { Requirements, ImplementationPlan, ReviewReport } from '../core/types';

/**
 * Extract a section from markdown text
 */
export function extractSection(text: string, heading: string): string {
  const regex = new RegExp(`##?\\s*${heading}[:\\s]*([\\s\\S]*?)(?=##|$)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : '';
}

/**
 * Extract a list from a section
 */
export function extractList(text: string, heading: string): string[] {
  const section = extractSection(text, heading);
  return section
    .split('\n')
    .filter(line => line.trim().startsWith('-') || line.trim().match(/^\d+\./))
    .map(line => line.replace(/^[-\d]+\.\s*/, '').replace(/^-\s*/, '').trim())
    .filter(Boolean);
}

/**
 * Extract complexity level
 */
export function extractComplexity(text: string): 'low' | 'medium' | 'high' {
  const section = extractSection(text, 'Estimated Complexity');
  const lower = section.toLowerCase();
  if (lower.includes('low')) return 'low';
  if (lower.includes('high')) return 'high';
  return 'medium';
}

/**
 * Extract file list with reasons
 */
export function extractFileList(text: string, heading: string): Array<{ path: string; reason: string }> {
  const section = extractSection(text, heading);
  const lines = section.split('\n').filter(line => line.trim().startsWith('-'));
  
  return lines.map(line => {
    const match = line.match(/^-\s*`?([^`:\s]+)`?\s*[:-]?\s*(.*)$/);
    return {
      path: match ? match[1].trim() : line.replace(/^-\s*/, '').trim(),
      reason: match ? match[2].trim() : '',
    };
  }).filter(item => item.path);
}

/**
 * Parse Bob's plan response into Requirements and ImplementationPlan
 */
export function parsePlanResponse(response: string): {
  requirements: Requirements;
  implementationPlan: ImplementationPlan;
} {
  const requirements: Requirements = {
    userStory: extractSection(response, 'User Story'),
    acceptanceCriteria: extractList(response, 'Acceptance Criteria'),
    technicalRequirements: extractList(response, 'Technical Requirements'),
    dependencies: extractList(response, 'Dependencies'),
    estimatedComplexity: extractComplexity(response),
    risks: extractList(response, 'Risks'),
  };
  
  const implementationPlan: ImplementationPlan = {
    approach: extractSection(response, 'Implementation Approach'),
    filesToModify: extractFileList(response, 'Files to Modify'),
    filesToCreate: extractFileList(response, 'Files to Create').map(f => ({
      path: f.path,
      purpose: f.reason,
    })),
    testStrategy: extractSection(response, 'Test Strategy'),
    rollbackPlan: extractSection(response, 'Rollback') || undefined,
  };
  
  return { requirements, implementationPlan };
}

/**
 * Parse Bob's review response into ReviewReport
 */
export function parseReviewResponse(response: string): ReviewReport {
  const summary = extractSection(response, 'Summary') || extractSection(response, 'Review Summary');
  
  // Extract issues by severity
  const issues: ReviewReport['issues'] = [];
  
  // Parse critical issues
  const criticalSection = extractSection(response, 'Critical Issues');
  if (criticalSection) {
    const criticalLines = criticalSection.split('\n').filter(line => line.trim().startsWith('-'));
    criticalLines.forEach(line => {
      const cleaned = line.replace(/^-\s*/, '').trim();
      if (cleaned) {
        issues.push({
          severity: 'critical',
          category: 'Critical',
          description: cleaned,
        });
      }
    });
  }
  
  // Parse major issues
  const majorSection = extractSection(response, 'Major Issues');
  if (majorSection) {
    const majorLines = majorSection.split('\n').filter(line => line.trim().startsWith('-'));
    majorLines.forEach(line => {
      const cleaned = line.replace(/^-\s*/, '').trim();
      if (cleaned) {
        issues.push({
          severity: 'major',
          category: 'Major',
          description: cleaned,
        });
      }
    });
  }
  
  // Parse minor issues
  const minorSection = extractSection(response, 'Minor Issues');
  if (minorSection) {
    const minorLines = minorSection.split('\n').filter(line => line.trim().startsWith('-'));
    minorLines.forEach(line => {
      const cleaned = line.replace(/^-\s*/, '').trim();
      if (cleaned) {
        issues.push({
          severity: 'minor',
          category: 'Minor',
          description: cleaned,
        });
      }
    });
  }
  
  // Determine if approved
  const approved = issues.filter(i => i.severity === 'critical').length === 0 &&
                   (response.toLowerCase().includes('approved') || 
                    response.toLowerCase().includes('looks good'));
  
  return {
    summary,
    issues,
    approved,
    reviewedAt: new Date().toISOString(),
  };
}

// Made with Bob
