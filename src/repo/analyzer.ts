import fs from 'fs/promises';
import path from 'path';
import { RepoContext, FileNode } from '../core/types';

export class RepositoryAnalyzer {
  private rootDir: string;
  private ignorePatterns = [
    'node_modules',
    '.git',
    'dist',
    'build',
    '.ai-sdlc',
    'coverage',
    '.next',
    '__pycache__',
    'venv',
    '.venv',
    'target',
  ];
  
  constructor(rootDir: string = process.cwd()) {
    this.rootDir = rootDir;
  }
  
  /**
   * Analyze the repository and extract context
   */
  async analyze(): Promise<RepoContext> {
    const [projectType, dependencies, fileTree] = await Promise.all([
      this.detectProjectType(),
      this.parseDependencies(),
      this.buildFileTree(),
    ]);
    
    const patterns = await this.detectPatterns();
    const relevantFiles = await this.identifyRelevantFiles();
    
    return {
      projectType: projectType.type,
      framework: projectType.framework,
      language: projectType.language,
      dependencies,
      fileTree,
      patterns,
      relevantFiles,
    };
  }
  
  /**
   * Detect project type, framework, and language
   */
  private async detectProjectType(): Promise<{
    type: string;
    framework?: string;
    language: string;
  }> {
    // Check for package.json (Node.js)
    if (await this.fileExists('package.json')) {
      const pkg = await this.readJson('package.json');
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      let framework: string | undefined;
      if (deps.express) framework = 'Express';
      else if (deps.react) framework = 'React';
      else if (deps.next) framework = 'Next.js';
      else if (deps['@nestjs/core']) framework = 'NestJS';
      else if (deps.vue) framework = 'Vue';
      else if (deps['@angular/core']) framework = 'Angular';
      
      return {
        type: 'Node.js',
        framework,
        language: deps.typescript || deps['@types/node'] ? 'TypeScript' : 'JavaScript',
      };
    }
    
    // Check for requirements.txt (Python)
    if (await this.fileExists('requirements.txt')) {
      const content = await fs.readFile(
        path.join(this.rootDir, 'requirements.txt'),
        'utf-8'
      );
      
      let framework: string | undefined;
      if (content.includes('django')) framework = 'Django';
      else if (content.includes('flask')) framework = 'Flask';
      else if (content.includes('fastapi')) framework = 'FastAPI';
      
      return { type: 'Python', framework, language: 'Python' };
    }
    
    // Check for pom.xml (Java/Maven)
    if (await this.fileExists('pom.xml')) {
      return { type: 'Java', framework: 'Maven', language: 'Java' };
    }
    
    // Check for build.gradle (Java/Gradle)
    if (await this.fileExists('build.gradle') || await this.fileExists('build.gradle.kts')) {
      return { type: 'Java', framework: 'Gradle', language: 'Java' };
    }
    
    // Check for Cargo.toml (Rust)
    if (await this.fileExists('Cargo.toml')) {
      return { type: 'Rust', language: 'Rust' };
    }
    
    // Check for go.mod (Go)
    if (await this.fileExists('go.mod')) {
      return { type: 'Go', language: 'Go' };
    }
    
    return { type: 'Unknown', language: 'Unknown' };
  }
  
  /**
   * Parse project dependencies
   */
  private async parseDependencies(): Promise<Record<string, string>> {
    // Node.js
    if (await this.fileExists('package.json')) {
      const pkg = await this.readJson('package.json');
      return { ...pkg.dependencies, ...pkg.devDependencies };
    }
    
    // Python
    if (await this.fileExists('requirements.txt')) {
      const content = await fs.readFile(
        path.join(this.rootDir, 'requirements.txt'),
        'utf-8'
      );
      
      const deps: Record<string, string> = {};
      content.split('\n').forEach(line => {
        const match = line.match(/^([^=<>]+)[=<>]+(.+)$/);
        if (match) {
          deps[match[1].trim()] = match[2].trim();
        }
      });
      return deps;
    }
    
    return {};
  }
  
  /**
   * Build file tree structure
   */
  private async buildFileTree(
    dir: string = this.rootDir,
    relativePath: string = '',
    depth: number = 0,
    maxDepth: number = 3
  ): Promise<FileNode[]> {
    if (depth > maxDepth) return [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const nodes: FileNode[] = [];
      
      for (const entry of entries) {
        if (this.shouldIgnore(entry.name)) continue;
        
        const fullPath = path.join(dir, entry.name);
        const relPath = path.join(relativePath, entry.name);
        
        if (entry.isDirectory()) {
          const children = await this.buildFileTree(fullPath, relPath, depth + 1, maxDepth);
          nodes.push({
            name: entry.name,
            path: relPath,
            type: 'directory',
            children,
          });
        } else {
          nodes.push({
            name: entry.name,
            path: relPath,
            type: 'file',
          });
        }
      }
      
      return nodes;
    } catch (error) {
      return [];
    }
  }
  
  /**
   * Detect common code patterns
   */
  private async detectPatterns(): Promise<{
    routePattern?: string;
    controllerPattern?: string;
    testPattern?: string;
  }> {
    const patterns: any = {};
    
    // Detect route patterns
    if (await this.fileExists('src/routes')) {
      patterns.routePattern = 'src/routes/*.ts';
    } else if (await this.fileExists('routes')) {
      patterns.routePattern = 'routes/*.js';
    } else if (await this.fileExists('app/routes')) {
      patterns.routePattern = 'app/routes/*.py';
    }
    
    // Detect controller patterns
    if (await this.fileExists('src/controllers')) {
      patterns.controllerPattern = 'src/controllers/*.ts';
    } else if (await this.fileExists('controllers')) {
      patterns.controllerPattern = 'controllers/*.js';
    } else if (await this.fileExists('app/controllers')) {
      patterns.controllerPattern = 'app/controllers/*.py';
    }
    
    // Detect test patterns
    if (await this.fileExists('tests')) {
      patterns.testPattern = 'tests/**/*.test.ts';
    } else if (await this.fileExists('test')) {
      patterns.testPattern = 'test/**/*.test.js';
    } else if (await this.fileExists('__tests__')) {
      patterns.testPattern = '__tests__/**/*.test.ts';
    } else if (await this.fileExists('src/__tests__')) {
      patterns.testPattern = 'src/**/*.test.ts';
    }
    
    return patterns;
  }
  
  /**
   * Identify relevant files for common entry points
   */
  private async identifyRelevantFiles(): Promise<Array<{
    path: string;
    reason: string;
    confidence: number;
  }>> {
    const relevantFiles: Array<{
      path: string;
      reason: string;
      confidence: number;
    }> = [];
    
    // Node.js entry points
    if (await this.fileExists('src/index.ts')) {
      relevantFiles.push({
        path: 'src/index.ts',
        reason: 'Main application entry point',
        confidence: 0.9,
      });
    } else if (await this.fileExists('src/index.js')) {
      relevantFiles.push({
        path: 'src/index.js',
        reason: 'Main application entry point',
        confidence: 0.9,
      });
    }
    
    if (await this.fileExists('src/app.ts')) {
      relevantFiles.push({
        path: 'src/app.ts',
        reason: 'Application configuration',
        confidence: 0.9,
      });
    } else if (await this.fileExists('src/app.js')) {
      relevantFiles.push({
        path: 'src/app.js',
        reason: 'Application configuration',
        confidence: 0.9,
      });
    }
    
    // Python entry points
    if (await this.fileExists('main.py')) {
      relevantFiles.push({
        path: 'main.py',
        reason: 'Main application entry point',
        confidence: 0.9,
      });
    }
    
    if (await this.fileExists('app.py')) {
      relevantFiles.push({
        path: 'app.py',
        reason: 'Application entry point',
        confidence: 0.9,
      });
    }
    
    // Configuration files
    if (await this.fileExists('package.json')) {
      relevantFiles.push({
        path: 'package.json',
        reason: 'Project configuration and dependencies',
        confidence: 1.0,
      });
    }
    
    return relevantFiles;
  }
  
  /**
   * Check if a file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(path.join(this.rootDir, filePath));
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Read and parse JSON file
   */
  private async readJson(filePath: string): Promise<any> {
    const content = await fs.readFile(
      path.join(this.rootDir, filePath),
      'utf-8'
    );
    return JSON.parse(content);
  }
  
  /**
   * Check if a file/directory should be ignored
   */
  private shouldIgnore(name: string): boolean {
    return this.ignorePatterns.some(pattern => name.includes(pattern));
  }
}

// Made with Bob
