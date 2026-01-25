---
description: Map all user process flows with state changes in a comprehensive tree structure
---

# Process Flow Mapping Workflow

This workflow helps create a comprehensive map of all user process flows in the application, documenting state changes at each step in an organized tree structure.

## Steps

### 1. Identify Application Components

First, identify all major application components (customer frontend, admin, backend APIs, etc.) and their entry points.

**Prompt to use:**
```
Analyze the application structure and identify:
- All frontend applications (customer, admin, etc.)
- All backend API modules
- Main routing files
- Context providers and state management files

List these with their file paths.
```

### 2. Map Core User Journeys

Identify all primary user journeys by analyzing route definitions, page components, and navigation flows.

**Prompt to use:**
```
For each application component, map out all user journeys by:
- Examining routing files to identify all routes/pages
- Identifying navigation flows between pages
- Finding all user-triggered actions (buttons, forms, links)
- Grouping related flows into logical user journeys (e.g., "Product Discovery", "Purchase Flow", "Account Management")

Create a hierarchical list of all user journeys.
```

### 3. Document State Changes Per Flow

For each identified user journey, trace the complete flow and document all state changes.

**Prompt to use:**
```
For each user journey, create a detailed flow map that includes:

1. **Flow Name**: Clear, descriptive name
2. **Entry Point**: Where the flow starts (page, component, user action)
3. **Steps**: Sequential list of steps with:
   - **Action**: What the user does
   - **Frontend State Changes**: 
     - Context updates (AuthContext, ShopContext, etc.)
     - Local state changes
     - LocalStorage changes
     - UI state (loading, errors, etc.)
   - **Backend Calls**: API endpoints called, if any
   - **Backend State Changes**:
     - Database operations (INSERT, UPDATE, DELETE)
     - Session changes
     - Cache updates
   - **Validation/Checks**: Any conditions evaluated
   - **Possible Outcomes**: Success, failure, edge cases
   - **Next Step**: Where the flow continues
4. **Exit Point**: Where the flow ends
5. **Error Handling**: How errors are handled at each step

Organize this as a tree structure where:
- Root = User Journey Name
- Branch = Major Step
- Leaf = Specific State Change or Action
```

### 4. Create Organized Output

Structure the findings in a clear, scannable format.

**Suggested Output Format:**
```markdown
# Application Process Flow Map

## [Application Component Name]

### Journey 1: [Journey Name]
**Entry Point**: [Page/Component/Action]

#### Step 1: [Action Name]
- **User Action**: [What user does]
- **Frontend State**:
  - `ContextName.stateName`: `oldValue` → `newValue`
  - `localStorage.key`: `oldValue` → `newValue`
- **API Call**: `POST /api/endpoint`
  - Request: `{ ... }`
  - Response: `{ ... }`
- **Backend State**:
  - DB: `INSERT INTO table_name ...`
  - Session: `userId` set
- **Validation**: [Checks performed]
- **Outcomes**:
  - ✅ Success: [Next step]
  - ❌ Failure: [Error handling]

#### Step 2: [Next Action]
...

**Exit Point**: [Final state/page]

---

### Journey 2: [Journey Name]
...
```

### 5. Identify Cross-Flow Dependencies

Document how different flows interact or depend on each other.

**Prompt to use:**
```
Analyze all mapped flows and identify:
- Flows that share common state
- Flows that must complete before others can start
- Flows that can run in parallel
- State that persists across flows
- Common error states that affect multiple flows

Create a dependency tree or graph showing these relationships.
```

### 6. Validate with Log Analysis

If logs are available, verify the mapped flows against actual runtime behavior.

**Prompt to use:**
```
Using available log files (customer.log, backend.log, admin.log):
1. Trace actual user actions through the logs
2. Verify state changes match the mapped flows
3. Identify any undocumented flows or state changes
4. Flag discrepancies between expected and actual behavior

Update the flow map with findings.
```

### 7. Generate Final Report

Create a comprehensive, organized document with all flows.

**Output should include:**
- Table of contents with all journeys
- Visual tree structure for each flow
- State change summary tables
- Dependency diagrams
- Common patterns identified
- Error handling matrix
- Recommendations for improvements

**File name**: `process_flow_map.md` in the brain artifacts directory

## Tips

- Start with the most critical user journeys (e.g., authentication, checkout)
- Use mermaid diagrams for complex flows if helpful
- Keep state change notation consistent
- Document assumptions when state behavior is unclear
- Include timestamps or version info for accuracy
- Use tables for comparing expected vs actual states
- Color-code or tag flows by priority/status

## Example Tree Structure

```
Authentication Flow
├── Sign Up
│   ├── Enter Email/Password
│   │   ├── Frontend: email state updated
│   │   ├── Frontend: password state updated
│   │   └── Validation: email format check
│   ├── Submit Form
│   │   ├── API: POST /auth/signup
│   │   ├── Backend: INSERT INTO users
│   │   ├── Backend: Generate JWT token
│   │   └── Frontend: AuthContext.user = userData
│   └── Redirect to Dashboard
│       └── Frontend: navigate('/dashboard')
├── Sign In
│   └── [Similar structure]
└── Sign Out
    └── [Similar structure]
```
