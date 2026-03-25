# Multi-Table Development Guide

## Project Overview

Multi-Table is a powerful multi-dimensional table component supporting React and Vue.

## Project Structure

```
multi-table/
├── packages/
│   ├── shared/          # Shared code (types, utils, data management)
│   ├── core/            # React table component
│   ├── vue/             # Vue table component
│   └── docs/            # Documentation and demo site
├── vitest.config.ts     # Test configuration
├── vitest.setup.ts      # Test setup
└── package.json         # Root package.json
```

## Tech Stack

- **Language**: TypeScript
- **Build Tool**: tsdown (rolldown)
- **Package Manager**: pnpm (monorepo)
- **Testing**: Vitest 4.x + @testing-library/react
- **Code Quality**: ESLint + Prettier + lint-staged + husky

## Common Commands

```bash
# Development
pnpm dev                 # Start docs dev server

# Build
pnpm build               # Build all packages
pnpm build:shared        # Build shared package
pnpm build:core          # Build core package

# Testing
pnpm test                # Run tests in watch mode
pnpm test:run            # Run tests once
pnpm test:coverage       # Generate coverage report

# Code Quality
pnpm lint                # Check code
pnpm lint:fix            # Fix code issues
pnpm format              # Format code
```

## Implemented Features

### @multi-table/shared

**Types** (`types/index.ts`)
- `FieldType` - 20 field types (text, number, select, checkbox, date, url, email, etc.)
- `Column`, `Row`, `Cell`, `CellValue` - Core data structures
- `TableData`, `Selection`, `TableState` - Table state
- `OperationType`, `Operation` - Operation types and records

**Data Management** (`data/`)
- `DataManager` - Table data CRUD operations
- `HistoryManager` - Undo/redo history management
- `operations.ts` - 16 operation handler functions

**Utilities** (`utils/index.ts`)
- `generateId` - Generate UUID
- `getValueByPath` - Get value by path
- `sortData` - Sort data
- `flattenData` - Flatten nested data
- `extractColumns` - Extract columns

### @multi-table/core (React)

**Components**
- `MultiTable` - Main component
- `TableHeader` - Header component
- `TableBody` - Body component
- `TableCell` - Cell component

**Props**
- `data: TableData` - Table data
- `showRowNumber?: boolean` - Show row numbers
- `striped?: boolean` - Striped rows
- `bordered?: boolean` - Borders
- `hoverable?: boolean` - Hover effect
- `rowHeight?: number` - Row height
- `headerHeight?: number` - Header height

**Styling Features**
- CSS variables theme
- Dark mode support
- Modern UI design

## Roadmap

- [ ] More field type renderers
- [ ] Cell selection and navigation
- [ ] Cell editing
- [ ] Row/column operations (drag, context menu, etc.)
- [ ] Virtual scrolling
- [ ] Fixed columns
- [ ] Sorting/filtering

## Development Guidelines

### Git Commit Convention

Use Conventional Commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation update
- `refactor:` Refactoring
- `test:` Test related
- `chore:` Build/tooling related

### Branch Convention

- `main` - Main branch
- `feat/*` - Feature branches
- `fix/*` - Fix branches

### Testing Guidelines

**After adding or modifying features:**
1. Check if new code needs tests
2. Update related test files
3. Run `pnpm test:run` to ensure all tests pass

**Test File Naming:**
- Test files should be in the same directory as source files
- Naming format: `*.test.ts` or `*.test.tsx`

## Important Notes

1. **Type Safety**: After modifying shared package types, rebuild with `pnpm build:shared`
2. **Dependencies**: When docs package depends on shared, declare it in package.json
3. **Test Coverage**: Every feature should have corresponding test cases