const fs = require('fs-extra');
const path = require('path');

// Create a React proxy module that re-exports the pre-loaded React instance
async function createReactProxy() {
  const proxyDir = path.join('dist', 'assets', 'react-proxy');
  await fs.ensureDir(proxyDir);
  
  // Create a proxy module for React
  // CRITICAL: This module must wait for React to be pre-loaded before exporting
  // We use top-level await to ensure React is available when modules import it
  const reactProxyContent = `// React Proxy Module
// This module re-exports the pre-loaded React instance to ensure all modules use the same instance
// It waits for React to be pre-loaded before exporting

async function getReactInstance() {
  // Wait for React to be pre-loaded
  if (typeof window !== 'undefined' && window.__REACT_MODULE__) {
    return window.__REACT_MODULE__;
  }
  
  // Wait for React to be ready
  let attempts = 0;
  while (attempts < 500) { // 5 seconds max (500 * 10ms)
    if (window.__REACT_MODULE__) {
      return window.__REACT_MODULE__;
    }
    await new Promise(resolve => setTimeout(resolve, 10));
    attempts++;
  }
  
  throw new Error('React module not available after 5 seconds');
}

// Use top-level await to wait for React before exporting
const reactModule = await getReactInstance();
const ReactExports = reactModule.default || reactModule;

// Export React - export default and all named exports
export default ReactExports;

// Re-export all common named exports
// This ensures named imports like { useContext } work correctly
export const useContext = ReactExports.useContext;
export const useState = ReactExports.useState;
export const useEffect = ReactExports.useEffect;
export const useRef = ReactExports.useRef;
export const useMemo = ReactExports.useMemo;
export const useCallback = ReactExports.useCallback;
export const createContext = ReactExports.createContext;
export const createElement = ReactExports.createElement;
export const createRef = ReactExports.createRef;
export const Fragment = ReactExports.Fragment;
export const StrictMode = ReactExports.StrictMode;
export const Suspense = ReactExports.Suspense;
export const lazy = ReactExports.lazy;
export const memo = ReactExports.memo;
export const forwardRef = ReactExports.forwardRef;
export const useImperativeHandle = ReactExports.useImperativeHandle;
export const useLayoutEffect = ReactExports.useLayoutEffect;
export const useReducer = ReactExports.useReducer;
export const useDebugValue = ReactExports.useDebugValue;
export const useId = ReactExports.useId;
export const useTransition = ReactExports.useTransition;
export const useDeferredValue = ReactExports.useDeferredValue;
export const useSyncExternalStore = ReactExports.useSyncExternalStore;
export const useInsertionEffect = ReactExports.useInsertionEffect;
export const startTransition = ReactExports.startTransition;
export const version = ReactExports.version;
export const Children = ReactExports.Children;
export const Component = ReactExports.Component;
export const PureComponent = ReactExports.PureComponent;
export const isValidElement = ReactExports.isValidElement;
export const cloneElement = ReactExports.cloneElement;
export const use = ReactExports.use;
export const useOptimistic = ReactExports.useOptimistic;
export const useActionState = ReactExports.useActionState;
export const useFormStatus = ReactExports.useFormStatus;
export const useFormState = ReactExports.useFormState;
`;

  const reactDOMProxyContent = `// ReactDOM Proxy Module
// Waits for ReactDOM to be pre-loaded before exporting

async function getReactDOMInstance() {
  if (typeof window !== 'undefined' && window.__REACT_DOM_MODULE__) {
    return window.__REACT_DOM_MODULE__;
  }
  
  let attempts = 0;
  while (attempts < 500) {
    if (window.__REACT_DOM_MODULE__) {
      return window.__REACT_DOM_MODULE__;
    }
    await new Promise(resolve => setTimeout(resolve, 10));
    attempts++;
  }
  
  throw new Error('ReactDOM module not available after 5 seconds');
}

const reactDOMModule = await getReactDOMInstance();
const ReactDOMExports = reactDOMModule.default || reactDOMModule;

// Export ReactDOM - export default and common named exports
export default ReactDOMExports;

// Re-export common ReactDOM exports
// Using destructuring to avoid potential issues with property access
const { render, hydrate, createRoot, hydrateRoot, flushSync, version, findDOMNode, unmountComponentAtNode, createPortal, unstable_batchedUpdates, unstable_renderSubtreeIntoContainer } = ReactDOMExports;

export { render, hydrate, createRoot, hydrateRoot, flushSync, version, findDOMNode, unmountComponentAtNode, createPortal, unstable_batchedUpdates, unstable_renderSubtreeIntoContainer };
`;

  const jsxRuntimeProxyContent = `// JSX Runtime Proxy Module
// Waits for JSX Runtime to be pre-loaded before exporting

async function getJSXRuntimeInstance() {
  if (typeof window !== 'undefined' && window.__REACT_JSX_RUNTIME_MODULE__) {
    return window.__REACT_JSX_RUNTIME_MODULE__;
  }
  
  let attempts = 0;
  while (attempts < 500) {
    if (window.__REACT_JSX_RUNTIME_MODULE__) {
      return window.__REACT_JSX_RUNTIME_MODULE__;
    }
    await new Promise(resolve => setTimeout(resolve, 10));
    attempts++;
  }
  
  throw new Error('JSX Runtime module not available after 5 seconds');
}

const jsxRuntimeModule = await getJSXRuntimeInstance();
const JSXRuntimeExports = jsxRuntimeModule.default || jsxRuntimeModule;

// Export JSX Runtime - export default and common named exports
export default JSXRuntimeExports;

// Re-export common JSX Runtime exports
// Using destructuring to avoid potential issues with property access
const { jsx, jsxs, Fragment } = JSXRuntimeExports;

export { jsx, jsxs, Fragment };
`;

  await fs.writeFile(path.join(proxyDir, 'react.js'), reactProxyContent);
  await fs.writeFile(path.join(proxyDir, 'react-dom.js'), reactDOMProxyContent);
  await fs.writeFile(path.join(proxyDir, 'jsx-runtime.js'), jsxRuntimeProxyContent);
  
  console.log('✅ React proxy modules created');
}

async function postBuild() {
  try {
    await fs.copy('public/assets', 'dist/assets');
    await fs.copy('public/robots.txt', 'dist/robots.txt');
    
    // Create React proxy modules that re-export the pre-loaded React instance
    await createReactProxy();
    
    // Copy @librechat/client package to dist for import map resolution
    const clientPackagePath = '../packages/client/dist';
    const targetPath = 'dist/assets/@librechat/client';
    if (await fs.pathExists(clientPackagePath)) {
      await fs.ensureDir(targetPath);
      await fs.copy(clientPackagePath, targetPath);
      console.log('✅ @librechat/client package copied to dist/assets');
    } else {
      console.warn('⚠️  @librechat/client dist not found, skipping copy');
    }
    
    // Fix HTML: Remove script tags with bare module specifiers
    // These don't work because import maps only apply to import statements, not src attributes
    const indexPath = path.join('dist', 'index.html');
    if (await fs.pathExists(indexPath)) {
      let html = await fs.readFile(indexPath, 'utf-8');
      
      // Remove script tags that use bare module specifiers (not starting with ./ or http)
      // These are externalized modules that should be resolved via import map at runtime
      // Pattern matches: <script ... src="react" ...></script> or src="react/jsx-runtime" etc.
      const bareModulePattern = /<script[^>]*\ssrc="(react|react-dom|react\/jsx-runtime|@librechat\/client|lucide-react)(?:\/.*?)?"[^>]*><\/script>\s*/g;
      html = html.replace(bareModulePattern, '');
      
      // CRITICAL FIX: Modify the import map to point React to our proxy modules
      // This ensures all modules use the same pre-loaded React instance
      const importMapPattern = /("react":\s*)"https:\/\/cdn\.jsdelivr\.net\/npm\/react@18\.2\.0\/\+esm"/g;
      html = html.replace(importMapPattern, '$1"./assets/react-proxy/react.js"');
      
      const importMapReactDOMPattern = /("react-dom":\s*)"https:\/\/cdn\.jsdelivr\.net\/npm\/react-dom@18\.2\.0\/\+esm"/g;
      html = html.replace(importMapReactDOMPattern, '$1"./assets/react-proxy/react-dom.js"');
      
      const importMapJSXRuntimePattern = /("react\/jsx-runtime":\s*)"https:\/\/cdn\.jsdelivr\.net\/npm\/react@18\.2\.0\/jsx-runtime\/\+esm"/g;
      html = html.replace(importMapJSXRuntimePattern, '$1"./assets/react-proxy/jsx-runtime.js"');
      
      console.log('✅ Modified import map to use React proxy modules');
      
      // Add React pre-load script AFTER import map (using full CDN URLs to bypass import map)
      // This ensures React is available before modules that depend on it
      const reactPreloadScript = `    <!-- Pre-load React and react-dom using full CDN URLs (bypass import map) -->
    <script type="module">
      // Pre-load React and react-dom using full CDN URLs
      // This bypasses the import map and ensures React is available immediately
      // This prevents "Cannot read properties of null (reading 'useContext')" errors
      (async () => {
        try {
          const [react, reactDOM, jsxRuntime] = await Promise.all([
            import('https://cdn.jsdelivr.net/npm/react@18.2.0/+esm'),
            import('https://cdn.jsdelivr.net/npm/react-dom@18.2.0/+esm'),
            import('https://cdn.jsdelivr.net/npm/react@18.2.0/jsx-runtime/+esm')
          ]);
          
          // Extract the actual React exports from the module
          const ReactExports = react.default || react;
          const ReactDOMExports = reactDOM.default || reactDOM;
          const JSXRuntimeExports = jsxRuntime.default || jsxRuntime;
          
          // Export React globally so all modules can access it
          window.React = ReactExports;
          window.ReactDOM = ReactDOMExports;
          window.__REACT_JSX_RUNTIME__ = JSXRuntimeExports;
          
          // Store the module namespace objects for re-export
          window.__REACT_MODULE__ = react;
          window.__REACT_DOM_MODULE__ = reactDOM;
          window.__REACT_JSX_RUNTIME_MODULE__ = jsxRuntime;
          
          // Intercept import map resolution for React to ensure all modules use the same instance
          // This is done by modifying the import map after it's processed
          if (document.importMap) {
            // Create a proxy module that re-exports the pre-loaded React
            const reactProxy = new Proxy({}, {
              get(target, prop) {
                if (prop === 'default') {
                  return ReactExports;
                }
                return ReactExports[prop];
              },
              has(target, prop) {
                return prop in ReactExports || prop === 'default';
              },
              ownKeys(target) {
                return Object.keys(ReactExports);
              }
            });
            
            // Store the proxy for later use
            window.__REACT_PROXY__ = reactProxy;
          }
          
          console.log('✅ React modules pre-loaded successfully');
          console.log('✅ React exported globally:', !!window.React);
          
          // Wait longer to ensure React is completely initialized
          // This prevents "Cannot read properties of null" errors
          // Multiple ticks to ensure React's internal state is ready
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Verify React is actually usable by testing all critical APIs
          let reactReady = false;
          let attempts = 0;
          const maxAttempts = 20;
          
          while (!reactReady && attempts < maxAttempts) {
            try {
              // Check that React is available and has all necessary exports
              if (window.React && 
                  typeof window.React.useContext === 'function' &&
                  typeof window.React.useState === 'function' &&
                  typeof window.React.useEffect === 'function' &&
                  typeof window.React.createContext === 'function' &&
                  typeof window.React.createElement === 'function' &&
                  window.ReactDOM &&
                  typeof window.ReactDOM.render === 'function') {
                
                // Try to create a test context to ensure React is fully functional
                const TestContext = window.React.createContext(null);
                if (TestContext && TestContext.Provider && TestContext.Consumer) {
                  // Verify React's internal state is ready by checking if useContext works
                  // We can't actually call useContext here, but we can verify the structure
                  reactReady = true;
                  console.log('✅ React verified and ready after', attempts + 1, 'attempts');
                }
              }
            } catch (e) {
              console.warn('React not ready yet, attempt', attempts + 1, ':', e.message);
            }
            
            if (!reactReady) {
              await new Promise(resolve => setTimeout(resolve, 100));
              attempts++;
            }
          }
          
          if (reactReady) {
            console.log('✅ React is fully initialized and ready');
          } else {
            console.warn('⚠️ React may not be fully initialized after', attempts, 'attempts');
            console.warn('⚠️ Continuing anyway, but errors may occur');
          }
          
          // Additional wait to ensure React is completely stable
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // CRITICAL FIX: The problem is that modules import React via import map BEFORE React is ready
          // We need to ensure React is available in the module cache before any modules execute
          // The import map resolves 'react' to the CDN URL, but we need to ensure that URL resolves to our pre-loaded instance
          
          // Wait for the import map to be processed, then verify React is accessible
          // We'll test importing React through the import map to ensure it works
          try {
            // Test that React can be imported via the import map
            // This ensures the import map is working correctly
            const testReactImport = await import('react');
            if (testReactImport && (testReactImport.default || testReactImport.useContext)) {
              console.log('✅ React import via import map verified');
            } else {
              console.warn('⚠️ React import via import map returned unexpected value');
            }
          } catch (err) {
            console.warn('⚠️ Could not verify React import via import map:', err.message);
          }
          
          // Additional wait to ensure import map has fully processed React
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Dispatch event to signal React is ready
          window.dispatchEvent(new Event('react-ready'));
          // Set a flag to indicate React is ready
          window.__REACT_READY__ = true;
        } catch (err) {
          console.error('❌ Failed to pre-load React modules:', err);
          // Even on error, set flag to prevent infinite waiting
          window.__REACT_READY__ = true;
        }
      })();
    </script>
    
    <!-- Wait for import map to be processed before loading modules that use bare specifiers -->
    <script>
      // Ensure import map is processed before any module scripts that use bare specifiers
      // This prevents "bare specifier not reassigned" errors
      function markImportMapReady() {
        window.__IMPORT_MAP_READY__ = true;
        window.dispatchEvent(new Event('import-map-ready'));
      }
      
      // Import maps are processed synchronously when the script tag is parsed
      // But we need to wait for the next tick to ensure it's fully processed
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          // Wait one more tick to ensure import map is fully processed
          setTimeout(markImportMapReady, 0);
        });
      } else {
        // DOM already loaded, wait one tick
        setTimeout(markImportMapReady, 0);
      }
    </script>

`;
      
      // Insert React pre-load script and import map ready script AFTER import map closes
      const importMapClosePattern = /(\s*<\/script>\s*)(?=\s*<!-- Load all module chunks|$)/;
      if (importMapClosePattern.test(html)) {
        html = html.replace(importMapClosePattern, '$1' + reactPreloadScript);
      } else {
        // Fallback: insert after import map script tag
        const importMapEndPattern = /(\s*<\/script>\s*)(?=\s*<script type="module"|$)/;
        if (importMapEndPattern.test(html)) {
          html = html.replace(importMapEndPattern, '$1' + reactPreloadScript);
        }
      }
      
      // Remove duplicate React pre-load scripts
      const reactPreloadPattern = /<!-- Pre-load React and react-dom[^]*?<\/script>\s*/g;
      const matches = html.match(reactPreloadPattern);
      if (matches && matches.length > 1) {
        // Keep only the first one
        html = html.replace(reactPreloadPattern, (match, offset) => {
          return offset === html.indexOf(match) ? match : '';
        });
      }
      
      // Separate chunks from main entry point
      // Chunks should load normally (they'll be imported by main entry when needed)
      // Only the main entry point needs to wait for React
      const moduleScriptPattern = /<script type="module" crossorigin src="(\.\/assets\/[^"]+\.js)"><\/script>/g;
      const allModuleScripts = [];
      html = html.replace(moduleScriptPattern, (match, src) => {
        allModuleScripts.push(src);
        return ''; // Remove all module scripts temporarily
      });
      
      // Separate main entry from chunks
      const mainEntry = allModuleScripts.find(s => s.includes('index.') && s.includes('.js'));
      const chunks = allModuleScripts.filter(s => !(s.includes('index.') && s.includes('.js')));
      
      // Add chunks back as normal script tags (they'll be imported by main entry when needed)
      // But add defer to ensure they load after React is ready
      let chunksScripts = '';
      if (chunks.length > 0) {
        chunksScripts = chunks.map(src => 
          `    <script type="module" crossorigin src="${src}" defer></script>`
        ).join('\n');
      }
      
      // Wrap main entry point to wait for React AND verify React is actually importable
      let mainEntryScript = '';
      if (mainEntry) {
        mainEntryScript = `    <!-- Main entry point - load only after import map and React are ready -->
    <script type="module">
      async function loadMainEntry() {
        // Wait for import map to be processed first
        if (!window.__IMPORT_MAP_READY__) {
          await new Promise(resolve => {
            window.addEventListener('import-map-ready', resolve, { once: true });
            setTimeout(resolve, 100); // Fallback timeout
          });
        }
        
        // Wait for React to be ready
        if (!window.__REACT_READY__) {
          await new Promise(resolve => {
            window.addEventListener('react-ready', resolve, { once: true });
            setTimeout(resolve, 5000); // Fallback timeout
          });
        }
        
        // CRITICAL: Verify that React can actually be imported via import map
        // This ensures React is available when modules try to import it
        let reactImportable = false;
        let attempts = 0;
        while (!reactImportable && attempts < 10) {
          try {
            const testReact = await import('react');
            if (testReact && (testReact.default || testReact.useContext)) {
              reactImportable = true;
              console.log('✅ React is importable via import map');
            } else {
              console.warn('⚠️ React import returned unexpected value, attempt', attempts + 1);
            }
          } catch (err) {
            console.warn('⚠️ React not importable yet, attempt', attempts + 1, ':', err.message);
          }
          if (!reactImportable) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }
        }
        
        if (!reactImportable) {
          console.error('❌ React is not importable after', attempts, 'attempts. Loading main entry anyway, but errors may occur.');
        }
        
        // Additional wait to ensure React is stable
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Now load the main entry point
        const script = document.createElement('script');
        script.type = 'module';
        script.crossOrigin = 'anonymous';
        script.src = '${mainEntry}';
        document.head.appendChild(script);
      }
      
      // Start loading when React is ready
      if (window.__REACT_READY__) {
        loadMainEntry();
      } else {
        window.addEventListener('react-ready', loadMainEntry, { once: true });
        setTimeout(() => {
          if (!window.__REACT_READY__) {
            console.warn('⚠️ React ready timeout, loading main entry anyway');
            loadMainEntry();
          }
        }, 5000);
      }
    </script>`;
      }
      
      // Insert chunks and main entry before closing head
      if (chunksScripts || mainEntryScript) {
        html = html.replace('</head>', chunksScripts + '\n' + mainEntryScript + '\n  </head>');
      }
      
      await fs.writeFile(indexPath, html, 'utf-8');
      console.log('✅ Removed problematic script tags with bare module specifiers from index.html');
      console.log('✅ Ensured main entry point loads last');
    }
    
    console.log('✅ PWA icons and robots.txt copied successfully. Glob pattern warnings resolved.');
  } catch (err) {
    console.error('❌ Error copying files:', err);
    process.exit(1);
  }
}

postBuild();
