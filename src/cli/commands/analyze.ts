import inquirer from 'inquirer';
import chalk from 'chalk';
import { TaskStore } from '../../core/task-store';
import { ContextManager } from '../../core/context-manager';
import { RepositoryAnalyzer } from '../../repo/analyzer';
import { TemplateEngine } from '../../prompts/template-engine';
import { parsePlanResponse } from '../../utils/parser';
import { Logger } from '../../utils/logger';
import { RepoContext } from '../../core/types';

export async function analyzeCommand(taskId: string): Promise<void> {
  try {
    const store = new TaskStore();
    const contextMgr = new ContextManager(store);
    const templateEngine = new TemplateEngine();
    
    const task = await store.getTask(taskId);
    
    if (!task) {
      Logger.error(`Task ${taskId} not found`);
      process.exit(1);
    }
    
    Logger.header(`Analyzing Task: ${task.title}`);
    Logger.newline();
    
    // Check for existing repository context
    let repoContext = await contextMgr.getContext<RepoContext>(taskId, 'repository');
    
    if (!repoContext) {
      Logger.info('Gathering repository context...');
      const analyzer = new RepositoryAnalyzer();
      repoContext = await analyzer.analyze();
      
      // Store for reuse in later stages
      await contextMgr.storeContext(taskId, 'repository', repoContext, {
        source: 'RepositoryAnalyzer',
        stage: 'analyze',
        tokenEstimate: templateEngine.estimateTokens(JSON.stringify(repoContext)),
        reusable: true,
      });
      
      Logger.success('Repository context gathered and cached');
    } else {
      Logger.success('Using cached repository context');
    }
    Logger.newline();
    
    // Generate prompt using template
    const prompt = await templateEngine.render('plan-template', {
      TASK_TITLE: task.title,
      TASK_DESCRIPTION: task.description,
      REPO_CONTEXT: true,
      REPO_TYPE: repoContext.projectType,
      REPO_FRAMEWORK: repoContext.framework || 'N/A',
      REPO_LANGUAGE: repoContext.language,
      REPO_DEPENDENCIES: Object.keys(repoContext.dependencies).slice(0, 10).join(', '),
      ROUTE_PATTERN: repoContext.patterns.routePattern,
      CONTROLLER_PATTERN: repoContext.patterns.controllerPattern,
      TEST_PATTERN: repoContext.patterns.testPattern,
      RELEVANT_FILES: repoContext.relevantFiles.map((f: any) => `- \`${f.path}\` - ${f.reason}`).join('\n'),
    });
    
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
    
    // Store requirements and implementation plan in accumulated context
    await contextMgr.storeContext(taskId, 'requirements', requirements, {
      source: 'Bob Plan Mode',
      stage: 'analyze',
      tokenEstimate: templateEngine.estimateTokens(JSON.stringify(requirements)),
      reusable: true,
    });
    
    await contextMgr.storeContext(taskId, 'implementationPlan', implementationPlan, {
      source: 'Bob Plan Mode',
      stage: 'analyze',
      tokenEstimate: templateEngine.estimateTokens(JSON.stringify(implementationPlan)),
      reusable: true,
    });
    
    // Update task status
    await store.updateTask(taskId, {
      status: 'ready',
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
