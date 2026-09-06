export function isLaunchEnabled(
  env: Record<string, string | undefined>,
): boolean {
  if (
    env.SITE_APPROVED_FOR_LAUNCH !== "true" ||
    env.CONTENT_AND_MEDIA_APPROVED !== "true"
  )
    return false;
  if (env.VERCEL_ENV && env.VERCEL_ENV !== "production") return false;
  try {
    const url = new URL(env.SITE_URL ?? "");
    return (
      url.protocol === "https:" &&
      url.pathname === "/" &&
      !url.search &&
      !url.hash &&
      !url.username &&
      !url.password &&
      url.hostname.includes(".") &&
      !/(localhost|\.local|\.test|\.example|\.vercel\.app)$/.test(
        url.hostname,
      ) &&
      !/^\d+(\.\d+){3}$/.test(url.hostname)
    );
  } catch {
    return false;
  }
}
export const launchEnabled = isLaunchEnabled(process.env);
export const siteUrl = launchEnabled
  ? new URL(process.env.SITE_URL!).origin
  : "http://localhost:3000";
export const absoluteUrl = (path: string) => new URL(path, siteUrl).toString();
export const organization = {
  name: "Eagle's Nest Veterans' Equine Therapy",
  shortName: "ENVET",
  description:
    "Equine therapy options for United States veterans and their families in Lovettsville, Virginia. Meet ENVET, plan a visit, or help keep the program going.",
  phone: "+1 540-504-8401",
  phoneHref: "tel:+15405048401",
  email: "envet501c3@gmail.com",
  address: "37958 Long Lane, Lovettsville, VA 20180",
  facebook: "https://www.facebook.com/profile.php?id=100068209587248",
  messenger: "https://www.facebook.com/messages/t/100068209587248/",
  whatsapp: "https://wa.me/15405048401",
  donate: "https://www.paypal.com/donate/?hosted_button_id=EK4AXP2E2WA5J",
} as const;
export const jsonLd = (data: unknown) =>
  JSON.stringify(data).replace(/</g, "\\u003c");
