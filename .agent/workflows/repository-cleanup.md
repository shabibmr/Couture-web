---
description: Workflow for identifying and cleaning up obsolete files and code in the repository.
---

# Repository Cleanup Workflow

This workflow guides the process of identifying, reporting, and removing obsolete files and code from the codebase.

1. **Identify Obsolete Files**
   - Search for unused Markdown files (`.md`) that look like temporary reports or old documentation.
   - Search for unused SQL files (`.sql`) that are not referenced in the active codebase or `package.json`.
   - Search for old One-off migration scripts (e.g., in `backend/scripts/`).
   - Identify duplicate logic or scripts that can be merged (e.g., DB setup scripts).

2. **Generate Cleanup Report**
   - Create a markdown report listing all identified candidates.
   - Categorize them into:
     - **Obsolete (Delete)**: Files clearly unused or superseded.
     - **Review Needed**: Files that might be useful.
     - **Merge Candidates**: Files that can be consolidated.
   - **CRITICAL**: Present this report to the user for review.

3. **Wait for User Approval**
   - **STOP**. Do not proceed until the user explicitly approves the deletion of specific files.

4. **Execute Cleanup**
   - DELETE the files approved for deletion.
   - ARCHIVE files if requested.

5. **Consolidate Scripts (If applicable)**
   - If multiple scripts perform similar tasks (e.g., DB setup), propose a merged version.
   - Create the new consolidated script.
   - Update `package.json` or other active references to use the new script.
   - Verify the new script works as expected.
   - Delete the old individual scripts.

6. **Final Verification**
   - Run related commands (e.g., `npm run db:setup`) to ensure no functionality is broken.
   - Report final status to the user.
