import type { AgencyFormValues } from "@/types/agencies";
import type { ResourceFormField } from "@/types/forms";

export const agencyFormFields: ResourceFormField[] = [
  { name: "name", label: "Name", type: "text", required: true },
  {
    name: "email",
    label: "Email",
    type: "text",
    inputType: "email",
    required: true,
  },
  {
    name: "phone",
    label: "Phone",
    type: "text",
    inputType: "tel",
    required: true,
  },
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

export const defaultAgencyFormValues: AgencyFormValues = {
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
