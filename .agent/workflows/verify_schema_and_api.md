---
description: Verify database schema integrity and API contract consistency with parallel agents
---

# Parallel Schema & API Verification Workflow

This workflow coordinates two independent verification agents that run simultaneously to validate database schema consistency and API contract matching between frontend and backend.

## Overview

**Agent 1**: Database Schema Validator
- Verifies all field and table names in backend queries match the database schema

**Agent 2**: API Contract Validator  
- Verifies all API calls in customer frontend match backend endpoints

Both agents run in parallel and produce independent reports that can be cross-referenced.

---

## Agent 1: Database Schema Validator

### Objective
Verify that all database queries in the backend use correct table names and field names that match the actual database schema.

### Prompt for Agent 1

```
You are Agent 1: Database Schema Validator

Your task is to verify database schema integrity in the backend codebase.

## Steps:

1. **Locate Database Schema**
   - Find the database schema definition files (SQL migrations, Prisma schema, Sequelize models, or similar)
   - Document all table names and their fields
   - Note data types, constraints, and relationships
   - Location: /Users/admin/code/ruvera/ruveraweb/Couture-web/backend

2. **Extract All Database Queries**
   - Search for all database queries in the backend:
     - Raw SQL queries (SELECT, INSERT, UPDATE, DELETE)
     - ORM queries (Sequelize, Prisma, TypeORM, etc.)
     - Query builders
   - Document the file path and line number for each query

3. **Validate Table Names**
   - For each query, extract referenced table names
   - Compare against schema definitions
   - Flag discrepancies:
     - ❌ Table not in schema
     - ❌ Case mismatch (e.g., `Users` vs `users`)
     - ❌ Typos or deprecated tables
     - ✅ Valid table reference

4. **Validate Field Names**
   - For each query, extract all field names used
   - Compare against the schema for that specific table
   - Flag discrepancies:
     - ❌ Field not in table schema
     - ❌ Case mismatch
     - ❌ Typos or deprecated fields
     - ⚠️ Nullable field used without null checks
     - ✅ Valid field reference

5. **Check JOIN Relationships**
   - Verify foreign key relationships match schema
   - Ensure JOIN conditions use correct field names
   - Validate relationship cardinality

6. **Generate Report**
   Create a markdown report: `database_schema_validation.md`
   
   Structure:
   - Summary statistics (total queries, issues found, success rate)
   - Table reference validation results
   - Field reference validation results  
   - Critical issues requiring immediate attention
   - Warnings and recommendations
   - Detailed findings table with:
     - File path
     - Line number
     - Query snippet
     - Issue type
     - Expected vs Actual
     - Severity (Critical/Warning/Info)

## Output Location
Save report to: /Users/admin/.gemini/antigravity/brain/25d118f2-3604-4f9a-a251-77bad4c51693/database_schema_validation.md

Report completion status when done.
```

---

## Agent 2: API Contract Validator

### Objective
Verify that all API calls made in the customer frontend have matching endpoint implementations in the backend.

### Prompt for Agent 2

```
You are Agent 2: API Contract Validator

Your task is to verify API contract consistency between customer frontend and backend.

## Steps:

1. **Extract Backend API Endpoints**
   - Find all route definitions in backend
   - Location: /Users/admin/code/ruvera/ruveraweb/Couture-web/backend
   - Document for each endpoint:
     - HTTP Method (GET, POST, PUT, DELETE, PATCH)
     - Path/Route (e.g., `/api/products/:id`)
     - Controller/Handler function
     - Expected request body schema
     - Expected response schema
     - Authentication requirements
     - File location and line number

2. **Extract Frontend API Calls**
   - Find all API calls in customer frontend
   - Location: /Users/admin/code/ruvera/ruveraweb/Couture-web/customer
   - Search for:
     - `fetch()` calls
     - `axios` calls
     - API service functions
     - HTTP client calls
   - Document for each call:
     - HTTP Method
     - Endpoint URL
     - Request payload structure
     - Expected response handling
     - File location and line number

3. **Validate Endpoint Matching**
   - For each frontend API call, verify:
     - ✅ Matching backend endpoint exists
     - ✅ HTTP method matches
     - ✅ Path/route matches (handle dynamic segments)
     - ❌ Frontend calls non-existent endpoint
     - ❌ Method mismatch (e.g., frontend uses POST, backend expects GET)
     - ⚠️ Path structure differs

4. **Validate Request Contracts**
   - Compare request payloads:
     - ✅ All required fields included
     - ❌ Frontend sends fields backend doesn't expect
     - ❌ Frontend missing required fields
     - ⚠️ Data type mismatches
     - ⚠️ Field name case mismatches

5. **Validate Response Contracts**
   - Compare response handling:
     - ✅ Frontend handles all response fields
     - ⚠️ Backend returns fields frontend doesn't use
     - ❌ Frontend expects fields backend doesn't return
     - ⚠️ Type mismatches in response handling

6. **Check Authentication/Authorization**
   - Verify protected endpoints have auth in frontend calls
   - Verify frontend sends required auth headers/tokens
   - Flag unprotected sensitive endpoints

7. **Identify Unused Endpoints**
   - List backend endpoints NOT called by customer frontend
   - Categorize as: unused, admin-only, or potential dead code

8. **Generate Report**
   Create a markdown report: `api_contract_validation.md`
   
   Structure:
   - Summary statistics (total API calls, matches, mismatches)
   - Endpoint matching results
   - Request contract validation
   - Response contract validation
   - Authentication issues
   - Unused endpoints list
   - Critical issues requiring immediate attention
   - Detailed findings table with:
     - Frontend location (file:line)
     - Backend location (file:line)
     - Endpoint path
     - Issue type
     - Severity (Critical/Warning/Info)
     - Recommendation

## Output Location
Save report to: /Users/admin/.gemini/antigravity/brain/25d118f2-3604-4f9a-a251-77bad4c51693/api_contract_validation.md

Report completion status when done.
```

---

## Execution Instructions

### How to Run Both Agents Simultaneously

**Option 1: Using Multiple Chat Windows**
1. Open two separate chat windows/conversations with Antigravity
2. Copy Agent 1 prompt into first window
3. Copy Agent 2 prompt into second window  
4. Send both prompts at the same time
5. Monitor both agents independently

**Option 2: Single Prompt for Parallel Execution**
Send this combined prompt:

```
I need you to coordinate two parallel verification tasks. Spawn both analyses simultaneously:

TASK 1 - Database Schema Validation:
[Insert Agent 1 prompt here]

TASK 2 - API Contract Validation:
[Insert Agent 2 prompt here]

Execute both tasks in parallel and provide status updates as each completes.
```

### Expected Timeline
- Agent 1: ~15-30 minutes (depending on number of queries)
- Agent 2: ~20-40 minutes (depending on number of API calls)
- Both should complete within ~40 minutes

---

## Output Artifacts

Both agents will produce reports in:
`/Users/admin/.gemini/antigravity/brain/25d118f2-3604-4f9a-a251-77bad4c51693/`

**Files created:**
- `database_schema_validation.md` - Schema integrity report
- `api_contract_validation.md` - API contract consistency report

---

## Post-Verification Steps

### 1. Review Critical Issues
- Read both reports' "Critical Issues" sections first
- Prioritize fixes based on severity and impact

### 2. Cross-Reference Findings
- Check if API contract issues correlate with schema issues
- Identify systemic problems affecting both layers

### 3. Create Action Plan
- Group related issues
- Estimate effort for each fix
- Prioritize by: Critical → Warnings → Info

### 4. Optional: Generate Combined Report
Prompt to merge findings:
```
Review database_schema_validation.md and api_contract_validation.md.
Create a combined report highlighting:
- Total issues across both layers
- Issues that affect both frontend and backend
- Prioritized action items
- Quick wins vs complex fixes
Save as: verification_summary.md
```

---

## Tips for Success

- **Let agents run independently** - Don't interrupt unless there's an error
- **Check progress periodically** - Both agents should report status updates
- **Reserve resources** - Running analyses is CPU-intensive
- **Review incrementally** - Start fixing critical issues while agents complete
- **Version control** - Commit current code before making fixes
- **Document assumptions** - Note any edge cases found during verification

---

## Troubleshooting

**If Agent 1 can't find schema:**
- Manually specify schema file location
- Check for migration files in `backend/migrations` or `backend/database`
- Look for ORM model definitions

**If Agent 2 finds too many false positives:**
- Verify API base URL configuration
- Check for proxy settings in development
- Confirm route prefixes (e.g., `/api/v1/`)

**If agents are slow:**
- They may be analyzing large codebases
- Check for node_modules or build directories being scanned
- Narrow scope to specific modules if needed
