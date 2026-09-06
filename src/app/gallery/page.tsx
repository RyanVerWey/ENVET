import { Action, PageIntro, Photo } from "@/components/ui";
import { organization } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "Life at the farm",
  "A look at Eagle’s Nest in Lovettsville, Virginia, through photographs shared by ENVET’s official Facebook page.",
  "/gallery",
);
export default function Gallery() {
  return (
    <>
      <PageIntro
        eyebrow="Life at the farm"
        title="THE REAL EAGLE’S NEST."
        intro="A glimpse of the horses and the place behind the mission. Photographs from ENVET’s own community page."
        path="/gallery"
      />
      <section className="wrap gallery-grid">
        <figure>
          <Photo
            src="/images/horse.jpg"
            alt="A horse at Eagle’s Nest in Lovettsville"
            priority
          />
          <figcaption>
            <strong>A connection starts here.</strong>One of the horses at
            ENVET.{" "}
            <a href="https://www.facebook.com/profile.php?id=100068209587248">
              See the official Facebook page.
            </a>
          </figcaption>
        </figure>
        <figure>
          <Photo
            src="/images/farm.jpg"
            alt="Open space and fencing at the Eagle’s Nest farm"
          />
          <figcaption>
            <strong>A little room to breathe.</strong>The outdoor setting in
            Lovettsville, Virginia.
          </figcaption>
        </figure>
      </section>
      <section className="wrap closing-cta">
        <div>
          <p className="eyebrow">THERE’S MORE TO THE STORY</p>
          <h2>Follow life at Eagle’s Nest.</h2>
          <p>Find community moments and updates on ENVET’s official page.</p>
        </div>
        <Action href={organization.facebook} external>
          Visit ENVET on Facebook
        </Action>
      </section>
    </>
  );
}
