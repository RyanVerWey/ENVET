import Image from "next/image";
import { Cat, Dog, Heart, ArrowDownRight } from "lucide-react";
import { animalTypes, type AnimalBio } from "@/lib/community/animals";
export function AnimalCard({
  animal,
  preview = false,
}: {
  animal: AnimalBio;
  preview?: boolean;
}) {
  const Icon =
    animal.species === "cat" ? Cat : animal.species === "dog" ? Dog : Heart;
  return (
    <article
      className={`animal-card animal-${animal.species}${preview ? " animal-card-preview" : ""}`}
    >
      <div className="animal-portrait">
        {animal.photo ? (
          <Image
            src={`/api/animals/photo/${animal.photo}`}
            alt={animal.photoAlt}
            fill
            unoptimized
            sizes="(max-width: 760px) 100vw, 33vw"
          />
        ) : (
          <div className="animal-portrait-empty">
            <Icon size={70} strokeWidth={1} aria-hidden="true" />
            <span>{animalTypes[animal.species]}</span>
          </div>
        )}
        <span className="animal-type">{animalTypes[animal.species]}</span>
      </div>
      <div className="animal-card-body">
        {animal.role && <p className="eyebrow">{animal.role}</p>}
        <h3>{animal.name || "Your animal’s name"}</h3>
        {animal.nickname && (
          <p className="animal-nickname">
            Around the farm, “{animal.nickname}”
          </p>
        )}
        <p>
          {animal.summary || "A few words that make this personality shine."}
        </p>
        <details name="envet-accordion" className="animal-story">
          <summary>
            Get to know {animal.name || "me"}{" "}
            <ArrowDownRight size={18} aria-hidden="true" />
          </summary>
          <div>
            {animal.story && (
              <>
                <h4>My story</h4>
                <p className="animal-prose">{animal.story}</p>
              </>
            )}
            <dl>
              {animal.personality && (
                <>
                  <dt>My personality</dt>
                  <dd>{animal.personality}</dd>
                </>
              )}
              {animal.favorites && (
                <>
                  <dt>A few favorite things</dt>
                  <dd>{animal.favorites}</dd>
                </>
              )}
              {animal.visitTips && (
                <>
                  <dt>When we meet</dt>
                  <dd>{animal.visitTips}</dd>
                </>
              )}
            </dl>
            <p className="small">
              Ask the ENVET team before approaching or offering food. Every
              visit is arranged with the team.
            </p>
          </div>
        </details>
      </div>
    </article>
  );
}
