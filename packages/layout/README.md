# Axiomatic Layout

This local package arranges existing HTML elements marked as Stack, Shelf or Switcher. A member marked as an atom is a native action that keeps its natural, unwrapped width.

```html
<nav id="actions" data-axiomatic="Switcher">
  <a data-axiomatic-atom href="#session">Open session</a>
  <button data-axiomatic-atom>Follow</button>
</nav>
```

```ts
import "@design-axioms/layout/style.css";
import { registerAuthoredComposition } from "@design-axioms/layout";

const actions = registerAuthoredComposition(document.querySelector("nav")!);
```

Call `actions.refresh()` after changing membership and `actions.dispose()` when removing the composition. The stylesheet includes the group geometry and native-action rules in cascade order.

From the repository root, run `pnpm install --frozen-lockfile`, then `pnpm --filter @design-axioms/layout pack --pack-destination /tmp` to build an installable archive.
