#!/bin/bash

# WeaveViz Reset Script
# This script resets the development environment

set -e

echo "🔄 Resetting WeaveViz development environment..."

# Remove node_modules
echo "🗑️  Removing node_modules..."
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules

# Remove build artifacts
echo "🗑️  Removing build artifacts..."
rm -rf apps/*/dist
rm -rf packages/*/dist

# Reset database
echo "🗄️  Resetting database..."
cd apps/api
rm -f dev.db*
rm -rf prisma/migrations
cd ../..

# Remove uploads
echo "🗑️  Removing uploads..."
rm -rf apps/api/uploads

echo "✅ Reset complete!"
echo "Run 'bash scripts/setup.sh' to set up the environment again."
