import React from 'react';

export function Architecture() {
  return (
    <section id="architecture">
      <div className="container">
        <span className="section-label">Architecture</span>
        <h2 className="section-title">Protocol-first design</h2>
        <p className="section-subtitle" style={{ marginBottom: '2.5rem' }}>
          Three packages, each with a clear responsibility. Use what you need.
        </p>

        <div className="grid-3">
          <div className="card" style={{ borderColor: 'var(--accent)', borderWidth: 1 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--accent)', marginBottom: '0.75rem', fontWeight: 600 }}>
              @ui-llm/core
            </div>
            <h3>Protocol & Types</h3>
            <p style={{ marginBottom: '1rem' }}>
              Framework-agnostic TypeScript types, JSON Schema, and constants.
              The spec that any framework can implement.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {['Types', 'JSON Schema', 'Constants', 'Utilities'].map(t => (
                <span key={t} style={{
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: 'var(--accent-glow)',
                  color: 'var(--accent)',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}>{t}</span>
              ))}
            </div>
          </div>

          <div className="card" style={{ borderColor: 'var(--accent-2)', borderWidth: 1 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--accent-2)', marginBottom: '0.75rem', fontWeight: 600 }}>
              @ui-llm/react
            </div>
            <h3>React Implementation</h3>
            <p style={{ marginBottom: '1rem' }}>
              Hooks, provider, registry, and DevPanel.
              The developer-facing API for annotating React components.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {['useLLMAction', 'useLLMInput', 'LLMProvider', 'LLMScope', 'DevPanel'].map(t => (
                <span key={t} style={{
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: 'rgba(34,211,238,0.1)',
                  color: 'var(--accent-2)',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--mono)',
                }}>{t}</span>
              ))}
            </div>
          </div>

          <div className="card" style={{ borderColor: 'var(--accent-3)', borderWidth: 1 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--accent-3)', marginBottom: '0.75rem', fontWeight: 600 }}>
              @ui-llm/playwright
            </div>
            <h3>Playwright Integration</h3>
            <p style={{ marginBottom: '1rem' }}>
              Test fixture with natural language commands.
              Reads the manifest, talks to an LLM, executes actions.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {['llm.do()', 'llm.expect()', 'llm.find()', 'llm.invoke()', 'llm.navigate()'].map(t => (
                <span key={t} style={{
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: 'rgba(167,139,250,0.1)',
                  color: 'var(--accent-3)',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--mono)',
                }}>{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Flow diagram */}
        <div className="card" style={{ marginTop: '2rem', textAlign: 'center', padding: '2.5rem' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 2.2 }}>
            <span style={{ color: 'var(--accent-2)' }}>React Component</span>
            <span style={{ color: 'var(--text-dim)' }}> ── useLLMAction ──&gt; </span>
            <span style={{ color: 'var(--accent)' }}>Registry</span>
            <span style={{ color: 'var(--text-dim)' }}> ── getManifest() ──&gt; </span>
            <span style={{ color: 'var(--green)' }}>JSON Manifest</span>
            <br />
            <span style={{ color: 'var(--green)' }}>JSON Manifest</span>
            <span style={{ color: 'var(--text-dim)' }}> ── window.__ui_llm__ ──&gt; </span>
            <span style={{ color: 'var(--accent-3)' }}>Playwright</span>
            <span style={{ color: 'var(--text-dim)' }}> ── LLM API ──&gt; </span>
            <span style={{ color: 'var(--orange)' }}>Action Resolution</span>
            <br />
            <span style={{ color: 'var(--orange)' }}>Action Resolution</span>
            <span style={{ color: 'var(--text-dim)' }}> ── execute() ──&gt; </span>
            <span style={{ color: 'var(--accent-2)' }}>Component Handler</span>
            <span style={{ color: 'var(--text-dim)' }}> ──&gt; </span>
            <span style={{ color: 'var(--green)' }}>ExecutionResult</span>
          </div>
        </div>
      </div>
    </section>
  );
}
