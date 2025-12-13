const path = require('path');
const express = require('express');
const expressStaticGzip = require('express-static-gzip');

const oneDayInSeconds = 24 * 60 * 60;

const sMaxAge = process.env.STATIC_CACHE_S_MAX_AGE || oneDayInSeconds;
const maxAge = process.env.STATIC_CACHE_MAX_AGE || oneDayInSeconds * 2;

/**
 * Creates an Express static middleware with optional gzip compression and configurable caching
 *
 * @param {string} staticPath - The file system path to serve static files from
 * @param {Object} [options={}] - Configuration options
 * @param {boolean} [options.noCache=false] - If true, disables caching entirely for all files
 * @param {boolean} [options.skipGzipScan=false] - If true, skips expressStaticGzip middleware
 * @returns {ReturnType<expressStaticGzip>|ReturnType<express.static>} Express middleware function for serving static files
 */
function staticCache(staticPath, options = {}) {
  const { noCache = false, skipGzipScan = false } = options;

  const setHeaders = (res, filePath) => {
    // Set correct MIME types for JavaScript modules - CRITICAL for ES modules
    // This MUST be set in ALL environments, not just production
    if (filePath) {
      const ext = path.extname(filePath).toLowerCase();
      // Always set MIME type for JavaScript files (including modules)
      if (ext === '.js' || ext === '.mjs' || ext === '.jsx') {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (ext === '.css') {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      } else if (ext === '.json') {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
      } else if (ext === '.png') {
        res.setHeader('Content-Type', 'image/png');
      } else if (ext === '.jpg' || ext === '.jpeg') {
        res.setHeader('Content-Type', 'image/jpeg');
      } else if (ext === '.svg') {
        res.setHeader('Content-Type', 'image/svg+xml');
      } else if (ext === '.ico') {
        res.setHeader('Content-Type', 'image/x-icon');
      } else if (ext === '.woff' || ext === '.woff2') {
        res.setHeader('Content-Type', `font/${ext === 'woff2' ? 'woff2' : 'woff'}`);
      } else if (ext === '.ttf') {
        res.setHeader('Content-Type', 'font/ttf');
      } else if (ext === '.eot') {
        res.setHeader('Content-Type', 'application/vnd.ms-fontobject');
      }
    }

    // Cache headers only apply in production
    if (process.env.NODE_ENV?.toLowerCase() !== 'production') {
      return;
    }
    if (noCache) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      return;
    }
    if (filePath && filePath.includes('/dist/images/')) {
      return;
    }
    const fileName = filePath ? path.basename(filePath) : '';

    if (
      fileName === 'index.html' ||
      fileName.endsWith('.webmanifest') ||
      fileName === 'manifest.json' ||
      fileName === 'sw.js'
    ) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    } else {
      res.setHeader('Cache-Control', `public, max-age=${maxAge}, s-maxage=${sMaxAge}`);
    }
  };

  if (skipGzipScan) {
    return express.static(staticPath, {
      setHeaders,
      index: false,
    });
  } else {
    return expressStaticGzip(staticPath, {
      enableBrotli: false,
      orderPreference: ['gz'],
      setHeaders,
      index: false,
    });
  }
}

module.exports = staticCache;
