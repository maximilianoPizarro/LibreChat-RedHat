const fs = require('fs-extra');
const path = require('path');

async function postBuild() {
  try {
    // Copy public assets
    await fs.copy('public/assets', 'dist/assets');
    await fs.copy('public/robots.txt', 'dist/robots.txt');
    console.log('✅ PWA icons and robots.txt copied successfully. Glob pattern warnings resolved.');
    
    // Copy @librechat/client to dist/assets/@librechat/client
    const sourceDir = path.resolve(__dirname, '../../packages/client/dist');
    const targetDir = path.resolve(__dirname, '../dist/assets/@librechat/client');
    
    if (await fs.pathExists(sourceDir)) {
      await fs.ensureDir(targetDir);
      await fs.copy(sourceDir, targetDir, {
        overwrite: true,
        filter: (src) => {
          // Copy all files except source maps in production
          if (process.env.NODE_ENV === 'production' && src.endsWith('.map')) {
            return false;
          }
          return true;
        },
      });
      console.log('✅ Copied @librechat/client to dist/assets/@librechat/client');
    } else {
      console.warn('⚠️  @librechat/client dist directory not found at:', sourceDir);
      console.warn('   Make sure to run: npm run build:client-package first');
    }
  } catch (err) {
    console.error('❌ Error copying files:', err);
    process.exit(1);
  }
}

postBuild();