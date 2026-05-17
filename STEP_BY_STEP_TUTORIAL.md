# AI SDLC Wrapper - Complete Step-by-Step Tutorial

This tutorial walks through creating a PR for the A2A Plugin Integration issue using the ai-sdlc-wrapper tool.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setup](#setup)
3. [Step 1: Initialize Project](#step-1-initialize-project)
4. [Step 2: Create Task](#step-2-create-task)
5. [Step 3: Analyze Requirements](#step-3-analyze-requirements)
6. [Step 4: Generate Implementation](#step-4-generate-implementation)
7. [Step 5: Implement Code](#step-5-implement-code)
8. [Step 6: Review Code](#step-6-review-code)
9. [Step 7: Generate PR](#step-7-generate-pr)
10. [Step 8: Create Pull Request](#step-8-create-pull-request)
11. [Verification](#verification)
12. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

```bash
# Check Node.js version (18+ required)
node --version

# Check npm version
npm --version

# Check Git
git --version
```

### Optional but Recommended

- Bob IDE installed
- GitHub CLI (`gh`) for PR creation
- VS Code or your preferred editor

---

## Setup

### 1. Install AI SDLC Wrapper

```bash
# Clone the repository
cd ~/projects
git clone https://github.com/yourusername/ai-sdlc-wrapper.git
cd ai-sdlc-wrapper

# Install dependencies
npm install

# Build the tool
npm run build

# Verify build
ls -la dist/
# Should see: index.js, index.d.ts

# Link globally (makes 'ai-sdlc' command available)
npm link

# Verify installation
ai-sdlc --version
# Output: 1.0.0
```

### 2. Prepare Your Project

```bash
# Navigate to your project
cd ~/projects/mcp-context-forge

# Ensure it's a git repository
git status

# If not initialized:
git init
git remote add origin https://github.com/IBM/mcp-context-forge.git
```

---

## Step 1: Initialize Project

### Command

```bash
cd ~/projects/mcp-context-forge
ai-sdlc init
```

### Expected Output

```
Initializing AI SDLC Wrapper
════════════════════════════
✓ Created directory structure
ℹ Analyzing repository...
✓ Analyzed repository (Node.js project)
ℹ Language: JavaScript
✓ Created configuration file
ℹ Automation settings: Interactive mode (approval gates enabled)

Next Steps
══════════
❯ 1. Open this project in Bob IDE
❯ 2. Run /init to generate AGENTS.md
❯ 3. Create your first feature: ai-sdlc new "Your feature description"
```

### What Happened

1. Created `.ai-sdlc/` directory structure
2. Created `.ai-sdlc/config.json` with project settings
3. Created `.ai-sdlc/tasks/` directory for task storage
4. Analyzed repository (detected Node.js, JavaScript, dependencies)
5. Created `.bob/skills/` directory with SDLC skills

### Verify

```bash
# Check created directories
ls -la .ai-sdlc/
# Output: config.json, tasks/

ls -la .bob/skills/
# Output: sdlc-plan.md, sdlc-code.md, sdlc-review.md, sdlc-deliver.md

# View configuration
cat .ai-sdlc/config.json
```

---

## Step 2: Create Task

### Prepare Issue File

```bash
# Create issue file (or use existing)
cat > issue-a2a-integration.md << 'EOF'
# Issue #4772: Integrate A2A Agents into Plugin Framework

## Overview
Integrate A2A (Agent-to-Agent) agents into the plugin framework for feature parity with MCP tools.

## Requirements
- A2A agents fire AGENT_PRE_INVOKE hook before HTTP call
- A2A agents fire AGENT_POST_INVOKE hook after response
- Plugins can modify agent parameters/headers
- VaultPlugin works with A2A agents
- Per-agent plugin bindings functional

## Technical Details
- Add A2A_AGENT_METADATA constant
- Create PydanticA2AAgent schema
- Create A2AAgentPluginBinding table
- Update invoke_agent() to fire hooks
EOF
```

### Command

```bash
ai-sdlc new "Integrate A2A Agents into Plugin Framework" \
  -d issue-a2a-integration.md
```

### Expected Output

```
ℹ Loaded description from file: ...
✓ Created task FEATURE-001: "Integrate A2A Agents into Plugin Framework"

Next Step
═════════
❯ ai-sdlc analyze FEATURE-001
```

### What Happened

1. Created task with unique ID (FEATURE-001)
2. Loaded description from markdown file
3. Saved task to `.ai-sdlc/tasks/FEATURE-001.json`
4. Set status to `draft`

### Verify

```bash
# Check task file
cat .ai-sdlc/tasks/FEATURE-001.json | jq '.id, .title, .status'
# Output:
# "FEATURE-001"
# "Integrate A2A Agents into Plugin Framework"
# "draft"
```

---

## Step 3: Analyze Requirements

### Command

```bash
ai-sdlc analyze FEATURE-001
```

### Expected Output

```
Analyzing Task: Integrate A2A Agents into Plugin Framework
═══════════════════════════════════════════════════════════

ℹ Gathering repository context...
✓ Repository context gathered and cached

═══════════════════════════
║ Bob Plan Mode Prompt    ║
═══════════════════════════

[Long prompt displayed here...]

Instructions
════════════
❯ 1. Copy the prompt above
❯ 2. Open Bob IDE and switch to Plan mode
❯ 3. Paste the prompt and let Bob analyze
❯ 4. Copy Bob's complete response

? Paste Bob's complete response here (opens editor):
```

### What to Do

#### Option A: Use Bob IDE (Recommended)

1. **Copy the entire prompt** displayed in the terminal
2. **Open Bob IDE**
3. **Switch to Plan mode** (if not already)
4. **Paste the prompt** into Bob
5. **Wait for Bob to analyze** (may take 1-2 minutes)
6. **Copy Bob's complete response**
7. **Return to terminal** and press Enter
8. **Paste Bob's response** in the editor that opens
9. **Save and close** the editor (Ctrl+X in nano, :wq in vim)

#### Option B: Manual Analysis (If Bob not available)

Create a response file:

```bash
cat > bob-response.txt << 'EOF'
# Requirements Analysis

## User Story
As a platform operator, I want A2A agents to integrate with the plugin framework so that I can apply consistent policies across all invocation paths.

## Acceptance Criteria
1. A2A agents fire AGENT_PRE_INVOKE hook before HTTP call
2. A2A agents fire AGENT_POST_INVOKE hook after response
3. Plugins can modify agent parameters/headers in pre-invoke
4. VaultPlugin works with A2A agents (same as tools)
5. Per-agent plugin bindings functional via A2AAgentPluginBinding table

## Technical Requirements
1. Add A2A_AGENT_METADATA constant to cpex/framework/constants.py
2. Create PydanticA2AAgent schema in mcpgateway/schemas.py
3. Create A2AAgentPluginBinding ORM model in mcpgateway/db.py
4. Update invoke_agent() to fire plugin hooks
5. Pass request headers through plugin pipeline

## Implementation Plan
- Follow proven pattern from tool service integration
- Add plugin hooks to A2A invocation path
- Maintain backward compatibility

## Files to Modify
1. mcpgateway/services/a2a_service.py - Add plugin hook firing
2. mcpgateway/db.py - Add A2AAgentPluginBinding table
3. mcpgateway/schemas.py - Add PydanticA2AAgent schema
4. cpex/framework/constants.py - Add A2A_AGENT_METADATA constant

## Test Strategy
- Unit tests for hook firing
- Integration tests for end-to-end flow
- Security tests for RBAC
- Regression tests for existing functionality

## Estimated Complexity
Medium (6-10 hours)

## Risks
- Breaking existing A2A functionality
- Performance impact from plugin hooks
EOF

# Paste this content when prompted
```

### Expected Result

```
✓ Requirements parsed and saved
✓ Implementation plan created
✓ Task status updated to 'ready'

Next Step
═════════
❯ ai-sdlc generate FEATURE-001
```

### What Happened

1. Parsed Bob's response (or manual input)
2. Extracted requirements, acceptance criteria, technical details
3. Created implementation plan
4. Saved all artifacts to task file
5. Updated status to `ready`

### Verify

```bash
# Check task status
cat .ai-sdlc/tasks/FEATURE-001.json | jq '.status'
# Output: "ready"

# View requirements
cat .ai-sdlc/tasks/FEATURE-001.json | jq '.artifacts.requirements'
```

---

## Step 4: Generate Implementation

### Command

```bash
ai-sdlc generate FEATURE-001
```

### Expected Output

```
Generating Implementation for: Integrate A2A Agents into Plugin Framework
═════════════════════════════════════════════════════════════════════════

ℹ Creating feature branch...
✓ Created branch: feature/feature-001

ℹ Generating implementation prompt...
✓ Prompt generated

═══════════════════════════
║ Bob Code Mode Prompt    ║
═══════════════════════════

[Implementation prompt displayed...]

Instructions
════════════
❯ 1. Copy the prompt above
❯ 2. Open Bob IDE and switch to Code mode
❯ 3. Paste the prompt
❯ 4. Let Bob implement the feature
❯ 5. Review and commit Bob's changes

✓ Task status updated to 'implementing'
```

### What Happened

1. Created feature branch `feature/feature-001`
2. Switched to the new branch
3. Generated detailed implementation prompt
4. Updated task status to `implementing`

### Verify

```bash
# Check current branch
git branch
# Output: * feature/feature-001

# Check task status
cat .ai-sdlc/tasks/FEATURE-001.json | jq '.status'
# Output: "implementing"
```

---

## Step 5: Implement Code

Now you need to actually write the code. You have three options:

### Option A: Use Bob IDE to Generate Code

1. **Copy the implementation prompt** from Step 4
2. **Open Bob IDE in Code mode**
3. **Paste the prompt**
4. **Bob will generate the code files**
5. **Review Bob's changes**
6. **Commit the changes**

```bash
# After Bob generates code, commit it
git add .
git commit -m "feat: Integrate A2A agents into plugin framework

- Added A2A_AGENT_METADATA constant
- Created PydanticA2AAgent schema
- Created A2AAgentPluginBinding table
- Updated invoke_agent() to fire plugin hooks
- Enabled header injection for A2A agents"
```

### Option B: Manual Implementation

Follow the implementation plan from Step 3:

#### 1. Add Constant

```bash
# Edit cpex/framework/constants.py
cat >> cpex/framework/constants.py << 'EOF'

# A2A Agent Metadata
A2A_AGENT_METADATA = "a2a_agent_metadata"
EOF
```

#### 2. Create Schema

```python
# Edit mcpgateway/schemas.py
# Add this class:

class PydanticA2AAgent(BaseModel):
    """Schema for A2A agent metadata"""
    id: str
    name: str
    team_id: str
    visibility: str
    enabled: bool
    tags: List[str] = []
    oauth_config: Optional[Dict[str, Any]] = None
    passthrough_headers: List[str] = []
    auth_type: Optional[str] = None
    auth_value: Optional[str] = None
```

#### 3. Create Database Table

```python
# Edit mcpgateway/db.py
# Add this ORM model:

class A2AAgentPluginBinding(Base):
    """Per-agent plugin binding configuration"""
    __tablename__ = "a2a_agent_plugin_bindings"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    team_id = Column(String, ForeignKey("email_teams.id", ondelete="CASCADE"), nullable=False)
    agent_name = Column(String, nullable=False)
    plugin_id = Column(String, nullable=False)
    mode = Column(String, default="enforce")
    priority = Column(Integer, default=100)
    config = Column(JSON, default={})
    on_error = Column(String, default="fail")
    binding_reference_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(String)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = Column(String)
    
    __table_args__ = (
        UniqueConstraint('team_id', 'agent_name', 'plugin_id', name='uq_team_agent_plugin'),
        Index('idx_team_agent', 'team_id', 'agent_name'),
    )
```

#### 4. Update A2A Service

```python
# Edit mcpgateway/services/a2a_service.py
# Update invoke_agent() method to add plugin hooks:

async def invoke_agent(
    self,
    db: Session,
    agent_name: Optional[str] = None,
    parameters: Optional[Dict[str, Any]] = None,
    agent_id: Optional[str] = None,
    user_id: Optional[str] = None,
    user_email: Optional[str] = None,
    token_teams: Optional[List[str]] = None,
    hop_count: int = 0,
    bearer_token: Optional[str] = None,
    content_type: Optional[str] = None,  # NEW
    request_headers: Optional[Dict[str, str]] = None,  # NEW
) -> Dict[str, Any]:
    # ... existing code ...
    
    # NEW: Create global context for plugins
    context_id = make_context_id(team_id, agent_name)
    global_context = GlobalContext(
        server_id=context_id,
        user_email=user_email,
        metadata={
            A2A_AGENT_METADATA: PydanticA2AAgent(
                id=agent.id,
                name=agent.name,
                team_id=team_id,
                visibility=agent.visibility,
                enabled=agent.enabled,
                tags=agent.tags or [],
                oauth_config=agent.oauth_config,
                passthrough_headers=agent.passthrough_headers or [],
                auth_type=agent.auth_type,
                auth_value=agent.auth_value,
            ).dict()
        }
    )
    
    # NEW: Get plugin manager
    plugin_manager = get_plugin_manager(context_id)
    
    # Prepare invocation
    prepared = await prepare_a2a_invocation(...)
    
    # NEW: Fire pre-invoke hook
    if plugin_manager:
        hook_payload = HttpHeaderPayload(headers=prepared.headers)
        await plugin_manager.fire_hook(
            AgentHookType.AGENT_PRE_INVOKE,
            hook_payload,
            global_context
        )
        prepared.headers = hook_payload.headers
    
    # Make HTTP call
    response = await http_client.post(...)
    
    # NEW: Fire post-invoke hook
    if plugin_manager:
        post_payload = AgentResponsePayload(
            response=response,
            error=None if response.ok else response.text
        )
        await plugin_manager.fire_hook(
            AgentHookType.AGENT_POST_INVOKE,
            post_payload,
            global_context
        )
    
    return response
```

#### 5. Commit Changes

```bash
# Stage all changes
git add cpex/framework/constants.py
git add mcpgateway/schemas.py
git add mcpgateway/db.py
git add mcpgateway/services/a2a_service.py

# Commit
git commit -m "feat: Integrate A2A agents into plugin framework

- Added A2A_AGENT_METADATA constant to cpex framework
- Created PydanticA2AAgent schema for agent metadata
- Created A2AAgentPluginBinding database table
- Updated invoke_agent() to fire AGENT_PRE_INVOKE and AGENT_POST_INVOKE hooks
- Enabled header injection and parameter modification for A2A agents

Resolves #4772"
```

### Option C: Use Auto-Implementation Script

```bash
# Run the automated script
cd ~/projects/ai-sdlc-wrapper
npx tsx scripts/auto-implement.ts \
  ~/projects/mcp-context-forge \
  ~/projects/issue-a2a-integration.md
```

This creates the implementation plan but you still need to write the actual code.

---

## Step 6: Review Code

### Command

```bash
ai-sdlc review FEATURE-001
```

### Expected Output

```
Reviewing Code for: Integrate A2A Agents into Plugin Framework
═══════════════════════════════════════════════════════════════

ℹ Analyzing changes...
✓ Found 4 files changed

Changes Summary:
════════════════
Files Modified: 4
Lines Added: 150
Lines Deleted: 5

═══════════════════════════
║ Bob Review Prompt       ║
═══════════════════════════

[Review prompt with diff displayed...]

Instructions
════════════
❯ 1. Copy the prompt above
❯ 2. Open Bob IDE
❯ 3. Run /review command or paste prompt
❯ 4. Copy Bob's review

? Paste Bob's review here (opens editor):
```

### What to Do

1. **Copy the review prompt**
2. **Open Bob IDE**
3. **Paste the prompt** or use `/review` command
4. **Wait for Bob's review**
5. **Copy Bob's review response**
6. **Paste back** into the terminal editor

### Sample Review Response

```
# Code Review Report

## Summary
The implementation successfully integrates A2A agents into the plugin framework following the proven pattern from tool service integration.

## Issues Found

### Critical
None

### Major
None

### Minor
1. Consider adding error handling for plugin hook failures
2. Add logging for plugin invocations

## Security
✓ RBAC validation maintained
✓ Team isolation preserved
✓ No security vulnerabilities found

## Performance
✓ Plugin hooks are non-blocking
✓ Minimal performance impact expected

## Test Coverage
⚠ Unit tests needed for:
- Hook firing logic
- Context ID generation
- Metadata population

## Approval
✅ APPROVED - Ready for merge after adding tests
```

### Expected Result

```
✓ Review report saved
✓ Task status updated to 'reviewing'

Next Step
═════════
❯ ai-sdlc pr FEATURE-001
```

### Verify

```bash
# Check review report
cat .ai-sdlc/tasks/FEATURE-001.json | jq '.artifacts.reviewReport'
```

---

## Step 7: Generate PR

### Command

```bash
ai-sdlc pr FEATURE-001
```

### Expected Output

```
Generating PR Description for: Integrate A2A Agents into Plugin Framework
═════════════════════════════════════════════════════════════════════════

ℹ Compiling artifacts...
✓ Requirements loaded
✓ Implementation plan loaded
✓ Code changes analyzed
✓ Review report loaded

ℹ Generating PR description...
✓ PR description generated

✓ Saved to: .ai-sdlc/tasks/FEATURE-001/pr-description.md
✓ Task status updated to 'complete'

Next Steps
══════════
❯ 1. Review the PR description
❯ 2. Push your branch: git push origin feature/feature-001
❯ 3. Create PR using the description
```

### What Happened

1. Compiled all artifacts (requirements, plan, changes, review)
2. Analyzed final git changes
3. Generated comprehensive PR description
4. Saved to `.ai-sdlc/tasks/FEATURE-001/pr-description.md`
5. Updated task status to `complete`

### View PR Description

```bash
# View the generated PR description
cat .ai-sdlc/tasks/FEATURE-001/pr-description.md
```

### Verify

```bash
# Check task status
cat .ai-sdlc/tasks/FEATURE-001.json | jq '.status'
# Output: "complete"

# Check all artifacts
cat .ai-sdlc/tasks/FEATURE-001.json | jq '.artifacts | keys'
# Output: ["requirements", "implementationPlan", "codeChanges", "reviewReport", "prDescription"]
```

---

## Step 8: Create Pull Request

### Option A: Using GitHub CLI

```bash
# Push the branch
git push origin feature/feature-001

# Create PR using the generated description
gh pr create \
  --title "feat: Integrate A2A Agents into Plugin Framework" \
  --body-file .ai-sdlc/tasks/FEATURE-001/pr-description.md \
  --base main \
  --label enhancement,python,a2a,plugins

# View the created PR
gh pr view --web
```

### Option B: Using GitHub Web Interface

```bash
# Push the branch
git push origin feature/feature-001

# Then:
# 1. Go to https://github.com/IBM/mcp-context-forge
# 2. Click "Compare & pull request" button
# 3. Copy content from .ai-sdlc/tasks/FEATURE-001/pr-description.md
# 4. Paste into PR description
# 5. Add labels: enhancement, python, a2a, plugins
# 6. Click "Create pull request"
```

### Option C: Using Git Command Line

```bash
# Push the branch
git push origin feature/feature-001

# Create PR using hub (if installed)
hub pull-request \
  -b main \
  -h feature/feature-001 \
  -F .ai-sdlc/tasks/FEATURE-001/pr-description.md
```

---

## Verification

### Check Everything is Complete

```bash
# 1. Verify task status
cat .ai-sdlc/tasks/FEATURE-001.json | jq '{
  id: .id,
  title: .title,
  status: .status,
  artifacts: (.artifacts | keys)
}'

# Expected output:
# {
#   "id": "FEATURE-001",
#   "title": "Integrate A2A Agents into Plugin Framework",
#   "status": "complete",
#   "artifacts": [
#     "requirements",
#     "implementationPlan",
#     "codeChanges",
#     "reviewReport",
#     "prDescription"
#   ]
# }

# 2. Verify branch exists
git branch -a | grep feature-001

# 3. Verify commits
git log --oneline main..feature/feature-001

# 4. Verify files changed
git diff main...feature/feature-001 --stat

# 5. Verify PR description exists
ls -la .ai-sdlc/tasks/FEATURE-001/pr-description.md
```

### Run Tests

```bash
# Run unit tests
npm test

# Run integration tests (if available)
npm run test:integration

# Run linting
npm run lint

# Check test coverage
npm run test:coverage
```

---

## Troubleshooting

### Issue: Command not found

```bash
# Solution: Re-link the tool
cd ~/projects/ai-sdlc-wrapper
npm link

# Or use direct path
node ~/projects/ai-sdlc-wrapper/dist/index.js <command>
```

### Issue: Tool hangs waiting for input

```bash
# Solution: Press Ctrl+C and restart
# Make sure you're pasting Bob's response when prompted
```

### Issue: Branch already exists

```bash
# Solution: Delete and recreate
git branch -D feature/feature-001
ai-sdlc generate FEATURE-001
```

### Issue: No changes to commit

```bash
# Solution: Make sure you implemented the code
git status
# If no changes, go back to Step 5
```

### Issue: PR description not generated

```bash
# Solution: Check task status
cat .ai-sdlc/tasks/FEATURE-001.json | jq '.status'

# If not 'complete', run missing steps
ai-sdlc review FEATURE-001
ai-sdlc pr FEATURE-001
```

### Issue: Build errors

```bash
# Solution: Clean and rebuild
cd ~/projects/ai-sdlc-wrapper
rm -rf dist node_modules
npm install
npm run build
npm link
```

---

## Summary

You've successfully completed the entire SDLC workflow:

✅ **Step 1**: Initialized project  
✅ **Step 2**: Created task from issue  
✅ **Step 3**: Analyzed requirements  
✅ **Step 4**: Generated implementation prompt  
✅ **Step 5**: Implemented code changes  
✅ **Step 6**: Reviewed code  
✅ **Step 7**: Generated PR description  
✅ **Step 8**: Created pull request  

### What You Have Now

- Feature branch with code changes
- Complete requirements documentation
- Implementation plan
- Code review report
- PR description
- All artifacts saved in `.ai-sdlc/tasks/FEATURE-001.json`

### Next Steps

- Wait for PR review
- Address feedback
- Merge when approved
- Delete feature branch

---

## Additional Resources

- [QUICKSTART.md](./QUICKSTART.md) - Quick reference
- [COMPLETE_WORKFLOW_GUIDE.md](./COMPLETE_WORKFLOW_GUIDE.md) - Detailed guide
- [README.md](./README.md) - Full documentation
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues

---

**Congratulations!** 🎉 You've mastered the AI SDLC Wrapper workflow!