import '@testing-library/jest-dom';
import { randomUUID } from 'crypto';

// jsdom does not implement crypto.randomUUID — polyfill from Node's built-in crypto module
Object.defineProperty(globalThis.crypto, 'randomUUID', {
  value: randomUUID,
  writable: true,
  configurable: true,
});
