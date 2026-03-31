"use client";

import React, { createContext, useContext, useState } from "react";

interface DonationFormState {
  pickupDate: string | null;
}

interface DonationFormContextType {
  formState: DonationFormState;
  setFormState: React.Dispatch<React.SetStateAction<DonationFormState>>;
}

const DonationFormContext = createContext<DonationFormContextType | null>(null);


export function DonationFormProvider({ children }: { children: React.ReactNode }) {
  const [formState, setFormState] = useState<DonationFormState>({
    pickupDate: null,
  });

  return (
    <DonationFormContext.Provider value={{ formState, setFormState }}>
      {children}
    </DonationFormContext.Provider>
  );
}

export function useDonationForm() {
  const context = useContext(DonationFormContext);
  if (!context) throw new Error("Must be used inside DonationFormProvider");
  return context;
}
