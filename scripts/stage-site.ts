import { cp, mkdir, rm, writeFile } from "node:fs/promises";

// Publish the fixed-source reader artifact, rather than the research workspace.
// Keep this staging directory distinct from the live local preview's build.
const source = new URL("../.docs-site/", import.meta.url);
const destination = new URL("../.local/vercel-static/", import.meta.url);
await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true });
await writeFile(
  new URL("vercel.json", destination),
  JSON.stringify(
    {
      $schema: "https://openapi.vercel.sh/vercel.json",
      framework: null,
      buildCommand: "",
      installCommand: "",
      outputDirectory: ".",
      redirects: [
        {
          source: "/",
          destination: "/getting-started/index.html",
          permanent: false,
        },
      ],
    },
    null,
    2,
  ) + "\n",
);
console.log(`Staged static site at ${destination.pathname}`);
