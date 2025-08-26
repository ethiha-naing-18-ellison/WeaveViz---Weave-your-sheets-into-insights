# Getting Started with WeaveViz

Welcome to WeaveViz! This guide will help you get the application running and start building dashboards from your data.

## 🚀 Quick Setup

### Option 1: Automatic Setup (Recommended)

For Linux/macOS:
```bash
bash scripts/setup.sh
```

For Windows:
```cmd
scripts\setup.bat
```

### Option 2: Manual Setup

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Build shared packages**:
   ```bash
   pnpm --filter @weaveviz/shared build
   ```

3. **Set up environment variables**:
   ```bash
   # Copy environment files
   cp apps/api/env.example apps/api/.env
   cp apps/web/env.example apps/web/.env
   ```

4. **Initialize the database**:
   ```bash
   cd apps/api
   pnpm prisma generate
   pnpm prisma migrate dev --name init
   cd ../..
   ```

5. **Start the development servers**:
   ```bash
   pnpm dev
   ```

## 📊 First Dashboard

1. **Access the Application**:
   Open http://localhost:5173 in your browser

2. **Sign In**:
   Use any email and password (demo mode)

3. **Upload Sample Data**:
   - Use the provided `sample-data/sample_sales.csv`
   - Drag and drop it into the upload zone

4. **Review Data Profile**:
   - Check the auto-detected field types
   - Review statistics for each column

5. **Build Dashboard** (Coming Soon):
   - Add charts and KPIs
   - Apply filters
   - Save your dashboard

## 🔧 Development Commands

```bash
# Start all services
pnpm dev

# Start frontend only
pnpm --filter @weaveviz/web dev

# Start backend only
pnpm --filter @weaveviz/api dev

# Run tests
pnpm test

# Build for production
pnpm build

# Lint code
pnpm lint
```

## 🐳 Docker Development

```bash
# Start all services with Docker
pnpm dc:up

# Stop all services
pnpm dc:down

# View logs
docker-compose logs -f
```

## 📁 Project Structure

```
weaveviz/
├── apps/
│   ├── web/          # React frontend
│   └── api/          # Express backend
├── packages/
│   └── shared/       # Shared types and schemas
├── sample-data/      # Example CSV/Excel files
├── scripts/          # Setup and utility scripts
└── docker-compose.yml
```

## 🎯 What's Implemented

### ✅ Complete Features
- File upload and parsing (CSV/Excel)
- Intelligent data type inference
- Statistical profiling
- Data preview with AG Grid
- Authentication system (demo mode)
- Responsive UI with Tailwind CSS
- Docker deployment setup

### 🚧 In Progress Features
- Interactive chart builder
- Global filters system
- KPI cards
- Dashboard layout with drag & drop
- Save/load dashboards
- Data aggregation API

## 🛠️ Customization

### Adding New Chart Types
1. Create component in `apps/web/src/components/ChartFactory/`
2. Add to chart type enum in shared types
3. Update chart factory switch statement

### Extending Data Sources
1. Add parser in `apps/web/src/workers/parseWorker.ts`
2. Update file acceptance in `FileDropZone.tsx`
3. Add MIME type support

### Custom Themes
1. Modify `apps/web/tailwind.config.js`
2. Update CSS variables in `apps/web/src/styles/globals.css`
3. Adjust brand colors in shared configuration

## 🐛 Troubleshooting

### Common Issues

**Port already in use**:
```bash
# Kill processes on ports 5173 or 4000
npx kill-port 5173 4000
```

**Database connection issues**:
```bash
# Reset database
cd apps/api
rm -f dev.db*
pnpm prisma migrate dev --name init
```

**Node modules issues**:
```bash
# Clean install
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
```

### Performance Tips

- For large files (50k+ rows), use the web worker parsing
- Enable database profiling for server-side aggregation
- Use pagination for data preview tables
- Consider enabling DuckDB for client-side SQL queries

## 📚 Next Steps

1. **Explore the Sample Data**: Try uploading different file formats
2. **Review the Code**: Understand the architecture and components
3. **Extend Functionality**: Add new chart types or data sources
4. **Deploy**: Use Docker Compose for production deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📖 Documentation

- [Architecture Overview](README.md#architecture)
- [API Documentation](apps/api/README.md)
- [Frontend Guide](apps/web/README.md)
- [Docker Deployment](docker-compose.yml)

Happy building! 🎉
