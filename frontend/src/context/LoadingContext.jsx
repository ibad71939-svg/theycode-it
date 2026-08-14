import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { registerLoadingHandlers } from '../lib/api';

const LoadingContext = createContext(null);

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  // Count in-flight requests instead of a plain boolean so that overlapping
  // calls (e.g. two api.get()s firing on the same page) don't hide the
  // spinner as soon as the first one finishes.
  const inFlightCount = useRef(0);

  const startLoading = useCallback(() => {
    inFlightCount.current += 1;
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    inFlightCount.current = Math.max(0, inFlightCount.current - 1);
    if (inFlightCount.current === 0) setIsLoading(false);
  }, []);

  // Every request made through lib/api.js (public, student, admin — all of
  // them) reports here automatically, so the spinner shows on every page
  // without each page having to manage its own loading state.
  useEffect(() => {
    registerLoadingHandlers(startLoading, stopLoading);
    return () => registerLoadingHandlers(null, null);
  }, [startLoading, stopLoading]);

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
}
