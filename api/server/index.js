require('dotenv').config();
const fs = require('fs');
const path = require('path');
require('module-alias')({ base: path.resolve(__dirname, '..') });
const cors = require('cors');
const axios = require('axios');
const express = require('express');
const passport = require('passport');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const { logger } = require('@librechat/data-schemas');
const mongoSanitize = require('express-mongo-sanitize');
const {
  isEnabled,
  ErrorController,
  performStartupChecks,
  initializeFileStorage,
} = require('@librechat/api');
const { connectDb, indexSync } = require('~/db');
const initializeOAuthReconnectManager = require('./services/initializeOAuthReconnectManager');
const createValidateImageRequest = require('./middleware/validateImageRequest');
const { jwtLogin, ldapLogin, passportLogin } = require('~/strategies');
const { updateInterfacePermissions } = require('~/models/interface');
const { checkMigrations } = require('./services/start/migration');
const initializeMCPs = require('./services/initializeMCPs');
const configureSocialLogins = require('./socialLogins');
const { getAppConfig } = require('./services/Config');
const staticCache = require('./utils/staticCache');
const noIndex = require('./middleware/noIndex');
const { seedDatabase } = require('~/models');
const routes = require('./routes');

const { PORT, HOST, ALLOW_SOCIAL_LOGIN, DISABLE_COMPRESSION, TRUST_PROXY } = process.env ?? {};

// Allow PORT=0 to be used for automatic free port assignment
const port = isNaN(Number(PORT)) ? 3080 : Number(PORT);
// Default to 0.0.0.0 for containerized deployments and external access
const host = HOST || '0.0.0.0';
const trusted_proxy = Number(TRUST_PROXY) || 1; /* trust first proxy by default */

const app = express();

const startServer = async () => {
  if (typeof Bun !== 'undefined') {
    axios.defaults.headers.common['Accept-Encoding'] = 'gzip';
  }
  await connectDb();

  logger.info('Connected to MongoDB');
  indexSync().catch((err) => {
    logger.error('[indexSync] Background sync failed:', err);
  });

  app.disable('x-powered-by');
  app.set('trust proxy', trusted_proxy);

  await seedDatabase();
  const appConfig = await getAppConfig();
  initializeFileStorage(appConfig);
  await performStartupChecks(appConfig);
  await updateInterfacePermissions(appConfig);

  // Check if dist exists, if not, try to use client/index.html as fallback in development
  // If frontend is in a separate container (FRONTEND_SEPARATE=true), skip serving frontend
  let indexPath = path.join(appConfig.paths.dist, 'index.html');
  let indexHTML = null;
  
  if (process.env.FRONTEND_SEPARATE === 'true') {
    logger.info('Frontend is in a separate container, backend will only serve API routes');
    indexHTML = '<!DOCTYPE html><html><head><title>LibreChat API</title></head><body><h1>LibreChat API Server</h1><p>Frontend is served from a separate container.</p></body></html>';
  } else if (!fs.existsSync(indexPath) && process.env.NODE_ENV === 'development') {
    const fallbackPath = path.join(appConfig.paths.clientPath, 'index.html');
    if (fs.existsSync(fallbackPath)) {
      logger.warn(`client/dist/index.html not found, using ${fallbackPath} as fallback in development mode`);
      indexPath = fallbackPath;
      indexHTML = fs.readFileSync(indexPath, 'utf8');
    } else {
      logger.warn(`Neither ${indexPath} nor ${fallbackPath} exist. Frontend may be in a separate container.`);
      indexHTML = '<!DOCTYPE html><html><head><title>LibreChat API</title></head><body><h1>LibreChat API Server</h1><p>Frontend not found. If using separate containers, set FRONTEND_SEPARATE=true.</p></body></html>';
    }
  } else if (fs.existsSync(indexPath)) {
    indexHTML = fs.readFileSync(indexPath, 'utf8');
  } else {
    logger.warn(`client/dist/index.html not found. Frontend may be in a separate container. Set FRONTEND_SEPARATE=true to suppress this warning.`);
    indexHTML = '<!DOCTYPE html><html><head><title>LibreChat API</title></head><body><h1>LibreChat API Server</h1><p>Frontend not found. If using separate containers, set FRONTEND_SEPARATE=true.</p></body></html>';
  }

  // In order to provide support to serving the application in a sub-directory
  // We need to update the base href if the DOMAIN_CLIENT is specified and not the root path
  if (process.env.DOMAIN_CLIENT && indexHTML && !indexHTML.includes('LibreChat API Server')) {
    const clientUrl = new URL(process.env.DOMAIN_CLIENT);
    const baseHref = clientUrl.pathname.endsWith('/')
      ? clientUrl.pathname
      : `${clientUrl.pathname}/`;
    if (baseHref !== '/') {
      logger.info(`Setting base href to ${baseHref}`);
      indexHTML = indexHTML.replace(/base href="\/"/, `base href="${baseHref}"`);
    }
  }

  app.get('/health', (_req, res) => res.status(200).send('OK'));

  /* Middleware */
  app.use(noIndex);
  app.use(express.json({ limit: '3mb' }));
  app.use(express.urlencoded({ extended: true, limit: '3mb' }));
  app.use(mongoSanitize());
  app.use(cors());
  app.use(cookieParser());

  if (!isEnabled(DISABLE_COMPRESSION)) {
    app.use(compression());
  } else {
    console.warn('Response compression has been disabled via DISABLE_COMPRESSION.');
  }

  // Serve static files - order matters: dist first, then fonts, then assets
  // These middleware will call next() if file not found, allowing fallback to SPA
  app.use(staticCache(appConfig.paths.dist));
  app.use(staticCache(appConfig.paths.fonts));
  app.use(staticCache(appConfig.paths.assets));
  
  // Add explicit route for /src/* to serve from dist/src/*
  // This handles Vite's dev server paths in production
  app.use('/src', staticCache(appConfig.paths.dist));
  
  // Handle import map module specifiers (routes starting with /@)
  // Redirect to the actual file path based on import map resolution
  app.use((req, res, next) => {
    if (req.path === '/@librechat/client' || req.path === '/@librechat/client/') {
      // Redirect exact match to the specific file
      return res.redirect(301, '/assets/@librechat/client/index.es.js');
    }
    if (req.path.startsWith('/@librechat/client/')) {
      // Redirect subpaths to the corresponding path in assets
      const targetPath = req.path.replace('/@librechat/client', '/assets/@librechat/client');
      return res.redirect(301, targetPath);
    }
    // Handle /assets/@librechat/client/ (with trailing slash) - redirect to index.es.js
    if (req.path === '/assets/@librechat/client/') {
      return res.redirect(301, '/assets/@librechat/client/index.es.js');
    }
    // Handle /npm/ paths - redirect to CDN URLs
    // These requests occur when browsers try to resolve npm package subpaths
    if (req.path.startsWith('/npm/')) {
      return res.redirect(301, `https://cdn.jsdelivr.net${req.path}`);
    }
    // Handle bare module specifiers - redirect to CDN URLs from import map
    // This helps browsers that try to load modules before import map is processed
    if (req.path === '/lucide-react' || req.path.startsWith('/lucide-react/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/lucide-react@0.394.0/dist/esm/lucide-react.js');
    }
    if (req.path === '/clsx' || req.path.startsWith('/clsx/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/clsx@2.1.1/+esm');
    }
    if (req.path === '/tailwind-merge' || req.path.startsWith('/tailwind-merge/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/tailwind-merge@1.9.1/+esm');
    }
    if (req.path === '/class-variance-authority' || req.path.startsWith('/class-variance-authority/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/class-variance-authority@0.7.1/+esm');
    }
    if (req.path === '/zod' || req.path.startsWith('/zod/')) {
      // For subpaths, redirect to the CDN with the subpath
      if (req.path.startsWith('/zod/')) {
        const subpath = req.path.replace('/zod', '');
        return res.redirect(301, `https://cdn.jsdelivr.net/npm/zod@3.22.4${subpath}`);
      }
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/zod@3.22.4/+esm');
    }
    if (req.path === '/recoil' || req.path.startsWith('/recoil/')) {
      // For subpaths, redirect to the CDN with the subpath
      if (req.path.startsWith('/recoil/')) {
        const subpath = req.path.replace('/recoil', '');
        return res.redirect(301, `https://cdn.jsdelivr.net/npm/recoil@0.7.7${subpath}`);
      }
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/recoil@0.7.7/+esm');
    }
    if (req.path.startsWith('/@ariakit/')) {
      // Handle @ariakit packages
      if (req.path === '/@ariakit/react' || req.path.startsWith('/@ariakit/react/')) {
        // For subpaths like /@ariakit/react/select, redirect to the CDN with the subpath and +esm
        if (req.path.startsWith('/@ariakit/react/')) {
          const subpath = req.path.replace('/@ariakit/react', '');
          // If subpath doesn't end with .js, add +esm for ESM module resolution
          if (!subpath.endsWith('.js')) {
            return res.redirect(301, `https://cdn.jsdelivr.net/npm/@ariakit/react@0.4.15${subpath}/+esm`);
          }
          return res.redirect(301, `https://cdn.jsdelivr.net/npm/@ariakit/react@0.4.15${subpath}`);
        }
        return res.redirect(301, 'https://cdn.jsdelivr.net/npm/@ariakit/react@0.4.15/+esm');
      }
      if (req.path === '/@ariakit/react-core' || req.path.startsWith('/@ariakit/react-core/')) {
        // For subpaths like /@ariakit/react-core/select/select-renderer, redirect to the CDN with the subpath
        if (req.path.startsWith('/@ariakit/react-core/')) {
          const subpath = req.path.replace('/@ariakit/react-core', '');
          // Special handling for select/select-renderer - use +esm to resolve via export map
          if (subpath === '/select/select-renderer') {
            return res.redirect(301, 'https://cdn.jsdelivr.net/npm/@ariakit/react-core@0.4.17/select/select-renderer/+esm');
          }
          // For other subpaths, if they don't end with .js, add +esm for ESM module resolution
          if (!subpath.endsWith('.js')) {
            return res.redirect(301, `https://cdn.jsdelivr.net/npm/@ariakit/react-core@0.4.17${subpath}/+esm`);
          }
          return res.redirect(301, `https://cdn.jsdelivr.net/npm/@ariakit/react-core@0.4.17${subpath}`);
        }
        return res.redirect(301, 'https://cdn.jsdelivr.net/npm/@ariakit/react-core@0.4.17/+esm');
      }
    }
    if (req.path.startsWith('/@dicebear/')) {
      // Handle @dicebear packages
      if (req.path === '/@dicebear/core' || req.path.startsWith('/@dicebear/core/')) {
        // For subpaths, redirect to the CDN with the subpath
        if (req.path.startsWith('/@dicebear/core/')) {
          const subpath = req.path.replace('/@dicebear/core', '');
          return res.redirect(301, `https://cdn.jsdelivr.net/npm/@dicebear/core@9.2.2${subpath}`);
        }
        return res.redirect(301, 'https://cdn.jsdelivr.net/npm/@dicebear/core@9.2.2/+esm');
      }
      if (req.path === '/@dicebear/collection' || req.path.startsWith('/@dicebear/collection/')) {
        // For subpaths, redirect to the CDN with the subpath
        if (req.path.startsWith('/@dicebear/collection/')) {
          const subpath = req.path.replace('/@dicebear/collection', '');
          return res.redirect(301, `https://cdn.jsdelivr.net/npm/@dicebear/collection@9.2.2${subpath}`);
        }
        return res.redirect(301, 'https://cdn.jsdelivr.net/npm/@dicebear/collection@9.2.2/+esm');
      }
    }
    if (req.path === '/@headlessui/react' || req.path.startsWith('/@headlessui/react/')) {
      // For subpaths, redirect to the CDN with the subpath
      if (req.path.startsWith('/@headlessui/react/')) {
        const subpath = req.path.replace('/@headlessui/react', '');
        return res.redirect(301, `https://cdn.jsdelivr.net/npm/@headlessui/react@2.1.2${subpath}`);
      }
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/@headlessui/react@2.1.2/+esm');
    }
    if (req.path === '/@marsidev/react-turnstile' || req.path.startsWith('/@marsidev/react-turnstile/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/@marsidev/react-turnstile@1.1.0/+esm');
    }
    if (req.path === '/@mcp-ui/client' || req.path.startsWith('/@mcp-ui/client/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/@mcp-ui/client@5.7.0/+esm');
    }
    if (req.path === '/@codesandbox/sandpack-react' || req.path.startsWith('/@codesandbox/sandpack-react/')) {
      // For subpaths like /@codesandbox/sandpack-react/unstyled, redirect to the CDN with the subpath
      if (req.path.startsWith('/@codesandbox/sandpack-react/')) {
        const subpath = req.path.replace('/@codesandbox/sandpack-react', '');
        return res.redirect(301, `https://cdn.jsdelivr.net/npm/@codesandbox/sandpack-react@2.19.10${subpath}`);
      }
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/@codesandbox/sandpack-react@2.19.10/+esm');
    }
    if (req.path === '/@codesandbox/sandpack-client' || req.path.startsWith('/@codesandbox/sandpack-client/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/@codesandbox/sandpack-client@2.19.10/+esm');
    }
    if (req.path === '/@react-spring/web' || req.path.startsWith('/@react-spring/web/')) {
      // For subpaths, redirect to the CDN with the subpath
      if (req.path.startsWith('/@react-spring/web/')) {
        const subpath = req.path.replace('/@react-spring/web', '');
        return res.redirect(301, `https://cdn.jsdelivr.net/npm/@react-spring/web@9.7.5${subpath}`);
      }
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/@react-spring/web@9.7.5/+esm');
    }
    if (req.path.startsWith('/@tanstack/')) {
      // Handle @tanstack packages
      if (req.path === '/@tanstack/react-query' || req.path.startsWith('/@tanstack/react-query/')) {
        // For subpaths, redirect to the CDN with the subpath
        if (req.path.startsWith('/@tanstack/react-query/')) {
          const subpath = req.path.replace('/@tanstack/react-query', '');
          return res.redirect(301, `https://cdn.jsdelivr.net/npm/@tanstack/react-query@4.28.0${subpath}`);
        }
        return res.redirect(301, 'https://cdn.jsdelivr.net/npm/@tanstack/react-query@4.28.0/+esm');
      }
      if (req.path === '/@tanstack/react-table' || req.path.startsWith('/@tanstack/react-table/')) {
        // For subpaths, redirect to the CDN with the subpath
        if (req.path.startsWith('/@tanstack/react-table/')) {
          const subpath = req.path.replace('/@tanstack/react-table', '');
          return res.redirect(301, `https://cdn.jsdelivr.net/npm/@tanstack/react-table@8.11.7${subpath}`);
        }
        return res.redirect(301, 'https://cdn.jsdelivr.net/npm/@tanstack/react-table@8.11.7/+esm');
      }
      if (req.path === '/@tanstack/react-virtual' || req.path.startsWith('/@tanstack/react-virtual/')) {
        // For subpaths, redirect to the CDN with the subpath
        if (req.path.startsWith('/@tanstack/react-virtual/')) {
          const subpath = req.path.replace('/@tanstack/react-virtual', '');
          return res.redirect(301, `https://cdn.jsdelivr.net/npm/@tanstack/react-virtual@3.0.0${subpath}`);
        }
        return res.redirect(301, 'https://cdn.jsdelivr.net/npm/@tanstack/react-virtual@3.0.0/+esm');
      }
    }
    if (req.path === '/react-router-dom' || req.path.startsWith('/react-router-dom/')) {
      // For subpaths, redirect to the CDN with the subpath
      if (req.path.startsWith('/react-router-dom/')) {
        const subpath = req.path.replace('/react-router-dom', '');
        return res.redirect(301, `https://cdn.jsdelivr.net/npm/react-router-dom@6.11.2${subpath}`);
      }
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/react-router-dom@6.11.2/+esm');
    }
    if (req.path === '/react-dnd' || req.path.startsWith('/react-dnd/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/react-dnd@16.0.1/+esm');
    }
    if (req.path === '/react-dnd-html5-backend' || req.path.startsWith('/react-dnd-html5-backend/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/react-dnd-html5-backend@16.0.1/+esm');
    }
    if (req.path === '/i18next' || req.path.startsWith('/i18next/')) {
      // For subpaths, redirect to the CDN with the subpath
      if (req.path.startsWith('/i18next/')) {
        const subpath = req.path.replace('/i18next', '');
        return res.redirect(301, `https://cdn.jsdelivr.net/npm/i18next@24.2.2${subpath}`);
      }
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/i18next@24.2.2/+esm');
    }
    if (req.path === '/react-i18next' || req.path.startsWith('/react-i18next/')) {
      // For subpaths, redirect to the CDN with the subpath
      if (req.path.startsWith('/react-i18next/')) {
        const subpath = req.path.replace('/react-i18next', '');
        return res.redirect(301, `https://cdn.jsdelivr.net/npm/react-i18next@15.4.0${subpath}`);
      }
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/react-i18next@15.4.0/+esm');
    }
    if (req.path === '/framer-motion' || req.path.startsWith('/framer-motion/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/framer-motion@11.5.4/+esm');
    }
    if (req.path === '/react-hook-form' || req.path.startsWith('/react-hook-form/')) {
      // For subpaths, redirect to the CDN with the subpath
      if (req.path.startsWith('/react-hook-form/')) {
        const subpath = req.path.replace('/react-hook-form', '');
        return res.redirect(301, `https://cdn.jsdelivr.net/npm/react-hook-form@7.43.9${subpath}`);
      }
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/react-hook-form@7.43.9/+esm');
    }
    if (req.path === '/react-markdown' || req.path.startsWith('/react-markdown/')) {
      // For subpaths, redirect to the CDN with the subpath
      if (req.path.startsWith('/react-markdown/')) {
        const subpath = req.path.replace('/react-markdown', '');
        return res.redirect(301, `https://cdn.jsdelivr.net/npm/react-markdown@9.0.1${subpath}`);
      }
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/react-markdown@9.0.1/+esm');
    }
    if (req.path === '/jotai' || req.path.startsWith('/jotai/')) {
      // For subpaths like /jotai/utils, redirect to the CDN with the subpath and +esm
      if (req.path.startsWith('/jotai/')) {
        const subpath = req.path.replace('/jotai', '');
        // If subpath doesn't end with .js, add +esm for ESM module resolution
        if (!subpath.endsWith('.js')) {
          return res.redirect(301, `https://cdn.jsdelivr.net/npm/jotai@2.12.5${subpath}/+esm`);
        }
        return res.redirect(301, `https://cdn.jsdelivr.net/npm/jotai@2.12.5${subpath}`);
      }
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/jotai@2.12.5/+esm');
    }
    if (req.path === '/lodash' || req.path.startsWith('/lodash/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/+esm');
    }
    if (req.path === '/date-fns' || req.path.startsWith('/date-fns/')) {
      // For subpaths, redirect to the CDN with the subpath
      if (req.path.startsWith('/date-fns/')) {
        const subpath = req.path.replace('/date-fns', '');
        return res.redirect(301, `https://cdn.jsdelivr.net/npm/date-fns@3.3.1${subpath}`);
      }
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/date-fns@3.3.1/+esm');
    }
    if (req.path === '/js-cookie' || req.path.startsWith('/js-cookie/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/js-cookie@3.0.5/+esm');
    }
    if (req.path === '/copy-to-clipboard' || req.path.startsWith('/copy-to-clipboard/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/copy-to-clipboard@3.3.3/+esm');
    }
    if (req.path === '/match-sorter' || req.path.startsWith('/match-sorter/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/match-sorter@8.1.0/+esm');
    }
    if (req.path === '/rc-input-number' || req.path.startsWith('/rc-input-number/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/rc-input-number@7.4.2/+esm');
    }
    if (req.path === '/react-textarea-autosize' || req.path.startsWith('/react-textarea-autosize/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/react-textarea-autosize@8.4.0/+esm');
    }
    if (req.path === '/react-avatar-editor' || req.path.startsWith('/react-avatar-editor/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/react-avatar-editor@13.0.2/+esm');
    }
    if (req.path === '/react-flip-toolkit' || req.path.startsWith('/react-flip-toolkit/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/react-flip-toolkit@7.1.0/+esm');
    }
    if (req.path === '/react-lazy-load-image-component' || req.path.startsWith('/react-lazy-load-image-component/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/react-lazy-load-image-component@1.6.0/+esm');
    }
    if (req.path === '/react-resizable-panels' || req.path.startsWith('/react-resizable-panels/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/react-resizable-panels@3.0.6/+esm');
    }
    if (req.path === '/react-speech-recognition' || req.path.startsWith('/react-speech-recognition/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/react-speech-recognition@3.10.0/+esm');
    }
    if (req.path === '/react-transition-group' || req.path.startsWith('/react-transition-group/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/react-transition-group@4.4.5/+esm');
    }
    if (req.path === '/react-virtualized' || req.path.startsWith('/react-virtualized/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/react-virtualized@9.22.6/+esm');
    }
    if (req.path === '/qrcode.react' || req.path.startsWith('/qrcode.react/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/qrcode.react@4.2.0/+esm');
    }
    if (req.path === '/sse.js' || req.path.startsWith('/sse.js/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/sse.js@2.5.0/+esm');
    }
    if (req.path === '/heic-to' || req.path.startsWith('/heic-to/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/heic-to@1.1.14/+esm');
    }
    if (req.path === '/html-to-image' || req.path.startsWith('/html-to-image/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/+esm');
    }
    if (req.path === '/input-otp' || req.path.startsWith('/input-otp/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/input-otp@1.4.2/+esm');
    }
    if (req.path === '/downloadjs' || req.path.startsWith('/downloadjs/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/downloadjs@1.4.7/+esm');
    }
    if (req.path === '/export-from-json' || req.path.startsWith('/export-from-json/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/export-from-json@1.7.2/+esm');
    }
    if (req.path === '/filenamify' || req.path.startsWith('/filenamify/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/filenamify@6.0.0/+esm');
    }
    if (req.path === '/i18next-browser-languagedetector' || req.path.startsWith('/i18next-browser-languagedetector/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/i18next-browser-languagedetector@8.0.3/+esm');
    }
    if (req.path === '/regenerator-runtime' || req.path.startsWith('/regenerator-runtime/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/regenerator-runtime@0.14.1/+esm');
    }
    if (req.path === '/rehype-highlight' || req.path.startsWith('/rehype-highlight/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/rehype-highlight@6.0.0/+esm');
    }
    if (req.path === '/rehype-katex' || req.path.startsWith('/rehype-katex/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/rehype-katex@6.0.3/+esm');
    }
    if (req.path === '/remark-directive' || req.path.startsWith('/remark-directive/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/remark-directive@3.0.0/+esm');
    }
    if (req.path === '/remark-gfm' || req.path.startsWith('/remark-gfm/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/remark-gfm@4.0.0/+esm');
    }
    if (req.path === '/remark-math' || req.path.startsWith('/remark-math/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/remark-math@6.0.0/+esm');
    }
    if (req.path === '/remark-supersub' || req.path.startsWith('/remark-supersub/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/remark-supersub@1.0.0/+esm');
    }
    if (req.path === '/micromark-extension-llm-math' || req.path.startsWith('/micromark-extension-llm-math/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/micromark-extension-llm-math@3.1.0/+esm');
    }
    if (req.path === '/dompurify' || req.path.startsWith('/dompurify/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/dompurify@3.2.6/+esm');
    }
    if (req.path === '/react-gtm-module' || req.path.startsWith('/react-gtm-module/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/react-gtm-module@2.0.11/+esm');
    }
    if (req.path.startsWith('/@radix-ui/react-icons/')) {
      // Handle @radix-ui/react-icons subpaths (for individual icons)
      const subpath = req.path.replace('/@radix-ui/react-icons', '');
      return res.redirect(301, `https://cdn.jsdelivr.net/npm/@radix-ui/react-icons@1.3.0${subpath}`);
    }
    if (req.path === '/react' || req.path.startsWith('/react/')) {
      // For subpaths like /react/jsx-runtime, redirect to the CDN with the subpath
      if (req.path.startsWith('/react/')) {
        const subpath = req.path.replace('/react', '');
        // Special handling for jsx-runtime - use +esm to resolve via export map
        if (subpath === '/jsx-runtime') {
          return res.redirect(301, 'https://cdn.jsdelivr.net/npm/react@18.2.0/jsx-runtime/+esm');
        }
        // For other subpaths, if they don't end with .js, add +esm for ESM module resolution
        if (!subpath.endsWith('.js')) {
          return res.redirect(301, `https://cdn.jsdelivr.net/npm/react@18.2.0${subpath}/+esm`);
        }
        return res.redirect(301, `https://cdn.jsdelivr.net/npm/react@18.2.0${subpath}`);
      }
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/react@18.2.0/+esm');
    }
    if (req.path === '/react-dom' || req.path.startsWith('/react-dom/')) {
      return res.redirect(301, 'https://cdn.jsdelivr.net/npm/react-dom@18.2.0/+esm');
    }
    // Handle module specifiers that should be resolved via import map
    // These should return 404 to let the browser use the import map
    if (req.path.startsWith('/@')) {
      // Other @ routes should be handled by import map or return 404
      return res.status(404).send('Module not found - should be resolved via import map');
    }
    next();
  });

  if (!ALLOW_SOCIAL_LOGIN) {
    console.warn('Social logins are disabled. Set ALLOW_SOCIAL_LOGIN=true to enable them.');
  }

  /* OAUTH */
  app.use(passport.initialize());
  passport.use(jwtLogin());
  passport.use(passportLogin());

  /* LDAP Auth */
  if (process.env.LDAP_URL && process.env.LDAP_USER_SEARCH_BASE) {
    passport.use(ldapLogin);
  }

  if (isEnabled(ALLOW_SOCIAL_LOGIN)) {
    await configureSocialLogins(app);
  }

  app.use('/oauth', routes.oauth);
  /* API Endpoints */
  app.use('/api/auth', routes.auth);
  app.use('/api/actions', routes.actions);
  app.use('/api/keys', routes.keys);
  app.use('/api/user', routes.user);
  app.use('/api/search', routes.search);
  app.use('/api/edit', routes.edit);
  app.use('/api/messages', routes.messages);
  app.use('/api/convos', routes.convos);
  app.use('/api/presets', routes.presets);
  app.use('/api/prompts', routes.prompts);
  app.use('/api/categories', routes.categories);
  app.use('/api/tokenizer', routes.tokenizer);
  app.use('/api/endpoints', routes.endpoints);
  app.use('/api/balance', routes.balance);
  app.use('/api/models', routes.models);
  app.use('/api/plugins', routes.plugins);
  app.use('/api/config', routes.config);
  app.use('/api/assistants', routes.assistants);
  app.use('/api/files', await routes.files.initialize());
  app.use('/images/', createValidateImageRequest(appConfig.secureImageLinks), routes.staticRoute);
  app.use('/api/share', routes.share);
  app.use('/api/roles', routes.roles);
  app.use('/api/agents', routes.agents);
  app.use('/api/banner', routes.banner);
  app.use('/api/memories', routes.memories);
  app.use('/api/permissions', routes.accessPermissions);

  app.use('/api/tags', routes.tags);
  app.use('/api/mcp', routes.mcp);

  app.use(ErrorController);

  // SPA fallback - serve index.html for all unmatched routes
  // But exclude static assets and API routes
  // IMPORTANT: This must be the LAST middleware to ensure static files are served first
  // Express static middleware will call next() if file not found, so we need to check if response was already sent
  // Skip SPA fallback if frontend is in a separate container
  if (indexHTML && process.env.FRONTEND_SEPARATE !== 'true') {
    app.use((req, res, next) => {
      // Skip if it's an API route, static asset, or has a file extension
      // Also check for common asset paths including /src/ (for Vite dev server compatibility)
      // Also skip routes starting with /@ (import map module specifiers)
      if (
        req.path.startsWith('/api/') ||
        req.path.startsWith('/oauth/') ||
        req.path.startsWith('/images/') ||
        req.path.startsWith('/assets/') ||
        req.path.startsWith('/fonts/') ||
        req.path.startsWith('/src/') ||
        req.path.startsWith('/npm/') || // npm package paths (handled by redirect middleware)
        req.path.startsWith('/@') || // Import map module specifiers (e.g., /@librechat/client)
        req.path.match(/\.(js|mjs|jsx|css|json|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp|mp3|mp4|webm|gz)$/i)
      ) {
        // If it's a static file path but wasn't found by static middleware, return 404
        // Check if response was already sent (file was found and served)
        if (!res.headersSent) {
          return res.status(404).send('File not found');
        }
        return;
      }

      res.set({
        'Cache-Control': process.env.INDEX_CACHE_CONTROL || 'no-cache, no-store, must-revalidate',
        Pragma: process.env.INDEX_PRAGMA || 'no-cache',
        Expires: process.env.INDEX_EXPIRES || '0',
      });

      const lang = req.cookies.lang || req.headers['accept-language']?.split(',')[0] || 'en-US';
      const saneLang = lang.replace(/"/g, '&quot;');
      let updatedIndexHtml = indexHTML.replace(/lang="en-US"/g, `lang="${saneLang}"`);

      res.type('html');
      res.send(updatedIndexHtml);
    });
  } else if (process.env.FRONTEND_SEPARATE === 'true') {
    // If frontend is separate, only serve API routes and return 404 for everything else
    app.use((req, res) => {
      if (
        req.path.startsWith('/api/') ||
        req.path.startsWith('/oauth/') ||
        req.path.startsWith('/images/') ||
        req.path.startsWith('/health')
      ) {
        // These routes are handled by other middleware
        return;
      }
      if (!res.headersSent) {
        res.status(404).send('Not found. Frontend is served from a separate container.');
      }
    });
  }

  app.listen(port, host, async () => {
    if (host === '0.0.0.0') {
      logger.info(
        `Server listening on all interfaces at port ${port}. Use http://localhost:${port} to access it`,
      );
    } else {
      logger.info(`Server listening at http://${host == '0.0.0.0' ? 'localhost' : host}:${port}`);
    }

    await initializeMCPs();
    await initializeOAuthReconnectManager();
    await checkMigrations();
  });
};

startServer();

let messageCount = 0;
process.on('uncaughtException', (err) => {
  if (!err.message.includes('fetch failed')) {
    logger.error('There was an uncaught error:', err);
  }

  if (err.message && err.message?.toLowerCase()?.includes('abort')) {
    logger.warn('There was an uncatchable abort error.');
    return;
  }

  if (err.message.includes('GoogleGenerativeAI')) {
    logger.warn(
      '\n\n`GoogleGenerativeAI` errors cannot be caught due to an upstream issue, see: https://github.com/google-gemini/generative-ai-js/issues/303',
    );
    return;
  }

  if (err.message.includes('fetch failed')) {
    if (messageCount === 0) {
      logger.warn('Meilisearch error, search will be disabled');
      messageCount++;
    }

    return;
  }

  if (err.message.includes('OpenAIError') || err.message.includes('ChatCompletionMessage')) {
    logger.error(
      '\n\nAn Uncaught `OpenAIError` error may be due to your reverse-proxy setup or stream configuration, or a bug in the `openai` node package.',
    );
    return;
  }

  if (err.stack && err.stack.includes('@librechat/agents')) {
    logger.error(
      '\n\nAn error occurred in the agents system. The error has been logged and the app will continue running.',
      {
        message: err.message,
        stack: err.stack,
      },
    );
    return;
  }

  process.exit(1);
});

/** Export app for easier testing purposes */
module.exports = app;
