#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ -f "$PROJECT_ROOT/logs/.pids" ]; then
    echo -e "\033[33mStopping services...\033[0m"
    while read -r pid; do
        if ps -p "$pid" > /dev/null; then
            kill "$pid"
            echo "Stopped process $pid"
        else
            echo "Process $pid already stopped"
        fi
    done < "$PROJECT_ROOT/logs/.pids"
    rm "$PROJECT_ROOT/logs/.pids"
    echo -e "\033[32mAll services stopped.\033[0m"
else
    echo -e "\033[31mNo .pids file found in logs/. Services might not be running.\033[0m"
fi
