module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native(-community)?|@react-navigation|react-redux|redux-persist)/',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
