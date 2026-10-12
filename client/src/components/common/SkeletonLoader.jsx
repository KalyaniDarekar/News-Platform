import React from 'react';

export default function SkeletonLoader({ count = 3, type = 'card' }) {
  const items = Array.from({ length: count });

  if (type === 'hero') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr 0.8fr', gap: '2rem', padding: '2rem 0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="skeleton" style={{ height: '24px', width: '30%' }}></div>
          <div className="skeleton" style={{ height: '48px', width: '90%' }}></div>
          <div className="skeleton" style={{ height: '320px', width: '100%' }}></div>
          <div className="skeleton" style={{ height: '60px', width: '100%' }}></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="skeleton" style={{ height: '140px', width: '100%' }}></div>
          <div className="skeleton" style={{ height: '140px', width: '100%' }}></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="skeleton" style={{ height: '200px', width: '100%' }}></div>
          <div className="skeleton" style={{ height: '200px', width: '100%' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', padding: '1rem 0' }}>
      {items.map((_, idx) => (
        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div className="skeleton" style={{ aspectRatio: '16/10', width: '100%', borderRadius: '2px' }}></div>
          <div className="skeleton" style={{ height: '14px', width: '35%' }}></div>
          <div className="skeleton" style={{ height: '22px', width: '85%' }}></div>
          <div className="skeleton" style={{ height: '40px', width: '100%' }}></div>
          <div className="skeleton" style={{ height: '12px', width: '50%' }}></div>
        </div>
      ))}
    </div>
  );
}
