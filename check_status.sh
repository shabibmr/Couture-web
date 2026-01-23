#!/bin/bash

# Get the directory where the script is located
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "\033[36mChecking service status...\033[0m"
echo "----------------------------------"

if [ ! -f "$ROOT/.pids" ]; then
    echo -e "\033[31mNo .pids file found. Services are likely not running.\033[0m"
else
    # Process PIDs line by line
    # Format in .pids: Admin, Backend, Customer
    SERVICES=("Admin" "Backend" "Customer")
    i=0
    while read -r pid; do
        if ps -p "$pid" > /dev/null; then
            echo -e "\033[32m[RUNNING]\033[0m ${SERVICES[$i]} (PID: $pid)"
        else
            echo -e "\033[31m[STOPPED]\033[0m ${SERVICES[$i]} (PID: $pid)"
        fi
        ((i++))
    done < "$ROOT/.pids"
fi

echo "----------------------------------"
# Also check for listening ports
echo "Active Ports:"
for port in 5174 5000 5173; do
    if lsof -i :$port -stcp:LISTEN -Fp > /dev/null 2>&1; then
        echo -e "  Port $port: \033[32mLISTENING\033[0m"
    else
        echo -e "  Port $port: \033[31mNOT LISTENING\033[0m"
    fi
done
echo "----------------------------------"
