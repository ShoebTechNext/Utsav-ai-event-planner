import "@testing-library/jest-dom/vitest";

// Mock matchMedia for jsdom
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock window.scrollTo
window.scrollTo = () => {};

// Mock window.print
window.print = () => {};

// Mock scrollIntoView for jsdom
if (typeof Element !== "undefined") {
  Element.prototype.scrollIntoView = () => {};
}

// Mock Canvas 2D context for jsdom
if (typeof HTMLCanvasElement !== "undefined") {
  HTMLCanvasElement.prototype.getContext = (() => ({
    clearRect: () => {},
    fillRect: () => {},
    save: () => {},
    restore: () => {},
    translate: () => {},
    rotate: () => {},
  })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
}
