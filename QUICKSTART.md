# AI SDLC Wrapper - Quick Start Guide

## 🚀 5-Minute Setup

### Prerequisites

- Node.js 18+ installed
- Git repository initialized
- Bob IDE installed (optional but recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-sdlc-wrapper.git
cd ai-sdlc-wrapper

# Install dependencies
npm install

# Build the tool
npm run build

# Link globally (optional)
npm link
```

### First Use

```bash
# Navigate to your project
cd /path/to/your-project

# Initialize AI SDLC
ai-sdlc init

# Create your first task
ai-sdlc new "Add user authentication" -d "Implement JWT-based auth"

# Output: Created task FEATURE-001
```

---

## 📋 Basic Workflow

### Option 1: Quick Automated Workflow

```bash
# Run complete workflow in one command
ai-sdlc run "Feature title" -d "Description or path/to/issue.md"

# Follow the prompts:
# 1. Copy generated prompt
# 2. Paste into Bob IDE
# 3. Copy Bob's response
# 4. Paste back
# 5. Done! PR description generated
```

### Option 2: Step-by-Step Control

```bash
# 1. Create task
ai-sdlc new "Feature title" -d "Description"
# → FEATURE-001

# 2. Analyze requirements
ai-sdlc analyze FEATURE-001
# → Generates prompt for Bob Plan mode

# 3. Generate implementation
ai-sdlc generate FEATURE-001
# → Creates branch, generates code prompt

# 4. [Write code here]

# 5. Review code
ai-sdlc review FEATURE-001
# → Generates review prompt

# 6. Generate PR
ai-sdlc pr FEATURE-001
# → Creates PR description
```

---

## 🎯 What You Get

After running the workflow, you'll have:

- ✅ Structured task with unique ID
- ✅ Feature branch created
- ✅ Requirements documented
- ✅ Implementation plan
- ✅ PR description ready
- ✅ All artifacts saved in `.ai-sdlc/`

---

## 📚 Next Steps

- Read [COMPLETE_WORKFLOW_GUIDE.md](./COMPLETE_WORKFLOW_GUIDE.md) for detailed instructions
- Check [STEP_BY_STEP_TUTORIAL.md](./STEP_BY_STEP_TUTORIAL.md) for a complete example
- See [README.md](./README.md) for full documentation

---

## 🆘 Common Issues

### Tool not found after npm link

```bash
# Re-link the tool
npm unlink
npm link
```

### Build errors

```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Interactive prompt hangs

Press `Ctrl+C` to cancel and restart the command.

---

## 💡 Pro Tips

1. **Use issue files**: Store requirements in markdown files
2. **Auto-approve mode**: Use `--auto-approve` to skip confirmation prompts
3. **Reuse context**: Repository context is cached for faster subsequent runs
4. **Check artifacts**: All data saved in `.ai-sdlc/tasks/`

---

**Ready to dive deeper?** → [STEP_BY_STEP_TUTORIAL.md](./STEP_BY_STEP_TUTORIAL.md)