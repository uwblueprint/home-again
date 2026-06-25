export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^(?=(?:.*\d){7})[\d\s()+\-]{7,20}$/;
export const POSTAL_CODE_REGEX = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;

/** Domain-like URL: at least two dot-separated segments (e.g. agency.com). Protocol/www optional. */
export const AGENCY_URL_HOST_REGEX = /^[\w-]+(\.[\w-]+)+$/;

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
