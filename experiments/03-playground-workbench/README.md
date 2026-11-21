# A more direct composition editor

21 November 2026. A working interaction study responding to Yehuda's screenshot of the standalone playground. This is a proposal to try, not a deployed replacement or a new library API.

Open [the local study](http://127.0.0.1:8788/). Changes are temporary: reloading resets it. The deployed guide, drafts, and snapshot format are unaffected.

## What we are testing

The standalone editor inherited selection rules and controls from guided lessons. A new visitor has none of that instructional context. Clicking neighboring facts could silently extend a selection, the selected object's identity was missing from the controls, and adding required combining a kind selector with a placement command. The two previews were physically separated by a growing wrapper.

The proposed workflow is: select a part, see its parent and applicable controls, make one explicit change, and see it in both spaces.

- Plain clicks select one item. **Select several** deliberately enables neighboring-member selection across the outline, code, and previews. Shift-click additionally extends selection in the outline; it is not advertised as a universal gesture in this study.
- **Composition** offers an outline and the existing selectable code as alternative views. Groups, including empty groups, have reachable names.
- The contextual editor names its subject and exposes a parent button. It distinguishes content roles from group arrangements; no prominence control is implied.
- Adding text or an empty group is direct. Selecting a group defaults to adding inside it; a secondary action explicitly switches to adding after it.
- Both previews sit together. The card resizes continuously; the rail receives a different actual slot. Undo is outside the contextual editor, and changing starting points is undoable.

This uses the existing composition model, edit operations, source printer, preview component, primitive CSS, and Switcher coordinator. It does not simulate layout. The only shared-source addition is an optional `width.availableSpace` host on `CompositionPreview`. Browser testing showed that a shrink-wrapped preview cannot itself supply the maximum width to which it may grow. The study supplies an independent CSS-sized slot to the existing inline-size observer; existing consumers retain their original default. No new geometry reads or primitive solver were added.

## Colleague review and remaining decisions

[Fable](../../documentation/review/FABLE-INTUITIVE-PLAYGROUND.md) favors making code itself the primary selector: one member per line and whole-row targets. [Neon](../../documentation/review/NEON-INTUITIVE-PLAYGROUND.md) favors a plain outline with code available as an alternative. Both recommended a named contextual editor, explicit selection extension, direct insertion, and paired previews. Their two review rounds were collected to terminal completion; their reviews are source-based, with browser validation owned by Codex.

The current Code view is the existing fitted source. Comparing it with Outline does not yet evaluate Fable's stronger proposal for a redesigned code selector. The pattern of selecting in a hierarchy and editing that object's properties has useful precedent in [Figma's properties panel](https://help.figma.com/hc/en-us/articles/360039832014-Design-prototype-and-explore-layer-properties-in-the-right-sidebar) and [Webflow's Navigator](https://help.webflow.com/hc/en-us/articles/33961320786451-Navigator). Axiomatic's content-dependent adaptation and composition model remain its own.

Review fixes adopted: insertion after inner groups; a consistent nonempty selection; accurate select-versus-edit wording; focus on Add text after empty-group creation; focus recovery when Undo becomes disabled; Escape cancels rewording and closes insertion/starting-point disclosures; visible empty-group markers; inset selection outlines; no extra Undo for loading an identical starting point. Loading Investigation offers a 600px card to reveal its three-member Switcher's row/column contrast when the page has room.

The next integration still needs Move and its destination cues, durable drafts, document actions, and full keyboard parity with the production editor. Those features remain available in the live playground, but are deliberately absent from this study. Keep the accepted undoable blank start when integrating. Neither example-first drafts nor removing blank start was adopted as a product decision.

One open layout question: previews above the editor can grow while typing, pushing the editor downward. That deserves observation with real compositions before settling the workbench arrangement. The study is evidence for selection and contextual editing, not proof of complete usability.

## Checks performed

Codex exercised the local study in Chromium: consecutive plain-click selections retain the wording editor; explicit neighboring selection and grouping update both views and Code; parent selection exposes arrangement; empty Switcher creation, singleton preservation, last-child removal, and Undo preserve the group; a new fact can be inserted between two groups; Escape restores wording; typed width and pointer dragging change the same three-member Switcher between row and column while the rail stays a column. No console warnings or errors were observed during the inspected sequence.

The source passes strict TypeScript (including exact optional properties and unchecked indexing), repository typechecking, formatting, and its esbuild build. At an observed narrow viewport of 520 CSS pixels, controls remained available and document width matched viewport width. This is not cross-browser or comprehensive mobile qualification. Persistence, handoff, snapshots, and Move require integration qualification later.

## Run again

From the repository root, with its pinned Node 24:

```sh
node experiments/03-playground-workbench/build.ts
python3 -m http.server 8788 --bind 127.0.0.1 --directory .local/workbench-site
```

The generated bundle and a review capture live under `.local/`; this study is not in the published guide's build.
