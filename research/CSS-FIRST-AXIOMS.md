# CSS-first implementation baseline

Axiomatic lets an author declare relationships that remain legible as content and available space change. CSS owns the resulting geometry. Runtime code supplies interaction state and the few decisions the platform cannot express faithfully.

This is the working implementation baseline requested by Yehuda on 19 November 2026. It carries forward his current direction and the original Gemini exchanges. It is not a claim that the current examples already satisfy it, nor a final library API. The [implementation plan](CSS-FIRST-PLAN.md) records the work needed. Historical constraints remain in the local [constraint introduction](../history/CONSTRAINTS.md).

**Review status:** Codex reread the original exchanges and checked the cited platform definitions. [Fable's review](../documentation/review/FABLE-CSS-FIRST-REVIEW.md) adds important nested-sizing questions and proposes a smaller implementation. Two nested-sizing predictions were reproduced in the original runtime and resolved by the replacement. The [runtime account](CSS-FIRST-RUNTIME.md) records the controlled adapter, qualification, and remaining boundaries. The [discussion plan](CSS-FIRST-DISCUSSION.md) separates the user-established baseline from those choices. [Collaboration status](../documentation/review/CSS-FIRST-REVIEW-STATUS.md).

## The axioms we build on

### 1. Composition declares relationships; adaptation preserves them

Grouping, arrangement, and prominence carry different information. Resizing may change arrangement or the cues that make a group apparent; it preserves membership, content, reading order, and the author's structural choices. A mechanical wrapper does not declare a semantic group. No fixed gap formula or universal rank value is established by this baseline.

**Origin:** [composition turn 2](../history/sources/chatgpt-composition.md#turn-02-user), [Gemini layout turn 7](../history/sources/gemini-layout.md#turn-07-user), and the user's current grouping exercise direction.

### 2. Responsive decisions come from content and its actual slot

A primitive responds to its own content and available space. Authors choose an arrangement contract, not a list of device sizes or a guessed collision threshold. Replacing a media query with an authored container threshold does not make the decision intrinsic. Container queries remain useful wherever their actual predicate expresses the intended relationship. Viewport or user-preference queries can still serve application chrome, accessibility, or other concerns outside this primitive-layout rule.

**Origin:** [Gemini layout turns 24–25](../history/sources/gemini-layout.md#turn-24-user); the current explicit no-breakpoint requirement. Historical fixed-threshold variants do not override that direction.

### 3. CSS owns placement, sizing, flow, and decoration

Use native flex/grid layout, intrinsic sizing, logical properties, gap, overflow behavior, and the supported platform for geometry. Stack and Shelf do not require a JavaScript resize solver. Selection outlines and fills belong on the existing boxes; where separate decorations are necessary, investigate CSS anchors before measuring and reproducing rectangles.

Computing structural metadata or a candidate spacing policy when the authored tree changes is allowed. Such work must not turn into recursive layout measurement on every width change. CSS-first is a division of responsibilities, not a ban on TypeScript, tree transformations, or interaction state.

**Origin:** [Gemini layout turn 22](../history/sources/gemini-layout.md#turn-22-user), C9 in the recovered constraints, and the current conversation's explicit boundary.

### 4. Switcher is an atomic arrangement decision with a narrow runtime boundary

Switcher puts all its members in one row when their agreed requirements fit; otherwise it puts all in one column. A 2+1 wrap is a different contract. A small adapter may obtain intrinsic requirements from the browser and publish the mode that CSS implements. It does not assign every child's position or reproduce flex/grid layout.

The shared-controller direction is established: registered Switchers, one shared ResizeObserver for them per document, cached requirements, and containment-ordered processing. Keep this runtime small, as the original proposal requests. This is a boundary around the exceptional work, not a new general-purpose layout engine. Separate observers for unrelated tools such as source formatting are not violations; funneling every example change through the Switcher controller would be.

**Origin:** [Gemini layout turn 23](../history/sources/gemini-layout.md#turn-23-user) establishes the atomic contract; [turn 25](../history/sources/gemini-layout.md#turn-25-user) accepts small JavaScript for intrinsic switching; [turn 26](../history/sources/gemini-layout.md#turn-26-user) proposes the shared controller. Yehuda explicitly reaffirmed this architecture in the current conversation.

### 5. Measurement follows dependencies, with explicit invalidation

Distinguish available space from a child's intrinsic requirement. Process dependent decisions ancestor before descendant, using the actual containment relationship. Independent Switchers can be batched. Where a host imposes a width, an ancestor mode change can invalidate prior observations of that slot; merely sorting already-computed decisions is insufficient. Where a host sizes from content, refreshing the child's own width cannot by itself supply an independent fit constraint.

A fresh size is not automatically an independent available-space constraint. In a content-sized row, a nested Switcher's own mode can determine its width. The requirement must be independent of current modes, and the supported host must supply a meaningful slot. Fable predicts a narrow-to-wide jump can expose this feedback in the current code; the plan tests it before choosing a scheduler. Test that typing, dragging and mounting with the same content and width converge to the same arrangement outside any deliberately declared dead band. The initial candidate has no dead band.

Cache requirements while their inputs remain unchanged. Content, child insertion/removal, relevant fonts, typography, density/gap, and nested requirement changes can invalidate them. Prefer dimensions already delivered by ResizeObserver. Separate necessary geometry reads from writes, change mode only when needed, and disconnect registrations cleanly.

One shared observer does not promise one browser layout pass. Feedback, stale entries, scrollbar-induced changes, and nested sizing need explicit handling and verification. A measured exception must identify its input, invalidation, and consumer.

Prefer native observation where it faithfully carries these dependencies. Whether browser redelivery plus a scoped CSS rule can replace a hand-maintained ancestry walk is a prototype question. So are observing an independent inline-size target and a persistent requirement specimen. None is established as a universal adapter rule.

**Origin:** the user's containment-order proposal; corrections to the [Gemini turn 26 implementation sketch](../history/sources/gemini-layout.md#turn-26-assistant). ResizeObserver's [processing model](https://drafts.csswg.org/resize-observer/#broadcast-resize-observations) defines delivery and depth-based loop handling, not an application-level convergence guarantee.

### 6. Teaching instruments observe the composition without becoming its layout engine

The resizer changes available space. The editor changes the tree. The inspector explains the resulting boxes. The source printer formats the declaration against the code panel's width. Each responds to its own inputs; a drag must not rerender the source or reconstruct an unrelated inspection layer.

Keep native semantics, reading and focus order, keyboard access, linked/independent width behavior, undo, and saved composition state. Instrumentation must preserve layout geometry when toggled. Replacing SVG with CSS is successful only if selection, clipped Shelf contents, gap explanations, and nested boundaries remain understandable.

Primitive CSS and the coordinator should also run on a bare page without importing the guide's editor, inspector or resizer. That gives the intended reuse across projects a concrete check while the public API remains open ([Gemini layout turn 39](../history/sources/gemini-layout.md#turn-39-user)).

**Origin:** current guide interactions and user feedback on disconnected sliders, selectable text, inspection, formatting, and resize jank; [Gemini layout turns 14–15](../history/sources/gemini-layout.md#turn-14-user) on accessibility and native facilities.

### 7. Use the supported platform through Baseline Newly Available in 2026

Assess the specific property/function/value required, not only an aggregate feature-family label. Check compatibility and then test behavior against our contract. Core anchor features are available within this target even though the aggregate family still includes limited subfeatures. See the corrected [inventory](BASELINE-INVENTORY.md) and [implementation strategy](IMPLEMENTATION-STRATEGY.md).

Containment is chosen for a proven boundary. `contain: strict`, `contain: content`, and `container-type: inline-size` are not automatic decorations for every primitive: they can change intrinsic contributions, clipping, containing blocks, and overflow behavior. Likewise, an available feature is not evidence that it meets the all-row/all-column contract.

**Origin:** Yehuda's explicit 2026 platform target, and the audit correction prompted by his resize implementation review. The historical containment suggestions in [turns 30–31](../history/sources/gemini-layout.md#turn-30-user) are questions and model proposals, not universal constraints.

## Settled direction, open mechanisms

| Established baseline | Mechanism still to establish |
| --- | --- |
| Local, content-driven adaptation; no authored Switcher collision breakpoint | What requirement a paragraph, image, or separately authored child contributes |
| Atomic row/column switching | Minimum, preferred, or unwrapped sizing policy for each supported child contract |
| Shared Switcher registration and observer; ancestor-first dependency handling | How to refresh descendant measurements after an ancestor change without unnecessary work or visible lag |
| CSS owns geometry and inspection decoration where it can | Exact anchor/pseudo-element construction, clipping behavior, and any narrowly justified numeric readouts |
| Meaningful hierarchy survives changes in arrangement | General spacing and cue algebra beyond the current teaching policy |
| Requirements cached with invalidation | The public adapter and notification protocol for independently authored children |

The current examples use an unwrapped text-row requirement. That policy can remain an explicitly named first fixture while other child contracts are tested. The historical consolidation called unwrapped width `min-content`; those differ. [CSS Sizing](https://drafts.csswg.org/css-sizing-3/#intrinsic-sizes) defines minimum and maximum intrinsic sizes separately. Recover the content-driven intent without copying the mistaken equivalence.

Yehuda agreed to **outside-in** behavior after comparing Prettier's ordinary nested groups: breaking an outer group gives its inner groups space to remain intact. For the controlled text adapter, investigate a mode-independent max-content row requirement, with nested Switchers measured as rows. The behavior is agreed; the measurement and nested CSS mechanisms remain candidates. The [first current-runtime fixtures](../documentation/review/css-first-fixtures/OBSERVATIONS.md) reproduce both a stuck inner column after a width jump and a mode-dependent requirement after recalibration.

Preserve equality-as-row from the current implementation and the [original canvas](../history/sources/gemini-layout.md#turn-02-user), qualifying numerical tolerance in the fixture. Avoiding oscillation is also a historical concern: the [recovered drawing](../history/evidence/layout-diagram-1-preview.png) names a dead band. Test a scrollbar-induced feedback case and native mitigation before adopting hysteresis. A dead band intentionally makes some decisions depend on prior state, so it must be reconciled with the initial path-independent policy rather than added silently.

## Before adding runtime layout work

A change should explain the behavior it preserves, why native CSS does not express that behavior, which inputs it observes, and how it invalidates cached results. Test the smallest relevant composition and a nested real-text case. Keep measured results distinct from predictions; reduced layout counts alone do not establish a sound architecture or a smooth interaction.

A new browser capability or counterexample may revise a mechanism. Record the evidence and update this baseline where necessary. Historical prose that calls a mechanism immutable or zero-cost is not a substitute for that judgment.
