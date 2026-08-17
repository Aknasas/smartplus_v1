module.exports = {
  preset: 'react-native',
  setupFiles: [
    '@react-native-async-storage/async-storage/jest/async-storage-mock',
  ],
  moduleNameMapper: {
    '^@react-native-async-storage/async-storage$': '@react-native-async-storage/async-storage/jest/async-storage-mock',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-redux|@reduxjs|immer|@react-native-community|@react-native-firebase|@react-native-async-storage|react-native-vector-icons|@react-native-safe-area-context|react-native-gesture-handler|react-native-reanimated|react-native-svg)/)',
  ],
};
