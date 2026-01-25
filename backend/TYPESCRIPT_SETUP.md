# TypeScript Configuration

This document describes the TypeScript setup for the Couture backend.

## Overview

The backend is being migrated from JavaScript to TypeScript incrementally. Both `.js` and `.ts` files can coexist during the migration period.

## File Structure

```
backend/
├── tsconfig.json              # Main TypeScript configuration
├── tsconfig.node.json         # Configuration for scripts and config files
├── src/
│   ├── types/
│   │   ├── index.ts           # Main type definitions
│   │   ├── environment.d.ts   # Environment variable types
│   │   └── sequelize.d.ts     # Sequelize helper types
│   └── ...
```

## Configuration Files

### `tsconfig.json`
Main TypeScript configuration with:
- **Strict mode** enabled for better type safety
- **Path aliases** configured (`@modules/*`, `@config/*`, etc.)
- **ES2020** target for modern JavaScript features
- **Gradual migration support** via `allowJs: true`

### `tsconfig.node.json`
Separate configuration for:
- Build scripts
- Configuration files
- Utility scripts

## Type Definitions

### Core Types (`src/types/index.ts`)
- Database model attributes (Customer, Product, Order, etc.)
- API request/response types
- Pagination and search parameters
- Authentication types

### Environment Types (`src/types/environment.d.ts`)
- All environment variables
- Database configuration
- API keys and secrets
- Service endpoints

### Sequelize Types (`src/types/sequelize.d.ts`)
- Helper types for Sequelize models
- Type-safe find/create/update options
- Association helper types

## Available Scripts

```bash
# Development (JavaScript)
npm run dev

# Development (TypeScript) - once app.ts is created
npm run dev:ts

# Type checking without emitting files
npm run type-check

# Build TypeScript to JavaScript
npm run build

# Run tests
npm test

# Production
npm start
```

## Path Aliases

The following path aliases are configured:

| Alias | Path | Example |
|-------|------|---------|
| `@modules/*` | `src/modules/*` | `import Customer from '@modules/identity/models/customer.model'` |
| `@config/*` | `src/config/*` | `import db from '@config/database'` |
| `@middleware/*` | `src/middleware/*` | `import { authenticate } from '@middleware/auth'` |
| `@types/*` | `src/types/*` | `import type { CustomerAttributes } from '@types'` |

## Migration Guidelines

### Converting a Module to TypeScript

1. **Start with Models**
   - Rename `.js` to `.ts`
   - Add interface for attributes
   - Add interface for creation attributes
   - Type the model class

2. **Then Controllers**
   - Import types from `@types`
   - Type request/response parameters
   - Type function parameters and return types

3. **Finally Routes**
   - Update imports to use TypeScript files
   - Type middleware if needed

### Example: Converting a Model

**Before (customer.model.js):**
```javascript
const Customer = sequelize.define('Customer', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Customer;
```

**After (customer.model.ts):**
```typescript
interface CustomerAttributes {
  id: string;
  email: string;
  // ... other fields
}

interface CustomerCreationAttributes extends Optional<CustomerAttributes, 'id'> {}

class Customer extends Model<CustomerAttributes, CustomerCreationAttributes> {
  declare id: string;
  declare email: string;
}

Customer.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, { sequelize });

export default Customer;
```

## Type Checking

Run type checking without building:

```bash
npm run type-check
```

This will check all TypeScript files for type errors without emitting JavaScript files.

## Best Practices

1. **Use strict typing** - Avoid `any` when possible
2. **Import types explicitly** - Use `import type` for type-only imports
3. **Define interfaces** - Create interfaces for all data structures
4. **Type request handlers** - Always type Express request/response
5. **Use path aliases** - Prefer `@modules/...` over relative paths
6. **Document complex types** - Add JSDoc comments for clarity

## Migration Progress

Track TypeScript migration progress:

- [ ] System Module
- [ ] Dashboard Module
- [ ] Inventory Module
- [ ] Marketing Module
- [ ] Notification Module
- [ ] Identity Module
- [ ] Catalog Module
- [ ] Order Module
- [ ] Payment Module
- [ ] Config & Middleware
- [ ] Main Application

## Troubleshooting

### Cannot find module with path alias

Ensure `tsx` or `ts-node` is being used:
```bash
npm run dev:ts  # Uses tsx
```

### Type errors in third-party packages

Add to `tsconfig.json`:
```json
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

### Import errors

Use the correct file extension in imports:
- For TypeScript files: `.ts` extension is optional
- For JavaScript files: `.js` extension required when importing from TS

## Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Sequelize TypeScript](https://sequelize.org/docs/v6/other-topics/typescript/)
- [Express TypeScript](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/express)
