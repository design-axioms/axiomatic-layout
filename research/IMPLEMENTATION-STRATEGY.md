# Axiomatic and the browser platform

**20 November implementation update:** The guide now uses the extracted CSS-first runtime. See [the current contract and qualification](CSS-FIRST-RUNTIME.md). The capability assessment below records the reasoning that led to it; descriptions of the earlier coupled controller are historical.

Working implementation direction, reviewed against the platform on 19 November 2026. The algebra describes relationships and compositional behavior. Browser capabilities determine how cheaply and faithfully we can implement those contracts; they do not define the concepts we teach.

Current implementation baseline: [CSS-first axioms](CSS-FIRST-AXIOMS.md). Delivery sequence and acceptance behavior: [CSS-first plan](CSS-FIRST-PLAN.md). These narrow the broad platform survey into the responsibilities we now intend to enforce.

## Scope and evidence

We downloaded `web-features` 3.46.0 from the project's npm distribution, retained its complete 1,240-feature dataset and a searchable inventory in the local `documentation/review/baseline/` archive, and screened CSS, layout, typography, component, interaction, and observation capabilities. The CSS sweep includes 473 records; the 2026 Newly Available sweep includes 50 records across all areas. This is a platform inventory and a focused architectural review, not a claim to have tested every API in every browser.

The dataset is maintained by [Web Platform DX](https://github.com/web-platform-dx/web-features). Baseline dates are adoption facts, not proof that a feature satisfies our contract. Use the entire available platform through Newly Available in 2026, with explicit exceptions where a feature is still limited. The [2026 overview](https://web.dev/baseline/2026) is useful orientation; the underlying dataset is more complete than the overview page.

## Delegate layout to the browser

**Layout and intrinsic measurement.** Use flex and grid, `gap`, intrinsic sizes, `min()`/`max()`/`clamp()`, logical properties, and wrapping for routine layout. Use subgrid where a composition deliberately participates in shared tracks. Avoid turning every primitive into a measuring script. Source order should remain reading and keyboard order. A Shelf's overflow contract and a Switcher's all-or-one contract are different; choosing flex wrapping must not silently turn one into the other.

**Containment is an architectural choice.** Container queries and units can express relationships to a containing space, but size containment changes intrinsic contribution. Do not install `container-type: inline-size` on every transparent wrapper. A size query with an authored threshold is still an authored threshold; changing `@media` to `@container` does not satisfy the no-breakpoint axiom. Use queries where their condition actually belongs to the contract.

**Compositional context.** Newly Available container style queries can select descendants based on custom-property context; `@scope` can bound selectors; cascade layers and `:where()` keep defaults overridable without specificity escalation. These reduce plumbing for inherited context such as density and presentation mode. They do not compute the maximum intrinsic requirement of arbitrarily nested descendants or send a child report upward. A child-to-parent contract still needs to be designed explicitly. Registered properties provide types and inheritance control, not recursive aggregation. These are design inferences from the [conditional rules](https://drafts.csswg.org/css-conditional-5/#style-container) and [scope](https://drafts.csswg.org/css-cascade-6/#scope-atrule) mechanisms.

**Typed CSS arithmetic.** Use supported arithmetic and font-relative units to derive values rather than emit computed pixels from JavaScript. `sibling-count()` and `sibling-index()` now remove some DOM-count plumbing; they count element siblings, so adapters must distinguish semantic children from mechanical wrappers. `progress()` supports continuous interpolation between supplied values. Neither feature measures child fit. [Values and Units Level 5](https://drafts.csswg.org/css-values-5/#tree-counting) contains both implemented features and proposals: verify adoption per feature, not per specification.

**Typography.** Use normal line layout, `lh`/`rlh`, `cap`, the newly available root-relative font units, and `text-wrap: balance` where appropriate. `font-size-adjust` can stabilize fallback metrics. Keep actual typography in fit calculations: text length, font loading, language, writing mode, and zoom matter. `text-box`, `calc-size()`, intrinsic-size interpolation, and `text-wrap: pretty` are not Baseline in the retained dataset. They are experiments or enhancements, not foundational assumptions. The guide removed its unconditional `text-wrap: pretty` declaration.

**Component and inspection UI.** Custom elements, shadow roots, shared constructed stylesheets, Pointer Events and pointer capture, inert probe content, and ResizeObserver cover the current integration. Scoped custom-element registries are Newly Available in 2026 and are worth considering for independent versions; they are not required just to put several examples on a page. `field-sizing` can size small editors naturally. Native CSS `resize` remains limited in the dataset, and its browser handle does not provide the linked-width and keyboard interaction we want, so the example uses an edge grip plus one native number input.

**Color and annotation.** Use inherited `color-scheme`, `light-dark()`, `color-mix()`, and relative colors for theming. Custom Highlights is newly available and useful for range annotations without extra markup. The composition already has a typed tree, so emitting token spans gives stable tree-to-box targets at negligible runtime cost. Shiki supplies the theme palette at build time. `contrast-color()` is available but does not select a nuanced multi-tone palette for us.

**Rendering and motion.** Content visibility and intrinsic-size placeholders may help very large documents, but skipping layout conflicts with measuring an offscreen example. Use them only outside measurement-dependent regions. View transitions and scroll-driven animations can explain change; they should not become a dependency of correct layout. Preserve reduced-motion preferences. Core anchor positioning is available within the requested Baseline 2026 target: `anchor-name`, `anchor-scope`, `anchor()`, and `anchor-size()` have property-level Newly Available dates of 13 January 2026 in the retained data; `position-anchor` has 14 September 2026. The aggregate `anchor-positioning` record is still limited because it includes additional subfeatures. Use the supported subset when investigating inspection overlays, and verify clipping and shadow-root scoping in the actual component. Scroll-state queries and newer conditional functions remain candidates to revisit rather than assumed foundations.

## Keep the JavaScript boundary small

The [Switcher capability assessment](SWITCHER-CAPABILITIES.md) compares native alternatives against unequal children and an all-row-or-all-column contract. Ordinary wrapping admits intermediate arrangements; container queries, structure selectors and arithmetic do not by themselves supply an arbitrary child requirement aggregate. The current direction is a small measurement adapter with CSS performing layout. The current user-confirmed baseline adopts a shared Switcher coordinator; its sizing and scheduling mechanisms remain to prototype. This is not a proof that every CSS construction fails. The original fresh-session validation attempt failed. [Fable’s later completed review](../documentation/review/FABLE-CSS-FIRST-REVIEW.md) now examines the history, source and observer boundary, and proposes nested-sizing fixtures; browser validation of those mechanisms is still ahead.

The current teaching probe compares an unwrapped row's requirement with available space and sets a direction. That demonstrates content dependence, not a general child sizing protocol. A library must define meaningful requirements for nested and separately authored children. Avoid cloning arbitrary live components as the general solution; their state and shadow trees may not survive cloning. Cache requirements and isolate observation from layout decisions.

For a library implementation, any observer-based solution must observe both available space and the relevant child requirements, handle font/content changes, batch reads and writes, avoid observation feedback, and clean up on disconnect. A viewport listener alone is insufficient. The documentation overlay is separate instrumentation: it reads final boxes and draws without changing their geometry.

## Correction after the resize review

The initial inventory used aggregate feature statuses too broadly for anchor positioning. Checking the retained `status.by_compat_key` entries and current MDN references ([anchor-name](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/anchor-name), [position-anchor](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position-anchor), [anchor()](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/anchor)) establishes availability of the core subset through Baseline 2026. The aggregate row must not exclude that subset from architectural consideration.

The current example component also couples width changes to a broad measurement/update routine even for plain Stacks. The resize patch coalesces pointer moves and caches Switcher probes, but leaves a second animation-frame stage, observer-driven repeat scheduling, mixed geometry reads and DOM writes, and SVG reconstruction for annotations. Those are teaching UI implementation choices, not requirements of hierarchical layout. Refactor toward CSS-owned box decoration and supported anchor positioning where separate overlays are needed; observe only the dimensions required by each consumer. Keep Switcher's provisional fit adapter separate. This direction is proposed, not implemented or cross-browser verified by this review.

## Validation sequence

1. Exercise candidate CSS-only alternatives against unequal three-child examples, nested responsive children, long localized text, and font changes. Record precisely which contract they satisfy.
2. Rebuild the investigation using the chosen primitives; record remaining per-example adjustments.
3. Test the component boundary with separately implemented children and neutral wrappers, plus RTL/vertical writing, empty/unary groups, and density.
4. Test supported target browsers, including Newly Available features, before calling the library baseline-qualified. An in-app Chromium check is only one implementation.
5. Keep the user-facing guide about composition. Maintain capability decisions and compatibility evidence here.

## Tooling

Authored components and scripts are TypeScript with `type: module`, strict checking, unchecked-index and exact-optional checks, and erasable syntax. Node 24 runs the scripts directly. pnpm pins the reader-compatible TypeScript compiler, Shiki, and esbuild; the browser consumes a generated ESM bundle. The existing investigation is preserved as historical JavaScript until its planned reconstruction rather than silently rewritten under a changed model.
