import React, { useEffect } from 'react';

function Modal({ acik, kapat, baslik, children, genislik = '540px' }) {
  useEffect(() => {
    if (acik) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [acik]);

  if (!acik) return null;

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(15,33,64,0.55)', zIndex: 3000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        backdropFilter: 'blur(2px)',
      }}
      onClick={kapat}
    >
      <div
        style={{
          background: 'white', borderRadius: '16px',
          width: '100%', maxWidth: genislik,
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          animation: 'modalGir 0.2s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Başlık */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid #F1F5F9',
          position: 'sticky', top: 0, background: 'white', borderRadius: '16px 16px 0 0',
          zIndex: 1,
        }}>
          <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#1E293B' }}>{baslik}</h2>
          <button
            onClick={kapat}
            style={{
              background: '#F1F5F9', border: 'none', borderRadius: '8px',
              width: '32px', height: '32px', fontSize: '18px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#64748B', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.target.style.background = '#E2E8F0'}
            onMouseLeave={e => e.target.style.background = '#F1F5F9'}
          >×</button>
        </div>
        {/* İçerik */}
        <div style={{ padding: '24px' }}>
          {children}
        </div>
      </div>
      <style>{`
        @keyframes modalGir {
          from { opacity: 0; transform: translateY(-16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

export default Modal;
