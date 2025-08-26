# How to Run WeaveViz

This guide provides simple instructions to get WeaveViz running on your machine.

## Prerequisites

Before running WeaveViz, ensure you have:
- **Node.js 20+** installed ([Download here](https://nodejs.org/))
- **pnpm** package manager installed: `npm install -g pnpm`

## Quick Start

### Option 1: Automated Setup (Recommended)

**For Windows:**
```cmd
scripts\setup.bat
```

**For Linux/macOS:**
```bash
bash scripts/setup.sh
```

**Then start the application:**
```bash
pnpm dev
```

### Option 2: Manual Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Build shared packages:**
   ```bash
   pnpm --filter @weaveviz/shared build
   ```

3. **Setup environment files:**
   ```bash
   # Copy environment templates
   cp apps/api/env.example apps/api/.env
   cp apps/web/env.example apps/web/.env
   ```

4. **Initialize database:**
   ```bash
   cd apps/api
   pnpm prisma generate
   pnpm prisma migrate dev --name init
   cd ../..
   ```

5. **Start development servers:**
   ```bash
   pnpm dev
   ```

## Access the Application

Once running, open your browser and navigate to:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:4000
- **API Health Check:** http://localhost:4000/health

## Running Individual Services

If you need to run services separately:

```bash
# Frontend only
pnpm --filter @weaveviz/web dev

# Backend only  
pnpm --filter @weaveviz/api dev
```

## Using Docker (Alternative)

For containerized deployment:

```bash
# Start all services
pnpm dc:up

# Access at http://localhost:3000 (web) and http://localhost:4000 (api)

# Stop services
pnpm dc:down
```

## First Time Usage

1. **Login:** Use any email/password (demo mode)
2. **Upload Data:** Try the sample file at `sample-data/sample_sales.csv`
3. **Explore:** Review the data profiling and preview features

## Troubleshooting

**Port conflicts:**
```bash
# Kill processes on default ports
npx kill-port 5173 4000
```

**Database issues:**
```bash
cd apps/api
rm -f dev.db*
pnpm prisma migrate dev --name init
```

**Clean reinstall:**
```bash
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
```

## Available Commands

```bash
pnpm dev          # Start all development servers
pnpm build        # Build for production
pnpm test         # Run tests
pnpm lint         # Lint codebase
pnpm dc:up        # Start with Docker
pnpm dc:down      # Stop Docker services
```

That's it! WeaveViz should now be running and ready to transform your spreadsheets into insights. 🚀
