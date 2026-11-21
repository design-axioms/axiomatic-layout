# Axiomatic layout

An exploration of composing layouts that preserve meaningful relationships as content and available space change.

Visit the [live Axiomatic guide](https://axiomatic-layout.vercel.app) and [playground](https://axiomatic-layout.vercel.app/_media/documentation/playground/index.html).

Start locally with the [core concepts guide](documentation/onboarding/index.md), then [try the investigation study](experiments/01-reading-path/README.md). The guide teaches candidate primitives through executable compositions; the library API remains open.

## Implementation direction

Read the [CSS-first axioms](research/CSS-FIRST-AXIOMS.md) and [staged improvement plan](research/CSS-FIRST-PLAN.md) before extending the implementation. CSS owns geometry; a shared Switcher coordinator handles the exceptional content-driven row/column decision. The documents connect that boundary to the original Gemini exchanges and separate established commitments from mechanisms still to validate. The guide now uses that runtime. [Its contract and qualification](research/CSS-FIRST-RUNTIME.md) describe the controlled-text adapter, native inspection, tested behavior, and remaining library boundaries.

The [discussion plan](research/CSS-FIRST-DISCUSSION.md) records the agreed milestone and execution ownership.

## Run locally

Use Node 24 and pnpm 10.26.2:

```sh
pnpm install --frozen-lockfile
pnpm docs:dev
```

Open <http://127.0.0.1:4326/getting-started/index.html>. `pnpm docs:build` writes `.docs-site`; `pnpm docs:serve` serves it on the same port after stopping the development reader. `pnpm study` runs the standalone investigation study on port 8786.

The [standalone playground](http://127.0.0.1:4326/_media/documentation/playground/index.html) keeps named drafts in this browser, including Undo history. **Copy snapshot link** captures the authored composition as a fixed, read-only link; **Edit a copy** creates a separate draft. The guide's **Open in playground** carries its current composition into a new draft. The guide and playground are deployed together at `axiomatic-layout.vercel.app`. Local links remain local; copy snapshots from the hosted playground to share them across devices.

Drafts use browser-local storage, not an account or cloud backup. This first version keeps up to 20 drafts within a 2 MiB character budget and accepts snapshot payloads up to 16,384 characters. Limits and save failures preserve existing work. **Remove draft** preserves the last removed draft for **Undo removal** in the same tab, including reload. That recovery lasts until another removal replaces it or the tab closes. Removing the last draft leaves an empty workspace. The hosted handoff and fixed snapshot links are qualified in Chromium. Drafts belong to their browser and origin; localhost drafts do not automatically migrate to the hosted site. The local implementation and acceptance record is `documentation/review/TAKE-WITH-YOU-ACCEPTANCE.md`, excluded from the generated site.

See [documentation development](documentation/README.md) for the reader dependency and current integration limits.

The recovered sources and design constraints remain available locally under `history/`, including `history/CONSTRAINTS.md` and `history/collaboration/FOUNDATION-REVIEW.md`. Source archives, private collaboration records, and browser evidence are excluded from the documentation site's source inventory.


## Publish the static site

The Vercel project is `axiomatic-layout` in `yehuda-katzs-projects` (Yehuda Katz’s projects). Its production origin is <https://axiomatic-layout.vercel.app>. The root opens the guide; the playground keeps its existing snapshot path.

```sh
pnpm docs:build
node scripts/stage-site.ts
vercel deploy --prod --yes --scope yehuda-katzs-projects --project axiomatic-layout --cwd .local/vercel-static
```

The staging script copies only the generated reader artifact, with static-host configuration, into `.local/vercel-static`. It replaces that generated staging directory each time; it leaves the local preview build and research workspace intact. Deployment is currently explicit through the CLI; this checkout has no Git remote or automatic Git deployment configured.
