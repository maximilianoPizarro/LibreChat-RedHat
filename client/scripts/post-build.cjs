const fs = require('fs-extra');
const path = require('path');

async function postBuild() {
  try {
    await fs.copy('public/assets', 'dist/assets');
    await fs.copy('public/robots.txt', 'dist/robots.txt');
    
    // Copy @librechat/client package to dist for import map resolution
    const clientPackagePath = path.resolve(__dirname, '../../packages/client/dist');
    const distClientPath = path.resolve(__dirname, '../dist/@librechat/client');
    
    if (await fs.pathExists(clientPackagePath)) {
      await fs.ensureDir(distClientPath);
      await fs.copy(clientPackagePath, distClientPath, {
        overwrite: true,
      });
      console.log('✅ @librechat/client package copied to dist/@librechat/client/');
    } else {
      console.warn('⚠️  Warning: @librechat/client package not found at', clientPackagePath);
      console.warn('   Make sure to run: npm run build:client-package');
    }
    
    console.log('✅ PWA icons and robots.txt copied successfully. Glob pattern warnings resolved.');
  } catch (err) {
    console.error('❌ Error copying files:', err);
    process.exit(1);
  }
}

postBuild();