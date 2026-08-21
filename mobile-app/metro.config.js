const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Firebase JS SDK's package.json "exports" map doesn't route React Native
// through it correctly (see firebase/firebase-js-sdk#12938) — with Metro's
// default package-exports resolution (on since Expo SDK 50), this loads a
// mismatched internal copy of the Auth module and throws "Component auth
// has not been registered yet" at runtime. Disabling exports resolution
// falls back to Metro's older main-field resolution, which works correctly.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
