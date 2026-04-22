import "@testing-library/jest-dom";
import { randomUUID } from "crypto";

Object.defineProperty(globalThis.crypto, "randomUUID", {
  value: randomUUID,
  writable: true,
  configurable: true,
});

global.crypto = {
  ...global.crypto,
  randomUUID: randomUUID,
} as Crypto;
