# COELS CRMS Shared Module

## Overview

This package contains shared TypeScript types, Zod schemas, and enums used across the entire COELS CRMS monorepo.

## Usage

### In Backend

```typescript
import { 
  ApiResponse, 
  JwtPayload, 
  UserRole,
  LoginSchema,
  RegisterSchema 
} from '@coels-crms/shared'
```

### In Frontend

```typescript
import { 
  ApiResponse, 
  JwtPayload,
  UserRole,
  HealthStatus
} from '@coels-crms/shared'
```

## Build

```bash
npm run build      # TypeScript compilation to dist/
npm run dev        # Watch mode during development
```

## Output

TypeScript files are compiled to:
- `dist/index.js` - Main entry point
- `dist/index.d.ts` - Type definitions
- `dist/**/*.d.ts` - Individual type files
