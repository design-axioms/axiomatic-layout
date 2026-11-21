# Working on Axiomatic

For layout, primitive, example, or inspection changes, start with [the CSS-first axioms](research/CSS-FIRST-AXIOMS.md) and [the implementation plan](research/CSS-FIRST-PLAN.md). They carry the user's current direction and link the historical reasoning. The guide now uses the extracted runtime; consult [its contract and qualification](research/CSS-FIRST-RUNTIME.md) before extending a mechanism.

The [discussion plan](research/CSS-FIRST-DISCUSSION.md) records proposed milestone scope and execution ownership. Its alignment record distinguishes prepared work from authorized implementation; update it when the user establishes or revises that scope.

- Keep adaptation local to content and its actual slot. An authored container threshold is not a substitute for intrinsic switching.
- Let CSS own geometry, flow, sizing, gap application, overflow behavior, and decoration. Structural metadata computed when a composition changes is distinct from measuring layout on resize.
- Keep Switcher atomic: all one row or all one column. Use registered Switchers and one shared ResizeObserver/coordinator per document for the exceptional fit decision; CSS performs the arrangement.
- Respect containment dependencies. An ancestor mode change can invalidate a descendant's measured width. Cache intrinsic requirements with explicit invalidation, and change modes only when necessary.
- Keep requirements independent of current modes. A fresh content-sized box is not necessarily an independent available slot. Outside-in nested behavior is agreed, following the Prettier comparison. Keep the qualified controlled-text max-content adapter and nested CSS mechanisms covered by fixtures; do not promote them into universal rules for arbitrary children.
- Keep example-width interaction, composition editing, source formatting, and inspection separate from primitive layout. A plain Stack must not acquire a general JavaScript resize solver.
- Keep primitive CSS and the small coordinator usable on a bare page without the teaching controls. Let CSS map structural spacing metadata to lengths.
- Assess browser capabilities through Baseline Newly Available in 2026 at the property/function/value level. Use native boxes and the supported anchor subset before reproducing their rectangles in JavaScript. Treat containment as an explicit boundary decision.
- Preserve membership, reading order, accessibility, keyboard focus, authored state, and the explanatory value of the examples. Verify real interactions and nested cases as well as pure functions.
- Author TypeScript and ESM. Use the pinned Node/pnpm workflow. Keep public API and the general spacing algebra open until examples establish them.

Before adding runtime geometry work, explain its contract, native-CSS limitation, observed inputs, invalidation, and verification. New evidence can revise mechanisms; update the baseline rather than silently accumulating exceptions. Historical model claims such as “zero cost,” “unwrapped equals min-content,” or “sorting prevents cycles” are not guarantees. Preserve raw files under `history/sources/`; revise the linked synthesis instead.
