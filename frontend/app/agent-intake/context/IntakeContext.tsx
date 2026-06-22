"use client";

/**
 * IntakeContext
 *
 * Allows individual intake step components to register a `validateStep`
 * callback that IntakeLayout calls before advancing to the next step.
 * If the callback returns false, navigation is blocked.
 */

import React, { createContext, useCallback, useContext, useRef } from "react";

type ValidateFn = () => boolean | Promise<boolean>;

interface IntakeContextValue {
  registerValidator: (fn: ValidateFn | null) => void;
  runValidator: () => Promise<boolean>;
}

const IntakeContext = createContext<IntakeContextValue>({
  registerValidator: () => {},
  runValidator: async () => true,
});

export function IntakeProvider({ children }: { children: React.ReactNode }) {
  const validatorRef = useRef<ValidateFn | null>(null);

  const registerValidator = useCallback((fn: ValidateFn | null) => {
    validatorRef.current = fn;
  }, []);

  const runValidator = useCallback(async (): Promise<boolean> => {
    if (!validatorRef.current) return true;
    return validatorRef.current();
  }, []);

  return (
    <IntakeContext.Provider value={{ registerValidator, runValidator }}>
      {children}
    </IntakeContext.Provider>
  );
}

export function useIntakeContext() {
  return useContext(IntakeContext);
}
