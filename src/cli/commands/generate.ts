import chalk from 'chalk';
import { TaskStore } from '../../core/task-store';
import { GitService } from '../../git/operations';
import { generateCodePrompt } from '../../prompts/code-prompt';
import { Logger } from '../../utils/logger';

export async function generateCommand(taskId: string): Promise<void> {
  try {
    const store = new TaskStore();
    const task = await store.getTask(taskId);
    
    if (!task) {
      Logger.error(`Task ${taskId} not found`);
      process.exit(1);
    }
    
    if (task.status !== 'ready') {
      Logger.error(`Task must be analyzed first. Run: ai-sdlc analyze ${taskId}`);
      process.exit(1);
    }
    
    Logger.header(`Generating Implementation Prompt: ${task.title}`);
    Logger.newline();
    
    // Create feature branch
    Logger.info('Creating feature branch...');
    const git = new GitService();
    
    // Check if git repo
    if (!(await git.isGitRepo())) {
      Logger.warning('Not a git repository. Skipping branch creation.');
    } else {
      const branch = await git.createFeatureBranch(taskId);
      Logger.success(`Created/switched to branch: ${chalk.cyan(branch)}`);
    }
    
    Logger.newline();
    
    // Generate prompt for Bob Code mode
    const prompt = generateCodePrompt(task);
    
    // Display prompt
    Logger.box('Bob Code Mode Prompt');
    console.log(chalk.gray(prompt));
    Logger.newline();
    
    Logger.header('Instructions');
    Logger.prompt('1. Copy the prompt above');
    Logger.prompt('2. Open Bob IDE and switch to Code mode');
    Logger.prompt('3. Paste the prompt and let Bob implement');
    Logger.prompt('4. Review and approve Bob\'s changes step-by-step');
    Logger.newline();
    
    Logger.header('After Implementation');
    Logger.prompt(`ai-sdlc review ${taskId}`);
    Logger.newline();
    
    // Update task status
    await store.updateStatus(taskId, 'implementing');
    Logger.success(`Task status: ${chalk.cyan('ready')} → ${chalk.cyan('implementing')}`);
    Logger.newline();
    
  } catch (error) {
    Logger.error(`Generate failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

// Made with Bob
