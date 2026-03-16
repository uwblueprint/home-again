import type { AgencyFormValues } from "@/types/agencies";

function optionalString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  const normalized = String(value).trim();
  return normalized === "" ? null : normalized;
}

export function toAgencyPayload(
  values: Record<string, unknown>
): AgencyFormValues {
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
