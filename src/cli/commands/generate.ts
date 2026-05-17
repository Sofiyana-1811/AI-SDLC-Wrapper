import chalk from 'chalk';
import { TaskStore } from '../../core/task-store';
import { ContextManager } from '../../core/context-manager';
import { GitService } from '../../git/operations';
import { TemplateEngine } from '../../prompts/template-engine';
import { Logger } from '../../utils/logger';
import { Requirements, ImplementationPlan, RepoContext } from '../../core/types';

export async function generateCommand(taskId: string): Promise<void> {
  try {
    const store = new TaskStore();
    const contextMgr = new ContextManager(store);
    const templateEngine = new TemplateEngine();
    
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
    
    // Get accumulated context from analyze stage
    const requirements = await contextMgr.getContext<Requirements>(taskId, 'requirements');
    const implementationPlan = await contextMgr.getContext<ImplementationPlan>(taskId, 'implementationPlan');
    const repoContext = await contextMgr.getContext<RepoContext>(taskId, 'repository');
    
    if (!requirements || !implementationPlan) {
      Logger.error('Missing requirements or implementation plan. Run analyze first.');
      process.exit(1);
    }
    
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
    
    // Generate prompt using template
    const prompt = await templateEngine.render('code-template', {
      TASK_TITLE: task.title,
      USER_STORY: requirements.userStory,
      ACCEPTANCE_CRITERIA: requirements.acceptanceCriteria.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n'),
      TECHNICAL_REQUIREMENTS: requirements.technicalRequirements.map((r: string) => `- ${r}`).join('\n'),
      DEPENDENCIES: requirements.dependencies.length > 0 ? requirements.dependencies.map((d: string) => `- ${d}`).join('\n') : undefined,
      IMPLEMENTATION_APPROACH: implementationPlan.approach,
      FILES_TO_MODIFY: implementationPlan.filesToModify.map((f: any) => `- \`${f.path}\`: ${f.reason}`).join('\n'),
      FILES_TO_CREATE: implementationPlan.filesToCreate.length > 0 ? implementationPlan.filesToCreate.map((f: any) => `- \`${f.path}\`: ${f.purpose}`).join('\n') : undefined,
      TEST_STRATEGY: implementationPlan.testStrategy,
      REPO_CONTEXT: repoContext ? true : undefined,
      REPO_FRAMEWORK: repoContext?.framework,
      REPO_LANGUAGE: repoContext?.language,
      ROUTE_PATTERN: repoContext?.patterns.routePattern,
      CONTROLLER_PATTERN: repoContext?.patterns.controllerPattern,
      TEST_PATTERN: repoContext?.patterns.testPattern,
    });
    
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
