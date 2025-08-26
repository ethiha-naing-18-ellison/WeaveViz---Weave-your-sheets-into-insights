# WeaveViz – Weave Your Sheets Into Insights

A production-grade data visualization web application that turns arbitrary CSV/Excel files into interactive Tableau-style dashboards.

## Features

- **File Upload & Parsing**: Support for CSV and Excel files with intelligent type inference
- **Data Profiling**: Automatic field type detection and statistical analysis
- **Interactive Charts**: Line, bar, pie charts and data tables using Recharts and AG Grid
- **Global Filters**: Date ranges, categorical filters, and numeric ranges
- **KPI Cards**: Configurable key performance indicators with period comparisons
- **Dashboard Builder**: Drag-and-drop dashboard creation with save/load functionality
- **High Performance**: Optimized for 50k+ rows on commodity hardware

## Technology Stack

### Frontend
- React 18 + Vite + TypeScript
- Tailwind CSS + shadcn/ui components
- Recharts for visualization
- AG Grid for data tables
- Zustand for state management
- Web Workers for heavy processing

### Backend
- Node.js 20+ with Express
- Prisma ORM with SQLite (dev) / PostgreSQL (prod)
- JWT authentication
- Redis caching (optional)

## Quick Start

> 📖 **For detailed setup instructions, see [GETTING_STARTED.md](GETTING_STARTED.md)**

### Prerequisites
- Node.js 20+ 
- pnpm 8+

### Automatic Setup
Run the setup script to get started quickly:

**Linux/macOS:**
```bash
bash scripts/setup.sh
```

**Windows:**
```cmd
scripts\setup.bat
```

### Manual Setup
1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Build shared packages**:
   ```bash
   pnpm --filter @weaveviz/shared build
   ```

3. **Set up environment**:
   ```bash
   cp apps/api/env.example apps/api/.env
   cp apps/web/env.example apps/web/.env
   ```

4. **Initialize database**:
   ```bash
   cd apps/api
   pnpm prisma generate
   pnpm prisma migrate dev --name init
   cd ../..
   ```

5. **Start development servers**:
   ```bash
   pnpm dev
   ```

   - Frontend: http://localhost:5173
   - Backend: http://localhost:4000

## Project Structure

```
weaveviz/
├── apps/
│   ├── web/          # React frontend
│   └── api/          # Express backend
├── packages/
│   └── shared/       # Shared types and schemas
├── sample-data/      # Sample CSV/Excel files
└── docker-compose.yml
```

## Sample Data

The `/sample-data` directory contains example files:
- `sample_sales.csv`: Sales transaction data
- `inventory.xlsx`: Inventory management data

## Environment Variables

### Backend (`apps/api/.env`)
```
NODE_ENV=development
PORT=4000
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
UPLOAD_DIR="./uploads"
TZ=Asia/Kuala_Lumpur
```

### Frontend (`apps/web/.env`)
```
VITE_API_BASE=http://localhost:4000/api
```

## Architecture

WeaveViz follows a monorepo architecture with clear separation between frontend and backend:

1. **Data Flow**: Upload → Parse → Profile → Visualize → Save
2. **State Management**: Zustand stores for datasets, dashboards, and authentication
3. **Performance**: Web Workers for parsing and aggregation
4. **Caching**: Client-side memoization and optional Redis backend caching

## Development

### Available Scripts

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all packages
- `pnpm lint` - Lint all packages
- `pnpm test` - Run all tests

### Docker Development

```bash
# Start all services
pnpm dc:up

# Stop all services
pnpm dc:down
```

## Deployment

1. **Environment Setup**: Configure production environment variables
2. **Database**: Set up PostgreSQL database
3. **Build**: Run `pnpm build`
4. **Deploy**: Use Docker Compose or your preferred hosting platform

## License

MIT License - see LICENSE file for details
