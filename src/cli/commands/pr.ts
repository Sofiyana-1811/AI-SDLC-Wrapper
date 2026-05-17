import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { TaskStore } from '../../core/task-store';
import { GitService } from '../../git/operations';
import { generatePRDescription, generatePRTitle } from '../../prompts/pr-prompt';
import { Logger } from '../../utils/logger';

export async function prCommand(taskId: string): Promise<void> {
  try {
    const store = new TaskStore();
    const task = await store.getTask(taskId);
    
    if (!task) {
      Logger.error(`Task ${taskId} not found`);
      process.exit(1);
    }
    
    if (task.status !== 'reviewing') {
      Logger.warning(`Task status is ${task.status}, expected 'reviewing'`);
    }
    
    Logger.header(`Generating PR Description: ${task.title}`);
    Logger.newline();
    
    // Get git diff if not already in artifacts
    let diff;
    if (task.artifacts.codeChanges) {
      // Reconstruct diff from code changes
      diff = {
        summary: {
          filesChanged: task.artifacts.codeChanges.filesModified.length + 
                       task.artifacts.codeChanges.filesAdded.length + 
                       task.artifacts.codeChanges.filesDeleted.length,
          insertions: task.artifacts.codeChanges.linesAdded,
          deletions: task.artifacts.codeChanges.linesDeleted,
        },
        files: [
          ...task.artifacts.codeChanges.filesModified.map(f => ({
            path: f,
            status: 'modified' as const,
            additions: 0,
            deletions: 0,
          })),
          ...task.artifacts.codeChanges.filesAdded.map(f => ({
            path: f,
            status: 'added' as const,
            additions: 0,
            deletions: 0,
          })),
          ...task.artifacts.codeChanges.filesDeleted.map(f => ({
            path: f,
            status: 'deleted' as const,
            additions: 0,
            deletions: 0,
          })),
        ],
        fullDiff: '',
      };
    } else {
      // Get fresh diff
      const git = new GitService();
      try {
        diff = await git.getDiff('main', 'HEAD');
      } catch (error) {
        Logger.warning('Could not get git diff');
        diff = {
          summary: { filesChanged: 0, insertions: 0, deletions: 0 },
          files: [],
          fullDiff: '',
        };
      }
    }
    
    // Generate PR description
    const prTitle = generatePRTitle(task);
    const prBody = generatePRDescription(task, diff);
    
    // Save PR description to file
    const prDir = path.join('.ai-sdlc', 'tasks', taskId);
    await fs.mkdir(prDir, { recursive: true });
    const prFile = path.join(prDir, 'pr-description.md');
    await fs.writeFile(prFile, `# ${prTitle}\n\n${prBody}`);
    
    Logger.success(`PR description saved to: ${prFile}`);
    Logger.newline();
    
    // Display PR description
    Logger.box('Pull Request Description');
    console.log(chalk.gray(prBody));
    Logger.newline();
    
    // Update task
    await store.updateTask(taskId, {
      status: 'complete',
      artifacts: {
        ...task.artifacts,
        prDescription: {
          title: prTitle,
          body: prBody,
        },
      },
    });
    
    Logger.success(`Task status: ${chalk.cyan('reviewing')} → ${chalk.cyan('complete')}`);
    Logger.newline();
    
    // Display next steps
    Logger.header('Next Steps');
    Logger.prompt('Option 1: Copy the description above and create PR manually');
    Logger.prompt(`Option 2: Use GitHub CLI:`);
    Logger.info(`  gh pr create --title "${prTitle}" --body-file "${prFile}"`);
    Logger.newline();
    
    Logger.success('🎉 Feature complete! Ready for pull request.');
    Logger.newline();
    
  } catch (error) {
    Logger.error(`PR generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

// Made with Bob
