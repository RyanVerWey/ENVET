"use client";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, Check } from "lucide-react";
import { photoPattern } from "@/lib/community/animals";
import { photoSize, preparePortrait } from "@/lib/portrait-image";

type Prepared = Awaited<ReturnType<typeof preparePortrait>> & {
  url: string;
  originalSize: number;
  name: string;
};
type Phase =
  "idle" | "converting" | "ready" | "uploading" | "finishing" | "done";

export function PortraitUpload({
  onUploaded,
  onPendingChange,
}: {
  onUploaded: (photo: string) => void;
  onPendingChange: (pending: boolean) => void;
}) {
  const [prepared, setPrepared] = useState<Prepared | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [percent, setPercent] = useState<number | undefined>();
  const [rights, setRights] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const work = useRef<AbortController | null>(null);
  const request = useRef<XMLHttpRequest | null>(null);
  const preview = useRef("");
  const input = useRef<HTMLInputElement>(null);
  const active =
    phase === "converting" || phase === "uploading" || phase === "finishing";
  // A ready but unattached preview also blocks saving, so it cannot be forgotten.
  useEffect(() => {
    onPendingChange(active || phase === "ready");
  }, [active, phase, onPendingChange]);
  useEffect(() => {
    if (notice) input.current?.focus();
  }, [notice]);
  useEffect(
    () => () => {
      work.current?.abort();
      request.current?.abort();
      if (preview.current) URL.revokeObjectURL(preview.current);
    },
    [],
  );

  async function choose(file?: File) {
    if (!file) return;
    work.current?.abort();
    request.current?.abort();
    const controller = new AbortController();
    work.current = controller;
    setError("");
    setNotice("");
    setRights(false);
    setPrepared(null);
    if (preview.current) URL.revokeObjectURL(preview.current);
    preview.current = "";
    setPhase("converting");
    try {
      // Let the browser paint progress before decoding a large phone photo.
      await new Promise((resolve) => setTimeout(resolve, 0));
      const result = await preparePortrait(file, controller.signal);
      if (controller.signal.aborted) return;
      const url = URL.createObjectURL(result.file);
      preview.current = url;
      setPrepared({ ...result, url, name: file.name, originalSize: file.size });
      setPhase("ready");
    } catch (reason) {
      if (controller.signal.aborted) return;
      setError(
        reason instanceof Error
          ? reason.message
          : "Photo conversion failed. Choose another photo.",
      );
      setPhase("idle");
    }
  }

  function cancel() {
    work.current?.abort();
    request.current?.abort();
    request.current = null;
    setPhase("idle");
    setPrepared(null);
    setError("");
    setNotice(
      "Photo selection canceled. Your existing portrait and bio are unchanged. An upload already received by the server may remain private; it will not be attached to your bio.",
    );
    if (preview.current) URL.revokeObjectURL(preview.current);
    preview.current = "";
  }

  function upload() {
    if (!prepared || !rights || active || phase === "done" || request.current)
      return;
    const xhr = new XMLHttpRequest();
    request.current = xhr;
    const current = () =>
      request.current === xhr && !work.current?.signal.aborted;
    const fail = (message: string) => {
      if (!current()) return;
      request.current = null;
      setError(message);
      setPhase("ready");
    };
    setError("");
    setNotice("");
    setPercent(0);
    setPhase("uploading");
    // Register before open/send for cross-browser upload progress support.
    xhr.upload.onprogress = (event) => {
      if (!current()) return;
      setPercent(
        event.lengthComputable
          ? Math.round((100 * event.loaded) / event.total)
          : undefined,
      );
    };
    xhr.upload.onload = () => {
      if (current()) setPhase("finishing");
    };
    xhr.onerror = () =>
      fail(
        "Connection lost. Your bio is unchanged. Check your connection, then choose Upload photo to retry; a private copy may already exist.",
      );
    xhr.ontimeout = () =>
      fail(
        "The upload took too long to confirm. Your bio is unchanged. Choose Upload photo to retry when your connection is ready.",
      );
    xhr.onload = () => {
      if (!current()) return;
      let result: { photo?: string; error?: string };
      try {
        result = JSON.parse(xhr.responseText);
      } catch {
        fail(
          "Could not confirm the upload. Your bio is unchanged. Try again, or sign in again if your session ended.",
        );
        return;
      }
      if (
        xhr.status < 200 ||
        xhr.status >= 300 ||
        !photoPattern.test(result.photo ?? "")
      ) {
        fail(
          xhr.status === 403
            ? "Your manager session has ended. Sign in again in another tab, then choose Upload photo to retry. Your bio is still here."
            : result.error ||
                "Photo did not upload. Your bio is unchanged. Choose Upload photo to retry.",
        );
        return;
      }
      request.current = null;
      setPhase("done");
      onUploaded(result.photo!);
    };
    try {
      xhr.open("POST", "/api/team/animals/photo");
      xhr.timeout = 90_000;
      const data = new FormData();
      data.append("photo", prepared.file);
      data.append("rights", "confirmed");
      xhr.send(data);
    } catch {
      fail("Upload could not start. Your bio is unchanged. Try again.");
    }
  }

  const status =
    phase === "converting"
      ? "Making a smaller WebP photo… Large photos may take a moment."
      : phase === "uploading"
        ? `Uploading photo${percent === undefined ? "…" : `: ${percent}%`}`
        : phase === "finishing"
          ? "Transfer complete. Securing and checking your photo…"
          : phase === "done"
            ? "Photo uploaded. Add a photo description below, then Save bio to finish."
            : prepared
              ? "Photo ready. Check the preview, confirm permission, then choose Upload photo."
              : notice;
  return (
    <section className="portrait-uploader" aria-labelledby="portrait-heading">
      <h3 id="portrait-heading">
        <ImagePlus size={20} aria-hidden="true" />
        Portrait
      </h3>
      <ol className="portrait-steps">
        <li>
          Choose a JPG, JPEG, PNG or WebP photo up to 20 MB. We resize and
          convert it for you.
        </li>
        <li>
          Check the preview, confirm photo permission, then choose{" "}
          <strong>Upload photo</strong>.
        </li>
        <li>
          Add a photo description below and choose <strong>Save bio</strong>.
          Uploading alone does not publish it.
        </li>
      </ol>
      <label htmlFor="animal-photo">Choose a photo</label>
      <input
        id="animal-photo"
        ref={input}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        aria-describedby="portrait-help"
        disabled={active}
        onChange={(event) => {
          void choose(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <p className="small" id="portrait-help">
        iPhone HEIC/HEIF photos: export as JPEG first. No need to resize. Your
        original stays on your device; only the optimized copy is uploaded.
        Location and camera metadata are removed.
      </p>
      {prepared && (
        <figure className="portrait-upload-preview">
          {/* Local object URL: never sent through a public image optimizer. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={prepared.url}
            alt="Selected portrait preview; check the photo before uploading"
            width={prepared.width}
            height={prepared.height}
          />
          <figcaption>
            <strong>{prepared.name}</strong>
            <span>
              {photoSize(prepared.originalSize)} →{" "}
              {photoSize(prepared.file.size)} WebP · {prepared.width} ×{" "}
              {prepared.height} pixels
            </span>
          </figcaption>
        </figure>
      )}
      <div
        className="portrait-status"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {status && (
          <p>
            {phase === "done" && <Check size={18} aria-hidden="true" />}{" "}
            {status}
          </p>
        )}
      </div>
      {active && (
        <progress
          aria-label={
            phase === "converting"
              ? "Photo conversion"
              : phase === "finishing"
                ? "Securing photo"
                : "Photo upload"
          }
          max={100}
          value={phase === "uploading" ? percent : undefined}
        />
      )}
      {error && (
        <p className="portrait-error" role="alert">
          {error}
        </p>
      )}
      {prepared && phase !== "done" && (
        <label className="animal-rights">
          <input
            type="checkbox"
            checked={rights}
            disabled={active}
            onChange={(event) => setRights(event.target.checked)}
          />
          I have permission to publish this photo, including consent for any
          identifiable people shown.
        </label>
      )}
      <div className="actions">
        {prepared && phase !== "done" && (
          <button
            className="action"
            type="button"
            disabled={!rights || active}
            onClick={upload}
          >
            Upload photo
          </button>
        )}
        {(active || phase === "ready") && (
          <button className="quiet-button" type="button" onClick={cancel}>
            Cancel photo
          </button>
        )}
      </div>
    </section>
  );
}
