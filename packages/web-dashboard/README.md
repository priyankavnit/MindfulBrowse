# Web Dashboard

React web dashboard for viewing digital wellbeing insights and managing privacy settings.

## Tech Stack

- **React 18+** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Material-UI** - Component library
- **Chart.js** - Data visualization
- **AWS Amplify** - Authentication and API integration

## Development

```bash
# Install dependencies (from root)
npm install

# Start development server
npm run dev --workspace=packages/web-dashboard

# Build for production
npm run build --workspace=packages/web-dashboard

# Preview production build
npm run preview --workspace=packages/web-dashboard

# Lint code
npm run lint --workspace=packages/web-dashboard
```

## Project Structure

```
src/
├── main.tsx           # Application entry point
├── App.tsx            # Root component with routing
├── index.css          # Global styles
├── components/        # Reusable UI components
├── pages/             # Page components
├── contexts/          # React contexts (auth, etc.)
├── hooks/             # Custom React hooks
├── services/          # API clients and services
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## Build Output

The build process outputs static files to the `dist/` directory, optimized for deployment to Amazon S3 with CloudFront CDN.

Build configuration:
- Output directory: `dist/`
- Source maps enabled for debugging
- Code splitting for vendor libraries (React, Chart.js, MUI)
- Optimized for production with minification

## Deployment

The dashboard is deployed as a static site to Amazon S3 and served through CloudFront CDN. See the infrastructure package for deployment configuration.
