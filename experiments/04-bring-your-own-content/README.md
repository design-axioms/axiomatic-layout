# Bring your own content

This consumer gives Axiomatic application-owned native actions. The application creates the links and buttons, holds the follow state, and opens a native notes dialog. The adapter owns layout metadata and fit observation; it does not create or replace application content.

The first specimen is one Switcher of unequal actions. The second nests the secondary actions in another Switcher. Each appears in a resizable card and a narrow rail. Follow state is shared by the application across the four views; each view has its own authored DOM and fit decisions. This is deliberately separate from the playground editor and its saved compositions.

With the repository's pinned Node/pnpm:

```sh
pnpm byoc:build
pnpm docs:dev
```

Open `http://127.0.0.1:4326/_media/documentation/bring-your-own-content/index.html`.
The guide's investigation chapter links here. Production publication follows the repository's PR/deployment workflow.

The source is `experiment.ts` and `experiment.css`; `scripts/build-owned-content.ts` emits a separate browser bundle and CSS beside `documentation/bring-your-own-content/index.html`. `checks.ts` runs real-browser qualification from `checks.html`, including independently calculated fit expectations, direct narrow/wide jumps, nested groups, native DOM identity, focus, state, mutations and cleanup. No browser state or external application is modified by the checks.

## Current boundary

Only non-wrapping actions at their natural inline size are supported here. Atomic members can overflow a slot narrower than themselves; the example's native horizontal scrolling preserves access. Prose stays outside the adapted action groups. No prose sizing policy, package name, framework binding, or general spacing algebra is settled by this experiment.

## Integrating the experimental adapter

Load `primitives.css` and `authored-elements.css` together, mark the application’s groups and atomic members, then register the root. The links and buttons keep their ordinary semantics and application handlers.

```ts
import { registerAuthoredComposition } from "../../documentation/components/source/authored-elements.ts";

const composition = registerAuthoredComposition(actions);
// After inserting, removing, moving or reclassifying a member:
composition.refresh();
// When the application stops using this registration:
composition.dispose();
```

Size, font, wording and visibility changes are observed automatically. Make structural changes and refresh in ordinary application tasks or animation frames; mutation inside a ResizeObserver callback is outside this qualification. When transferring elements between independently registered roots, refresh the source first to release ownership, then the destination. The adapter itself never reparents application elements.

The [runtime account](../../research/CSS-FIRST-RUNTIME.md#application-owned-actions) describes the exact sizing assumptions. Group elements must accept the adapter’s inert mechanical children; containers such as `ul` and `table` need a different integration. Selectors such as `:empty` and `:last-child` see those children. Runtime attributes are reserved, and application styles must preserve the atom’s natural-size contract. These limits are part of the experiment, not a settled public API.

## Qualification

The browser checks cover flat equality, 120 consecutive first-frame width changes for each nested shape, deep label changes at fixed width, native focus/state/handler/identity preservation, visibility, fonts and spacing, empty and singleton groups, moved groups, ownership transfer, input rejection and complete cleanup. They also load the existing controlled renderer alongside the new adapter to verify coordinator coexistence. The first-frame sampler runs a task after layout and observer delivery; it does not observe every compositor presentation.

On 21 November 2026, all 18 reports passed in Chromium and Safari without observer-loop errors. The existing controlled-content browser suite separately passed 130 reports in Chromium. Firefox remains unqualified. Local review evidence is retained under `documentation/review/byoc/` and is excluded from publication.
