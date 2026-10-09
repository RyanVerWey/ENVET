import type { Metadata } from "next";
import { Receipt } from "@/components/forms/receipt";
import { uuidPattern } from "@/lib/community/validation";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Your private submission receipt",
  robots: { index: false, follow: false },
};
export default async function ReceiptPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  return <Receipt key={id} id={id && uuidPattern.test(id) ? id : "invalid"} />;
}
