/**
 * Base URL of the BeardBuddy backend.
 *
 * Empty by default, so every call stays relative and hits the Next.js API routes exactly as
 * before. Set NEXT_PUBLIC_API_BASE_URL (e.g. http://localhost:8080) to point the same calls at
 * the Java/Spring Boot backend in ../masproject-backend — the paths, verbs and payloads are
 * identical either way, so this is the only thing that changes.
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}
