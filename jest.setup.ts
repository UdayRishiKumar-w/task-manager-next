import "@testing-library/jest-dom";
import { toHaveNoViolations } from "jest-axe";
import { TextDecoder, TextEncoder } from "node:util";

expect.extend(toHaveNoViolations);

if (globalThis.TextEncoder === undefined) {
  globalThis.TextEncoder = TextEncoder as typeof globalThis.TextEncoder;
  globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;
}

// Polyfill Pointer Events API for Radix UI components in jsdom
if (globalThis.window !== undefined) {
  if (!globalThis.Element.prototype.hasPointerCapture) {
    globalThis.Element.prototype.hasPointerCapture = () => false;
  }
  if (!globalThis.Element.prototype.setPointerCapture) {
    globalThis.Element.prototype.setPointerCapture = () => undefined;
  }
  if (!globalThis.Element.prototype.releasePointerCapture) {
    globalThis.Element.prototype.releasePointerCapture = () => undefined;
  }
  if (!globalThis.Element.prototype.scrollIntoView) {
    globalThis.Element.prototype.scrollIntoView = function () {};
  }
}
