// An executable sketch of presentation roles, not the proposed library API.
export const facts = Object.freeze({
  finding: 'Request-log queries exceed 30-second runtime budget',
  plan: 'Bound the request-log query',
  updated: 'Nov 18, 10:34 AM',
});
export function part(role, text, children = [], props = {}) {
  return { role, ...(text ? { text } : {}), ...props, ...(children.length ? { children } : {}) };
}
const link = (text, destination) => part('Link', text, [], { destination });
const destinations = () => part('Destinations', '', [
  part('Action', 'Open investigation session', [], { destination: 'session' }),
  part('Links', '', [link('Other runs', 'runs'), link('Alert in Vercel', 'alert')]),
]);
const freshness = (label = 'Investigation updated') => part('Fact', facts.updated, [], { label });
const status = (text, state, attention = 'ordinary') => part('Status', text, [], { state, attention });

export function compose({ presentation, situation, wrapper }) {
  const urgent = situation === 'urgent';
  let children;
  if (situation === 'missing') {
    children = [part('Summary', 'No investigation is recorded for this alert group.'),
      part('Links', '', [link('Other runs', 'runs'), link('Alert in Vercel', 'alert')])];
  } else if (presentation === 'groups') {
    children = [
      part('Group', '', [part('Headline', facts.finding), status('Completed', 'complete'), freshness('Updated')]),
      part('Group', '', [part('Label', 'Remediation Plan'), part('Title', facts.plan),
        status(urgent ? 'Awaiting approval · urgent' : 'Awaiting approval', 'pending', urgent ? 'urgent' : 'ordinary')]),
      destinations(),
    ];
  } else {
    // Lifting approval out of the prose is an authored change, not layout inference.
    const account = urgent
      ? [status(`Remediation Plan “${facts.plan}” awaits approval · urgent.`, 'pending', 'urgent'),
        part('Account', 'Investigation completed.')]
      : [part('Account', `Investigation completed. The remediation Plan, “${facts.plan}”, awaits approval.`)];
    children = [part('Headline', facts.finding), ...account, freshness(), destinations()];
  }
  if (wrapper) {
    // A real mechanical box at a boundary that the parent spacing policy uses.
    children = children.map(child => ['Destinations', 'Links'].includes(child.role)
      ? part('Wrapper', '', [child]) : child);
  }
  return part('Aside', '', children, { label: 'Current investigation' });
}

export function relatedRuns() {
  return part('Aside', '', [part('Summary', 'Earlier runs for the same alert group.'),
    part('Links', '', [link('Nov 18, 9:12 AM · Completed', 'earlier-run'), link('Nov 18, 8:46 AM · Completed', 'earlier-run')])],
  { label: 'Related runs' });
}

// A one-child mechanical wrapper forwards the child's layout-facing role.
// It still renders a block box. CSS does not treat arbitrary wrappers as neutral.
export function flowRole(node) {
  return node.role === 'Wrapper' ? flowRole(node.children[0]) : node.role;
}

// Serialized from the exact tree passed to render().
export function describe(node, indent = 0) {
  const pad = '  '.repeat(indent);
  const props = Object.entries(node).filter(([key]) => !['role', 'text', 'children'].includes(key));
  const attributes = props.map(([key, value]) => `${key}=${JSON.stringify(value)}`).join(' ');
  const head = `${pad}${node.role}${attributes ? ` ${attributes}` : ''}${node.text ? ` ${JSON.stringify(node.text)}` : ''}`;
  return node.children ? `${head} {\n${node.children.map(child => describe(child, indent + 1)).join('\n')}\n${pad}}` : head;
}
