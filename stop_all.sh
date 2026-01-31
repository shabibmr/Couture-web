#!/bin/bash

# Get the directory where the script is located
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Cleaning up services for project: $ROOT"

# 1. Try graceful stop using .pids file
if [ -f "$ROOT/.pids" ]; then
    echo -e "\033[33mStopping services from .pids file...\033[0m"
    while read -r pid; do
        if [ -n "$pid" ] && ps -p "$pid" > /dev/null; then
            kill "$pid"
            echo "Stopped process $pid"
        fi
    done < "$ROOT/.pids"
    rm "$ROOT/.pids"
else
    echo "No .pids file found."
fi

# 2. Force cleanup of lingering project processes
# Match node and esbuild processes running within this project directory
echo -e "\033[33mScanning for lingering processes...\033[0m"

# Count processes to be killed (for logging)
NODE_COUNT=$(pgrep -f "node .*$ROOT" | wc -l | xargs)
ESBUILD_COUNT=$(pgrep -f "esbuild .*$ROOT" | wc -l | xargs)

if [ "$NODE_COUNT" -gt 0 ] || [ "$ESBUILD_COUNT" -gt 0 ]; then
    echo "Found $NODE_COUNT node and $ESBUILD_COUNT esbuild processes."
    
    # Kill node processes (vite, tsx, server)
    pkill -f "node .*$ROOT" 2>/dev/null
    
    # Kill esbuild processes (vite dependencies)
    pkill -f "esbuild .*$ROOT" 2>/dev/null
    
    echo -e "\033[32mForce killed lingering processes.\033[0m"
else
    echo "No lingering processes found."
fi

echo -e "\033[32mAll services stopped and ports freed.\033[0m"
