// Metro configuration for React Native
// This fixes compatibility issues between Expo SDK 53 and Supabase

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Special configuration to make Supabase work with Expo SDK 53
config.resolver.unstable_conditionNames = [
  'react-native',
  'browser',
  'require',
];

module.exports = config;
