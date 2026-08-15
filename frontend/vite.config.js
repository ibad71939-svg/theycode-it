import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Split third-party deps into their own vendor chunk, separate from
        // app code and from the per-page chunks created by the lazy()
        // imports in App.jsx. Vendor code changes far less often than app
        // code, so this also lets browsers cache it across deploys.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (/react-router-dom|react-dom|\/react\//.test(id)) return 'vendor';
          }
        },
      },
    },
  },
})
