import inquirer from 'inquirer';
import { TaskStore } from '../../core/task-store';
import { Logger } from '../../utils/logger';

interface NewCommandOptions {
  description?: string;
}

export async function newCommand(
  title: string,
  options: NewCommandOptions
): Promise<void> {
  try {
    const store = new TaskStore();
    
    // Check if initialized
    if (!(await store.isInitialized())) {
      Logger.error('AI SDLC not initialized. Run: ai-sdlc init');
      process.exit(1);
    }
    
    await store.initialize();
    
    let description = options.description;
    
    // Prompt for description if not provided
    if (!description) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'description',
          message: 'Brief description (optional):',
        },
      ]);
      description = answers.description;
    }
    
    // Create task
    const task = await store.createTask(title, description);
    
    Logger.success(`Created task ${Logger.info.name}${task.id}${Logger.success.name}: "${title}"`);
    Logger.newline();
    Logger.header('Next Step');
    Logger.prompt(`ai-sdlc analyze ${task.id}`);
    Logger.newline();
    
  } catch (error) {
    Logger.error(`Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

// Made with Bob
