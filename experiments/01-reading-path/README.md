# Reading an investigation

This first Axiomatic study lets Yehuda, Codex, and Fable compare two authored presentations of the same facts. It is a small executable experiment, not a library API or a finished spacing algebra.

Run from the workspace:

```sh
python3 -m http.server 8786 --bind 127.0.0.1 --directory experiments/01-reading-path
```

Open <http://127.0.0.1:8786/>. Controls are encoded in the URL so a particular case can be reopened. No dependencies, build, remote fonts, analytics, or external actions. The links open local context using a native dialog.

## What to try

Start with the normal editorial account beside Execution. Read it once, then choose Separate groups. Both name the same finding, completion state, remediation Plan, pending approval, investigation update time, and destinations. The treatments use the same role-based styling policy. The separate groups version is a candidate composition, not a reconstruction of a rejected Admin revision.

Move the specimen below Execution, reduce its available width, and try compact density. Change approval to urgent: the editorial account gains an explicitly authored status line. In the grouped version, urgency emphasizes the existing Plan status without loosening its attachment. In the editorial version the author lifts the named approval out of prose, so it is stated once. The urgency does not change which investigation completed or what the timestamp dates. No deadline or approval action is invented. The missing state removes the finding, Plan, timestamp and session action while preserving the other destinations.

The composition view is serialized from the exact object tree passed to the renderer. There is no second semantic tree or decorative pseudocode. The visible notation is a readable serialization of a provisional internal representation; it is not a chosen public syntax. Inspect `composition.js` for the actual authoring code.

The wrapper control introduces an ordinary block box around the destinations, at a boundary where the parent spacing policy matters. The renderer forwards the child’s layout-facing role through that box. The neighbor control introduces a separately declared Related runs composition using the same Aside roles; the parent supplies the boundary before any following child. Those perturbations test this small policy's behavior; neither establishes that arbitrary components can compose automatically.

## What is authored, and what follows

- The author chooses what to say, which facts share an account, which roles lead, the source order, and the behavior of the urgent and missing cases.
- `composition.js` declares that presentation from shared facts. It contains no gap, rank, or width choices.
- `study.js` renders the declaration and prints it in the authoring view. The original Execution stays in place as the controls change.
- `study.css` gives roles and adjacent roles a common typography and spacing policy. It never selects a presentation by name. Comfortable and compact modes change three local intervals and the surrounding composition spacing together.
- The parent `.context-slot` owns the boundary with Execution and the following neighbor. Its rule changes axis when the run becomes one column. This policy preserves an explicit boundary; it does not detect a missing perceptual cue.
- At a 740px containing frame the run can use two columns. At a 620px context the destinations can move beside the account. These are deliberately explicit study thresholds, not intrinsic fit measurements. Source and keyboard order stay unchanged.

The CSS values are specimen choices. We have not validated universal ratios, depth-based spacing, automated salience ordering, or a general child-to-parent report of boundary requirements. The wrapper has no container context of its own; this experiment does not prove arbitrary CSS containment is neutral.

## Review

The foundation review in `history/collaboration/FOUNDATION-REVIEW.md` motivates this study. Fable's design recommendation (`review/FABLE-DESIGN.md`) and review exchange live in `review/`; actual browser captures and mechanical observations live in `evidence/`.

The question for Yehuda is which presentation reads well and which authoring choices feel natural. Browser measurements can establish layout behavior and content preservation; they cannot establish that the reader understands the intended account.

See the local review result (`review/RESULT.md`) for changes made with Fable, observed checks, and the question this specimen poses for the next example.
