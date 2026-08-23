export const authCookiePrefix = "mwlabscmd";
export const defaultPostAuthPath = "/auth/continue";

const safeAuthPathPrefixes = ["/app", "/portal", "/register", "/book"];
const internalUrlBase = "https://mwlabs.local";

function isAllowedAuthPath(pathname: string) {
  return safeAuthPathPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function safePostAuthPath(value: string | null | undefined, fallback = defaultPostAuthPath) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;

  try {
    const url = new URL(value, internalUrlBase);
    if (url.origin !== internalUrlBase || !isAllowedAuthPath(url.pathname)) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
