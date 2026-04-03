"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type SubmitHandler = () => Promise<void> | void;

interface IntakeFooterState {
  submitHandler: SubmitHandler | null;
  isSubmitting: boolean;
  submitError: string | null;
  isSubmitDisabled: boolean;
}

interface IntakeFooterContextValue {
  footerState: IntakeFooterState;
  setFooterState: (nextState: Partial<IntakeFooterState>) => void;
  resetFooterState: () => void;
}

const defaultFooterState: IntakeFooterState = {
  submitHandler: null,
  isSubmitting: false,
  submitError: null,
  isSubmitDisabled: false,
};

const IntakeFooterContext = createContext<IntakeFooterContextValue | null>(null);

export function IntakeFooterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [footerState, setFooterStateValue] =
    useState<IntakeFooterState>(defaultFooterState);

  const setFooterState = useCallback((nextState: Partial<IntakeFooterState>) => {
    setFooterStateValue((current) => ({ ...current, ...nextState }));
  }, []);

  const resetFooterState = useCallback(() => {
    setFooterStateValue(defaultFooterState);
  }, []);

  const value = useMemo(
    () => ({
      footerState,
      setFooterState,
      resetFooterState,
    }),
    [footerState, resetFooterState, setFooterState]
  );

  return (
    <IntakeFooterContext.Provider value={value}>
      {children}
    </IntakeFooterContext.Provider>
  );
}

export function useIntakeFooter() {
  const context = useContext(IntakeFooterContext);

  if (!context) {
    throw new Error("useIntakeFooter must be used within IntakeFooterProvider");
  }

  return context;
}
