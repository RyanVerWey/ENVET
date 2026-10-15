"use client";
import { useState } from "react";
import { AnimalCard } from "./animal-card";
import {
  animalTypes,
  type AnimalBio,
  type AnimalType,
} from "@/lib/community/animals";
export function AnimalRoster({ animals }: { animals: AnimalBio[] }) {
  const [group, setGroup] = useState<AnimalType | "all">("all");
  const shown = animals.filter(
    (animal) => group === "all" || animal.species === group,
  );
  return (
    <section className="wrap animal-roster" aria-labelledby="roster-heading">
      <div className="animal-roster-heading">
        <div>
          <p className="eyebrow">THE FARM CREW</p>
          <h2 id="roster-heading">Big personalities. Good company.</h2>
        </div>
        <p>
          Different characters, one welcoming farm. Get to know the animals
          before your visit.
        </p>
      </div>
      <div className="animal-filters" role="group" aria-label="Animal types">
        {(["all", ...Object.keys(animalTypes)] as (AnimalType | "all")[]).map(
          (type) => (
            <button
              key={type}
              type="button"
              aria-pressed={group === type}
              onClick={() => setGroup(type)}
            >
              {type === "all" ? "Everyone" : animalTypes[type]}{" "}
              <span>
                {
                  animals.filter((a) => type === "all" || a.species === type)
                    .length
                }
              </span>
            </button>
          ),
        )}
      </div>
      <p className="sr-only" role="status">
        {shown.length} {shown.length === 1 ? "profile" : "profiles"} shown
      </p>
      {shown.length ? (
        <div className="animal-grid">
          {shown.map((animal) => (
            <AnimalCard key={animal.slug} animal={animal} />
          ))}
        </div>
      ) : (
        <div className="animal-empty">
          <h3>
            {group === "all"
              ? "Meet the crew in person."
              : `Curious about our ${group === "horse" ? "Horse Heroes" : animalTypes[group].toLowerCase()}?`}
          </h3>
          <p>
            Ask ENVET who you might meet during your visit. The team will
            introduce you at a pace that suits you and the animals.
          </p>
          <a className="action" href="/contact">
            Start a conversation
          </a>
        </div>
      )}
    </section>
  );
}
