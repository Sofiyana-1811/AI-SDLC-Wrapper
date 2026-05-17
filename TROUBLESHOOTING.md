# AI SDLC Wrapper - Troubleshooting Guide

## 🔧 Common Issues and Solutions

---

## Installation Issues

### Issue: `npm install` fails

**Symptoms:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions:**

```bash
# Solution 1: Use legacy peer deps
npm install --legacy-peer-deps

# Solution 2: Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Solution 3: Update npm
npm install -g npm@latest
```

### Issue: `npm run build` fails

**Symptoms:**
```
Error: Cannot find module 'tsup'
```

**Solutions:**

```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# Verify tsup is installed
npm list tsup

# Manual build
npx tsup
```

### Issue: `npm link` doesn't work

**Symptoms:**
```
ai-sdlc: command not found
```

**Solutions:**

```bash
# Solution 1: Check npm global bin path
npm config get prefix
# Add to PATH if needed

# Solution 2: Unlink and relink
npm unlink
npm link

# Solution 3: Use direct path
node /path/to/ai-sdlc-wrapper/dist/index.js <command>

# Solution 4: Add alias
echo 'alias ai-sdlc="node /path/to/ai-sdlc-wrapper/dist/index.js"' >> ~/.bashrc
source ~/.bashrc
```

---

## Runtime Issues

### Issue: Tool hangs waiting for input

**Symptoms:**
- Terminal shows prompt but doesn't accept input
- Cursor blinks but nothing happens

**Solutions:**

```bash
# Solution 1: Press Ctrl+C and restart
# Then paste your response when prompted

# Solution 2: Use auto-approve mode
ai-sdlc run "Feature" --auto-approve

# Solution 3: Check if editor is waiting
# The tool opens an editor (nano/vim) for multi-line input
# Save and exit the editor to continue
```

### Issue: "Not initialized" error

**Symptoms:**
```
Error: AI SDLC not initialized. Run: ai-sdlc init
```

**Solutions:**

```bash
# Solution 1: Initialize the project
cd /path/to/your-project
ai-sdlc init

# Solution 2: Check if .ai-sdlc directory exists
ls -la .ai-sdlc/

# Solution 3: Reinitialize if corrupted
rm -rf .ai-sdlc
ai-sdlc init
```

### Issue: "Task not found" error

**Symptoms:**
```
Error: Task FEATURE-001 not found
```

**Solutions:**

```bash
# Solution 1: List all tasks
ls .ai-sdlc/tasks/

# Solution 2: Check task ID
cat .ai-sdlc/tasks/*.json | jq '.id'

# Solution 3: Create the task first
ai-sdlc new "Feature title"
```

### Issue: Branch already exists

**Symptoms:**
```
Error: Branch feature/feature-001 already exists
```

**Solutions:**

```bash
# Solution 1: Switch to existing branch
git checkout feature/feature-001

# Solution 2: Delete and recreate
git branch -D feature/feature-001
ai-sdlc generate FEATURE-001

# Solution 3: Use different task ID
ai-sdlc new "Feature title"  # Creates FEATURE-002
```

---

## Git Issues

### Issue: No changes to commit

**Symptoms:**
```
nothing to commit, working tree clean
```

**Solutions:**

```bash
# Solution 1: Check if you implemented the code
git status

# Solution 2: Check if files were created
ls -la mcpgateway/services/

# Solution 3: Stage files manually
git add .
git commit -m "feat: implement feature"
```

### Issue: Merge conflicts

**Symptoms:**
```
CONFLICT (content): Merge conflict in file.py
```

**Solutions:**

```bash
# Solution 1: Resolve conflicts manually
# Edit the conflicted files
git add .
git commit -m "fix: resolve merge conflicts"

# Solution 2: Abort and restart
git merge --abort
git pull origin main
# Resolve conflicts before continuing
```

### Issue: Can't push to remote

**Symptoms:**
```
error: failed to push some refs
```

**Solutions:**

```bash
# Solution 1: Pull first
git pull origin feature/feature-001
git push origin feature/feature-001

# Solution 2: Force push (use with caution)
git push -f origin feature/feature-001

# Solution 3: Set upstream
git push -u origin feature/feature-001
```

---

## Bob IDE Integration Issues

### Issue: Bob doesn't respond

**Symptoms:**
- Pasted prompt but Bob doesn't generate output
- Bob shows error message

**Solutions:**

```bash
# Solution 1: Check prompt format
# Make sure you copied the ENTIRE prompt

# Solution 2: Try different Bob mode
# Plan mode for analysis
# Code mode for implementation
# Review mode for code review

# Solution 3: Simplify the prompt
# Break down into smaller tasks

# Solution 4: Check Bob's token limit
# Reduce context if prompt is too long
```

### Issue: Can't parse Bob's response

**Symptoms:**
```
Error: Failed to parse orchestrator response
```

**Solutions:**

```bash
# Solution 1: Check response format
# Bob's response should include all required sections

# Solution 2: Use manual format
# Create a structured response file

# Solution 3: Skip Bob integration
# Manually create artifacts
cat > response.json << 'EOF'
{
  "requirements": {...},
  "implementationPlan": {...}
}
EOF
```

---

## File System Issues

### Issue: Permission denied

**Symptoms:**
```
Error: EACCES: permission denied
```

**Solutions:**

```bash
# Solution 1: Check file permissions
ls -la .ai-sdlc/

# Solution 2: Fix permissions
chmod -R 755 .ai-sdlc/

# Solution 3: Run with sudo (not recommended)
sudo ai-sdlc init
```

### Issue: File not found

**Symptoms:**
```
Error: ENOENT: no such file or directory
```

**Solutions:**

```bash
# Solution 1: Check current directory
pwd

# Solution 2: Use absolute paths
ai-sdlc new "Feature" -d /absolute/path/to/issue.md

# Solution 3: Create missing directories
mkdir -p .ai-sdlc/tasks
```

---

## JSON Parsing Issues

### Issue: Invalid JSON in task file

**Symptoms:**
```
SyntaxError: Unexpected token in JSON
```

**Solutions:**

```bash
# Solution 1: Validate JSON
cat .ai-sdlc/tasks/FEATURE-001.json | jq .

# Solution 2: Fix JSON manually
# Edit the file and fix syntax errors

# Solution 3: Recreate task
rm .ai-sdlc/tasks/FEATURE-001.json
ai-sdlc new "Feature title"
```

---

## Performance Issues

### Issue: Tool is slow

**Symptoms:**
- Commands take a long time to execute
- Repository analysis hangs

**Solutions:**

```bash
# Solution 1: Check repository size
du -sh .

# Solution 2: Exclude large directories
# Add to .gitignore:
node_modules/
dist/
.venv/

# Solution 3: Use cached context
# Context is cached after first analysis

# Solution 4: Reduce file tree depth
# Edit src/repo/analyzer.ts to limit depth
```

---

## Module/Dependency Issues

### Issue: Cannot find module

**Symptoms:**
```
Error: Cannot find module 'chalk'
```

**Solutions:**

```bash
# Solution 1: Reinstall dependencies
npm install

# Solution 2: Check package.json
cat package.json | jq '.dependencies'

# Solution 3: Install missing module
npm install chalk
```

### Issue: ESM/CommonJS conflicts

**Symptoms:**
```
Error [ERR_REQUIRE_ESM]: require() of ES Module
```

**Solutions:**

```bash
# Solution 1: Check package.json type
cat package.json | jq '.type'
# Should be "module"

# Solution 2: Rebuild with correct format
npm run build

# Solution 3: Update tsup config
# format: ['esm'] in tsup.config.ts
```

---

## Testing Issues

### Issue: Tests fail

**Symptoms:**
```
FAIL tests/core/task-store.test.ts
```

**Solutions:**

```bash
# Solution 1: Run tests in watch mode
npm run test:watch

# Solution 2: Run specific test
npm test -- task-store.test.ts

# Solution 3: Update snapshots
npm test -- -u

# Solution 4: Check test environment
npm run test:coverage
```

---

## Configuration Issues

### Issue: Invalid configuration

**Symptoms:**
```
Error: Invalid configuration in .ai-sdlc/config.json
```

**Solutions:**

```bash
# Solution 1: Validate config
cat .ai-sdlc/config.json | jq .

# Solution 2: Reset configuration
rm .ai-sdlc/config.json
ai-sdlc init

# Solution 3: Manual fix
# Edit .ai-sdlc/config.json with correct format
```

---

## Debugging Tips

### Enable Verbose Logging

```bash
# Set environment variable
export DEBUG=ai-sdlc:*
ai-sdlc <command>

# Or inline
DEBUG=ai-sdlc:* ai-sdlc <command>
```

### Check Tool Version

```bash
ai-sdlc --version
```

### Inspect Task State

```bash
# View complete task data
cat .ai-sdlc/tasks/FEATURE-001.json | jq .

# View specific artifact
cat .ai-sdlc/tasks/FEATURE-001.json | jq '.artifacts.requirements'

# View task status
cat .ai-sdlc/tasks/FEATURE-001.json | jq '.status'
```

### Check Git State

```bash
# Current branch
git branch

# Recent commits
git log --oneline -5

# Changed files
git status

# Diff
git diff
```

### Verify File Structure

```bash
# Check directory structure
tree .ai-sdlc/

# Or without tree
find .ai-sdlc -type f

# Check skills
ls -la .bob/skills/
```

---

## Getting Help

### Check Documentation

1. [README.md](./README.md) - Main documentation
2. [QUICKSTART.md](./QUICKSTART.md) - Quick reference
3. [STEP_BY_STEP_TUTORIAL.md](./STEP_BY_STEP_TUTORIAL.md) - Complete tutorial
4. [COMPLETE_WORKFLOW_GUIDE.md](./COMPLETE_WORKFLOW_GUIDE.md) - Detailed guide

### Report Issues

If you encounter a bug:

1. Check if it's a known issue in this guide
2. Search existing GitHub issues
3. Create a new issue with:
   - Tool version (`ai-sdlc --version`)
   - Node version (`node --version`)
   - Operating system
   - Complete error message
   - Steps to reproduce

### Community Support

- GitHub Discussions
- Stack Overflow (tag: ai-sdlc-wrapper)
- Discord/Slack community

---

## Preventive Measures

### Best Practices

1. **Always initialize before use**
   ```bash
   ai-sdlc init
   ```

2. **Keep tool updated**
   ```bash
   cd /path/to/ai-sdlc-wrapper
   git pull
   npm install
   npm run build
   ```

3. **Backup task data**
   ```bash
   cp -r .ai-sdlc .ai-sdlc.backup
   ```

4. **Use version control**
   ```bash
   git add .ai-sdlc/
   git commit -m "chore: update task artifacts"
   ```

5. **Test in development first**
   ```bash
   # Create test branch
   git checkout -b test-ai-sdlc
   ai-sdlc init
   # Test workflow
   ```

---

## Emergency Recovery

### Corrupted Task Data

```bash
# Backup current state
cp -r .ai-sdlc .ai-sdlc.corrupted

# Reinitialize
rm -rf .ai-sdlc
ai-sdlc init

# Manually recreate tasks
ai-sdlc new "Feature title"
```

### Lost Work

```bash
# Check git history
git log --all --full-history -- .ai-sdlc/

# Restore from git
git checkout <commit-hash> -- .ai-sdlc/

# Or restore from backup
cp -r .ai-sdlc.backup .ai-sdlc
```

### Complete Reset

```bash
# Nuclear option - start fresh
rm -rf .ai-sdlc .bob
git checkout main
git branch -D feature/*
ai-sdlc init
```

---

## Still Having Issues?

If none of these solutions work:

1. **Enable debug mode** and capture output
2. **Check system requirements** (Node 18+, Git)
3. **Try on a fresh project** to isolate the issue
4. **Report the bug** with full details

Remember: Most issues are configuration or environment-related. Double-check your setup before reporting bugs!