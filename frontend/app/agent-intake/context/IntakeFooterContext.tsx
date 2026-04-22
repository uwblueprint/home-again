"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

type SubmitHandler = () => Promise<void> | void;

interface IntakeFooterState {
  isSubmitting: boolean;
  submitError: string | null;
  isSubmitDisabled: boolean;
}

interface IntakeFooterContextValue {
  footerState: IntakeFooterState;
  setFooterState: (nextState: Partial<IntakeFooterState>) => void;
  setSubmitHandler: (handler: SubmitHandler | null) => void;
  runSubmitHandler: () => Promise<void>;
  hasSubmitHandler: boolean;
  resetFooterState: () => void;
}

const defaultFooterState: IntakeFooterState = {
  isSubmitting: false,
  submitError: null,
  isSubmitDisabled: false,
};

const IntakeFooterContext = createContext<IntakeFooterContextValue | null>(
  null
);

export function IntakeFooterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const submitHandlerRef = useRef<SubmitHandler | null>(null);
  const [hasSubmitHandler, setHasSubmitHandler] = useState(false);
  const [footerState, setFooterStateValue] =
    useState<IntakeFooterState>(defaultFooterState);

  const setFooterState = useCallback(
    (nextState: Partial<IntakeFooterState>) => {
      setFooterStateValue((current) => {
        const nextValue = { ...current, ...nextState };

        if (
          current.isSubmitting === nextValue.isSubmitting &&
          current.submitError === nextValue.submitError &&
          current.isSubmitDisabled === nextValue.isSubmitDisabled
        ) {
          return current;
        }

        return nextValue;
      });
    },
    []
  );

  const setSubmitHandler = useCallback((handler: SubmitHandler | null) => {
    submitHandlerRef.current = handler;
    setHasSubmitHandler(handler !== null);
  }, []);

  const runSubmitHandler = useCallback(async () => {
    await submitHandlerRef.current?.();
  }, []);

  const resetFooterState = useCallback(() => {
    submitHandlerRef.current = null;
    setHasSubmitHandler(false);
    setFooterStateValue(defaultFooterState);
  }, []);

  const value = useMemo(
    () => ({
      footerState,
      setFooterState,
      setSubmitHandler,
      runSubmitHandler,
      hasSubmitHandler,
      resetFooterState,
    }),
    [
      footerState,
      hasSubmitHandler,
      resetFooterState,
      runSubmitHandler,
      setFooterState,
      setSubmitHandler,
    ]
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
