#!/bin/bash

# Ruvera Couture Backend Test Runner
# This script runs the full test suite with necessary ESM support enabled.

echo "🚀 Starting Ruvera Couture Backend Test Suite..."

# Set experimental flag for ESM support in Jest
export NODE_OPTIONS="--experimental-vm-modules"

# Run Jest
# --runInBand: Run all tests serially in the current process, rather than creating a worker pool of child processes that run tests
# --detectOpenHandles: Attempt to collect and print open handles preventing Jest from exiting cleanly
npx jest --runInBand --detectOpenHandles "$@"

# Check exit status
if [ $? -eq 0 ]; then
  echo "✅ All tests passed successfully!"
else
  echo "❌ Some tests failed. Please check the logs above."
  exit 1
fi
