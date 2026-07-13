import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Vite plugin to stub missing wp-content js files to avoid 404 console errors
const stubMissingWpAssets = () => {
  return {
    name: 'stub-missing-wp-assets',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next();
        const urlWithoutQuery = req.url.split('?')[0];

        // Stub Admin Ajax for Complianz to prevent JSON parse errors
        if (urlWithoutQuery === '/wp-admin/admin-ajax.php') {
          res.setHeader('Content-Type', 'application/json');
          res.end('{}');
          return;
        }

        if (urlWithoutQuery.startsWith('/assets/') && urlWithoutQuery.endsWith('.js')) {
          // Check if file exists locally
          const filePath = path.join(__dirname, 'public', urlWithoutQuery)
          if (!fs.existsSync(filePath)) {
            // File is missing (probably not downloaded by HTTrack). Send dummy JS to prevent ChunkLoadError
            res.setHeader('Content-Type', 'application/javascript')
            res.end('/* Dummy script to prevent 404 errors for chunks missed by HTTrack */\nif (typeof window.webpackJsonp !== "undefined") { window.webpackJsonp([], {}); }')
            return
          }
        }
        next()
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), stubMissingWpAssets()],
})
