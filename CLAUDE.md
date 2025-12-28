# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Izly Clone is a web application that replicates the Izly student payment system interface. This is a **frontend-only** implementation with mock data - the backend and mobile directories are currently empty placeholders.

## Tech Stack

- **Framework**: React 18.3+ with Vite
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS with custom Izly color scheme
- **Icons**: Lucide React
- **Build Tool**: Vite 5.4+
- **Language**: JavaScript (JSX)

## Development Commands

```bash
# Install dependencies
cd frontend-web
npm install

# Start development server (default: http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Project Structure

```
izly-project/
├── frontend-web/           # Main React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── Layout.jsx          # App layout with sidebar & mobile nav
│   │   │   ├── MoneyCircle.jsx     # Balance display circle
│   │   │   ├── AmountSelector.jsx  # Recharge amount selector
│   │   │   └── UserDropdown.jsx    # User menu dropdown
│   │   ├── pages/          # Route-level components
│   │   │   ├── Dashboard.jsx       # Main dashboard view
│   │   │   ├── Login.jsx           # Login page
│   │   │   ├── Payment.jsx         # QR code payment view
│   │   │   ├── RechargeIndex.jsx   # Recharge options
│   │   │   ├── Recharge.jsx        # Card recharge flow
│   │   │   └── Profile.jsx         # User profile
│   │   ├── services/       # API and data layer
│   │   │   └── api.mock.js         # Mock API with in-memory state
│   │   ├── App.jsx         # Root component with routing
│   │   ├── main.jsx        # React entry point
│   │   └── index.css       # Global styles and Tailwind imports
│   ├── public/             # Static assets (logos, icons, images)
│   ├── index.html          # HTML entry point
│   ├── vite.config.js      # Vite configuration
│   ├── tailwind.config.js  # Tailwind theme customization
│   └── package.json
├── backend/                # Empty (placeholder for future API)
└── frontend-mobile/        # Empty (placeholder for future mobile app)
```

## Architecture Patterns

### Mock API Layer

All data operations go through `src/services/api.mock.js`, which simulates backend behavior:

- **Mock State**: In-memory state management for balance and transactions
- **Simulated Latency**: 500ms delay on all operations to mimic real API calls
- **API Structure**: Organized by domain (auth, wallet, transactions, payment)
- **Authentication**: Demo credentials are `email: "demo"`, `password: "demo"`

To connect a real backend later, replace api.mock.js with actual API calls without changing component code.

### Layout System

The app uses a unified `Layout.jsx` component that provides:

- **Desktop**: Fixed left sidebar (96px width) with navigation
- **Mobile**: Bottom tab bar navigation (64px height)
- **Responsive**: Tailwind breakpoint at `md:` (768px)

All pages except Login wrap their content in `<Layout>`.

### Routing

Routes are defined in `App.jsx`:
- `/` → Redirects to `/login`
- `/login` → Login page (no layout)
- `/dashboard` → Main dashboard
- `/recharge` → Recharge options selector
- `/recharge/card` → Card recharge flow
- `/payment` → QR code payment
- `/profile` → User profile

### Custom Tailwind Theme

Custom colors defined in `tailwind.config.js`:

```javascript
colors: {
  izly: {
    cyan: '#00B2E5',       // Primary accent
    black: '#1D1D1B',      // Sidebar/dark sections
    red: '#E20031',        // Alerts/errors
    green: '#8DC63F',      // Success states
    bg: '#F5F7FA',         // Page background
    'blue-main': '#00C4F0', // Main blue background
    'dark-counter': '#1D1D1B', // Dark sections
    'text-blue': '#00B2E5'  // Text accent
  }
}
```

Use `clsx` or `tailwind-merge` for conditional class composition.

### State Management

Currently uses React's built-in state (`useState`, `useEffect`) - no external state library. Mock state is maintained in api.mock.js for persistence across operations.

## Mobile-First Responsive Design

This project is designed as a **Progressive Web App (PWA)** optimized for mobile devices. The app should look and function identically to the native Izly app when viewed on a smartphone browser or installed as a web app (e.g., via AltStore).

### Key Mobile Optimizations

- **Mobile viewport**: The app is optimized for mobile-first with `md:` breakpoint at 768px
- **Bottom navigation**: Fixed tab bar on mobile (64px height), side navigation on desktop
- **Touch-friendly**: All interactive elements sized appropriately for touch
- **Decorative elements**: Mobile includes circular patterns and paper plane icon on dashboard
- **Collapsible sections**: "Vos avantages" and transactions sections are collapsed by default on mobile

### Testing on Mobile

```bash
# Start dev server
npm run dev

# Access from phone on same network
# http://<your-local-ip>:5173
```

For production testing as PWA, build and preview:
```bash
npm run build
npm run preview
```

## Common Development Patterns

### Adding a New Page

1. Create component in `src/pages/NewPage.jsx`
2. Import and wrap with `<Layout>` if needed
3. Add route in `src/App.jsx`
4. Add navigation link in `src/components/Layout.jsx` if needed

### Working with Mock API

```javascript
import { api } from '../services/api.mock';

// Fetch balance
const { balance } = await api.wallet.getBalance();

// Top up wallet
await api.wallet.topup(20.00);

// Get transaction history
const transactions = await api.transactions.getHistory();

// Login
const { token, user } = await api.auth.login("demo", "demo");
```

### Responsive Design

Follow the mobile-first approach already established:
- Base styles for mobile
- Use `md:` prefix for desktop overrides (≥768px)
- Test both mobile and desktop layouts
- Mobile nav is bottom tab bar; desktop nav is left sidebar

## Important Notes

- **No Backend**: All data is mocked. The backend directory is empty.
- **No Authentication Persistence**: Login state is not persisted (no localStorage/sessionStorage yet)
- **Static Assets**: Logo and icon paths in components assume files exist in `/public/`
- **French UI**: All user-facing text is in French
- **No Tests**: No test setup currently exists

## Future Integration Points

When connecting to a real backend:

1. Replace `api.mock.js` with actual HTTP client (axios/fetch)
2. Add environment variables for API endpoints
3. Implement proper authentication token handling
4. Add error handling and loading states
5. Consider adding state management (Redux/Zustand) if complexity grows
