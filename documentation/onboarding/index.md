# Compose a hierarchy

You know that a byline belongs with its headline, and that the body follows the whole introduction. A layout system should let you express those relationships once. As the article moves from a wide page to a narrow column, the layout should keep them apparent.

Axiomatic's building blocks combine two things: they group their children, and they arrange them. Nesting those building blocks describes the hierarchy. The system then has information it can use to keep members of a group close and distinguish the group from its neighbors.

> [!NOTE]
> This guide develops Axiomatic's design through working examples. Stack, Shelf, and Switcher are the current teaching vocabulary. The examples run; their notation is not yet a published library API.

## Say what belongs together

A **Stack** arranges its children in order, one below the next. The four facts below start in one Stack, so they read as one sequence.

Make the execution facts read as one group, and the proposed next steps as another. Select neighboring facts, then choose **Group**. You can select them in the example or select their names in the code. Select an inner Stack in the code to **Ungroup** it. **Undo** lets you try another reading.

<axiomatic-example example="flat" exercise="execution"></axiomatic-example>

Group wraps your selection in a Stack, because a group needs an arrangement. Its members become one piece that the outer Stack arranges alongside its other members. The space follows that structure; you supply no individual gap values.

After your first grouping, the facts you left outside it are each separate members of the outer Stack. Group them to say they belong together. If you group the first two and the last two, your code reads `Stack(Stack(…), Stack(…))`.

Try grouping the middle two facts instead. What relationship does that suggest? The system expresses the grouping you give it; you decide whether that reading makes sense.

## Test your grouping

Drag the example's right edge or edit its width. **Linked** examples resize together. Does the relationship you chose remain clear as the text wraps?

Turn on **Show structure** to inspect a group's boundary and the space between its members. Hover or focus a name in the code to trace it to the example. Your editing selection stays in place while you inspect. Click a selected member again to remove it from your selection; Escape clears the selection. In the code, use Up and Down to move between names, and Space or Enter to select.

The exercise groups adjacent members of the same parent. It leaves at least one member outside a new group, so you can see the new boundary. These are limits of this introductory editor; they are not a complete definition of Axiomatic's algebra.

## Try another reading

Here are five facts about a neighborhood event. Decide which belong together, build your grouping, then narrow the example. A group you create can itself become a member of a larger group: select its Stack name and a neighbor, then group them.

<axiomatic-example example="event" exercise="event"></axiomatic-example>

Which facts should someone read together? Does your arrangement make that clear? All five are plain text on purpose; making one stand out comes later. A fact on its own needs no group. There is no scored answer here. Try another grouping and compare the reading it creates.

Nesting here means nesting Axiomatic compositions. A mechanical HTML wrapper does not, by itself, declare another group.

## Shelf: keep a group in a row

The next two examples are fixed compositions; they do not carry forward your edits above.

A **Shelf** keeps its children in one horizontal row. In this separate example, a Shelf holds the two execution facts. They still belong together; their arrangement is different from a Stack.

<axiomatic-example example="shelf"></axiomatic-example>

At a small width this Shelf can scroll. It keeps its row contract. That is different from deciding the whole group should become a column.

## Switcher: choose a row or a column

A **Switcher** uses one row when its children fit, and one column when they do not. It switches the group as a whole.

This example adds a third fact to the first group so you can see what that means. When there is room for two facts but not all three, the Switcher puts all three in a column. Ordinary row wrapping would leave two on the first line and one on the next.

<axiomatic-example example="switcher"></axiomatic-example>

Narrow this example, then lengthen its second label. More content can make the row stop fitting even when the available width stays the same. The author chooses the responsive behavior; the component determines when the current content needs it.

The outer Stack keeps the execution facts together and distinct from the proposed next steps in both arrangements. When the Switcher becomes a column, it has the same arrangement as a Stack. The difference is its contract: it can return the whole group to a row as soon as the content fits. You do not need another version of the hierarchy for the narrow case.

## Change the arrangement, keep the group

Keep these five facts in their two groups, and change how each group arranges its members. The group of three execution facts is already selected.

**Predict first:** at a narrow width, what will happen to the third fact in a Shelf? What will a Switcher do at that same width?

This example saves its own choices for the browser session; other examples keep theirs. **Start over** restores the three Stacks.

<axiomatic-example example="grouped" exercise="arrangement" edits="arrangement"></axiomatic-example>

Choose **Shelf**, then narrow the example until the row no longer fits. Choose **Switcher** at that width, then widen the example as far as the page allows. It returns to a row when all three facts fit. Each choice changes one name in the code. The three facts inside its parentheses stay as written, in the same order.

The line under the example describes the selected group. A Stack is always a column and a Shelf is always a row. For a Switcher the line says what it is now: the name promises a rule, and the row or column is that rule's current result.

Now make the same choice one level up. The outer group has two members: the two inner groups. Select the first name in the code. What would a Switcher do with those two members? Choose it. If nothing moves, the two groups do not fit side by side. Widen the example, then try a Stack for the first group: that changes how much room the outer row needs. On a narrow page, a column may remain the right result.

Each group has its own arrangement, and each still has the members it started with. Try other combinations. With both the outer group and the first group as Switchers, narrow the example slowly and notice which one gives up its row first. The next chapter looks at why.

The arrangement choice applies to one selected group. A fact has no members, so selecting one leaves nothing to arrange. With a keyboard, the arrow keys move through the choice, and it keeps focus while the example changes. Select another group from its name in the code with Space or Enter.

[Next, use the same idea at several levels](changing-space.md).

<script type="module" src="/_media/documentation/components/layout-examples.js"></script>
