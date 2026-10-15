import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // three.js alone is ~725 kB minified and doesn't split further
    chunkSizeWarningLimit: 800,
    rolldownOptions: {
      output: {
        // split the heavy, rarely-changing libraries into their own cacheable chunks
        codeSplitting: {
          groups: [
            { name: 'three', test: /node_modules[/\\]three[/\\]/, priority: 50 },
            {
              name: 'postprocessing',
              test: /node_modules[/\\](postprocessing|@react-three[/\\]postprocessing)[/\\]/,
              priority: 40,
            },
            { name: 'r3f', test: /node_modules[/\\]@react-three[/\\]/, priority: 30 },
            { name: 'astronomy', test: /node_modules[/\\]astronomy-engine[/\\]/, priority: 30 },
            { name: 'motion', test: /node_modules[/\\](framer-motion|motion-dom|motion-utils)[/\\]/, priority: 30 },
            { name: 'react', test: /node_modules[/\\](react|react-dom|scheduler|zustand)[/\\]/, priority: 20 },
          ],
        },
      },
    },
  },
})
