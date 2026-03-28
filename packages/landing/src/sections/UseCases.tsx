import React, { useState } from 'react';
import { CodeBlock } from '../components/CodeBlock';

const cases = [
  {
    id: 'testing',
    label: 'Natural Language Testing',
    desc: 'Write Playwright tests in English. The LLM resolves your instructions against the live manifest and executes them. No fragile selectors.',
    code: `<span class="hl-kw">import</span> { test, expect } <span class="hl-kw">from</span> <span class="hl-str">'@ui-llm/playwright'</span>;

test(<span class="hl-str">'checkout flow'</span>, <span class="hl-kw">async</span> ({ page, <span class="hl-prop">llm</span> }) => {
  <span class="hl-kw">await</span> page.goto(<span class="hl-str">'http://localhost:3000/shop'</span>);

  <span class="hl-kw">await</span> llm.<span class="hl-fn">do</span>(<span class="hl-str">'add the first product to cart'</span>);
  <span class="hl-kw">await</span> llm.<span class="hl-fn">do</span>(<span class="hl-str">'open the shopping cart'</span>);
  <span class="hl-kw">await</span> llm.<span class="hl-fn">expect</span>(<span class="hl-str">'the cart has 1 item'</span>);

  <span class="hl-kw">await</span> llm.<span class="hl-fn">do</span>(<span class="hl-str">'click checkout'</span>);
  <span class="hl-kw">await</span> llm.<span class="hl-fn">sequence</span>([
    <span class="hl-str">'type "alice@test.com" into the email field'</span>,
    <span class="hl-str">'select "Express Shipping"'</span>,
    <span class="hl-str">'click Place Order'</span>,
  ]);

  <span class="hl-kw">await</span> llm.<span class="hl-fn">expect</span>(<span class="hl-str">'the order confirmation is visible'</span>);

  <span class="hl-cmt">// Mix with regular Playwright when needed</span>
  <span class="hl-kw">await</span> expect(page.locator(<span class="hl-str">'.toast'</span>))
    .toContainText(<span class="hl-str">'Order placed!'</span>);
});`,
    filename: 'checkout.spec.ts',
  },
  {
    id: 'invoke',
    label: 'Direct Invocation',
    desc: 'Define typed parameters on actions. LLMs (or your code) can invoke them directly through the protocol, skipping DOM simulation entirely.',
    code: `<span class="hl-cmt">// In your component:</span>
<span class="hl-kw">const</span> { ref } = <span class="hl-fn">useLLMAction</span>({
  <span class="hl-prop">name</span>: <span class="hl-str">'Set Theme'</span>,
  <span class="hl-prop">description</span>: <span class="hl-str">'Change the app color theme'</span>,
  <span class="hl-prop">params</span>: {
    <span class="hl-prop">theme</span>: {
      <span class="hl-prop">type</span>: <span class="hl-str">'string'</span>,
      <span class="hl-prop">description</span>: <span class="hl-str">'The theme to apply'</span>,
      <span class="hl-prop">enum</span>: [<span class="hl-str">'light'</span>, <span class="hl-str">'dark'</span>, <span class="hl-str">'system'</span>],
      <span class="hl-prop">required</span>: <span class="hl-num">true</span>,
    },
  },
  <span class="hl-prop">onExecute</span>: <span class="hl-kw">async</span> (req) => {
    setTheme(req.params.theme);
    <span class="hl-kw">return</span> {
      <span class="hl-prop">status</span>: <span class="hl-str">'success'</span>,
      <span class="hl-prop">message</span>: <span class="hl-str">\`Theme set to \${req.params.theme}\`</span>,
    };
  },
});

<span class="hl-cmt">// In a test or from the console:</span>
<span class="hl-kw">await</span> llm.<span class="hl-fn">invoke</span>(<span class="hl-str">'Set Theme'</span>, { <span class="hl-prop">theme</span>: <span class="hl-str">'dark'</span> });

<span class="hl-cmt">// Or directly via the protocol:</span>
window.__ui_llm__.<span class="hl-fn">execute</span>(entryId, {
  <span class="hl-prop">operation</span>: <span class="hl-str">'invoke'</span>,
  <span class="hl-prop">params</span>: { <span class="hl-prop">theme</span>: <span class="hl-str">'dark'</span> },
});`,
    filename: 'ThemeToggle.tsx',
  },
  {
    id: 'agents',
    label: 'AI Agent Automation',
    desc: 'Autonomous agents can discover what your UI offers, understand state, and take actions — all through a structured protocol instead of fragile scraping.',
    code: `<span class="hl-cmt">// Agent reads the manifest</span>
<span class="hl-kw">const</span> manifest = window.__ui_llm__.<span class="hl-fn">getManifest</span>();

<span class="hl-cmt">// It knows what pages exist</span>
manifest.routes  <span class="hl-cmt">// [{ name: 'Settings', path: '/settings', ... }]</span>

<span class="hl-cmt">// What actions are available</span>
manifest.entries.<span class="hl-fn">filter</span>(e => e.kind === <span class="hl-str">'action'</span> && e.visible)
<span class="hl-cmt">// [{ name: 'Save', description: 'Save all changes', enabled: true }]</span>

<span class="hl-cmt">// What the current state is</span>
manifest.entries.<span class="hl-fn">filter</span>(e => e.kind === <span class="hl-str">'input'</span>)
<span class="hl-cmt">// [{ name: 'Email', currentValue: 'alice@co.com', valid: true }]</span>

<span class="hl-cmt">// Execute an action and get structured feedback</span>
<span class="hl-kw">const</span> result = <span class="hl-kw">await</span> window.__ui_llm__.<span class="hl-fn">execute</span>(id, {
  <span class="hl-prop">operation</span>: <span class="hl-str">'invoke'</span>,
  <span class="hl-prop">params</span>: { <span class="hl-prop">enabled</span>: <span class="hl-num">true</span> },
});
<span class="hl-cmt">// { status: 'success', sideEffects: ['Dark mode enabled'] }</span>

<span class="hl-cmt">// Subscribe to changes</span>
window.__ui_llm__.<span class="hl-fn">subscribe</span>(<span class="hl-str">'*'</span>, (event) => {
  console.log(event.type, event.entryId);
});`,
    filename: 'agent.ts',
  },
  {
    id: 'relations',
    label: 'Semantic Relations',
    desc: 'Declare cause-and-effect between elements. A submit button knows which inputs it submits. A toggle knows which panel it controls.',
    code: `<span class="hl-kw">const</span> { entryId: nameId } = <span class="hl-fn">useLLMInput</span>({
  <span class="hl-prop">name</span>: <span class="hl-str">'Name'</span>,
  <span class="hl-prop">description</span>: <span class="hl-str">'Contact name'</span>,
  <span class="hl-prop">inputType</span>: <span class="hl-str">'text'</span>, <span class="hl-prop">value</span>: name,
});

<span class="hl-kw">const</span> { entryId: emailId } = <span class="hl-fn">useLLMInput</span>({
  <span class="hl-prop">name</span>: <span class="hl-str">'Email'</span>,
  <span class="hl-prop">description</span>: <span class="hl-str">'Contact email'</span>,
  <span class="hl-prop">inputType</span>: <span class="hl-str">'email'</span>, <span class="hl-prop">value</span>: email,
});

<span class="hl-cmt">// The submit button declares what it submits</span>
<span class="hl-kw">const</span> { ref: submitRef } = <span class="hl-fn">useLLMAction</span>({
  <span class="hl-prop">name</span>: <span class="hl-str">'Save Contact'</span>,
  <span class="hl-prop">description</span>: <span class="hl-str">'Save the contact form'</span>,
  <span class="hl-prop">relations</span>: [
    { <span class="hl-prop">type</span>: <span class="hl-str">'submits'</span>, <span class="hl-prop">targetId</span>: nameId },
    { <span class="hl-prop">type</span>: <span class="hl-str">'submits'</span>, <span class="hl-prop">targetId</span>: emailId },
  ],
  <span class="hl-prop">enabled</span>: name && email,
});

<span class="hl-cmt">// A toggle declares what it controls</span>
<span class="hl-kw">const</span> { ref: toggleRef } = <span class="hl-fn">useLLMAction</span>({
  <span class="hl-prop">name</span>: <span class="hl-str">'Toggle Panel'</span>,
  <span class="hl-prop">description</span>: <span class="hl-str">'Show or hide the details panel'</span>,
  <span class="hl-prop">relations</span>: [
    { <span class="hl-prop">type</span>: <span class="hl-str">'controls'</span>, <span class="hl-prop">targetId</span>: panelId },
  ],
});`,
    filename: 'ContactForm.tsx',
  },
];

export function UseCases() {
  const [active, setActive] = useState('testing');
  const current = cases.find(c => c.id === active)!;

  return (
    <section id="use-cases">
      <div className="container">
        <span className="section-label">Use Cases</span>
        <h2 className="section-title">Built for every LLM interaction</h2>
        <p className="section-subtitle" style={{ marginBottom: '2rem' }}>
          From testing to autonomous agents, ui-llm provides the semantic foundation.
        </p>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {cases.map(c => (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className={active === c.id ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
            >
              {c.label}
            </button>
          ))}
        </div>

        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          {current.desc}
        </p>

        <CodeBlock filename={current.filename}>
          {current.code}
        </CodeBlock>
      </div>
    </section>
  );
}
