#!/bin/bash

# Get the directory where the script is located
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -f "$ROOT/.pids" ]; then
    echo -e "\033[33mStopping services...\033[0m"
    while read -r pid; do
        if ps -p "$pid" > /dev/null; then
            kill "$pid"
            echo "Stopped process $pid"
        else
            echo "Process $pid already stopped"
        fi
    done < "$ROOT/.pids"
    rm "$ROOT/.pids"
    echo -e "\033[32mAll services stopped.\033[0m"
else
    echo -e "\033[31mNo .pids file found. Services might not be running or were started differently.\033[0m"
fi
