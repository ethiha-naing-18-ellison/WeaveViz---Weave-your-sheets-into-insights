#!/bin/bash

# WeaveViz Setup Script
# This script sets up the development environment for WeaveViz

set -e

echo "🚀 Setting up WeaveViz development environment..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install it first:"
    echo "npm install -g pnpm"
    exit 1
fi

# Check if Node.js version is 20+
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version 20 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Set up environment files
echo "🔧 Setting up environment files..."

# Backend environment
if [ ! -f apps/api/.env ]; then
    cp apps/api/env.example apps/api/.env
    echo "✅ Created apps/api/.env from example"
else
    echo "ℹ️  apps/api/.env already exists"
fi

# Frontend environment
if [ ! -f apps/web/.env ]; then
    cp apps/web/env.example apps/web/.env
    echo "✅ Created apps/web/.env from example"
else
    echo "ℹ️  apps/web/.env already exists"
fi

# Build shared packages
echo "🔨 Building shared packages..."
pnpm --filter @weaveviz/shared build

# Set up database
echo "🗄️  Setting up database..."
cd apps/api

# Generate Prisma client
pnpm prisma generate

# Run database migrations
pnpm prisma migrate dev --name init

# Create uploads directory
mkdir -p uploads

cd ../..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the development servers:"
echo "  pnpm dev"
echo ""
echo "To start individual services:"
echo "  pnpm --filter @weaveviz/web dev    # Frontend only"
echo "  pnpm --filter @weaveviz/api dev    # Backend only"
echo ""
echo "To use Docker:"
echo "  pnpm dc:up    # Start all services"
echo "  pnpm dc:down  # Stop all services"
echo ""
echo "URLs:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:4000"
echo "  Health:   http://localhost:4000/health"
echo ""
echo "Sample data is available in the sample-data/ directory"
