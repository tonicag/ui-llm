import React from 'react';

export function Footer() {
  return (
    <footer style={{ padding: '4rem 0', borderTop: '1px solid var(--border)' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
          Ready to make your UI <span style={{ color: 'var(--accent)' }}>AI-native</span>?
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: 500, margin: '0 auto 2rem' }}>
          Start annotating your components today. Open source, protocol-first, zero lock-in.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '3rem' }}>
          <div className="install-box">
            <span className="dollar">$</span>
            pnpm add @ui-llm/react @ui-llm/core
          </div>
        </div>

        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
          <span>MIT License</span>
          <span>TypeScript-first</span>
          <span>React 18+</span>
          <span>Playwright compatible</span>
        </div>

        <div style={{ marginTop: '2rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
          Built with care for the AI-native future.
        </div>
      </div>
    </footer>
  );
}
