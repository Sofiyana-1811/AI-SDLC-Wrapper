import fs from 'fs/promises';
import path from 'path';
import { RepositoryAnalyzer } from '../../repo/analyzer';
import { Config, ConfigSchema } from '../../core/types';
import { Logger } from '../../utils/logger';

export async function initCommand(): Promise<void> {
  Logger.header('Initializing AI SDLC Wrapper');
  
  // Check if already initialized
  const aiSdlcDir = '.ai-sdlc';
  try {
    await fs.access(aiSdlcDir);
    Logger.warning('Already initialized!');
    Logger.info('Directory .ai-sdlc already exists');
    return;
  } catch {
    // Not initialized, continue
  }
  
  try {
    // Create directory structure
    await fs.mkdir(path.join(aiSdlcDir, 'tasks'), { recursive: true });
    await fs.mkdir('.bob/skills', { recursive: true });
    
    Logger.success('Created directory structure');
    
    // Analyze repository
    Logger.info('Analyzing repository...');
    const analyzer = new RepositoryAnalyzer();
    const context = await analyzer.analyze();
    
    Logger.success(`Analyzed repository (${context.projectType} project)`);
    if (context.framework) {
      Logger.info(`Framework detected: ${context.framework}`);
    }
    Logger.info(`Language: ${context.language}`);
    
    // Save configuration
    const config: Config = {
      version: '2.0.0',
      projectType: context.projectType,
      framework: context.framework,
      language: context.language,
      initializedAt: new Date().toISOString(),
      automation: {
        autoApprove: false,
        approvalTimeout: 300,
        retryOnFailure: true,
        maxRetries: 3,
      },
      orchestrator: {
        enabled: true,
        defaultMode: 'interactive',
        skipStages: [],
      },
    };
    
    await fs.writeFile(
      path.join(aiSdlcDir, 'config.json'),
      JSON.stringify(config, null, 2)
    );
    
    Logger.success('Created configuration file');
    Logger.info('Automation settings: Interactive mode (approval gates enabled)');
    
    // Display next steps
    Logger.newline();
    Logger.header('Next Steps');
    Logger.prompt('1. Open this project in Bob IDE');
    Logger.prompt('2. Run /init to generate AGENTS.md');
    Logger.prompt('3. Create your first feature: ai-sdlc new "Your feature description"');
    Logger.newline();
    
  } catch (error) {
    Logger.error(`Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

// Made with Bob
