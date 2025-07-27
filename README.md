# [@mk-singh/utils](https://www.npmjs.com/package/@mk-singh/utils)

## Why This Library?

When building React applications, you often need to:

- Manage complex nested routes
- Handle multi-step forms with navigation
- Avoid hardcoding paths throughout your app
- Maintain consistent navigation patterns
- Build breadcrumbs and back buttons

This library solves these problems by providing a declarative way to define your route structure once and generate all the paths automatically.

## Compatibility

- ✅ **React.js** (Perfect for SPA routing)
- ✅ **Vue.js** (Works with Vue Router)
- ✅ **Next.js** (App Router & Pages Router)
- ✅ **Vanilla JavaScript** (Framework agnostic)
- ✅ **TypeScript** (Full type support)
- ✅ **Any JavaScript bundler** (Webpack, Vite, Rollup, etc.)# @mk-singh/utils

A collection of JavaScript utility functions designed for modern web development, with special focus on React.js applications. Modular and tree-shakeable for optimal bundle sizes.

## Installation

```javascript
import { createRoutes } from "@mk-singh/utils";
```

## Modular Imports

Import only what you need to keep your bundle size small:

```javascript
// Import specific utilities
import { createRoutes } from "@mk-singh/utils/route-factory";
```

## Features

### Route Factory

Create nested route structures with automatic path resolution and navigation helpers.

#### `createRoutes(basePath, routeConfig)`

Transforms a route configuration object into a fully resolved route structure with absolute paths.

**Parameters:**

- `basePath` (string): The base path to prepend to all routes
- `routeConfig` (object): Route configuration with relative paths and navigation data

**Returns:** Object with resolved absolute paths and preserved navigation data

#### React.js Example

```tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { createRoutes } from "@mk-singh/utils/route-factory";

// Define your route configuration
const routeConfig = {
    dashboard: { path: "dashboard" },
    user: {
        path: "user",
        profile: {
            path: "profile",
            step: 1,
            prevPath: "../dashboard",
        },
        settings: {
            path: "settings", 
            step: 2,
            prevPath: "./profile",
        },
    },
    admin: {
        path: "admin",
        step: 3,
        prevPath: "./user/settings",
    },
} as const;

// Generate routes with base path
const routes = createRoutes("/app", routeConfig);

function App() {
    return (
        <BrowserRouter>
            <nav>
                <Link to={routes.dashboard.path}>Dashboard</Link>
                <Link to={routes.user.profile.path}>Profile</Link>
                <Link to={routes.user.settings.path}>Settings</Link>
                <Link to={routes.admin.path}>Admin</Link>
            </nav>
            
            <Routes>
                <Route path={routes.dashboard.path} element={<Dashboard />} />
                <Route path={routes.user.profile.path} element={<Profile />} />
                <Route path={routes.user.settings.path} element={<Settings />} />
                <Route path={routes.admin.path} element={<Admin />} />
            </Routes>
        </BrowserRouter>
    );
}

// Use in components for navigation
function Settings() {
    const handleBack = () => {
        navigate(routes.user.settings.prevPath); // Goes to /app/user/profile
    };
    
    return (
        <div>
            <button onClick={handleBack}>← Back</button>
            <h1>Settings (Step {routes.user.settings.step})</h1>
        </div>
    );
}
```

#### Basic Example

```javascript
import { createRoutes } from "@mk-singh/utils/route-factory";

const routeConfig = {
    start: { path: "start" },
    onboarding: {
        path: "onboarding",
        basicDetails: {
            path: "basic-details",
            step: 1,
            prevPath: "../start",
        },
        businessDetails: {
            path: "business-details",
            step: 2,
            prevPath: "./basicDetails",
        },
    },
    review: {
        path: "review",
        step: 3,
        prevPath: "./onboarding/businessDetails",
    },
} as const;

const routes = createRoutes("/client", routeConfig);

console.log(routes);
// Output:
// {
//     start: { path: "/client/start" },
//     onboarding: {
//         path: "/client/onboarding",
//         basicDetails: {
//             path: "/client/onboarding/basic-details",
//             step: 1,
//             prevPath: "/client/start",
//         },
//         businessDetails: {
//             path: "/client/onboarding/business-details",
//             step: 2,
//             prevPath: "/client/onboarding/basic-details",
//         },
//     },
//     review: {
//         path: "/client/review",
//         step: 3,
//         prevPath: "/client/onboarding/business-details",
//     },
// }
```

#### Path Resolution Rules

The `createRoutes` function intelligently resolves different types of paths in `prevPath`:

- **Relative paths with `../`**: Navigate up one level
  - `../start` from `/client/onboarding/basic-details` → `/client/start`

- **Current directory paths with `./`**: Reference sibling routes
  - `./basicDetails` from `/client/onboarding/business-details` → `/client/onboarding/basic-details`

- **Nested paths**: Navigate to nested routes
  - `./onboarding/businessDetails` from `/client/review` → `/client/onboarding/business-details`

#### Use Cases

Perfect for:

- **React.js Single Page Applications** with complex routing
- **Multi-step forms and wizards** in React components
- **Navigation breadcrumbs** with automatic path resolution
- **Dynamic route generation** for React Router
- **Type-safe route management** in TypeScript React apps
- **Centralized route configuration** to avoid hardcoded paths
- **Back/Next navigation** in form workflows

## API Reference

### Route Factory

```typescript
createRoutes(basePath: string, routeConfig: RouteConfig): ResolvedRoutes
```

## Development

```bash
# Run tests
npm test

# Format code
npm run format
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
