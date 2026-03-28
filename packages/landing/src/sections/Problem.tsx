import React from 'react';

export function Problem() {
  return (
    <section id="problem">
      <div className="container">
        <span className="section-label">The Problem</span>
        <h2 className="section-title">LLMs are blind to UI intent</h2>
        <p className="section-subtitle" style={{ marginBottom: '2.5rem' }}>
          When an LLM looks at your UI, it sees pixels and HTML tags. It doesn't know
          what a button does, why an input exists, or what state the page is in.
        </p>

        <div className="grid-3">
          <div className="card">
            <div className="card-icon" style={{ background: 'rgba(248,113,113,0.1)', color: 'var(--red)' }}>?</div>
            <h3>Semantic ambiguity</h3>
            <p>A gear icon could be settings, preferences, or configuration. A button labeled "Go" could submit a search, navigate, or confirm.</p>
          </div>
          <div className="card">
            <div className="card-icon" style={{ background: 'rgba(248,113,113,0.1)', color: 'var(--red)' }}>?</div>
            <h3>No state awareness</h3>
            <p>Is this button disabled? Is that panel loading? Is the form valid? LLMs can't reliably determine element state from screenshots.</p>
          </div>
          <div className="card">
            <div className="card-icon" style={{ background: 'rgba(248,113,113,0.1)', color: 'var(--red)' }}>?</div>
            <h3>No action discovery</h3>
            <p>There's no standard way to tell an LLM "here are the things you can do on this page" with typed parameters and descriptions.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
