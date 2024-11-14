module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    '/node_modules/(?!react-native-vector-icons|react-native-share|react-native-fs|react-native-image-crop-picker|@react-navigation/material-bottom-tabs)/',
  ],
  setupFilesAfterEnv: ['./setupTests.js'],
  coveragePathIgnorePatterns: ['./src/countryTypes.ts', './src/assets/*.*'],
};
