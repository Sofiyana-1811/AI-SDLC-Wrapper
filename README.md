# AI SDLC Wrapper

An AI-powered SDLC workflow automation tool that uses IBM Bob IDE as the core intelligence engine to transform feature ideas into production-ready code through structured, repeatable processes.

## 🎯 Overview

The AI SDLC Wrapper orchestrates IBM Bob's capabilities (Plan mode, Code mode, Review, Skills) into a complete software development lifecycle workflow. It provides:

- **Structured SDLC Process**: Guided journey from feature idea to pull request
- **Persistent Artifacts**: All requirements, plans, and reviews saved for traceability
- **Repository Intelligence**: Automatic codebase analysis and context extraction
- **Bob Skills Integration**: Reusable instruction sets for consistent workflows
- **Git Integration**: Automatic branch management and change tracking
- **PR Generation**: Comprehensive pull request descriptions from artifacts

## 🚀 Quick Start

### Installation

```bash
npm install -g ai-sdlc-wrapper
```

Or use locally:

```bash
git clone https://github.com/yourusername/ai-sdlc-wrapper.git
cd ai-sdlc-wrapper
npm install
npm link
```

### Initialize in Your Project

```bash
cd your-project
ai-sdlc init
```

This will:
- Create `.ai-sdlc/` directory for task artifacts
- Create `.bob/skills/` directory with SDLC skills
- Analyze your repository structure
- Save project configuration

### Create Your First Feature

```bash
# 1. Create a new feature task
ai-sdlc new "Add rate limiting to login endpoint"

# 2. Analyze requirements with Bob Plan mode
ai-sdlc analyze FEATURE-001

# 3. Generate implementation prompt for Bob Code mode
ai-sdlc generate FEATURE-001

# 4. Review code with Bob
ai-sdlc review FEATURE-001

# 5. Generate PR description
ai-sdlc pr FEATURE-001
```

## 📋 Commands

### `ai-sdlc init`

Initialize AI SDLC wrapper in the current repository.

```bash
ai-sdlc init
```

**What it does:**
- Creates `.ai-sdlc/tasks/` directory
- Creates `.bob/skills/` with 4 SDLC skills
- Analyzes repository (detects project type, framework, patterns)
- Saves configuration

**Next step:** Open project in Bob IDE and run `/init`

### `ai-sdlc new <title>`

Create a new feature task with a unique ID.

```bash
ai-sdlc new "Add rate limiting to login endpoint"
ai-sdlc new "Fix user profile update bug" -d "Users can't update email"
ai-sdlc new "Implement OAuth2" -d ./specs/oauth-requirements.md
```

**Options:**
- `-d, --description <desc>` - Optional feature description (text or path to .md file)

**Output:**
- Creates task with ID (e.g., FEATURE-001)
- Saves to `.ai-sdlc/tasks/FEATURE-001.json`
- Status: `draft`

### `ai-sdlc analyze <taskId>`

Analyze requirements using Bob Plan mode.

```bash
ai-sdlc analyze FEATURE-001
```

**What it does:**
1. Gathers repository context
2. Generates optimized prompt for Bob Plan mode
3. Displays prompt for you to copy to Bob IDE
4. Accepts Bob's analysis response
5. Parses and saves requirements + implementation plan
6. Updates status to `ready`

**Artifacts created:**
- User story
- Acceptance criteria
- Technical requirements
- Implementation plan
- Files to modify/create
- Test strategy

### `ai-sdlc generate <taskId>`

Generate implementation prompt for Bob Code mode.

```bash
ai-sdlc generate FEATURE-001
```

**What it does:**
1. Creates feature branch (e.g., `feature/feature-001`)
2. Generates detailed implementation prompt
3. Displays prompt for Bob Code mode
4. Updates status to `implementing`

**The prompt includes:**
- Requirements summary
- Acceptance criteria
- Implementation approach
- Files to modify/create
- Project patterns and conventions

### `ai-sdlc review <taskId>`

Run code review with Bob.

```bash
ai-sdlc review FEATURE-001
```

**What it does:**
1. Analyzes git diff
2. Generates review instructions
3. Guides you to use Bob's `/review` command
4. Accepts Bob's review summary
5. Parses and saves review report
6. Tracks code changes
7. Updates status to `reviewing`

**Artifacts created:**
- Review report with issues by severity
- Code changes summary
- Approval status

### `ai-sdlc pr <taskId>`

Generate PR description from all artifacts.

```bash
ai-sdlc pr FEATURE-001
```

**What it does:**
1. Compiles all task artifacts
2. Analyzes final git changes
3. Generates comprehensive PR description
4. Saves to `.ai-sdlc/tasks/FEATURE-001/pr-description.md`
5. Updates status to `complete`

**PR includes:**
- Overview and user story
- Changes made
- Acceptance criteria met
- Implementation details
- Test strategy
- Review findings
- Related task ID

## 🎓 Bob Skills

The wrapper includes 4 specialized skills that guide Bob through SDLC phases:

### 1. sdlc-plan.md

Guides Bob through requirements analysis:
- Extract user stories
- Define acceptance criteria
- Identify technical requirements
- Create implementation plans
- Estimate complexity
- Identify risks

### 2. sdlc-code.md

Guides Bob through implementation:
- Follow project patterns
- Write production-quality code
- Handle errors gracefully
- Include comprehensive tests
- Update documentation

### 3. sdlc-review.md

Guides Bob through code review:
- Check code quality
- Verify security
- Assess performance
- Validate tests
- Review documentation

### 4. sdlc-deliver.md

Guides Bob through PR preparation:
- Verify completeness
- Generate PR descriptions
- Final quality checks
- Prepare artifacts

## 📁 Project Structure

```
your-project/
├── .ai-sdlc/
│   ├── config.json              # Project configuration
│   └── tasks/
│       ├── FEATURE-001.json     # Task with all artifacts
│       ├── FEATURE-002.json
│       └── FEATURE-001/
│           └── pr-description.md
├── .bob/
│   └── skills/
│       ├── sdlc-plan.md
│       ├── sdlc-code.md
│       ├── sdlc-review.md
│       └── sdlc-deliver.md
└── [your project files]
```

## 🔄 Complete Workflow Example

### Scenario: Add Rate Limiting to Login Endpoint

```bash
# 1. Initialize (one-time setup)
ai-sdlc init

# 2. Create feature task
ai-sdlc new "Add rate limiting to login endpoint"
# Output: Created task FEATURE-001

# 3. Analyze requirements
ai-sdlc analyze FEATURE-001
# - Displays prompt for Bob Plan mode
# - Copy prompt to Bob IDE
# - Bob analyzes and returns requirements
# - Paste Bob's response
# - Requirements saved

# 4. Generate implementation prompt
ai-sdlc generate FEATURE-001
# - Creates branch: feature/feature-001
# - Displays prompt for Bob Code mode
# - Copy prompt to Bob IDE
# - Bob implements the feature

# 5. Review code
ai-sdlc review FEATURE-001
# - Analyzes changes
# - Run /review in Bob IDE
# - Paste Bob's review
# - Review report saved

# 6. Generate PR
ai-sdlc pr FEATURE-001
# - Generates comprehensive PR description
# - Ready to create pull request
```

## 🎯 Key Features

### 1. Structured SDLC Workflow

Transforms ad-hoc development into a systematic process:
```
Feature Idea → Requirements → Implementation → Review → PR
```

### 2. Persistent Task Artifacts

All SDLC artifacts are saved and traceable:
- Requirements analysis
- Implementation plans
- Code change tracking
- Review reports
- PR descriptions

### 3. Repository Context Analyzer

Automatically extracts:
- Project type (Node.js, Python, Java, etc.)
- Framework (Express, React, Django, etc.)
- Dependencies
- File structure patterns
- Coding conventions

### 4. Intelligent Prompt Generation

Creates context-aware prompts that include:
- Task requirements
- Repository patterns
- Project-specific context
- Bob Skills references

### 5. Task Lifecycle Management

Tracks progress through states:
```
draft → analyzing → ready → implementing → reviewing → complete
```

### 6. Git Integration

- Automatic feature branch creation
- Change tracking (files modified/added/deleted)
- Commit history
- Diff analysis

### 7. Requirements-to-PR Traceability

Complete audit trail from idea to delivery:
- Original requirements linked to implementation
- Acceptance criteria mapped to changes
- Review findings included in PR

## 🛠️ Configuration

### Project Configuration

Located at `.ai-sdlc/config.json`:

```json
{
  "version": "1.0.0",
  "projectType": "Node.js",
  "framework": "Express",
  "language": "TypeScript",
  "initializedAt": "2026-05-17T08:00:00.000Z"
}
```

### Task Structure

Each task is stored as `.ai-sdlc/tasks/FEATURE-XXX.json`:

```json
{
  "id": "FEATURE-001",
  "title": "Add rate limiting to login endpoint",
  "status": "complete",
  "createdAt": "2026-05-17T08:00:00.000Z",
  "updatedAt": "2026-05-17T09:00:00.000Z",
  "artifacts": {
    "requirements": { ... },
    "repoContext": { ... },
    "implementationPlan": { ... },
    "codeChanges": { ... },
    "reviewReport": { ... },
    "prDescription": { ... }
  }
}
```

## 🤝 Integration with Bob IDE

### Required Bob Setup

1. **Install Bob IDE**: Follow IBM Bob installation instructions
2. **Run `/init`**: Generate AGENTS.md for project context
3. **Use Skills**: Reference skills in prompts with `Use the sdlc-plan skill`

### Bob Modes Used

- **Plan Mode**: Requirements analysis and planning
- **Code Mode**: Feature implementation
- **Review Mode**: Code review with `/review` command
- **Advanced Mode**: Custom skills execution

### Optimizing Bobcoin Usage

The wrapper optimizes Bobcoin consumption through:
- **Incremental tasks**: Break large features into small chunks
- **Skills**: Reduce prompt size with reusable instructions
- **AGENTS.md**: Persistent context reduces repetition
- **Focused prompts**: Include only necessary context

## 📊 Benefits

### For Individual Developers

- ✅ Structured approach to feature development
- ✅ Consistent quality across all features
- ✅ Complete documentation automatically
- ✅ Reduced cognitive load
- ✅ Better code reviews

### For Teams

- ✅ Standardized SDLC practices
- ✅ Knowledge sharing through artifacts
- ✅ Onboarding made easier
- ✅ Audit trail for compliance
- ✅ Improved collaboration

### For Projects

- ✅ Higher code quality
- ✅ Better documentation
- ✅ Faster feature delivery
- ✅ Reduced technical debt
- ✅ Improved maintainability

## 🔧 Development

### Build from Source

```bash
git clone https://github.com/yourusername/ai-sdlc-wrapper.git
cd ai-sdlc-wrapper
npm install
npm run build
```

### Run Tests

```bash
npm test
npm run test:coverage
```

### Development Mode

```bash
npm run dev
```

## 📝 License

MIT

## 🙏 Acknowledgments

Built with IBM Bob IDE as the core AI engine.

## 📞 Support

For issues and questions:
- GitHub Issues: [github.com/yourusername/ai-sdlc-wrapper/issues](https://github.com/yourusername/ai-sdlc-wrapper/issues)
- Documentation: [Full documentation](https://github.com/yourusername/ai-sdlc-wrapper/wiki)

---

**Made with ❤️ using IBM Bob**