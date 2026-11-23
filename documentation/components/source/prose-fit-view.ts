/** Both trials share a width and two native members. The bounded paragraph
 * and its ruler share the 30ch measure defined in prose-fit.css. */
export const proseFitView = `
<div id="stage">
  <div id="width-probe"></div>
  <div id="viewport">
    <div class="bar">
      <label class="wording">Wording
        <select id="wording">
          <option value="short">Short</option>
          <option value="original" selected>Original</option>
          <option value="long">Long</option>
        </select>
      </label>
      <label class="width">
        <span class="sr-only">Example width in pixels</span>
        <input id="width" type="number" inputmode="numeric" min="160" max="720" step="1">
        <span aria-hidden="true">px</span>
      </label>
    </div>
    <div class="frame">
      <div class="panel" role="group" aria-labelledby="unbroken-choice">
        <p class="choice" id="unbroken-choice">Beside the link, keep the summary <b>on one line</b></p>
        <div class="pair" data-policy="unbroken">
          <p class="summary"></p>
          <a href="https://axioms.design/#session">Open investigation session</a>
        </div>
      </div>
      <div class="panel" role="group" aria-labelledby="bounded-choice">
        <p class="choice" id="bounded-choice">Beside the link, let the summary wrap <b>within <abbr title="30 times the width of the digit 0 in this font">30ch</abbr></b></p>
        <div class="measure" aria-hidden="true"><span></span></div>
        <div class="pair" data-policy="bounded">
          <p class="summary"></p>
          <a href="https://axioms.design/#session">Open investigation session</a>
        </div>
      </div>
      <div id="grip" role="slider" tabindex="0" aria-label="Example width" aria-orientation="horizontal" aria-controls="viewport" title="Drag or use the arrow keys to change the width"></div>
    </div>
  </div>
</div>
`;
