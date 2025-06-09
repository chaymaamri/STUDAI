import { useState, useEffect } from 'react';

export function useLocalState(key, defaultValue) {
  const [state, setState] = useState(() => {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}
