import inquirer from 'inquirer';
import { ApprovalConfig, ApprovalHistory } from './types';
import { Logger } from '../utils/logger';
import chalk from 'chalk';

/**
 * Manages approval gates and auto-approval configuration
 */
export class ApprovalManager {
  private config: ApprovalConfig;
  private history: Map<string, ApprovalHistory[]>;
  
  constructor(autoApprove: boolean = false) {
    this.config = {
      enabled: !autoApprove,
      timeout: 300, // 5 minutes
      requireConfirmation: true,
    };
    this.history = new Map();
  }
  
  /**
   * Request user approval for a stage
   */
  async requestApproval(
    stage: string,
    context: {
      taskId: string;
      title: string;
      description?: string;
    }
  ): Promise<boolean> {
    // If auto-approve is enabled, always approve
    if (!this.config.enabled) {
      this.recordApproval(context.taskId, stage, true, 'Auto-approved');
      return true;
    }
    
    // Display approval request
    Logger.newline();
    Logger.box(`Approval Required: ${stage.toUpperCase()}`);
    Logger.info(`Task: ${context.title}`);
    if (context.description) {
      Logger.info(`Description: ${context.description}`);
    }
    Logger.newline();
    
    // Prompt for approval
    const { approved } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'approved',
        message: `Proceed with ${stage} stage?`,
        default: true,
      },
    ]);
    
    // Record decision
    this.recordApproval(
      context.taskId,
      stage,
      approved,
      approved ? 'User approved' : 'User rejected'
    );
    
    if (!approved) {
      Logger.warning(`${stage} stage rejected by user`);
    } else {
      Logger.success(`${stage} stage approved`);
    }
    Logger.newline();
    
    return approved;
  }
  
  /**
   * Request approval with additional context
   */
  async requestApprovalWithContext(
    stage: string,
    context: {
      taskId: string;
      title: string;
      description?: string;
      details?: string[];
      warnings?: string[];
    }
  ): Promise<boolean> {
    if (!this.config.enabled) {
      this.recordApproval(context.taskId, stage, true, 'Auto-approved');
      return true;
    }
    
    Logger.newline();
    Logger.box(`Approval Required: ${stage.toUpperCase()}`);
    Logger.info(`Task: ${context.title}`);
    
    if (context.description) {
      Logger.info(`Description: ${context.description}`);
    }
    
    if (context.details && context.details.length > 0) {
      Logger.newline();
      Logger.header('Details:');
      context.details.forEach(detail => Logger.info(`  • ${detail}`));
    }
    
    if (context.warnings && context.warnings.length > 0) {
      Logger.newline();
      Logger.header('Warnings:');
      context.warnings.forEach(warning => Logger.warning(`  ⚠ ${warning}`));
    }
    
    Logger.newline();
    
    const { approved } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'approved',
        message: `Proceed with ${stage} stage?`,
        default: context.warnings && context.warnings.length > 0 ? false : true,
      },
    ]);
    
    this.recordApproval(
      context.taskId,
      stage,
      approved,
      approved ? 'User approved' : 'User rejected'
    );
    
    if (!approved) {
      Logger.warning(`${stage} stage rejected by user`);
    } else {
      Logger.success(`${stage} stage approved`);
    }
    Logger.newline();
    
    return approved;
  }
  
  /**
   * Check if auto-approval is enabled
   */
  isAutoApprovalEnabled(): boolean {
    return !this.config.enabled;
  }
  
  /**
   * Enable or disable auto-approval
   */
  setAutoApproval(enabled: boolean): void {
    this.config.enabled = !enabled;
  }
  
  /**
   * Get approval configuration
   */
  getConfig(): ApprovalConfig {
    return { ...this.config };
  }
  
  /**
   * Update approval configuration
   */
  updateConfig(config: Partial<ApprovalConfig>): void {
    this.config = { ...this.config, ...config };
  }
  
  /**
   * Record an approval decision
   */
  private recordApproval(
    taskId: string,
    stage: string,
    approved: boolean,
    reason?: string
  ): void {
    const history: ApprovalHistory = {
      taskId,
      stage,
      approved,
      timestamp: new Date().toISOString(),
      reason,
    };
    
    if (!this.history.has(taskId)) {
      this.history.set(taskId, []);
    }
    
    this.history.get(taskId)!.push(history);
  }
  
  /**
   * Get approval history for a task
   */
  getApprovalHistory(taskId: string): ApprovalHistory[] {
    return this.history.get(taskId) || [];
  }
  
  /**
   * Get all approval history
   */
  getAllHistory(): Map<string, ApprovalHistory[]> {
    return new Map(this.history);
  }
  
  /**
   * Clear approval history for a task
   */
  clearHistory(taskId: string): void {
    this.history.delete(taskId);
  }
  
  /**
   * Display approval summary
   */
  displayApprovalSummary(taskId: string): void {
    const history = this.getApprovalHistory(taskId);
    
    if (history.length === 0) {
      Logger.info('No approval history for this task');
      return;
    }
    
    Logger.header('Approval History');
    history.forEach(entry => {
      const icon = entry.approved ? '✓' : '✗';
      const color = entry.approved ? chalk.green : chalk.red;
      Logger.info(
        `${color(icon)} ${entry.stage}: ${entry.approved ? 'Approved' : 'Rejected'} - ${entry.reason || 'No reason'}`
      );
    });
  }
  
  /**
   * Check if all stages were approved
   */
  allStagesApproved(taskId: string, stages: string[]): boolean {
    const history = this.getApprovalHistory(taskId);
    
    return stages.every(stage => {
      const stageHistory = history.filter(h => h.stage === stage);
      return stageHistory.length > 0 && stageHistory[stageHistory.length - 1].approved;
    });
  }
  
  /**
   * Get rejected stages
   */
  getRejectedStages(taskId: string): string[] {
    const history = this.getApprovalHistory(taskId);
    const rejected: string[] = [];
    
    history.forEach(entry => {
      if (!entry.approved && !rejected.includes(entry.stage)) {
        rejected.push(entry.stage);
      }
    });
    
    return rejected;
  }
  
  /**
   * Request batch approval for multiple stages
   */
  async requestBatchApproval(
    stages: string[],
    context: {
      taskId: string;
      title: string;
      description?: string;
    }
  ): Promise<{ [stage: string]: boolean }> {
    if (!this.config.enabled) {
      const approvals: { [stage: string]: boolean } = {};
      stages.forEach(stage => {
        approvals[stage] = true;
        this.recordApproval(context.taskId, stage, true, 'Auto-approved (batch)');
      });
      return approvals;
    }
    
    Logger.newline();
    Logger.box('Batch Approval Required');
    Logger.info(`Task: ${context.title}`);
    Logger.info(`Stages: ${stages.join(', ')}`);
    Logger.newline();
    
    const { approveAll } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'approveAll',
        message: 'Approve all stages at once?',
        default: true,
      },
    ]);
    
    const approvals: { [stage: string]: boolean } = {};
    
    if (approveAll) {
      stages.forEach(stage => {
        approvals[stage] = true;
        this.recordApproval(context.taskId, stage, true, 'User approved (batch)');
      });
      Logger.success('All stages approved');
    } else {
      // Request individual approvals
      for (const stage of stages) {
        const approved = await this.requestApproval(stage, context);
        approvals[stage] = approved;
      }
    }
    
    Logger.newline();
    return approvals;
  }
}

// Made with Bob