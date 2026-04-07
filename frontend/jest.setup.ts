import '@testing-library/jest-dom';

// jsdom does not implement crypto.randomUUID — polyfill from Node's built-in crypto module
Object.defineProperty(globalThis.crypto, 'randomUUID', {
  value: () => require('crypto').randomUUID() as string,
  writable: true,
  configurable: true,
});
