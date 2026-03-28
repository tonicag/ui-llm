import React from 'react';

export function Footer() {
  return (
    <footer style={{ padding: '4rem 0', borderTop: '1px solid var(--border)' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
          Ready to make your UI <span style={{ color: 'var(--accent)' }}>AI-native</span>?
        </h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: 500, margin: '0 auto 2rem', lineHeight: 1.6 }}>
          Start annotating your components today. Open source, protocol-first, zero lock-in.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
          <div className="install-box">
            <span className="dollar">$</span>
            <span>pnpm add @ui-llm/react @ui-llm/core</span>
          </div>
        </div>

        <div className="footer-badges" style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
          <span>MIT License</span>
          <span>TypeScript-first</span>
          <span>React 18+</span>
          <span>Playwright</span>
        </div>

        <div style={{ marginTop: '2rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
          Built with care for the AI-native future.
        </div>
      </div>
    </footer>
  );
}
