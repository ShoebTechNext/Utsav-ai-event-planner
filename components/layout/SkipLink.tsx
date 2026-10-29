import React from "react";

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-saffron-500 focus:text-plum-950 focus:font-semibold focus:rounded-md focus:shadow-elevation-3 focus:outline-none focus:ring-2 focus:ring-plum-900"
    >
      Skip to main celebration content
    </a>
  );
}

