// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ampio 'JPG' ho an'ny sary.
// Natao amin'ny sora-baventy, satria ny anaran'ny sary dia 'IMG_4214.JPG'.
config.resolver.assetExts.push(
  'JPG' 
);

module.exports = config;