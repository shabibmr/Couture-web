---
description: Phase 4 Data Migration for MinIO
---

# Phase 4: Migration Workflow

1.  **Initialize**:
    - `view_file next_plan/minio_plan/agent_migration_phase4.md`
    - `view_file next_plan/minio_plan/phase4_migration.md`

2.  **Implementation**:
    - Follow the steps in `phase4_migration.md`.
    - Create `migrate_images_to_minio.ts`.
    - Create `cleanup_orphaned_minio_files.ts`.
    - Update `product.controller.js` with cleanup logic.

3.  **Verification**:
    - Run migration script (dry run).

4.  **Handoff**:
    - Update `next_plan/minio_plan/orchestrator_log.md` with "Phase 4 Complete".
    - **Trigger Orchestrator**:
      - Output message: "PHASE 4 COMPLETE. Please run the Orchestrator Agent to verify."
