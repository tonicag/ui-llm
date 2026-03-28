import React from 'react';

const features = [
  {
    icon: '{}',
    color: 'var(--accent)',
    title: 'Hook-based API',
    desc: 'useLLMAction and useLLMInput hooks co-locate metadata with your components. One line to annotate, zero config.',
  },
  {
    icon: '[]',
    color: 'var(--accent-2)',
    title: 'Live state tracking',
    desc: 'Visibility, enabled/disabled, loading, validation, and dynamic state are tracked in real-time via observers.',
  },
  {
    icon: '()',
    color: 'var(--accent-3)',
    title: 'Bidirectional execution',
    desc: 'Actions can be invoked programmatically with typed parameters. No DOM simulation needed.',
  },
  {
    icon: '<>',
    color: 'var(--green)',
    title: 'Scope hierarchy',
    desc: 'LLMScope components group elements by page section, creating a semantic tree the LLM can navigate.',
  },
  {
    icon: '->',
    color: 'var(--orange)',
    title: 'Semantic relations',
    desc: 'Declare that a button "submits" specific inputs, "controls" a panel, or "triggers" a loading state.',
  },
  {
    icon: '#!',
    color: 'var(--red)',
    title: 'Permissions & capabilities',
    desc: 'Tag danger-zone actions, declare page capabilities. The LLM respects boundaries you set.',
  },
  {
    icon: '//',
    color: 'var(--accent)',
    title: 'Route awareness',
    desc: 'Declare your app routes with descriptions. LLMs know what pages exist and how to navigate.',
  },
  {
    icon: '=>',
    color: 'var(--accent-2)',
    title: 'Event subscriptions',
    desc: 'Subscribe to state changes in real-time. Agents can react to UI updates instead of polling.',
  },
  {
    icon: '{}',
    color: 'var(--accent-3)',
    title: 'JSON Schema spec',
    desc: 'Framework-agnostic protocol defined by a formal JSON Schema. Build implementations for Vue, Svelte, or vanilla JS.',
  },
];

export function Features() {
  return (
    <section id="features">
      <div className="container">
        <span className="section-label">Features</span>
        <h2 className="section-title">Everything you need</h2>
        <p className="section-subtitle" style={{ marginBottom: '2.5rem' }}>
          A complete protocol for LLM-UI interaction, with a batteries-included React implementation.
        </p>

        <div className="grid-3">
          {features.map(f => (
            <div key={f.title} className="card">
              <div className="card-icon" style={{ background: f.color + '18', color: f.color, fontFamily: 'var(--mono)', fontWeight: 700 }}>
                {f.icon}
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
