import { jsonLd } from "@/lib/site";
import { pageSchema } from "@/lib/page-schema";

export function PageStructuredData(props: Parameters<typeof pageSchema>[0]) {
  const data = pageSchema(props);
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd(data) }}
    />
  );
}
