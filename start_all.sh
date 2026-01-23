#!/bin/bash

# Get the directory where the script is located
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "\033[36mStarting services in background...\033[0m"

# Start admin service
cd "$ROOT/admin" && npm run dev > "$ROOT/admin.log" 2>&1 &
ADMIN_PID=$!
echo "Admin service started (PID: $ADMIN_PID)"

# Start backend service
cd "$ROOT/backend" && npm run dev > "$ROOT/backend.log" 2>&1 &
BACKEND_PID=$!
echo "Backend service started (PID: $BACKEND_PID)"

# Start customer service
cd "$ROOT/customer" && npm run dev > "$ROOT/customer.log" 2>&1 &
CUSTOMER_PID=$!
echo "Customer service started (PID: $CUSTOMER_PID)"

# Save PIDs to a file for easy management
echo "$ADMIN_PID" > "$ROOT/.pids"
echo "$BACKEND_PID" >> "$ROOT/.pids"
echo "$CUSTOMER_PID" >> "$ROOT/.pids"

echo -e "\n\033[32mAll services started in background.\033[0m"
echo "----------------------------------"
echo "Expected Ports:"
echo "  Admin:    http://localhost:5174"
echo "  Backend:  http://localhost:5000"
echo "  Customer: http://localhost:5173"
echo "----------------------------------"
echo "Commands to manage services:"
echo "1. View logs:      tail -f admin.log"
echo "                   tail -f backend.log"
echo "                   tail -f customer.log"
echo "2. Check processes: ps -p \$(cat .pids)"
echo "3. Stop all:       ./stop_all.sh"
echo "----------------------------------"
echo ""
echo "Log files created in project root:"
echo "  - admin.log"
echo "  - backend.log"
echo "  - customer.log"
echo ""
