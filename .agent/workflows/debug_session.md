---
description: Manage an interactive debugging session: clear logs, wait for user reproduction, and analyze results with historical tracking.
---

1. **Clear Logs**: Start by clearing the relevant log files to ensure a clean slate for the test run.
   // turbo
   Run command: `> customer.log && > backend.log && > admin.log && echo "Logs cleared. Ready for testing."`

2. **Prompt User**: Notify the user that logs are cleared and ask them to reproduce the issue now. Stop and wait for their confirmation.
   - Use `notify_user` to say: "Logs have been confirmed cleared. Please reproduce the issue now and let me know when you are done."

3. **Read Logs**: Once the user confirms completion, read the content of the log files.
   // turbo
   Run command: `cat customer.log backend.log admin.log`

4. **Analyze**: Analyze the log output.
   - Look for error stacks, status codes (404, 500), and state changes.
   - Compare the logs against the expected flow of the application.

5. **Report & History**: Update `debug_analysis_history.md` with a State Transition Table.
   - **Table Logic**: strict comparison of the application flow over the last 4 runs.
   - **Columns Required**:
     1. **Step**: The logical step in the flow (e.g., "Login", "Add to Cart").
     2. **Expected State**: What *should* happen.
     3. **Trial N-3**: State from 3 runs ago.
     4. **Trial N-2**: State from 2 runs ago.
     5. **Trial N-1**: State from the previous run.
     6. **Current Trial**: Actual state found in *this* log analysis.
   - **Instruction**: Read the existing `debug_analysis_history.md` (if it exists). Shift the historical data one column to the left (discarding N-4) and insert your new findings into the "Current Trial" column. If no history exists, populate columns with "N/A" or "First Run".
