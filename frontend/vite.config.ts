import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    // Gzip compression
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240, // Only compress files larger than 10KB
      deleteOriginFile: false,
    }),
    // Brotli compression
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
      deleteOriginFile: false,
    }),
    // Sentry source map upload (only in production builds)
    process.env.NODE_ENV === 'production' && process.env.SENTRY_AUTH_TOKEN
      ? sentryVitePlugin({
        org: 'solosuccess-ai',
        project: 'courses-with-lessons-main',
        authToken: process.env.SENTRY_AUTH_TOKEN,
        sourcemaps: {
          assets: './dist/**',
          ignore: ['node_modules'],
          rewriteSources: (source) => source.replace(/^\/@fs\//, ''),
        },
      })
      : null,
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - separate large dependencies
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'animation-vendor': ['framer-motion'],
          'utils-vendor': ['axios', 'date-fns'],

          // Feature-based chunks
          'course-pages': [
            './src/pages/CoursePage.tsx',
            './src/pages/LessonPage.tsx',
            './src/pages/FinalProjectPage.tsx',
            './src/pages/FinalExamPage.tsx',
          ],
          'community-pages': [
            './src/pages/ForumPage.tsx',
            './src/pages/ThreadDetailPage.tsx',
            './src/pages/CreateThreadPage.tsx',
            './src/pages/MemberDirectoryPage.tsx',
            './src/pages/MemberProfilePage.tsx',
            './src/pages/EventCalendarPage.tsx',
          ],
          'profile-pages': [
            './src/pages/ProfilePage.tsx',
            './src/pages/SettingsPage.tsx',
            './src/pages/CertificatePage.tsx',
          ],
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable source maps for production debugging (required for Sentry)
    sourcemap: true,
    // Minify with terser for better compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
