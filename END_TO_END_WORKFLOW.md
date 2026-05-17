# AI SDLC Wrapper - End-to-End Workflow Explanation

## 🎯 Overview

This document explains the complete end-to-end workflow of the AI SDLC Wrapper tool, from installation to PR creation, including all internal processes, data flows, and component interactions.

---

## 📊 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     AI SDLC Wrapper Tool                         │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   CLI Layer  │  │  Core Layer  │  │  Git Layer   │          │
│  │              │  │              │  │              │          │
│  │ - Commands   │  │ - TaskStore  │  │ - Operations │          │
│  │ - Options    │  │ - Context    │  │ - Branches   │          │
│  │ - Prompts    │  │ - Approval   │  │ - Commits    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Prompt Layer │  │  Repo Layer  │  │  Utils Layer │          │
│  │              │  │              │  │              │          │
│  │ - Templates  │  │ - Analyzer   │  │ - Parser     │          │
│  │ - Engine     │  │ - Context    │  │ - Logger     │          │
│  │ - Generator  │  │ - Patterns   │  │ - Validator  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↕
                    ┌─────────────────┐
                    │   File System   │
                    │                 │
                    │  .ai-sdlc/      │
                    │  .bob/skills/   │
                    │  .git/          │
                    └─────────────────┘
                              ↕
                    ┌─────────────────┐
                    │    Bob IDE      │
                    │                 │
                    │  Plan Mode      │
                    │  Code Mode      │
                    │  Review Mode    │
                    └─────────────────┘
```

---

## 🔄 Complete Workflow Stages

### Stage 0: Installation & Setup

#### What Happens:
```
Developer Machine
    ↓
1. Clone repository
2. npm install (downloads dependencies)
3. npm run build (compiles TypeScript to JavaScript)
4. npm link (makes 'ai-sdlc' command available globally)
    ↓
Tool Ready
```

#### Internal Process:
```typescript
// tsup.config.ts compiles:
src/cli/index.ts → dist/index.js (ESM format)
src/**/*.ts → dist/**/*.js

// package.json bin field:
"ai-sdlc" → dist/index.js

// Shebang in dist/index.js:
#!/usr/bin/env node
```

#### Files Created:
- `dist/index.js` - Main executable
- `dist/index.d.ts` - TypeScript definitions
- `node_modules/` - Dependencies

---

### Stage 1: Project Initialization

#### Command:
```bash
cd /path/to/your-project
ai-sdlc init
```

#### What Happens:

```
User runs: ai-sdlc init
    ↓
CLI Layer (src/cli/index.ts)
    ↓ parses command
CLI Command (src/cli/commands/init.ts)
    ↓ executes initCommand()
    ↓
1. Check if already initialized
    ├─ Look for .ai-sdlc/config.json
    └─ Exit if exists
    ↓
2. Create directory structure
    ├─ mkdir .ai-sdlc/
    ├─ mkdir .ai-sdlc/tasks/
    └─ mkdir .bob/skills/
    ↓
3. Analyze repository
    ├─ RepositoryAnalyzer.analyze()
    ├─ Detect project type (Node.js, Python, etc.)
    ├─ Detect language
    ├─ Read package.json/requirements.txt
    ├─ Extract dependencies
    ├─ Build file tree
    └─ Identify patterns
    ↓
4. Create configuration
    ├─ Generate config.json
    ├─ Set automation settings
    └─ Save project metadata
    ↓
5. Copy Bob skills
    ├─ Copy sdlc-plan.md
    ├─ Copy sdlc-code.md
    ├─ Copy sdlc-review.md
    └─ Copy sdlc-deliver.md
    ↓
Success: Project initialized
```

#### Data Flow:

```
Input: None (uses current directory)
    ↓
Process:
    RepositoryAnalyzer
        ↓ reads
    File System (package.json, src/, etc.)
        ↓ analyzes
    Project Metadata
        ↓ generates
    Configuration Object
        ↓ writes
    .ai-sdlc/config.json
    ↓
Output: Initialized project structure
```

#### Files Created:
```
.ai-sdlc/
├── config.json          # Project configuration
└── tasks/               # Task storage directory

.bob/
└── skills/
    ├── sdlc-plan.md     # Requirements analysis skill
    ├── sdlc-code.md     # Implementation skill
    ├── sdlc-review.md   # Code review skill
    └── sdlc-deliver.md  # PR generation skill
```

#### config.json Structure:
```json
{
  "version": "2.0.0",
  "projectType": "Node.js",
  "language": "JavaScript",
  "initializedAt": "2026-05-17T12:00:00.000Z",
  "automation": {
    "autoApprove": false,
    "approvalTimeout": 300,
    "retryOnFailure": true,
    "maxRetries": 3
  },
  "orchestrator": {
    "enabled": true,
    "defaultMode": "interactive",
    "skipStages": []
  }
}
```

---

### Stage 2: Task Creation

#### Command:
```bash
ai-sdlc new "Feature title" -d issue-file.md
```

#### What Happens:

```
User runs: ai-sdlc new "Feature" -d issue.md
    ↓
CLI Layer
    ↓ parses command and options
CLI Command (src/cli/commands/new.ts)
    ↓ executes newCommand(title, options)
    ↓
1. Check initialization
    ├─ TaskStore.isInitialized()
    └─ Exit if not initialized
    ↓
2. Load description
    ├─ If -d is file path: read file
    └─ If -d is text: use directly
    ↓
3. Generate task ID
    ├─ List existing tasks
    ├─ Find highest number (e.g., FEATURE-003)
    └─ Increment (FEATURE-004)
    ↓
4. Create task object
    ├─ Set id, title, description
    ├─ Set status: "draft"
    ├─ Set timestamps
    └─ Initialize empty artifacts
    ↓
5. Save task
    ├─ TaskStore.createTask()
    └─ Write to .ai-sdlc/tasks/FEATURE-004.json
    ↓
Success: Task FEATURE-004 created
```

#### Data Flow:

```
Input:
    title: "Integrate A2A Agents"
    description: "issue-4772.md" (file path)
    ↓
Process:
    Read issue file
        ↓
    Create Task object
        {
          id: "FEATURE-004",
          title: "...",
          description: "...",
          status: "draft",
          createdAt: "...",
          updatedAt: "...",
          artifacts: {},
          accumulatedContext: {}
        }
        ↓
    Write to file system
        ↓
    .ai-sdlc/tasks/FEATURE-004.json
    ↓
Output: Task ID (FEATURE-004)
```

#### Task File Structure:
```json
{
  "id": "FEATURE-004",
  "title": "Integrate A2A Agents into Plugin Framework",
  "description": "Full issue content...",
  "status": "draft",
  "createdAt": "2026-05-17T12:00:00.000Z",
  "updatedAt": "2026-05-17T12:00:00.000Z",
  "artifacts": {},
  "accumulatedContext": {}
}
```

---

### Stage 3: Requirements Analysis

#### Command:
```bash
ai-sdlc analyze FEATURE-004
```

#### What Happens:

```
User runs: ai-sdlc analyze FEATURE-004
    ↓
CLI Command (src/cli/commands/analyze.ts)
    ↓ executes analyzeCommand(taskId)
    ↓
1. Load task
    ├─ TaskStore.getTask(FEATURE-004)
    └─ Exit if not found
    ↓
2. Get repository context
    ├─ Check cache: ContextManager.getContext()
    ├─ If cached: use existing
    └─ If not: RepositoryAnalyzer.analyze()
    ↓
3. Generate prompt
    ├─ TemplateEngine.render('plan-template')
    ├─ Inject task details
    ├─ Inject repo context
    └─ Create comprehensive prompt
    ↓
4. Display prompt
    ├─ Logger.box('Bob Plan Mode Prompt')
    └─ console.log(prompt)
    ↓
5. Wait for user input
    ├─ inquirer.prompt() opens editor
    └─ User pastes Bob's response
    ↓
6. Parse response
    ├─ parsePlanResponse(bobResponse)
    ├─ Extract requirements
    ├─ Extract acceptance criteria
    ├─ Extract implementation plan
    └─ Extract test strategy
    ↓
7. Save artifacts
    ├─ ContextManager.storeContext()
    ├─ Save requirements
    ├─ Save implementation plan
    └─ Update task status: "ready"
    ↓
Success: Requirements analyzed and saved
```

#### Data Flow:

```
Input:
    taskId: "FEATURE-004"
    ↓
Load:
    Task from .ai-sdlc/tasks/FEATURE-004.json
    Repo context from cache or fresh analysis
    ↓
Generate:
    Prompt Template
        + Task details
        + Repo context
        ↓
    Complete Prompt (for Bob)
    ↓
Display:
    User copies prompt
    ↓
Bob IDE:
    User pastes prompt
    Bob analyzes
    Bob generates response
    ↓
User:
    Copies Bob's response
    Pastes back to tool
    ↓
Parse:
    Bob's Response
        ↓ extract
    Requirements Object
        {
          userStory: "...",
          acceptanceCriteria: [...],
          technicalRequirements: [...],
          dependencies: [...],
          estimatedComplexity: "medium",
          risks: [...]
        }
        ↓
    Implementation Plan Object
        {
          approach: "...",
          filesToModify: [...],
          filesToCreate: [...],
          testStrategy: "..."
        }
    ↓
Save:
    Update task.artifacts.requirements
    Update task.artifacts.implementationPlan
    Update task.status = "ready"
    Write to .ai-sdlc/tasks/FEATURE-004.json
    ↓
Output: Requirements and plan saved
```

#### Prompt Template (plan-template.md):
```markdown
# Requirements Analysis

## Task
**Title**: {{TASK_TITLE}}
**Description**: {{TASK_DESCRIPTION}}

## Repository Context
- **Type**: {{REPO_TYPE}}
- **Language**: {{REPO_LANGUAGE}}
- **Framework**: {{REPO_FRAMEWORK}}
- **Dependencies**: {{REPO_DEPENDENCIES}}

## Patterns
- **Routes**: {{ROUTE_PATTERN}}
- **Controllers**: {{CONTROLLER_PATTERN}}
- **Tests**: {{TEST_PATTERN}}

## Relevant Files
{{RELEVANT_FILES}}

## Instructions
Analyze this feature request and provide:
1. User story
2. Acceptance criteria
3. Technical requirements
4. Implementation plan
5. Test strategy
6. Estimated complexity
7. Potential risks
```

---

### Stage 4: Implementation Generation

#### Command:
```bash
ai-sdlc generate FEATURE-004
```

#### What Happens:

```
User runs: ai-sdlc generate FEATURE-004
    ↓
CLI Command (src/cli/commands/generate.ts)
    ↓ executes generateCommand(taskId)
    ↓
1. Load task
    ├─ TaskStore.getTask(FEATURE-004)
    └─ Verify status is "ready"
    ↓
2. Create feature branch
    ├─ GitService.createFeatureBranch(taskId)
    ├─ Branch name: feature/feature-004
    ├─ git checkout -b feature/feature-004
    └─ Switch to new branch
    ↓
3. Load artifacts
    ├─ Get requirements
    ├─ Get implementation plan
    └─ Get repo context
    ↓
4. Generate implementation prompt
    ├─ TemplateEngine.render('code-template')
    ├─ Inject requirements
    ├─ Inject implementation plan
    ├─ Inject file patterns
    └─ Create detailed prompt
    ↓
5. Display prompt
    ├─ Logger.box('Bob Code Mode Prompt')
    └─ console.log(prompt)
    ↓
6. Update task status
    └─ status: "implementing"
    ↓
Success: Branch created, prompt displayed
```

#### Data Flow:

```
Input:
    taskId: "FEATURE-004"
    ↓
Load:
    Task with requirements and plan
    ↓
Git Operations:
    Current branch: main
        ↓ create
    New branch: feature/feature-004
        ↓ checkout
    Working on: feature/feature-004
    ↓
Generate:
    Code Template
        + Requirements
        + Implementation Plan
        + Repo Patterns
        ↓
    Implementation Prompt
    ↓
Display:
    User copies prompt
    ↓
Bob IDE:
    User pastes prompt
    Bob writes code
    Bob creates/modifies files
    ↓
File System:
    New/modified files in working directory
    ↓
User:
    Reviews Bob's code
    Commits changes
        ↓
    git add .
    git commit -m "feat: implement feature"
    ↓
Output: Code implemented, committed
```

#### Code Template (code-template.md):
```markdown
# Implementation Task

## Requirements Summary
{{REQUIREMENTS_SUMMARY}}

## Acceptance Criteria
{{ACCEPTANCE_CRITERIA}}

## Implementation Approach
{{IMPLEMENTATION_APPROACH}}

## Files to Modify
{{FILES_TO_MODIFY}}

## Files to Create
{{FILES_TO_CREATE}}

## Project Patterns
- **Routes**: {{ROUTE_PATTERN}}
- **Controllers**: {{CONTROLLER_PATTERN}}
- **Tests**: {{TEST_PATTERN}}

## Instructions
Implement this feature following:
1. Project patterns and conventions
2. Best practices for {{LANGUAGE}}
3. Error handling and validation
4. Comprehensive tests
5. Documentation updates
```

---

### Stage 5: Code Review

#### Command:
```bash
ai-sdlc review FEATURE-004
```

#### What Happens:

```
User runs: ai-sdlc review FEATURE-004
    ↓
CLI Command (src/cli/commands/review.ts)
    ↓ executes reviewCommand(taskId)
    ↓
1. Load task
    └─ TaskStore.getTask(FEATURE-004)
    ↓
2. Analyze git changes
    ├─ GitService.getDiff('main', 'feature/feature-004')
    ├─ Get changed files
    ├─ Count lines added/deleted
    └─ Get full diff
    ↓
3. Generate review prompt
    ├─ TemplateEngine.render('review-template')
    ├─ Inject requirements
    ├─ Inject git diff
    ├─ Inject changed files
    └─ Create review prompt
    ↓
4. Display prompt
    ├─ Logger.box('Bob Review Prompt')
    └─ console.log(prompt)
    ↓
5. Wait for user input
    ├─ inquirer.prompt() opens editor
    └─ User pastes Bob's review
    ↓
6. Parse review
    ├─ parseReviewResponse(bobResponse)
    ├─ Extract issues by severity
    ├─ Extract approval status
    └─ Extract recommendations
    ↓
7. Save review report
    ├─ ContextManager.storeContext()
    ├─ Save review report
    ├─ Save code changes
    └─ Update task status: "reviewing"
    ↓
Success: Review completed and saved
```

#### Data Flow:

```
Input:
    taskId: "FEATURE-004"
    ↓
Git Analysis:
    git diff main...feature/feature-004
        ↓ analyze
    Diff Summary
        {
          filesChanged: 4,
          insertions: 150,
          deletions: 20,
          files: [
            {path: "file1.py", status: "modified", ...},
            {path: "file2.py", status: "added", ...}
          ],
          fullDiff: "..."
        }
    ↓
Generate:
    Review Template
        + Requirements
        + Git Diff
        + Changed Files
        ↓
    Review Prompt
    ↓
Bob IDE:
    User pastes prompt
    Bob reviews code
    Bob generates review report
    ↓
Parse:
    Bob's Review
        ↓ extract
    Review Report
        {
          summary: "...",
          issues: [
            {severity: "critical", category: "Security", ...},
            {severity: "minor", category: "Style", ...}
          ],
          approved: true,
          reviewedAt: "..."
        }
    ↓
Save:
    Update task.artifacts.reviewReport
    Update task.artifacts.codeChanges
    Update task.status = "reviewing"
    ↓
Output: Review report saved
```

---

### Stage 6: PR Generation

#### Command:
```bash
ai-sdlc pr FEATURE-004
```

#### What Happens:

```
User runs: ai-sdlc pr FEATURE-004
    ↓
CLI Command (src/cli/commands/pr.ts)
    ↓ executes prCommand(taskId)
    ↓
1. Load task with all artifacts
    ├─ Requirements
    ├─ Implementation plan
    ├─ Code changes
    └─ Review report
    ↓
2. Analyze final changes
    ├─ GitService.getCodeChanges(taskId)
    ├─ Get commit history
    └─ Get final diff
    ↓
3. Generate PR description
    ├─ TemplateEngine.render('pr-template')
    ├─ Inject all artifacts
    ├─ Create comprehensive description
    └─ Format as markdown
    ↓
4. Save PR description
    ├─ Create directory: .ai-sdlc/tasks/FEATURE-004/
    ├─ Write: pr-description.md
    └─ Update task.artifacts.prDescription
    ↓
5. Update task status
    └─ status: "complete"
    ↓
Success: PR description generated
```

#### Data Flow:

```
Input:
    taskId: "FEATURE-004"
    ↓
Compile:
    All Artifacts
        ├─ Requirements
        ├─ Implementation Plan
        ├─ Code Changes
        └─ Review Report
        ↓
    Complete Context
    ↓
Generate:
    PR Template
        + Task Title
        + Requirements
        + Changes Made
        + Acceptance Criteria
        + Implementation Details
        + Review Findings
        + Test Strategy
        ↓
    PR Description (Markdown)
    ↓
Save:
    .ai-sdlc/tasks/FEATURE-004/pr-description.md
    Update task.artifacts.prDescription
    Update task.status = "complete"
    ↓
Output: PR description file
```

#### PR Description Structure:
```markdown
# feat: Integrate A2A Agents into Plugin Framework

## Overview
[Summary from requirements]

## Changes
- Added A2A_AGENT_METADATA constant
- Created PydanticA2AAgent schema
- Created A2AAgentPluginBinding table
- Updated invoke_agent() to fire hooks

## Acceptance Criteria Met
- [x] Criterion 1
- [x] Criterion 2
- [x] Criterion 3

## Implementation Details
### Files Modified
- file1.py - Reason
- file2.py - Reason

### Test Strategy
[From implementation plan]

## Review Findings
[From review report]

## Related Issues
- Resolves #4772

## Task ID: FEATURE-004
```

---

### Stage 7: PR Creation

#### Command:
```bash
git push origin feature/feature-004
gh pr create --body-file .ai-sdlc/tasks/FEATURE-004/pr-description.md
```

#### What Happens:

```
User runs: git push origin feature/feature-004
    ↓
Git Operations:
    Push local branch to remote
        ↓
    Remote: feature/feature-004 created
    ↓
User runs: gh pr create --body-file ...
    ↓
GitHub CLI:
    Read PR description from file
        ↓
    Create pull request
        ├─ Title: from first line
        ├─ Body: from file content
        ├─ Base: main
        └─ Head: feature/feature-004
        ↓
    GitHub API creates PR
    ↓
Success: PR #123 created
```

#### Data Flow:

```
Local:
    feature/feature-004 branch
    + commits
    + PR description file
    ↓
Push:
    git push origin feature/feature-004
        ↓
    Remote Repository
        ↓
    feature/feature-004 available on GitHub
    ↓
Create PR:
    gh pr create
        ↓ reads
    .ai-sdlc/tasks/FEATURE-004/pr-description.md
        ↓ sends to
    GitHub API
        ↓ creates
    Pull Request #123
        ├─ Title
        ├─ Description
        ├─ Base: main
        ├─ Head: feature/feature-004
        └─ Status: Open
    ↓
Output: PR URL
```

---

## 🔄 Alternative: Automated Workflow

### Command:
```bash
ai-sdlc run "Feature title" -d issue.md --auto-approve
```

### What Happens:

```
User runs: ai-sdlc run "Feature" -d issue.md --auto-approve
    ↓
CLI Command (src/cli/commands/run.ts)
    ↓ executes runCommand(title, options)
    ↓
1. Create task (Stage 2)
    ↓
2. Gather repo context
    ↓
3. Generate orchestrator prompt
    ├─ Combines all stages
    ├─ References Bob skills
    └─ Requests complete workflow
    ↓
4. Display prompt
    ↓
5. Wait for Bob's response
    ├─ User copies prompt to Bob
    ├─ Bob executes all stages internally:
    │   ├─ Analyze (uses sdlc-plan skill)
    │   ├─ Implement (uses sdlc-code skill)
    │   ├─ Review (uses sdlc-review skill)
    │   └─ Deliver (uses sdlc-deliver skill)
    └─ User pastes complete response
    ↓
6. Parse orchestrator response
    ├─ Extract requirements
    ├─ Extract implementation plan
    ├─ Extract code changes
    ├─ Extract review report
    └─ Extract PR description
    ↓
7. Save all artifacts
    ├─ Save requirements
    ├─ Save implementation plan
    ├─ Save code changes
    ├─ Save review report
    ├─ Save PR description
    └─ Update status: "complete"
    ↓
Success: All stages completed
```

### Orchestrator Response Format:
```json
{
  "status": "success",
  "completedStages": ["analyze", "implement", "review", "deliver"],
  "artifacts": {
    "requirements": {...},
    "implementationPlan": {...},
    "codeChanges": {...},
    "reviewReport": {...},
    "prDescription": {...}
  },
  "approvals": {
    "analyze": true,
    "implement": true,
    "review": true,
    "deliver": true
  },
  "errors": []
}
```

---

## 📁 File System State Tracking

### Throughout the Workflow:

```
Initial State:
your-project/
├── src/
├── package.json
└── .git/

After init:
your-project/
├── src/
├── package.json
├── .git/
├── .ai-sdlc/
│   ├── config.json
│   └── tasks/
└── .bob/
    └── skills/
        ├── sdlc-plan.md
        ├── sdlc-code.md
        ├── sdlc-review.md
        └── sdlc-deliver.md

After new:
your-project/
├── .ai-sdlc/
│   ├── config.json
│   └── tasks/
│       └── FEATURE-004.json  ← New

After analyze:
your-project/
├── .ai-sdlc/
│   └── tasks/
│       └── FEATURE-004.json  ← Updated with requirements

After generate:
your-project/
├── .git/
│   └── refs/heads/
│       └── feature/feature-004  ← New branch
└── .ai-sdlc/
    └── tasks/
        └── FEATURE-004.json  ← Updated status

After implementation:
your-project/
├── src/
│   ├── file1.py  ← Modified
│   └── file2.py  ← New
└── .git/
    └── commits  ← New commits

After review:
your-project/
└── .ai-sdlc/
    └── tasks/
        └── FEATURE-004.json  ← Updated with review

After pr:
your-project/
└── .ai-sdlc/
    └── tasks/
        ├── FEATURE-004.json  ← Status: complete
        └── FEATURE-004/
            └── pr-description.md  ← New
```

---

## 🔍 Internal Component Details

### TaskStore (src/core/task-store.ts)

**Purpose**: Manages task persistence and retrieval

**Key Methods**:
```typescript
class TaskStore {
  async initialize(): Promise<void>
  async isInitialized(): Promise<boolean>
  async createTask(title: string, description?: string): Promise<Task>
  async getTask(taskId: string): Promise<Task | null>
  async updateStatus(taskId: string, status: TaskStatus): Promise<void>
  async listTasks(): Promise<Task[]>
}
```

**Data Flow**:
```
Memory (Task object)
    ↕ serialize/deserialize
File System (.ai-sdlc/tasks/FEATURE-XXX.json)
```

---

### ContextManager (src/core/context-manager.ts)

**Purpose**: Manages artifact storage and retrieval with caching

**Key Methods**:
```typescript
class ContextManager {
  async storeContext<T>(
    taskId: string,
    contextType: string,
    data: T,
    metadata: ContextMetadata
  ): Promise<void>
  
  async getContext<T>(
    taskId: string,
    contextType: string
  ): Promise<T | null>
}
```

**Context Types**:
- `repository` - Repo analysis (cached, reusable)
- `requirements` - Requirements analysis
- `implementationPlan` - Implementation plan
- `codeChanges` - Git changes
- `reviewReport` - Code review
- `prDescription` - PR description

**Caching Strategy**:
```
First Request:
    getContext('repository')
        ↓ not found
    RepositoryAnalyzer.analyze()
        ↓ analyze
    Repository Context
        ↓ cache
    storeContext('repository', data, {reusable: true})
        ↓
    Return data

Subsequent Requests:
    getContext('repository')
        ↓ found in cache
    Return cached data (no re-analysis)
```

---

### RepositoryAnalyzer (src/repo/analyzer.ts)

**Purpose**: Analyzes project structure and patterns

**Analysis Process**:
```
1. Detect Project Type
    ├─ Check package.json → Node.js
    ├─ Check requirements.txt → Python
    ├─ Check pom.xml → Java
    └─ Check go.mod → Go

2. Detect Language
    ├─ Count file extensions
    └─ Determine primary language

3. Extract Dependencies
    ├─ Parse package.json
    ├─ Parse requirements.txt
    └─ Parse other manifests

4. Build File Tree
    ├─ Recursively list files
    ├─ Exclude node_modules, .git, etc.
    └─ Create hierarchical structure

5. Identify Patterns
    ├─ Route patterns (e.g., routes/*.js)
    ├─ Controller patterns (e.g., controllers/*.js)
    ├─ Test patterns (e.g., tests/**/*.test.js)
    └─ Config patterns

6. Find Relevant Files
    ├─ Score files by relevance
    ├─ Consider naming conventions
    └─ Return top matches
```

**Output**:
```typescript
interface RepoContext {
  projectType: string;
  language: string;
  framework?: string;
  dependencies: Record<string, string>;
  fileTree: FileNode[];
  patterns: {
    routePattern?: string;
    controllerPattern?: string;
    testPattern: string;
  };
  relevantFiles: Array<{
    path: string;
    reason: string;
    confidence: number;
  }>;
}
```

---

### TemplateEngine (src/prompts/template-engine.ts)

**Purpose**: Generates prompts from templates with variable substitution

**Template Processing**:
```
Template File (plan-template.md)
    ↓ read
Template String with {{VARIABLES}}
    ↓ inject
Variable Values
    {
      TASK_TITLE: "Feature",
      REPO_TYPE: "Node.js",
      ...
    }
    ↓ replace
Final Prompt String
    ↓ return
Ready for Bob IDE
```

**Variable Substitution**:
```typescript
// Template
"Project Type: {{REPO_TYPE}}"

// Variables
{ REPO_TYPE: "Node.js" }

// Result
"Project Type: Node.js"
```

---

### GitService (src/git/operations.ts)

**Purpose**: Git operations wrapper

**Key Operations**:
```typescript
class GitService {
  async createFeatureBranch(taskId: string): Promise<string>
  async getCurrentBranch(): Promise<string>
  async getDiff(base: string, head: string): Promise<GitDiff>
  async getChangedFiles(): Promise<string[]>
  async getCommitHistory(from: string, to: string): Promise<Commit[]>
  async stageFiles(files: string[]): Promise<void>
  async commit(message: string): Promise<void>
  async push(branch: string): Promise<void>
}
```

**Git Diff Analysis**:
```
git diff main...feature/feature-004
    ↓ parse
Diff Summary
    {
      filesChanged: 4,
      insertions: 150,
      deletions: 20,
      files: [...]
    }
    ↓ return
GitDiff object
```

---

## 🎯 Key Design Decisions

### 1. Why Orchestration, Not Code Generation?

**Decision**: Tool orchestrates workflow but doesn't generate code

**Reasons**:
- Bob IDE is the AI that writes code
- Tool focuses on workflow management
- Separation of concerns
- Flexibility to use different AI tools

**Benefits**:
- Tool remains lightweight
- No AI API dependencies
- Works with any code generator
- User maintains control

---

### 2. Why File-Based Storage?

**Decision**: Store tasks as JSON files, not database

**Reasons**:
- Simple setup (no database required)
- Version control friendly
- Easy to inspect and debug
- Portable across systems

**Benefits**:
- No database installation
- Git-trackable artifacts
- Human-readable format
- Easy backup/restore

---

### 3. Why Interactive Prompts?

**Decision**: User copies prompts to Bob IDE manually

**Reasons**:
- Bob IDE has no public API
- User can review prompts before sending
- User can modify prompts if needed
- Works with any Bob version

**Benefits**:
- No API integration needed
- User maintains control
- Flexible workflow
- Works offline

---

### 4. Why Caching Repository Context?

**Decision**: Cache repo analysis for reuse

**Reasons**:
- Analysis is expensive (time-consuming)
- Repo structure rarely changes
- Multiple tasks use same context

**Benefits**:
- Faster subsequent operations
- Reduced redundant work
- Better user experience
- Lower resource usage

---

## 📊 Performance Characteristics

### Time Complexity:

```
init:     O(n) where n = number of files
new:      O(1) constant time
analyze:  O(1) if cached, O(n) if not
generate: O(1) constant time
review:   O(m) where m = changed files
pr:       O(1) constant time
```

### Space Complexity:

```
Task file:     ~10-50 KB per task
Repo context:  ~100-500 KB (cached)
Total:         ~1-5 MB for 10 tasks
```

### Typical Execution Times:

```
init:     5-10 seconds
new:      <1 second
analyze:  2-5 seconds (cached: <1 second)
generate: 1-2 seconds
review:   2-5 seconds
pr:       1-2 seconds
```

---

## 🔐 Security Considerations

### Data Privacy:
- All data stored locally
- No external API calls (except Bob IDE)
- No telemetry or tracking
- User controls all data

### File Permissions:
- Creates files with user permissions
- Respects .gitignore
- No sudo/admin required

### Git Safety:
- Never force pushes
- Creates new branches (doesn't modify main)
- User reviews all commits
- No automatic merges

---

## 🎓 Summary

The AI SDLC Wrapper is a **workflow orchestration tool** that:

1. **Manages** the SDLC process from idea to PR
2. **Generates** structured prompts for Bob IDE
3. **Stores** all artifacts for traceability
4. **Tracks** progress through workflow stages
5. **Integrates** with Git for version control

It does **NOT**:
- Generate code directly
- Make API calls to AI services
- Automatically create PRs
- Modify code without user approval

The tool is designed to **augment** developer workflow, not replace it, by providing structure, consistency, and traceability to the SDLC process.

---

**For more details, see:**
- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
- [STEP_BY_STEP_TUTORIAL.md](./STEP_BY_STEP_TUTORIAL.md) - Complete tutorial
- [COMPLETE_WORKFLOW_GUIDE.md](./COMPLETE_WORKFLOW_GUIDE.md) - Detailed workflows
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues