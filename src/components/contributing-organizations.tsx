import { ArrowUpRight } from "lucide-react";
import { contributingOrganizations } from "@/lib/contributors";
export function ContributingOrganizations() {
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
        {contributingOrganizations.map((org) => (
          <li key={org.name}>
            <a href={org.href} target="_blank" rel="noopener noreferrer">
              <span>{org.name}</span>
              <ArrowUpRight size={20} aria-hidden="true" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
