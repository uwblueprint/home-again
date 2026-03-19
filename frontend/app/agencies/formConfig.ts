import { Agency } from "@/types";
import { ResourceFormField } from "@/components/forms/ResourceForm";

export type AgencyFormValues = Omit<Agency, "id" | "created_at" | "updated_at">;

export const agencyFields: ResourceFormField[] = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "email", label: "Email", type: "text", required: true },
  { name: "phone", label: "Phone", type: "text", required: true },
  { name: "address", label: "Address", type: "text", required: true },
  { name: "city", label: "City", type: "text", required: true },
  { name: "province", label: "Province", type: "text", required: true },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Optional",
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Unprocessed", value: "unprocessed" },
      { label: "Approved", value: "approved" },
      { label: "Deactivated", value: "deactivated" },
    ],
  },
  {
    name: "require_pre_payment",
    label: "Require pre-payment",
    type: "checkbox",
    placeholder: "Require pre-payment",
  },
  {
    name: "billing_profiles",
    label: "Billing profiles (JSON string)",
    type: "textarea",
    placeholder: "Optional",
  },
];

export const defaultAgencyValues: AgencyFormValues = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  province: "",
  description: null,
  status: null,
  require_pre_payment: false,
  billing_profiles: null,
};

function optionalString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  const normalized = String(value).trim();
  return normalized === "" ? null : normalized;
}

export function toAgencyPayload(values: Record<string, unknown>): AgencyFormValues {
  return {
    name: String(values.name ?? "").trim(),
    email: String(values.email ?? "").trim(),
    phone: String(values.phone ?? "").trim(),
    address: String(values.address ?? "").trim(),
    city: String(values.city ?? "").trim(),
    province: String(values.province ?? "").trim(),
    description: optionalString(values.description),
    status: optionalString(values.status),
    require_pre_payment: Boolean(values.require_pre_payment),
    billing_profiles: optionalString(values.billing_profiles),
  };
}
