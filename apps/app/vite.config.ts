import devServer, { defaultOptions } from '@hono/vite-dev-server';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import tsconfigPaths from 'vite-tsconfig-paths';
import { API_PREFIXES, buildDevServerExcludeRegex, toPathPrefixRegex } from './src/backend/route-config';

const MARKETING_NAVIGATION_PREFIXES = [
  '/pricing',
  '/about',
  '/customers',
  '/changelog',
  '/blog',
  '/docs',
  '/favicon-api',
  '/legal',
];

export default defineConfig(({ command, mode }) => {
  // Load env from parent directory for local development
  // Shell variables must win here because run.sh configures the single-origin
  // localhost build without requiring a checked-in .env file.
  const env = { ...loadEnv(mode, '../../', ''), ...process.env };
  Object.assign(process.env, env);
  return {
    envDir: '../../',
    define: {
      'import.meta.env.INSIGHT_TOKEN': JSON.stringify(env.INSIGHT_TOKEN || env.VEMETRIC_TOKEN),
      'import.meta.env.VEMETRIC_TOKEN': JSON.stringify(env.VEMETRIC_TOKEN),
      'import.meta.env.VITE_INSIGHT_SITE_URL': JSON.stringify(
        env.VITE_INSIGHT_SITE_URL || env.INSIGHT_SITE_URL || env.VEMETRIC_SITE_URL,
      ),
      'import.meta.env.VITE_INSIGHT_APP_URL': JSON.stringify(
        env.VITE_INSIGHT_APP_URL || env.INSIGHT_APP_URL || env.VEMETRIC_APP_URL,
      ),
      'import.meta.env.VITE_INSIGHT_HUB_URL': JSON.stringify(
        env.VITE_INSIGHT_HUB_URL || env.INSIGHT_HUB_URL || env.VEMETRIC_HUB_URL,
      ),
      'import.meta.env.VITE_INSIGHT_SINGLE_ORIGIN': JSON.stringify(
        env.VITE_INSIGHT_SINGLE_ORIGIN || env.INSIGHT_SINGLE_ORIGIN,
      ),
      'import.meta.env.VITE_INSIGHT_FAVICON_API_URL': JSON.stringify(
        env.VITE_INSIGHT_FAVICON_API_URL || env.INSIGHT_FAVICON_API_URL || env.VEMETRIC_FAVICON_API_URL,
      ),
      'import.meta.env.VITE_INSIGHT_TOPO_URL': JSON.stringify(
        env.VITE_INSIGHT_TOPO_URL || env.INSIGHT_TOPO_URL || env.VEMETRIC_TOPO_URL,
      ),
    },
    plugins: [
      command === 'serve' &&
        devServer({
          entry: 'src/backend/vite.ts',
          exclude: [buildDevServerExcludeRegex(), ...defaultOptions.exclude],
        }),
      tsconfigPaths(),
      TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
      react(),
      VitePWA({
        injectRegister: false, // Manual registration in main.tsx (mobile only)
        registerType: 'autoUpdate',
        includeAssets: ['favicon-196.png', 'apple-touch-icon-180x180.png', 'logo.svg', 'favicon.ico'],
        manifest: {
          name: 'Insight.info',
          short_name: 'Insight',
          description: 'Privacy-conscious web and product analytics for clear, actionable insight.',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/app',
          icons: [
            {
              src: 'pwa-64x64.png',
              sizes: '64x64',
              type: 'image/png',
            },
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          navigateFallbackDenylist: [
            ...API_PREFIXES.map((prefix) => toPathPrefixRegex(prefix)),
            /^\/$/,
            ...MARKETING_NAVIGATION_PREFIXES.map((prefix) => toPathPrefixRegex(prefix)),
          ],
          runtimeCaching: [
            {
              urlPattern: ({ request, url }) => request.mode === 'navigate' || url.pathname === '/index.html',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'html',
                networkTimeoutSeconds: 5,
              },
            },
          ],
        },
      }),
    ],
    server: {
      allowedHosts: ['insight.local', 'insight.localhost', 'app.insight.local', 'app.insight.localhost'],
      port: 4000,
      hmr:
        (env.INSIGHT_DEV_PROXY_DISABLED || env.VEMETRIC_DEV_PROXY_DISABLED) === 'true'
          ? undefined
          : {
              port: 4000,
            },
    },
  };
});
