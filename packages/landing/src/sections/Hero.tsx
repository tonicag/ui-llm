import React from 'react';
import { TabbedCode } from '../components/CodeBlock';

export function Hero() {
  return (
    <section style={{ paddingTop: '5rem', paddingBottom: '4rem', borderBottom: 'none' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="badge" style={{ background: 'var(--accent-glow)', color: 'var(--accent)', marginBottom: '1.5rem' }}>
            Open Source Protocol
          </div>
          <h1 className="hero-title" style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.25rem', lineHeight: 1.1 }}>
            The missing semantic layer<br />
            <span style={{ color: 'var(--accent)' }}>between UI and AI</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: 620, margin: '0 auto 2rem', lineHeight: 1.6 }}>
            seam-ui adds an MCP-like annotation layer to React components so LLMs can
            understand what your UI does. Write Playwright tests in plain English.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#quickstart" className="btn btn-primary">Get Started</a>
            <a href="#features" className="btn btn-secondary">See Features</a>
          </div>
        </div>

        <div style={{ maxWidth: 750, margin: '0 auto' }}>
          <TabbedCode tabs={[
            {
              label: 'Single step',
              filename: 'basic.spec.ts',
              code: `<span class="hl-kw">import</span> { test } <span class="hl-kw">from</span> <span class="hl-str">'@seam-ui/playwright'</span>;

test(<span class="hl-str">'update settings'</span>, <span class="hl-kw">async</span> ({ page, <span class="hl-prop">llm</span> }) => {
  <span class="hl-kw">await</span> page.goto(<span class="hl-str">'http://localhost:3000'</span>);

  <span class="hl-kw">await</span> llm.<span class="hl-fn">do</span>(<span class="hl-str">'click Settings in the navbar'</span>);
  <span class="hl-kw">await</span> llm.<span class="hl-fn">do</span>(<span class="hl-str">'type "Alice" into the display name field'</span>);
  <span class="hl-kw">await</span> llm.<span class="hl-fn">do</span>(<span class="hl-str">'toggle dark mode on'</span>);
  <span class="hl-kw">await</span> llm.<span class="hl-fn">do</span>(<span class="hl-str">'click save settings'</span>);

  <span class="hl-kw">await</span> llm.<span class="hl-fn">expect</span>(<span class="hl-str">'dark mode is on'</span>);
});`,
            },
            {
              label: 'Multi-step',
              filename: 'multi-step.spec.ts',
              code: `<span class="hl-kw">import</span> { test } <span class="hl-kw">from</span> <span class="hl-str">'@seam-ui/playwright'</span>;

test(<span class="hl-str">'complete checkout'</span>, <span class="hl-kw">async</span> ({ page, <span class="hl-prop">llm</span> }) => {
  <span class="hl-kw">await</span> page.goto(<span class="hl-str">'http://localhost:3000'</span>);

  <span class="hl-cmt">// Multi-step: the LLM resolves all actions at once</span>
  <span class="hl-kw">await</span> llm.<span class="hl-fn">do</span>(<span class="hl-str">'go to contacts, add a new contact named '</span>
    + <span class="hl-str">'"Eve" with email "eve@test.com" as an Engineer, '</span>
    + <span class="hl-str">'then submit the form'</span>);

  <span class="hl-kw">await</span> llm.<span class="hl-fn">expect</span>(<span class="hl-str">'Eve is in the contact list'</span>);
});`,
            },
            {
              label: 'Sequence',
              filename: 'sequence.spec.ts',
              code: `<span class="hl-kw">import</span> { test } <span class="hl-kw">from</span> <span class="hl-str">'@seam-ui/playwright'</span>;

test(<span class="hl-str">'onboarding flow'</span>, <span class="hl-kw">async</span> ({ page, <span class="hl-prop">llm</span> }) => {
  <span class="hl-kw">await</span> page.goto(<span class="hl-str">'http://localhost:3000'</span>);

  <span class="hl-cmt">// sequence() re-reads the manifest after each step</span>
  <span class="hl-cmt">// so the LLM always sees the latest UI state</span>
  <span class="hl-kw">await</span> llm.<span class="hl-fn">sequence</span>([
    <span class="hl-str">'click Get Started on the home page'</span>,
    <span class="hl-str">'fill in name "Alice", email "alice@co.com"'</span>,
    <span class="hl-str">'select the Pro plan'</span>,
    <span class="hl-str">'toggle on email notifications'</span>,
    <span class="hl-str">'click Complete Setup'</span>,
  ]);

  <span class="hl-kw">await</span> llm.<span class="hl-fn">expect</span>(<span class="hl-str">'the welcome dashboard is visible'</span>);
});`,
            },
          ]} />
        </div>
      </div>
    </section>
  );
}
