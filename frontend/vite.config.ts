import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import type { ViteDevServer } from 'vite'

// Custom plugin to handle SPA routing
const spaFallbackPlugin = () => {
  return {
    name: 'spa-fallback',
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, _res, next) => {
        // Skip API routes and static assets
        if (req.url?.startsWith('/api') ||
            req.url?.includes('.') ||
            req.url?.startsWith('/@') ||
            req.url?.startsWith('/node_modules')) {
          return next();
        }

        // For all other routes, serve index.html
        req.url = '/';
        next();
      });
    },
  };
};

// https://vite.dev/config/
export default defineConfig(({ mode }) => {  // Load environment variables
  const backendUrl = process.env.VITE_BACKEND_URL ?? 'http://localhost:3000';
  
  return {
    plugins: [react(), spaFallbackPlugin()],
    define: {
      'import.meta.env.VITE_BACKEND_URL': JSON.stringify(backendUrl),
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@/components': fileURLToPath(new URL('./src/components', import.meta.url)),
        '@/pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
        '@/hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
        '@/services': fileURLToPath(new URL('./src/services', import.meta.url)),
        '@/store': fileURLToPath(new URL('./src/store', import.meta.url)),
        '@/types': fileURLToPath(new URL('./src/types', import.meta.url)),
        '@/utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
        '@/constants': fileURLToPath(new URL('./src/constants', import.meta.url)),
      },
    },
    server: {
      port: 3001,
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false
        }
      },
      headers: {
        'Content-Security-Policy': `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' ${backendUrl};`,
      },
    },
  build: {
    outDir: 'dist',
    sourcemap: mode === 'development',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@heroicons/react', 'react-hot-toast'],
          forms: ['react-hook-form', 'zod'],
          state: ['zustand'],
          utils: ['axios', 'date-fns'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },  preview: {
    port: 3001,
  },
  };
});
