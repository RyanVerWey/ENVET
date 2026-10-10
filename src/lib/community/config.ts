export type CommunityConfig = {
  url: string;
  publishableKey: string;
  origin: string;
};

export function communityConfig(): CommunityConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const origin = process.env.AUTH_REDIRECT_ORIGIN;
  if (!url || !publishableKey || !origin) return null;
  try {
    const authUrl = new URL(url);
    const redirect = new URL(origin);
    if (
      authUrl.protocol !== "https:" ||
      !authUrl.hostname.endsWith(".supabase.co") ||
      !["https:", "http:"].includes(redirect.protocol) ||
      (redirect.protocol === "http:" &&
        !["localhost", "127.0.0.1"].includes(redirect.hostname)) ||
      redirect.pathname !== "/" ||
      redirect.search ||
      redirect.hash ||
      redirect.username ||
      redirect.password
    )
      return null;
    return { url: authUrl.origin, publishableKey, origin: redirect.origin };
  } catch {
    return null;
  }
}

export function dataConfig() {
  const auth = communityConfig();
  const secret = process.env.SUPABASE_SECRET_KEY;
  const pepper = process.env.RATE_LIMIT_PEPPER;
  if (!auth || !secret || !pepper || pepper.length < 32) return null;
  return { ...auth, secret, pepper };
}

export function originMatchesConfig(
  requestOrigin: string,
  configuredOrigin: string,
) {
  if (requestOrigin === configuredOrigin) return true;
  try {
    const request = new URL(requestOrigin);
    const configured = new URL(configuredOrigin);
    return (
      request.protocol === "http:" &&
      configured.protocol === "http:" &&
      request.port === configured.port &&
      ["localhost", "127.0.0.1"].includes(request.hostname) &&
      ["localhost", "127.0.0.1"].includes(configured.hostname)
    );
  } catch {
    return false;
  }
}

export function oauthRequestOrigin(
  requestUrl: string,
  requestHost: string | null,
  configuredOrigin: string,
): string | null {
  const requestOrigin = new URL(requestUrl).origin;
  if (!originMatchesConfig(requestOrigin, configuredOrigin)) return null;
  if (!configuredOrigin.startsWith("http:")) return requestOrigin;
  // NextRequest normalizes loopback URLs. Host preserves the browser's cookie
  // hostname; accept only the configured port and the two local aliases.
  if (!requestHost) return configuredOrigin;
  try {
    const local = new URL(`http://${requestHost}`);
    return local.host === requestHost &&
      originMatchesConfig(local.origin, configuredOrigin)
      ? local.origin
      : null;
  } catch {
    return null;
  }
}
