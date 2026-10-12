import { ArrowUpRight } from "lucide-react";
import type { PublicOrganization } from "@/lib/community/organizations";
export function ContributingOrganizations({
  organizations,
}: {
  organizations: PublicOrganization[];
}) {
  return (
    <section
      className="wrap contributing-organizations"
      id="contributing-organizations"
      aria-labelledby="contributors-heading"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">THANK YOU FOR STANDING WITH US</p>
          <h2 id="contributors-heading">Contributing Organizations</h2>
        </div>
        <p>
          Contributions take many forms, not only financial gifts. We value the
          knowledge, resources and support that strengthen the equine community.
        </p>
      </div>
      <ul className="contributor-list">
        {organizations.map((org) => (
          <li key={org.slug}>
            {org.href ? (
              <a href={org.href} target="_blank" rel="noopener noreferrer">
                <span>{org.name}</span>
                <ArrowUpRight size={20} aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              <span className="contributor-name">{org.name}</span>
            )}
            {org.description && (
              <p className="contributor-description">{org.description}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
