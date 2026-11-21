import { compose, relatedRuns, describe, facts, flowRole } from './composition.js';
const $ = selector => document.querySelector(selector);
const controls = $('#controls');
const tags = { Aside:'section', Group:'div', Headline:'h4', Title:'p', Label:'p', Summary:'p', Account:'p', Text:'span', Status:'p', Fact:'p', Destinations:'div', Action:'a', Links:'nav', Link:'a', Wrapper:'div', Related:'section' };

function render(node) {
  const element = document.createElement(tags[node.role]);
  element.dataset.role = node.role;
  element.dataset.flowRole = flowRole(node);
  if (node.state) element.dataset.state = node.state;
  if (node.role === 'Status') {
    const mark = document.createElement('span');
    mark.className = 'state-mark'; mark.setAttribute('aria-hidden', 'true');
    mark.textContent = node.state === 'complete' ? '✓ ' : '◷ ';
    element.append(mark);
  }
  if (node.attention) element.dataset.attention = node.attention;
  if (node.destination) { element.href = `#${node.destination}`; element.dataset.destination = node.destination; }
  if (node.role === 'Aside') {
    const label = document.createElement('h3'); label.className = 'aside-label'; label.textContent = node.label; element.append(label);
    element.setAttribute('aria-label', node.label);
  } else if (node.role === 'Fact') {
    const label = document.createElement('span'); label.textContent = `${node.label} `; element.append(label);
  }
  if (node.text) element.append(document.createTextNode(node.text));
  if (node.role === 'Action') { const arrow = document.createElement('span'); arrow.textContent = ' →'; arrow.setAttribute('aria-hidden','true'); element.append(arrow); }
  for (const [index, child] of (node.children || []).entries()) {
    if (node.role === 'Account' && index) element.append(' ');
    element.append(render(child));
  }
  return element;
}

const run = `<header class="run-header"><p class="run-breadcrumb">Automation / Anomaly alerts</p><h2>Investigate anomaly alerts <span>run</span></h2><p class="run-meta"><span class="complete">Completed</span><span>Nov 18, 10:30 AM</span><span>4m 1s</span></p></header><div class="run-layout"><section class="execution" aria-labelledby="execution-title"><h3 id="execution-title">Execution</h3><p class="muted execution-note">Recorded during this run</p><div class="step"><p><span class="complete-mark" aria-hidden="true">✓</span><strong>Investigate the anomaly</strong><span class="duration">4m 0s</span></p><p class="code">vercelAgent</p></div><details class="run-detail"><summary>Script result <span>empty</span></summary><p>The call completed without a returned script value.</p></details><details class="run-detail"><summary>Run record and journal agree <span>completed</span></summary><p>Both recorded the run as complete.</p></details><div class="run-settings"><h3>What this run used</h3><details class="run-detail"><summary>Trigger and input <span>Event</span></summary><p>An anomaly alert event triggered this run.</p></details><details class="run-detail"><summary>Configuration <span>At start</span></summary><p>This specimen shows the recorded run beside the current investigation.</p></details></div></section><div class="context-slot"></div></div>`;
$('#product').innerHTML = run;

function state() {
  const data = new FormData(controls);
  return Object.fromEntries(['presentation', 'placement', 'density', 'situation', 'width'].map(key => [key, data.get(key)]).concat([['wrapper',data.has('wrapper')], ['neighbor',data.has('neighbor')]]));
}
function update() {
  const current = state();
  const tree = compose(current);
  $('#frame').style.width = `${current.width}px`;
  $('#product').dataset.placement = current.placement;
  $('#product').dataset.density = current.density;
  const slot = $('.context-slot');
  slot.replaceChildren(render(tree), ...(current.neighbor ? [render(relatedRuns())] : []));
  $('#source').textContent = `${describe(tree)}${current.neighbor ? `\n\n${describe(relatedRuns())}` : ''}`;
  $('#author-description').textContent = current.presentation === 'editorial'
    ? 'Compose a finding, an account, its dated fact, and destinations. The words name the objects; the layout carries their reading order.'
    : 'Compose an investigation group, a remediation group, and destinations. Placement identifies each status and the update time; the labels can be shorter.';
  if (current.situation === 'missing') $('#author-description').textContent = 'The missing state has no finding, Plan, or update time. Its label becomes the landmark; useful destinations remain.';
  if (current.wrapper) $('#author-description').textContent += ' The real wrapper forwards the destination role to the parent policy.';
  const params = new URLSearchParams();
  for (const [key,value] of Object.entries(current)) params.set(key,String(value));
  history.replaceState(null,'',`?${params}`);
  measure();
}
function measure() {
  const actual = Math.round($('#frame').getBoundingClientRect().width);
  const requested = Number($('#width').value);
  $('#width-value').textContent = `${actual} px${actual < requested ? ' · fits this window' : ''}`;
  const columns = getComputedStyle($('.run-layout')).gridTemplateColumns.split(' ').length;
  $('#arrangement-note').textContent = columns > 1 ? 'Investigation beside execution' : 'Investigation follows execution';
}
const params = new URLSearchParams(location.search);
for (const key of ['presentation','placement','density','situation']) {
  const field = controls.elements.namedItem(key); const value = params.get(key);
  if (value && [...controls.querySelectorAll(`[name="${key}"] option, input[name="${key}"]`)].some(option=>option.value===value)) field.value = value;
}
if (params.has('width') && Number.isFinite(Number(params.get('width')))) $('#width').value = Math.max(360,Math.min(1120,Number(params.get('width'))));
for (const key of ['wrapper','neighbor']) controls.elements.namedItem(key).checked = params.get(key)==='true';
controls.addEventListener('input', update);
controls.addEventListener('submit', event => event.preventDefault());
$('#reset-study').addEventListener('click',()=>{ controls.reset(); update(); });
new ResizeObserver(measure).observe($('#frame'));
const context = {
  session: ['Investigation session', `Finding: ${facts.finding}. Investigation completed. Investigation updated ${facts.updated}.`],
  runs: ['Other runs', 'Earlier completed runs for this alert group: Nov 18, 9:12 AM and Nov 18, 8:46 AM.'],
  alert: ['Alert in Vercel', 'This is the alert group that the run investigated. The current investigation is independent of the recorded run.'],
  'earlier-run': ['Earlier run', 'A completed earlier run for this alert group. Its result does not establish the current remediation state.'],
};
$('#product').addEventListener('click',event=>{
  const link=event.target.closest('[data-destination]'); if(!link) return;
  event.preventDefault(); const [title,body] = context[link.dataset.destination];
  $('#destination-title').textContent=title; $('#destination-body').textContent=body; $('#destination').showModal();
});
$('#return').addEventListener('click',()=>$('#destination').close());
update();
