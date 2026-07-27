"use client";
import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [stored, setStored] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) setStored(JSON.parse(item));
    } catch {
      // ignore
    }
  }, [key]);

  const setValue = (value: T | ((prev: T) => T)) => {
    setStored((prev) => {
      const next = typeof value === "function" ? (value as (p: T) => T)(prev) : value;
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  return [stored, setValue] as const;
}
