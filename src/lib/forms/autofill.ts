const signerFields: Record<string, string> = {
  guestName: "section-signer name",
  ownerName: "section-signer name",
  address: "section-signer street-address",
  phone: "section-signer tel",
  email: "section-signer email",
};

export function fieldAutocomplete(key: string): string {
  // Emergency contacts, guardians and horse details are not the signer's profile.
  return signerFields[key] ?? "off";
}
