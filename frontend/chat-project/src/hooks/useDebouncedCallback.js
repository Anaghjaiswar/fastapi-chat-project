// hooks/useDebouncedCallback.js
import { useRef, useCallback } from "react";

export default function useDebouncedCallback(fn, delay) {
  const timer = useRef(null);

  return useCallback((...args) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
}
