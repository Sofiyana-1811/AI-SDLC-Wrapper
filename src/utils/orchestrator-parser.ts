import { 
  OrchestratorResult, 
  OrchestratorResultSchema,
  Requirements,
  ImplementationPlan,
  CodeChanges,
  ReviewReport,
  PRDescription
} from '../core/types';
import { Logger } from './logger';

/**
 * Parse Bob's orchestrator response and extract all artifacts
 */
export function parseOrchestratorResponse(response: string): OrchestratorResult {
  try {
    // Try to extract JSON from the response
    const jsonMatch = extractJSON(response);
    
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }
    
    // Parse and validate the JSON
    const parsed = JSON.parse(jsonMatch);
    const validated = OrchestratorResultSchema.parse(parsed);
    
    return validated;
  } catch (error) {
    Logger.error('Failed to parse orchestrator response');
    
    // Try to extract partial results
    const partial = extractPartialResults(response);
    
    if (partial) {
      Logger.warning('Extracted partial results from response');
      return partial;
    }
    
    throw new Error(`Invalid orchestrator response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract JSON from markdown or mixed content
 */
function extractJSON(text: string): string | null {
  // Try to find JSON in code blocks
  const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1];
  }
  
  // Try to find raw JSON object
  const jsonMatch = text.match(/\{[\s\S]*"status"[\s\S]*"artifacts"[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }
  
  // Try to find JSON between specific markers
  const markerMatch = text.match(/ORCHESTRATOR_RESULT_START\s*(\{[\s\S]*?\})\s*ORCHESTRATOR_RESULT_END/);
  if (markerMatch) {
    return markerMatch[1];
  }
  
  return null;
}

/**
 * Extract partial results when full JSON parsing fails
 */
function extractPartialResults(text: string): OrchestratorResult | null {
  try {
    const result: OrchestratorResult = {
      status: 'partial',
      completedStages: [],
      artifacts: {},
      approvals: {},
      errors: [{
        stage: 'parsing',
        message: 'Could not parse complete response, extracted partial results',
        recoverable: true,
      }],
    };
    
    // Try to extract individual artifacts
    result.artifacts.requirements = extractRequirements(text);
    result.artifacts.implementationPlan = extractImplementationPlan(text);
    result.artifacts.codeChanges = extractCodeChanges(text);
    result.artifacts.reviewReport = extractReviewReport(text);
    result.artifacts.prDescription = extractPRDescription(text);
    
    // Determine completed stages based on artifacts
    if (result.artifacts.requirements) result.completedStages.push('analyze');
    if (result.artifacts.codeChanges) result.completedStages.push('implement');
    if (result.artifacts.reviewReport) result.completedStages.push('review');
    if (result.artifacts.prDescription) result.completedStages.push('deliver');
    
    // Only return if we extracted at least one artifact
    if (result.completedStages.length > 0) {
      return result;
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Extract requirements from text
 */
function extractRequirements(text: string): Requirements | undefined {
  try {
    const userStoryMatch = text.match(/(?:User Story|USER STORY)[:\s]*([^\n]+(?:\n(?!##)[^\n]+)*)/i);
    const criteriaMatch = text.match(/(?:Acceptance Criteria|ACCEPTANCE CRITERIA)[:\s]*((?:[-*]\s*[^\n]+\n?)+)/i);
    const complexityMatch = text.match(/(?:Complexity|COMPLEXITY)[:\s]*(low|medium|high)/i);
    
    if (!userStoryMatch) return undefined;
    
    const acceptanceCriteria = criteriaMatch 
      ? criteriaMatch[1].split('\n').filter(line => line.trim()).map(line => line.replace(/^[-*]\s*/, '').trim())
      : [];
    
    return {
      userStory: userStoryMatch[1].trim(),
      acceptanceCriteria,
      technicalRequirements: [],
      dependencies: [],
      estimatedComplexity: (complexityMatch?.[1] as 'low' | 'medium' | 'high') || 'medium',
    };
  } catch (error) {
    return undefined;
  }
}

/**
 * Extract implementation plan from text
 */
function extractImplementationPlan(text: string): ImplementationPlan | undefined {
  try {
    const approachMatch = text.match(/(?:Implementation Approach|APPROACH)[:\s]*([^\n]+(?:\n(?!##)[^\n]+)*)/i);
    
    if (!approachMatch) return undefined;
    
    return {
      approach: approachMatch[1].trim(),
      filesToModify: [],
      filesToCreate: [],
      testStrategy: 'Standard unit and integration tests',
    };
  } catch (error) {
    return undefined;
  }
}

/**
 * Extract code changes from text
 */
function extractCodeChanges(text: string): CodeChanges | undefined {
  try {
    const branchMatch = text.match(/(?:Branch|BRANCH)[:\s]*([^\n]+)/i);
    const filesMatch = text.match(/(?:Files Modified|FILES MODIFIED)[:\s]*((?:[-*]\s*[^\n]+\n?)+)/i);
    
    if (!branchMatch && !filesMatch) return undefined;
    
    const filesModified = filesMatch
      ? filesMatch[1].split('\n').filter(line => line.trim()).map(line => line.replace(/^[-*]\s*/, '').trim())
      : [];
    
    return {
      branch: branchMatch?.[1].trim() || 'feature/unknown',
      filesModified,
      filesAdded: [],
      filesDeleted: [],
      linesAdded: 0,
      linesDeleted: 0,
      commits: [],
    };
  } catch (error) {
    return undefined;
  }
}

/**
 * Extract review report from text
 */
function extractReviewReport(text: string): ReviewReport | undefined {
  try {
    const summaryMatch = text.match(/(?:Review Summary|REVIEW SUMMARY)[:\s]*([^\n]+(?:\n(?!##)[^\n]+)*)/i);
    const approvedMatch = text.match(/(?:Approved|APPROVED)[:\s]*(true|false|yes|no)/i);
    
    if (!summaryMatch) return undefined;
    
    const approved = approvedMatch 
      ? ['true', 'yes'].includes(approvedMatch[1].toLowerCase())
      : false;
    
    return {
      summary: summaryMatch[1].trim(),
      issues: [],
      approved,
      reviewedAt: new Date().toISOString(),
    };
  } catch (error) {
    return undefined;
  }
}

/**
 * Extract PR description from text
 */
function extractPRDescription(text: string): PRDescription | undefined {
  try {
    const titleMatch = text.match(/(?:PR Title|TITLE)[:\s]*([^\n]+)/i);
    const bodyMatch = text.match(/(?:PR Description|DESCRIPTION|PR Body)[:\s]*([^\n]+(?:\n(?!##)[^\n]+)*)/i);
    
    if (!titleMatch && !bodyMatch) return undefined;
    
    return {
      title: titleMatch?.[1].trim() || 'Feature implementation',
      body: bodyMatch?.[1].trim() || '',
    };
  } catch (error) {
    return undefined;
  }
}

/**
 * Validate that all required artifacts are present
 */
export function validateArtifacts(result: OrchestratorResult): {
  valid: boolean;
  missing: string[];
} {
  const required = ['requirements', 'implementationPlan', 'codeChanges', 'reviewReport', 'prDescription'];
  const missing: string[] = [];
  
  for (const artifact of required) {
    if (!result.artifacts[artifact as keyof typeof result.artifacts]) {
      missing.push(artifact);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Extract stage results from response
 */
export function extractStageResults(response: string): {
  analyze?: string;
  implement?: string;
  review?: string;
  deliver?: string;
} {
  const results: any = {};
  
  // Try to extract each stage's output
  const analyzeMatch = response.match(/## Stage 1: ANALYZE[\s\S]*?(?=## Stage 2:|$)/i);
  if (analyzeMatch) results.analyze = analyzeMatch[0];
  
  const implementMatch = response.match(/## Stage 2: IMPLEMENT[\s\S]*?(?=## Stage 3:|$)/i);
  if (implementMatch) results.implement = implementMatch[0];
  
  const reviewMatch = response.match(/## Stage 3: REVIEW[\s\S]*?(?=## Stage 4:|$)/i);
  if (reviewMatch) results.review = reviewMatch[0];
  
  const deliverMatch = response.match(/## Stage 4: DELIVER[\s\S]*?(?=##|$)/i);
  if (deliverMatch) results.deliver = deliverMatch[0];
  
  return results;
}

/**
 * Format orchestrator result for display
 */
export function formatOrchestratorResult(result: OrchestratorResult): string {
  const lines: string[] = [];
  
  lines.push(`Status: ${result.status.toUpperCase()}`);
  lines.push(`Completed Stages: ${result.completedStages.join(', ')}`);
  lines.push('');
  
  if (result.artifacts.requirements) {
    lines.push('✓ Requirements extracted');
  }
  if (result.artifacts.implementationPlan) {
    lines.push('✓ Implementation plan extracted');
  }
  if (result.artifacts.codeChanges) {
    lines.push('✓ Code changes tracked');
  }
  if (result.artifacts.reviewReport) {
    lines.push('✓ Review report generated');
  }
  if (result.artifacts.prDescription) {
    lines.push('✓ PR description created');
  }
  
  if (result.errors && result.errors.length > 0) {
    lines.push('');
    lines.push('Errors:');
    result.errors.forEach(error => {
      lines.push(`  - [${error.stage}] ${error.message}`);
    });
  }
  
  return lines.join('\n');
}

// Made with Bob