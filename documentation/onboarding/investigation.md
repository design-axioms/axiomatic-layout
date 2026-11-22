# Try a real composition

An investigation finds a problem. The investigation has a completion state and an update time; its remediation Plan has a separate approval state. A reader needs to understand what was found, which decision is waiting, and where to go next.

Those are the relationships the layout needs to preserve. A data record tells us which state belongs to which object. The author also chooses how to present those facts together for this reader.

## Compose the investigation

Start with one sequence of facts. Build a reading that makes the finding, the investigation's state, and the Plan's pending approval easy to distinguish. Every state names its subject, so regrouping cannot silently change what “completed” or “awaiting approval” refers to.

**Try this first:** select **Investigation completed** and **Investigation updated**, then choose **Group**. The new Stack stays selected. Change it to a **Switcher**, and narrow the example. You have chosen both which facts belong together and how they should respond to space.

<axiomatic-example example="investigation" exercise="investigation" edits="composition"></axiomatic-example>

## Build on your group

The same selection serves both operations. Select neighboring members to group them. Select one group's name in the code to arrange its members or **Ungroup** it. A group can be selected alongside a neighbor to become part of a larger group. Clicking a selected member removes it; **Clear selection** or Escape lets you begin a different selection.

**Clear selection**, then select and group the two Plan facts. Try a Stack, a Shelf, and a Switcher for that group. Notice how much room the longer Plan title needs. Then select the first name in the code to arrange the whole composition: its members include the groups you just made.

Choose **Switcher** for the whole composition. Its row needs more room than this example offers, so it stays a column. An inner Switcher can still be a row: each group responds to its own members and space.

**Predict before resizing:** which inner group will give up its row first? Narrow the example and compare. The longer Plan facts need more room than the investigation's state and update. Try a Shelf for that group at the same width: it keeps a row and can scroll.

Turn on **Show structure** to follow a boundary between the example and the code. Grouping changes the parentheses; choosing an arrangement changes a group's name. Resizing changes neither. The spacing follows your composition throughout.

**Undo** restores the previous composition and editing selection. **Start over** returns to one sequence and can itself be undone. Your work is saved for this browser session. With a keyboard, use Up and Down in the code, Space or Enter to select, and arrow keys within the arrangement choice.

## Try another reading

Ungroup one of your groups and build a different relationship. For example, put the finding and the investigation's state into a larger group, keeping the Plan separate. Does someone reading it still know what was found and which decision is waiting?

This first exercise preserves the supplied facts and their reading order. It groups adjacent members of one parent, leaving a neighbor outside each new group. The destination line here is text, not an active link.

<span id="make-it-yours"></span>

## Compose your own

Start with your investigation or an empty composition. **Copy investigation** brings over the groups and arrangements you just built; **Start blank** gives you an empty Stack. From there, add content and groups, decide what belongs together, and compare the same composition in two places.

<axiomatic-playground source-exercise="investigation"></axiomatic-playground>

**Open in playground** takes your current composition into its own workspace. There, drafts are saved in this browser when you close the tab, and **Copy snapshot link** captures a fixed copy for someone else to view. Opening a snapshot preserves their drafts; **Edit a copy** starts a separate draft. You can also [open a blank playground](/_media/documentation/playground/index.html).

Select a fact in either view or in the code, then change its wording. Both views show the same composition: the wide card has more space, and the narrow rail has less. A Switcher can be a row in one and a column in the other. Your edit changes the content both receive.

**Try this:** replace a short status with a more descriptive sentence. Before typing, predict which group will need a column first. The longer wording changes the space it needs; you still choose no collision threshold.

Choose **Text** in the Add menu, then select a group to add it **inside**, or select a member to add it **after**. Removing a group's last member leaves the group in place. Its name and parentheses remain in the code, where you can select it and add content back. A Switcher with one member is still a Switcher: its arrangement is an authored choice that survives changes in membership.

Keep using **Group**, **Ungroup**, and the arrangement choices as your content grows. **Start blank** replaces your working copy with an empty Stack and can itself be undone. **Undo** restores your edits. Text updates as you type; Enter or leaving the field finishes that edit, and Escape cancels it. Your working copy is saved for this browser session. **Copy investigation** brings over a later version of the exercise above and can itself be undone.

### Build a notice from an empty group

Try a notice for a **Neighborhood repair café**. Choose **Start blank**, choose Text in the Add menu, and add it **Inside Stack**. Change its wording to the event name, then choose the **Heading** content role.

A Heading names a section. Text carries its main wording. Meta provides supporting context, such as an update time. These roles tell the composition what the content does. They do not form a scale of importance: a time-sensitive instruction can remain Text, and making it urgent does not make it a heading.

With the heading selected, choose **Empty Switcher** in the Add menu and add it **After Heading**. The empty Switcher's name is selected in the code, and the Add menu returns to Text. Fill it with three neighboring Text members—add the first **Inside Switcher**, then each of the others **After Text**: “Saturday, 10 am–1 pm”, “Maple Street Library”, and “Free; book a table by Friday”.

**Predict before looking:** will the three details fit together in the card? In the rail? A Switcher keeps all three in one row when they fit and all three in one column when they do not. It never leaves a lone third detail on another row. The booking deadline stays Text: it asks for timely action, while the Heading names the notice. Try Meta for a supporting detail and compare its fit in both views; the content role has a typographic treatment, but it does not encode urgency.

Select that Switcher's name in the code and add Text **after** it: “Bring a small appliance and work with a volunteer to repair it.” Add another Text after that and try Meta for “Updated Friday”. Changing a content role preserves the words and their place in the group; changing an arrangement preserves its members.

You can also begin by adding empty groups and fill them later. Choose **Empty Stack**, **Empty Shelf**, or **Empty Switcher** in the Add menu. Each keeps its arrangement with zero, one or many members. Its name in the composition is always a place to select it.

### Move a group as one member

To try this with the original facts, choose **Copy investigation**; Undo will restore your notice. The completion and update facts can stay together while becoming part of a larger account of the finding. Select the finding's **Heading** in the code and choose **Group**. This makes a Stack containing just that heading—a place for the larger account to grow.

Select the group containing the completion and update facts; group those two facts first if they are still separate. If you changed its arrangement earlier, choose **Switcher** again to watch how it responds in both views. Then choose **Move**. Choose the new Stack's name in the code as the destination, and choose **Inside at end**. The whole Switcher joins that Stack after the heading. Its two facts and chosen arrangement travel together.

Follow the selected group in both views and in the code. Its new indentation shows which group it belongs to. The card and rail give it different amounts of space, so its row or column still follows its own slot. Moving changes its parent; resizing preserves that relationship. Notice the spacing around the new group, too: it follows the new nesting, without adding any gap values to the composition.

**Try moving it back:** choose **Move**, choose the Plan group’s name if you grouped its facts (otherwise choose the first Plan fact), and choose **Before**. The Stack around the heading stays in place with one member. Moving its last member elsewhere would leave an empty Stack that you can select and refill.

You can move a single fact or neighboring members the same way. Choose a destination in either view or the code, then **Before**, **Inside at end**, or **After**. Inside adds to a group; Before and After place members alongside the destination, in that destination’s parent group. The solid selection marks what travels, and the dashed destination marks where the placement applies. **Cancel** or Escape leaves the composition as it was; **Undo** restores a completed move.

The card and rail are two places to try the composition, not device categories. You now control content, membership, arrangement, and reading order while each view responds to its own available space.

## Compare with the original study

The earlier investigation study includes actual destinations, urgency, and two authored presentations. It uses named roles and its own spacing table. Compare it with the composition you built above to see what these three primitives already express and what still needs another contract.

### Two useful hierarchies over the same facts

The investigation study offers two presentations:

- **Separate groups** keeps the investigation's facts together and gives the remediation Plan its own group. Placement helps a reader understand the short labels “Completed” and “Updated.”
- **Editorial account** combines the states into an account of the situation. Its wording names what each state describes; the investigation's update time is explicitly labeled.

Both name the same finding and Plan, and offer the same destinations. Choosing a presentation changes how the reader encounters those facts. It should not require tuning every gap again at every width.

[Open the interactive investigation study](/_media/experiments/01-reading-path/index.html).

### What to look for

First read the finding, then locate the pending approval and the session link. Notice whether you understand which state belongs to which object without reconstructing that relationship from scattered labels.

Change the placement, width, or density. The composition shown beside the result stays the same while the layout responds. This is the part of the authoring burden we want the library to take on.

Then make approval urgent. The grouped presentation can emphasize its existing status. The editorial account lifts the named approval out of the sentence into a status line. Rewriting that account is an authoring decision; the layout carries the relationship the author chose.

Finally, add the neutral wrapper. It introduces a real HTML box around the destinations without declaring a new group. The prototype forwards the destination's layout role through that wrapper, so the parent can preserve its boundary.

### What the study contributes

The [composition source](source:experiments/01-reading-path/composition.js) contains content, roles, and nesting. A shared policy supplies the spacing and arrangements. The study demonstrates that separation for these examples; it does not yet derive a general policy for arbitrary compositions.

The next question is what each primitive needs to expose to its surroundings. The simple examples use their internal separation; the investigation uses a destination role. A library foundation should make those contracts small enough to compose and strong enough that authors can trust the result.

## Bring your own content

The next experiment keeps the investigation's links and buttons as native, application-owned elements. Try following the investigation, changing an action's label, and resizing the same composition in a card and a rail. Then compare one group with nested groups: the outer arrangement can change while the secondary actions remain together.

[Open Bring your own content](/_media/documentation/bring-your-own-content/index.html).

This experiment starts with actions that keep their natural width. The authoring API is provisional; wrapping prose has a separate sizing question still to settle.

## When should the summary wrap?

Read the same finding and session link in both examples. In the first, the link stays beside the finding only if the whole finding fits on one line. In the second, the author gives the finding a maximum line length of 30ch, drawn above the text. That leaves room for the link beside a paragraph.

<axiomatic-prose-fit></axiomatic-prose-fit>

Start with the original wording and drag the edge. In a narrow rail, both links land below the finding. With more room, one can move beside it while the other stays below. Where they disagree, hold the width steady and choose the longer wording. Does the link still feel like a next step when it sits beside several lines of text? Widen again and notice that the second finding keeps its line length even when it could use more room.

<script type="module" src="/_media/documentation/components/layout-examples.js"></script>
<link rel="modulepreload" href="/_media/experiments/01-reading-path/composition.js">
