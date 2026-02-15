export const getLocalStorageObjProperty = (
  key: string,
  property: string,
): string => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return "";
    const obj = JSON.parse(raw);
    if (!obj) return "";
    const val = obj[property];
    return val !== undefined && val !== null ? String(val) : "";
  } catch (e) {
    return "";
  }
};
