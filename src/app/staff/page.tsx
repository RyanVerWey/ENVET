import type { Metadata } from "next";
import { Breadcrumbs, Photo, Action } from "@/components/ui";
import { AnimalRoster } from "@/components/animal-roster";
import { publishedAnimals } from "@/lib/community/public-animals";
import { pageMetadata } from "@/lib/seo";
export const dynamic = "force-dynamic";
export const metadata: Metadata = pageMetadata(
  "Meet the Staff: Horse Heroes, Dogs & Cats",
  "Meet ENVET’s animal staff: Horse Heroes, dogs and cats with personalities and stories of their own. Arrange a visit in Lovettsville, Virginia.",
  "/staff",
);
export default async function StaffPage() {
  const { animals, unavailable } = await publishedAnimals();
  return (
    <>
      <section className="wrap animal-hero">
        <div>
          <Breadcrumbs items={[{ label: "Meet the Staff", href: "/staff" }]} />
          <p className="eyebrow">FOUR LEGS. PLENTY OF CHARACTER.</p>
          <h1>
            Meet the staff.
            <br />
            <span>The other kind.</span>
          </h1>
          <p className="lead">
            Horse Heroes, dogs and cats. Get to know the personalities that make
            Eagle’s Nest feel like Eagle’s Nest.
          </p>
          <Action href="/visit">Plan your introduction</Action>
        </div>
        <figure>
          <Photo
            src="/images/horse.jpg"
            alt="A horse at Eagle’s Nest in Lovettsville, Virginia"
            priority
          />
          <figcaption>
            Not your usual coworkers. Our kind of company.
          </figcaption>
        </figure>
      </section>
      {unavailable ? (
        <section className="wrap animal-empty">
          <h2>Come meet us at the farm.</h2>
          <p>
            Profiles could not load right now. Contact ENVET to learn about the
            animals and arrange your visit.
          </p>
          <Action href="/contact">Talk with the team</Action>
        </section>
      ) : (
        <AnimalRoster animals={animals} />
      )}
      <section className="wrap animal-visit-note">
        <p className="eyebrow">A HELLO, NOT A RESERVATION</p>
        <h2>Let us make the introductions.</h2>
        <p>
          Every animal has their own pace. ENVET confirms which activities and
          introductions are suitable for your visit. A profile is not a promise
          of riding, handling or availability.
        </p>
        <Action href="/contact" secondary>
          Ask the team
        </Action>
      </section>
    </>
  );
}
