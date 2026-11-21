var rt="axiomatic-revision:895889988f43bf4c";var pe=`:host {
  display: block;
  color: var(--color-text, #26332c);
  font: inherit;
  margin: 1.5rem 0 2rem;
  --ink: var(--color-link, #386d98);
  --line: var(--color-accent, #dce3db);
  --axiomatic-cue-color: var(--line);
  --paper: var(--color-background, #fff);
  --quiet: var(--color-text-aside, #64706a);
}
* {
  box-sizing: border-box;
}
p,
h3,
pre {
  margin: 0;
}
button,
input {
  font: inherit;
}
button {
  color: inherit;
}
button:focus-visible,
input:focus-visible,
summary:focus-visible,
[role="slider"]:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 3px;
}
button {
  border: 0;
  background: none;
  cursor: pointer;
}
.stage {
  position: relative;
  padding-inline-end: 24px;
}
.viewport {
  anchor-scope: --axiomatic-resize-handle;
  position: relative;
  max-inline-size: 100%;
  inline-size: 600px;
}
.bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-block-size: 32px;
  color: var(--quiet);
  font-size: 11px;
}
.bar button {
  padding: 4px 0;
  white-space: nowrap;
}
.bar button[aria-pressed="true"] {
  color: var(--ink);
}
.tools {
  display: flex;
  align-items: center;
  gap: 12px;
}
.width {
  display: flex;
  align-items: baseline;
  gap: 3px;
  font-variant-numeric: tabular-nums;
}
.width input {
  field-sizing: content;
  inline-size: 4ch;
  min-inline-size: 3ch;
  max-inline-size: 5ch;
  border: 0;
  border-bottom: 1px solid transparent;
  background: transparent;
  color: inherit;
  text-align: end;
  padding: 3px 0;
  appearance: textfield;
}
.width input:hover,
.width input:focus {
  border-bottom-color: var(--line);
}
.width input::-webkit-inner-spin-button {
  appearance: none;
}
.frame {
  position: relative;
  padding: 20px;
  border: 1px solid var(--line);
  border-radius: 4px;
  background: var(--paper);
}
.resize {
  anchor-name: --axiomatic-resize-handle;
  position: absolute;
  inset-inline-end: -30px;
  inset-block-start: 0;
  inset-block-end: 0;
  inline-size: 44px;
  display: grid;
  place-items: center;
  cursor: ew-resize;
  touch-action: none;
  border: 0;
  background: none;
  border-radius: 3px;
  color: var(--quiet);
}
.resize::after {
  content: "";
  position: absolute;
  inset-block-start: var(--grip-y, 50%);
  transform: translateY(-50%);
  inline-size: 5px;
  block-size: 28px;
  border-inline: 1px solid currentColor;
  opacity: 0.55;
}
/* Keep the grip under the pointer while linked examples above it reflow. */
.resize[data-dragging="true"]::after {
  position: fixed;
  top: var(--grip-y);
  left: anchor(--axiomatic-resize-handle center);
  transform: translate(-50%, -50%);
}
.resize:hover::after,
.resize:focus-visible::after {
  opacity: 1;
  color: var(--ink);
}
[data-axiomatic="Meta"] {
  color: var(--quiet);
}
.caption {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 12px;
  margin-block-start: 7px;
  min-block-size: 18px;
  font-size: 11px;
  line-height: 1.5;
  color: var(--quiet);
}
.selection {
  color: var(--ink);
}
.selection:empty {
  display: none;
}
:host([edits="composition"]) .caption {
  min-block-size: 2lh;
}
/* One readout: the selected item, or the overall result. Reserve two lines
   so selecting a code name doesn't shift its neighboring click targets. */
:host([edits="composition"]) .caption:has(.selection:not(:empty)) .note {
  display: none;
}
.note:empty {
  display: none;
}
pre {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font:
    12px/1.7 ui-monospace,
    SFMono-Regular,
    monospace;
  background: var(--color-background-secondary, #f4f6f2);
  padding: 14px 16px;
  border-radius: 4px;
  margin-block-start: 10px;
  tab-size: 2;
}
/* Structural lines come from the printer. Soft-wrapped strings keep a
   continuation indent, while the first visual line retains its source indent. */
.code-line {
  display: block;
  padding-inline-start: var(--continuation);
  text-indent: calc(-1 * var(--continuation));
}
.token {
  color: light-dark(var(--shiki-light), var(--shiki-dark));
}
.code-name {
  font: inherit;
  line-height: inherit;
  padding: 0;
  vertical-align: baseline;
  cursor: default;
}
.inspecting .code-name {
  cursor: pointer;
}
.code-line[data-selected="true"],
.token[data-selected="true"] {
  background: color-mix(in srgb, var(--ink) 10%, transparent);
  border-radius: 2px;
}
.inspecting .code-name:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}
.edit {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px 12px;
  font-size: 12px;
  margin-block-start: 10px;
  color: var(--quiet);
}
.edit input {
  flex: 1;
  min-inline-size: 160px;
  max-inline-size: 100%;
  padding: 4px 0;
  border: 0;
  border-bottom: 1px solid var(--line);
  background: none;
  color: var(--color-text);
  border-radius: 0;
}
.sr-only {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
@media (forced-colors: active) {
  .token {
    color: CanvasText;
  }
  /* Selection remains visible when the system suppresses the subtree tint. */
  .code-name[aria-pressed="true"] {
    text-decoration: underline;
    text-decoration-thickness: 2px;
    text-underline-offset: 3px;
  }
  .resize {
    color: ButtonText;
  }
}

/* The authoring strip connects the picture to its declaration. */
.authoring {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px 16px;
  margin-block: 10px 4px;
  font-size: 12px;
}
.authoring button {
  padding: 6px 0;
}
.authoring .group-action,
.authoring .ungroup-action {
  color: var(--ink);
  font-weight: 600;
}
.authoring [hidden] {
  display: none;
}
.author-status {
  flex: 1 1 220px;
  color: var(--quiet);
  line-height: 1.5;
}
.history {
  display: flex;
  gap: 16px;
  margin-inline-start: auto;
}
.composition-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
}
.combined .arrangement {
  flex-basis: 100%;
}
/* Selecting adjacent code names must not move the next click target. */
.combined .arrangement-label {
  min-inline-size: 17em;
}
.combined .author-status {
  min-block-size: 2lh;
}
.clear-action {
  color: var(--quiet);
}
.authoring button:disabled {
  color: var(--quiet);
  opacity: 0.55;
  cursor: default;
}
/* One native choice for the selected group. The status takes its own row
   beneath, so the choice stays put while the status changes. */
.arrangement {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0 14px;
}
/* Keep the alternatives together when the label needs a separate line. */
.arrangement-options {
  display: inline-flex;
  gap: 14px;
}
.arrangement-label {
  color: var(--quiet);
}
.arrangement label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 0;
  cursor: pointer;
}
.arrangement input {
  inline-size: 1em;
  block-size: 1em;
  margin: 0;
  accent-color: var(--ink);
}
.arrangement label:has(:checked) {
  color: var(--ink);
}
.arrangement label:has(:disabled) {
  color: var(--quiet);
  cursor: default;
}
.arrangement ~ .author-status {
  order: 1;
  flex-basis: 100%;
}
:host(.editable) .leaf,
:host(.editable) .code-name {
  cursor: pointer;
}
[data-chosen="true"].node,
[data-chosen="true"].leaf {
  background-image: linear-gradient(
    color-mix(in srgb, var(--ink) 8%, transparent),
    color-mix(in srgb, var(--ink) 8%, transparent)
  );
}
.code-line[data-chosen="true"],
.token[data-chosen="true"] {
  background: color-mix(in srgb, var(--ink) 12%, transparent);
}
.code-line[data-chosen="true"] .token[data-chosen="true"] {
  background: transparent;
}
@media (pointer: coarse) {
  .authoring button,
  .arrangement label {
    min-block-size: 44px;
  }
}

/* This native extent changes with Shelf members and gaps, even at fixed width.
   It is invisible and contained within their existing scrollable span. */
.rendered [data-kind="Shelf"] {
  position: relative;
}
.overflow-extent {
  position: absolute;
  inset-block-start: 0;
  block-size: 0;
  inset-inline-start: anchor(var(--extent-first) start);
  inset-inline-end: anchor(var(--extent-last) end);
  visibility: hidden;
  pointer-events: none;
}

/* Width-only observations do not subscribe to mode-dependent heights. */
[data-observation="inline-size"] {
  position: absolute;
  inset-inline: 0;
  inset-block-start: 0;
  padding-inline: inherit;
  visibility: hidden;
  pointer-events: none;
}
[data-observation="inline-size"],
[data-observation="inline-size"] > span {
  display: block;
  block-size: 0;
}
pre {
  position: relative;
}
`;var ue=`/* Inspection follows real composition boxes. It contributes no layout size. */
.rendered {
  position: relative;
  /* Probe copies elsewhere cannot capture these path-derived anchor names. */
  anchor-scope: all;
}
.rendered[data-structure="true"] :is(.node, .leaf) {
  background-color: var(--inspection-fill);
}
.rendered :is(.node, .leaf)[data-inspected="true"] {
  outline: 1.5px solid var(--ink);
  outline-offset: -1.5px;
}
/* Each band is attached to the selected parent's real children. Both axes
   are expressed; overlapping anchors on the other axis produce an empty band.
   No measured rectangles or copied gap lengths participate in this decoration. */
.rendered .node:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 3px;
}
.rendered .node[data-inspected="true"] {
  position: relative;
}
.inspection-gap {
  position: absolute;
  pointer-events: none;
  background: repeating-linear-gradient(
    135deg,
    transparent 0 3px,
    color-mix(in srgb, var(--ink) 35%, transparent) 3px 3.5px,
    transparent 3.5px 4px
  );
}
.inspection-gap[data-axis="block"] {
  inset-inline: 0;
  inset-block-start: anchor(var(--before) end);
  inset-block-end: anchor(var(--after) start);
}
.inspection-gap[data-axis="inline"] {
  inset-block: 0;
  inset-inline-start: anchor(var(--before) end);
  inset-inline-end: anchor(var(--after) start);
}
.rendered .run-preview {
  position: absolute;
  inset-block-start: anchor(var(--run-first) start);
  inset-inline-start: anchor(var(--run-first) start);
  inset-inline-end: anchor(var(--run-last) end);
  inset-block-end: anchor(var(--run-last) end);
  outline: 1px dashed var(--ink);
  outline-offset: 2px;
  pointer-events: none;
}
.rendered .run-preview[hidden] {
  display: none;
}
@media (forced-colors: active) {
  .rendered[data-structure="true"] :is(.node, .leaf) {
    outline: 1px solid Highlight;
    outline-offset: -1px;
  }
  .rendered :is(.node, .leaf)[data-inspected="true"] {
    outline-width: 2px;
  }
  .rendered .node:focus-visible {
    outline: 2px solid Highlight;
    outline-offset: 3px;
  }
  .rendered :is(.node, .leaf)[data-inspected="true"],
  .rendered .run-preview {
    outline-color: Highlight;
  }
  .inspection-gap[data-axis="block"],
  .inspection-gap[data-axis="inline"] {
    forced-color-adjust: none;
    background: repeating-linear-gradient(
      135deg,
      transparent 0 3px,
      Highlight 3px 4px
    );
    opacity: 0.5;
  }
}

/* Numeric captions observe the gap's axis, not the members' changing heights.
   The inner target is deeper than this primitive's slot and requirement.
   See inline-observation.ts for the shared observation contract. */
.inspection-gap > span {
  position: absolute;
  inset: 0;
}
.inspection-gap [data-observation="gap"] {
  display: block;
}
.inspection-gap[data-axis="inline"] [data-observation="gap"] {
  inline-size: 100%;
  block-size: 0;
}
.inspection-gap[data-axis="block"] [data-observation="gap"] {
  inline-size: 0;
  block-size: 100%;
}
`;function L(o){let e=o.ownerDocument.createElement("span");e.dataset.observation="inline-size",e.setAttribute("aria-hidden","true");let t=o.ownerDocument.createElement("span");return t.dataset.observation="inline-target",e.append(t),o.append(e),{target:t,dispose:()=>e.remove()}}var D=".node,.leaf";function W(o){return[...o.children].filter(e=>e instanceof HTMLElement&&e.matches(D))}function C(o){return`--axiomatic-node-${o.replaceAll(".","-")}`}var ne=class{observer;shelves=new Set;shelfInputs=new Set;shelfObservations=[];scrollable=!1;note;directions;constructor(e,t){this.note=e,this.directions=t,this.observer=new ResizeObserver(i=>this.receive(i))}receive(e){e.some(t=>this.shelfInputs.has(t.target))&&this.refreshOverflow()}observeComposition(e){for(let t of this.shelfInputs)this.observer.unobserve(t);this.shelfInputs.clear(),this.shelves.clear();for(let t of this.shelfObservations)t.dispose();this.shelfObservations.length=0;for(let t of e.querySelectorAll('[data-decoration="overflow-extent"]'))t.remove();for(let t of e.querySelectorAll('[data-kind="Shelf"]')){this.shelves.add(t);let i=L(t);this.shelfObservations.push(i),this.shelfInputs.add(i.target);let n=W(t);if(n.length){let s=t.ownerDocument.createElement("span");s.className="overflow-extent",s.dataset.decoration="overflow-extent",s.setAttribute("aria-hidden","true"),s.style.setProperty("--extent-first",C(n[0].dataset.path)),s.style.setProperty("--extent-last",C(n.at(-1).dataset.path)),t.append(s),this.shelfInputs.add(s)}}for(let t of this.shelfInputs)this.observer.observe(t);this.scrollable=!1,this.refreshModes()}refreshOverflow(){this.scrollable=!1;for(let e of this.shelves){let t=e.scrollWidth>e.clientWidth+1,i=t?0:-1;e.tabIndex!==i&&(e.tabIndex=i),t?(e.getAttribute("role")!=="group"&&e.setAttribute("role","group"),e.getAttribute("aria-label")!=="Scrollable row"&&e.setAttribute("aria-label","Scrollable row"),this.scrollable=!0):(e.removeAttribute("role"),e.removeAttribute("aria-label"))}this.refreshModes()}refreshModes(){let e=this.directions().map(i=>i==="row"?"one row":"one column"),t=this.scrollable?"Scroll the row to read all its members.":e.length?`${e.length>1?"Switchers":"Switcher"}: ${e.join(" \xB7 ")}`:"";this.note.textContent!==t&&(this.note.textContent=t)}disconnect(){this.observer.disconnect();for(let e of this.shelfObservations)e.dispose();this.shelfObservations.length=0,this.shelves.clear(),this.shelfInputs.clear()}},K=class extends ne{actualWidth=0;maximumWidth=720;stage;viewport;input;constructor(e,t,i,n,s){super(n,s),this.stage=L(e),this.viewport=L(t),this.input=i,this.observer.observe(this.stage.target),this.observer.observe(this.viewport.target)}receive(e){for(let t of e){let i=t.contentBoxSize[0].inlineSize;t.target===this.stage.target&&(this.maximumWidth=Math.max(1,Math.min(720,i))),t.target===this.viewport.target&&(this.actualWidth=Math.round(i))}this.refreshWidth(),super.receive(e)}get maximum(){return this.maximumWidth}refreshWidth(){this.input.min=String(Math.min(160,this.maximumWidth)),this.input.max=String(Math.floor(this.maximumWidth));let e=this.input.getRootNode();e instanceof ShadowRoot&&e.activeElement===this.input||this.actualWidth&&(this.input.value=String(this.actualWidth))}disconnect(){super.disconnect(),this.stage.dispose(),this.viewport.dispose()}};function A(o,e){return Math.round(Math.min(e,Math.max(Math.min(160,e),o)))}function me({handle:o,viewport:e,input:t,limit:i,request:n,restore:s,signal:r}){let a=0,d;t.addEventListener("input",()=>{Number.isFinite(t.valueAsNumber)&&n(t.valueAsNumber,!0)},{signal:r}),t.addEventListener("change",()=>n(t.valueAsNumber,!0),{signal:r}),t.addEventListener("blur",()=>s(),{signal:r}),t.addEventListener("keydown",h=>{h.key==="Enter"&&t.blur()},{signal:r}),o.addEventListener("pointerdown",h=>{if(h.button!==0)return;let u=e.getBoundingClientRect().width;d={pointer:h.pointerId,direction:getComputedStyle(e).direction==="rtl"?-1:1,x:h.clientX,width:u,nextWidth:u,maximum:i()},o.dataset.dragging="true",o.style.setProperty("--grip-y",`${h.clientY}px`),o.setPointerCapture(h.pointerId),h.preventDefault()},{signal:r}),o.addEventListener("pointermove",h=>{d?.pointer===h.pointerId&&(d.nextWidth=d.width+(h.clientX-d.x)*d.direction,o.style.setProperty("--grip-y",`${h.clientY}px`),a||(a=requestAnimationFrame(()=>{a=0,d&&n(d.nextWidth,!1,d.maximum)})))},{signal:r});let c=()=>{cancelAnimationFrame(a),a=0,d=void 0,delete o.dataset.dragging,o.style.removeProperty("--grip-y")},l=()=>{d&&(cancelAnimationFrame(a),a=0,n(d.nextWidth,!0,d.maximum),c())};return o.addEventListener("pointerup",l,{signal:r}),o.addEventListener("pointercancel",l,{signal:r}),o.addEventListener("lostpointercapture",l,{signal:r}),{get dragging(){return d!==void 0},cancel:c}}function fe(o){let e=[...o.querySelectorAll(D)],t=Math.max(1,...e.map(n=>n.dataset.path.split(".").length));o.style.setProperty("--inspection-fill",`color-mix(in srgb, var(--ink) ${12/t}%, transparent)`);for(let n of e)n.style.setProperty("anchor-name",C(n.dataset.path));for(let n of o.querySelectorAll(':scope > [data-decoration="run-preview"]'))n.remove();let i=document.createElement("div");i.className="run-preview",i.dataset.decoration="run-preview",i.setAttribute("aria-hidden","true"),i.hidden=!0,o.append(i)}function ge(o,e){let t=[...o.querySelectorAll(D)];o.dataset.structure=String(e.structure);let i=t.find(a=>a.dataset.inspected==="true"),n=t.find(a=>a.dataset.path===e.selected);for(let a of t){let d=String(a===n);a.dataset.inspected!==d&&(a.dataset.inspected=d)}if(i!==n){for(let a of o.querySelectorAll('[data-decoration="gap"]'))a.remove();if(n?.classList.contains("node")){let a=W(n);for(let d=1;d<a.length;d++)for(let c of["block","inline"]){let l=document.createElement("span");l.className="inspection-gap",l.dataset.decoration="gap",l.dataset.axis=c,l.setAttribute("aria-hidden","true"),l.style.setProperty("--before",C(a[d-1].dataset.path)),l.style.setProperty("--after",C(a[d].dataset.path));let h=document.createElement("span"),u=document.createElement("span");u.dataset.observation="gap",h.append(u),l.append(h),n.append(l)}}}let s=o.querySelector(':scope > [data-decoration="run-preview"]'),r=t.filter(a=>e.preview.includes(a.dataset.path));return s.hidden=r.length<2,r.length>1&&(s.style.setProperty("--run-first",C(r[0].dataset.path)),s.style.setProperty("--run-last",C(r.at(-1).dataset.path))),n}function oe(o,e,t){let i=n=>e&&t!==void 0&&(n===t||n?.startsWith(`${t}.`)===!0);for(let n of o.querySelectorAll(".code-line"))n.dataset.selected=String(i(n.dataset.path));for(let n of o.querySelectorAll(".token[data-path]"))n.dataset.selected=String(i(n.dataset.path)&&n.closest(".code-line")?.dataset.selected!=="true")}function De(o,e){let t=e?"row":"column";return o==="Switcher"?`now a ${t}`:t}function ve(o){if(!o)return"";if(o.classList.contains("leaf"))return`${o.dataset.kind} \xB7 leaf`;let e=getComputedStyle(o),t=e.flexDirection==="row",i=W(o),n=t?e.columnGap:e.rowGap;return`${o.dataset.kind} \xB7 ${De(o.dataset.kind,t)} \xB7 ${i.length===1?"1 member":i.length?`${i.length} members`:"no members"}${i.length>1?` \xB7 ${Math.round(Number.parseFloat(n)||0)} px between`:""}`}var be=["flat","nested","grouped","shelf","switcher","nested-switcher","article","event","investigation"],m=(...o)=>({kind:"Stack",children:o}),st=(...o)=>({kind:"Shelf",children:o}),We=(...o)=>({kind:"Switcher",children:o}),v=o=>({kind:"Text",text:o}),at=o=>({kind:"Heading",text:o}),dt=o=>({kind:"Meta",text:o});function E(o,e="Run lasted 4m 1s"){let t=v("Execution completed"),i=v(e),n=v("Remediation Plan proposed"),s=v("Awaiting approval");switch(o){case"flat":return m(t,i,n,s);case"nested":return m(m(t,i),m(n,s));case"grouped":return m(m(t,i,v("3 checks passed")),m(n,s));case"shelf":return m(st(t,i),m(n,s));case"switcher":return m(We(t,i,v("3 checks passed")),m(n,s));case"nested-switcher":return We(We(t,i,v("Three checks passed")),s);case"investigation":return m(at("Request-log queries exceed 30-second runtime budget"),v("Investigation completed"),v("Investigation updated: Nov 18, 10:34 AM"),v("Remediation Plan: Bound the request-log query"),v("Remediation Plan awaiting approval"),v("Destination: investigation session"));case"event":return m(v("Neighborhood repair caf\xE9"),v("Saturday, 10 am\u20131 pm"),v("Maple Street Library"),v("Free; book a table by Friday"),v("Tell us about access needs when you book"));case"article":return m(m(at("Reading the sky"),v("A field guide to noticing the weather"),st(dt("Mara Ellis"),dt("19 November"))),m(v("A forecast tells you what may happen. Looking outside tells you what is happening here."),m(v("Before you leave, look for:"),m(v("Clouds building above the hills"),v("A change in the direction of the wind")))))}}function ct(o,e){if("children"in o)throw new Error("Expected a leaf");return[{text:o.kind,path:e,kind:o.kind},{text:"(",path:e},{text:JSON.stringify(o.text),tone:"string",path:e},{text:")",path:e}]}function I(o,e="0",t=0,i=80){let n={text:"  ".repeat(t)};if(!("children"in o)){let a=ct(o,e);return t*2+a.reduce((d,c)=>d+c.text.length,0)<=i?[{tokens:[n,...a],path:e,depth:t}]:[{tokens:[n,...a.slice(0,2)],path:e,depth:t},{tokens:[{text:"  ".repeat(t+1)},a[2]],path:e,depth:t+1},{tokens:[n,a[3]],path:e,depth:t}]}let s=[n,{text:o.kind,tone:"primitive",path:e,kind:o.kind},{text:"("}];if(o.children.every(a=>!("children"in a))){if(o.children.forEach((a,d)=>{d&&s.push({text:", "}),s.push(...ct(a,`${e}.${d}`))}),s.push({text:")"}),s.reduce((a,d)=>a+d.text.length,0)<=i)return[{tokens:s,path:e,depth:t}];s.splice(3)}let r=[{tokens:s,path:e,depth:t}];return o.children.forEach((a,d)=>{let c=I(a,`${e}.${d}`,t+1,i-(d<o.children.length-1?1:0));if(d<o.children.length-1){let l=c.at(-1);c[c.length-1]={...l,tokens:[...l.tokens,{text:","}]}}r.push(...c)}),r.push({tokens:[n,{text:")"}],path:e,depth:t}),r}var J=`/* Axiomatic primitives. This stylesheet owns their geometry: flow, sizing,
   gap lengths, overflow, and the arrangement of a Switcher. It depends only on
   the \`data-axiomatic*\` attributes emitted by primitives.ts, and works on a
   bare page or inside a shadow root. The host must impose an inline size
   independent of the composition's block size; scrolling hosts with classic
   scrollbars need \`scrollbar-gutter: stable\` to preserve that slot.

   Inputs, all inherited, so a Switcher's measurement copy receives them
   exactly as its real members do:
     --axiomatic-space          spacing unit; levels 1/2/3 are 1x/2x/4x (8px)
     --axiomatic-text-size      Text (14px)
     --axiomatic-heading-size   Heading (22px)
     --axiomatic-meta-size      Meta (12px)
     --axiomatic-cue-color      boundary cue line
   Font family, weight, letter spacing and the like inherit as usual. */

/* Groups. Script states a structural level; these rules give it a length. */
[data-axiomatic-level] {
  display: flex;
  align-items: stretch;
  min-inline-size: 0;
  gap: var(--axiomatic-gap);
}
[data-axiomatic-level="1"] {
  --axiomatic-gap: var(--axiomatic-space, 8px);
}
[data-axiomatic-level="2"] {
  --axiomatic-gap: calc(2 * var(--axiomatic-space, 8px));
}
[data-axiomatic-level="3"] {
  --axiomatic-gap: calc(4 * var(--axiomatic-space, 8px));
}
[data-axiomatic="Stack"] {
  flex-direction: column;
}
/* Members of a row are separated by at least 1em. In a column the
   declaration is inert. */
[data-axiomatic="Shelf"],
[data-axiomatic="Switcher"] {
  column-gap: max(1em, var(--axiomatic-gap));
}
/* A row member keeps its max-content size. A Shelf scrolls instead of
   squeezing; a Switcher becomes a column instead. */
[data-axiomatic="Shelf"] > *,
[data-axiomatic="Switcher"] > * {
  flex-shrink: 0;
}
[data-axiomatic="Shelf"] {
  overflow-x: auto;
}

/* Switcher: all one row or all one column. The coordinator publishes whether
   the row fits the slot. Until it has, the column is the safe arrangement. */
[data-axiomatic="Switcher"] {
  position: relative;
  flex-direction: var(--axiomatic-unbounded-direction, column);
}
[data-axiomatic="Switcher"][data-axiomatic-arrangement="row"] {
  flex-direction: row;
}
/* Under a row, a row. A Shelf, or a Switcher whose row fits, sizes every
   member from its content, so nothing below bounds a nested Switcher: its
   own width would follow its own arrangement, and no fresh measurement of it
   is an available slot. The answer there is already known. The row requirement
   counted every nested Switcher on one line, so each has its full row.
   The context inherits through Stacks and stops at a member that bounds its
   own inline size. \`data-axiomatic-bounded\` is reserved for fixture ablation,
   not a supported child contract: no controlled kind emits it, and a future
   bound would also have to reach the independent requirement copy. */
:where(
    [data-axiomatic="Shelf"],
    [data-axiomatic="Switcher"][data-axiomatic-arrangement="row"]
  )
  > * {
  --axiomatic-unbounded-direction: row;
  --axiomatic-unbounded-cue: none;
}
[data-axiomatic-bounded] {
  --axiomatic-unbounded-direction: initial;
  --axiomatic-unbounded-cue: initial;
}

/* Boundary cue: a line in the middle of the gap before a member, where a
   group's spacing has reached the ceiling. It appears in columns only. */
[data-axiomatic-cue="1"] {
  --axiomatic-cue-gap: var(--axiomatic-space, 8px);
}
[data-axiomatic-cue="2"] {
  --axiomatic-cue-gap: calc(2 * var(--axiomatic-space, 8px));
}
[data-axiomatic-cue="3"] {
  --axiomatic-cue-gap: calc(4 * var(--axiomatic-space, 8px));
}
:is([data-axiomatic="Stack"], [data-axiomatic="Switcher"])
  > [data-axiomatic-cue] {
  position: relative;
}
:is([data-axiomatic="Stack"], [data-axiomatic="Switcher"])
  > [data-axiomatic-cue]::before {
  content: "";
  position: absolute;
  inset-inline: 0;
  inset-block-start: calc(var(--axiomatic-cue-gap) / -2);
  border-block-start: 1px solid
    var(
      --axiomatic-cue-color,
      color-mix(in srgb, currentColor 20%, transparent)
    );
}
[data-axiomatic="Switcher"] > [data-axiomatic-cue]::before {
  display: var(--axiomatic-unbounded-cue, block);
}

/* Controlled teaching leaves. Only declarations that affect size live here,
   because the measurement copy must share them. */
[data-axiomatic="Text"],
[data-axiomatic="Heading"],
[data-axiomatic="Meta"] {
  margin: 0;
  font-size: var(--axiomatic-text-size, 14px);
  line-height: 1.5;
  overflow-wrap: anywhere;
}
[data-axiomatic="Heading"] {
  font-size: var(--axiomatic-heading-size, 22px);
  line-height: 1.25;
  font-weight: 650;
  letter-spacing: -0.025em;
  text-wrap: balance;
}
[data-axiomatic="Meta"] {
  font-size: var(--axiomatic-meta-size, 12px);
}

/* Measurement boxes. They take no space, paint nothing, and are observed by
   the coordinator's ResizeObserver; nothing reads their rectangles. */
[data-axiomatic-mechanical] {
  position: absolute;
  inset-block-start: 0;
  inset-inline-start: 0;
  visibility: hidden;
  pointer-events: none;
  user-select: none;
}
/* The slot: the Switcher's content-box inline size at zero height, so an
   arrangement change, which alters the Switcher's height, cannot resize it. */
[data-axiomatic-mechanical="slot"] {
  inset-inline-end: 0;
  padding-inline: inherit;
}
[data-axiomatic-mechanical="slot"],
[data-axiomatic-mechanical="slot"] > * {
  block-size: 0;
}
/* The requirement: a copy of the Switcher's content on one line. Containment
   is this subtree's proven boundary. Its layout never reaches the real boxes,
   and its overflow never becomes scrollable extent. */
[data-axiomatic-mechanical="requirement"] {
  inline-size: 0;
  block-size: 0;
  contain: strict;
}
/* Every Switcher in the copy is a row at its max-content size, whatever its
   real counterpart is doing. A rendered copy is never 0x0, which is how the
   coordinator tells "hidden" from "needs no room". */
[data-axiomatic-mechanical="requirement"] [data-axiomatic="Switcher"] {
  flex-direction: row;
  inline-size: max-content;
  min-block-size: 1px;
}
[data-axiomatic-mechanical="requirement"] [data-axiomatic="Shelf"] {
  overflow: visible;
}
[data-axiomatic-mechanical="requirement"]
  :is(
    [data-axiomatic="Text"],
    [data-axiomatic="Heading"],
    [data-axiomatic="Meta"]
  ) {
  white-space: nowrap;
}
`;var Y="data-axiomatic-arrangement";function di(o,e){return o<=e+.0625?"row":"column"}var Ie=class{trace;#e;#t=new WeakMap;#i=0;#n;constructor(e){this.#e=new e(t=>this.#a(t))}get size(){return this.#i}register(e){let{switcher:t,slot:i,requirement:n}=e;if(this.#t.has(i)||this.#t.has(n))throw new Error("This Switcher is already registered");let s,r=this.#s(t,i,()=>s),a=this.measure(n,d=>{let c=d.contentBoxSize[0];if(!c)return;s=c.inlineSize>0||c.blockSize>0?c.inlineSize:void 0,this.#n?.add(r.state)});return()=>{r.stop(),a()}}registerDerived(e){let{switcher:t,slot:i}=e;if(this.#t.has(i))throw new Error("This Switcher is already registered");let n=this.#s(t,i,()=>e.requirement()),s=!0;return{invalidate:()=>{s&&(this.#n?this.#n.add(n.state):this.#o([n.state]))},unregister:()=>{s=!1,n.stop()}}}measure(e,t,i){if(this.#t.has(e))throw new Error("This box is already observed");this.#t.set(e,t),this.#e.observe(e,i);let n=!0;return()=>{n&&(n=!1,this.#e.unobserve(e),this.#t.delete(e))}}#s(e,t,i){let n={switcher:e,slot:0,requirement:i},s=this.measure(t,a=>{let d=a.contentBoxSize[0];d&&(n.slot=d.inlineSize,this.#n?.add(n))});this.#i++;let r=!0;return{state:n,stop:()=>{r&&(r=!1,s(),this.#i--)}}}#a(e){let t=this.#n=new Set;try{for(let i of e)this.#t.get(i.target)?.(i)}finally{this.#n=void 0}this.#o(t)}#o(e){let t=[];for(let{switcher:i,slot:n,requirement:s}of e){let r=s(),a=r===void 0?void 0:di(r,n),d=a!==void 0&&i.getAttribute(Y)!==a;d&&i.setAttribute(Y,a),t.push({switcher:i,slot:n,requirement:r,arrangement:a,written:d})}this.trace?.(t)}},lt=new WeakMap;function ht(o){let e=lt.get(o);if(!e){let t=o.defaultView;if(!t)throw new Error("Switchers need a document with a window");e=new Ie(t.ResizeObserver),lt.set(o,e)}return e}function pt(o){if(!("children"in o))return{level:0,cue:!1,children:[]};let e=o.children.map(pt),t=Math.max(0,...e.map(i=>i.level));return{level:Math.min(3,t+1),cue:t>=3,children:e}}function ci(o,e=globalThis.document){let t=[];function i(a,d){let c="children"in a,l=e.createElement(c?"div":a.kind==="Heading"?"h3":"p");return l.setAttribute("data-axiomatic",a.kind),c?l.setAttribute("data-axiomatic-level",`${d.level}`):l.textContent=a.text,l}function n(a,d){let c=e.createElement("div");return c.setAttribute("data-axiomatic-mechanical",a),c.setAttribute("aria-hidden","true"),c.setAttribute("inert",""),c.append(d),c}function s(a,d,c,l){let h=i(a,d);if(h.setAttribute("data-kind",a.kind),h.setAttribute("data-path",c),!("children"in a))return h.setAttribute("class","leaf"),{real:h,copy:l?i(a,d):void 0};h.setAttribute("class","node");let u=a.kind==="Switcher",g=l||u?i(a,d):void 0,b=u?e.createElement("div"):void 0;return b&&g&&t.push({switcher:h,slot:b,requirement:g}),a.children.forEach((H,y)=>{let R=s(H,d.children[y],`${c}.${y}`,g!==void 0);d.cue&&y>0&&R.real.setAttribute("data-axiomatic-cue",`${d.level}`),h.append(R.real),R.copy&&g?.append(R.copy)}),b&&g&&(h.append(n("slot",b)),l||h.append(n("requirement",g))),{real:h,copy:l?g:void 0}}let{real:r}=s(o,pt(o),"0",!1);return{element:r,switchers:t}}function _(o,e,t=ht(o.ownerDocument)){let i,n=[];function s(r,a){let d=ci(r,o.ownerDocument);for(let c of n)c();n=d.switchers.map(c=>t.register(c)),a(d.element),i=d}return s(e,r=>o.append(r)),{get element(){return i.element},get switchers(){return i.switchers},update(r){s(r,a=>i.element.replaceWith(a))},dispose(){for(let r of n)r();n=[],i.element.remove()}}}function p(o,e){let t=e.split(".");if(t.shift()!=="0")return;let i=o;for(let n of t){if(!/^(0|[1-9]\d*)$/.test(n)||!("children"in i))return;let s=i.children[Number(n)];if(!s)return;i=s}return i}function f(o){return o.slice(0,o.lastIndexOf("."))}function x(o,e,t){if(e==="0")return t;let i=f(e),n=p(o,i);if(!n||!("children"in n))throw new Error("Missing composition parent");let s=[...n.children];return s[Number(e.split(".").at(-1))]=t,x(o,i,{...n,children:s})}function w(o,e){if(!e.length||new Set(e).size!==e.length)return!1;let t=f(e[0]);if(!t||e.some(n=>f(n)!==t||!p(o,n)))return!1;let i=e.map(n=>Number(n.split(".").at(-1))).sort((n,s)=>n-s);return i.every((n,s)=>s===0||n===i[s-1]+1)}function O(o,e){if(e.length<2)return"Select two or more neighboring members.";if(new Set(e).size!==e.length)return"Select each member once.";let t=f(e[0]);if(!t||e.some(s=>f(s)!==t||!p(o,s)))return"Choose members of the same group.";let i=p(o,t);if(!i||!("children"in i))return"Choose members of the same group.";let n=e.map(s=>Number(s.split(".").at(-1))).sort((s,r)=>s-r);if(n.some((s,r)=>r>0&&s!==n[r-1]+1))return"Select neighboring members, with none skipped.";if(n.length===i.children.length)return"These are already all the members of one group. Leave a neighbor outside the new group."}function ut(o,e){let t=O(o,e);if(t)throw new Error(t);let i=f(e[0]),n=p(o,i);if(!("children"in n))throw new Error("Expected group");let s=Math.min(...e.map(a=>Number(a.split(".").at(-1)))),r=[...n.children];return r.splice(s,e.length,m(...r.slice(s,s+e.length))),x(o,i,{...n,children:r})}function xe(o,e){let t=p(o,e),i=f(e),n=p(o,i);if(!i||!t||!("children"in t)||!n||!("children"in n))throw new Error("Select an inner group to ungroup.");let s=[...n.children];return s.splice(Number(e.split(".").at(-1)),1,...t.children),x(o,i,{...n,children:s})}function mt(o,e){let t=100;function i(r,a){if(--t<0||a>12||!r||typeof r!="object")return;let d=r;if(d.kind==="Stack"&&Array.isArray(d.children)&&d.children.length>=2){let c=d.children.map(l=>i(l,a+1));return c.some(l=>!l)?void 0:m(...c)}if(["Text","Heading","Meta"].includes(String(d.kind))&&typeof d.text=="string")return{kind:d.kind,text:d.text}}function n(r){return"children"in r?r.children.flatMap(n):[JSON.stringify([r.kind,r.text])]}let s=i(o,0);return s&&s.kind==="Stack"&&JSON.stringify(n(s))===JSON.stringify(n(e))?s:void 0}var T=["Stack","Shelf","Switcher"];function k(o){return T.some(e=>e===o)}var re={Stack:"A Stack keeps its members in one column at any width.",Shelf:"A Shelf keeps its members in one row, and scrolls when the row needs more room.",Switcher:"A Switcher uses one row when all its members fit, and one column when they do not."};function q(o,e){let[t,...i]=e;if(t===void 0||i.length)return;let n=p(o,t);return n&&"children"in n?{path:t,group:n}:void 0}function ye(o,e,t){let i=q(o,[e]);if(!i)throw new Error("Select a group to change its arrangement.");return i.group.kind===t?o:x(o,e,{kind:t,children:i.group.children})}function ft(o,e){let t=[];function i(n,s,r){return!("children"in n)||!("children"in s)?!("children"in n)&&!("children"in s)&&n.kind===s.kind&&n.text===s.text:n.children.length!==s.children.length?!1:(n.kind!==s.kind&&t.push(r),n.children.every((a,d)=>i(a,s.children[d],`${r}.${d}`)))}return i(o,e,"0")?t:[]}function gt(o,e){function t(i,n){if(!i||typeof i!="object")return;let s=i;if(!("children"in n))return s.kind===n.kind&&s.text===n.text?n:void 0;if(!k(s.kind)||!Array.isArray(s.children)||s.children.length!==n.children.length)return;let r=[];for(let[a,d]of n.children.entries()){let c=t(s.children[a],d);if(!c)return;r.push(c)}return{kind:s.kind,children:r}}return t(o,e)}var li=100,hi=12;function vt(o){return"children"in o?o.children.flatMap(vt):[o]}function bt(o,e){let t=vt(e),i=0,n=0;function s(a,d){if(++n>li||d>hi||!a||typeof a!="object")return;let c=a;if(!k(c.kind)){let h=t[i];return!h||c.kind!==h.kind||c.text!==h.text?void 0:(i++,h)}if(!Array.isArray(c.children)||c.children.length<2)return;let l=[];for(let h of c.children){let u=s(h,d+1);if(!u)return;l.push(u)}return{kind:c.kind,children:l}}let r=s(o,0);return r&&"children"in r&&i===t.length?r:void 0}function P(o,e){let[t,...i]=e;if(t===void 0)return{selected:"nothing"};if(!i.length){let s=q(o,e);return s?{selected:"group",...s,canUngroup:t!=="0"}:p(o,t)?{selected:"content",path:t}:{selected:"nothing"}}if(!w(o,e))return{selected:"nothing"};let n=s=>Number(s.split(".").at(-1));return{selected:"members",paths:[...e].sort((s,r)=>n(s)-n(r)),parent:f(t),canGroup:!O(o,e)}}function V(o,e,t){if(!p(o,t))return e;if(e.includes(t)){let n=e.filter(s=>s!==t);return n.length>1&&!w(o,n)?[n[0]]:n}let i=[...e,t];return e.length&&w(o,i)?i:[t]}function se(o,e){return!Array.isArray(o)||!o.every(t=>typeof t=="string")?[]:P(e,o).selected==="nothing"?[]:o}var we=`/* Generated from reader-compatible Shiki GitHub themes. */
.token.primitive{--shiki-light:#6F42C1;--shiki-dark:#B392F0}
.token.string{--shiki-light:#032F62;--shiki-dark:#9ECBFF}
`;var ke=["Text","Heading","Meta"];function Se(o){return ke.some(e=>e===o)}var X={nodes:200,ancestors:12,history:50},yt="New text",Ee=o=>Number(o.slice(o.lastIndexOf(".")+1)),ui=o=>o.split(".").length-1;function wt(o){return"children"in o?o.children.reduce((e,t)=>e+wt(t),1):1}function kt(o){return wt(o)<X.nodes}function St(o){return"children"in o?Math.max(0,...o.children.map(e=>St(e)+1)):0}function ae(o,e){return ui(o)+1+Math.max(0,...e.map(St))<=X.ancestors}function de(o,e){let t=p(o,e);if(!t||!("children"in t))throw new Error("Expected a group");return t}function N(o){let e=0;function t(n,s){if(++e>X.nodes||s>X.ancestors||!n||typeof n!="object")return;let r=n;if(k(r.kind)){if(!Array.isArray(r.children))return;let a=[];for(let d of r.children){let c=t(d,s+1);if(!c)return;a.push(c)}return{kind:r.kind,children:a}}return Se(r.kind)&&typeof r.text=="string"?{kind:r.kind,text:r.text}:void 0}let i=t(o,0);return i&&"children"in i?i:void 0}function xt(o){if(!o||typeof o!="object")return;let e=o,t=N(e.model);return t&&{model:t,chosen:se(e.chosen,t)}}function Ce(o){let e=xt(o);if(!e)return;let t=o.undo,i=(Array.isArray(t)?t:[]).slice(-X.history).flatMap(n=>xt(n)??[]);return{...e,undo:i}}function U(o){return{model:o,chosen:[],undo:[]}}function Et(o,e){return[...o.undo,e].slice(-X.history)}function Ct(o,e,t){return{model:e,chosen:t,undo:Et(o,{model:o.model,chosen:o.chosen})}}function Tt(o){let e=o.undo.at(-1);return e&&{...e,undo:o.undo.slice(0,-1)}}function Oe(o,e){let t=P(o,e),i=kt(o),n=!1,s=b=>(b||(n=!0),b),r=t.selected==="group"||t.selected==="content"?t.path:void 0,a=t.selected==="members"?t.paths:r!==void 0&&r!=="0"?[r]:void 0,d=t.selected==="group"?t:t.selected==="nothing"?{path:"0",group:de(o,"0")}:void 0,c=r===void 0?void 0:p(o,r),l=r!==void 0&&c&&!("children"in c)?{path:r,content:c}:void 0,h=d&&s(i&&ae(d.path,[{kind:"Text",text:yt}]))?{parent:d.path,index:d.group.children.length,group:d.group}:void 0,u=a&&s(i)?{parent:f(a[0]),index:Ee(a.at(-1))+1}:void 0,g=a&&s(i&&ae(f(a[0]),[{kind:"Stack",children:a.map(b=>p(o,b))}]))?a:void 0;return{text:l,arrange:t.selected==="group"?{path:t.path,group:t.group}:void 0,inside:h,after:u,wrap:g,release:t.selected==="group"&&t.canUngroup?t.path:void 0,remove:r!==void 0&&r!=="0"?r:void 0,full:n}}function mi(o,e,t){let i=p(o,e);if(!i||"children"in i)throw new Error("Select one text to edit it.");return i.text===t?o:x(o,e,{kind:i.kind,text:t})}function Mt(o,e,t){if(!Se(t))throw new Error("Choose Text, Heading or Meta.");let i=p(o,e);if(!i||"children"in i)throw new Error("Select one text to change its role.");return i.kind===t?o:x(o,e,{kind:t,text:i.text})}function Lt(o,e,t){let i=de(o,e.parent);if(!Number.isInteger(e.index)||e.index<0||e.index>i.children.length)throw new Error("A new member needs a position in its group.");if(!kt(o))throw new Error("This working copy has no room for another member.");if(!ae(e.parent,[t]))throw new Error("That group is nested too deeply to hold a new member.");let n=[...i.children];return n.splice(e.index,0,t),{tree:x(o,e.parent,{kind:i.kind,children:n}),chosen:[`${e.parent}.${e.index}`]}}function qe(o,e,t=yt){return Lt(o,e,{kind:"Text",text:t})}function Pe(o,e,t){if(!k(t))throw new Error("Choose Stack, Shelf or Switcher.");return Lt(o,e,{kind:t,children:[]})}function At(o){return{tree:o.kind==="Stack"&&"children"in o&&!o.children.length?o:{kind:"Stack",children:[]},chosen:["0"]}}function $t(o,e){let t=f(e);if(!t||!p(o,e))throw new Error("Select a member to remove it.");let i=de(o,t),n=Ee(e),s=i.children.filter((a,d)=>d!==n),r=Math.min(n,s.length-1);return{tree:x(o,t,{kind:i.kind,children:s}),chosen:[r<0?t:`${t}.${r}`]}}function zt(o,e){if(!w(o,e))throw new Error("Select neighboring members of one group.");let t=f(e[0]),i=de(o,t),n=Math.min(...e.map(Ee)),s=[...i.children];return s.splice(n,e.length,{kind:"Stack",children:s.slice(n,n+e.length)}),{tree:x(o,t,{kind:i.kind,children:s}),chosen:[`${t}.${n}`]}}function Ht(o,e){let t=f(e);if(!t)throw new Error("Select an inner group to ungroup.");let{children:i}=de(o,e),n=Ee(e);return{tree:xe(o,e),chosen:i.length?i.map((s,r)=>`${t}.${n+r}`):[t]}}function Rt(o,e){let t=p(o.model,e);if(!t||"children"in t)throw new Error("Select one text to edit it.");return{path:e,before:{model:o.model,chosen:o.chosen}}}function Dt(o,e,t){return{...o,model:mi(o.model,e.path,t)}}function Te(o,e){let t=i=>{let n=p(i,e.path);return n&&!("children"in n)?n.text:void 0};return t(o.model)===t(e.before.model)?o:{...o,undo:Et(o,e.before)}}function Wt(o,e){return{...e.before,undo:o.undo}}var Ot=1,qt=16384,It=Math.floor(qt*3/4),$=class extends Error{problem;constructor(e,t){super(t),this.name="SnapshotError",this.problem=e}},fi=/^[A-Za-z0-9_-]+$/;function Pt(o){let e="";for(let t of o)e+=String.fromCharCode(t);return btoa(e).replaceAll("+","-").replaceAll("/","_").replace(/=+$/,"")}function gi(o){if(!fi.test(o)||o.length%4===1)return;let e=atob(o.replaceAll("-","+").replaceAll("_","/")),t=Uint8Array.from(e,i=>i.charCodeAt(0));return Pt(t)===o?t:void 0}function Me(o){let e=N(o);if(!e)throw new $("not-a-composition","Only a composition can be shared as a link.");let t=()=>new $("too-large","This composition is too large to share as a link. Shorten its wording or remove some of its content, then try again."),i=JSON.stringify({version:Ot,composition:e});if(i.length>It)throw t();let n=new TextEncoder().encode(i);if(n.length>It)throw t();return Pt(n)}function Nt(o){let e=()=>new $("malformed","This link is damaged or incomplete, so its composition cannot be opened. Ask for the link again.");if(typeof o!="string")throw e();if(o.length>qt)throw new $("too-large","This link is longer than a snapshot can be, so it was not opened.");let t=gi(o);if(!t)throw e();let i;try{i=JSON.parse(new TextDecoder("utf-8",{fatal:!0,ignoreBOM:!0}).decode(t))}catch{throw e()}if(!i||typeof i!="object"||Array.isArray(i))throw e();let n=i;if(n.version!==Ot)throw new $("unsupported-version","This link uses a snapshot format this playground cannot read. It may have been made by a newer version.");let s=N(n.composition);if(!s)throw new $("not-a-composition","This link does not hold a composition this playground can open.");return s}function Le(o,e){let t=new URL("../playground/index.html",import.meta.url);return o&&e&&(t.hash=`${o}=${e}`),t}var Ut=`/* Compose your own: one working copy, shown in two real slots.

   The editor has two faces. Rules up to "The workbench" style the strip a
   lesson teaches and what both faces share: the previews, the empty marker
   and the cues of a move. The workbench's own rules all begin \`.workbench\`. */
.editor-panel {
  display: contents;
}
.bar [hidden] {
  display: none;
}
.starter[hidden],
.workspace[hidden] {
  display: none;
}
.starter {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px 16px;
}
.start-action {
  padding: 8px 14px;
  border: 1px solid var(--ink);
  border-radius: 4px;
  color: var(--ink);
  font-weight: 600;
}
.start-blank {
  color: var(--ink);
  padding: 8px 4px;
}
.starter-note {
  color: var(--quiet);
  font-size: 12px;
}

/* Each preview is a host of its own size. These are demonstration slots:
   ordinary CSS sizes them, and the composition inside responds to the space
   it is given. Side by side when the page has room, one above the other
   when it does not; neither can be wider than the page. */
.previews {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 12px 24px;
}
.preview {
  min-inline-size: 0;
  max-inline-size: 100%;
}
.preview[data-preview="wide"] {
  flex: 1 1 560px;
}
.preview[data-preview="rail"] {
  flex: 0 1 260px;
}
.preview[data-preview="rail"] .stage {
  padding-inline-end: 0;
}
.preview[data-preview="rail"] .viewport {
  inline-size: 260px;
}
.preview-label {
  padding: 4px 0;
}
/* One readout for each view: the selected item, or its Switchers' result.
   Two lines are reserved so a selection does not move the controls below. */
.preview .caption {
  min-block-size: 2lh;
}
.preview .caption:has(.selection:not(:empty)) .note {
  display: none;
}

/* A group with no members, or a text with no characters, renders nothing.
   An outline marks its place. It adds no size to the layout and no extent to
   a scrolling Shelf; the declaration is where such a node is selected. */
.rendered :is(.node, .leaf)[data-empty="true"] {
  outline: 1px dotted color-mix(in srgb, var(--ink) 60%, transparent);
  outline-offset: 4px;
}
.rendered
  :is(.node, .leaf)[data-empty="true"]:is(
    [data-chosen="true"],
    [data-inspected="true"]
  ) {
  outline: 1.5px solid var(--ink);
  outline-offset: 4px;
}

/* The text of the one selected fact. It sits outside the previews, which are
   replaced as it changes. */
.working .text-edit {
  flex-basis: 100%;
  flex-wrap: nowrap;
  margin-block-start: 0;
}
.working .text-edit input {
  min-inline-size: 0;
}
.working .text-edit input:disabled {
  opacity: 0.55;
}
.creation {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px 20px;
  flex-basis: 100%;
}
.creation label {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
}
.creation select {
  font: inherit;
  color: var(--ink);
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 4px;
  padding: 4px 6px;
}
.creation select:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 3px;
}
@media (pointer: coarse) {
  .creation select,
  .starter button {
    min-block-size: 44px;
  }
}

/* Keep editing beside the visible part of a tall comparison. Sticky remains
   bounded by this workspace and releases at the strip's normal position.
   Short windows retain ordinary flow so the controls cannot cover the view.
   This query sizes teaching chrome; primitives still adapt intrinsically. */
@media (min-height: 40rem) and (pointer: fine),
  (min-height: 56rem) and (pointer: coarse) {
  .working {
    position: sticky;
    inset-block-end: 0;
    z-index: 2;
    margin-block-end: 0;
    padding-block: 10px 14px;
    border-block-start: 1px solid var(--line);
    background: var(--paper);
    max-block-size: 40dvh;
    overflow: auto;
  }
  /* Native keyboard scrolling reserves the strip's maximum footprint.
     Mouse selection keeps its position; no rectangle tracking is needed.
     The workbench has no strip over its previews. */
  :host(:not([standalone])) .rendered .node[tabindex="0"]:focus-visible {
    scroll-margin-block-end: 42dvh;
  }
}
.working .inside-action,
.working .after-action {
  color: var(--ink);
  font-weight: 600;
}
/* Their wording follows the selection; reserve room so neighbors stay put. */
.working .inside-action {
  min-inline-size: 10em;
  text-align: start;
}
.working .after-action {
  min-inline-size: 8em;
  text-align: start;
}
@media (forced-colors: active) {
  .rendered :is(.node, .leaf)[data-empty="true"] {
    outline: 1px dotted GrayText;
    outline-offset: 4px;
  }
  .rendered
    :is(.node, .leaf)[data-empty="true"]:is(
      [data-chosen="true"],
      [data-inspected="true"]
    ) {
    outline: 2px solid Highlight;
    outline-offset: 4px;
  }
  .start-action {
    border-color: ButtonText;
  }
}

/* Move keeps the authored selection while choosing a separate destination.
   Both are painted on existing boxes; no measured overlay participates. */
/* Every moving member has its own solid edge, including a run and forced
   colors. Inset edges survive native clipping inside a scrolling Shelf. */
.workspace[data-moving]
  .rendered
  :is(.node, .leaf)[data-chosen="true"]:not([data-empty="true"]) {
  outline: 1.5px solid var(--ink);
  outline-offset: -1.5px;
}
.rendered :is(.node, .leaf)[data-destination] {
  outline: 2px dashed var(--ink);
  outline-offset: -2px;
}
/* A destination underline coexists with the ordinary solid focus ring. */
.code-name[data-destination] {
  text-decoration: underline dashed;
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
}
/* While a move's destination is being chosen, its controls stand in for
   the others. */
.workspace[data-moving]
  .working
  > :is(.text-edit, .arrangement, .creation, .composition-actions, .history),
.workspace[data-moving] .inspector-body {
  display: none;
}
.move-controls {
  display: flex;
  flex-wrap: wrap;
  flex-basis: 100%;
  gap: 6px 16px;
}
.move-source,
.move-destination {
  flex-basis: 100%;
  overflow-wrap: anywhere;
}
.move-source {
  font-weight: 600;
}
.move-destination {
  color: var(--quiet);
}
.move-placements {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 20px;
}
.move-placements button:not(.cancel-move):enabled,
.move-action:enabled {
  color: var(--ink);
  font-weight: 600;
}
.move-placements .cancel-move {
  margin-inline-start: 12px;
}
@media (forced-colors: active) {
  .workspace[data-moving] .rendered :is(.node, .leaf)[data-chosen="true"] {
    outline-color: Highlight;
  }
  .rendered :is(.node, .leaf)[data-destination] {
    outline-color: CanvasText;
  }
  .code-name[data-destination] {
    text-decoration-color: CanvasText;
  }
}

/* Empty groups have no area to paint inside; mark their native zero-sized
   box, with a stronger dash than the idle dotted placeholder. Code remains
   their complete selector. */
.rendered :is(.node, .leaf)[data-empty="true"][data-destination] {
  outline: 2px dashed var(--ink);
  outline-offset: 4px;
}
@media (forced-colors: active) {
  .code-name[data-chosen="true"] {
    text-decoration: underline solid;
    text-decoration-thickness: 2px;
    text-underline-offset: 3px;
  }
  .code-name[data-destination] {
    text-decoration-style: dashed;
  }
  .rendered :is(.node, .leaf)[data-empty="true"][data-destination] {
    outline-color: CanvasText;
  }
}

/* Scrollable Shelves are keyboard stops. Their native focus ring takes
   precedence while focused; the code cue and destination label remain. */
.rendered .node[data-destination]:focus-visible,
.workspace[data-moving] .rendered .node[data-chosen="true"]:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 3px;
}
@media (forced-colors: active) {
  .rendered .node[data-destination]:focus-visible,
  .workspace[data-moving] .rendered .node[data-chosen="true"]:focus-visible {
    outline-color: Highlight;
  }
}

/* ------------------------------------------------------------------------
   The workbench: the editor on its own page.

   The result is on top, in its two real slots. Below it the hierarchy sits
   beside an inspector for whatever is selected there. Nothing here sizes a
   composition: these rules lay out editing chrome, and the previews remain
   hosts that ordinary CSS sizes.

   Type is sized on the chrome and never on an ancestor of the previews: the
   separation between a row's members follows the font size it inherits.
   ------------------------------------------------------------------------ */
:host([standalone]) {
  margin: 0;
}
.workbench {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 24px;
}
.workbench [hidden] {
  display: none !important;
}
.workbench h2 {
  margin: 0;
  font-size: 14px;
  font-weight: 650;
  line-height: 1.4;
}
/* The chrome's own buttons. Names in the hierarchy have their own rules. */
.workbench
  :where(.document-actions, .hierarchy-head, .view-choice, .inspector)
  button {
  padding: 6px 0;
  color: var(--ink);
}
.workbench
  :where(.document-actions, .hierarchy-head, .view-choice, .inspector)
  button:disabled {
  color: var(--quiet);
  opacity: 0.6;
  cursor: default;
}

/* The result, and what acts on the whole composition. */
.workbench .results {
  min-inline-size: 0;
}
.workbench .results-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 6px 24px;
  margin-block-end: 12px;
  font-size: 12px;
}
.workbench .results-hint {
  margin-block-start: 2px;
  color: var(--quiet);
  line-height: 1.5;
}
.workbench .document-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0 20px;
}
.workbench .result-views:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 2px;
}
/* A tall result scrolls within about half the window, so the editor below
   stays in reach while it changes. The box has no height of its own: a short
   result leaves no empty canvas. The gutter is reserved so that a scrollbar
   appearing cannot change the space the previews are offered. Short windows
   keep ordinary flow. This query sizes editing chrome only. */
@media (min-height: 40rem) {
  .workbench .result-views {
    max-block-size: 55dvh;
    /* Room for a focus ring at the box's edges, which now clip. */
    padding-block: 4px;
    overflow: hidden auto;
    scrollbar-gutter: stable;
  }
}
/* The card is as wide as it was asked to be, with the rail beside it. This
   independent box says how wide the card may become; the 24px is the room
   the card's stage keeps for its grip. */
.workbench .preview-limit {
  position: relative;
  inline-size: calc(100% - 24px);
  block-size: 0;
}
.workbench .previews {
  gap: 16px 24px;
}
.workbench .preview[data-preview="wide"] {
  flex: 0 1 auto;
}
.workbench .empty-hint {
  margin-block-start: 8px;
  color: var(--quiet);
  font-size: 12px;
}
/* The inspector names the selection, so each view keeps reporting what its
   Switchers did. Showing structure brings the selected group's measured
   readout back in its place. */
.workbench
  .preview:not(:has(.rendered[data-structure="true"]))
  .caption
  .selection {
  display: none;
}
.workbench
  .preview:not(:has(.rendered[data-structure="true"]))
  .caption
  .note:not(:empty) {
  display: inline;
}
/* A selected box has a wash and a flat inset edge, one for each member of a
   run. The edge is the cue that remains where colors are forced. It yields
   to the empty marker, a move's destination and keyboard focus. */
.workbench :where(.rendered) :where(.node, .leaf)[data-chosen="true"] {
  outline: 1.5px solid var(--ink);
  outline-offset: -1.5px;
}

/* The hierarchy beside the inspector. */
.workbench .editing {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: start;
  padding-block-start: 18px;
  border-block-start: 1px solid var(--line);
  font-size: 13px;
}
.workbench .hierarchy {
  min-inline-size: 0;
  padding-inline-end: 24px;
}
.workbench .inspector {
  min-inline-size: 0;
  padding-inline-start: 24px;
  border-inline-start: 1px solid var(--line);
}
.workbench .hierarchy-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0 16px;
}
.workbench .view-choice {
  display: flex;
  gap: 16px;
  margin-block-end: 6px;
}
.workbench :is(.hierarchy-head, .view-choice) button {
  font-size: 12px;
}
.workbench .view-choice button {
  color: var(--quiet);
}
/* A choice that is on is underlined, as a link in use would be. */
.workbench :is(.view-choice button, .several)[aria-pressed="true"] {
  color: var(--ink);
  text-decoration: underline;
  text-decoration-thickness: 1.5px;
  text-underline-offset: 5px;
}
.workbench .select-help {
  margin-block-end: 8px;
  color: var(--quiet);
  font-size: 12px;
  line-height: 1.5;
}
/* A long composition scrolls in its list. */
.workbench :is(.outline, .source) {
  max-block-size: min(24rem, 50dvh);
  overflow: auto;
}
.workbench pre {
  margin: 0;
  padding: 4px 8px;
  border-radius: 0;
  background: none;
}

/* The inspector: what is selected, then what can be done with it. */
.workbench .selection-context {
  margin-block-end: 14px;
}
.workbench .inspector .parent {
  display: block;
  padding: 0 0 4px;
  font-size: 12px;
}
.workbench .inspector .selected-title {
  display: inline;
  font-size: 17px;
}
.workbench .selected-detail {
  margin-inline-start: 8px;
  color: var(--quiet);
  font-size: 12px;
}
.workbench .wording {
  display: grid;
  gap: 6px;
  color: var(--quiet);
  font-size: 12px;
}
.workbench .wording input {
  inline-size: 100%;
  min-inline-size: 0;
  padding: 8px 10px;
  border: 1px solid var(--line);
  border-radius: 3px;
  background: var(--paper);
  color: var(--color-text, #26332c);
  font-size: 14px;
}
.workbench .choice {
  min-inline-size: 0;
  margin: 16px 0 0;
  padding: 0;
  border: 0;
}
.workbench .choice legend {
  margin-block-end: 4px;
  padding: 0;
  color: var(--quiet);
  font-size: 12px;
}
.workbench .choice label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-inline-end: 16px;
  padding-block: 4px;
  cursor: pointer;
}
.workbench .group-arrangement label {
  display: flex;
  margin-inline-end: 0;
}
.workbench .choice input {
  inline-size: 1em;
  block-size: 1em;
  margin: 0;
  accent-color: var(--ink);
}
.workbench .choice small {
  margin-inline-start: 4px;
  color: var(--quiet);
  font-size: 11px;
}
.workbench .choice p {
  margin-block-start: 6px;
  color: var(--quiet);
  font-size: 12px;
  line-height: 1.5;
}
.workbench .add-area {
  margin-block-start: 18px;
  padding-block-start: 14px;
  border-block-start: 1px solid var(--line);
}
.workbench .insertion-context {
  color: var(--quiet);
  font-size: 12px;
}
.workbench .inspector .place-toggle {
  margin-inline-start: 12px;
  padding: 0;
  font-size: 12px;
}
.workbench .add-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 16px;
  margin-block-start: 8px;
}
.workbench .add-groups {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0 14px;
  color: var(--quiet);
  font-size: 12px;
}
.workbench .selection-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0 20px;
  margin-block-start: 12px;
  font-size: 12px;
}
/* An action that does not apply to the selection is not shown. */
.workbench .selection-actions button:disabled {
  display: none;
}
.workbench .inspector .move-action {
  font-weight: 400;
}
.workbench .inspector .remove-action {
  margin-inline-start: auto;
  color: var(--quiet);
}
/* The one action a selection most invites: adding to it, or grouping a run. */
.workbench .inspector .add-text,
.workbench .inspector[data-multiple] .group-action {
  padding: 6px 12px;
  border-radius: 3px;
  background: var(--ink);
  color: var(--paper);
  font-weight: 600;
}
.workbench .inspector .add-text:disabled,
.workbench .inspector[data-multiple] .add-text {
  padding: 6px 0;
  background: none;
  color: var(--ink);
  font-weight: 400;
}
.workbench .inspector .add-text:disabled {
  color: var(--quiet);
}
.workbench .move-source {
  font-size: 15px;
}
.workbench .author-status {
  display: block;
  min-block-size: 1lh;
  margin-block-start: 14px;
  color: var(--quiet);
  font-size: 12px;
  line-height: 1.5;
}

@media (width < 44rem) {
  .workbench .editing {
    grid-template-columns: minmax(0, 1fr);
  }
  .workbench .hierarchy {
    padding-inline-end: 0;
  }
  .workbench .inspector {
    margin-block-start: 16px;
    padding: 16px 0 0;
    border-inline-start: 0;
    border-block-start: 1px solid var(--line);
  }
  .workbench :is(.outline, .source) {
    max-block-size: 14rem;
  }
}
@media (pointer: coarse) {
  .workbench
    :where(.document-actions, .hierarchy-head, .view-choice, .inspector)
    button,
  .workbench .choice label,
  .workbench .wording input {
    min-block-size: 44px;
  }
}
@media (forced-colors: active) {
  /* Stronger than the edge every box gets while structure is shown, and
     still behind the empty marker, a destination and keyboard focus. */
  .workbench
    .rendered
    :is(.node, .leaf)[data-chosen="true"]:not(
      [data-empty],
      [data-destination],
      :focus-visible
    ) {
    outline: 2px solid Highlight;
    outline-offset: -2px;
  }
  .workbench .inspector:not([data-multiple]) .add-text:enabled,
  .workbench .inspector[data-multiple] .group-action {
    border: 1px solid ButtonText;
  }
}
`;var Bt=`/* The composition as an outline. Rows are flat and square: a selected row
   has a wash and stronger words, a move's destination a dashed underline,
   and keyboard focus the ring. Each survives without color. */
.outline ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.outline-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  inline-size: 100%;
  padding-block: 6px;
  /* Script states how deeply a node is nested; this gives it a length. */
  padding-inline: calc(8px + var(--depth, 0) * 16px) 8px;
  border-radius: 0;
  color: inherit;
  font-size: 13px;
  text-align: start;
}
.row-kind {
  flex: none;
  color: var(--quiet);
  font-size: 11px;
}
.row-label {
  min-inline-size: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.outline-row[data-empty] .row-label {
  color: var(--quiet);
}
/* Says in words what a row is during a move: "moving" or "destination". */
.row-state {
  flex: none;
  margin-inline-start: auto;
  color: var(--ink);
  font-size: 11px;
}
.row-state:empty {
  display: none;
}
.outline-row:hover,
.outline-row[data-inspected] {
  background: color-mix(in srgb, var(--ink) 5%, transparent);
}
.outline-row[data-chosen="true"] {
  background: color-mix(in srgb, var(--ink) 11%, transparent);
}
.outline-row[data-chosen="true"] .row-label {
  color: var(--ink);
  font-weight: 600;
}
.outline-row[data-destination] .row-label {
  text-decoration: underline dashed;
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
}
/* Inside the row, so the list's scrolling box cannot clip it. */
.outline-row:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: -2px;
}
@media (forced-colors: active) {
  /* The wash is not painted here; an underline carries the selection. */
  .outline-row[data-chosen="true"] .row-label {
    text-decoration: underline solid;
    text-decoration-thickness: 2px;
    text-underline-offset: 3px;
  }
  .outline-row[data-destination] .row-label {
    text-decoration-style: dashed;
  }
  .row-state {
    color: CanvasText;
  }
  .outline-row:focus-visible {
    outline-color: Highlight;
  }
}
@media (pointer: coarse) {
  .outline-row {
    align-items: center;
    min-block-size: 44px;
  }
}
`;var ce=class{element;#e;#t;#i;#n=new AbortController;#s=new MutationObserver(()=>this.#p());#a=new ResizeObserver(()=>this.#h());#o;#d;#c=[];#r;constructor(e,t){let{signal:i}=this.#n,n=e.createElement("section");n.className="preview",n.dataset.preview=t.slot;let s=`preview-${t.slot}`;n.setAttribute("aria-labelledby",s),n.innerHTML=`<div class="stage"><div class="viewport"><div class="bar"><span class="preview-label" id="${s}"></span>${t.width?`<label class="width"><span class="sr-only"></span><input type="number" min="${160}" max="${720}" step="1"><span aria-hidden="true">px</span></label>`:""}</div><div class="frame"><div class="rendered"></div>${t.width?'<div class="resize" aria-hidden="true" title="Drag to resize. Edit the width field for keyboard control."></div>':""}</div></div></div><div class="caption"><span class="selection"></span><span class="note"></span></div>`;let r=h=>n.querySelector(h);r(".preview-label").textContent=t.label,this.element=n,this.#e=r(".rendered"),this.#t=r(".selection");let a=r(".viewport"),d=()=>this.#c;if(t.width){let{changed:h}=t.width,u=r(".width input");r(".width .sr-only").textContent=`${t.label} width`;let g=new K(t.width.availableSpace??r(".stage"),a,u,r(".note"),d);this.#i=g,a.style.inlineSize=`${t.width.initial}px`,this.#o=me({handle:r(".resize"),viewport:a,input:u,limit:()=>g.maximum,request:(b,H,y=g.maximum)=>{if(!Number.isFinite(b)){g.refreshWidth();return}let R=A(b,y);a.style.inlineSize=`${R}px`,h(R,H)},restore:()=>g.refreshWidth(),signal:i})}else this.#i=new ne(r(".note"),d);let c=r(".frame"),l=h=>h instanceof Element?h.closest(D)?.dataset.path:void 0;c.addEventListener("click",h=>{let u=l(h.target);u&&t.choose(u)},{signal:i}),c.addEventListener("pointermove",h=>{if(this.#o?.dragging)return;let u=l(h.target);u&&t.attend(u)},{signal:i}),c.addEventListener("pointerleave",()=>t.attend(void 0),{signal:i}),this.#s.observe(this.#e,{attributes:!0,subtree:!0,attributeFilter:[Y]})}render(e,t=!1){let i=t?[...this.#e.querySelectorAll('[data-kind="Shelf"]')].map(n=>[n.dataset.path,n.scrollLeft]):[];this.#d?this.#d.update(e):this.#d=_(this.#e,e);for(let[n,s]of i){let r=this.#e.querySelector(`[data-kind="Shelf"][data-path="${n}"]`);r&&(r.scrollLeft=s)}fe(this.#e);for(let n of this.#l())(n.classList.contains("leaf")?n.textContent==="":W(n).length===0)&&(n.dataset.empty="true");this.#r=void 0,this.#a.disconnect(),this.#i.observeComposition(this.#e),this.#p()}decorate({structure:e,inspected:t,chosen:i,destination:n}){for(let r of this.#l()){let a=String(i.includes(r.dataset.path));r.dataset.chosen!==a&&(r.dataset.chosen=a),r.toggleAttribute("data-destination",r.dataset.path===n)}let s=ge(this.#e,{structure:e,selected:t,preview:[]});if(s!==this.#r&&(this.#a.disconnect(),this.#r=s,s))for(let r of[...s.querySelectorAll(':scope > [data-decoration="gap"] [data-observation="gap"]')].slice(0,2))this.#a.observe(r);this.#h()}dispose(){this.#n.abort(),this.#o?.cancel(),this.#s.disconnect(),this.#a.disconnect(),this.#i.disconnect(),this.#d?.dispose(),this.#d=void 0,this.#r=void 0,this.element.remove()}#l(){return[...this.#e.querySelectorAll(D)]}#p(){this.#c=[...this.#e.querySelectorAll('[data-kind="Switcher"]')].map(e=>getComputedStyle(e).flexDirection),this.#i.refreshModes(),this.#h()}#h(){let e=ve(this.#r);this.#t.textContent!==e&&(this.#t.textContent=e)}};function xi(o,e){if(!("children"in o))return o.text||"Empty text";let t=o.children.length;return e?t?"Whole composition":"Whole composition, empty":t===0?"Empty group":t===1?"1 member":`${t} members`}var $e=class{#e;#t;#i;#n="0";#s=[];#a;#o=!1;#d;constructor(e,t){this.#e=e,this.#t=t;let{signal:i}=t,n=s=>s instanceof Element?s.closest("[data-path]")?.dataset.path:void 0;e.addEventListener("click",s=>{let r=n(s.target);r&&t.choose(r,s.shiftKey)},{signal:i}),e.addEventListener("pointerover",s=>{let r=n(s.target);r&&t.attend(r)},{signal:i}),e.addEventListener("pointerleave",()=>t.attend(void 0),{signal:i}),e.addEventListener("focusin",s=>{let r=n(s.target);r&&(this.rove(r),t.attend(r))},{signal:i}),e.addEventListener("focusout",s=>{(!(s.relatedTarget instanceof Node)||!e.contains(s.relatedTarget))&&t.attend(void 0)},{signal:i}),e.addEventListener("keydown",s=>{let r=this.#c(),a=r.indexOf(s.target),c={ArrowDown:a+1,ArrowUp:a-1,Home:0,End:r.length-1}[s.key];a<0||c===void 0||(s.preventDefault(),r[c]?.focus())},{signal:i})}show(e){this.#i=e;let t=this.#e.ownerDocument,n=this.#e.getRootNode().activeElement,s=n instanceof HTMLElement&&this.#e.contains(n)?n.dataset.path:void 0,r=(d,c,l)=>{let h=t.createElement("button");h.type="button",h.className="outline-row",h.dataset.path=c,h.style.setProperty("--depth",String(l));let u="children"in d?!d.children.length:!d.text;h.toggleAttribute("data-empty",u);for(let[b,H]of[["row-kind",d.kind],["row-label",xi(d,c==="0")],["row-state",""]]){let y=t.createElement("span");y.className=b,y.textContent=H,h.append(y)}let g=t.createElement("li");if(g.append(h),"children"in d&&d.children.length){let b=t.createElement("ul");d.children.forEach((H,y)=>b.append(r(H,`${c}.${y}`,l+1))),g.append(b)}return g},a=t.createElement("ul");a.append(r(e,"0",0)),this.#e.replaceChildren(a),this.#r(),s?this.focus(s):this.rove(this.#n)}mark(e){this.#s=e,this.#r()}destination(e,t=!1){this.#a=e,this.#o=t,this.#r()}inspect(e,t){this.#d=e?t:void 0,this.#r()}rove(e){let t=this.#c(),i=t.find(n=>n.dataset.path===e)??t[0];this.#n=i?.dataset.path??"0";for(let n of t)n.tabIndex=n===i?0:-1}focus(e){this.rove(e),this.#e.querySelector('.outline-row[tabindex="0"]')?.focus()}#c(){return[...this.#e.querySelectorAll(".outline-row")]}#r(){for(let e of this.#c()){let t=e.dataset.path,i=this.#s.includes(t),n=t===this.#a;e.dataset.chosen=String(i),e.toggleAttribute("data-destination",n),e.toggleAttribute("data-inspected",t===this.#d),this.#o?e.removeAttribute("aria-pressed"):e.setAttribute("aria-pressed",String(i)),n?e.setAttribute("aria-current","true"):e.removeAttribute("aria-current");let s=n?"destination":this.#o&&i?"moving":"",r=e.querySelector(".row-state");r.textContent!==s&&(r.textContent=s);let a=this.#i&&p(this.#i,t);a&&e.setAttribute("aria-label",this.#t.describe(t,a))}}};var ze=class{code;#e;#t;#i;#n;#s=80;#a=7.2;#o=0;#d="0";#c=[];#r;#l=!1;#p=!1;#h;constructor(e,t){let i=e.querySelector("code");if(!i)throw new Error("A source panel needs a code element");this.code=i,this.#e=t;let{signal:n}=t;this.#i=L(e),this.#t=new ResizeObserver(a=>{let d=a.at(-1)?.contentBoxSize[0];d&&(this.#o=d.inlineSize,this.#m())}),this.#t.observe(this.#i.target);let s=()=>{if(n.aborted)return;let a=i.ownerDocument.createElement("canvas").getContext("2d");a&&(a.font=getComputedStyle(e).font,this.#a=a.measureText("0").width||7.2),this.#m()};i.ownerDocument.fonts.addEventListener("loadingdone",s,{signal:n}),i.ownerDocument.fonts.ready.then(s);let r=a=>a instanceof Element?a.closest("[data-path]")?.dataset.path:void 0;i.addEventListener("click",a=>{let d=r(a.target);d&&t.choose(d,a.shiftKey)},{signal:n}),i.addEventListener("pointerover",a=>{let d=r(a.target);d&&t.attend(d)},{signal:n}),i.addEventListener("pointerleave",()=>t.attend(void 0),{signal:n}),i.addEventListener("focusin",a=>{let d=a.target;!(d instanceof HTMLElement)||!d.dataset.path||(this.rove(d.dataset.path),t.attend(d.dataset.path))},{signal:n}),i.addEventListener("focusout",a=>{(!(a.relatedTarget instanceof Node)||!i.contains(a.relatedTarget))&&t.attend(void 0)},{signal:n}),i.addEventListener("keydown",a=>{if(a.key!=="ArrowUp"&&a.key!=="ArrowDown"||!(a.target instanceof HTMLElement)||!a.target.classList.contains("code-name"))return;let d=this.#u(),c=d[d.indexOf(a.target)+(a.key==="ArrowDown"?1:-1)];a.preventDefault(),c?.focus()},{signal:n})}show(e){this.#n=e,this.#f()}mark(e){this.#c=e;for(let t of this.code.querySelectorAll("[data-path]")){let i=t.dataset.path;t.dataset.chosen=String(e.some(n=>i===n||i.startsWith(`${n}.`))),t.classList.contains("code-name")&&(this.#l?t.removeAttribute("aria-pressed"):t.setAttribute("aria-pressed",String(e.includes(i))))}}destination(e,t=!1){this.#r=e,this.#l=t;for(let i of this.#u()){i.toggleAttribute("data-destination",i.dataset.path===e),i.dataset.path===e?i.setAttribute("aria-current","true"):i.removeAttribute("aria-current");let n=this.#n&&p(this.#n,i.dataset.path);n&&i.setAttribute("aria-label",this.#e.describe(i.dataset.path,n))}}inspect(e,t){this.#p=e,this.#h=t,this.code.classList.toggle("inspecting",e),oe(this.code,e,t)}rove(e){let t=this.#u(),i=t.find(n=>n.dataset.path===e)??t[0];this.#d=i?.dataset.path??"0";for(let n of t)n.tabIndex=n===i?0:-1}focus(e){this.rove(e),this.code.querySelector('.code-name[tabindex="0"]')?.focus({preventScroll:!this.#e.revealFocus})}dispose(){this.#t.disconnect(),this.#i.dispose()}#u(){return[...this.code.querySelectorAll(".code-name")]}#m(){if(!this.#o)return;let e=Math.max(16,Math.min(80,Math.floor(this.#o/this.#a)));e!==this.#s&&(this.#s=e,this.#f())}#f(){let e=this.#n;if(!e)return;let i=this.code.getRootNode().activeElement,n=i instanceof HTMLElement&&this.code.contains(i)?i.dataset.path:void 0,s=this.code.ownerDocument.createDocumentFragment();for(let r of I(e,"0",0,this.#s)){let a=this.code.ownerDocument.createElement("span");a.className="code-line",a.style.setProperty("--continuation",`${(r.depth+1)*2}ch`),r.path&&(a.dataset.path=r.path);for(let d of r.tokens){let c=this.code.ownerDocument.createElement(d.kind?"button":"span");if(c.className=`token ${d.tone??"plain"}${d.kind?" code-name":""}`,c.textContent=d.text,d.path&&(c.dataset.path=d.path),d.kind&&d.path){c.setAttribute("type","button");let l=p(e,d.path);l&&c.setAttribute("aria-label",this.#e.describe(d.path,l))}a.append(c)}s.append(a)}this.code.replaceChildren(s),this.mark(this.#c),this.destination(this.#r,this.#l),this.inspect(this.#p,this.#h),n?this.focus(n):this.rove(this.#d)}};var yi="0";function Ft(o){return o.length?o:[yi]}function Gt(o,e,t,i){if(!p(o,t))return e;if(!i)return[t];let n=V(o,e,t);return n.length?n:[t]}var Ne=o=>Number(o.slice(o.lastIndexOf(".")+1));function Kt(o){return{parent:f(o),index:Ne(o)}}function Jt(o){return{parent:f(o),index:Ne(o)+1}}function Yt(o,e){let t=p(o,e);return{parent:e,index:t&&"children"in t?t.children.length:0}}var Z={root:"The whole composition has no group to move within.","not-members":"Select one member, or neighboring members, to move them.","not-a-place":"Choose a place among the members of a group.","inside-itself":"A group cannot move inside itself.","too-deep":"That place is nested too deeply to hold this.","already-there":"That is where this already is."};function Ue(o,e){if(e.includes("0"))return"root";if(!w(o,e))return"not-members";let t=f(e[0]),i=p(o,t);if(!i||!("children"in i))return"not-members";let n=Math.min(...e.map(Ne)),s=i.children.slice(n,n+e.length);return{parent:t,group:i,start:n,paths:s.map((r,a)=>`${t}.${n+a}`),nodes:s}}function Be(o,e,t){let i=p(o,t.parent);return!i||!("children"in i)||!Number.isInteger(t.index)||t.index<0||t.index>i.children.length?"not-a-place":e.paths.some(n=>t.parent===n||t.parent.startsWith(`${n}.`))?"inside-itself":t.parent===e.parent&&t.index>=e.start&&t.index<=e.start+e.nodes.length?"already-there":ae(t.parent,e.nodes)?void 0:"too-deep"}function Fe(o,e,t){let i=Ue(o,e);return typeof i=="string"?i:Be(o,i,t)}function Ge(o,e){let t=P(o,e),i=t.selected==="nothing"?void 0:Ue(o,t.selected==="members"?t.paths:[t.path]);if(!i||typeof i=="string"||!("children"in o))return;let n=[],s=0,r=!1,a=(d,c)=>{for(let l=0;l<=d.children.length;l++){let h=Be(o,i,{parent:c,index:l});h?h==="already-there"?s=n.length:h==="too-deep"&&(r=!0):n.push({parent:c,index:l,group:d});let u=d.children[l];u&&"children"in u&&a(u,`${c}.${l}`)}};return a(o,"0"),{members:i.paths,places:n,earlier:s,limited:r}}function jt(o,e,t,i){if(!o.startsWith(`${e}.`))return o;let[n,...s]=o.slice(e.length+1).split(".");return Number(n)<t?o:[e,Number(n)+i,...s].join(".")}function _t(o,e,t){let i=Ue(o,e);if(typeof i=="string")throw new Error(Z[i]);let n=Be(o,i,t);if(n==="already-there")return{tree:o,chosen:i.paths,from:i.parent};if(n)throw new Error(Z[n]);let s=i.nodes.length,r=x(o,i.parent,{kind:i.group.kind,children:i.group.children.filter((h,u)=>u<i.start||u>=i.start+s)}),a=jt(t.parent,i.parent,i.start+s,-s),d=t.parent===i.parent&&t.index>i.start?t.index-s:t.index,c=p(r,a);if(!c||!("children"in c))throw new Error(Z["not-a-place"]);let l=[...c.children];return l.splice(d,0,...i.nodes),{tree:x(r,a,{kind:c.kind,children:l}),chosen:i.nodes.map((h,u)=>`${a}.${d+u}`),from:jt(i.parent,a,d,s)}}var B=o=>o===1?"1 member":`${o} members`,Je=["before","inside","after"],Ye={before:"Before",inside:"Inside at end",after:"After"},je={Text:"Text carries the main wording.",Heading:"Heading names a section of the composition.",Meta:"Meta supplies supporting context, such as an update time."},Vt={Stack:"one column",Shelf:"one row",Switcher:"a row when it fits"};function Q(o){let e=n=>{let s=n.replace(/\s+/g," ").trim();return s.length>64?`${s.slice(0,63)}\u2026`:s};if(!("children"in o))return`${o.kind}: \u201C${e(o.text)||"empty text"}\u201D`;if(!o.children.length)return`empty ${o.kind}`;let t=n=>"children"in n?n.children.map(t).find(Boolean)??"":e(n.text),i=t(o);return`${o.kind}, ${B(o.children.length)}${i?`, starting with \u201C${e(i)}\u201D`:""}`}var Xt=`<div class="move-controls" hidden><span class="move-source"></span><span class="move-destination"></span><div class="move-placements" role="group" aria-label="Place the moving members">${Je.map(o=>`<button class="place-${o}" type="button">${Ye[o]}</button>`).join("")}<button class="cancel-move" type="button">Cancel</button></div></div>`,wi=`
<div class="starter">
  <button class="start-action" type="button">Copy investigation</button>
  <button class="start-blank" type="button">Start blank</button>
  <span class="starter-note"></span>
</div>
<div class="workspace" hidden>
  <div class="bar"><button class="structure" type="button" aria-pressed="false">Show structure</button><button class="open-playground" type="button">Open in playground \u2197</button></div>
  <div class="previews"></div>
  <div class="editor-panel">
  <div class="authoring combined working" role="group" aria-label="Edit your composition">
    <label class="edit text-edit">Wording<input class="text-field" type="text" autocomplete="off" spellcheck="true" disabled></label>
    <div class="content-role arrangement" role="radiogroup" aria-labelledby="role-label" aria-describedby="author-status" hidden>
      <span class="arrangement-label" id="role-label">Content role</span>
      <span class="arrangement-options">${ke.map(o=>`<label><input type="radio" name="content-role" value="${o}">${o}</label>`).join("")}</span>
    </div>
    <div class="group-arrangement arrangement" role="radiogroup" aria-labelledby="arrangement-label">
      <span class="arrangement-label" id="arrangement-label"></span>
      <span class="arrangement-options">${T.map(o=>`<label><input type="radio" name="arrangement" value="${o}">${o}</label>`).join("")}</span>
    </div>
    <div class="creation">
      <label>Add <select class="new-member" aria-label="Kind of new member"><option value="Text">Text</option>${T.map(o=>`<option value="${o}">Empty ${o}</option>`).join("")}</select></label>
      <button class="inside-action" type="button"></button>
      <button class="after-action" type="button"></button>
    </div>
    <div class="composition-actions">
      <button class="group-action" type="button">Group</button><button class="ungroup-action" type="button">Ungroup</button><button class="move-action" type="button">Move</button><button class="remove-action" type="button">Remove</button><button class="clear-action" type="button">Clear selection</button>
    </div>
    ${Xt}
    <span class="author-status" id="author-status" role="status" aria-live="polite"></span>
    <span class="history"><button class="undo-action" type="button">Undo</button><button class="blank-action" type="button">Start blank</button><button class="copy-action" type="button"></button></span>
  </div>
  <pre aria-label="Your composition"><code></code></pre>
  </div>
</div>`,ki=`
<div class="workspace workbench" hidden>
  <section class="results" aria-labelledby="results-title">
    <div class="results-head">
      <div><h2 id="results-title">One composition, two spaces</h2><p class="results-hint">Select a part in either view. Drag the wide card\u2019s edge to change its space.</p></div>
      <div class="document-actions"><button class="undo-action" type="button">Undo</button><button class="blank-action" type="button" title="Replace this composition with an empty one. Undo restores it.">Start blank</button><button class="structure" type="button" aria-pressed="false">Show structure</button></div>
    </div>
    <div class="result-views" role="group" aria-label="Wide card and narrow rail" tabindex="0">
      <div class="preview-limit" aria-hidden="true"></div>
      <div class="previews"></div>
      <p class="empty-hint" hidden>This composition is empty. Add text or an empty group below.</p>
    </div>
  </section>
  <div class="editing" role="group" aria-label="Edit your composition">
    <section class="hierarchy" aria-labelledby="hierarchy-title">
      <div class="hierarchy-head"><h2 id="hierarchy-title">Composition</h2><button class="several" type="button" aria-pressed="false">Select several</button></div>
      <div class="view-choice" role="group" aria-label="Show the composition as"><button class="show-outline" type="button" aria-pressed="true">Outline</button><button class="show-code" type="button" aria-pressed="false">Code</button></div>
      <p class="select-help" hidden>Choose neighboring members to group or move them together.</p>
      <div class="outline" role="group" aria-label="Composition outline"></div>
      <div class="source" hidden><pre aria-label="Composition code"><code></code></pre></div>
    </section>
    <section class="inspector" aria-label="Selected part">
      <div class="inspector-body">
        <div class="selection-context"><button class="parent" type="button" hidden></button><h2 class="selected-title"></h2><span class="selected-detail"></span></div>
        <label class="wording">Wording<input class="text-field" type="text" autocomplete="off" spellcheck="true" disabled></label>
        <fieldset class="content-role choice" aria-describedby="role-purpose" hidden>
          <legend>Content role</legend>
          ${ke.map(o=>`<label><input type="radio" name="content-role" value="${o}">${o}</label>`).join("")}
          <p class="role-purpose" id="role-purpose"></p>
        </fieldset>
        <fieldset class="group-arrangement choice" aria-describedby="arrangement-purpose" hidden>
          <legend>Arrangement</legend>
          ${T.map(o=>`<label><input type="radio" name="arrangement" value="${o}"><span>${o} <small>${Vt[o]}</small></span></label>`).join("")}
          <p class="arrangement-purpose" id="arrangement-purpose"></p>
        </fieldset>
        <div class="add-area">
          <span class="insertion-context"></span><button class="place-toggle" type="button" hidden></button>
          <div class="add-actions"><button class="add-text" type="button">Add text</button><span class="add-groups" role="group" aria-label="Add an empty group"><span>or an empty group</span>${T.map(o=>`<button type="button" data-add="${o}" title="Arranged as ${Vt[o]}">${o}</button>`).join("")}</span></div>
        </div>
        <div class="selection-actions"><button class="group-action" type="button">Group in a Stack</button><button class="ungroup-action" type="button">Ungroup</button><button class="move-action" type="button">Move</button><button class="remove-action" type="button">Remove</button></div>
      </div>
      ${Xt}
      <p class="author-status" id="author-status" role="status" aria-live="polite"></p>
    </section>
  </div>
</div>`,Ke="outline",_e=class extends HTMLElement{initialState;get isMoving(){return!!this.moving}finishEditing(){return this.finishText(),this.workingState}prepareToLeave(){return this.moving&&this.cancelMove(!1),this.several&&(this.several=!1,this.refresh()),this.finishEditing()}get workingState(){if(this.copy)return{copy:this.textEdit?Te(this.copy,this.textEdit):this.copy,width:this.width}}root=this.attachShadow({mode:"open"});source="";standalone=!1;copy;textEdit;moving;several=!1;addAfter=!1;structure=!1;attended;width=600;previews=[];code;outline;abort;connectedCallback(){let e=this.getAttribute("source-exercise");if(this.standalone=this.hasAttribute("standalone"),!e&&!this.standalone)throw new Error("A playground needs a source-exercise");this.source=e??"investigation",this.abort=new AbortController;let t=this.abort.signal;this.root.innerHTML=`<style>${pe}${J}${we}${ue}${Ut}${this.standalone?Bt:""}</style>${this.standalone?ki:wi}`,this.classList.add("editable"),this.wireEditing(t),this.standalone?this.wireWorkbench(t):this.wireStrip(t),this.standalone?(this.copy=this.withSubject(this.initialState?.copy??U(m())),this.width=this.initialState?.width??600):this.copy=this.load(),this.previews=[new ce(this.ownerDocument,{label:"Wide card",slot:"wide",width:{initial:this.width,...this.standalone?{availableSpace:this.get(".preview-limit")}:{},changed:(i,n)=>{this.width=i,n&&this.save()}},choose:i=>this.choose(i),attend:i=>this.attend(i)}),new ce(this.ownerDocument,{label:"Narrow rail",slot:"rail",choose:i=>this.choose(i),attend:i=>this.attend(i)})],this.get(".previews").append(...this.previews.map(i=>i.element)),this.code=new ze(this.get("pre"),{describe:(i,n)=>this.describe(i,n),choose:(i,n)=>this.choose(i,n),attend:i=>this.attend(i),revealFocus:this.standalone,signal:t}),this.copy&&this.open()}disconnectedCallback(){this.finishText(),this.abort?.abort(),this.abort=void 0;for(let e of this.previews)e.dispose();this.previews=[],this.code?.dispose(),this.code=void 0,this.outline=void 0,this.copy=void 0,this.moving=void 0,this.several=!1,this.addAfter=!1,this.attended=void 0}get(e){let t=this.root.querySelector(e);if(!t)throw new Error(`Missing ${e}`);return t}on(e,t,i){this.get(e).addEventListener(t,i,{signal:this.abort.signal})}get storageKey(){return`axiomatic-playground:v1:${this.source}`}get hierarchy(){return this.standalone&&Ke==="outline"?this.outline:this.code}withSubject(e){return this.standalone?{...e,chosen:Ft(e.chosen)}:e}describe(e,t){return this.moving?`${this.moving.members.includes(e)?e===this.moving.target?"Moving member, chosen as destination":"Moving member":e===this.moving.target?"Destination":"Choose destination"}: ${Q(t)}`:this.standalone?`${e==="0"?"Whole composition: ":""}${Q(t)}`:"children"in t?`Select ${t.kind} group, ${t.children.length?B(t.children.length):"empty"}`:`Select ${t.kind}: ${t.text||"empty"}`}wireEditing(e){this.on(".blank-action","click",()=>this.startBlank()),this.on(".structure","click",()=>{this.structure=!this.structure,this.structure||(this.attended=void 0),this.refresh()}),this.on(".text-field","input",()=>this.typeText()),this.on(".text-field","blur",()=>{this.finishText()&&this.refresh()}),this.get(".text-field").addEventListener("keydown",t=>{if(t.isComposing||t.keyCode===229){t.stopPropagation();return}t.key==="Enter"?this.finishText()&&this.refresh():t.key==="Escape"&&this.textEdit&&(t.stopPropagation(),this.cancelText())},{signal:e}),this.get(".group-arrangement").addEventListener("change",t=>{if(this.moving)return;let i=t.target.value,n=this.edits()?.arrange;if(!this.copy||!n||!k(i))return;let s=ye(this.copy.model,n.path,i);s!==this.copy.model&&this.apply({tree:s,chosen:[n.path]})},{signal:e}),this.get(".content-role").addEventListener("change",t=>{if(this.moving)return;this.finishText();let i=t.target.value,n=this.edits()?.text;if(!this.copy||!n||!Se(i))return;let s=Mt(this.copy.model,n.path,i);s!==this.copy.model&&this.apply({tree:s,chosen:[n.path]},this.standalone?void 0:je[i])},{signal:e}),this.act(".group-action",(t,i)=>{if(!i.wrap)return;let n=zt(t,i.wrap);return[n,`Grouped ${B(i.wrap.length)} in a new Stack.`,{name:n.chosen[0]}]}),this.act(".ungroup-action",(t,i)=>{if(!i.release)return;let n=Ht(t,i.release);return[n,"Ungrouped. The members keep their reading order.",{name:n.chosen[0]}]}),this.act(".remove-action",(t,i)=>{if(!i.remove)return;let n=p(t,i.remove),s=$t(t,i.remove),r=p(s.tree,f(i.remove)),a="children"in r&&!r.children.length?`This ${r.kind} is now empty and keeps its place.`:"Undo restores it.";return[s,"children"in n?`Removed the ${n.kind} and its ${B(n.children.length)}. ${a}`:`Removed. ${a}`,"stay"]}),this.on(".move-action","click",()=>this.beginMove()),this.on(".cancel-move","click",()=>this.cancelMove());for(let t of Je)this.on(`.place-${t}`,"click",()=>this.placeMove(t));this.on(".undo-action","click",()=>{if(this.moving)return;this.finishText();let t=this.copy&&Tt(this.copy);t&&(this.copy=this.withSubject(t),this.show("Undid the last change. Restored its selection.","stay"))}),this.root.addEventListener("keydown",t=>{if(t.key!=="Escape"||!this.copy)return;if(this.moving){t.preventDefault(),this.cancelMove();return}if(this.standalone){this.several&&(this.several=!1,this.refresh());return}let i=this.root.activeElement?.closest(".authoring")!=null,n=this.copy.chosen[0]??"0";this.finishText(),this.attended=void 0,this.select([]),i&&this.hierarchy?.focus(n)},{signal:e})}wireStrip(e){this.get(".starter-note").textContent=`Starts from the ${this.source} composition as it is now.`,this.get(".copy-action").textContent=`Copy ${this.source}`,this.get(".start-action").textContent=`Copy ${this.source}`,this.on(".open-playground","click",()=>{if(!(!this.copy||this.moving)){this.finishText();try{location.assign(Le("edit",Me(this.copy.model)).href)}catch(t){this.status(t instanceof Error?t.message:"This composition could not be opened.")}}}),this.on(".start-action","click",()=>this.start()),this.on(".start-blank","click",()=>this.startBlank()),this.get(".new-member").addEventListener("keydown",t=>{t.key==="Escape"&&t.stopPropagation()},{signal:e}),this.act(".inside-action",(t,i)=>i.inside?this.createMember(t,i.inside):void 0),this.act(".after-action",(t,i)=>i.after?this.createMember(t,i.after):void 0),this.on(".clear-action","click",()=>{if(!this.copy||this.moving)return;let t=this.copy.chosen[0]??"0";this.finishText(),this.select([]),this.status("Selection cleared. Choose a member or a group."),this.hierarchy?.focus(t)}),this.on(".copy-action","click",()=>{if(this.moving)return;let t=this.sourceComposition();if(!t){this.status(`The ${this.source} exercise is not on this page.`);return}this.apply({tree:t,chosen:[]},`Copied the ${this.source} composition as it is now. Undo restores your working copy.`,"stay")})}wireWorkbench(e){this.outline=new $e(this.get(".outline"),{describe:(t,i)=>this.describe(t,i),choose:(t,i)=>this.choose(t,i),attend:t=>this.attend(t),signal:e}),this.showHierarchy(Ke),this.on(".show-outline","click",()=>this.showHierarchy("outline")),this.on(".show-code","click",()=>this.showHierarchy("code")),this.on(".several","click",()=>{this.moving||(this.several=!this.several,this.refresh())}),this.on(".parent","click",()=>{let t=f(this.copy?.chosen[0]??"0");!t||this.moving||(this.finishText(),this.several=!1,this.select([t]),this.hierarchy?.focus(t))}),this.on(".place-toggle","click",()=>{this.addAfter=!this.addAfter,this.refresh()}),this.act(".add-text",(t,i)=>{let n=this.insertion(i);return n&&[qe(t,n),"Added text. Type to replace its wording.","text"]});for(let t of T)this.act(`[data-add="${t}"]`,(i,n)=>{let s=this.insertion(n);if(!s)return;let r=Pe(i,s,t),a=!!Oe(r.tree,r.chosen).inside;return[r,a?`Added an empty ${t}. Add text inside it to begin filling it.`:`Added an empty ${t} at the nesting limit. You can change its arrangement or move it to a shallower group.`,"inside"]})}showHierarchy(e){Ke=e,this.get(".outline").hidden=e!=="outline",this.get(".source").hidden=e!=="code";for(let t of["outline","code"])this.get(`.show-${t}`).setAttribute("aria-pressed",String(t===e));this.copy&&(this.hierarchy?.show(this.copy.model),this.hierarchy?.rove(this.moving?.target??this.copy.chosen[0]??"0"),this.decorate())}sourceComposition(){let t=this.getRootNode().querySelector(`axiomatic-example[exercise="${CSS.escape(this.source)}"]`);if(t&&typeof t=="object"&&"snapshot"in t&&typeof t.snapshot=="function")return N(t.snapshot());let i=be.find(n=>n===this.source);return i?N(E(i)):void 0}load(){try{let e=JSON.parse(sessionStorage.getItem(this.storageKey)||"null"),t=Ce(e),i=e&&typeof e=="object"&&"width"in e?e.width:void 0;return t&&typeof i=="number"&&Number.isFinite(i)&&(this.width=A(i,720)),t}catch{return}}save(){if(!this.copy)return;if(this.standalone){this.dispatchEvent(new CustomEvent("composition-change",{detail:this.workingState}));return}let e=this.textEdit?Te(this.copy,this.textEdit):this.copy;try{sessionStorage.setItem(this.storageKey,JSON.stringify({...e,width:this.width}))}catch{}}start(){let e=this.sourceComposition();if(!e){this.get(".starter-note").textContent=`The ${this.source} exercise is not on this page.`;return}this.copy=U(e),this.save(),this.open(),this.status("This copy is yours. Select a fact to reword it, or a group to add to it."),this.hierarchy?.focus("0")}startBlank(){if(this.moving)return;this.finishText(),this.several=!1;let e=!1;if(!this.copy)this.copy={...U(m()),chosen:["0"]},this.open();else{let t=At(this.copy.model);t.tree!==this.copy.model?(e=!0,this.apply(t)):this.select(["0"])}this.status(`An empty Stack. Add content or an empty group inside it.${e?" Undo restores your previous composition.":""}`),this.get(this.standalone?".add-text":".new-member").focus()}createMember(e,t){let i=this.get(".new-member").value;if(k(i)){let n=Pe(e,t,i);return this.get(".new-member").value="Text",[n,`Added an empty ${i}. Add Text inside it to begin filling the group.`,"inside"]}return[qe(e,t),"Added Text. Type to replace its wording, then choose its content role.","text"]}insertion(e){return this.addAfter?e.after:e.inside??e.after}open(){this.standalone||(this.get(".starter").hidden=!0),this.get(".workspace").hidden=!1,this.show()}edits(){return this.copy&&Oe(this.copy.model,this.copy.chosen)}act(e,t){this.on(e,"click",()=>{if(this.moving)return;this.finishText();let i=this.edits(),n=this.copy&&i&&t(this.copy.model,i);n&&this.apply(...n)})}apply(e,t,i="stay"){this.copy&&(this.finishText(),this.copy=Ct(this.copy,e.tree,e.chosen),this.show(t,i))}show(e,t="stay",i=!1){if(!this.copy)return;let n=this.root.activeElement;this.attended=void 0,this.several=!1,this.addAfter=!1;for(let r of this.previews)r.render(this.copy.model,i);this.hierarchy?.show(this.copy.model),this.hierarchy?.rove(this.copy.chosen[0]??"0"),this.refresh(e),this.save();let s=this.get(".text-field");if(t==="text"&&!s.disabled)s.focus({preventScroll:!0}),s.select();else if(t==="inside"){let r=this.get(this.standalone?".add-text":".inside-action");(r.disabled||!this.edits()?.inside?this.get(".group-arrangement input:checked"):r).focus({preventScroll:!0})}else if(t==="move"){let r=this.get(".move-action");(r.disabled?this.get(".undo-action"):r).focus({preventScroll:!0})}else typeof t=="object"?this.hierarchy?.focus(t.name):this.keepFocus(n)}keepFocus(e){((e instanceof HTMLButtonElement||e instanceof HTMLInputElement)&&e.disabled||e?.closest("[hidden]")!=null)&&this.hierarchy?.focus(this.copy?.chosen[0]??"0")}choose(e,t=!1){if(!this.copy)return;if(this.moving){this.moving={...this.moving,target:e},this.attended=void 0,this.refresh(),this.hierarchy?.rove(e);return}this.finishText();let{model:i,chosen:n}=this.copy;this.select(this.standalone?Gt(i,n,e,this.several||t):V(i,n,e)),this.hierarchy?.rove(e)}select(e){this.copy&&(this.copy={...this.copy,chosen:e},this.addAfter=!1,this.refresh(),this.save())}attend(e){let t=this.structure&&!this.moving?e:void 0;t!==this.attended&&(this.attended=t,this.decorate())}typeText(){if(this.moving)return;let e=this.edits()?.text;if(!(!this.copy||!e)){this.textEdit??=Rt(this.copy,e.path),this.copy=Dt(this.copy,this.textEdit,this.get(".text-field").value);for(let t of this.previews)t.render(this.copy.model,!0);this.hierarchy?.show(this.copy.model),this.refresh(),this.save()}}finishText(){return!this.copy||!this.textEdit?!1:(this.copy=Te(this.copy,this.textEdit),this.textEdit=void 0,this.save(),!0)}cancelText(){!this.copy||!this.textEdit||(this.copy=Wt(this.copy,this.textEdit),this.textEdit=void 0,this.show("Restored the text from before this edit.","stay",!0))}beginMove(){if(!this.copy||this.moving)return;this.finishText();let e=Ge(this.copy.model,this.copy.chosen);e?.places.length&&(this.moving={members:e.members},this.several=!1,this.attended=void 0,this.refresh(),this.get(".cancel-move").focus({preventScroll:!0}))}cancelMove(e=!0){this.moving&&(this.moving=void 0,this.attended=void 0,this.hierarchy?.rove(this.copy?.chosen[0]??"0"),this.refresh("Move cancelled. Your composition is unchanged."),e&&this.get(".move-action").focus())}movePlace(e){if(!this.copy||!this.moving?.target)return;let t=this.moving.target,i=p(this.copy.model,t);if(i){if(e==="inside")return"children"in i?Yt(this.copy.model,t):void 0;if(t!=="0")return e==="before"?Kt(t):Jt(t)}}movingName(){let e=this.moving;return!e||!this.copy?"":e.members.length===1?Q(p(this.copy.model,e.members[0])):`${B(e.members.length)} together`}refreshMove(){if(!this.copy||!this.moving)return;let{model:e}=this.copy,t=this.moving.target&&p(e,this.moving.target);this.get(".move-source").textContent=`Moving ${this.movingName()}`;let i=this.moving.target&&this.moving.target!=="0"?p(e,f(this.moving.target)):void 0,n=i?` in the surrounding ${i.kind}`:" in the whole composition";this.get(".move-destination").textContent=t?`Destination: ${Q(t)}${i?` \xB7 inside ${i.kind}`:" \xB7 whole composition"}`:"Choose a destination in either view or the composition.";let s=new Set,r=[];for(let c of Je){let l=this.get(`.place-${c}`),h=this.movePlace(c),u=h&&Fe(e,this.moving.members,h),g=!h||!!u;l.disabled=g,l.setAttribute("aria-label",t?`Move ${c==="inside"?"inside at end of":c} ${Q(t)}`:Ye[c]);let b=u?Z[u]:h?"":c==="inside"?"Choose a group to move inside.":"The whole composition has no surrounding group.";l.title=t?b:"Choose a destination first.",u&&s.add(Z[u]),g||r.push(c)}let a=r.filter(c=>c!=="inside"),d=[a.length&&t?`${a.map(c=>Ye[c]).join(" or ")} places the moving members${n}, alongside this ${t.kind}.`:"",r.includes("inside")&&t?`Inside at end adds them to ${this.moving.target==="0"?"the whole composition":`this ${t.kind}`}.`:""].filter(Boolean).join(" ");this.status(t?d||[...s].join(" ")||"Choose another destination.":"The solid selection is what travels. Choosing a destination does not move it yet.")}placeMove(e){if(!this.copy||!this.moving?.target)return;let t=this.movePlace(e);if(!t||Fe(this.copy.model,this.moving.members,t))return;let i=this.movingName(),n=Q(p(this.copy.model,this.moving.target)),s=_t(this.copy.model,this.moving.members,t);if(s.tree===this.copy.model)return;let r=p(s.tree,s.from),a=r&&"children"in r&&!r.children.length?` The ${r.kind} it left is empty and keeps its arrangement.`:"";this.moving=void 0,this.apply(s,`Moved ${i} ${e==="inside"?"inside, at the end of":e} ${n}.${a} Undo restores the previous composition.`,"move")}status(e){this.get(".author-status").textContent=e}decorate(){if(!this.copy)return;let{chosen:e}=this.copy,t=this.attended??(e.length===1?e[0]:void 0);for(let i of this.previews)i.decorate({structure:this.structure,inspected:t,chosen:e,destination:this.moving?.target});this.hierarchy?.destination(this.moving?.target,!!this.moving),this.hierarchy?.mark(e),this.hierarchy?.inspect(this.structure,t)}refresh(e){let t=this.edits();if(!this.copy||!t)return;this.standalone&&this.dispatchEvent(new CustomEvent("composition-interaction",{detail:{moving:!!this.moving}}));let{model:i,chosen:n}=this.copy,s=this.get(".structure");s.setAttribute("aria-pressed",String(this.structure)),s.textContent=this.structure?"Hide structure":"Show structure";let r=this.get(".text-field");r.disabled=!t.text;let a=t.text?.content.text??"";r.value!==a&&(r.value=a);for(let c of this.root.querySelectorAll(".content-role input"))c.disabled=!t.text,c.checked=c.value===t.text?.content.kind;for(let c of this.root.querySelectorAll(".group-arrangement input"))c.disabled=!t.arrange,c.checked=c.value===t.arrange?.group.kind;this.enable(".group-action",!!t.wrap),this.enable(".ungroup-action",!!t.release),this.enable(".move-action",!!Ge(i,n)?.places.length),this.enable(".remove-action",!!t.remove),this.enable(".undo-action",!this.moving&&(this.copy.undo.length>0||!!this.textEdit)),this.enable(".blank-action",!this.moving);let d=this.standalone?this.refreshInspector(t,e):this.refreshStrip(t,e);this.get(".workspace").toggleAttribute("data-moving",!!this.moving),this.get(".move-controls").hidden=!this.moving,this.moving?this.refreshMove():this.status(d),this.decorate()}enable(e,t,i){let n=this.get(e);n.disabled=!t,i!==void 0&&(n.textContent=i)}refreshStrip(e,t){let{model:i,chosen:n}=this.copy;this.get(".text-field").placeholder=e.text?"":"Select one fact to edit its text",this.get(".content-role").hidden=!e.text;let s=this.get(".group-arrangement");s.hidden=!!e.text;let r=e.arrange;s.setAttribute("aria-disabled",String(!r));let a=r?.group.children.length;this.get(".group-arrangement .arrangement-label").textContent=r?a===0?"Arrange this empty group as":a===1?"Arrange this group as":`Arrange these ${a} members as`:"Arrange a group as";let d=n[0]===void 0?void 0:p(i,n[0]);return this.enable(".inside-action",!!e.inside,e.arrange?`Inside ${e.arrange.group.kind}`:e.inside?"Inside composition":"Inside group"),this.enable(".after-action",!!e.after,n.length>1?"After selection":`After ${e.remove&&d?d.kind:"member"}`),this.enable(".open-playground",!this.moving),this.enable(".clear-action",n.length>0),e.full?"This selection reaches a size or nesting limit. You can still use the enabled actions.":t!==void 0?t:r?r.group.children.length?re[r.group.kind]:`This ${r.group.kind} is empty and keeps its arrangement. Add a member inside it${e.remove?", or remove it":""}.`:e.text?`${je[e.text.content.kind]} Changing its role keeps its wording and membership.`:n.length>1?`${B(n.length)} selected. Group them, move them, or add a member after them.`:"Select a fact to reword it, or a group's name in the code to arrange or add to it."}refreshInspector(e,t){let{model:i,chosen:n}=this.copy,s=n[0]??"0",r=p(i,s)??i,a=n.length<2;this.get(".inspector").toggleAttribute("data-multiple",!a),this.get(".selected-title").textContent=a?r.kind:`${n.length} members selected`,this.get(".selected-detail").textContent=a&&"children"in r?`${s==="0"?"the whole composition \xB7 ":""}${r.children.length?B(r.children.length):"empty"}`:"";let d=s==="0"?void 0:p(i,f(s)),c=this.get(".parent");c.hidden=!d,d&&(c.textContent=`\u2191 In ${d.kind}`,c.setAttribute("aria-label",`Select the ${d.kind} ${a?"this is":"these are"} in`)),this.get(".wording").hidden=!e.text,this.get(".content-role").hidden=!e.text,this.get(".role-purpose").textContent=e.text?je[e.text.content.kind]:"",this.get(".group-arrangement").hidden=!e.arrange,this.get(".arrangement-purpose").textContent=e.arrange?re[e.arrange.group.kind]:"";let l=this.insertion(e),h=e.inside&&l===e.inside?e.inside:null;this.get(".insertion-context").textContent=l?h?`Add inside this ${h.group.kind}`:a?`Add after this ${r.kind}`:"Add after these members":"Nothing more can be added here.";let u=this.get(".place-toggle");u.hidden=!(e.inside&&e.after),u.textContent=h?"Add after it instead":"Add inside it instead";for(let b of this.root.querySelectorAll(".add-text, [data-add]"))b.disabled=!l;let g=this.get(".several");return g.disabled=!!this.moving,g.setAttribute("aria-pressed",String(this.several)),g.textContent=this.several?"Done selecting":"Select several",this.get(".select-help").hidden=!this.several,this.get(".empty-hint").hidden=!("children"in i)||i.children.length>0,[t,e.full?"This selection is at a size or nesting limit, so some actions are unavailable.":""].filter(Boolean).join(" ")}};customElements.get("axiomatic-playground")||customElements.define("axiomatic-playground",_e);var Zt=`:host {
  display: block;
  color: var(--color-text);
  --ink: var(--color-link);
  --paper: var(--color-background);
  --quiet: var(--color-text-aside);
  --line: var(--color-accent);
}
* {
  box-sizing: border-box;
}
[hidden] {
  display: none !important;
}
button,
input,
select {
  font: inherit;
}
button {
  border: 0;
  background: none;
  padding: 8px 0;
  color: var(--ink);
  cursor: pointer;
}
button:disabled {
  opacity: 0.5;
  cursor: default;
}
button:focus-visible,
input:focus-visible,
select:focus-visible,
summary:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 3px;
}
h1 {
  margin: 0 0 12px;
  font-size: 26px;
  letter-spacing: -0.025em;
}
p {
  line-height: 1.55;
}
.workspace-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
  align-items: start;
  margin-block-end: 24px;
}
.draft-heading {
  min-inline-size: 180px;
  flex: 1 1 260px;
}
.draft-title {
  display: block;
}
.draft-title input {
  font-size: 22px;
  font-weight: 650;
  padding: 6px 0;
  inline-size: 100%;
  border: 0;
  border-bottom: 1px solid transparent;
  background: none;
  color: inherit;
}
.draft-title input:hover,
.draft-title input:focus {
  border-color: var(--line);
}
.draft-picker {
  display: flex;
  gap: 8px;
  align-items: center;
  color: var(--quiet);
  font-size: 13px;
}
select {
  max-inline-size: 240px;
  padding: 6px;
  color: inherit;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 4px;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  font-size: 13px;
}
.save-status,
.privacy,
.local-note {
  color: var(--quiet);
  font-size: 12px;
  margin: 6px 0 14px;
}
.save-status {
  min-block-size: 1.5em;
  margin: 0;
  font-size: 11px;
}
.workspace-tools > .actions {
  align-items: baseline;
  gap: 18px;
  font-size: 12px;
}
.workspace-tools .remove-draft {
  color: var(--quiet);
}
.removal {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 20px;
  padding-block: 12px;
  margin-block: 12px 20px;
  border-block: 1px solid var(--line);
  font-size: 13px;
}
.removal-note {
  flex: 1 1 36ch;
  color: var(--quiet);
  margin: 0;
}
.removal-error {
  font-size: 13px;
}
.empty-workspace {
  padding-block: 48px;
  color: var(--quiet);
}
.recovery,
.link-result {
  margin: 12px 0 20px;
  border-inline-start: 2px solid var(--ink);
  padding: 0 16px;
}
.recovery p,
.link-result p {
  margin: 8px 0;
}
.link-result input {
  inline-size: 100%;
  border: 1px solid var(--line);
  border-radius: 4px;
  padding: 10px;
  background: var(--paper);
  color: inherit;
  font-size: 13px;
}
.snapshot-surface {
  padding: clamp(18px, 3vw, 40px);
  border: 1px solid var(--line);
  border-radius: 6px;
  margin: 24px 0;
  min-inline-size: 0;
}
.snapshot-surface :is(h3, p) {
  margin: 0;
}
.snapshot-surface [data-axiomatic="Meta"] {
  color: var(--quiet);
}
.snapshot-note {
  color: var(--quiet);
  max-inline-size: 68ch;
}
pre {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  padding: 20px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--line) 35%, var(--paper));
  font:
    13px/1.6 ui-monospace,
    monospace;
}
.sr-only {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
@media (pointer: coarse) {
  button,
  select,
  input {
    min-block-size: 44px;
  }
}
@media (width < 600px) {
  .workspace-tools {
    align-items: start;
  }
  .draft-heading {
    flex-basis: 100%;
  }
  .draft-picker {
    flex-wrap: wrap;
  }
}
`;var S={drafts:20,name:80,characters:2*1024*1024},Ei=600,Ci=64,Ti={"too-many-drafts":`This browser keeps at most ${S.drafts} drafts, so a new one was not made. Your drafts are unchanged. A snapshot link keeps this composition without a draft.`,"too-large":"Your drafts would be too large to save in this browser, so this change was not saved. What was saved before is unchanged. A snapshot link keeps this composition without a draft.",name:`A draft's name can have at most ${S.name} characters.`,composition:"A draft can only hold a composition.","unknown-draft":"That draft is not among your drafts.",identity:"A draft needs an identity of its own.","already-restored":"That draft is already among your drafts, so it was not restored again.",width:"A draft's width is a number of pixels."},Mi={"too-many-drafts":`This browser keeps at most ${S.drafts} drafts and already has that many, so the removed draft was not restored. Your drafts are unchanged.`,"too-large":"Restoring the removed draft would make your drafts too large to save in this browser, so it was not restored. Your drafts are unchanged."},F=class extends Error{problem;constructor(e,t=Ti[e]){super(t),this.name="DraftError",this.problem=e}};function le(o,e,t,i){if(typeof o!="string"||!o||o.length>Ci)return"identity";if(typeof e!="string"||e.length>S.name)return"name";let n=Ce(t);return n?typeof i!="number"||!Number.isFinite(i)?"width":{id:o,name:e,copy:n,width:A(i,720)}:"composition"}function Li(o,e){return o===null?e.length===0:e.some(t=>t.id===o)}function j(o,e){if(e.length>S.drafts)return"too-many-drafts";if(new Set(e.map(i=>i.id)).size!==e.length)return"identity";if(!Li(o,e))return"unknown-draft";let t={version:1,activeId:o,drafts:e};return JSON.stringify(t).length>S.characters?"too-large":t}function G(o){if(typeof o=="string")throw new F(o);return o}function Ve(o){if(!o||typeof o!="object")return;let e=o;if(e.version!==1||!Array.isArray(e.drafts)||e.drafts.length>S.drafts)return;let t=[];for(let n of e.drafts){if(!n||typeof n!="object")return;let{id:s,name:r,copy:a,width:d}=n,c=le(s,r,a,d);if(typeof c=="string")return;t.push(c)}let i=j(e.activeId,t);return typeof i=="string"?void 0:i}function Qt(o,e,t,i){let n=G(le(i,t,{model:e,chosen:["0"],undo:[]},Ei));return G(j(i,[...o?.drafts??[],n]))}function Xe(o,e,t,i,n){let s=o.drafts.find(a=>a.id===e);if(!s)throw new F("unknown-draft");let r=G(le(e,n??s.name,t,i));return G(j(o.activeId,o.drafts.map(a=>a===s?r:a)))}function ei(o,e){return e===o.activeId?o:G(j(e,o.drafts))}function ti(o,e){let t=o.drafts.findIndex(r=>r.id===e),i=o.drafts[t];if(!i)throw new F("unknown-draft");let n=o.drafts.filter(r=>r!==i),s=o.activeId===e?(n[t]??n[t-1])?.id??null:o.activeId;return{workspace:G(j(s,n)),removed:{draft:i,index:t}}}function ii(o){if(!o||typeof o!="object")return;let{draft:e,index:t}=o;if(!e||typeof e!="object"||typeof t!="number"||!Number.isInteger(t)||t<0||t>=S.drafts)return;let{id:i,name:n,copy:s,width:r}=e,a=le(i,n,s,r);if(typeof a!="string")return typeof j(a.id,[a])=="string"?void 0:{draft:a,index:t}}function Ze(o,e){let{id:t,name:i,copy:n,width:s}=e.draft,r=G(le(t,i,n,s)),a=o?.drafts??[];if(a.some(l=>l.id===r.id))throw new F("already-restored");let d=Number.isInteger(e.index)?Math.min(Math.max(e.index,0),a.length):a.length,c=j(r.id,[...a.slice(0,d),r,...a.slice(d)]);if(typeof c=="string")throw new F(c,Mi[c]);return c}var he="axiomatic-drafts:v1",Qe="axiomatic-last-removal:v1",z=class extends Error{},ee=class extends Error{},Ai={read:()=>sessionStorage.getItem(Qe),write:o=>{o===null?sessionStorage.removeItem(Qe):sessionStorage.setItem(Qe,o)}},$i={read:()=>localStorage.getItem(he),write:o=>localStorage.setItem(he,o),exclusive:o=>navigator.locks?navigator.locks.request(he,o):Promise.reject(new Error("Saving drafts needs HTTPS or localhost in a modern browser."))},He=class{environment;removal;constructor(e=$i,t=Ai){this.environment=e,this.removal=t}read(){let e=this.environment.read();if(e===null)return;if(e.length>S.characters)throw new Error("Stored drafts are too large to open.");let t=Ve(JSON.parse(e));if(!t)throw new Error("Stored drafts could not be read. They have been left unchanged.");return t}write(e){let t=Ve(e);if(!t)throw new Error("These drafts are too large to save. Your previous saved work is unchanged.");return this.environment.write(JSON.stringify(t)),t}locked(e){return this.environment.exclusive(e)}create(e,t,i){return this.locked(()=>{let n=this.read(),s=new Set(n?.drafts.map(l=>l.name)),r=(t.trim()||"Untitled composition").slice(0,72),a=r;for(let l=2;s.has(a);l++)a=`${r} (${l})`;let d=crypto.randomUUID(),c=Qt(n,e,a,d);return i&&(c=Xe(c,d,i.copy,i.width,a)),this.write(c)})}save(e,t){return this.locked(()=>{let i=this.read(),n=i?.drafts.find(s=>s.id===e.id);if(!i||!t||JSON.stringify(n)!==JSON.stringify(t))throw new z(n?"This draft changed in another tab. Your edits here are still available.":"This draft was removed in another tab. Your edits here are still available to save as a new draft.");return this.write(Xe(i,e.id,e.copy,e.width,e.name))})}activate(e){return this.locked(()=>{let t=this.read();if(!t)throw new Error("This saved draft is no longer available.");return this.write(ei(t,e))})}lastRemoval(){let e=this.removal.read();if(e===null)return;if(e.length>S.characters)throw new Error("The removed draft could not be read.");let t=JSON.parse(e),i=t&&typeof t=="object"&&"version"in t&&t.version===1?ii(t):void 0;if(!i)throw new Error("The removed draft could not be read.");let n;try{n=this.read()}catch{}if(!n?.drafts.some(s=>s.id===i.draft.id))return i}remove(e,t=!1){return this.locked(()=>{let i=this.read(),n=i?.drafts.find(d=>d.id===e.id);if(!i||JSON.stringify(n)!==JSON.stringify(e))throw new z(n?"This draft changed in another tab. Your draft has not been removed.":"This draft was already removed in another tab. Your work here is still available.");let s=ti(i,e.id),r;try{r=this.lastRemoval()}catch{if(!t)throw new ee(`The previous Undo removal entry cannot be read. Removing \u201C${e.name||"Untitled composition"}\u201D will replace it.`)}if(r&&!t)try{Ze(i,r)}catch{throw new ee(`\u201C${r.draft.name||"Untitled composition"}\u201D cannot currently be restored. Removing \u201C${e.name||"Untitled composition"}\u201D will replace its Undo removal entry.`)}let a=this.removal.read();this.removal.write(JSON.stringify({version:1,...s.removed}));try{return this.write(s.workspace)}catch(d){try{this.removal.write(a)}catch(c){throw new AggregateError([d,c],"The draft was not removed. Storage also refused to recover the previous Undo removal entry.")}throw d}})}undoRemoval(){return this.locked(()=>{let e=this.lastRemoval();if(!e)throw new Error("There is no removed draft to restore in this tab.");let t=this.write(Ze(this.read(),e));try{this.removal.write(null)}catch{}return t})}};var Re=o=>o instanceof Error?o.message:"The action could not be completed.",zi=`
<section class="editor-view" hidden>
  <div class="workspace-tools">
    <div class="draft-heading"><label class="draft-title"><span class="sr-only">Draft name</span><input maxlength="80" autocomplete="off" placeholder="Untitled composition"></label><p class="save-status" role="status" aria-live="polite"></p></div>
    <label class="draft-picker">Your drafts<select aria-label="Your drafts"></select></label>
    <div class="actions"><button class="new-draft">New draft</button><button class="share">Copy snapshot link</button><button class="remove-draft">Remove draft</button></div>
  </div>
  <div class="removal" hidden><p class="removal-note" role="status"></p><button class="undo-removal">Undo removal</button></div>
  <p class="removal-error" role="alert" hidden></p>
  <div class="replace-removal" hidden><div class="actions"><button class="confirm-removal">Remove and replace Undo</button><button class="cancel-removal">Keep drafts as they are</button></div></div>
  <div class="recovery" hidden><p class="problem" role="alert"></p><div class="actions"><button class="retry">Retry save</button><button class="fork">Save mine as a new draft</button><button class="reload-draft">Load saved draft</button></div></div>
  <div class="link-result" hidden><p class="link-message" role="status"></p><label><span class="sr-only">Snapshot link</span><input class="snapshot-link" readonly></label><p class="local-note"></p></div>
  <div class="editor-host"></div>
  <p class="empty-workspace" hidden>No drafts here yet. Create a new draft, or undo your last removal.</p>
  <p class="privacy">Drafts are saved in this browser. A snapshot link contains a fixed copy of its composition; anyone with the link can open it.</p>
</section>
<section class="snapshot-view" hidden>
  <h1>Composition snapshot</h1>
  <p class="snapshot-note">A fixed copy, adapting to the space on this page. Editing a copy keeps the snapshot and your existing drafts intact.</p>
  <div class="actions"><button class="edit-copy">Edit a copy</button><button class="return-drafts">Return to my drafts</button></div>
  <p class="snapshot-error" role="alert" hidden></p>
  <div class="snapshot-surface"></div>
  <details class="snapshot-source"><summary>See the composition</summary><pre></pre></details>
</section>`,et=class extends HTMLElement{root=this.attachShadow({mode:"open"});storage=new He;workspace;active;base;editor;pending;saving;blocked=!1;transitioning=!1;routeRevision=0;editorRevision=0;snapshot;mounted;removed;removalChange;abort=new AbortController;connectedCallback(){this.root.innerHTML=`<style>${Zt}${J}</style>${zi}`;let e=(t,i,n)=>this.get(t).addEventListener(i,()=>{n()},{signal:this.abort.signal});e(".new-draft","click",()=>this.newDraft(m(),"Untitled composition")),e(".remove-draft","click",()=>this.changeRemoval(!1)),e(".undo-removal","click",()=>this.changeRemoval(!0)),e(".confirm-removal","click",()=>this.changeRemoval(!1,!0)),e(".cancel-removal","click",()=>{this.removalError(),this.get(".remove-draft").focus()}),e(".draft-picker select","change",()=>this.chooseDraft(this.get(".draft-picker select").value)),e(".draft-title input","input",()=>{!this.active||this.editor?.isMoving||(this.active={...this.active,name:this.get(".draft-title input").value},this.queue(this.active))}),e(".share","click",()=>this.share()),e(".retry","click",async()=>{if(!this.base&&this.active){await this.retryUnsaved();return}this.blocked=!1,this.get(".recovery").hidden=!0,this.active&&this.queue(this.active),await this.flush()}),e(".fork","click",()=>this.active&&this.newDraft(this.active.copy.model,`${this.active.name||"Untitled"} copy`,!0,this.routeRevision,this.active)),e(".reload-draft","click",()=>this.loadSaved()),e(".edit-copy","click",()=>this.snapshot&&this.newDraft(this.snapshot,"Snapshot copy",!0)),e(".return-drafts","click",()=>this.returnToDrafts()),window.addEventListener("hashchange",()=>{this.route()},{signal:this.abort.signal}),window.addEventListener("storage",t=>{t.key===he&&this.observeStorage()},{signal:this.abort.signal}),window.addEventListener("beforeunload",t=>{(this.pending||this.saving||this.blocked)&&(t.preventDefault(),t.returnValue="")},{signal:this.abort.signal}),this.route()}disconnectedCallback(){this.abort.abort(),this.mounted?.dispose()}get(e){let t=this.root.querySelector(e);if(!t)throw new Error(`Missing workspace control ${e}`);return t}status(e){this.get(".save-status").textContent=e}controls(){let e=!!this.editor?.isMoving;this.editor&&(this.editor.inert=this.transitioning),this.get(".draft-picker select").disabled=e||this.blocked||!!this.saving||this.transitioning||!this.workspace?.drafts.length,this.get(".new-draft").disabled=e||this.blocked||!!this.saving||this.transitioning,this.get(".draft-title input").disabled=e||!this.active||this.transitioning,this.get(".share").disabled=e||!this.active||this.transitioning,this.get(".remove-draft").disabled=!this.base||e||this.blocked||!!this.saving||this.transitioning,this.get(".undo-removal").disabled=!this.removed||e||this.blocked||!!this.saving||this.transitioning,this.get(".confirm-removal").disabled=!this.base||e||this.blocked||!!this.saving||this.transitioning,this.get(".edit-copy").disabled=!this.snapshot||this.blocked||this.transitioning,this.get(".return-drafts").disabled=this.transitioning}problem(e){this.blocked=!0,this.status("Not saved \u2014 your edits are still here."),this.get(".problem").textContent=Re(e),this.get(".recovery").hidden=!1,this.get(".reload-draft").disabled=!this.base,this.get(".reload-draft").textContent=this.base&&!this.workspace?.drafts.some(t=>t.id===this.base.id)?"Close removed draft":"Load saved draft",this.get(".retry").hidden=e instanceof z,this.controls()}list(){let e=this.get(".draft-picker select"),t=[...this.workspace?.drafts??[]];if(this.active&&!t.some(i=>i.id===this.active.id)&&t.push(this.active),e.replaceChildren(...t.map(i=>{let n=document.createElement("option");return n.value=i.id,n.textContent=i.name||"Untitled composition",n})),!this.active&&t.length){let i=document.createElement("option");i.value="",i.textContent="Choose a draft",i.disabled=!0,e.prepend(i)}e.value=this.active?.id??""}open(e,t=!0){this.editorRevision++,this.removalError(),this.active=e,this.base=t?e:void 0,this.pending=void 0,this.blocked=!1,this.get(".recovery").hidden=!0,this.get(".link-result").hidden=!0,this.get(".empty-workspace").hidden=!0,this.get(".draft-title input").value=e.name,this.list();let i=!0,n=document.createElement("axiomatic-playground");n.setAttribute("standalone",""),n.initialState={copy:e.copy,width:e.width},n.addEventListener("composition-change",s=>{if(i||this.editor!==n||!this.active)return;let r=s.detail;this.active={...this.active,copy:r.copy,width:r.width},this.queue(this.active)}),n.addEventListener("composition-interaction",()=>this.controls()),this.editor=n,this.get(".editor-host").replaceChildren(n),i=!1,this.get(".editor-view").hidden=!1,this.get(".snapshot-view").hidden=!0,this.mounted?.dispose(),this.mounted=void 0,this.status(t?"Saved in this browser":"Not saved \u2014 your edits are still here."),this.controls()}emptyWorkspace(){this.editorRevision++,this.removalError(),this.editor=void 0,this.active=void 0,this.base=void 0,this.pending=void 0,this.blocked=!1,this.get(".editor-host").replaceChildren(),this.get(".draft-title input").value="",this.get(".recovery").hidden=!0,this.get(".link-result").hidden=!0,this.get(".empty-workspace").hidden=!1,this.get(".editor-view").hidden=!1,this.get(".snapshot-view").hidden=!0,this.mounted?.dispose(),this.mounted=void 0,this.list(),this.status("No saved drafts"),history.replaceState(null,"",location.pathname),this.controls()}removalError(e){this.get(".removal-error").hidden=!e,this.get(".removal-error").textContent=e?Re(e):"",this.get(".replace-removal").hidden=!(e instanceof ee)}refreshRemoval(){try{this.removed=this.storage.lastRemoval(),this.get(".removal").hidden=!this.removed,this.get(".removal-note").textContent=this.removed?`Removed \u201C${this.removed.draft.name||"Untitled composition"}\u201D. Undo removal is available in this tab until you remove another draft or close the tab.`:"",this.get(".empty-workspace").textContent=this.workspace?.drafts.length&&!this.editor?"Choose a draft above to continue working.":this.removed?"No saved drafts. Create a new draft, or undo your last removal.":"No saved drafts. Create a new draft to begin."}catch(e){this.removed=void 0,this.get(".removal").hidden=!0,this.get(".removal-error").hidden&&this.removalError(e)}this.controls()}openWorkspace(e){this.workspace=e;let t=e.drafts.find(i=>i.id===e.activeId);t?(this.open(t),history.replaceState(null,"",`#draft=${t.id}`)):this.emptyWorkspace(),this.refreshRemoval()}changeRemoval(e,t=!1){if(this.removalChange||this.blocked||this.transitioning||this.editor?.isMoving||(e?!this.removed:!this.base))return;let i=this.performRemoval(e,t);return this.removalChange=i,i.finally(()=>{this.removalChange=void 0}),i}async performRemoval(e,t){let i=this.routeRevision;this.transitioning=!0,this.controls(),this.removalError();let n=!1,s=!1;try{if(await this.flush(),this.blocked||i!==this.routeRevision)return;let r=e?await this.storage.undoRemoval():await this.storage.remove(this.base,t);if(i!==this.routeRevision){this.workspace=r,this.editorRevision++,this.editor=void 0,this.active=void 0,this.base=void 0,this.pending=void 0,this.blocked=!1,this.get(".editor-host").replaceChildren();return}this.openWorkspace(r),e&&this.status("Draft restored. Saved in this browser."),n=!0}catch(r){if(i!==this.routeRevision)return;s=!0,r instanceof z||this.removalError(r),this.observeStorage(),this.refreshRemoval()}finally{this.transitioning=!1,this.controls(),n&&i===this.routeRevision?this.get(e?".draft-title input":".undo-removal").focus():s&&i===this.routeRevision&&this.get(this.get(".replace-removal").hidden?this.blocked?".fork":e?".undo-removal":".remove-draft":".cancel-removal").focus()}}queue(e){JSON.stringify(e)===JSON.stringify(this.base)&&!this.pending||(this.pending=e,!(this.blocked||this.saving)&&(this.status("Saving\u2026"),this.saving=this.drain().finally(()=>{this.saving=void 0,this.controls(),this.blocked||this.observeStorage(),this.pending&&!this.blocked&&this.queue(this.pending)}),this.controls()))}async drain(){let e=this.editorRevision;for(;this.pending&&!this.blocked;){let t=this.pending;this.pending=void 0;try{let i=await this.storage.save(t,this.base);if(e!==this.editorRevision)return;this.workspace=i,this.base=i.drafts.find(n=>n.id===t.id),this.list(),this.pending||this.status("Saved in this browser")}catch(i){if(e!==this.editorRevision)return;this.pending??=t,this.problem(i)}}}async flush(){this.editor?.finishEditing(),await this.saving}async retryUnsaved(){if(!this.active||this.transitioning)return;let e=this.active;this.transitioning=!0,this.controls();try{this.workspace=await this.storage.create(e.copy.model,e.name,e);let t=this.workspace.drafts.find(i=>i.id===this.workspace.activeId);this.open(t),history.replaceState(null,"",`#draft=${t.id}`)}catch(t){this.problem(t)}finally{this.transitioning=!1,this.controls()}}async newDraft(e,t,i=!1,n=this.routeRevision,s){if(this.blocked&&this.editor&&e!==this.active?.copy.model){this.showSnapshot(e,"Your current draft has unsaved changes. Return to your drafts to save them before editing this copy.");return}if(!(this.transitioning||this.editor?.isMoving||this.blocked&&!i)){this.transitioning=!0,this.controls();try{if(await this.flush(),n!==this.routeRevision||this.blocked&&!i)return;if(this.blocked&&this.editor&&e!==this.active?.copy.model){this.showSnapshot(e,"Your current draft has unsaved changes. Return to your drafts to save them before editing this copy.");return}let r=await this.storage.create(e,t.slice(0,80),s);if(n!==this.routeRevision)return;this.workspace=r;let a=this.workspace.drafts.find(d=>d.id===this.workspace.activeId);this.open(a),history.replaceState(null,"",`#draft=${a.id}`),this.get(".draft-title input").focus()}catch(r){if(n!==this.routeRevision)return;(!this.editor||i&&!this.blocked)&&this.open({id:crypto.randomUUID(),name:t,copy:{...U(e),chosen:["0"]},width:600},!1),this.problem(r)}finally{this.transitioning=!1,this.controls()}}}async chooseDraft(e,t=!1){if(this.transitioning||this.editor?.isMoving)return;let i=this.routeRevision;this.transitioning=!0,this.controls();try{if(t)await this.saving;else if(await this.flush(),this.blocked)return;if(i!==this.routeRevision)return;let n=await this.storage.activate(e);if(i!==this.routeRevision)return;this.workspace=n;let s=n.drafts.find(r=>r.id===e);this.open(s),history.replaceState(null,"",`#draft=${e}`)}catch(n){this.problem(n)}finally{this.transitioning=!1,this.controls()}}async loadSaved(){if(!this.base||this.transitioning||this.editor?.isMoving)return;let e=this.routeRevision,t=this.base;try{if(await this.saving,e!==this.routeRevision)return;let i=this.storage.read();i?.drafts.some(n=>n.id===t.id)?await this.chooseDraft(t.id,!0):(this.openWorkspace(i??{version:1,activeId:null,drafts:[]}),this.get(this.active?".draft-title input":".new-draft").focus())}catch(i){this.problem(i)}}observeStorage(){try{let e=this.storage.read();if(this.workspace=e,this.base&&!this.saving){let t=e?.drafts.find(i=>i.id===this.base.id);if(JSON.stringify(t)!==JSON.stringify(this.base)){this.problem(new z(t?"This draft changed in another tab. Keep your edits as a new draft, or load the saved version.":"This draft was removed in another tab. Save your work as a new draft, or close this editor to return to saved drafts."));return}}this.workspace=e,this.list(),!this.editor&&!this.get(".editor-view").hidden&&e?.drafts.length&&this.status("Choose a saved draft, or create a new one."),this.refreshRemoval()}catch(e){this.editor&&this.problem(e)}}async route(){let e=++this.routeRevision,t=location.hash.slice(1);if(await this.removalChange,e===this.routeRevision&&(this.removalError(),this.refreshRemoval(),this.editor?.prepareToLeave(),await this.flush(),e===this.routeRevision)){if(t.startsWith("snapshot=")||t.startsWith("edit=")){try{let i=Nt(t.slice(t.indexOf("=")+1));t.startsWith("edit=")?await this.newDraft(i,"From the guide",!0,e):this.showSnapshot(i)}catch(i){this.showSnapshot(void 0,Re(i))}return}if(this.editor&&!t.startsWith("draft=")){this.observeStorage(),this.active&&this.base&&history.replaceState(null,"",`#draft=${this.active.id}`),this.get(".editor-view").hidden=!1,this.get(".snapshot-view").hidden=!0,this.mounted?.dispose(),this.mounted=void 0;return}if(this.editor&&this.blocked){this.get(".editor-view").hidden=!1,this.get(".snapshot-view").hidden=!0;return}try{this.workspace=this.storage.read();let i=t.startsWith("draft=")?t.slice(6):this.workspace?.activeId,n=this.workspace?.drafts.find(s=>s.id===i);n?(this.open(n),history.replaceState(null,"",`#draft=${n.id}`)):this.workspace?.drafts.length?this.openWorkspace(this.workspace):this.workspace?this.emptyWorkspace():await this.newDraft(m(),"Untitled composition")}catch(i){this.open({id:crypto.randomUUID(),name:"Untitled composition",copy:{...U(m()),chosen:["0"]},width:600},!1),this.problem(i)}}}showSnapshot(e,t){this.snapshot=e,this.get(".editor-view").hidden=!0,this.get(".snapshot-view").hidden=!1,this.get(".snapshot-error").hidden=!t,this.get(".snapshot-error").textContent=t??"",this.get(".edit-copy").disabled=!e||this.blocked,this.get(".snapshot-source").hidden=!e,this.get(".snapshot-surface").hidden=!e,this.mounted?.dispose(),this.mounted=void 0,this.get(".snapshot-surface").replaceChildren(),e&&(this.mounted=_(this.get(".snapshot-surface"),e),this.get(".snapshot-source pre").textContent=I(e).map(i=>i.tokens.map(n=>n.text).join("")).join(`
`))}async returnToDrafts(){history.replaceState(null,"",location.pathname),await this.route()}async share(){if(!this.editor||this.editor.isMoving)return;let e=this.editor.finishEditing();if(e)try{let t=Le("snapshot",Me(e.copy.model)).href,i=this.get(".snapshot-link");i.value=t,i.parentElement.hidden=!1,this.get(".link-result").hidden=!1,this.get(".local-note").textContent=["localhost","127.0.0.1","[::1]"].includes(location.hostname)?"This link works on this computer while the local server is running. Sharing across devices will be available after hosting.":"This is a fixed copy. Later edits to your draft leave this link unchanged.";try{await navigator.clipboard.writeText(t),this.get(".link-message").textContent="Snapshot link copied."}catch{this.get(".link-message").textContent="Copy this link to share the snapshot.",i.focus(),i.select()}}catch(t){this.get(".link-result").hidden=!1,this.get(".link-message").textContent=Re(t),this.get(".snapshot-link").value="",this.get(".snapshot-link").parentElement.hidden=!0,this.get(".local-note").textContent=""}}};customElements.get("axiomatic-workspace")||customElements.define("axiomatic-workspace",et);var ie=600,tt=!1;try{let o=Number(sessionStorage.getItem("axiomatic-example-width"));o>=160&&o<=720&&(ie=o)}catch{}var te=new Set,it='<span class="author-status" role="status" aria-live="polite"></span>',nt='<span class="history"><button class="undo-action" type="button" hidden>Undo</button><button class="reset-action" type="button" hidden>Start over</button></span>',ni=`<div class="arrangement" role="radiogroup" aria-labelledby="arrangement-label"><span class="arrangement-label" id="arrangement-label"></span><span class="arrangement-options">${T.map(o=>`<label><input type="radio" name="arrangement" value="${o}">${o}</label>`).join("")}</span></div>`,oi='<button class="group-action" type="button">Group</button><button class="ungroup-action" type="button" hidden>Ungroup</button>',Hi={grouping:`<div class="authoring" role="group" aria-label="Edit grouping">${it}${oi}${nt}</div>`,arrangement:`<div class="authoring" role="group" aria-label="Edit arrangement">${ni}${it}${nt}</div>`,composition:`<div class="authoring combined" role="group" aria-label="Edit composition">${ni}<div class="composition-actions">${oi}<button class="clear-action" type="button" hidden>Clear selection</button></div>${it}${nt}</div>`};function Ri(){try{sessionStorage.setItem("axiomatic-example-width",String(ie))}catch{}}function Di(o,e=!0){ie=o,e&&Ri();for(let t of te)t.receiveWidth(o)}var ot=class extends HTMLElement{root=this.attachShadow({mode:"open"});name="flat";model=E("flat");exercise;editing;chosen=[];undo=[];width=ie;linked=!0;structure=!1;selected;pinned;sourceColumns=80;characterWidth=7.2;sourceInlineSize=0;mounted;modes=new Map;modeObserver=new MutationObserver(()=>this.refreshModes());observer;sourceObservation;readouts;frame;viewport;input;handle;code;inspected;captionObserver=new ResizeObserver(()=>this.refreshCaption());abort;widthControl;connectedCallback(){let e=this.getAttribute("example"),t=be.find(r=>r===e);if(!t)throw new Error(`Unknown example ${e}`);this.name=t,this.model=E(this.name),this.exercise=this.getAttribute("exercise")||void 0;let i=this.getAttribute("edits")??"grouping";if(i!=="grouping"&&i!=="arrangement"&&i!=="composition")throw new Error(`Unknown edits ${i}`);if(!this.exercise&&this.hasAttribute("edits"))throw new Error("An example with edits needs an exercise name");if(this.editing=this.exercise?i:void 0,this.exercise){let r=this.editing==="arrangement"?gt:this.editing==="composition"?bt:mt,a=this.model;try{let d=JSON.parse(sessionStorage.getItem(`axiomatic-exercise:v1:${this.exercise}`)||"null");this.model=r(d?.model,a)??a,this.undo=Array.isArray(d?.undo)?d.undo.slice(-25).map(c=>{let l=c&&typeof c=="object"&&"model"in c?c:{model:c,chosen:[]},h=r(l.model,a);return h?{model:h,chosen:se("chosen"in l?l.chosen:[],h)}:void 0}).filter(c=>!!c):[],this.editing==="composition"&&(this.chosen=[...se(d?.chosen,this.model)])}catch{}}if(this.editing==="arrangement"&&"children"in this.model){let r=this.model.children.findIndex(a=>"children"in a);this.chosen=[r<0?"0":`0.${r}`]}this.abort=new AbortController;let n=this.abort.signal;if(this.root.innerHTML=`<style>${pe}${J}${we}${ue}</style><div class="stage"><div class="viewport"><div class="bar"><button class="structure" type="button" aria-pressed="false">Show structure</button><div class="tools"><button class="link" type="button" aria-pressed="true" title="Resize linked examples together">Linked</button><label class="width"><span class="sr-only">Example width</span><input type="number" min="${160}" max="${720}" step="1"><span aria-hidden="true">px</span></label></div></div><div class="frame"><div class="rendered"></div><div class="resize" aria-hidden="true" title="Drag to resize. Edit the width field for keyboard control."></div></div></div></div><div class="caption"><span class="selection"></span><span class="note"></span></div>${this.name==="switcher"?'<label class="edit">Second item label<input value="Run lasted 4m 1s" maxlength="90"></label>':""}${this.editing?Hi[this.editing]:""}<pre aria-label="Composition"><code></code></pre>`,this.frame=this.get(".frame"),this.viewport=this.get(".viewport"),this.input=this.get(".width input"),this.handle=this.get(".resize"),this.code=this.get("code"),this.readouts=new K(this.get(".stage"),this.viewport,this.input,this.get(".note"),()=>[...this.modes.values()]),this.editing){this.root.host.classList.add("editable");for(let[r,a]of[[".undo-action",()=>this.undoEdit()],[".reset-action",()=>this.startOver()]]){let d=this.get(r);d.addEventListener("click",()=>{let c=this.root.activeElement===d;a(),this.editing!=="grouping"&&c&&(d.hidden||d instanceof HTMLButtonElement&&d.disabled)&&this.focusArrangement()},{signal:n})}}(this.editing==="arrangement"||this.editing==="composition")&&this.get(".arrangement").addEventListener("change",r=>{let a=q(this.model,this.chosen),d=r.target.value;if(!a||!k(d))return;let c=ye(this.model,a.path,d);c!==this.model&&this.commit(c,{chosen:[a.path]})},{signal:n}),this.editing==="composition"&&this.get(".clear-action").addEventListener("click",()=>{let r=this.chosen[0]??"0";this.chosen=[],this.select(void 0),this.updateAuthoring("Selection cleared. Choose a member or a group."),this.code.querySelector(`.code-name[data-path="${r}"]`)?.focus({preventScroll:!0})},{signal:n}),(this.editing==="grouping"||this.editing==="composition")&&(this.get(".group-action").addEventListener("click",()=>{if(O(this.model,this.chosen))return;let r=[...this.chosen],a=Math.min(...r.map(c=>Number(c.split(".").at(-1)))),d=`${f(r[0])}.${a}`;this.commit(ut(this.model,r),{message:"Grouped. Neighbors outside this group remain separate members.",focus:d,chosen:[d]})},{signal:n}),this.get(".ungroup-action").addEventListener("click",()=>{let r=this.chosen[0];if(!r||!this.canUngroup())return;let a=p(this.model,r);if(!("children"in a))return;let d=Number(r.split(".").at(-1));this.commit(xe(this.model,r),{message:"Ungrouped. The members keep their reading order.",focus:r,chosen:a.children.map((c,l)=>`${f(r)}.${d+l}`)})},{signal:n})),this.get(".link").addEventListener("click",()=>{this.linked=!this.linked,this.get(".link").setAttribute("aria-pressed",String(this.linked)),this.get(".link").textContent=this.linked?"Linked":"Independent",this.linked?(te.add(this),this.receiveWidth(ie),this.setStructure(tt)):te.delete(this)},{signal:n}),this.get(".structure").addEventListener("click",()=>{let r=!this.structure;if(this.linked){tt=r;for(let a of te)a.setStructure(r)}else this.setStructure(r)},{signal:n}),this.widthControl=me({handle:this.handle,viewport:this.viewport,input:this.input,limit:()=>this.limit(),request:(r,a,d)=>this.setWidth(r,a,d),restore:()=>this.readouts?.refreshWidth(),signal:n}),this.root.querySelector(".edit input")?.addEventListener("input",r=>{this.model=E(this.name,r.target.value),this.render()},{signal:n}),this.frame.addEventListener("pointermove",r=>{if(this.widthControl?.dragging||!this.structure||!(r.target instanceof Element))return;let a=r.target.closest(".node,.leaf");a?.dataset.path&&this.select(a.dataset.path)},{signal:n}),this.code.addEventListener("pointerover",r=>{if(this.structure&&r.target instanceof Element){let a=r.target.closest("[data-path]")?.dataset.path;a&&this.select(a)}},{signal:n}),this.code.addEventListener("focusin",r=>{this.structure&&r.target instanceof HTMLElement&&r.target.dataset.path&&this.select(r.target.dataset.path),r.target instanceof HTMLElement&&r.target.classList.contains("code-name")&&this.rove(r.target.dataset.path)},{signal:n}),this.code.addEventListener("click",r=>{if(r.target instanceof Element){let a=r.target.closest("[data-path]")?.dataset.path;if(a&&this.exercise){this.choose(a);return}a&&(this.setStructure(!0),this.pinned=a,this.select(a))}},{signal:n}),this.frame.addEventListener("click",r=>{if((this.structure||this.exercise)&&r.target instanceof Element){let a=r.target.closest(".node,.leaf")?.dataset.path;if(a&&this.exercise){this.choose(a);return}a&&(this.pinned=a,this.select(a))}},{signal:n}),this.frame.addEventListener("pointerleave",()=>this.select(this.inspectionFallback()),{signal:n}),this.code.addEventListener("pointerleave",()=>this.select(this.inspectionFallback()),{signal:n}),this.code.addEventListener("focusout",r=>{(!(r.relatedTarget instanceof Node)||!this.code.contains(r.relatedTarget))&&this.select(this.inspectionFallback())},{signal:n}),this.root.addEventListener("keydown",r=>{let a=r;if(a.key==="Escape"&&(this.pinned=void 0,this.select(void 0),this.editing)){let d=this.root.activeElement?.closest(this.editing==="composition"?".authoring":".arrangement")!=null;this.chosen=[],this.updateAuthoring(this.editing==="grouping"?"Selection cleared.":void 0),d&&this.focusArrangement()}if((this.structure||this.exercise)&&(a.key==="ArrowUp"||a.key==="ArrowDown")&&r.target instanceof HTMLElement&&r.target.classList.contains("code-name")){let d=[...this.code.querySelectorAll(".code-name")],c=d.indexOf(r.target),l=d[c+(a.key==="ArrowDown"?1:-1)];a.preventDefault(),l&&l.focus()}},{signal:n}),this.sourceObservation=L(this.get("pre")),this.observer=new ResizeObserver(r=>{for(let a of r)a.target===this.sourceObservation?.target&&(this.sourceInlineSize=a.contentBoxSize[0].inlineSize,this.fitSource())}),this.observer.observe(this.sourceObservation.target),this.modeObserver.observe(this.get(".rendered"),{attributes:!0,subtree:!0,attributeFilter:[Y]}),this.linked&&(te.add(this),this.width=ie,this.structure=tt),this.render(),this.setStructure(this.structure);let s=()=>{if(n.aborted)return;let r=document.createElement("canvas").getContext("2d");r&&(r.font=getComputedStyle(this.get("pre")).font,this.characterWidth=r.measureText("0").width||7.2),this.fitSource()};document.fonts.addEventListener("loadingdone",s,{signal:n}),document.fonts.ready.then(s)}disconnectedCallback(){this.abort?.abort(),this.observer?.disconnect(),this.sourceObservation?.dispose(),this.readouts?.disconnect(),this.modeObserver.disconnect(),this.mounted?.dispose(),this.mounted=void 0,this.captionObserver.disconnect(),this.inspected=void 0,te.delete(this),this.widthControl?.cancel(),this.widthControl=void 0}get(e){let t=this.root.querySelector(e);if(!t)throw new Error(`Missing ${e}`);return t}snapshot(){return this.model}receiveWidth(e){this.width=e,this.viewport.style.inlineSize=`${e}px`}limit(){return this.readouts?.maximum??720}setWidth(e,t=!0,i=this.limit()){if(!Number.isFinite(e)){this.readouts?.refreshWidth();return}this.width=A(e,i),this.linked?Di(this.width,t):this.receiveWidth(this.width)}render(){let e=this.get(".rendered");this.mounted?this.mounted.update(this.model):this.mounted=_(e,this.model),fe(e),this.renderCode(),this.refreshModes(),this.readouts?.observeComposition(e),this.exercise?this.updateAuthoring():this.updateInspection(),this.receiveWidth(this.width)}fitSource(){if(!this.sourceInlineSize)return;let e=Math.max(16,Math.min(80,Math.floor(this.sourceInlineSize/this.characterWidth)));if(e===this.sourceColumns)return;this.sourceColumns=e;let t=this.root.activeElement,i=t instanceof HTMLElement&&t.classList.contains("code-name")?t.dataset.path:void 0;this.renderCode(),this.exercise&&this.updateAuthoring(),i&&(this.rove(i),this.code.querySelector(`.code-name[data-path="${i}"]`)?.focus({preventScroll:!0}))}renderCode(){let e=I(this.model,"0",0,this.sourceColumns),t=document.createDocumentFragment();for(let i of e){let n=document.createElement("span");n.className="code-line",n.style.setProperty("--continuation",`${(i.depth+1)*2}ch`),i.path&&(n.dataset.path=i.path);for(let s of i.tokens){let r=document.createElement(s.kind?"button":"span");if(r.className=`token ${s.tone??"plain"}${s.kind?" code-name":""}`,r.textContent=s.text,s.path&&(r.dataset.path=s.path),s.kind){r.setAttribute("type","button");let a=p(this.model,s.path);r.setAttribute("aria-label",a&&!("children"in a)?`${this.exercise?"Select":"Inspect"} ${a.kind}: ${a.text}`:`${this.exercise?"Select":"Inspect"} ${s.kind} group`),r.tabIndex=this.structure||this.exercise?0:-1}n.append(r)}t.append(n)}this.code.replaceChildren(t),this.exercise&&this.rove("0"),oe(this.code,this.structure,this.selected),this.refreshAccessibleNames()}canUngroup(){let e=this.chosen.length===1?p(this.model,this.chosen[0]):void 0;return!!e&&"children"in e&&this.chosen[0]!=="0"}inspectionFallback(){return this.exercise?this.chosen.length===1?this.chosen[0]:void 0:this.pinned}rove(e){for(let t of this.code.querySelectorAll(".code-name"))t.tabIndex=t.dataset.path===e?0:-1}choose(e){if(!p(this.model,e))return;let t;if(this.editing==="composition")this.chosen=[...V(this.model,this.chosen,e)];else if(this.editing==="arrangement")this.chosen=[e];else if(e==="0")this.chosen=[],t="This Stack holds the whole example. Choose members inside it to make a group.";else if(this.chosen.includes(e))this.chosen=this.chosen.filter(i=>i!==e),this.chosen.length>1&&!w(this.model,this.chosen)&&(this.chosen=[this.chosen[0]]);else{let i=[...this.chosen,e];this.chosen.length&&!w(this.model,i)?(this.chosen=[e],t="Only neighbors can be grouped here. Order stays as written."):this.chosen=i}this.rove(e),this.select(this.inspectionFallback()),this.updateAuthoring(t)}updateGrouping(){let e=O(this.model,this.chosen),t=this.get(".group-action");return t.hidden=!!e,t.textContent=`Group ${this.chosen.length} members`,this.get(".ungroup-action").hidden=!this.canUngroup(),this.canUngroup()?"Add a neighbor to compose a larger group.":this.chosen.length===1?"1 member selected. Select a neighbor to group them.":this.chosen.length>=2?e||`${this.chosen.length} members selected. Ready to group.`:"Choose two neighboring facts."}updateArrangement(){let e=q(this.model,this.chosen),t=this.get(".arrangement");t.setAttribute("aria-disabled",String(!e));let i=e?.group.children.length;this.get(".arrangement-label").textContent=e?i===1?"Arrange this member as":`Arrange these ${i} members as`:"Arrange a group as";for(let r of t.querySelectorAll("input"))r.disabled=!e,r.checked=r.value===e?.group.kind;if(e)return re[e.group.kind];let[n]=this.chosen,s=n===void 0?void 0:p(this.model,n);return s?`${s.kind} is content, with no members to arrange. Select a group's name in the code.`:"Select a group's name in the code to arrange its members."}focusArrangement(){(this.root.querySelector(".arrangement input:checked")??this.code.querySelector('.code-name[tabindex="0"]'))?.focus({preventScroll:!0})}updateAuthoring(e){let t;if(this.editing==="composition"){let r=this.updateArrangement(),a=P(this.model,this.chosen),d=this.get(".group-action");d.hidden=!1,d.disabled=a.selected!=="members"||!a.canGroup,d.textContent="Group";let c=this.get(".ungroup-action");c.hidden=!1,c.disabled=a.selected!=="group"||!a.canUngroup;let l=this.get(".clear-action");switch(l.hidden=!1,l.disabled=!this.chosen.length,a.selected){case"group":t=r;break;case"members":t=a.canGroup?`${this.chosen.length} members selected. Group them, or select one again to leave it out.`:"These are all the members of one group. Select that group's name to arrange it.";break;case"content":t="1 member selected. Select a neighbor to group them.";break;case"nothing":t="Select neighboring facts to group them, or a group's name to arrange it."}}else t=this.editing==="arrangement"?this.updateArrangement():this.updateGrouping();let i=this.get(".undo-action"),n=this.get(".reset-action"),s=JSON.stringify(this.model)===JSON.stringify(E(this.name));i.hidden=this.editing!=="composition"&&!this.undo.length,n.hidden=this.editing!=="composition"&&s,i.disabled=!this.undo.length,n.disabled=s,this.get(".author-status").textContent=e??t;for(let r of this.frame.querySelectorAll(".node,.leaf")){let a=this.chosen.includes(r.dataset.path);r.dataset.chosen=String(a)}for(let r of this.code.querySelectorAll("[data-path]")){let a=r.dataset.path;r.dataset.chosen=String(this.chosen.some(d=>a===d||a.startsWith(`${d}.`))),r.classList.contains("code-name")&&r.setAttribute("aria-pressed",String(this.chosen.includes(a)))}this.updateInspection()}undoEdit(){let e=this.undo.pop();if(!e)return;let t=e.model;if(this.editing==="composition"){this.applyEdit(t,{message:"Undid the last change. Restored its selection.",chosen:e.chosen});return}if(this.editing!=="arrangement"){this.applyEdit(t,{message:"Undid the last change.",focus:"0"});return}let i=ft(this.model,t),n=i.length===1?q(t,i):void 0;this.applyEdit(t,{message:n?`Undid the last change. This group is a ${n.group.kind} again.`:"Undid the last change.",chosen:n?[n.path]:this.chosen})}startOver(){this.editing==="composition"?this.commit(E(this.name),{message:"Returned to one sequence. Undo restores your composition.",chosen:[]}):this.editing==="arrangement"?this.commit(E(this.name),{message:"Returned to the starting arrangement. Undo restores your choices.",chosen:this.chosen}):this.commit(E(this.name),{message:"Returned to one sequence. Undo can restore your grouping.",focus:"0"})}commit(e,t){this.undo=[...this.undo.slice(-24),{model:this.model,chosen:[...this.chosen]}],this.applyEdit(e,t)}applyEdit(e,{message:t,chosen:i=[],focus:n}){this.model=e,this.chosen=[...i],this.pinned=void 0,this.selected=void 0,this.render(),this.selected=this.inspectionFallback(),this.rove(n??this.chosen[0]??"0"),this.updateAuthoring(t);try{sessionStorage.setItem(`axiomatic-exercise:v1:${this.exercise}`,JSON.stringify({model:this.model,undo:this.undo,chosen:this.chosen}))}catch{}n&&this.code.querySelector(`.code-name[data-path="${n}"]`)?.focus({preventScroll:!0})}setStructure(e){this.structure=e,this.get(".structure").setAttribute("aria-pressed",String(e)),this.get(".structure").textContent=e?"Hide structure":"Show structure",this.code.classList.toggle("inspecting",e),e||(this.selected=void 0,this.pinned=void 0);for(let t of this.code.querySelectorAll(".code-name"))t.tabIndex=e||this.exercise?0:-1;this.exercise&&(this.rove(this.chosen[0]??"0"),this.selected=this.inspectionFallback()),this.updateInspection()}select(e){this.selected!==e&&(this.selected=e,this.updateInspection())}refreshModes(){this.modes.clear();for(let e of this.get(".rendered").querySelectorAll('[data-kind="Switcher"]'))this.modes.set(e.dataset.path,getComputedStyle(e).flexDirection);this.readouts?.refreshModes(),this.refreshAccessibleNames(),this.refreshCaption()}refreshAccessibleNames(){if(this.editing!=="grouping")for(let e of this.code.querySelectorAll(".code-name")){let t=e.dataset.path,i=p(this.model,t);if(!i||!("children"in i))continue;let n=i.kind==="Stack"?"column":i.kind==="Shelf"?"row":this.modes.get(t)??"column",s=`${this.editing?"Select":"Inspect"} ${i.kind}, ${De(i.kind,n==="row")}, ${i.children.length} members`;e.getAttribute("aria-label")!==s&&e.setAttribute("aria-label",s)}}updateInspection(){oe(this.code,this.structure,this.selected);let e=ge(this.get(".rendered"),{structure:this.structure,selected:this.structure||this.chosen.length?this.selected:void 0,preview:this.editing==="grouping"&&!O(this.model,this.chosen)?this.chosen:[]});if(e!==this.inspected&&(this.captionObserver.disconnect(),this.inspected=e,e))for(let t of[...e.querySelectorAll(':scope > [data-decoration="gap"] [data-observation="gap"]')].slice(0,2))this.captionObserver.observe(t);this.refreshCaption()}refreshCaption(){let e=this.get(".selection"),t=ve(this.inspected);e.textContent!==t&&(e.textContent=t)}};customElements.get("axiomatic-example")||customElements.define("axiomatic-example",ot);document.querySelector('meta[name="reader-sources"]')?.getAttribute("content")!=="fixed"&&document.addEventListener("reader-sources-changed",()=>{fetch(import.meta.url,{cache:"no-store"}).then(o=>o.ok?o.text():"").then(o=>{let e=o.match(/axiomatic-revision:([a-f0-9]+)/)?.[1];e&&`axiomatic-revision:${e}`!==rt&&location.reload()}).catch(()=>{})});
