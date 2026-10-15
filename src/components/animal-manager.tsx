"use client";
import { useCallback, useEffect, useState } from "react";
import { Plus, ArrowUpRight, ImagePlus, RotateCcw, Trash2 } from "lucide-react";
import {
  animalTypes,
  blankAnimal,
  type AnimalBio,
  type AnimalRecord,
} from "@/lib/community/animals";
import { AnimalCard } from "./animal-card";

export function AnimalManager() {
  const [animals, setAnimals] = useState<AnimalRecord[] | null>(null);
  const [draft, setDraft] = useState<AnimalBio>({ ...blankAnimal });
  const [version, setVersion] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [dirty, setDirty] = useState(false);
  const [rights, setRights] = useState(false);
  const [trash, setTrash] = useState(false);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [more, setMore] = useState(false);
  const reload = useCallback(async () => {
    setLoading(true);
    setAnimals(null);
    try {
      const response = await fetch(`/api/team/animals?page=${page}`, {
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Profiles could not load.");
      setAnimals(result.animals);
      setMore(result.more);
      return true;
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Profiles could not load.",
      );
      return false;
    } finally {
      setLoading(false);
    }
  }, [page]);
  useEffect(() => {
    const timer = setTimeout(() => void reload(), 0);
    return () => clearTimeout(timer);
  }, [reload]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function edit(item?: AnimalRecord) {
    if (dirty && !window.confirm("Discard your unsaved bio changes?")) return;
    setDraft(item ? { ...item } : { ...blankAnimal });
    setVersion(item?.version ?? null);
    setDirty(false);
    setRights(false);
    setMessage("");
    document.getElementById("animal-name")?.focus();
  }
  function update(key: keyof AnimalBio, value: string) {
    setDraft((old) => ({ ...old, [key]: value }));
    setDirty(true);
  }
  async function mutate(method: string, payload: unknown) {
    if (
      method !== "POST" &&
      dirty &&
      !window.confirm("Discard your unsaved bio changes and continue?")
    )
      return;
    setBusy(true);
    setMessage("");
    setConfirm(null);
    try {
      const response = await fetch("/api/team/animals", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        if (response.status === 409 || response.status === 403) {
          setAnimals(null);
          setMessage(
            `${result.error} Refresh profiles before continuing. Your unsaved bio is still here.`,
          );
        } else setMessage(result.error || "The change did not save.");
        return;
      }
      if (method === "POST") {
        setVersion(result.version);
        setDirty(false);
      } else {
        setDraft({ ...blankAnimal });
        setVersion(null);
        setDirty(false);
      }
      if (await reload())
        setMessage(
          method === "DELETE"
            ? "Moved to trash. The public profile is hidden. You can restore it as a draft."
            : method === "PATCH"
              ? "Restored as a draft. Review before publishing."
              : "Bio saved.",
        );
      else
        setMessage(
          "Change confirmed, but profiles could not refresh. Retry refresh; do not repeat the change.",
        );
    } catch {
      setAnimals(null);
      setMessage(
        "Could not confirm whether the change saved. Refresh profiles and open the latest record before trying again. Your unsaved bio is still here.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function upload(file: File | undefined) {
    if (!file) return;
    if (!rights) {
      setMessage("Confirm permission to publish this portrait first.");
      return;
    }
    if (file.size > 3_000_000) {
      setMessage("Use a portrait smaller than 3 MB.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const data = new FormData();
      data.append("photo", file);
      data.append("rights", "confirmed");
      const response = await fetch("/api/team/animals/photo", {
        method: "POST",
        body: data,
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Photo did not upload.");
      update("photo", result.photo);
      setMessage(
        "Portrait uploaded privately. Save the bio to attach it; only a published profile makes it public.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Photo upload could not be confirmed. Choose the file again; your bio has not been saved.",
      );
    } finally {
      setBusy(false);
    }
  }
  const fields: {
    key: keyof AnimalBio;
    label: string;
    max: number;
    rows?: number;
    required?: boolean;
    hint?: string;
  }[] = [
    { key: "name", label: "Animal name", max: 100, required: true },
    {
      key: "nickname",
      label: "Nickname",
      max: 100,
      hint: "What do you call them around the farm?",
    },
    {
      key: "role",
      label: "Farm job title",
      max: 100,
      hint: "A playful title, grounded in their real personality.",
    },
    {
      key: "summary",
      label: "Short introduction",
      max: 700,
      rows: 3,
      required: true,
      hint: "The few sentences visitors see on the card.",
    },
    {
      key: "story",
      label: "Their story",
      max: 4000,
      rows: 6,
      hint: "How they came to Eagle’s Nest, meaningful moments, and what makes them themselves.",
    },
    { key: "personality", label: "Personality", max: 300, rows: 2 },
    {
      key: "favorites",
      label: "Favorite things",
      max: 300,
      rows: 2,
      hint: "Favorite routines, places or pastimes. This is not permission for visitors to feed them.",
    },
    {
      key: "visitTips",
      label: "When we meet",
      max: 700,
      rows: 3,
      hint: "Staff-approved introduction tips, boundaries and anything a visitor should know.",
    },
  ];
  return (
    <div className="wrap animal-manager">
      <nav className="team-nav" aria-label="Management navigation">
        <a href="/team">Management dashboard</a>
        <a href="/team/forms">Forms review</a>
        <a href="/team/impact">Program activity</a>
        <a href="/staff" target="_blank" rel="noopener noreferrer">
          View public staff page <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      </nav>
      <div className="animal-management-heading">
        <div>
          <p className="eyebrow">THE ANIMAL ROSTER</p>
          <h2>A bio with a little soul.</h2>
          <p>Add the stories visitors can’t learn from a photograph alone.</p>
        </div>
        <button
          type="button"
          className="action"
          disabled={busy || loading || !animals}
          onClick={() => edit()}
        >
          <Plus size={18} aria-hidden="true" />
          New animal
        </button>
      </div>
      {message && (
        <p role="status" className="form-message">
          {message}
        </p>
      )}
      {loading && <p role="status">Loading animal profiles…</p>}
      <button
        className="quiet-button"
        type="button"
        disabled={busy || loading}
        onClick={() => void reload()}
      >
        Refresh profiles
      </button>
      {animals && (
        <>
          <div
            className="animal-filters"
            role="group"
            aria-label="Profile list"
          >
            <button
              type="button"
              aria-pressed={!trash}
              onClick={() => {
                setTrash(false);
                setConfirm(null);
              }}
            >
              Profiles
            </button>
            <button
              type="button"
              aria-pressed={trash}
              onClick={() => {
                setTrash(true);
                setConfirm(null);
              }}
            >
              Trash
            </button>
          </div>
          <ul className="animal-admin-list">
            {animals
              .filter((a) => (trash ? !!a.deleted_at : !a.deleted_at))
              .map((item) => (
                <li key={item.slug}>
                  <div>
                    <strong>{item.name}</strong>
                    <span>
                      {animalTypes[item.species]} ·{" "}
                      {item.deleted_at ? "In trash" : item.state}
                    </span>
                  </div>
                  <div className="actions">
                    {item.deleted_at ? (
                      <button
                        className="quiet-button"
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void mutate("PATCH", {
                            slug: item.slug,
                            expectedVersion: item.version,
                          })
                        }
                      >
                        <RotateCcw size={16} aria-hidden="true" />
                        Restore as draft
                      </button>
                    ) : (
                      <>
                        <button
                          className="quiet-button"
                          type="button"
                          disabled={busy}
                          onClick={() => edit(item)}
                        >
                          Edit {item.name}
                        </button>
                        <button
                          className="quiet-button"
                          type="button"
                          disabled={busy}
                          onClick={() => setConfirm(item.slug)}
                          aria-label={`Move ${item.name} to trash`}
                        >
                          <Trash2 size={16} aria-hidden="true" />
                          Trash
                        </button>
                      </>
                    )}
                  </div>
                  {confirm === item.slug && (
                    <div className="animal-trash-confirm" role="alert">
                      <p>
                        Move {item.name} to trash? Their public card disappears.
                        You can restore the profile later.
                      </p>
                      <button
                        className="quiet-button"
                        type="button"
                        disabled={busy}
                        onClick={() => setConfirm(null)}
                      >
                        Keep profile
                      </button>
                      <button
                        className="action"
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void mutate("DELETE", {
                            slug: item.slug,
                            expectedVersion: item.version,
                          })
                        }
                      >
                        Confirm move to trash
                      </button>
                    </div>
                  )}
                </li>
              ))}
          </ul>
          {!animals.some((a) => (trash ? !!a.deleted_at : !a.deleted_at)) && (
            <p>
              {trash
                ? "Trash is empty. Deleted profiles can be restored here."
                : "No animals on this page yet. Create the first bio below."}
            </p>
          )}
          <nav className="actions" aria-label="Animal profile pages">
            <button
              className="quiet-button"
              type="button"
              disabled={busy || page === 0}
              onClick={() => {
                if (
                  !dirty ||
                  window.confirm("Discard unsaved changes and change page?")
                ) {
                  setDirty(false);
                  setDraft({ ...blankAnimal });
                  setVersion(null);
                  setPage(page - 1);
                }
              }}
            >
              Previous page
            </button>
            <span>Page {page + 1}</span>
            <button
              className="quiet-button"
              type="button"
              disabled={busy || !more}
              onClick={() => {
                if (
                  !dirty ||
                  window.confirm("Discard unsaved changes and change page?")
                ) {
                  setDirty(false);
                  setDraft({ ...blankAnimal });
                  setVersion(null);
                  setPage(page + 1);
                }
              }}
            >
              Next page
            </button>
          </nav>
        </>
      )}
      <div className="animal-editor-layout">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void mutate("POST", { ...draft, expectedVersion: version });
          }}
        >
          <fieldset disabled={busy || loading || !animals}>
            <legend>
              {version === null ? "Create an animal bio" : "Edit animal bio"}
            </legend>
            <label htmlFor="animal-type">Animal type</label>
            <select
              id="animal-type"
              value={draft.species}
              onChange={(e) => update("species", e.target.value)}
            >
              {Object.entries(animalTypes).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            {fields.map((field) => (
              <div className="animal-field" key={field.key}>
                <label htmlFor={`animal-${field.key}`}>
                  {field.label}
                  {field.required ? " *" : ""}
                </label>
                {field.rows ? (
                  <textarea
                    id={`animal-${field.key}`}
                    rows={field.rows}
                    maxLength={field.max}
                    minLength={field.key === "summary" ? 10 : undefined}
                    required={
                      field.required ||
                      (draft.state === "published" &&
                        ["story", "visitTips"].includes(field.key))
                    }
                    value={draft[field.key]}
                    aria-describedby={
                      field.hint ? `hint-${field.key}` : undefined
                    }
                    onChange={(e) => update(field.key, e.target.value)}
                  />
                ) : (
                  <input
                    id={`animal-${field.key}`}
                    maxLength={field.max}
                    minLength={field.required ? 2 : undefined}
                    required={field.required}
                    value={draft[field.key]}
                    aria-describedby={
                      field.hint ? `hint-${field.key}` : undefined
                    }
                    onChange={(e) => {
                      update(field.key, e.target.value);
                      if (field.key === "name" && version === null)
                        setDraft((old) => ({
                          ...old,
                          slug: e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/^-|-$/g, "")
                            .slice(0, 100),
                        }));
                    }}
                  />
                )}
                {field.hint && (
                  <p id={`hint-${field.key}`} className="small">
                    {field.hint}
                  </p>
                )}
              </div>
            ))}
            <label htmlFor="animal-slug">Profile ID *</label>
            <input
              id="animal-slug"
              value={draft.slug}
              maxLength={100}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              required
              readOnly={version !== null}
              onChange={(e) => update("slug", e.target.value)}
            />
            <p className="small">
              Unique lowercase ID. Stays fixed after the first save.
            </p>
            <div className="animal-upload">
              <h3>
                <ImagePlus size={20} aria-hidden="true" />
                Portrait
              </h3>
              <label className="animal-rights">
                <input
                  type="checkbox"
                  checked={rights}
                  onChange={(e) => setRights(e.target.checked)}
                />
                I have permission to publish this photo, including consent for
                any identifiable people shown.
              </label>
              <label htmlFor="animal-photo">
                Upload photo, JPEG / PNG / WebP, under 3 MB
              </label>
              <input
                id="animal-photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={!rights}
                onChange={(e) => {
                  void upload(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              <p className="small">
                Photos are resized and location/camera metadata removed. Draft
                portraits stay private.
              </p>
              {draft.photo && (
                <button
                  className="quiet-button"
                  type="button"
                  onClick={() => update("photo", "")}
                >
                  Remove portrait from bio
                </button>
              )}
              <label htmlFor="animal-photo-alt">
                Photo description{draft.photo ? " *" : ""}
              </label>
              <input
                id="animal-photo-alt"
                required={!!draft.photo}
                maxLength={250}
                value={draft.photoAlt}
                onChange={(e) => update("photoAlt", e.target.value)}
              />
            </div>
            <label htmlFor="animal-state">Visibility</label>
            <select
              id="animal-state"
              value={draft.state}
              onChange={(e) => update("state", e.target.value)}
            >
              <option value="draft">Draft, managers only</option>
              <option value="published">Published, on staff page</option>
              <option value="archived">Archived, hidden from visitors</option>
            </select>
            <p className="small">
              Publishing requires a portrait, story and visit tips. Review
              accuracy and photo permission before saving.
            </p>
            <div className="actions">
              <button className="action" type="submit">
                {busy
                  ? "Saving…"
                  : draft.state === "published"
                    ? "Save & publish bio"
                    : "Save bio"}
              </button>
              <button
                className="quiet-button"
                type="button"
                onClick={() => edit()}
              >
                Clear editor
              </button>
            </div>
            <p className="small" role="status">
              {dirty
                ? "Unsaved bio changes. Preview is not published."
                : "Editor matches its last saved state. New bios are not saved until you choose Save bio."}
            </p>
          </fieldset>
        </form>
        <aside className="animal-preview" aria-label="Animal card preview">
          <p className="eyebrow">LIVE CARD PREVIEW · NOT PUBLISHED</p>
          <AnimalCard animal={draft} preview />
        </aside>
      </div>
    </div>
  );
}
