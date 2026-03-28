import React from 'react';
import { CodeBlock } from '../components/CodeBlock';

export function Solution() {
  return (
    <section id="solution">
      <div className="container">
        <span className="section-label">The Solution</span>
        <h2 className="section-title">Annotate once, let AI understand</h2>
        <p className="section-subtitle" style={{ marginBottom: '2.5rem' }}>
          Add semantic metadata to your React components with simple hooks.
          seam-ui builds a live manifest that LLMs can read, query, and act upon.
        </p>

        <div className="grid-2">
          <div>
            <CodeBlock filename="SettingsPage.tsx">
{`<span class="hl-kw">import</span> { <span class="hl-fn">useLLMAction</span>, <span class="hl-fn">useLLMInput</span> } <span class="hl-kw">from</span> <span class="hl-str">'@seam-ui/react'</span>;

<span class="hl-kw">function</span> <span class="hl-fn">SettingsPage</span>() {
  <span class="hl-kw">const</span> [name, setName] = useState(<span class="hl-str">'Alice'</span>);

  <span class="hl-cmt">// Annotate an input</span>
  <span class="hl-kw">const</span> { <span class="hl-prop">ref</span>: nameRef } = <span class="hl-fn">useLLMInput</span>({
    <span class="hl-prop">name</span>: <span class="hl-str">'Display Name'</span>,
    <span class="hl-prop">description</span>: <span class="hl-str">'Name shown to others'</span>,
    <span class="hl-prop">inputType</span>: <span class="hl-str">'text'</span>,
    <span class="hl-prop">value</span>: name,
  });

  <span class="hl-cmt">// Annotate a button</span>
  <span class="hl-kw">const</span> { <span class="hl-prop">ref</span>: saveRef } = <span class="hl-fn">useLLMAction</span>({
    <span class="hl-prop">name</span>: <span class="hl-str">'Save Settings'</span>,
    <span class="hl-prop">description</span>: <span class="hl-str">'Save all changes'</span>,
    <span class="hl-prop">enabled</span>: name.length > <span class="hl-num">0</span>,
  });

  <span class="hl-kw">return</span> (
    &lt;<span class="hl-tag">div</span>&gt;
      &lt;<span class="hl-tag">input</span> <span class="hl-attr">ref</span>={nameRef} <span class="hl-attr">value</span>={name} /&gt;
      &lt;<span class="hl-tag">button</span> <span class="hl-attr">ref</span>={saveRef}&gt;Save&lt;/<span class="hl-tag">button</span>&gt;
    &lt;/<span class="hl-tag">div</span>&gt;
  );
}`}
            </CodeBlock>
          </div>

          <div>
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-muted)' }}>What the LLM sees:</h3>
            <CodeBlock filename="manifest.json">
{`{
  <span class="hl-prop">"entries"</span>: [
    {
      <span class="hl-prop">"name"</span>: <span class="hl-str">"Display Name"</span>,
      <span class="hl-prop">"kind"</span>: <span class="hl-str">"input"</span>,
      <span class="hl-prop">"description"</span>: <span class="hl-str">"Name shown to others"</span>,
      <span class="hl-prop">"visible"</span>: <span class="hl-num">true</span>,
      <span class="hl-prop">"enabled"</span>: <span class="hl-num">true</span>,
      <span class="hl-prop">"currentValue"</span>: <span class="hl-str">"Alice"</span>
    },
    {
      <span class="hl-prop">"name"</span>: <span class="hl-str">"Save Settings"</span>,
      <span class="hl-prop">"kind"</span>: <span class="hl-str">"action"</span>,
      <span class="hl-prop">"description"</span>: <span class="hl-str">"Save all changes"</span>,
      <span class="hl-prop">"visible"</span>: <span class="hl-num">true</span>,
      <span class="hl-prop">"enabled"</span>: <span class="hl-num">true</span>
    }
  ]
}`}
            </CodeBlock>
          </div>
        </div>
      </div>
    </section>
  );
}
