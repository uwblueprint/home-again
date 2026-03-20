import type { Agency, ResourceDetailField } from "@/types";

export const agencyDetailFields: ResourceDetailField<Agency>[] = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "address", label: "Address" },
  { key: "city", label: "City" },
  { key: "province", label: "Province" },
  { key: "description", label: "Description", emptyValue: "No description" },
  { key: "status", label: "Status", emptyValue: "Unknown" },
  { key: "require_pre_payment", label: "Require Pre-payment" },
  {
    key: "billing_profiles",
    label: "Billing Profiles",
    emptyValue: "None",
    render: (value) => (Array.isArray(value) ? `${value.length} profile(s)` : "-"),
  },
  {
    key: "created_at",
    label: "Created",
    render: (value) => new Date(String(value)).toLocaleString(),
  },
  {
    key: "updated_at",
    label: "Updated",
    render: (value) => new Date(String(value)).toLocaleString(),
  },
];
