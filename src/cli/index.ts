#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init';
import { newCommand } from './commands/new';
import { analyzeCommand } from './commands/analyze';
import { generateCommand } from './commands/generate';
import { reviewCommand } from './commands/review';
import { prCommand } from './commands/pr';
import { runCommand } from './commands/run';

const program = new Command();

program
  .name('ai-sdlc')
  .description('AI-powered SDLC workflow automation with IBM Bob')
  .version('1.0.0');

// Init command
program
  .command('init')
  .description('Initialize AI SDLC wrapper in current repository')
  .action(async () => {
    try {
      await initCommand();
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// New command
program
  .command('new <title>')
  .description('Create a new feature task')
  .option('-d, --description <desc>', 'Feature description')
  .action(async (title: string, options: { description?: string }) => {
    try {
      await newCommand(title, options);
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Analyze command
program
  .command('analyze <taskId>')
  .description('Analyze requirements using Bob Plan mode')
  .action(async (taskId: string) => {
    try {
      await analyzeCommand(taskId);
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Generate command
program
  .command('generate <taskId>')
  .description('Generate implementation prompts for Bob Code mode')
  .action(async (taskId: string) => {
    try {
      await generateCommand(taskId);
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Review command
program
  .command('review <taskId>')
  .description('Run code review with Bob')
  .action(async (taskId: string) => {
    try {
      await reviewCommand(taskId);
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// PR command
program
  .command('pr <taskId>')
  .description('Generate PR description from changes')
  .action(async (taskId: string) => {
    try {
      await prCommand(taskId);
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Run command (automated workflow)
program
  .command('run <title>')
  .description('Execute complete SDLC workflow (automated)')
  .option('-d, --description <desc>', 'Feature description')
  .option('-a, --auto-approve', 'Skip approval gates (full automation)')
  .option('-i, --interactive', 'Interactive mode with progress updates')
  .option('--skip-stages <stages>', 'Skip specific stages (comma-separated)')
  .action(async (title: string, options: {
    description?: string;
    autoApprove?: boolean;
    interactive?: boolean;
    skipStages?: string;
  }) => {
    try {
      await runCommand(title, options);
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Parse arguments
program.parse();

// Made with Bob
