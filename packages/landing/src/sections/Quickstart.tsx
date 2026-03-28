import React from 'react';
import { CodeBlock } from '../components/CodeBlock';

export function Quickstart() {
  return (
    <section id="quickstart">
      <div className="container">
        <span className="section-label">Quickstart</span>
        <h2 className="section-title">Up and running in 3 minutes</h2>
        <p className="section-subtitle" style={{ marginBottom: '2.5rem' }}>
          Install the packages, wrap your app, annotate your components. That's it.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Step 1 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700 }}>1</span>
              <h3 style={{ fontSize: '1.1rem' }}>Install</h3>
            </div>
            <CodeBlock language="bash">
{`<span class="hl-fn">pnpm</span> add @seam-ui/react @seam-ui/core

<span class="hl-cmt"># For testing:</span>
<span class="hl-fn">pnpm</span> add -D @seam-ui/playwright @playwright/test`}
            </CodeBlock>
          </div>

          {/* Step 2 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700 }}>2</span>
              <h3 style={{ fontSize: '1.1rem' }}>Wrap your app</h3>
            </div>
            <CodeBlock filename="App.tsx">
{`<span class="hl-kw">import</span> { <span class="hl-fn">LLMProvider</span>, <span class="hl-fn">LLMScope</span> } <span class="hl-kw">from</span> <span class="hl-str">'@seam-ui/react'</span>;

<span class="hl-kw">function</span> <span class="hl-fn">App</span>() {
  <span class="hl-kw">return</span> (
    &lt;<span class="hl-tag">LLMProvider</span> <span class="hl-attr">enabled</span>&gt;
      &lt;<span class="hl-tag">LLMScope</span> <span class="hl-attr">name</span>=<span class="hl-str">"Navigation"</span>&gt;
        &lt;<span class="hl-tag">NavBar</span> /&gt;
      &lt;/<span class="hl-tag">LLMScope</span>&gt;
      &lt;<span class="hl-tag">LLMScope</span> <span class="hl-attr">name</span>=<span class="hl-str">"Main Content"</span>&gt;
        &lt;<span class="hl-tag">YourApp</span> /&gt;
      &lt;/<span class="hl-tag">LLMScope</span>&gt;
    &lt;/<span class="hl-tag">LLMProvider</span>&gt;
  );
}`}
            </CodeBlock>
          </div>

          {/* Step 3 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700 }}>3</span>
              <h3 style={{ fontSize: '1.1rem' }}>Annotate your components</h3>
            </div>
            <CodeBlock filename="SearchBar.tsx">
{`<span class="hl-kw">import</span> { <span class="hl-fn">useLLMAction</span>, <span class="hl-fn">useLLMInput</span> } <span class="hl-kw">from</span> <span class="hl-str">'@seam-ui/react'</span>;

<span class="hl-kw">function</span> <span class="hl-fn">SearchBar</span>() {
  <span class="hl-kw">const</span> [query, setQuery] = useState(<span class="hl-str">''</span>);

  <span class="hl-kw">const</span> { <span class="hl-prop">ref</span>: inputRef } = <span class="hl-fn">useLLMInput</span>({
    <span class="hl-prop">name</span>: <span class="hl-str">'Search'</span>,
    <span class="hl-prop">description</span>: <span class="hl-str">'Search products by name'</span>,
    <span class="hl-prop">inputType</span>: <span class="hl-str">'search'</span>,
    <span class="hl-prop">value</span>: query,
  });

  <span class="hl-kw">const</span> { <span class="hl-prop">ref</span>: btnRef } = <span class="hl-fn">useLLMAction</span>({
    <span class="hl-prop">name</span>: <span class="hl-str">'Submit Search'</span>,
    <span class="hl-prop">description</span>: <span class="hl-str">'Search for products'</span>,
    <span class="hl-prop">enabled</span>: query.length > <span class="hl-num">0</span>,
  });

  <span class="hl-kw">return</span> (
    &lt;<span class="hl-tag">form</span>&gt;
      &lt;<span class="hl-tag">input</span> <span class="hl-attr">ref</span>={inputRef} <span class="hl-attr">value</span>={query}
        <span class="hl-attr">onChange</span>={e => setQuery(e.target.value)} /&gt;
      &lt;<span class="hl-tag">button</span> <span class="hl-attr">ref</span>={btnRef}&gt;Search&lt;/<span class="hl-tag">button</span>&gt;
    &lt;/<span class="hl-tag">form</span>&gt;
  );
}`}
            </CodeBlock>
          </div>
        </div>
      </div>
    </section>
  );
}
