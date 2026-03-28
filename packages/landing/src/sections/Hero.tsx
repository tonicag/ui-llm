import React from 'react';
import { CodeBlock } from '../components/CodeBlock';

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
            ui-llm adds an MCP-like annotation layer to React components so LLMs can
            understand what your UI does. Write Playwright tests in plain English.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#quickstart" className="btn btn-primary">Get Started</a>
            <a href="#features" className="btn btn-secondary">See Features</a>
          </div>
        </div>

        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <CodeBlock filename="settings.spec.ts">
{`<span class="hl-kw">import</span> { test } <span class="hl-kw">from</span> <span class="hl-str">'@ui-llm/playwright'</span>;

test(<span class="hl-str">'user can update settings'</span>, <span class="hl-kw">async</span> ({ page, <span class="hl-prop">llm</span> }) => {
  <span class="hl-kw">await</span> page.goto(<span class="hl-str">'http://localhost:3000'</span>);

  <span class="hl-kw">await</span> llm.<span class="hl-fn">do</span>(<span class="hl-str">'click Settings in the navbar'</span>);
  <span class="hl-kw">await</span> llm.<span class="hl-fn">do</span>(<span class="hl-str">'type "Alice" into the display name field'</span>);
  <span class="hl-kw">await</span> llm.<span class="hl-fn">do</span>(<span class="hl-str">'toggle dark mode on'</span>);
  <span class="hl-kw">await</span> llm.<span class="hl-fn">do</span>(<span class="hl-str">'click save settings'</span>);

  <span class="hl-kw">await</span> llm.<span class="hl-fn">expect</span>(<span class="hl-str">'the display name contains "Alice"'</span>);
  <span class="hl-kw">await</span> llm.<span class="hl-fn">expect</span>(<span class="hl-str">'dark mode is on'</span>);
});`}
          </CodeBlock>
        </div>
      </div>
    </section>
  );
}
