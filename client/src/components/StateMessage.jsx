import React from 'react';
import { AlertTriangle, PackageSearch } from 'lucide-react';

// Shared empty / error block used by all listing pages
const StateMessage = ({ variant = 'empty', title, message, action = null }) => {
  const Icon = variant === 'error' ? AlertTriangle : PackageSearch;
  const color = variant === 'error' ? 'var(--accent-rose)' : 'var(--brand-primary)';

  return (
    <div className="card" style={{ padding: '3rem 1.5rem', textAlign: 'center', borderStyle: 'dashed' }} role={variant === 'error' ? 'alert' : undefined}>
      <Icon size={36} color={color} style={{ margin: '0 auto 0.75rem' }} />
      <h3 style={{ fontSize: '1.125rem', marginBottom: '0.35rem' }}>{title}</h3>
      {message && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: action ? '1.25rem' : 0 }}>{message}</p>}
      {action}
    </div>
  );
};

export default StateMessage;
