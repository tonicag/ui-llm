import React, { useState } from 'react';

interface CodeBlockProps {
  filename?: string;
  language?: string;
  children: string;
}

export function CodeBlock({ filename, language, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block">
      <div className="code-header">
        <div className="dots">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
        </div>
        <span>{filename ?? language ?? ''}</span>
        <button
          onClick={handleCopy}
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            color: copied ? 'var(--green)' : 'var(--text-dim)',
            padding: '2px 10px',
            borderRadius: 4,
            cursor: 'pointer',
            fontFamily: 'var(--mono)',
            fontSize: '0.75rem',
          }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="code-content">
        <pre dangerouslySetInnerHTML={{ __html: children }} />
      </div>
    </div>
  );
}

interface TabbedCodeProps {
  tabs: { label: string; filename?: string; code: string }[];
}

export function TabbedCode({ tabs }: TabbedCodeProps) {
  const [active, setActive] = useState(0);

  return (
    <div className="code-block">
      <div className="code-header" style={{ gap: '0.25rem' }}>
        <div style={{ display: 'flex', gap: '2px' }}>
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                background: i === active ? 'var(--border)' : 'transparent',
                border: 'none',
                color: i === active ? 'var(--text)' : 'var(--text-dim)',
                padding: '4px 12px',
                borderRadius: 4,
                cursor: 'pointer',
                fontFamily: 'var(--mono)',
                fontSize: '0.78rem',
                fontWeight: i === active ? 600 : 400,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span style={{ fontSize: '0.75rem' }}>{tabs[active].filename}</span>
      </div>
      <div className="code-content">
        <pre dangerouslySetInnerHTML={{ __html: tabs[active].code }} />
      </div>
    </div>
  );
}
