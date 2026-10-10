import type { Metadata } from "next";
import { Receipt } from "@/components/forms/receipt";
import { uuidPattern } from "@/lib/community/validation";
import { Action, PageIntro } from "@/components/ui";
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
  if (!id || !uuidPattern.test(id))
    return (
      <>
        <PageIntro
          eyebrow="ENVET forms"
          title="Your submission receipt"
          intro="A private record of your submitted paperwork."
          path="/forms/receipt"
        />
        <section className="wrap form-overview">
          <h2>Find your confirmation</h2>
          <p>
            Open the receipt link from your submission confirmation. If you need
            help finding a record, contact ENVET. Please do not submit a second
            form to retrieve a receipt.
          </p>
          <Action href="/contact">Contact ENVET</Action>
        </section>
      </>
    );
  return <Receipt key={id} id={id} />;
}
