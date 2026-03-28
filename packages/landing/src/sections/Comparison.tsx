import React from 'react';

const check = '\u2713';
const cross = '\u2717';

export function Comparison() {
  return (
    <section id="comparison">
      <div className="container">
        <span className="section-label">Comparison</span>
        <h2 className="section-title">How it compares</h2>
        <p className="section-subtitle" style={{ marginBottom: '2.5rem' }}>
          ui-llm is purpose-built for LLM-UI interaction. Existing tools solve adjacent problems.
        </p>

        <div className="card" style={{ overflow: 'auto', padding: 0 }}>
          <table className="comparison-table" style={{ minWidth: 550 }}>
            <thead>
              <tr>
                <th style={{ paddingLeft: '1.5rem' }}>Capability</th>
                <th style={{ color: 'var(--accent)' }}>ui-llm</th>
                <th>ARIA</th>
                <th>data-testid</th>
                <th>Screenshot AI</th>
              </tr>
            </thead>
            <tbody>
              <Row label="Semantic descriptions" vals={[true, false, false, false]} />
              <Row label="Live state tracking" vals={[true, false, false, false]} />
              <Row label="Typed parameters" vals={[true, false, false, false]} />
              <Row label="Bidirectional exec" vals={[true, false, false, false]} />
              <Row label="Route awareness" vals={[true, false, false, false]} />
              <Row label="Scope hierarchy" vals={[true, false, false, false]} />
              <Row label="Semantic relations" vals={[true, false, false, false]} />
              <Row label="No vision model needed" vals={[true, true, true, false]} />
              <Row label="Element identification" vals={[true, true, true, false]} />
              <Row label="Framework-agnostic spec" vals={[true, true, true, true]} />
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Row({ label, vals }: { label: string; vals: boolean[] }) {
  return (
    <tr>
      <td style={{ paddingLeft: '1.5rem' }}>{label}</td>
      {vals.map((v, i) => (
        <td key={i} style={{ color: v ? 'var(--green)' : 'var(--text-dim)', fontWeight: v ? 600 : 400, textAlign: 'center' }}>
          {v ? check : cross}
        </td>
      ))}
    </tr>
  );
}
