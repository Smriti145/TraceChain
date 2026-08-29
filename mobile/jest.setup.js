/* eslint-env jest */

jest.mock(
  '@react-native-async-storage/async-storage',
  () => ({
    setItem: jest.fn().mockResolvedValue(undefined),
    getItem: jest.fn().mockResolvedValue(null),
    removeItem: jest.fn().mockResolvedValue(undefined),
  }),
);

jest.mock('react-native-vision-camera', () => {
  const React = require('react');
  const {View} = require('react-native');

  return {
    Camera: props => React.createElement(View, props),
    useCameraDevice: () => ({id: 'mock-camera'}),
    useCameraPermission: () => ({
      hasPermission: true,
      requestPermission: jest.fn().mockResolvedValue(true),
    }),
  };
});

jest.mock('react-native-vision-camera-barcode-scanner', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {CodeScanner: props => React.createElement(View, props)};
});
