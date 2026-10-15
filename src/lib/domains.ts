/** Public, explicit host split. No suffix matching or shared auth cookies. */
export const primaryOrigin = "https://envet.org";
const expectedPortalOrigin = "https://portal.envet.org";

export function portalOrigin() {
  return process.env.NEXT_PUBLIC_PORTAL_URL === expectedPortalOrigin
    ? expectedPortalOrigin
    : null;
}

export function managementUrl(path = "/team") {
  const portal = portalOrigin();
  return portal ? new URL(path, portal).toString() : path;
}

const inside = (path: string, prefix: string) =>
  path === prefix || path.startsWith(`${prefix}/`);

export function isPrivateRoute(path: string) {
  return ["/account", "/team", "/forms", "/auth", "/api"].some((prefix) =>
    inside(path, prefix),
  );
}

/** Routing only: authorization stays in each server page/API and RLS. */
export function domainDestination(requestUrl: string): string | null {
  const portal = portalOrigin();
  if (!portal) return null;
  const request = new URL(requestUrl);
  const path = request.pathname;
  let destination: URL | null = null;
  if (request.origin === primaryOrigin && inside(path, "/team")) {
    destination = new URL(portal);
  } else if (request.origin === portal) {
    if (path === "/") {
      destination = new URL("/team", portal);
    } else if (
      !["/team", "/account", "/auth", "/api", "/_next", "/images"].some(
        (prefix) => inside(path, prefix),
      ) &&
      path !== "/robots.txt" &&
      path !== "/icon.svg" &&
      path !== "/favicon.ico"
    ) {
      destination = new URL(primaryOrigin);
    }
  }
  if (!destination) return null;
  // Assign the path instead of resolving it, so //evil cannot change hosts.
  if (path !== "/") destination.pathname = path;
  destination.search = request.search;
  // Navigation redirects never transport credentials between hosts. OAuth's
  // callback is deliberately excluded above and exchanges its code in place.
  const credentials = new Set([
    "code",
    "access_token",
    "refresh_token",
    "id_token",
    "token",
    "token_hash",
    "provider_token",
    "provider_refresh_token",
  ]);
  for (const key of [...destination.searchParams.keys()])
    if (credentials.has(key.toLowerCase()))
      destination.searchParams.delete(key);
  return destination.toString();
}
