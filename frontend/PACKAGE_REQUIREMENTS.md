# Frontend Package Requirements

## Package Installation Commands

### 1. Initialize React Project with Vite

```bash
npm create vite@latest . -- --template react-ts
```

### 2. Core Dependencies

```bash
npm install react@^18.2.0 react-dom@^18.2.0
npm install react-router-dom@^6.8.0
npm install typescript@^4.9.0
```

### 3. State Management & Data Fetching

```bash
npm install zustand@^4.3.0
npm install @tanstack/react-query@^4.24.0
npm install axios@^1.3.0
```

### 4. UI Framework & Styling

```bash
npm install tailwindcss@^3.2.0 autoprefixer@^10.4.0 postcss@^8.4.0
npm install @headlessui/react@^1.7.0
npm install @heroicons/react@^2.0.0
npm install clsx@^1.2.0
npm install tailwind-merge@^1.10.0
```

### 5. Forms & Validation

```bash
npm install react-hook-form@^7.43.0
npm install @hookform/resolvers@^2.9.0
npm install zod@^3.20.0
```

### 6. Notifications & UI Feedback

```bash
npm install react-hot-toast@^2.4.0
npm install framer-motion@^10.0.0
```

### 7. Charts & Data Visualization

```bash
npm install chart.js@^4.2.0
npm install react-chartjs-2@^5.2.0
npm install @tanstack/react-table@^8.7.0
```

### 8. File Handling & Media

```bash
npm install react-dropzone@^14.2.0
npm install react-image-crop@^10.1.0
```

### 9. Payment Integration

```bash
npm install react-paystack@^3.0.0
```

### 10. Date & Time

```bash
npm install date-fns@^2.29.0
npm install react-datepicker@^4.10.0
```

### 11. Utilities

```bash
npm install lodash@^4.17.0
npm install @types/lodash@^4.14.0
npm install uuid@^9.0.0
npm install @types/uuid@^9.0.0
```

### 12. Development Dependencies

```bash
npm install -D @types/react@^18.0.0
npm install -D @types/react-dom@^18.0.0
npm install -D @vitejs/plugin-react@^3.1.0
npm install -D vite@^4.1.0
npm install -D eslint@^8.35.0
npm install -D @typescript-eslint/eslint-plugin@^5.54.0
npm install -D @typescript-eslint/parser@^5.54.0
npm install -D eslint-plugin-react@^7.32.0
npm install -D eslint-plugin-react-hooks@^4.6.0
npm install -D eslint-plugin-react-refresh@^0.3.0
npm install -D prettier@^2.8.0
npm install -D eslint-config-prettier@^8.6.0
npm install -D eslint-plugin-prettier@^4.2.0
npm install -D husky@^8.0.0
npm install -D lint-staged@^13.1.0
```

### 13. Testing (Optional)

```bash
npm install -D vitest@^0.28.0
npm install -D @testing-library/react@^14.0.0
npm install -D @testing-library/jest-dom@^5.16.0
npm install -D @testing-library/user-event@^14.4.0
npm install -D jsdom@^21.1.0
```

## Complete package.json Template

```json
{
  "name": "ledgrio-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "preview": "vite preview",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "type-check": "tsc --noEmit",
    "prepare": "husky install"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "zustand": "^4.3.0",
    "@tanstack/react-query": "^4.24.0",
    "axios": "^1.3.0",
    "@headlessui/react": "^1.7.0",
    "@heroicons/react": "^2.0.0",
    "clsx": "^1.2.0",
    "tailwind-merge": "^1.10.0",
    "react-hook-form": "^7.43.0",
    "@hookform/resolvers": "^2.9.0",
    "zod": "^3.20.0",
    "react-hot-toast": "^2.4.0",
    "framer-motion": "^10.0.0",
    "chart.js": "^4.2.0",
    "react-chartjs-2": "^5.2.0",
    "@tanstack/react-table": "^8.7.0",
    "react-dropzone": "^14.2.0",
    "react-image-crop": "^10.1.0",
    "react-paystack": "^3.0.0",
    "date-fns": "^2.29.0",
    "react-datepicker": "^4.10.0",
    "lodash": "^4.17.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@types/lodash": "^4.14.0",
    "@types/uuid": "^9.0.0",
    "@vitejs/plugin-react": "^3.1.0",
    "vite": "^4.1.0",
    "typescript": "^4.9.0",
    "tailwindcss": "^3.2.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "eslint": "^8.35.0",
    "@typescript-eslint/eslint-plugin": "^5.54.0",
    "@typescript-eslint/parser": "^5.54.0",
    "eslint-plugin-react": "^7.32.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.3.0",
    "prettier": "^2.8.0",
    "eslint-config-prettier": "^8.6.0",
    "eslint-plugin-prettier": "^4.2.0",
    "husky": "^8.0.0",
    "lint-staged": "^13.1.0",
    "vitest": "^0.28.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^5.16.0",
    "@testing-library/user-event": "^14.4.0",
    "jsdom": "^21.1.0"
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{json,css,md}": ["prettier --write"]
  }
}
```

## Configuration Files

### tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        secondary: {
          50: '#f8fafc',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};
```

### vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/store': path.resolve(__dirname, './src/store'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/pages/*": ["./src/pages/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/services/*": ["./src/services/*"],
      "@/store/*": ["./src/store/*"],
      "@/types/*": ["./src/types/*"],
      "@/utils/*": ["./src/utils/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### .eslintrc.cjs

```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'prettier',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', '@typescript-eslint'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-unused-vars': 'error',
    'react/prop-types': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
```

This comprehensive package requirements document provides everything needed to set up the Smart-S frontend project with all necessary dependencies and configurations.
