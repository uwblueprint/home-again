/**
 * Common Types
 *
 * Core data types shared across the application.
 * These should match the FastAPI backend schemas exactly.
 */

export interface Agency {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  createdAt: string;
  updatedAt: string;
}

export interface Donor {
  id: string;
  name: string;
  email: string;
  phone: string;
  itemsDonated: number;
  lastDonationDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  agencyId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  condition: "excellent" | "good" | "fair" | "poor";
  donorId: string;
  dateReceived: string;
  createdAt: string;
  updatedAt: string;
}

export interface Referral {
  id: string;
  clientId: string;
  agencyId: string;
  status: "pending" | "approved" | "completed" | "declined";
  requestedItems: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Delivery {
  id: string;
  referralId: string;
  deliveryDate: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
