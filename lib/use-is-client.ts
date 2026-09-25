"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False during server rendering and hydration, true afterwards. Used for values
 * that depend on the viewer's timezone: the server (UTC on Vercel) cannot know it,
 * so rendering them there would show the wrong local time.
 */
export function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
