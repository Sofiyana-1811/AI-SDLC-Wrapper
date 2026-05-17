# AI SDLC Wrapper – IBM Bob Hackathon

# Master Plan

## 1. Project Goal

Build a TypeScript CLI tool that converts a vague feature idea into structured SDLC artifacts such
as requirements, repository context, implementation prompts, review reports, repair prompts,
and PR descriptions. IBM Bob IDE acts as the main execution engine using /init, Skills, Plan,
Code, Advanced mode, and /review.

## 2. Why This Fits the Hackathon

The hackathon requires IBM Bob IDE to be a core component and requires exporting Bob task
sessions to a bob_sessions folder for judging. This project showcases Bob across the full
software lifecycle.

## 3. Final MVP Commands

ai-sdlc init

ai-sdlc new "Add rate limiting to login endpoint"

ai-sdlc analyze FEATURE- 001

ai-sdlc generate FEATURE- 001 --assistant cursor

ai-sdlc review FEATURE- 001

ai-sdlc pr FEATURE- 001

## 4. Folder Structure

.bob/skills/

.ai-sdlc/tasks/

src/cli/

src/core/

src/repo/

src/adapters/


src/git/

src/review/

tests/

bob_sessions/

README.md

AGENTS.md

## 5. Recommended Tech Stack

TypeScript, Node.js, Commander.js, Jest, ts-node, tsup.

## 6. Step-by-Step Build Order

Hour 1: Initialize project and run Bob /init.

Hour 2: Build task-store and init/new commands.

Hour 3: Build repository analyzer.

Hour 4: Create four Bob Skills.

Hour 5: Build prompt generators.

Hour 6: Build git diff analyzer.

Hour 7: Build PR generator.

Hour 8: Write tests and run Bob /review.

Hour 9: Write README and export sessions.

Hour 10: Rehearse demo and submit.

## 7. Bob Skills to Create

sdlc-plan, sdlc-code, sdlc-review, sdlc-deliver.

## 8. Exact Bob Workflow

1. Open project in Bob IDE.
2. Run /init.


3. Use Plan mode for architecture.
4. Use Code mode for implementation.
5. Use Advanced mode to run Skills.
6. Use /review for code review.
7. Export task histories to bob_sessions/.

## 9. Demo Scenario

Use a small Express app and the feature: Add rate limiting to the login endpoint.

## 10. Submission Checklist

Public GitHub repository.

Working CLI.

README with architecture and demo steps.

bob_sessions folder with exported task histories and screenshots.

2 - minute demo video.

## 11. Bobcoin Strategy

Keep prompts focused and break work into small tasks to stay within the 40 Bobcoins per user.

## 12. Common Mistakes to Avoid

Do not treat Bob as just another adapter.

Do not forget to run /init.

Do not forget to export session reports.

Do not commit credentials or API keys.

## References Used

This guide synthesizes the One-Week MVP Plan, the IBM Bob–native revised plan, and the
official IBM Bob Hackathon Guide.


