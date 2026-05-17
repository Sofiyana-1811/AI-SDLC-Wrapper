import inquirer from 'inquirer';
import chalk from 'chalk';
import { TaskStore } from '../../core/task-store';
import { GitService } from '../../git/operations';
import { generateReviewPrompt, generateReviewChecklist } from '../../prompts/review-prompt';
import { parseReviewResponse } from '../../utils/parser';
import { Logger } from '../../utils/logger';

export async function reviewCommand(taskId: string): Promise<void> {
  try {
    const store = new TaskStore();
    const task = await store.getTask(taskId);
    
    if (!task) {
      Logger.error(`Task ${taskId} not found`);
      process.exit(1);
    }
    
    if (task.status !== 'implementing') {
      Logger.warning(`Task status is ${task.status}, expected 'implementing'`);
    }
    
    Logger.header(`Code Review: ${task.title}`);
    Logger.newline();
    
    // Get git diff
    Logger.info('Analyzing code changes...');
    const git = new GitService();
    
    let diff;
    try {
      diff = await git.getDiff('main', 'HEAD');
      Logger.success(`Found ${diff.summary.filesChanged} changed files`);
    } catch (error) {
      Logger.warning('Could not get git diff. Continuing without change summary.');
      diff = {
        summary: { filesChanged: 0, insertions: 0, deletions: 0 },
        files: [],
        fullDiff: '',
      };
    }
    
    Logger.newline();
    
    // Generate review prompt
    const prompt = generateReviewPrompt(task, diff);
    
    // Display prompt
    Logger.box('Bob Review Instructions');
    console.log(chalk.gray(prompt));
    Logger.newline();
    
    // Display checklist
    console.log(chalk.gray(generateReviewChecklist()));
    Logger.newline();
    
    Logger.header('Instructions');
    Logger.prompt('1. In Bob IDE, run: /review');
    Logger.prompt('2. Bob will analyze all changes in the current branch');
    Logger.prompt('3. Review Bob\'s findings and address any issues');
    Logger.prompt('4. Re-run /review after making fixes');
    Logger.prompt('5. Once approved, copy Bob\'s review summary');
    Logger.newline();
    
    // Wait for user to paste Bob's review
    const { bobResponse } = await inquirer.prompt([
      {
        type: 'editor',
        name: 'bobResponse',
        message: 'Paste Bob\'s review summary here (opens editor):',
      },
    ]);
    
    if (!bobResponse || bobResponse.trim().length === 0) {
      Logger.error('No review provided');
      process.exit(1);
    }
    
    // Parse review response
    Logger.info('Parsing review results...');
    const reviewReport = parseReviewResponse(bobResponse);
    
    // Get code changes for artifacts
    let codeChanges;
    try {
      codeChanges = await git.getCodeChanges(taskId, 'main');
    } catch (error) {
      // If we can't get code changes, create a minimal version
      codeChanges = {
        branch: `feature/${taskId.toLowerCase()}`,
        filesModified: [],
        filesAdded: [],
        filesDeleted: [],
        linesAdded: diff.summary.insertions,
        linesDeleted: diff.summary.deletions,
        commits: [],
      };
    }
    
    // Update task with review report and code changes
    await store.updateTask(taskId, {
      status: 'reviewing',
      artifacts: {
        ...task.artifacts,
        reviewReport,
        codeChanges,
      },
    });
    
    Logger.success('Review report saved');
    Logger.success(`Task status: ${chalk.cyan('implementing')} → ${chalk.cyan('reviewing')}`);
    Logger.newline();
    
    // Display review summary
    Logger.header('Review Summary');
    
    if (reviewReport.approved) {
      Logger.success('✅ Code review approved!');
    } else {
      Logger.warning('⚠️  Code review has issues to address');
    }
    
    const criticalCount = reviewReport.issues.filter(i => i.severity === 'critical').length;
    const majorCount = reviewReport.issues.filter(i => i.severity === 'major').length;
    const minorCount = reviewReport.issues.filter(i => i.severity === 'minor').length;
    
    if (criticalCount > 0) {
      Logger.error(`Critical issues: ${criticalCount}`);
    }
    if (majorCount > 0) {
      Logger.warning(`Major issues: ${majorCount}`);
    }
    if (minorCount > 0) {
      Logger.info(`Minor issues: ${minorCount}`);
    }
    
    Logger.newline();
    
    if (reviewReport.approved) {
      Logger.header('Next Step');
      Logger.prompt(`ai-sdlc pr ${taskId}`);
      Logger.newline();
    } else {
      Logger.header('Next Steps');
      Logger.prompt('1. Address the issues found in the review');
      Logger.prompt(`2. Run: ai-sdlc review ${taskId} (to re-review)`);
      Logger.newline();
    }
    
  } catch (error) {
    Logger.error(`Review failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

// Made with Bob
