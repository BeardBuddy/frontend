type RuntimeConfig = {
  apiBaseUrl: string;
};

/**
 * Resolved once per page load from /api/config, which reads the value server-side. The
 * promise is memoised so concurrent callers share a single request.
 */
let configPromise: Promise<RuntimeConfig> | null = null;

function loadConfig(): Promise<RuntimeConfig> {
  configPromise ??= fetch("/api/config")
    .then(response => {
      if (!response.ok) throw new Error(`config request failed (${response.status})`);
      return response.json() as Promise<RuntimeConfig>;
    })
    .catch(() => {
      // Never leave the app wedged if the config route is unreachable: fall back to the
      // local backend and let the next call retry.
      configPromise = null;
      return { apiBaseUrl: "http://localhost:8080" };
    });

  return configPromise;
}

export async function apiUrl(path: string): Promise<string> {
  const { apiBaseUrl } = await loadConfig();
  return `${apiBaseUrl}${path}`;
}
