@echo off
REM WeaveViz Setup Script for Windows
REM This script sets up the development environment for WeaveViz

echo 🚀 Setting up WeaveViz development environment...

REM Check if pnpm is installed
where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ pnpm is not installed. Please install it first:
    echo npm install -g pnpm
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Install dependencies
echo 📦 Installing dependencies...
pnpm install

REM Set up environment files
echo 🔧 Setting up environment files...

REM Backend environment
if not exist apps\api\.env (
    copy apps\api\env.example apps\api\.env
    echo ✅ Created apps\api\.env from example
) else (
    echo ℹ️  apps\api\.env already exists
)

REM Frontend environment
if not exist apps\web\.env (
    copy apps\web\env.example apps\web\.env
    echo ✅ Created apps\web\.env from example
) else (
    echo ℹ️  apps\web\.env already exists
)

REM Build shared packages
echo 🔨 Building shared packages...
pnpm --filter @weaveviz/shared build

REM Set up database
echo 🗄️  Setting up database...
cd apps\api

REM Generate Prisma client
pnpm prisma generate

REM Run database migrations
pnpm prisma migrate dev --name init

REM Create uploads directory
if not exist uploads mkdir uploads

cd ..\..

echo.
echo 🎉 Setup complete!
echo.
echo To start the development servers:
echo   pnpm dev
echo.
echo To start individual services:
echo   pnpm --filter @weaveviz/web dev    # Frontend only
echo   pnpm --filter @weaveviz/api dev    # Backend only
echo.
echo To use Docker:
echo   pnpm dc:up    # Start all services
echo   pnpm dc:down  # Stop all services
echo.
echo URLs:
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:4000
echo   Health:   http://localhost:4000/health
echo.
echo Sample data is available in the sample-data\ directory
