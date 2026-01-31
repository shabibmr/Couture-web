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

echo -e "\n\033[33mWaiting for services to initialize and bind ports...\033[0m"

# Variables to store found ports
ADMIN_URL=""
BACKEND_PORT=""
CUSTOMER_URL=""

# Loop to check logs for ports (timeout after 30 seconds)
MAX_RETRIES=30
for ((i=1; i<=MAX_RETRIES; i++)); do
    # Check Admin Log for "Local: http://localhost:PORT"
    if [ -z "$ADMIN_URL" ] && [ -f "$ROOT/admin.log" ]; then
        # Grep for the URL pattern, handle potential color codes or whitespace
        ADMIN_URL=$(grep -o "http://localhost:[0-9]*" "$ROOT/admin.log" | tail -n 1)
    fi

    # Check Customer Log for "Local: http://localhost:PORT"
    if [ -z "$CUSTOMER_URL" ] && [ -f "$ROOT/customer.log" ]; then
        CUSTOMER_URL=$(grep -o "http://localhost:[0-9]*" "$ROOT/customer.log" | tail -n 1)
    fi

    # Check Backend Log for "Server is running on port PORT"
    if [ -z "$BACKEND_PORT" ] && [ -f "$ROOT/backend.log" ]; then
        BACKEND_PORT=$(grep "Server is running on port" "$ROOT/backend.log" | awk '{print $NF}' | tr -d '\r')
    fi

    # If all found, break
    if [ -n "$ADMIN_URL" ] && [ -n "$CUSTOMER_URL" ] && [ -n "$BACKEND_PORT" ]; then
        break
    fi

    sleep 1
    echo -ne "."
done
echo ""

# Default values if not found (fallback to expected to not show empty)
[ -z "$ADMIN_URL" ] && ADMIN_URL="http://localhost:5174 (Not detected yet)"
[ -z "$CUSTOMER_URL" ] && CUSTOMER_URL="http://localhost:5173 (Not detected yet)"
[ -z "$BACKEND_PORT" ] && BACKEND_PORT="5000 (Not detected yet)"

echo -e "\n\033[32mAll services started.\033[0m"
echo "----------------------------------"
echo "Actual Running Ports:"
echo "  Admin:    $ADMIN_URL"
echo "  Backend:  http://localhost:$BACKEND_PORT"
echo "  Customer: $CUSTOMER_URL"
echo "----------------------------------"
echo "Commands to manage services:"
echo "1. View logs:      tail -f admin.log"
echo "                   tail -f backend.log"
echo "                   tail -f customer.log"
echo "2. Check processes: ps -p \$(cat .pids)"
echo "3. Stop all:       ./stop_all.sh"
echo "----------------------------------"
