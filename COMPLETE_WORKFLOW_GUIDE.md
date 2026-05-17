# AI SDLC Wrapper - Complete Workflow Guide

## 🎯 Understanding the Tool Architecture

The `ai-sdlc-wrapper` is an **orchestration tool** that manages the SDLC workflow but **does NOT generate code directly**. Instead, it:

1. ✅ Creates structured tasks
2. ✅ Analyzes repository context
3. ✅ Generates prompts for Bob IDE
4. ✅ Parses Bob's responses
5. ✅ Manages artifacts and state
6. ❌ Does NOT write code itself

**Why?** Because Bob IDE is the AI that writes code. The wrapper orchestrates Bob's work.

---

## 📋 Two Workflow Options

### Option 1: Automated Workflow (Requires Bob IDE Interaction)

This is the intended workflow where you interact with Bob IDE:

```bash
# Step 1: Initialize
cd your-project
ai-sdlc init

# Step 2: Run automated workflow
ai-sdlc run "Feature title" -d issue-file.md --auto-approve

# Step 3: Copy the generated prompt
# Step 4: Paste into Bob IDE
# Step 5: Copy Bob's response
# Step 6: Paste back into terminal
# Step 7: Tool saves all artifacts and generates PR description
```

**Result**: Bob writes the actual code, tool manages the process.

---

### Option 2: Step-by-Step Workflow (Manual Control)

For more control over each stage:

```bash
# 1. Create task
ai-sdlc new "Feature title" -d issue-file.md
# Output: FEATURE-001

# 2. Analyze requirements
ai-sdlc analyze FEATURE-001
# - Displays prompt for Bob Plan mode
# - Copy to Bob IDE
# - Paste Bob's analysis back
# - Tool saves requirements

# 3. Generate implementation prompt
ai-sdlc generate FEATURE-001
# - Creates feature branch
# - Displays prompt for Bob Code mode
# - Copy to Bob IDE
# - Bob writes the code
# - You commit the changes

# 4. Review code
ai-sdlc review FEATURE-001
# - Analyzes git diff
# - Displays prompt for Bob Review
# - Copy to Bob IDE
# - Paste Bob's review back
# - Tool saves review report

# 5. Generate PR description
ai-sdlc pr FEATURE-001
# - Compiles all artifacts
# - Generates PR description
# - Saves to .ai-sdlc/tasks/FEATURE-001/pr-description.md
```

---

## 🤖 Adding Code Generation Feature

To add actual code generation, you would need to:

### Approach 1: Integrate with Bob API (If Available)

```typescript
// Hypothetical integration
import { BobAPI } from '@ibm/bob-api';

async function generateCode(prompt: string) {
  const bob = new BobAPI({ apiKey: process.env.BOB_API_KEY });
  const response = await bob.generate({
    mode: 'code',
    prompt: prompt,
  });
  return response.code;
}
```

### Approach 2: Use Alternative AI APIs

```typescript
// Using OpenAI, Anthropic, etc.
import OpenAI from 'openai';

async function generateCode(prompt: string) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
  });
  return response.choices[0].message.content;
}
```

### Approach 3: Manual Implementation

Since Bob IDE doesn't have a public API, you can:

1. **Use the tool to generate prompts**
2. **Manually implement the code** based on the requirements
3. **Use the tool to manage the workflow**

---

## 📝 Complete CLI Workflow for Your Use Case

Here's the complete workflow for the A2A Plugin Integration issue:

### Step 1: Setup

```bash
# Navigate to your project
cd /path/to/mcp-context-forge

# Initialize ai-sdlc
ai-sdlc init
```

### Step 2: Create Task

```bash
# Create task from issue file
ai-sdlc new "Integrate A2A Agents into Plugin Framework" \
  -d /path/to/issue-4772-a2a-plugin-integration.md

# Output: FEATURE-001 (or next available ID)
```

### Step 3: Analyze Requirements

```bash
# Generate analysis prompt
ai-sdlc analyze FEATURE-001

# This will:
# 1. Display a prompt for Bob Plan mode
# 2. Wait for you to paste Bob's response
# 3. Parse and save requirements
```

**What to do:**
1. Copy the displayed prompt
2. Open Bob IDE in Plan mode
3. Paste the prompt
4. Wait for Bob to analyze
5. Copy Bob's complete response
6. Return to terminal and paste it

**Bob's response should include:**
- User story
- Acceptance criteria
- Technical requirements
- Implementation plan
- Files to modify/create
- Test strategy

### Step 4: Generate Implementation Prompt

```bash
# Generate code implementation prompt
ai-sdlc generate FEATURE-001

# This will:
# 1. Create feature branch (feature/feature-001)
# 2. Display prompt for Bob Code mode
# 3. Update task status to 'implementing'
```

**What to do:**
1. Copy the displayed prompt
2. Open Bob IDE in Code mode
3. Paste the prompt
4. Bob will write the code
5. Review Bob's changes
6. Commit the changes

### Step 5: Implement Code Changes

**Option A: Let Bob write code (in Bob IDE)**
- Bob will create/modify files based on the prompt
- You review and commit

**Option B: Manual implementation**
Based on the requirements, manually implement:

```bash
# Example for A2A Plugin Integration:

# 1. Add constant to cpex/framework/constants.py
echo 'A2A_AGENT_METADATA = "a2a_agent_metadata"' >> cpex/framework/constants.py

# 2. Create schema in mcpgateway/schemas.py
# (Add PydanticA2AAgent class)

# 3. Add table to mcpgateway/db.py
# (Add A2AAgentPluginBinding ORM model)

# 4. Update mcpgateway/services/a2a_service.py
# (Add plugin hook firing to invoke_agent())

# 5. Commit changes
git add .
git commit -m "feat: Integrate A2A agents into plugin framework"
```

### Step 6: Review Code

```bash
# Run code review
ai-sdlc review FEATURE-001

# This will:
# 1. Analyze git diff
# 2. Display prompt for Bob Review
# 3. Wait for Bob's review
# 4. Save review report
```

**What to do:**
1. Copy the displayed prompt
2. Open Bob IDE
3. Run `/review` command or paste prompt
4. Copy Bob's review
5. Paste back into terminal

### Step 7: Generate PR Description

```bash
# Generate PR description
ai-sdlc pr FEATURE-001

# This will:
# 1. Compile all artifacts
# 2. Analyze final changes
# 3. Generate comprehensive PR description
# 4. Save to .ai-sdlc/tasks/FEATURE-001/pr-description.md
```

### Step 8: Create Pull Request

```bash
# Push branch
git push origin feature/feature-001

# Create PR using GitHub CLI
gh pr create \
  --title "feat: Integrate A2A Agents into Plugin Framework" \
  --body-file .ai-sdlc/tasks/FEATURE-001/pr-description.md \
  --base main

# Or use GitHub web interface
```

---

## 🧪 Testing Workflow

### Run Tests

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage
```

### Verify Changes

```bash
# Check git status
git status

# View diff
git diff main...feature/feature-001

# View commit history
git log --oneline main..feature/feature-001
```

---

## 📊 Workflow Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    AI SDLC Wrapper Workflow                  │
└─────────────────────────────────────────────────────────────┘

1. init          → Initialize project
2. new           → Create task from issue
3. analyze       → Generate requirements (via Bob)
4. generate      → Create implementation prompt (via Bob)
5. [MANUAL]      → Implement code (Bob or manual)
6. review        → Code review (via Bob)
7. pr            → Generate PR description
8. [MANUAL]      → Create actual PR on GitHub

┌─────────────────────────────────────────────────────────────┐
│                    Key Points                                │
└─────────────────────────────────────────────────────────────┘

✅ Tool orchestrates workflow
✅ Tool generates prompts for Bob
✅ Tool manages artifacts and state
❌ Tool does NOT write code directly
❌ Tool does NOT create PRs automatically

💡 Bob IDE writes the code
💡 You review and commit
💡 Tool helps manage the process
```

---

## 🔧 Customization Options

### Skip Stages

```bash
# Skip review stage
ai-sdlc run "Feature" --skip-stages review

# Skip multiple stages
ai-sdlc run "Feature" --skip-stages analyze,review
```

### Auto-Approve Mode

```bash
# Skip approval gates
ai-sdlc run "Feature" --auto-approve
```

### Custom Description

```bash
# Inline description
ai-sdlc new "Feature" -d "Description text"

# From file
ai-sdlc new "Feature" -d ./requirements.md
```

---

## 🎯 Limitations & Future Enhancements

### Current Limitations

1. ❌ No direct code generation
2. ❌ Requires manual Bob IDE interaction
3. ❌ No automatic PR creation
4. ❌ No CI/CD integration

### Possible Enhancements

1. ✨ Integrate with Bob API (when available)
2. ✨ Add code generation via OpenAI/Anthropic
3. ✨ Automatic PR creation via GitHub API
4. ✨ CI/CD pipeline integration
5. ✨ Automated testing execution
6. ✨ Code quality checks

---

## 📚 Additional Resources

- **Tool Documentation**: `README.md`
- **Architecture**: `AUTOMATION_PLAN.md`
- **Skills**: `.bob/skills/` directory
- **Examples**: `tests/` directory

---

## 🆘 Troubleshooting

### Issue: Tool hangs waiting for input

**Solution**: The tool is waiting for you to paste Bob's response. Press Ctrl+C to cancel.

### Issue: No code changes generated

**Explanation**: The tool doesn't generate code. You need to:
1. Use Bob IDE to write code, OR
2. Manually implement based on requirements

### Issue: PR not created

**Explanation**: The tool generates PR descriptions but doesn't create PRs. Use:
```bash
gh pr create --body-file .ai-sdlc/tasks/FEATURE-XXX/pr-description.md
```

---

## ✅ Conclusion

The `ai-sdlc-wrapper` is a **workflow orchestration tool**, not a code generator. It:

- ✅ Manages SDLC process
- ✅ Generates prompts for Bob
- ✅ Tracks artifacts
- ✅ Prepares PR descriptions

For actual code generation, you need to:
- Use Bob IDE (manual interaction)
- Implement manually
- Or integrate with AI APIs

This design keeps the tool focused on orchestration while leveraging Bob's AI capabilities for code generation.