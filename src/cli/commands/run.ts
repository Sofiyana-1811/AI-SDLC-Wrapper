import inquirer from 'inquirer';
import chalk from 'chalk';
import { TaskStore } from '../../core/task-store';
import { ContextManager } from '../../core/context-manager';
import { ApprovalManager } from '../../core/approval-manager';
import { RepositoryAnalyzer } from '../../repo/analyzer';
import { GitService } from '../../git/operations';
import { generateOrchestratorPrompt } from '../../prompts/orchestrator-prompt';
import { 
  parseOrchestratorResponse, 
  validateArtifacts, 
  formatOrchestratorResult 
} from '../../utils/orchestrator-parser';
import { Logger } from '../../utils/logger';
import { OrchestratorOptions, RepoContext } from '../../core/types';

interface RunCommandOptions {
  description?: string;
  autoApprove?: boolean;
  interactive?: boolean;
  skipStages?: string;
}

export async function runCommand(
  title: string,
  options: RunCommandOptions
): Promise<void> {
  try {
    const store = new TaskStore();
    const git = new GitService();
    
    // Check if initialized
    if (!(await store.isInitialized())) {
      Logger.error('AI SDLC not initialized. Run: ai-sdlc init');
      process.exit(1);
    }
    
    await store.initialize();
    
    Logger.header('🚀 AI SDLC Automated Workflow');
    Logger.newline();
    
    // Parse options
    const autoApprove = options.autoApprove ?? false;
    const interactive = options.interactive ?? !autoApprove;
    const skipStages = options.skipStages 
      ? options.skipStages.split(',').map(s => s.trim())
      : [];
    
    // Initialize managers
    const contextMgr = new ContextManager(store);
    const approvalMgr = new ApprovalManager(autoApprove);
    
    // Step 1: Create task
    Logger.info('Step 1: Creating task...');
    const task = await store.createTask(title, options.description);
    Logger.success(`Created task ${chalk.cyan(task.id)}: "${title}"`);
    Logger.newline();
    
    // Step 2: Gather repository context
    Logger.info('Step 2: Gathering repository context...');
    let repoContext = await contextMgr.getContext<RepoContext>(task.id, 'repository');
    
    if (!repoContext) {
      const analyzer = new RepositoryAnalyzer();
      repoContext = await analyzer.analyze();
      
      await contextMgr.storeContext(task.id, 'repository', repoContext, {
        source: 'RepositoryAnalyzer',
        stage: 'run',
        tokenEstimate: JSON.stringify(repoContext).length / 4,
        reusable: true,
      });
      
      Logger.success('Repository context gathered');
    } else {
      Logger.success('Using cached repository context');
    }
    Logger.newline();
    
    // Step 3: Request initial approval (if needed)
    if (interactive) {
      const approved = await approvalMgr.requestApprovalWithContext('workflow', {
        taskId: task.id,
        title: task.title,
        description: task.description,
        details: [
          `Project: ${repoContext.projectType} (${repoContext.language})`,
          `Framework: ${repoContext.framework || 'N/A'}`,
          `Auto-approve: ${autoApprove ? 'Yes' : 'No'}`,
          skipStages.length > 0 ? `Skip stages: ${skipStages.join(', ')}` : 'All stages enabled',
        ],
      });
      
      if (!approved) {
        Logger.warning('Workflow cancelled by user');
        await store.updateStatus(task.id, 'draft');
        process.exit(0);
      }
    }
    
    // Step 4: Generate orchestrator prompt
    Logger.info('Step 3: Generating orchestrator prompt...');
    const orchestratorOptions: OrchestratorOptions = {
      autoApprove,
      interactive,
      skipStages,
    };
    
    const prompt = generateOrchestratorPrompt(task, repoContext, orchestratorOptions);
    Logger.success('Prompt generated');
    Logger.newline();
    
    // Step 5: Display prompt
    Logger.box('Bob Orchestrator Prompt');
    console.log(chalk.gray(prompt));
    Logger.newline();
    
    Logger.header('Instructions');
    Logger.prompt('1. Copy the entire prompt above');
    Logger.prompt('2. Open Bob IDE');
    Logger.prompt('3. Paste the prompt into Bob');
    Logger.prompt('4. Wait for Bob to complete all SDLC stages');
    Logger.prompt('5. Copy Bob\'s complete JSON response');
    Logger.prompt('6. Return here and paste the response');
    Logger.newline();
    
    // Step 6: Wait for Bob's response
    const { bobResponse } = await inquirer.prompt([
      {
        type: 'editor',
        name: 'bobResponse',
        message: 'Paste Bob\'s complete response here (opens editor):',
      },
    ]);
    
    if (!bobResponse || bobResponse.trim().length === 0) {
      Logger.error('No response provided');
      await store.updateStatus(task.id, 'draft');
      process.exit(1);
    }
    
    // Step 7: Parse Bob's response
    Logger.info('Step 4: Parsing orchestrator response...');
    let result;
    
    try {
      result = parseOrchestratorResponse(bobResponse);
      Logger.success('Response parsed successfully');
    } catch (error) {
      Logger.error(`Failed to parse response: ${error instanceof Error ? error.message : 'Unknown error'}`);
      await store.updateStatus(task.id, 'draft');
      throw error;
    }
    
    Logger.newline();
    
    // Step 8: Validate artifacts
    Logger.info('Step 5: Validating artifacts...');
    const validation = validateArtifacts(result);
    
    if (validation.valid) {
      Logger.success('All artifacts validated');
    } else {
      Logger.warning(`Missing artifacts: ${validation.missing.join(', ')}`);
    }
    Logger.newline();
    
    // Step 9: Save artifacts to context
    Logger.info('Step 6: Saving artifacts...');
    
    if (result.artifacts.requirements) {
      await contextMgr.storeContext(task.id, 'requirements', result.artifacts.requirements, {
        source: 'Bob Orchestrator',
        stage: 'run',
        tokenEstimate: JSON.stringify(result.artifacts.requirements).length / 4,
        reusable: true,
      });
    }
    
    if (result.artifacts.implementationPlan) {
      await contextMgr.storeContext(task.id, 'implementationPlan', result.artifacts.implementationPlan, {
        source: 'Bob Orchestrator',
        stage: 'run',
        tokenEstimate: JSON.stringify(result.artifacts.implementationPlan).length / 4,
        reusable: true,
      });
    }
    
    if (result.artifacts.codeChanges) {
      await contextMgr.storeContext(task.id, 'codeChanges', result.artifacts.codeChanges, {
        source: 'Bob Orchestrator',
        stage: 'run',
        tokenEstimate: JSON.stringify(result.artifacts.codeChanges).length / 4,
        reusable: true,
      });
    }
    
    if (result.artifacts.reviewReport) {
      await contextMgr.storeContext(task.id, 'reviewReport', result.artifacts.reviewReport, {
        source: 'Bob Orchestrator',
        stage: 'run',
        tokenEstimate: JSON.stringify(result.artifacts.reviewReport).length / 4,
        reusable: true,
      });
    }
    
    if (result.artifacts.prDescription) {
      await contextMgr.storeContext(task.id, 'prDescription', result.artifacts.prDescription, {
        source: 'Bob Orchestrator',
        stage: 'run',
        tokenEstimate: JSON.stringify(result.artifacts.prDescription).length / 4,
        reusable: true,
      });
    }
    
    Logger.success('All artifacts saved');
    Logger.newline();
    
    // Step 10: Update task status
    const finalStatus = result.status === 'success' ? 'complete' : 'reviewing';
    await store.updateStatus(task.id, finalStatus);
    
    // Step 11: Display summary
    Logger.header('Execution Summary');
    console.log(formatOrchestratorResult(result));
    Logger.newline();
    
    if (result.status === 'success') {
      Logger.success('✅ Workflow completed successfully!');
      Logger.newline();
      
      // Display PR description if available
      if (result.artifacts.prDescription) {
        Logger.header('PR Description');
        Logger.info(`Title: ${result.artifacts.prDescription.title}`);
        Logger.newline();
        
        // Save PR description to file
        const prPath = `.ai-sdlc/tasks/${task.id}/pr-description.md`;
        await store.savePRDescription(task.id, result.artifacts.prDescription.body);
        Logger.success(`PR description saved to: ${chalk.cyan(prPath)}`);
        Logger.newline();
      }
      
      // Display next steps
      Logger.header('Next Steps');
      Logger.prompt('1. Review the generated code and artifacts');
      Logger.prompt('2. Run tests to verify implementation');
      Logger.prompt('3. Create a pull request with the generated description');
      
      if (await git.isGitRepo()) {
        const branch = result.artifacts.codeChanges?.branch || `feature/${task.id.toLowerCase()}`;
        Logger.prompt(`4. Push branch: git push origin ${branch}`);
      }
      
    } else if (result.status === 'partial') {
      Logger.warning('⚠️  Workflow partially completed');
      Logger.info(`Completed stages: ${result.completedStages.join(', ')}`);
      
      if (result.errors && result.errors.length > 0) {
        Logger.newline();
        Logger.header('Errors');
        result.errors.forEach(error => {
          Logger.error(`[${error.stage}] ${error.message}`);
        });
      }
      
      Logger.newline();
      Logger.header('Next Steps');
      Logger.prompt('1. Review the errors above');
      Logger.prompt('2. Fix any issues manually');
      Logger.prompt(`3. Resume workflow: ai-sdlc run "${title}" --resume`);
      
    } else {
      Logger.error('❌ Workflow failed');
      
      if (result.errors && result.errors.length > 0) {
        Logger.newline();
        Logger.header('Errors');
        result.errors.forEach(error => {
          Logger.error(`[${error.stage}] ${error.message}`);
        });
      }
      
      Logger.newline();
      Logger.header('Next Steps');
      Logger.prompt('1. Review the errors above');
      Logger.prompt('2. Fix any issues');
      Logger.prompt(`3. Retry: ai-sdlc run "${title}"`);
    }
    
    Logger.newline();
    
    // Display approval summary if interactive
    if (interactive) {
      approvalMgr.displayApprovalSummary(task.id);
      Logger.newline();
    }
    
  } catch (error) {
    Logger.error(`Run command failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

// Made with Bob