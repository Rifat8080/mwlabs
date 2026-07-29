import type Lenis from "lenis";

declare global {
  interface Window { __mwLenis?: Lenis; }
}

export {};
