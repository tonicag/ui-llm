import React, { useState, useEffect } from 'react';

const links = [
  { href: '#features', label: 'Features' },
  { href: '#use-cases', label: 'Use Cases' },
  { href: '#quickstart', label: 'Quickstart' },
  { href: '#architecture', label: 'Architecture' },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      padding: '0.75rem 0',
      background: scrolled ? 'rgba(10,10,15,0.9)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      transition: 'all 0.3s',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="#" style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--accent)' }}>ui</span>-llm
        </a>

        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              style={{
                color: 'var(--text-muted)',
                textDecoration: 'none',
                padding: '0.4rem 0.75rem',
                borderRadius: 6,
                fontSize: '0.9rem',
                transition: 'color 0.2s',
              }}
              onMouseOver={e => (e.currentTarget.style.color = 'var(--text)')}
              onMouseOut={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              {l.label}
            </a>
          ))}
          <a href="#quickstart" className="btn btn-primary" style={{ marginLeft: '0.5rem', padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
            Get Started
          </a>
        </div>
      </div>
    </nav>
  );
}
