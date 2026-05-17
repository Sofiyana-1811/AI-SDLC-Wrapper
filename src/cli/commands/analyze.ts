import inquirer from 'inquirer';
import chalk from 'chalk';
import { TaskStore } from '../../core/task-store';
import { RepositoryAnalyzer } from '../../repo/analyzer';
import { generatePlanPrompt } from '../../prompts/plan-prompt';
import { parsePlanResponse } from '../../utils/parser';
import { Logger } from '../../utils/logger';

export async function analyzeCommand(taskId: string): Promise<void> {
  try {
    const store = new TaskStore();
    const task = await store.getTask(taskId);
    
    if (!task) {
      Logger.error(`Task ${taskId} not found`);
      process.exit(1);
    }
    
    Logger.header(`Analyzing Task: ${task.title}`);
    Logger.newline();
    
    // Get repository context
    Logger.info('Gathering repository context...');
    const analyzer = new RepositoryAnalyzer();
    const repoContext = await analyzer.analyze();
    Logger.success('Repository context gathered');
    Logger.newline();
    
    // Generate prompt for Bob Plan mode
    const prompt = generatePlanPrompt(task, repoContext);
    
    // Display prompt
    Logger.box('Bob Plan Mode Prompt');
    console.log(chalk.gray(prompt));
    Logger.newline();
    
    Logger.header('Instructions');
    Logger.prompt('1. Copy the prompt above');
    Logger.prompt('2. Open Bob IDE and switch to Plan mode');
    Logger.prompt('3. Paste the prompt and let Bob analyze');
    Logger.prompt('4. Copy Bob\'s complete response');
    Logger.newline();
    
    // Wait for user to paste Bob's response
    const { bobResponse } = await inquirer.prompt([
      {
        type: 'editor',
        name: 'bobResponse',
        message: 'Paste Bob\'s response here (opens editor):',
      },
    ]);
    
    if (!bobResponse || bobResponse.trim().length === 0) {
      Logger.error('No response provided');
      process.exit(1);
    }
    
    // Parse Bob's response
    Logger.info('Parsing Bob\'s analysis...');
    const { requirements, implementationPlan } = parsePlanResponse(bobResponse);
    
    // Update task with artifacts
    await store.updateTask(taskId, {
      status: 'ready',
      artifacts: {
        requirements,
        repoContext,
        implementationPlan,
      },
    });
    
    Logger.success('Requirements saved');
    Logger.success(`Task status: ${chalk.cyan('draft')} → ${chalk.cyan('ready')}`);
    Logger.newline();
    
    // Display summary
    Logger.header('Analysis Summary');
    Logger.info(`Complexity: ${requirements.estimatedComplexity}`);
    Logger.info(`Acceptance Criteria: ${requirements.acceptanceCriteria.length}`);
    Logger.info(`Files to Modify: ${implementationPlan.filesToModify.length}`);
    Logger.info(`Files to Create: ${implementationPlan.filesToCreate.length}`);
    Logger.newline();
    
    Logger.header('Next Step');
    Logger.prompt(`ai-sdlc generate ${taskId}`);
    Logger.newline();
    
  } catch (error) {
    Logger.error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

// Made with Bob
