const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for serving files from public/ directory for web
config.resolver.assetExts.push('json');

module.exports = config;
