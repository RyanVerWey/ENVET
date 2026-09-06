import { Action, PageIntro, Photo } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "Our story",
  "Meet Eagle’s Nest Veterans’ Equine Therapy, a nonprofit connecting veterans, families, and horses in Lovettsville, Virginia.",
  "/about",
);
export default function About() {
  return (
    <>
      <PageIntro
        eyebrow="Our story"
        title="GOOD PEOPLE. GOOD HORSES. COMMON GROUND."
        intro="Eagle’s Nest is a place to begin a connection, with horses, with the outdoors, and with a community that cares."
        path="/about"
      />
      <section className="wrap story-split">
        <Photo
          src="/images/horse.jpg"
          alt="A horse at Eagle’s Nest Veterans’ Equine Therapy"
          priority
        />
        <div>
          <p className="eyebrow">OUR PURPOSE</p>
          <h2>
            Service deserves
            <br />a place of support.
          </h2>
          <p>
            ENVET provides equine therapy options for United States veterans and
            their families. Based in Lovettsville, Virginia, the nonprofit
            brings people together with rescued or donated horses.
          </p>
          <p>
            Our official Facebook page describes free access to horses for
            veterans. The team can explain current opportunities, eligibility,
            and how family members can take part.
          </p>
          <p>
            We believe the first step should feel simple: a conversation with a
            person who can help you understand what comes next.
          </p>
          <Action href="/visit">Find your first step</Action>
        </div>
      </section>
      <section className="wrap values-section">
        <p className="eyebrow">WHAT GUIDES THIS PLACE</p>
        <div className="value-row">
          <span>01</span>
          <h2>People before paperwork.</h2>
          <p>
            Ask questions at your own pace. There is no online medical intake or
            document upload here.
          </p>
        </div>
        <div className="value-row">
          <span>02</span>
          <h2>Care goes both ways.</h2>
          <p>
            Rescued and donated horses are central to ENVET’s work. Contact the
            team to learn about the horses and appropriate ways to interact.
          </p>
        </div>
        <div className="value-row">
          <span>03</span>
          <h2>Community keeps us going.</h2>
          <p>
            Donations, shared stories, and people willing to help support the
            program. Ask what the team needs most right now.
          </p>
        </div>
      </section>
      <section className="wrap closing-cta">
        <div>
          <p className="eyebrow">THERE’S ROOM FOR YOU HERE</p>
          <h2>Be part of the next chapter.</h2>
        </div>
        <Action href="/contact">Talk with ENVET</Action>
      </section>
    </>
  );
}
