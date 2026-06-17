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

// jsdom does not implement PointerEvent, which Base UI dispatches on pointer
// interactions (e.g. the Checkbox click handler). Polyfill it from MouseEvent so
// component interaction tests behave like a real browser.
if (typeof globalThis.PointerEvent === "undefined") {
  class PointerEvent extends MouseEvent {
    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
    }
  }
  globalThis.PointerEvent = PointerEvent as typeof globalThis.PointerEvent;
}
