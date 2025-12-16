import react from '@vitejs/plugin-react';
// @ts-ignore
import path from 'path';
import fs from 'fs';
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';
import { compression } from 'vite-plugin-compression2';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
const backendPort = process.env.BACKEND_PORT && Number(process.env.BACKEND_PORT) || 3080;
const backendURL = process.env.HOST ? `http://${process.env.HOST}:${backendPort}` : `http://localhost:${backendPort}`;

export default defineConfig(({ command }) => ({
  base: '',
  optimizeDeps: {
    exclude: [
      // Exclude @rhds/icons from dependency optimization - it uses top-level await
      // and is loaded from CDN via import map
      '@rhds/icons',
      // Also exclude @rhds/elements since it may import @rhds/icons transitively
      '@rhds/elements',
    ],
    esbuildOptions: {
      target: 'es2022', // Support top-level await
      // Explicitly exclude @rhds/icons from esbuild processing
      external: ['@rhds/icons'],
      // Ignore @rhds/icons during dependency scanning
      plugins: [
        {
          name: 'ignore-rhds-icons',
          setup(build) {
            // Mark @rhds/icons as external to prevent processing
            build.onResolve({ filter: /@rhds\/icons/ }, (args) => {
              return { path: args.path, external: true };
            });
            // Also handle node_modules paths
            build.onResolve({ filter: /.*\/node_modules\/@rhds\/icons\/.*/ }, (args) => {
              return { path: args.path, external: true };
            });
          },
        },
      ],
    },
  },
  server: {
    allowedHosts: process.env.VITE_ALLOWED_HOSTS && process.env.VITE_ALLOWED_HOSTS.split(',') || [],
    host: process.env.HOST || '0.0.0.0',
    port: process.env.PORT && Number(process.env.PORT) || 8080,
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
  preview: {
    host: process.env.HOST || '0.0.0.0',
    port: process.env.PORT && Number(process.env.PORT) || 4173,
    strictPort: false,
    // Ensure all static files are served correctly in preview mode
    cors: true,
    // Proxy API calls in preview mode
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
    // Ensure all files in dist are served, including subdirectories
    fs: {
      // Allow serving files from dist and its subdirectories
      allow: ['..'],
      strict: false,
    },
  },
  // Set the directory where environment variables are loaded from and restrict prefixes
  envDir: '../',
  envPrefix: ['VITE_', 'SCRIPT_', 'DOMAIN_', 'ALLOW_'],
  plugins: [
    react(),
    nodePolyfills(),
    // Plugin to exclude @rhds/icons from esbuild processing
    {
      name: 'exclude-rhds-icons',
      enforce: 'pre',
      resolveId(id, importer) {
        // Exclude @rhds/icons from being processed
        if (id === '@rhds/icons' || id.startsWith('@rhds/icons/')) {
          return { id, external: true };
        }
        // Also handle node_modules path resolution
        if (id.includes('@rhds/icons') && importer?.includes('node_modules')) {
          return { id, external: true };
        }
        return null;
      },
      load(id) {
        // Prevent loading @rhds/icons files
        if (id.includes('@rhds/icons') && id.includes('node_modules')) {
          return { code: 'export {};', map: null };
        }
        return null;
      },
    },
    VitePWA({
      injectRegister: 'auto', // 'auto' | 'manual' | 'disabled'
      registerType: 'autoUpdate', // 'prompt' | 'autoUpdate'
      devOptions: {
        enabled: false, // disable service worker registration in development mode
      },
      // Disable PWA in preview mode to avoid service worker caching issues
      // In preview mode, we want to serve files directly without service worker
      disable: process.env.VITE_PREVIEW === 'true' || command === 'serve',
      useCredentials: true,
      includeManifestIcons: false,
      workbox: {
        globDirectory: './dist', // Only scan the dist directory
        globPatterns: [
          '**/*.{js,css,html}',
          'assets/**/*',
          'assets/@librechat/**/*',
          'assets/favicon*.png',
          'assets/icon-*.png',
          'assets/apple-touch-icon*.png',
        ],
        globIgnores: [
          'images/**/*',
          '**/*.map',
          // Don't ignore sw.js and workbox files - they might be needed
          // 'sw.js',
          // 'workbox-*.js',
        ],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: '/index.html',
        // Ensure index.html is precached for navigateFallback to work
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'jsdelivr-cdn',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
          {
            // Serve images directly from network, bypass service worker cache
            urlPattern: /\.(png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot)$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'static-images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              networkTimeoutSeconds: 3,
            },
          },
        ],
        navigateFallbackDenylist: [/^\/oauth/, /^\/api/, /\.(png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot)$/i],
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
    compression({
      threshold: 10240,
    }),
    // Plugin to exclude CodeMirror from minification
    {
      name: 'no-minify-codemirror',
      apply: 'build',
      enforce: 'post',
      generateBundle(options, bundle) {
        // Find CodeMirror chunks and mark them to skip minification
        for (const [fileName, chunk] of Object.entries(bundle)) {
          if (chunk.type === 'chunk' && (fileName.includes('codemirror') || chunk.name?.includes('codemirror'))) {
            // Mark chunk to skip minification by setting a flag
            (chunk as any).skipMinification = true;
          }
        }
      },
    },
    // Plugin to handle special cases in preview mode
    {
      name: 'preview-special-handlers',
      configurePreviewServer(server) {
        // This runs AFTER Vite's static file handler
        return () => {
          server.middlewares.use((req, res, next) => {
            // Handle @rhds/icons - redirect to CDN
            if (req.url === '/@rhds/icons' || req.url?.startsWith('/@rhds/icons/')) {
              res.writeHead(302, {
                'Location': 'https://cdn.jsdelivr.net/npm/@rhds/icons@2.0.0/icons.js'
              });
              return res.end();
            }
            
            // Provide registerSW.js
            if (req.url === '/registerSW.js') {
              res.writeHead(200, { 
                'Content-Type': 'application/javascript',
                'Cache-Control': 'no-cache'
              });
              return res.end('(function() { if (typeof window !== "undefined") { window.registerSW = function() {}; } })();');
            }
            
            // Let Vite preview handle all other requests
            next();
          });
        };
      },
    },
  ],
  publicDir: command === 'serve' ? './public' : false,
  build: {
    sourcemap: process.env.NODE_ENV === 'development',
    outDir: './dist',
    // Ensure all files are copied to dist
    copyPublicDir: false, // We handle this in post-build script
    // Use esbuild minification which handles CodeMirror better
    minify: 'esbuild',
    // Ensure all assets are included
    assetsInclude: ['**/*'],
    // esbuild options for better CodeMirror compatibility
    esbuild: {
      target: 'es2022',
      legalComments: 'none',
      minifyIdentifiers: true,
      minifySyntax: true,
      minifyWhitespace: true,
      // Keep function names to avoid CodeMirror issues
      keepNames: true,
    },
    commonjsOptions: {
      exclude: ['@rhds/icons'],
    },
      rollupOptions: {
        preserveEntrySignatures: 'strict',
        external: [
          // @librechat/client is externalized - it will be resolved via import map
          // The server handles /@ routes to allow import map resolution
          // /^@librechat\/client/,
          // @rhds/icons is externalized - it uses top-level await and is loaded from CDN via import map
          /^@rhds\/icons/,
        ],
        plugins: [
          // Plugin to prevent minification of CodeMirror chunks
          {
            name: 'no-minify-codemirror',
            renderChunk(code, chunk, options) {
              // Skip minification for CodeMirror chunks
              if (chunk.name && chunk.name.includes('codemirror')) {
                // Return the code as-is without minification
                return null; // Let Vite handle it, but we'll configure terser to skip it
              }
              return null;
            },
          },
        ],
      output: {
        manualChunks(id: string) {
          const normalizedId = id.replace(/\\/g, '/');
          if (normalizedId.includes('node_modules')) {
            // High-impact chunking for large libraries
            if (normalizedId.includes('@codesandbox/sandpack')) {
              return 'sandpack';
            }
            if (normalizedId.includes('react-virtualized')) {
              return 'virtualization';
            }
            if (normalizedId.includes('i18next') || normalizedId.includes('react-i18next')) {
              return 'i18n';
            }
            if (normalizedId.includes('lodash')) {
              return 'utilities';
            }
            if (normalizedId.includes('date-fns')) {
              return 'date-utils';
            }
            if (normalizedId.includes('@dicebear')) {
              return 'avatars';
            }
            if (normalizedId.includes('react-dnd') || normalizedId.includes('react-flip-toolkit')) {
              return 'react-interactions';
            }
            if (normalizedId.includes('react-hook-form')) {
              return 'forms';
            }
            if (normalizedId.includes('react-router-dom')) {
              return 'routing';
            }
            if (
              normalizedId.includes('qrcode.react') ||
              normalizedId.includes('@marsidev/react-turnstile')
            ) {
              return 'security-ui';
            }

            // CodeMirror chunks - exclude from aggressive minification
            if (normalizedId.includes('@codemirror/view')) {
              return 'codemirror-view';
            }
            if (normalizedId.includes('@codemirror/state')) {
              return 'codemirror-state';
            }
            if (normalizedId.includes('@codemirror/language')) {
              return 'codemirror-language';
            }
            if (normalizedId.includes('@codemirror')) {
              return 'codemirror-core';
            }

            if (
              normalizedId.includes('react-markdown') ||
              normalizedId.includes('remark-') ||
              normalizedId.includes('rehype-')
            ) {
              return 'markdown-processing';
            }
            if (normalizedId.includes('monaco-editor') || normalizedId.includes('@monaco-editor')) {
              return 'code-editor';
            }
            if (normalizedId.includes('react-window') || normalizedId.includes('react-virtual')) {
              return 'virtualization';
            }
            if (
              normalizedId.includes('zod') ||
              normalizedId.includes('yup') ||
              normalizedId.includes('joi')
            ) {
              return 'validation';
            }
            if (
              normalizedId.includes('axios') ||
              normalizedId.includes('ky') ||
              normalizedId.includes('fetch')
            ) {
              return 'http-client';
            }
            if (
              normalizedId.includes('react-spring') ||
              normalizedId.includes('react-transition-group')
            ) {
              return 'animations';
            }
            if (normalizedId.includes('react-select') || normalizedId.includes('downshift')) {
              return 'advanced-inputs';
            }
            if (normalizedId.includes('heic-to')) {
              return 'heic-converter';
            }

            // Existing chunks
            if (normalizedId.includes('@radix-ui')) {
              return 'radix-ui';
            }
            if (normalizedId.includes('framer-motion')) {
              return 'framer-motion';
            }
            if (normalizedId.includes('node_modules/highlight.js')) {
              return 'markdown_highlight';
            }
            if (normalizedId.includes('katex') || normalizedId.includes('node_modules/katex')) {
              return 'math-katex';
            }
            if (normalizedId.includes('node_modules/hast-util-raw')) {
              return 'markdown_large';
            }
            if (normalizedId.includes('@tanstack')) {
              return 'tanstack-vendor';
            }
            if (normalizedId.includes('@headlessui')) {
              return 'headlessui';
            }

            // Everything else falls into a generic vendor chunk.
            return 'vendor';
          }
          // Create a separate chunk for all locale files under src/locales.
          if (normalizedId.includes('/src/locales/')) {
            return 'locales';
          }
          // Let Rollup decide automatically for any other files.
          return null;
        },
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.names?.[0] && /\.(woff|woff2|eot|ttf|otf)$/.test(assetInfo.names[0])) {
            return 'assets/fonts/[name][extname]';
          }
          return 'assets/[name].[hash][extname]';
        },
      },
      /**
       * Ignore "use client" warning since we are not using SSR
       * @see {@link https://github.com/TanStack/query/pull/5161#issuecomment-1477389761 Preserve 'use client' directives TanStack/query#5161}
       */
      onwarn(warning, warn) {
        if (warning.message.includes('Error when using sourcemap')) {
          return;
        }
        warn(warning);
      },
    },
    chunkSizeWarningLimit: 1500,
  },
  resolve: {
    alias: [
      {
        find: '~',
        replacement: path.join(__dirname, 'src/'),
      },
      {
        find: '$fonts',
        replacement: path.resolve(__dirname, 'public/fonts'),
      },
      {
        find: 'micromark-extension-math',
        replacement: 'micromark-extension-llm-math',
      },
      // Resolve local workspace packages - handle subpaths correctly
      // Must match exact subpath first, then the base package
      {
        find: /^@librechat\/client$/,
        replacement: path.resolve(__dirname, '../packages/client/dist/index.es.js'),
      },
      {
        find: /^@librechat\/client\//,
        replacement: path.resolve(__dirname, '../packages/client/dist/'),
      },
      {
        find: /^librechat-data-provider\/react-query$/,
        replacement: path.resolve(__dirname, '../packages/data-provider/dist/react-query/index.es.js'),
      },
      {
        find: /^librechat-data-provider\/react-query\//,
        replacement: path.resolve(__dirname, '../packages/data-provider/dist/react-query/'),
      },
      {
        find: /^librechat-data-provider$/,
        replacement: path.resolve(__dirname, '../packages/data-provider/dist/index.es.js'),
      },
      {
        find: /^librechat-data-provider\//,
        replacement: path.resolve(__dirname, '../packages/data-provider/dist/'),
      },
    ],
  },
}));

interface SourcemapExclude {
  excludeNodeModules?: boolean;
}

export function sourcemapExclude(opts?: SourcemapExclude): Plugin {
  return {
    name: 'sourcemap-exclude',
    transform(code: string, id: string) {
      if (opts?.excludeNodeModules && id.includes('node_modules')) {
        return {
          code,
          // https://github.com/rollup/rollup/blob/master/docs/plugin-development/index.md#source-code-transformations
          map: { mappings: '' },
        };
      }
    },
  };
}
