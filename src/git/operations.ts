import simpleGit, { SimpleGit } from 'simple-git';
import { CodeChanges } from '../core/types';

export interface GitDiff {
  summary: {
    filesChanged: number;
    insertions: number;
    deletions: number;
  };
  files: Array<{
    path: string;
    status: 'added' | 'modified' | 'deleted' | 'renamed';
    additions: number;
    deletions: number;
  }>;
  fullDiff: string;
}

export class GitService {
  private git: SimpleGit;
  private repoPath: string;
  
  constructor(repoPath: string = process.cwd()) {
    this.repoPath = repoPath;
    this.git = simpleGit(repoPath);
  }
  
  /**
   * Create a feature branch for a task
   */
  async createFeatureBranch(taskId: string): Promise<string> {
    const branchName = `feature/${taskId.toLowerCase()}`;
    
    // Check if branch already exists
    const branches = await this.git.branchLocal();
    if (branches.all.includes(branchName)) {
      // Switch to existing branch
      await this.git.checkout(branchName);
      return branchName;
    }
    
    // Create and checkout new branch
    await this.git.checkoutLocalBranch(branchName);
    return branchName;
  }
  
  /**
   * Get current branch name
   */
  async getCurrentBranch(): Promise<string> {
    const branch = await this.git.branchLocal();
    return branch.current;
  }
  
  /**
   * Switch to a branch
   */
  async switchBranch(branch: string): Promise<void> {
    await this.git.checkout(branch);
  }
  
  /**
   * Get diff between two branches/commits
   */
  async getDiff(base: string = 'main', head: string = 'HEAD'): Promise<GitDiff> {
    try {
      // Get diff summary
      const diffSummary = await this.git.diffSummary([base, head]);
      
      // Get full diff text
      const fullDiff = await this.git.diff([base, head]);
      
      return {
        summary: {
          filesChanged: diffSummary.files.length,
          insertions: diffSummary.insertions,
          deletions: diffSummary.deletions,
        },
        files: diffSummary.files.map((file: any) => ({
          path: file.file,
          status: this.mapFileStatus(file),
          additions: file.insertions || 0,
          deletions: file.deletions || 0,
        })),
        fullDiff,
      };
    } catch (error) {
      // If base branch doesn't exist, return empty diff
      return {
        summary: { filesChanged: 0, insertions: 0, deletions: 0 },
        files: [],
        fullDiff: '',
      };
    }
  }
  
  /**
   * Get list of changed files
   */
  async getChangedFiles(): Promise<string[]> {
    const status = await this.git.status();
    return [
      ...status.modified,
      ...status.created,
      ...status.deleted,
      ...status.renamed.map(r => r.to),
    ];
  }
  
  /**
   * Get commit history between two refs
   */
  async getCommitHistory(from: string = 'main', to: string = 'HEAD'): Promise<Array<{
    hash: string;
    message: string;
    timestamp: string;
  }>> {
    try {
      const log = await this.git.log({ from, to });
      return log.all.map(commit => ({
        hash: commit.hash,
        message: commit.message,
        timestamp: commit.date,
      }));
    } catch (error) {
      return [];
    }
  }
  
  /**
   * Stage files
   */
  async stageFiles(files: string[]): Promise<void> {
    await this.git.add(files);
  }
  
  /**
   * Commit changes
   */
  async commit(message: string): Promise<void> {
    await this.git.commit(message);
  }
  
  /**
   * Push branch to remote
   */
  async push(branch: string, remote: string = 'origin'): Promise<void> {
    await this.git.push(remote, branch);
  }
  
  /**
   * Check if repository is a git repo
   */
  async isGitRepo(): Promise<boolean> {
    try {
      await this.git.status();
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Get code changes for a task
   */
  async getCodeChanges(taskId: string, baseBranch: string = 'main'): Promise<CodeChanges> {
    const branchName = `feature/${taskId.toLowerCase()}`;
    
    // Get diff
    const diff = await this.getDiff(baseBranch, branchName);
    
    // Get commits
    const commits = await this.getCommitHistory(baseBranch, branchName);
    
    // Categorize files
    const filesModified: string[] = [];
    const filesAdded: string[] = [];
    const filesDeleted: string[] = [];
    
    diff.files.forEach(file => {
      if (file.status === 'added') {
        filesAdded.push(file.path);
      } else if (file.status === 'deleted') {
        filesDeleted.push(file.path);
      } else {
        filesModified.push(file.path);
      }
    });
    
    return {
      branch: branchName,
      filesModified,
      filesAdded,
      filesDeleted,
      linesAdded: diff.summary.insertions,
      linesDeleted: diff.summary.deletions,
      commits,
    };
  }
  
  /**
   * Map simple-git file status to our status type
   */
  private mapFileStatus(file: any): 'added' | 'modified' | 'deleted' | 'renamed' {
    // simple-git doesn't provide explicit status, infer from changes
    if (file.insertions > 0 && file.deletions === 0) {
      return 'added';
    } else if (file.insertions === 0 && file.deletions > 0) {
      return 'deleted';
    } else {
      return 'modified';
    }
  }
}

// Made with Bob
