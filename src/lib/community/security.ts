import "server-only";
import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { dataConfig } from "./config";

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (!origin || (fetchSite !== null && fetchSite !== "same-origin"))
    return false;
  try {
    const source = new URL(origin);
    const target = new URL(request.url);
    if (source.origin !== origin) return false;
    if (source.origin === target.origin) return true;
    // NextRequest canonicalizes 127.0.0.1 to localhost in local development.
    return (
      source.protocol === "http:" &&
      target.protocol === "http:" &&
      source.port === target.port &&
      ["localhost", "127.0.0.1"].includes(source.hostname) &&
      ["localhost", "127.0.0.1"].includes(target.hostname)
    );
  } catch {
    return false;
  }
}

export function rateKey(scope: string, value: string) {
  const config = dataConfig();
  if (!config) throw new Error("Data service unavailable");
  return createHmac("sha256", config.pepper)
    .update(`${scope}\0${value}`)
    .digest("hex");
}

export function apiJson(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

export function dbError(error: { code?: string; message?: string } | null) {
  if (error?.code === "P0001" && error.message === "rate limited")
    return apiJson(
      { error: "Too many requests. Please try again later." },
      429,
    );
  if (error?.code === "P0002" || error?.code === "23505")
    return apiJson({ error: "This changed. Refresh and try again." }, 409);
  if (
    error?.code === "22023" ||
    error?.code === "23514" ||
    error?.code === "23502"
  )
    return apiJson({ error: "Please check the information you entered." }, 400);
  if (error?.code === "42501") return apiJson({ error: "Access denied." }, 403);
  return apiJson(
    { error: "The service is unavailable. Please try again." },
    503,
  );
}

export async function jsonInput(
  request: Request,
  maxBytes = 4096,
): Promise<Record<string, unknown> | null> {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return null;
  const length = request.headers.get("content-length");
  if (length && Number(length) > maxBytes) return null;
  if (!request.body) return null;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    const value: unknown = JSON.parse(text);
    return value !== null && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}
