export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^(?=(?:.*\d){7})[\d\s()+\-]{7,20}$/;
export const POSTAL_CODE_REGEX = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;

/** Domain-like URL: at least two dot-separated segments (e.g. agency.com). Protocol/www optional. */
export const AGENCY_URL_HOST_REGEX = /^[\w-]+(\.[\w-]+)+$/;

export type DonorContactField = "first_name" | "last_name" | "email" | "phone";
export type DonorContact = Record<DonorContactField, string>;
export type DonorContactErrors = Partial<Record<DonorContactField, string>>;

/**
 * Validates a donor's contact details, returning an error message per invalid
 * field (empty object when valid). Only the fields passed in are checked, so a
 * caller can skip one it doesn't let the user edit (e.g. a locked email).
 */
export function validateDonorContact(
  contact: Partial<DonorContact>
): DonorContactErrors {
  const errors: DonorContactErrors = {};
  const { first_name, last_name, email, phone } = contact;

  if (first_name !== undefined && !first_name.trim()) {
    errors.first_name = "Enter a first name.";
  }
  if (last_name !== undefined && !last_name.trim()) {
    errors.last_name = "Enter a last name.";
  }
  if (email !== undefined) {
    if (!email.trim()) errors.email = "Enter an email address.";
    else if (!EMAIL_REGEX.test(email.trim())) {
      errors.email = "Enter a valid email address.";
    }
  }
  if (phone !== undefined) {
    if (!phone.trim()) errors.phone = "Enter a phone number.";
    else if (!PHONE_REGEX.test(phone.trim())) {
      errors.phone = "Enter a valid phone number.";
    }
  }

  return errors;
}

export function formatReviewPhoneNumber(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (/^(\(\+1\)|\+1)\s*/.test(trimmed)) {
    return trimmed;
  }

  return `(+1) ${trimmed}`;
}

export function isValidAgencyUrl(value: string): boolean {
  let host = value.trim();
  if (!host) {
    return false;
  }

  host = host.replace(/^https?:\/\//i, "");
  host = host.replace(/^www\./i, "");
  host = host.split(/[/?#]/)[0];

  return AGENCY_URL_HOST_REGEX.test(host);
}
