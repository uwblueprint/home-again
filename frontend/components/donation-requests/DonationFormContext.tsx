"use client";

import React, { createContext, useContext, useState, useMemo } from "react";

interface DonationFormState {
  donorId: string | null;
  pickupDate: string | null;
}

interface DonationFormContextType {
  formState: DonationFormState;
  setFormState: React.Dispatch<React.SetStateAction<DonationFormState>>;
}

const DonationFormContext = createContext<DonationFormContextType | null>(null);

interface DonationFormProviderProps {
  children: React.ReactNode;
  initialDonorId?: string | null;
}

export function DonationFormProvider({
  children,
  initialDonorId = null,
}: DonationFormProviderProps) {
  const [formState, setFormState] = useState<DonationFormState>({
    donorId: initialDonorId,
    pickupDate: null,
  });

  const contextValue = useMemo(
    () => ({ formState, setFormState }),
    [formState]
  );

  return (
    <DonationFormContext.Provider value={contextValue}>
      {children}
    </DonationFormContext.Provider>
  );
}

export function useDonationForm() {
  const context = useContext(DonationFormContext);
  if (!context) throw new Error("Must be used inside DonationFormProvider");
  return context;
}
