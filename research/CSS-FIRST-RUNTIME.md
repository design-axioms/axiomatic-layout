# The current CSS-first runtime

20 November 2026. The guide now uses separable primitives and a shared Switcher coordinator. This is a qualified implementation for the controlled teaching compositions, with the public library API still open. The [axioms](CSS-FIRST-AXIOMS.md) explain the direction; the [plan](CSS-FIRST-PLAN.md) records the delivery sequence.

## What an author describes

A composition states membership and arrangement. Stack keeps a sequence vertical; Shelf keeps a row and permits scrolling; Switcher chooses an atomic row or column from content and available space. Nesting keeps the same members and reading order through those changes. The guide now demonstrates Switcher inside Switcher: the outer group becomes a column first, giving its inner group room to remain a row.

The structural spacing policy is still provisional. The renderer emits levels and boundary cues when the tree changes. CSS maps those levels to 8/16/32px, with at least 1em separation in rows. This is not a published general spacing algebra.

## Who owns each operation

- `primitives.ts` renders native elements, structural metadata, and a distinct authored-node identity. `mountComposition` registers the resulting Switchers, replaces them on a tree edit, and unregisters them on disposal.
- `primitives.css` owns sizing, flow, gaps, overflow and the arrangement that follows a decision. It runs on a bare page or in the guide's shadow roots.
- `switcher-coordinator.ts` compares native observer-delivered requirements with slots and publishes changed decisions. One coordinator and one ResizeObserver serve each document. It reads no rectangles and schedules no animation-frame solver.
- The example controller owns width interaction, linked widths, editing and persistence. Formatting follows composition, code-panel width and font metrics. Inspection decorates the real boxes with CSS fills, outlines and anchors.

Plain Stack and Shelf compositions register no Switchers and create no requirement specimens. Their geometry remains native layout.

## The supported sizing contract

A host imposes an independent inline size on the root composition. For controlled text, each Switcher's requirement is its max-content row, with nested Switchers also arranged as rows. A persistent hidden specimen supplies that number through the shared observer. Each outermost Switcher owns one specimen of its subtree; nested Switchers observe their corresponding boxes inside it. The specimen is built from the composition, never cloned from a live arrangement. It carries no inspection identity, is inert and hidden from accessibility, and has a contained zero-size holder.

Content edits replace both representations. Inherited typography and the named CSS inputs reach both. Browser layout therefore reports changed requirements for fonts, text size, density and content without a separate font-reset cache. This is faithful controlled-text duplication, not a protocol for cloning arbitrary stateful components.

The available slot is a zero-block-size target spanning the Switcher's content inline size. A content-sized child of a row cannot supply an independent slot: its own arrangement would determine its width. In the supported tree, CSS derives a row for nested Switchers inside a fitting row or Shelf, including through Stack. The row requirement already allowed for those rows. A Shelf inside a Switcher contributes its full row requirement, so it does not need to scroll while that Switcher is a row. A column ancestor instead supplies a bounded slot, which the browser redelivers to deeper descendants when it changes.

The comparison is stateless. Equality is a row with 1/16px numerical slack; there is no hysteresis or authored collision breakpoint. The coordinator records all entries in a delivery before deciding, and writes only changed attributes. ResizeObserver redelivers targets deeper than the shallowest target delivered in the preceding round across the document. Slot placement and the scoped CSS rule are both part of this adapter's dependency contract; sorting writes alone would not establish it.

## Observing an explanation without changing the layout

Auxiliary targets carry exactly the dimensions their consumers need. Their unused axis is zero. An observation may depend on its host or an ancestor changing arrangement, but must not accidentally subscribe to a descendant's changing height. Dependent targets sit deeper than the deciding Switcher's targets, allowing same-frame redelivery.

Stage, viewport, code-panel and Shelf width observers use native zero-height boxes. Numeric captions observe the relevant axis of the first adjacent pair's CSS-anchored gap bands. Mode names follow the coordinator's attribute changes and read effective CSS direction, including derived nested rows. Inspection does not copy node rectangles into another drawing layer.

Remaining geometry/style reads have specific consumers:

| Read | Consumer and invalidation |
| --- | --- |
| One viewport rectangle and direction | Pointer-down establishes the drag origin and logical direction. Pointer moves write width through one coalesced frame. |
| Shelf scroll extent and client width | Keyboard scroll accessibility, when its width or anchored member extent changes. |
| Effective Switcher direction | Accessible source names and notes, after composition or published-mode changes. |
| Selected group's computed gap | Numeric caption, after selection, gap or mode changes. |
| Source font and a canvas glyph metric | Source formatting, on font readiness/loading; code width has its own observation. |
| Shelf scroll offset during working-copy text edits | Preserve view state when replacing the same authored paths; the browser clamps the restored offset. This runs on wording changes and cancellation, never on resize or structural edits. |

## A slot must remain independent

Classic scrollbar feedback is a real boundary. In the fixture, an outer width of 422.58px offered 422.58px without a scrollbar and 402.58px with one, against a 414.58px requirement. Starting wide produced a row; starting narrow produced a column. A scrollbar-induced slot change also produced an observer warning.

Native `scrollbar-gutter: stable` on the scroll host reserved the same space on each route and removed both effects. The documentation reader already uses a stable root gutter. A primitive does not silently style its ancestors; an integrating host must preserve the independent-slot condition. No dead band was introduced.

## Evidence and limits

Codex independently ran the bare runtime's 120-report suite across ten compositions in Chromium and Safari: no failed reports or observer-loop errors. It covers route independence around intrinsic requirements,240 after-layout frame samples per composition, fixed-width content/style/font changes, hidden states, reparenting, cleanup and separate shadow roots. Cases without Switchers skip Switcher-specific invalidation probes. Ten additional measurement-isolation reports passed in Chromium. A native Chromium trace and sampled filmstrip support the nested transition sequence; the after-layout sampler alone does not prove every compositor presentation.

The integrated guide preserves Group/Ungroup, Undo, keyboard focus, reopened grouping, linked and independent widths, pointer dragging, content editing and native inspection. A nested 120-frame sweep with inspection made no rectangle, client/scroll-width or source-rebuild calls; the caption refinement reduced computed-style calls from 132 to 14 in that specimen. These are call counts, not FPS or universal performance guarantees. Shelf accessibility deliberately still reads actual scroll extent.

A bounded-prose experiment showed a native child-owned width bound can change its contribution. The copy-free fit-content candidate still reports a nested group's current mode-dependent width, so it does not replace the independent specimen. Neither experiment changes the teaching authoring model.

Firefox has not been available for this qualification. Arbitrary children, late-loading images, vertical writing, independently styled nested components and cross-shadow nested composition need further adapter work. Separate guide examples in shadow roots are covered. The local review directory retains complete Chromium reports, Safari's result summary, fixture sources, and the review discussion; raw historical sources remain unchanged.
