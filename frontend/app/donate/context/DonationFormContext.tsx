"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

// Types

export const FURNITURE_TYPES = [
  "Dining table & chairs /sets",
  "Dresser",
  "Coffee table",
  "Side/end table",
  "Desk",
  "Lamp",
  "TV stand",
  "Bed frames",
  "Bookshelf",
  "Sofa",
  "Plush chair",
  "Loveseat",
  "Mattress",
  "Boxspring",
] as const;

export type FurnitureType = (typeof FURNITURE_TYPES)[number];

export interface FurnitureItemData {
  id: string;
  furnitureType: FurnitureType | null;
  hasStains: boolean | null;
  photos: File[];
}

export interface PickupAddress {
  streetAddress: string;
  apartment: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
}

const DEFAULT_PICKUP_ADDRESS: PickupAddress = {
  streetAddress: "",
  apartment: "",
  city: "",
  province: "Newfoundland and Labrador",
  country: "Canada",
  postalCode: "",
};

export interface DonationFormState {
  donorId: string | null;
  pickupDate: string | null;
  pickupAddress: PickupAddress;
  smokingInHousehold: boolean | null;
  petsInHousehold: boolean | null;
  feeAgreement: boolean;
  items: FurnitureItemData[];
  pickupSubmitAttempted: boolean;
}

interface DonationFormContextType {
  formState: DonationFormState;
  setFormState: React.Dispatch<React.SetStateAction<DonationFormState>>;
  addItem: () => void;
  deleteItem: (id: string) => void;
  updateItem: (
    id: string,
    patch: Partial<Omit<FurnitureItemData, "id">>
  ) => void;
  submitAttempted: boolean;
  setSubmitAttempted: React.Dispatch<React.SetStateAction<boolean>>;
}

// Helpers

function createItem(): FurnitureItemData {
  return {
    id: crypto.randomUUID(),
    furnitureType: null,
    hasStains: null,
    photos: [],
  };
}

export function validateItems(items: FurnitureItemData[]): boolean {
  // Photos are optional; only furniture type and stains status are required.
  return items.every(
    (item) => item.furnitureType !== null && item.hasStains !== null
  );
}

// Context

const DonationFormContext = createContext<DonationFormContextType | null>(null);

interface DonationFormProviderProps {
  children: React.ReactNode;
  initialDonorId?: string | null;
}

export function DonationFormProvider({
  children,
  initialDonorId = null,
}: DonationFormProviderProps) {
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [formState, setFormState] = useState<DonationFormState>(() => ({
    donorId: initialDonorId,
    pickupDate: null,
    pickupAddress: DEFAULT_PICKUP_ADDRESS,
    smokingInHousehold: null,
    petsInHousehold: null,
    feeAgreement: false,
    items: [
      { id: "item-initial", furnitureType: null, hasStains: null, photos: [] },
    ],
    pickupSubmitAttempted: false,
  }));
  const addItem = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      items: [...prev.items, createItem()],
    }));
  }, []);

  const deleteItem = useCallback((id: string) => {
    setFormState((prev) => {
      if (prev.items.length <= 1) return prev;
      return { ...prev, items: prev.items.filter((item) => item.id !== id) };
    });
  }, []);

  const updateItem = useCallback(
    (id: string, patch: Partial<Omit<FurnitureItemData, "id">>) => {
      setFormState((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === id ? { ...item, ...patch } : item
        ),
      }));
    },
    []
  );

  const contextValue = useMemo(
    () => ({
      formState,
      setFormState,
      addItem,
      deleteItem,
      updateItem,
      submitAttempted,
      setSubmitAttempted,
    }),
    [formState, addItem, deleteItem, updateItem, submitAttempted]
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
