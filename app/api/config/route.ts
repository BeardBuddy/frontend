import { NextResponse } from "next/server";

/**
 * Exposes runtime configuration to the browser.
 *
 * The API base URL cannot be baked into the client bundle at build time: CI builds one
 * artifact and the same image is deployed to every environment. Reading the env var here,
 * on the server, at request time, keeps the bundle environment-agnostic.
 */
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    apiBaseUrl: process.env.API_BASE_URL ?? "http://localhost:8080",
  });
}
