# Browser capability inventory

Snapshot: `web-features@3.46.0`, retrieved 19 November 2026. Status is feature-specific. "Limited" is not a statement that no browser implements it. Full source data and the 1,240-record TSV are retained in the local review archive.

[Primary dataset](https://github.com/web-platform-dx/web-features) · [versioned distribution](https://unpkg.com/web-features@3.46.0/data.json)

## Features that affect the architecture

| Feature | Status | Newly Available | Specification |
| --- | --- | --- | --- |
| `flexbox` | Widely available | 2015-09-30 | [Definition](https://drafts.csswg.org/css-flexbox-1/) |
| `flexbox-gap` | Widely available | 2021-04-26 | [Definition](https://drafts.csswg.org/css-align-3/#gaps) |
| `grid` | Widely available | 2017-10-17 | [Definition](https://drafts.csswg.org/css-grid-3/) |
| `subgrid` | Widely available | 2023-09-15 | [Definition](https://drafts.csswg.org/css-grid-2/#subgrids) |
| `fit-content` | Widely available | 2021-11-02 | [Definition](https://drafts.csswg.org/css-sizing-4/#valdef-width-fit-content) |
| `logical-properties` | Widely available | 2021-09-20 | [Definition](https://drafts.csswg.org/css-logical-1/) |
| `container-queries` | Widely available | 2023-02-14 | [Definition](https://drafts.csswg.org/css-conditional-5/#container-queries) |
| `container-style-queries` | Newly available | 2026-05-19 | [Definition](https://drafts.csswg.org/css-conditional-5/#style-container) |
| `container-name-queries` | Newly available | 2026-05-07 | [Definition](https://drafts.csswg.org/css-conditional-5/#typedef-container-condition) |
| `container-scroll-state-queries` | Limited | — | [Definition](https://drafts.csswg.org/css-conditional-5/#scroll-state-container) |
| `has` | Widely available | 2023-12-19 | [Definition](https://drafts.csswg.org/selectors-4/#relational) |
| `scope` | Newly available | 2026-03-24 | [Definition](https://drafts.csswg.org/css-cascade-6/#scope-atrule) |
| `nesting` | Widely available | 2023-12-11 | [Definition](https://drafts.csswg.org/css-nesting-1/) |
| `cascade-layers` | Widely available | 2022-03-14 | [Definition](https://drafts.csswg.org/css-cascade-5/) |
| `registered-custom-properties` | Newly available | 2024-07-09 | [Definition](https://drafts.css-houdini.org/css-properties-values-api-1/) |
| `min-max-clamp` | Widely available | 2020-07-28 | [Definition](https://drafts.csswg.org/css-values-4/#comp-func) |
| `round-mod-rem` | Newly available | 2024-05-17 | [Definition](https://drafts.csswg.org/css-values-4/#round-func) |
| `abs-sign` | Newly available | 2025-06-26 | [Definition](https://drafts.csswg.org/css-values-4/#sign-funcs) |
| `progress-function` | Newly available | 2026-09-01 | [Definition](https://drafts.csswg.org/css-values-5/#progress) |
| `sibling-count` | Newly available | 2026-08-18 | [Definition](https://drafts.csswg.org/css-values-5/#tree-counting) |
| `if` | Limited | — | [Definition](https://drafts.csswg.org/css-values-5/#if-notation) |
| `calc-size` | Limited | — | [Definition](https://drafts.csswg.org/css-values-5/#calc-size) |
| `interpolate-size` | Limited | — | [Definition](https://drafts.csswg.org/css-values-5/#interpolate-size) |
| `anchor-positioning` (aggregate, includes additional subfeatures) | Limited | — | [Definition](https://drafts.csswg.org/css-anchor-position-1/#anchoring) |
| `anchor-name`, `anchor-scope`, `anchor()`, `anchor-size()` (property-level data) | Newly available | 2026-01-13 | [Definition](https://drafts.csswg.org/css-anchor-position-1/) |
| `position-anchor` (property-level data) | Newly available | 2026-09-14 | [Definition](https://drafts.csswg.org/css-anchor-position-1/#position-anchor) |
| `text-box` | Limited | — | [Definition](https://drafts.csswg.org/css-inline-3/#leading-trim) |
| `text-wrap-balance` | Newly available | 2024-05-13 | [Definition](https://drafts.csswg.org/css-text-4/#valdef-text-wrap-style-balance) |
| `text-wrap-pretty` | Limited | — | [Definition](https://drafts.csswg.org/css-text-4/#valdef-text-wrap-style-pretty) |
| `font-size-adjust` | Newly available | 2024-07-25 | [Definition](https://drafts.csswg.org/css-fonts-5/#font-size-adjust-prop) |
| `rcap` | Newly available | 2026-01-13 | [Definition](https://drafts.csswg.org/css-values-4/#font-relative-lengths) |
| `rch` | Newly available | 2026-01-13 | [Definition](https://drafts.csswg.org/css-values-4/#font-relative-lengths) |
| `rex` | Newly available | 2026-01-13 | [Definition](https://drafts.csswg.org/css-values-4/#font-relative-lengths) |
| `ric` | Newly available | 2026-01-13 | [Definition](https://drafts.csswg.org/css-values-4/#font-relative-lengths) |
| `cap` | Widely available | 2023-12-11 | [Definition](https://drafts.csswg.org/css-values-4/#cap) |
| `lh` | Widely available | 2023-11-21 | [Definition](https://drafts.csswg.org/css-values-4/#lh) |
| `rlh` | Widely available | 2023-11-21 | [Definition](https://drafts.csswg.org/css-values-4/#font-relative-lengths) |
| `display-contents` | Limited | — | [Definition](https://drafts.csswg.org/css-display-3/#box-generation) |
| `resize` | Limited | — | [Definition](https://drafts.csswg.org/css-ui-4/#resize) |
| `resize-observer` | Widely available | 2020-07-28 | [Definition](https://drafts.csswg.org/resize-observer-1/) |
| `mutationobserver` | Widely available | 2015-07-29 | [Definition](https://dom.spec.whatwg.org/#interface-mutationobserver) |
| `font-loading` | Widely available | 2020-01-15 | [Definition](https://drafts.csswg.org/css-font-loading-3/) |
| `pointer-events-api` | Widely available | 2020-07-28 | [Definition](https://w3c.github.io/pointerevents/) |
| `touch-action` | Widely available | 2019-09-19 | [Definition](https://w3c.github.io/pointerevents/#the-touch-action-css-property) |
| `field-sizing` | Newly available | 2026-06-16 | [Definition](https://drafts.csswg.org/css-forms-1/#field-sizing) |
| `highlight` | Newly available | 2026-03-24 | [Definition](https://drafts.csswg.org/css-highlight-api-1/) |
| `state` | Newly available | 2024-05-17 | [Definition](https://html.spec.whatwg.org/multipage/custom-elements.html#custom-state-pseudo-class) |
| `scoped-custom-element-registries` | Newly available | 2026-10-27 | [Definition](https://html.spec.whatwg.org/multipage/custom-elements.html#custom-elements-api) |
| `constructed-stylesheets` | Widely available | 2023-03-27 | [Definition](https://drafts.csswg.org/cssom-1/#dom-cssstylesheet-cssstylesheet) |
| `shadow-dom` | Widely available | 2020-01-15 | [Definition](https://dom.spec.whatwg.org/#shadow-trees) |
| `popover` | Newly available | 2025-01-27 | [Definition](https://html.spec.whatwg.org/multipage/popover.html) |
| `inert` | Widely available | 2023-04-11 | [Definition](https://html.spec.whatwg.org/multipage/interaction.html#inert-subtrees) |
| `view-transitions` | Newly available | 2025-10-14 | [Definition](https://drafts.csswg.org/css-view-transitions-1/) |
| `scroll-driven-animations` | Newly available | 2026-10-27 | [Definition](https://drafts.csswg.org/scroll-animations-1/) |
| `content-visibility` | Newly available | 2025-09-15 | [Definition](https://drafts.csswg.org/css-contain-2/#content-visibility) |
| `color-mix` | Widely available | 2023-05-09 | [Definition](https://drafts.csswg.org/css-color-5/#color-mix) |
| `light-dark` | Newly available | 2024-05-13 | [Definition](https://drafts.csswg.org/css-color-5/#light-dark) |
| `contrast-color` | Newly available | 2026-04-10 | [Definition](https://drafts.csswg.org/css-color-6/#funcdef-contrast-color) |
| `relative-color` | Newly available | 2024-09-16 | [Definition](https://drafts.csswg.org/css-color-5/#relative-colors) |
| `scrollbar-gutter` | Newly available | 2024-12-11 | [Definition](https://drafts.csswg.org/css-overflow-3/#scrollbar-gutter-property) |

## Every 2026 Newly Available record in this snapshot

This includes non-layout features so that the review does not confuse the small annual overview with the complete platform. Non-layout records do not create implementation dependencies for Axiomatic.

| Feature | Date | Area |
| --- | --- | --- |
| Active view transition (`active-view-transition`) | 2026-01-13 | view-transitions, selectors |
| alpha() (`alpha`) | 2026-09-14 | color-types |
| Animation accessors (`animations-css-animation-accessors`) | 2026-09-14 | animation, css |
| ariaNotify() (`arianotify`) | 2026-09-14 | Web API |
| Asynchronously iterable streams (`async-iterable-streams`) | 2026-09-14 | streams |
| autocorrect (`autocorrect`) | 2026-09-11 | Web API |
| baseline-shift (`baseline-shift`) | 2026-03-24 | text |
| Name-only container queries (`container-name-queries`) | 2026-05-07 | container-queries |
| Container style queries (`container-style-queries`) | 2026-05-19 | container-queries |
| contrast-color() (`contrast-color`) | 2026-04-10 | color-types |
| crisp-edges (`crisp-edges`) | 2026-05-07 | image-scaling |
| EXT_texture_norm16 WebGL extension (`ext-texture-norm16`) | 2026-10-27 | webgl-extensions |
| field-sizing (`field-sizing`) | 2026-06-16 | css |
| Math font family (`font-family-math`) | 2026-03-24 | mathml, css |
| Map getOrInsert() (`getorinsert`) | 2026-02-14 | maps |
| Custom highlights (`highlight`) | 2026-03-24 | Web API |
| Intl.Locale info (`intl-locale-info`) | 2026-07-21 | intl |
| Iterator.concat() (`iterator-concat`) | 2026-03-24 | iterators |
| JavaScript modules in service workers (`js-modules-service-workers`) | 2026-01-13 | js-modules, workers |
| JavaScript modules in shared workers (`js-modules-shared-workers`) | 2026-05-05 | js-modules, workers |
| light-dark() image values (`light-dark-image`) | 2026-09-14 | Web API |
| Math.sumPrecise() (`math-sum-precise`) | 2026-04-10 | javascript |
| Navigation API (`navigation`) | 2026-01-13 | navigation |
| :open (`open-pseudo`) | 2026-05-11 | selectors |
| overflow-anchor (`overflow-anchor`) | 2026-09-14 | scrolling |
| progress() (`progress-function`) | 2026-09-01 | css |
| rcap unit (`rcap`) | 2026-01-13 | units |
| rch unit (`rch`) | 2026-01-13 | units |
| Readable byte streams (`readable-byte-streams`) | 2026-03-24 | streams |
| Reporting API (`reporting`) | 2026-03-24 | reporting |
| CSP violation reports (`reporting-csp-violations`) | 2026-03-24 | reporting |
| revert-rule (`revert-rule`) | 2026-09-14 | explicit-defaults |
| rex unit (`rex`) | 2026-01-13 | units |
| ric unit (`ric`) | 2026-01-13 | units |
| @scope (`scope`) | 2026-03-24 | css |
| Scoped custom element registries (`scoped-custom-element-registries`) | 2026-10-27 | custom-elements |
| Scroll-driven animations (`scroll-driven-animations`) | 2026-10-27 | scrolling, animation |
| shape() (`shape-function`) | 2026-02-24 | clipping-shapes-masking |
| Shared worker (`shared-workers`) | 2026-05-05 | workers |
| sibling-count() and sibling-index() (`sibling-count`) | 2026-08-18 | css |
| text-decoration-skip-ink: all (`text-decoration-skip-ink-all`) | 2026-05-07 | text |
| text-indent: each-line (`text-indent-each-line`) | 2026-03-13 | text |
| text-indent: hanging (`text-indent-hanging`) | 2026-03-13 | text |
| ToggleEvent source (`toggleevent-source`) | 2026-05-11 | html |
| Top-level await (`top-level-await`) | 2026-09-14 | javascript |
| Trusted types (`trusted-types`) | 2026-02-24 | security |
| Branch hinting (WebAssembly) (`wasm-branch-hinting`) | 2026-02-24 | webassembly |
| JavaScript promise integration (WebAssembly) (`wasm-jspi`) | 2026-09-14 | webassembly |
| WebTransport (`webtransport`) | 2026-03-24 | Web API |
| Zstandard compression (`zstd`) | 2026-02-11 | Web API |

## Snapshot integrity

The exact `data.json` SHA-256 is `053be66208575f7ad8d90831452c9215ea04db563203d9e6beec1dbbdc0694d4`. The package metadata and original tarball are retained beside it. The archive is excluded from the documentation source inventory.
