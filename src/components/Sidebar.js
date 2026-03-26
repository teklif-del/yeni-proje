import React, { useState } from 'react';
import { SIRKETLER, SUBELER } from '../data/mockData';

// ─── Sabit üst menü öğeleri ─────────────────────────────────
const UST_MENU = [
  { id: 'dashboard', ikon: '📊', ad: 'Dashboard',         grup: 'ANA' },
];

const ALT_MENU = [
  { id: 'ogrenciler', ikon: '👨‍🎓', ad: 'Öğrenciler',      grup: 'YÖNETİM' },
  { id: 'personel',   ikon: '👥', ad: 'Personel',           grup: 'YÖNETİM' },
  { id: 'araclar',    ikon: '🚗', ad: 'Araçlar & Ekipman',  grup: 'YÖNETİM' },
  { id: 'finans',     ikon: '📊', ad: 'Gelir-Gider Takibi',   grup: 'FİNANS' },
  { id: 'giderler',   ikon: '📤', ad: 'Gider Takibi',         grup: 'FİNANS' },
  { id: 'gelirler',   ikon: '💚', ad: 'Gelir Takibi',         grup: 'FİNANS' },
  { id: 'kira',       ikon: '🏠', ad: 'Kira Gelirleri',       grup: 'FİNANS' },
  { id: 'raporlar',   ikon: '📈', ad: 'Raporlar',            grup: 'ANALİZ' },
];

function Sidebar({ aktifSayfa, setAktifSayfa, acik, setAcik, navigate }) {
  // Hangi şirketlerin accordion'u açık?
  const [acikSirketler, setAcikSirketler] = useState({ 1: true }); // Sürücü Kursu varsayılan açık

  const toggleSirket = (id) => {
    setAcikSirketler(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const gitSube = (sube) => {
    navigate('sube_detay', { subeId: sube.id, sirketId: sube.sirketId });
    if (window.innerWidth <= 768) setAcik(false);
  };

  const gitSirket = (sirketId) => {
    navigate('subeler', { sirketId });
    if (window.innerWidth <= 768) setAcik(false);
  };

  const gitMenu = (id) => {
    navigate(id);
    if (window.innerWidth <= 768) setAcik(false);
  };

  // Menü gruplarını derle
  const altGruplar = [...new Set(ALT_MENU.map(m => m.grup))];

  return (
    <>
      {/* Mobil Overlay */}
      {acik && (
        <div
          onClick={() => setAcik(false)}
          style={{
            display: window.innerWidth <= 768 ? 'block' : 'none',
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 999,
          }}
        />
      )}

      <aside className={`sidebar ${acik ? 'acik' : 'kapali'}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <span className="logo-ikon">🎓</span>
          <div className="logo-yazi">
            <h2>Kurs Yönetim</h2>
            <span>Sistemi v1.0</span>
          </div>
        </div>

        <nav className="sidebar-menu">

          {/* ── ANA ── */}
          <div className="menu-baslik">ANA</div>
          {UST_MENU.map(item => (
            <div key={item.id}
              className={`menu-item ${aktifSayfa === item.id ? 'aktif' : ''}`}
              onClick={() => gitMenu(item.id)}>
              <span className="menu-ikon">{item.ikon}</span>
              <span>{item.ad}</span>
            </div>
          ))}

          {/* ── ŞİRKETLER / ŞUBELER ── */}
          <div className="menu-baslik" style={{ marginTop: '8px' }}>ŞİRKETLER</div>

          {SIRKETLER.map(sirket => {
            const sirketSubeleri = SUBELER.filter(s => s.sirketId === sirket.id);
            const isOpen = !!acikSirketler[sirket.id];

            return (
              <div key={sirket.id}>
                {/* Şirket Satırı */}
                <div
                  onClick={() => toggleSirket(sirket.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 14px',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    margin: '1px 0',
                    background: isOpen ? sirket.renk + '18' : 'transparent',
                    borderLeft: isOpen ? `3px solid ${sirket.renk}` : '3px solid transparent',
                    transition: 'all 0.18s',
                    userSelect: 'none',
                  }}
                  onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = '#F1F5F9'; }}
                  onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = 'transparent'; }}
                >
                  {/* Şirket ikonu/renk noktası */}
                  <span style={{ fontSize: '16px', lineHeight: 1 }}>{sirket.ikon}</span>

                  {/* Şirket adı + şube sayısı */}
                  <span style={{
                    flex: 1,
                    fontSize: '13px',
                    fontWeight: isOpen ? '700' : '500',
                    color: isOpen ? sirket.renk : '#CBD5E1',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {sirket.ad.replace(' A.Ş.', '').replace(' Ltd.', '')}
                  </span>

                  {/* Şube sayısı badge */}
                  <span style={{
                    background: isOpen ? sirket.renk : '#334155',
                    color: 'white',
                    borderRadius: '10px',
                    padding: '1px 7px',
                    fontSize: '10px',
                    fontWeight: '700',
                    minWidth: '18px',
                    textAlign: 'center',
                  }}>
                    {sirketSubeleri.length}
                  </span>

                  {/* Ok ikonu */}
                  <span style={{
                    fontSize: '10px',
                    color: isOpen ? sirket.renk : '#64748B',
                    transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                    marginLeft: '2px',
                  }}>▶</span>
                </div>

                {/* Şubeler listesi (accordion) */}
                {isOpen && (
                  <div style={{
                    marginLeft: '14px',
                    borderLeft: `2px solid ${sirket.renk}44`,
                    marginBottom: '4px',
                    paddingLeft: '4px',
                  }}>
                    {/* "Tüm Şubeler" kısayolu */}
                    <div
                      onClick={() => gitSirket(sirket.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 10px',
                        cursor: 'pointer',
                        borderRadius: '7px',
                        fontSize: '11px',
                        color: '#94A3B8',
                        fontWeight: '600',
                        transition: 'all 0.15s',
                        marginBottom: '2px',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = sirket.renk + '18'; e.currentTarget.style.color = sirket.renk; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; }}
                    >
                      <span style={{ fontSize: '11px' }}>📋</span>
                      <span>Tüm Şubeleri Gör</span>
                    </div>

                    {/* Her şube */}
                    {sirketSubeleri.map(sube => (
                      <div
                        key={sube.id}
                        onClick={() => gitSube(sube)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '7px',
                          padding: '7px 10px',
                          cursor: 'pointer',
                          borderRadius: '7px',
                          fontSize: '12px',
                          color: aktifSayfa === 'sube_detay' ? '#CBD5E1' : '#94A3B8',
                          fontWeight: '500',
                          transition: 'all 0.15s',
                          background: 'transparent',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = sirket.renk + '22';
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.style.paddingLeft = '14px';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#94A3B8';
                          e.currentTarget.style.paddingLeft = '10px';
                        }}
                      >
                        {/* Durum noktası */}
                        <span style={{
                          width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                          background: sube.aktif ? sirket.renk : '#64748B',
                        }} />

                        {/* Şube adı kısa */}
                        <span style={{
                          flex: 1,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontSize: '12px',
                        }}>
                          {sube.ilce}
                          {sube.sehir !== 'İstanbul' ? ` / ${sube.sehir}` : ''}
                        </span>

                        {/* Aktif değilse gri */}
                        {!sube.aktif && (
                          <span style={{ fontSize: '9px', color: '#EF4444', fontWeight: '700' }}>●</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* ── YÖNETİM / FİNANS / ANALİZ ── */}
          {altGruplar.map(grup => (
            <div key={grup}>
              <div className="menu-baslik" style={{ marginTop: '8px' }}>{grup}</div>
              {ALT_MENU.filter(m => m.grup === grup).map(item => (
                <div
                  key={item.id}
                  className={`menu-item ${aktifSayfa === item.id ? 'aktif' : ''}`}
                  onClick={() => gitMenu(item.id)}
                >
                  <span className="menu-ikon">{item.ikon}</span>
                  <span>{item.ad}</span>
                </div>
              ))}
            </div>
          ))}

        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="kullanici">
            <div className="avatar">Y</div>
            <div className="kullanici-bilgi">
              <h4>Yönetici</h4>
              <span>Genel Müdür</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
