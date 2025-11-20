import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  build: {
    // Output directory
    outDir: 'dist',
    
    // Disable source maps in production for security and smaller bundle
    sourcemap: false,
    
    // Use terser for better minification
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console.logs in production
        drop_console: true,
        drop_debugger: true,
        // Remove unused code
        pure_funcs: ['console.log', 'console.info'],
      },
      format: {
        // Remove comments
        comments: false,
      },
    },
    
    // Rollup options for code splitting
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          // Separate vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'ui-vendor': ['motion/react', 'lucide-react', 'sonner'],
        },
        // Asset file naming
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
    
    // Chunk size warning limit (in KB)
    chunkSizeWarningLimit: 1000,
    
    // Target modern browsers for smaller bundle
    target: 'es2020',
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@supabase/supabase-js',
      'motion/react',
      'lucide-react',
    ],
  },
  
  // Server options for development
  server: {
    port: 3000,
    open: true,
  },
  
  // Preview server options
  preview: {
    port: 4173,
    open: true,
  },
})
