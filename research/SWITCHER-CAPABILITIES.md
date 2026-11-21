# Switcher capability assessment

19 November 2026. Codex capability assessment. The earlier standalone validation attempt failed; [Fable's subsequent CSS-first review](../documentation/review/FABLE-CSS-FIRST-REVIEW.md) now examines the history, current source, nested sizing and observer model. Its proposed mechanisms still need browser fixtures; it is not an exhaustive proof against every CSS-only construction.

The current user-confirmed architectural boundary and historical rereading are recorded in [CSS-first axioms](CSS-FIRST-AXIOMS.md) and the [implementation plan](CSS-FIRST-PLAN.md). They adopt the shared coordinator direction while keeping the sizing mechanism and any CSS-only alternative subject to evidence.

## Contract before technique

The contract under examination is arbitrary unequal children, all in one row when their agreed requirements fit, otherwise all in one column. No authored viewport threshold. Ordinary text wrapping inside a child is a different question from whether the whole group changes orientation.

The current teaching model uses each child's unwrapped content as its requirement. That is concrete and testable, but it is not automatically the right contract for paragraphs, images, independently authored components, or nested responsive groups. The library needs a definition of an acceptable row contribution—intrinsic minimum, preferred measure, or an explicit sizing protocol—before its fit algorithm can be final.

The proposed initial adapter makes this more precise as a mode-independent max-content row requirement for controlled content, with nested Switchers measured as rows. This is distinct from min-content and implies a nested behavior choice now recorded in the discussion plan. The existing probe only forces its outer clone into a row, so it does not yet establish that requirement for arbitrary nesting.

## What the native alternatives establish

| Candidate | Useful capability | Remaining gap for this contract |
| --- | --- | --- |
| Flex wrapping | Browser computes intrinsic contributions and wraps children | Three unequal items can form 2+1. The group has not switched as a whole. Two children conceal this difference. |
| Grid auto-fit / auto-fill | Browser selects a number of tracks | Intermediate track counts are valid. An authored minimum track size does not derive arbitrary child requirements. |
| Arithmetic flex-basis “switcher” | A supplied threshold can force every item to occupy a line | The threshold remains supplied. An equal minimum per child changes the contract and can reject a row of unequal children that fits. |
| Container size queries | Respond to local available space | The predicate needs a comparison value; CSS does not expose a sum of arbitrary descendant intrinsic requirements to that predicate. Size containment also changes intrinsic contribution. |
| Container style queries | Select descendants from custom-property context | Useful once an adapter supplies a mode or requirement. They do not independently compute child fit. |
| `:has()` and sibling-count/index | Select from structure and count children | Structural information is not measured inline size or flex-line membership. |
| `calc-size()` / intrinsic-size interpolation | Arithmetic on one sizing basis; transitions involving intrinsic sizes | Not a general measurement channel for sibling requirements, and not Baseline in the retained dataset. |
| Scroll-state queries | Can condition descendants on scrolling state in supporting browsers | Limited availability; overflow is a result of a chosen layout, not an independent fit requirement. Feedback/cycle rules and wrappers need a specific proof. |

These are capability comparisons, not a mathematical impossibility proof for all CSS constructions. Native CSS can fully implement narrower contracts. We should use it wherever the intended contract permits it rather than force arbitrary-content semantics onto an equal-track technique.

The small `documentation/review/switcher-probes/index.html` example isolates the flex-wrapping counterexample: requirements 80, 120, 90 with a 10px gap need 310px in one row; at 250px ordinary wrapping produces 2+1. Verified in the in-app browser: the first two boxes share top 189.4375px; the third starts at 247.4375px. Their measured widths are exactly 80, 120 and 90px.

## Recommended boundary to prototype

Keep placement, gap, typography, intrinsic layout, and the final row/column layout in CSS. Prototype a small adapter that compares available inline size to the chosen row requirement and publishes only the layout decision. ResizeObserver is a plausible observation mechanism, not the definition of Switcher.

Do not treat the teaching demo's cached clone probe as the general library adapter. Cloning arbitrary children may lose component state, form state, canvas content and shadow trees; it can duplicate IDs and trigger custom-element lifecycle. Prefer a child sizing protocol or a controlled measurement representation. Cache requirements when only available space changes. Batch necessary reads and writes, change mode only when necessary, and observe requirement changes as well as container changes. Include content changes, font loading, density, child insertion/removal and lifecycle cleanup. Define how nested responsive children report requirements without oscillation.

The next focused experiment should compare min-content, preferred-measure and unwrapped policies on the same real investigation content. That decision affects both correctness and whether the behavior feels automatic to an author.

## Primary sources

- [Flex layout: lines and line collection](https://drafts.csswg.org/css-flexbox-1/#line-break).
- [Container query features and containment](https://drafts.csswg.org/css-conditional-5/#container-features).
- [CSS Values and Units Level 5](https://drafts.csswg.org/css-values-5/#calc-size).
- [Web Platform DX feature data](https://github.com/web-platform-dx/web-features), release 3.46.0 retained in `documentation/review/baseline/`.
