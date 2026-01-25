---
description: Analyze system logs to verify state changes and report success/failure without modifying code.
---

1. **Understand the Goal**: Your task is to analyze existing log files to understand the system's behavior versus expected behavior. You must NOT modify any application code.

2. **Locate Logs**: Identify relevant log files in the current workspace (e.g., `customer.log`, `backend.log`).

3. **Preliminary Log Scan**: Read the logs first to identify the specific key events, API endpoints, or error messages involved in the flow.

4. **Targeted Code Verification (Efficiency Step)**: 
   - INSTEAD of reading the entire codebase, use `grep_search` or `view_code_item` to look up *only* the specific text, error codes, or function names found in step 3.
   - **Rule**: If the log entry is a standard success (e.g., "Order placed successfully") and unambiguous, you may rely on the log. If the log indicates an *error* or *unexpected state*, you MUST briefly view the relevant code snippet to understand what *should* have happened.

5. **Create Report**: Create a new file named `log_analysis_report.md` in the root of the workspace.

6. **Report Content**:
   - The report MUST contain a table with the following columns:
     - **Step**: The logical step in the process.
     - **Expected State Change**: What should have happened (derived from code or standard flow).
     - **Actual State Change**: What actually happened according to the logs.
     - **Status**: Success or Failure.

7. **Deliver**: Present the `log_analysis_report.md` to the user.
