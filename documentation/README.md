# Developing the guide

The guide uses the ts-docs reader to supply its Axiomatic Color theme, including the colors inherited by examples inside shadow roots. A clean checkout installs the reader from the committed archive. Its source commit, build and SHA-256 digest are recorded in [the reader manifest](vendor/reader.json).

The reader's root `scrollbar-gutter: stable` preserves an independent available width when changing example heights makes the page scroll. A host integrating the bare primitives must preserve that condition itself. See [the runtime contract](../research/CSS-FIRST-RUNTIME.md).

## Workflow

Use Node 24 and pnpm 10 (the exact package-manager version is pinned in `package.json`). This is an ESM project. Node runs the TypeScript build scripts directly; esbuild bundles the browser component from TypeScript, and TypeScript checks it separately with strict checking, exact optional properties, and unchecked-index protection.

- `pnpm install --frozen-lockfile` installs the pinned dependencies.
- `pnpm docs:dev` builds and watches the components, then starts the reader at port 4326.
- `pnpm check` checks the component, build-script, and test types.
- `pnpm test` checks grouping and arrangement edits, reading-order and member preservation, invalid selections, and each exercise's saved-state validation using Node's native TypeScript test runner.
- `pnpm format` formats authored TypeScript and component CSS; `pnpm format:check` verifies formatting.
- `pnpm docs:build` bundles the components and creates `.docs-site` with fixed sources for static hosting.
- `pnpm docs:serve` serves that build with the reader inspection endpoints.

Author components in `components/source/`. `components/layout-examples.js` is generated browser output. Shiki runs only during the build to derive the restrained primitive/string palette from the reader's GitHub light and dark themes. The composition printer already knows each token's role, so the browser needs neither a grammar nor a highlighter runtime. It also formats groups against the code panel's measured character capacity (up to 80 columns): short leaf groups stay compact, longer groups break into indented children, and long string continuations retain indentation. Reformatting preserves node paths, editing selection, and keyboard focus. Build scripts and CSS imports are typed. The earlier standalone investigation remains a historical experiment, separate from these new components.

## Executable examples

`<axiomatic-example example="switcher">` renders a composition and its exact authored tree. The other examples are `flat`, `nested`, `grouped`, `nested-switcher`, `shelf`, `article`, and `event`.

Drag the right edge to change the example's actual available width, or edit its width field with the keyboard. Linked examples resize together; each can be made independent. Linked widths persist across chapter navigation within the browser session. A narrower page caps the actual width, which the field reports. There are no named viewport presets or breakpoint choices. The Switcher's second label is editable, so content can change its fit at a fixed width. Pointer moves are coalesced per animation frame; width storage is written on release. The grip follows the pointer vertically during a drag as the example changes height. The shared Switcher coordinator receives independent slot and row-requirement sizes from ResizeObserver. Content edits replace the registered tree; font, density and other sizing changes resize the requirement specimen directly, including at a fixed available width.

**Show structure** reveals nested boxes without changing their geometry. A quiet fill accumulates through the hierarchy. Hover or focus a composition name to inspect it; click or press Enter to retain the selection. Arrow Up/Down moves between names; Escape clears the selection. The selected box gets one outline, its actual gaps are hatched, and its whole source subtree is highlighted. The caption names the group and the arrangement in effect. A Switcher reads “now a row” or “now a column”, and the note beside it reads “Switcher: one row”, so the authored name stays distinct from the current result. Selecting a box in the example works too. Scrollable Shelf contents are clipped to their visible area. Linked examples share the structure toggle.

### Authoring exercises

`exercise` names an example's saved state and makes it editable. `edits` says what the reader may change: `grouping`, the default, `arrangement`, or `composition`. Each capability is an explicit opt-in; an unknown value throws. Every exercise keeps an independent composition and up to 25 undo states in session storage under its own name, and restores only states its own edits could have produced from its own starting composition. Navigation and component reloads retain edits.

#### Grouping

Add `exercise="execution"` to the flat example or `exercise="event"` to the event example. The validated saved state may only regroup that exercise's original content into Stacks, preserving every leaf and its reading order. A saved Shelf or Switcher is rejected.

Choose adjacent siblings in the picture or their code names. A dashed boundary previews a valid selection; Group creates a real Stack and selects it. Ungroup preserves the children and selects the freed members, making the move immediately reversible. Groups can themselves be grouped with a neighbor. Undo and an undoable Start over appear after an edit. Selecting a different level or a nonneighbor starts a fresh selection. Click a selected member to deselect it, or press Escape to clear. Code names use one tab stop with Up/Down navigation and Space/Enter selection; the picture retains ordinary text semantics.

The chosen members persist while structure inspection hovers over other nodes. Selecting one group reveals its outline and gaps even when the global structure view is off. These exercises forbid one-member and whole-parent wrapping to keep the initial lesson about observable grouping choices; those restrictions do not define the eventual algebra. The Shelf and Switcher examples that follow remain fixed compositions and say so explicitly.

#### Arrangement

`<axiomatic-example example="grouped" exercise="arrangement" edits="arrangement">` ends the first chapter. Its composition starts as `Stack(Stack(…three facts…), Stack(…two facts…))` and opens with the first inner group selected. It does not start from the grouping exercises, and no later example uses its result.

The reader selects one group, at any level including the root, and chooses Stack, Shelf or Switcher from a native radio group between the example and its code. The edit replaces that group's name and nothing else: members, content, order, nesting and every path stay the same. Choosing the current arrangement is not an edit and adds no undo state. The radio group's label counts the selected group's members; the status line beneath states the chosen arrangement's contract. A selected fact disables the choice and never stands for its parent. Selecting replaces the previous selection; Escape clears it.

The choice keeps keyboard focus through repeated changes, because an edit rerenders the example and code but not the authoring strip. Undo reselects the group whose arrangement it restored. Undo and Start over keep focus while they remain available and return it to the choice when they hide. Group and Ungroup are deliberately absent here: fixed membership keeps the experiment about one variable and keeps its prose true after any edit.

The saved state may change group kinds only. It is read position by position against the starting composition and rebuilt from that composition's own leaves, so stored data cannot regroup, reorder, replace or add content.

These are executable teaching models. The shared spacing policy starts at 8px, doubles a child's largest internal separation, and caps at 32px. Row separation has a one-em floor; the rule at a capped column boundary sits inside that interval. The article demonstrates a rule at the outer boundary when that policy runs out of spacing contrast. The policy has not established perceptual clarity for arbitrary depth or content. Switcher currently measures the unwrapped content; it does not yet negotiate preferred or minimum measures of arbitrary children.

## Current ts-docs integration

The reader preserves raw HTML in Markdown, serves published source files at `/_media/`, and follows explicit asset references in static builds. This is enough for site-owned custom elements today:

1. Each interactive chapter includes the generated component module. esbuild follows its TypeScript and CSS dependency graph into one browser asset.
2. Root-relative asset URLs work in chapter views and rendered Markdown under Files. This site assumes hosting at the origin root; subpath hosting needs an asset URL facility.
3. The historical investigation's imported `composition.js` is explicitly module-preloaded so the static build includes it.
4. Existing custom elements reconnect after reader live updates. The component listens to the pinned reader's `reader-sources-changed` event and reloads when its bundled revision changes. This internal event is a temporary integration seam; a supported component lifecycle is an upstream need. Adding a module to an already-open page for the first time can still require a reload.
5. Static builds require a compiler entry even when there is no API. The TypeScript component module is the entry and exports nothing, so no proposed library API is published.

Useful upstream extensions: supported component/asset registration with dependency collection and live-update lifecycle; base-path-aware asset URLs; guide-only operation without a compiler entry or an API navigation item. Width and structure controls belong to this site's examples; ts-docs supplies the extension mechanism.

## Review

Local discussion with Fable and verification records live in `documentation/review/`. They and the source archive are excluded from the reader inventory using `.gitignore`. The platform audit and implementation strategy are in `research/`. The public-facing guide distinguishes running examples from the future library contract.


### Combined investigation exercise

`<axiomatic-example example="investigation" exercise="investigation" edits="composition">` combines grouping and arrangement in chapter 3. It starts from six named facts in one Stack, drawn from the original investigation study. The destination remains text; the historical study carries the richer role and action contracts.

The grouping gesture stays additive: click adjacent siblings to include them, click a chosen member to remove it. Selecting another level or a nonneighbor starts a fresh selection. Clear selection and Escape provide a direct fresh start when moving between neighboring groups. The controls stay in place as selection changes. One selected group enables the arrangement radios; an inner group also enables Ungroup. Multiple neighboring members enable Group when at least one sibling remains outside. The root can be arranged but cannot be ungrouped. There is no separate editing mode switch.

Group selects its new Stack and focuses its code name. Ungroup selects the released members and focuses the first. Arrangement preserves selection and native radio focus. Combined Undo restores both the tree and the selection immediately before the edit; Start over is itself undoable. A single readout describes the selected item, or the overall modes when nothing is selected; the caption and status reserve space to keep neighboring code click targets steady. History snapshots store tree plus selection, and earlier tree-only histories remain readable. Restored paths are validated against their tree. Session state accepts arbitrary combinations of the three primitives with groups of at least two members, up to the validator's depth/node limits, preserving the supplied leaf kinds, text and order. Earlier exercise validators remain narrower.

The authoring code changes trees only. Primitive CSS, rendering, fit measurement and coordinator scheduling are shared unchanged with the earlier examples.

### Working copy: Make it yours

`<axiomatic-playground source-exercise="investigation">` continues chapter 3 with editable text and membership. The initial action copies the live exercise's composition; the working copy is saved independently. An explicit later copy is an undoable replacement. Both the wide card and narrow rail render that one working model through the same primitive runtime, each in its own slot. Their labels describe teaching hosts, not layout breakpoints.

Groups survive zero or one member with their arrangement intact. Selection in the code remains available even when a group has no visible contents. New content is Text; editing existing content preserves its kind. This does not establish a public sizing API for arbitrary children or a general spacing law for sparse groups. The focused investigation exercise retains its original fixed-content validation.

The component owns selection, text-edit transactions, shared history and persistence. Its rendered views share authored paths but scope inspection anchors separately. The native editor field lives outside the replaced compositions so live typing can retain focus and caret. Browser acceptance and the small bare-runtime cardinality fixture are recorded in `review/MAKE-IT-YOURS-ACCEPTANCE.md`.

In the guide, the working-copy inspector stays at the bottom of its workspace while comparing tall previews, with ordinary flow in short windows and a larger height guard for touch controls. Native keyboard scroll margins keep focused scrolling Shelves above it. Text-only replacement retains each Shelf's scroll position; structural edits create fresh views. Reload during typing retains the current wording as one Undo step.


#### Move intact members

Make it yours accepts one non-root member or a contiguous run of siblings. **Move** keeps that selection fixed while the reader chooses a destination in either preview or the declaration. **Before** and **After** use the destination's parent; **Inside at end** uses the destination group itself, including an empty group. Disabled placements are judged by the same pure model that commits moves. The controls name the surrounding parent so a fact inside a group and that group's name are meaningfully different anchors.

Moving preserves each member's object, descendants, arrangement and internal order. The source group survives empty or singleton. The model states a destination in the original tree and rebases its path/index after removal; one commit records the resulting tree and moved selection for Undo. Pending destination state is local to the interaction and is discarded on reload.

Solid inset edges mark moving members, including runs. Dashed edges mark the destination on real preview boxes; a dashed code underline coexists with the keyboard focus ring. Empty boxes use a quiet dotted placeholder and a stronger dashed destination cue. Source names describe moving members; `aria-current` marks the destination while normal selection toggles are suspended. Escape or Cancel restores normal editing; source selection remains. Primitive geometry and the Switcher coordinator are unchanged.

Qualification and colleague reconciliation are recorded in `review/MOVEMENT-ACCEPTANCE.md`.

### Take it with you

`playground/index.html` is a standalone static host, emitted at `/_media/documentation/playground/index.html`. It imports the generated component bundle and supplies the same light/dark theme variables as the guide. The lesson links to it explicitly so the reader's asset collector includes it in the static build.

`AxiomaticPlayground` still owns composition editing, history, inspection and two preview slots. Its `standalone` mode accepts an initial working copy and emits changes to its host instead of writing the lesson's session store. `AxiomaticWorkspace` owns draft selection, save status, routing and recovery. Snapshot views mount the bare primitive runtime in a fluid native slot. These mechanisms add no primitive geometry work.

The standalone editor pairs the same two previews with a hierarchy and a contextual inspector. **Outline** and **Code** are alternate views of one composition. An ordinary click selects one member; **Select several** (or Shift-click in the hierarchy) extends a neighboring selection. The selected group has an explicit parent link, arrangement choices, and direct additions inside or after it. Empty and singleton groups remain authored groups. Content roles describe what a text means, independently of prominence. **Start blank** changes the current draft as an Undo step; **New draft** creates another document.

The outline uses a flat selected wash and stronger text. Move retains its source selection while labeling a separate destination in words and with a dashed underline. The visible hierarchy receives keyboard focus after edits; switching Outline/Code and selection modes does not add document history. The guide retains the selection behavior taught by its exercises. Integration qualification is recorded in `review/WORKBENCH-INTEGRATION-ACCEPTANCE.md`.

`snapshot.ts` carries versioned, validated authored trees in URL fragments. Snapshots contain no draft identities, history, selection or example widths. `drafts.ts` validates versioned local workspaces. `draft-storage.ts` serializes read/check/write with native Web Locks and compares the saved draft with the editor's base. Different drafts merge against the latest workspace; a conflicting draft stops autosave and offers a separate copy or the saved version. Failed writes keep the in-memory editor and the previous saved bytes.

`#edit=` imports a new draft; its fragment is replaced by `#draft=` only after persistence succeeds. `#snapshot=` is read-only; Edit a copy creates a separate draft. `#draft=` refers to browser-local work. A snapshot's format is a compatibility commitment for this teaching editor, while the library API remains open. The model limits and browser qualification are recorded in `review/TAKE-WITH-YOU-ACCEPTANCE.md`.


#### Removing a draft

Removal and composition Undo are separate operations. **Remove draft** flushes current text, checks the saved base under the workspace's Web Lock, and records the whole draft in this tab's `sessionStorage` before updating the durable workspace. **Undo removal** merges that draft into the latest workspace, preserving other drafts' subsequent edits. One removal is retained through reload, until another removal replaces it or the tab closes. The status states that scope and has no timer.

An empty workspace is saved as version 1 with `activeId: null` and `drafts: []`, distinct from a first visit. Existing nonempty version 1 workspaces read identically. Another tab's removal preserves the current editor for saving a copy or explicitly closing it. If an older removal cannot be restored because the workspace is full, replacing its recovery entry requires an explicit choice naming both drafts. A recovery-storage failure prevents deletion; a durable-write failure attempts to restore the previous receipt. Neither storage area is a cloud backup or an atomic transaction spanning both browser stores.

The dedicated site's static build includes the guide, playground, component bundle and source assets together. It uses fixed reader sources rather than development live-update streams. Both surfaces are published at `https://axiomatic-layout.vercel.app`, in the `axiomatic-layout` project under `yehuda-katzs-projects`. Version 1 snapshot URLs keep their existing path. `scripts/stage-site.ts` packages the generated artifact and configures the root to open the guide.
