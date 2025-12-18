import react from '@vitejs/plugin-react';
import path from 'path';
import { readFileSync } from 'fs';
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';
import { compression } from 'vite-plugin-compression2';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { VitePWA } from 'vite-plugin-pwa';

const backendPort = process.env.BACKEND_PORT && Number(process.env.BACKEND_PORT) || 3080;
const backendURL = process.env.HOST ? `http://${process.env.HOST}:${backendPort}` : `http://localhost:${backendPort}`;

// Get peer dependencies from @librechat/client package
let clientPeerDeps: string[] = [];
try {
  const clientPkgPath = path.join(__dirname, '../packages/client/package.json');
  const clientPkg = JSON.parse(readFileSync(clientPkgPath, 'utf-8'));
  clientPeerDeps = Object.keys(clientPkg.peerDependencies || {});
} catch (e) {
  // fallback if import fails
}

export default defineConfig(({ command }) => ({
  base: '/',
  
  optimizeDeps: {
    exclude: ['@rhds/*'],
    esbuildOptions: {
      target: 'ES2022',
    },
  },
  
  esbuild: {
    target: 'ES2022',
  },
  
  server: {
    allowedHosts: process.env.VITE_ALLOWED_HOSTS && process.env.VITE_ALLOWED_HOSTS.split(',') || [],
    host: process.env.HOST || 'localhost',
    port: process.env.PORT && Number(process.env.PORT) || 3090,
    strictPort: false,
    proxy: {
      '/api': {
        target: backendURL,
        changeOrigin: true,
      },
      '/oauth': {
        target: backendURL,
        changeOrigin: true,
      },
    },
  },
  
  envDir: '../',
  envPrefix: ['VITE_', 'SCRIPT_', 'DOMAIN_', 'ALLOW_'],
  
  plugins: [
    react(),
    nodePolyfills(),
    VitePWA({
      injectRegister: 'auto',
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false,
      },
      useCredentials: true,
      includeManifestIcons: false,
      workbox: {
        globPatterns: [
          '**/*.{js,css,html}',
          'assets/favicon*.png',
          'assets/icon-*.png',
          'assets/apple-touch-icon*.png',
          'assets/maskable-icon.png',
          'manifest.webmanifest',
        ],
        globIgnores: ['images/**/*', '**/*.map', 'index.html'],
        maximumFileSizeToCacheInBytes: 13 * 1024 * 1024,
        navigateFallbackDenylist: [/^\/oauth/, /^\/api/],
      },
      includeAssets: [],
      manifest: {
        name: 'LibreChat',
        short_name: 'LibreChat',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#009688',
        icons: [
          {
            src: 'assets/favicon-32x32.png',
            sizes: '32x32',
            type: 'image/png',
          },
          {
            src: 'assets/favicon-16x16.png',
            sizes: '16x16',
            type: 'image/png',
          },
          {
            src: 'assets/apple-touch-icon-180x180.png',
            sizes: '180x180',
            type: 'image/png',
          },
          {
            src: 'assets/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'assets/maskable-icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
    sourcemapExclude({ excludeNodeModules: true }),
    compression({ threshold: 10240 }),
  ],
  
  publicDir: command === 'serve' ? './public' : false,
  
  build: {
    target: 'ES2022',
    sourcemap: process.env.NODE_ENV === 'development',
    outDir: './dist',
    minify: 'terser',
    copyPublicDir: true,
    
    rollupOptions: {
      external: [
        '@rhds/elements',
        '@rhds/icons',
        ...clientPeerDeps,
      ],
      
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.names?.[0]?.match(/\.(woff2?|eot|ttf|otf)$/)) {
            return 'assets/fonts/[name][extname]';
          }
          return 'assets/[name].[hash][extname]';
        },
      },
      
      onwarn(warning, warn) {
        if (
          warning.message.includes('Error when using sourcemap') ||
          warning.message.includes('"use client"')
        ) {
          return;
        }
        warn(warning);
      },
    },
    chunkSizeWarningLimit: 1500,
  },
  
  resolve: {
    alias: {
      '~': path.join(__dirname, 'src/'),
      '$fonts': path.resolve(__dirname, 'public/fonts'),
      'micromark-extension-math': 'micromark-extension-llm-math',
    },
  },
}));

interface SourcemapExclude {
  excludeNodeModules?: boolean;
}

function sourcemapExclude(opts?: { excludeNodeModules?: boolean }): Plugin {
  return {
    name: 'sourcemap-exclude',
    transform(code, id) {
      if (opts?.excludeNodeModules && id.includes('node_modules')) {
        return { code, map: { mappings: '' } };
      }
    },
  };
}
