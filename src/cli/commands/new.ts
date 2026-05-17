import inquirer from 'inquirer';
import fs from 'fs/promises';
import path from 'path';
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
    
    // Check if description is a file path and read it
    if (description) {
      try {
        // Detect if it's a file path (ends with .md or contains path separators)
        const isFilePath = description.endsWith('.md') ||
                          description.includes('/') ||
                          description.includes('\\');
        
        if (isFilePath) {
          const filePath = path.resolve(description);
          const fileContent = await fs.readFile(filePath, 'utf-8');
          description = fileContent.trim();
          Logger.info(`Loaded description from file: ${path.basename(description)}`);
        }
      } catch (error) {
        // If file doesn't exist or can't be read, treat as regular string
        Logger.warning(`Could not read file "${description}", using as text description`);
      }
    }
    
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
