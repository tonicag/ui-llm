import type { CSSProperties } from 'react';

export const card: CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  padding: '1.5rem',
  marginBottom: '1.5rem',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
};

export const input: CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '0.5rem 0.75rem',
  border: '1px solid #ddd',
  borderRadius: '6px',
  fontSize: '0.95rem',
  marginTop: '0.25rem',
  outline: 'none',
};

export const label: CSSProperties = {
  display: 'block',
  marginBottom: '1rem',
  fontWeight: 500,
  fontSize: '0.9rem',
  color: '#555',
};

export const btnPrimary: CSSProperties = {
  padding: '0.5rem 1.25rem',
  background: '#4a4aff',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  fontSize: '0.9rem',
  cursor: 'pointer',
};

export const btnDanger: CSSProperties = {
  ...btnPrimary,
  background: '#e74c3c',
};

export const btnSecondary: CSSProperties = {
  ...btnPrimary,
  background: '#eee',
  color: '#333',
};

export const btnDisabled: CSSProperties = {
  ...btnPrimary,
  background: '#ccc',
  cursor: 'not-allowed',
};

export const badge = (color: string): CSSProperties => ({
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: '12px',
  fontSize: '0.75rem',
  fontWeight: 600,
  background: color + '22',
  color,
});

export const row: CSSProperties = {
  display: 'flex',
  gap: '0.75rem',
  alignItems: 'center',
};

export const spaceBetween: CSSProperties = {
  ...row,
  justifyContent: 'space-between',
};
