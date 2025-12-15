const path = require('path');

module.exports = {
  root: path.resolve(__dirname, '..', '..'),
  uploads: path.resolve(__dirname, '..', '..', 'uploads'),
  clientPath: path.resolve(__dirname, '..', '..', 'client'),
  dist: path.resolve(__dirname, '..', '..', 'client', 'dist'),
  publicPath: path.resolve(__dirname, '..', '..', 'client', 'public'),
  // In production, fonts and assets are in dist/assets after build
  // Fallback to public for development
  fonts: path.resolve(__dirname, '..', '..', 'client', 'dist', 'assets', 'fonts'),
  assets: path.resolve(__dirname, '..', '..', 'client', 'dist', 'assets'),
  imageOutput: path.resolve(__dirname, '..', '..', 'client', 'public', 'images'),
  structuredTools: path.resolve(__dirname, '..', 'app', 'clients', 'tools', 'structured'),
  pluginManifest: path.resolve(__dirname, '..', 'app', 'clients', 'tools', 'manifest.json'),
};
