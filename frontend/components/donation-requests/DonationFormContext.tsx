"use client";

import React, { createContext, useContext, useState } from "react";

interface DonationFormState {
  pickupDate: string | null;
}

interface DonationFormContextType {
  formState: DonationFormState;
}

const DonationFormContext = createContext<DonationFormContextType | null>(null);


export function DonationFormProvider({ children }: { children: React.ReactNode }) {
  const [formState] = useState<DonationFormState>({
    pickupDate: null,
  });

  return (
    <DonationFormContext.Provider value={{ formState }}>
      {children}
    </DonationFormContext.Provider>
  );
}

export function useDonationForm() {
  const context = useContext(DonationFormContext);
  if (!context) throw new Error("Must be used inside DonationFormProvider");
  return context;
}
