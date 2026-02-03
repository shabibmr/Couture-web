---
description: Orchestrator workflow for MinIO integration
---

# MinIO Orchestrator Workflow

1.  **Read Context**:
    - `view_file next_plan/minio_plan/minio_context.md`
    - `view_file next_plan/minio_plan/orchestrator_log.md` (Create if missing)

2.  **Check Phase Status**:
    - Check which phases are marked complete in `next_plan/todo.md` (or the log).
    - If a phase just completed, verify the output.

3.  **Cross-Agent Coordination**:
    - If Phase 1 (Backend) is done, signal readiness for Phase 2 (Admin) integration testing.
    - If Phase 1 (Backend) is done, signal readiness for Phase 4 (Migration) scripts.

4.  **Verification Steps**:
    - **Upload Verification**: If Phase 1 & 2 complete, verify Admin -> MinIO upload flow.
    - **Display Verification**: If Phase 3 complete, verify Storefront displays MinIO images.
    - **Migration Verification**: If Phase 4 complete, check database for MinIO URLs.

5.  **Logging**:
    - Appending status updates to `next_plan/minio_plan/orchestrator_log.md`.
    - Provide a summary of overall progress.
