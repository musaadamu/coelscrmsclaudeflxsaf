# COELS CRMS Frontend

## Overview

React 18 + Vite + TypeScript frontend for the College of Education Records Management System. Responsive, accessible, and performant web application with progressive web app (PWA) capabilities.

## Project Structure

```
src/
├── main.tsx              # Vite entry point
├── App.tsx               # Root component with routing
├── globals.css           # Global styles
├── layouts/
│   ├── PublicLayout.tsx      # For login/register pages
│   ├── StudentLayout.tsx     # Student dashboard
│   ├── StaffLayout.tsx       # Staff (lecturer/HOD)
│   └── AdminLayout.tsx       # Administrator
├── pages/                # Route page components
│   ├── dashboard/
│   ├── students/
│   ├── courses/
│   ├── results/
│   └── ...
├── components/
│   ├── ProtectedRoute.tsx    # Auth wrapper
│   ├── Sidebar.tsx           # Navigation
│   ├── DataTable.tsx
│   ├── Modal.tsx
│   ├── FileUpload.tsx
│   └── ...
├── hooks/
│   ├── useAuth.ts           # Auth context
│   ├── usePermission.ts     # Role checking
│   └── useOffline.ts        # Offline mode
├── services/
│   ├── api.ts               # Axios instance with interceptors
│   └── *.service.ts         # API service modules
├── stores/
│   └── index.ts             # Zustand stores
└── workers/
    └── service-worker.ts    # PWA service worker
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
# Start Vite dev server (hot reload on port 5173)
npm run dev

# In another terminal, you can run backend
npm run dev --workspace=backend
```

Access at: http://localhost:5173

### Build for Production

```bash
# Build TypeScript & bundle
npm run build

# Preview production build locally
npm run preview
```

### Linting & Type Checking

```bash
# Check code style
npm run lint

# Type checking
npx tsc --noEmit

# Both
npm run build
```

## Features

### User Authentication
- Email/password login & registration
- Password reset flow
- JWT token management with auto-refresh
- Optional TOTP 2FA support
- Role-based access control (RBAC)

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Responsive sidebar/navigation
- Adaptive layouts by user role

### State Management
- **Zustand** for auth state
- **TanStack Query** for server state & caching
- **React Router** for client-side routing

### API Integration
- Axios with interceptors
- Automatic token refresh on 401
- Error handling & retry logic
- Request/response transforms

### Offline Support
- Service Worker for PWA
- Workbox for asset caching
- Offline-aware state

### Data Display
- **Recharts** for analytics
- **DataTable** with sorting & pagination
- **Excel export** capability

### Form Handling
- **React Hook Form** for forms
- **Zod** schema validation
- Real-time error messages

## Environment Variables

Create `.env` or `.env.local`:

```
VITE_API_URL=http://localhost:4000/api
VITE_APP_NAME=COELS CRMS
VITE_APP_VERSION=1.0.0
```

Frontend Vite variables must start with `VITE_` to be exposed to the browser.

## API Services

### useAuth Hook

```typescript
const { user, loading, error, logout } = useAuth()
```

### usePermission Hook

```typescript
const hasStudentRole = usePermission('student')
const canAccess = usePermission(['hod', 'registrar'])
```

### Axios Instance

```typescript
import api from '@/services/api'

// Automatically includes Bearer token
const { data } = await api.get('/students')

// Automatic refresh on 401
// Automatic retry with exponential backoff
```

### Service Modules

```typescript
import { authService, studentService, paymentService } from '@/services/student.service'

// Login
const { data: tokens } = await authService.login(email, password)

// Get students
const { data: students } = await studentService.getStudents(page, limit)

// Validate scratch card
const { data: payment } = await paymentService.validateScratchCard(serial, pin)
```

## Styling

- **Tailwind CSS** for utility classes
- **Custom CSS** in `globals.css`
- Dark mode support via theme switching
- Component library: **shadcn/ui**

## Performance

- Code splitting by route
- Lazy loading of components
- Image optimization
- CSS/JS minification in production
- Service Worker caching
- Query result caching with React Query

## Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test -- --watch

# Coverage
npm run test -- --coverage
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## PWA Features

- **Installable** - Add to home screen
- **Offline Mode** - Work without internet
- **Fast Loading** - Cached assets
- **App-like** - Full screen, no URL bar

## Accessibility

- ARIA labels on interactive elements
- Keyboard navigation support
- High contrast ratios
- Semantic HTML

## Troubleshooting

### API requests fail with 401
- Check if token is expired
- Clear localStorage: `localStorage.clear()`
- Re-login
- Check browser console for error details

### Styles not applying
- Clear browser cache: Ctrl+Shift+Delete
- Hard refresh: Ctrl+Shift+R
- Check Tailwind build in `tailwind.config.js`

### Hot reload not working
- Ensure Vite dev server is running
- Check browser console for errors
- Restart dev server: Kill process and run `npm run dev` again

### Build fails with TypeScript errors
- Run `npx tsc --noEmit` to see all errors
- Check `tsconfig.json` paths
- Ensure all imports are correct

## Deployment

### Static Hosting (Vercel, Netlify)

```bash
npm run build
# Deploy the `dist` folder
```

### Docker

```bash
# Build image
docker build -f Dockerfile -t coels-crms-frontend:latest .

# Run
docker run -p 5173:5173 coels-crms-frontend:latest
```

### Environment Variables in Production

Set `VITE_API_URL` to your production backend URL during build.

## Contributing

- Use TypeScript for type safety
- Follow ESLint rules: `npm run lint`
- Component files: one component per file
- Custom hooks in `hooks/` directory
- API calls through service layer
- Test coverage for components

## Resources

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [TanStack Query](https://tanstack.com/query)
- [Zustand](https://github.com/pmndrs/zustand)

## Support

For issues or questions, contact the development team.

---

**Last Updated:** June 2024  
**Version:** 1.0.0
