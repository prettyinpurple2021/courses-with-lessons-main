#!/bin/bash
# Build script that ensures TypeScript is in PATH
set -e

# Add node_modules/.bin to PATH
export PATH="$PWD/node_modules/.bin:$PATH"

# Check if tsc exists
if ! command -v tsc &> /dev/null; then
    echo "Error: TypeScript (tsc) not found in PATH"
    echo "Checking node_modules/.bin/tsc..."
    if [ ! -f "node_modules/.bin/tsc" ]; then
        echo "Error: TypeScript binary not found. Please run: npm install"
        exit 1
    fi
    # Use direct path if not in PATH
    TSC="node_modules/.bin/tsc"
else
    TSC="tsc"
fi

# Run TypeScript compiler
echo "Running TypeScript compiler..."
$TSC

# Run Vite build
echo "Running Vite build..."
vite build



