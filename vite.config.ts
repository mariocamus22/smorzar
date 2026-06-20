import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Configuración de Vite: React + PWA (service worker Workbox + manifest estático en public/)
// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // El manifest lo servimos como archivo estático (public/manifest.json)
      // para tener control total sobre él sin regenerarlo en cada build.
      manifest: false,
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 16, maxAgeSeconds: 86400 },
            },
          },
        ],
      },
    }),
  ],
  // Permite abrir la app desde el móvil en la misma WiFi (http://TU_IP:5173)
  server: { host: true },
})
