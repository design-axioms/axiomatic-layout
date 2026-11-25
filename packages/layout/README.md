# Axiomatic Layout

This local package arranges application-owned groups of native actions. Mark the outer group and each nested group with `data-axiomatic="Stack"`, `"Shelf"` or `"Switcher"`. Mark each action with `data-axiomatic-atom`. The application keeps the same elements, listeners, focus and form values as each Switcher changes arrangement.

```html
<nav id="actions" data-axiomatic="Switcher">
  <a data-axiomatic-atom href="#session">Open session</a>
  <button data-axiomatic-atom>Follow</button>
</nav>
```

```ts
import "@design-axioms/layout/style.css";
import { registerAuthoredComposition } from "@design-axioms/layout";

const actions = registerAuthoredComposition(document.querySelector<HTMLElement>("#actions")!);
```

Register the outer group once. Call `actions.refresh()` after adding, moving or removing members or changing a group’s kind. Changes to action labels, fonts or available width update automatically. Call `actions.dispose()` when removing the composition.

The stylesheet keeps each action at its natural unwrapped width. Give groups a length-based column gap and keep inline padding, borders and margins on a wrapper outside any nested group inside a Switcher. The outer Switcher can have its own padding and border. Put text inside each action so that every direct member is a marked action or group. This version supports groups of these actions in horizontal writing within one DOM tree. Wrapping paragraphs, images and children whose width depends on the group’s arrangement are outside that contract.

From the repository root, run `pnpm install --frozen-lockfile`, then `pnpm --filter @design-axioms/layout pack --pack-destination /tmp` to build an installable archive.
