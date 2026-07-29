import { create } from "zustand";

export type MaterialTarget = "chrome" | "glass" | "steel" | "ceramic";

type ScrollStore = {
  progressRef: { current: number };
  pointerRef: { current: { x: number; y: number } };
  morphRef: { current: number };
  materialRef: { current: MaterialTarget };
};

export const useScrollStore = create<ScrollStore>(() => ({
  progressRef: { current: 0 },
  pointerRef: { current: { x: 0, y: 0 } },
  morphRef: { current: 0 },
  materialRef: { current: "chrome" }
}));
