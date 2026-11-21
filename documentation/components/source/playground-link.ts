/** Relative to the built component asset, so the static site can live below a path. */
export function playgroundURL(
  kind?: "edit" | "snapshot",
  payload?: string,
): URL {
  const url = new URL("../playground/index.html", import.meta.url);
  if (kind && payload) url.hash = `${kind}=${payload}`;
  return url;
}
