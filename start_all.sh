#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo -e "\033[36mStarting services in background...\033[0m"

# Start admin service
cd "$PROJECT_ROOT/admin" && npm run dev > "$PROJECT_ROOT/logs/admin.log" 2>&1 &
ADMIN_PID=$!
echo "Admin service started (PID: $ADMIN_PID)"

# Start backend service
cd "$PROJECT_ROOT/backend" && npm run dev > "$PROJECT_ROOT/logs/backend.log" 2>&1 &
BACKEND_PID=$!
echo "Backend service started (PID: $BACKEND_PID)"

# Start customer service
cd "$PROJECT_ROOT/customer" && npm run dev > "$PROJECT_ROOT/logs/customer.log" 2>&1 &
CUSTOMER_PID=$!
echo "Customer service started (PID: $CUSTOMER_PID)"

# Save PIDs to a file for easy management
echo "$ADMIN_PID" > "$PROJECT_ROOT/logs/.pids"
echo "$BACKEND_PID" >> "$PROJECT_ROOT/logs/.pids"
echo "$CUSTOMER_PID" >> "$PROJECT_ROOT/logs/.pids"

echo -e "\n\033[32mAll services started in background.\033[0m"
echo "----------------------------------"
echo "Expected Ports:"
echo "  Admin:    http://localhost:5174"
echo "  Backend:  http://localhost:5000"
echo "  Customer: http://localhost:5173"
echo "----------------------------------"
echo "Commands to manage services:"
echo "1. View logs:      tail -f logs/admin.log"
echo "                   tail -f logs/backend.log"
echo "                   tail -f logs/customer.log"
echo "2. Check processes: ps -p \$(cat logs/.pids)"
echo "3. Stop all:       scripts/stop_all.sh"
echo "----------------------------------"
echo ""
echo "Log files created in logs directory:"
echo "  - logs/admin.log"
echo "  - logs/backend.log"
echo "  - logs/customer.log"
echo ""
