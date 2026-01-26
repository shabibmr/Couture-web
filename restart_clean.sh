#!/bin/bash

# Get the directory where the script is located
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "----------------------------------"
echo "Restarting with Clean Logs"
echo "----------------------------------"

# 1. Stop existing services
echo -e "\n\033[33m[1/3] Stopping services...\033[0m"
if [ -f "$ROOT/stop_all.sh" ]; then
    "$ROOT/stop_all.sh"
else
    echo "stop_all.sh not found. Skipping stop step."
fi

# 2. Clear logs
echo -e "\n\033[33m[2/3] Clearing log files...\033[0m"
# Clear or create empty log files
: > "$ROOT/admin.log"
: > "$ROOT/backend.log"
: > "$ROOT/customer.log"
echo "Logs cleared: admin.log, backend.log, customer.log"

# 3. Start services
echo -e "\n\033[33m[3/3] Starting services...\033[0m"
if [ -f "$ROOT/start_all.sh" ]; then
    "$ROOT/start_all.sh"
else
    echo "start_all.sh not found. Please start services manually."
fi
