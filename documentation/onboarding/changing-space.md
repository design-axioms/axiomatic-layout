# Keep relationships through change

A useful composition does more than arrange its immediate children. It contributes enough information for the composition around it to preserve the hierarchy too.

In these examples, a composition knows the separation it uses between its own members. Its parent uses that information to give neighboring compositions more room. The prototype starts with an 8px interval, doubles the largest child interval at each level, and stops growing at 32px. That local rule builds up through nesting: the author describes the groups, while their spacing follows from how they compose.

## Reuse the same hierarchy at another width

The article below has an introduction and a body. Within the introduction, the title and subtitle belong with the byline. Within the body, a lead-in belongs with the list it introduces.

The examples in this chapter are fixed compositions. They do not use the arrangements you chose in the experiment that ends the previous chapter.

Drag the right edge of an example to change its available space, or edit the width beside it. Examples resize together while **Linked** is on. **Show structure** reveals the composition boundaries without changing the layout.

<axiomatic-example example="article"></axiomatic-example>

Move the width control. The paragraphs wrap and the shape of the article changes. The byline remains in the introduction, and the lead-in remains attached to its list. Those relationships came from the nested composition, so there is no second set of narrow-screen gaps to maintain.

The headline is more prominent than the byline, even though they belong together. **Importance and belonging are different relationships.** Making text larger should not, by itself, move it into a different group.

## Let another composition use the same space

Here is the earlier Switcher and Stack composition. The controls are linked, so changing either example's width gives both the same requested space. Turn off **Linked** on one example to give it an independent width.

<axiomatic-example example="switcher"></axiomatic-example>

The article mostly changes by wrapping text. The Switcher makes a discrete change from row to column. Both keep their authored hierarchy. Different primitives can respond differently while satisfying the same larger purpose.

## Give an inner group room to stay together

A Switcher can itself be a member of another Switcher. Here, the three execution facts form an inner group; that whole group sits beside the approval status.

<axiomatic-example example="nested-switcher"></axiomatic-example>

If you made both groups Switchers in the arrangement experiment, you have already watched this happen. Start wide, then narrow the example slowly. **Which group needs to change first?** The outer group becomes a column, putting the approval status below the execution facts. That gives the inner group the full width, so its three facts can stay in a row. Keep narrowing and the inner group becomes a column too.

Turn on **Show structure** and select either Switcher in the composition to trace its boundary. Then jump directly from a narrow width to a wide one. Both groups return to rows: their arrangement follows the space they have now, while their membership stays the same.

This is the intuition to carry into larger compositions: a group responds as a member of its parent, and its own members respond to the room that leaves them.

## Preserve the distinction, not a particular cue

A row beside or above a column offers an orientation cue: the two groups look different. When both become columns, that cue is gone. In the example, the larger interval between groups still carries their boundary.

Space is finite. A deeply nested hierarchy cannot keep demanding larger gaps forever. In the article above, the boundary between introduction and body has reached the 32px ceiling. A rule sits within that interval to add another cue. This exposes a limit of the current model: another level around several articles would get the same interval and rule. The prototype does not yet distinguish those further levels. We need to preserve their hierarchy without asking the author to add nesting just to obtain more space.

The row examples also use at least one text em between members: the same number of pixels does not provide the same visual separation on both axes.

This is the behavior we want composition to accumulate: each primitive has a small contract, and the hierarchy combines those contracts into a layout that keeps working through change.

<script type="module" src="/_media/documentation/components/layout-examples.js"></script>
