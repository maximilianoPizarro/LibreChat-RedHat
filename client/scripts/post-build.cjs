const fs = require('fs-extra');

async function postBuild() {
  try {
    await fs.copy('public/assets', 'dist/assets');
    await fs.copy('public/robots.txt', 'dist/robots.txt');
    
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
    
    console.log('✅ PWA icons and robots.txt copied successfully. Glob pattern warnings resolved.');
  } catch (err) {
    console.error('❌ Error copying files:', err);
    process.exit(1);
  }
}

postBuild();
