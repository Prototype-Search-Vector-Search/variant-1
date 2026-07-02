import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

export default defineConfig({
  // Pages serves project sites at /<repo-name>/. The deploy workflow sets
  // VITE_BASE from the repo name so each variant builds with correct asset
  // URLs without any committed difference.
  base: process.env.VITE_BASE ?? '/claude-code-search-nodes/',
  plugins: [react(), nodePolyfills()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      react: path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
    },
  },
})
