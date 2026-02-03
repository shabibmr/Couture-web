---
description: State-Aware Orchestrator for Phase 3 (Agents C, D, E) and Phase 4. Checks todo.md status to resume progress.
---

# Phase 3 & 4 State-Aware Orchestrator

You are the Orchestrator. Your job is to check the project status and launch the correct agent.

## 1. Check Status
- **Action**: Read `next_plan/todo.md`.

## 2. Determine Next Agent (Execute ONLY ONE)

### Check Agent C (Main Shop Flow)
- **Condition**: Are items under `### Agent C: Main Shop Flow` marked as completed `[x]`?
- **Action (If Incomplete)**:
  - Run prompt: `next_plan/phase3_agent_c_prompt.md`
  - Stop here.

### Check Agent D (Product & Cart)
- **Condition**: Are items under `### Agent D: Product & Cart` marked as completed `[x]`?
- **Action (If Incomplete)**:
  - Run prompt: `next_plan/phase3_agent_d_prompt.md`
  - Stop here.

### Check Agent E (User & Checkout)
- **Condition**: Are items under `### Agent E: User & Checkout` marked as completed `[x]`?
- **Action (If Incomplete)**:
  - Run prompt: `next_plan/phase3_agent_e_prompt.md`
  - Stop here.

### Check Phase 4 (Verification)
- **Condition**: Are items under `## Phase 4: Verification & Polish` marked as completed `[x]`?
- **Action (If Incomplete)**:
  - Run prompt: `next_plan/phase4_verification_prompt.md`
  - Stop here.

## 3. All Complete
- If all checks pass, output: "Migration Phase 3 & 4 Complete! 🚀"
