import React, { useState, useEffect } from 'react';
import { dbSirketler, dbSubeler } from '../lib/db';

const UST_MENU = [
  { id: 'dashboard', ikon: '📊', ad: 'Dashboard', grup: 'ANA' },
];

const ALT_MENU = [
  { id: 'subeler',   ikon: '🏢', ad: 'Şubeler',           grup: 'YÖNETİM' },
  { id: 'ogrenciler',ikon: '👨‍🎓', ad: 'Öğrenciler',       grup: 'YÖNETİM' },
  { id: 'personel',  ikon: '👥', ad: 'Personel',           grup: 'YÖNETİM' },
  { id: 'araclar',   ikon: '🚗', ad: 'Araçlar & Ekipman',  grup: 'YÖNETİM' },
  { id: 'finans',    ikon: '📊', ad: 'Gelir-Gider Takibi', grup: 'FİNANS' },
  { id: 'giderler',  ikon: '📤', ad: 'Gider Takibi',       grup: 'FİNANS' },
  { id: 'gelirler',  ikon: '💚', ad: 'Gelir Takibi',       grup: 'FİNANS' },
  { id: 'kira',      ikon: '🏠', ad: 'Kira Gelirleri',     grup: 'FİNANS' },
  { id: 'raporlar',  ikon: '📈', ad: 'Raporlar',           grup: 'ANALİZ' },
];

// Şirket renkleri (id'ye göre)
const RENKLER = ['#3B82F6','#10B981','#F59E0B','#8B5CF6','#EF4444','#06B6D4','#84CC16','#F97316'];

function Sidebar({ aktifSayfa, setAktifSayfa, acik, setAcik, navigate }) {
  const [sirketler, setSirketler] = useState([]);
  const [subeler, setSubeler]     = useState([]);
  const [acikSirketler, setAcikSirketler] = useState({});

  useEffect(() => {
    async function yukle() {
      const [sir, sub] = await Promise.all([dbSirketler.getAll(), dbSubeler.getAll()]);
      setSirketler(sir);
      setSubeler(sub);
      // İlk şirketi otomatik aç
      if (sir.length > 0) setAcikSirketler({ [sir[0].id]: true });
    }
    yukle();
  }, []);

  const toggleSirket = (id) =>
    setAcikSirketler(prev => ({ ...prev, [id]: !prev[id] }));

  const gitSube = (sube, sirket) => {
    navigate('sube_detay', { subeId: sube.id, sirketId: sirket.id });
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

  const altGruplar = [...new Set(ALT_MENU.map(m => m.grup))];

  return (
    <>
      {acik && (
        <div onClick={() => setAcik(false)} style={{
          display: window.innerWidth <= 768 ? 'block' : 'none',
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 999,
        }} />
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

          {/* ── ŞİRKETLER / ŞUBELER accordion ── */}
          {sirketler.length > 0 && (
            <>
              <div className="menu-baslik" style={{ marginTop: '8px' }}>ŞİRKETLER</div>
              {sirketler.map((sirket, idx) => {
                const renk = RENKLER[idx % RENKLER.length];
                const sirketSubeleri = subeler.filter(s =>
                  (s.sirket_id || s.sirketId) === sirket.id
                );
                const isOpen = !!acikSirketler[sirket.id];

                return (
                  <div key={sirket.id}>
                    {/* Şirket satırı */}
                    <div onClick={() => toggleSirket(sirket.id)} style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '9px 14px', cursor: 'pointer', borderRadius: '8px',
                      margin: '1px 0',
                      background: isOpen ? renk + '18' : 'transparent',
                      borderLeft: isOpen ? `3px solid ${renk}` : '3px solid transparent',
                      transition: 'all 0.18s', userSelect: 'none',
                    }}>
                      <span style={{ fontSize: '16px' }}>{sirket.ikon || '🏢'}</span>
                      <span style={{
                        flex: 1, fontSize: '13px',
                        fontWeight: isOpen ? '700' : '500',
                        color: isOpen ? renk : '#CBD5E1',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {sirket.ad}
                      </span>
                      <span style={{
                        background: isOpen ? renk : '#334155', color: 'white',
                        borderRadius: '10px', padding: '1px 7px',
                        fontSize: '10px', fontWeight: '700', minWidth: '18px', textAlign: 'center',
                      }}>
                        {sirketSubeleri.length}
                      </span>
                      <span style={{
                        fontSize: '10px', color: isOpen ? renk : '#64748B',
                        transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s', marginLeft: '2px',
                      }}>▶</span>
                    </div>

                    {/* Şubeler accordion */}
                    {isOpen && (
                      <div style={{
                        marginLeft: '14px', borderLeft: `2px solid ${renk}44`,
                        marginBottom: '4px', paddingLeft: '4px',
                      }}>
                        {/* Tüm şubeleri gör */}
                        <div onClick={() => gitSirket(sirket.id)} style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '6px 10px', cursor: 'pointer', borderRadius: '7px',
                          fontSize: '11px', color: '#94A3B8', fontWeight: '600',
                          transition: 'all 0.15s', marginBottom: '2px',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.background = renk + '18'; e.currentTarget.style.color = renk; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; }}>
                          <span>📋</span><span>Tüm Şubeleri Gör</span>
                        </div>

                        {/* Her şube */}
                        {sirketSubeleri.map(sube => (
                          <div key={sube.id} onClick={() => gitSube(sube, sirket)} style={{
                            display: 'flex', alignItems: 'center', gap: '7px',
                            padding: '7px 10px', cursor: 'pointer', borderRadius: '7px',
                            fontSize: '12px', color: '#94A3B8', fontWeight: '500',
                            transition: 'all 0.15s',
                          }}
                            onMouseEnter={e => { e.currentTarget.style.background = renk + '22'; e.currentTarget.style.color = 'white'; e.currentTarget.style.paddingLeft = '14px'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.paddingLeft = '10px'; }}>
                            <span style={{
                              width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                              background: sube.aktif !== false ? renk : '#64748B',
                            }} />
                            <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {sube.ilce || sube.ad}
                              {sube.sehir && sube.sehir !== 'İstanbul' ? ` / ${sube.sehir}` : ''}
                            </span>
                            {sube.aktif === false && (
                              <span style={{ fontSize: '9px', color: '#EF4444', fontWeight: '700' }}>●</span>
                            )}
                          </div>
                        ))}

                        {sirketSubeleri.length === 0 && (
                          <div style={{ fontSize: '11px', color: '#475569', padding: '5px 10px', fontStyle: 'italic' }}>
                            Şube yok
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* ── YÖNETİM / FİNANS / ANALİZ ── */}
          {altGruplar.map(grup => (
            <div key={grup}>
              <div className="menu-baslik" style={{ marginTop: '8px' }}>{grup}</div>
              {ALT_MENU.filter(m => m.grup === grup).map(item => (
                <div key={item.id}
                  className={`menu-item ${aktifSayfa === item.id ? 'aktif' : ''}`}
                  onClick={() => gitMenu(item.id)}>
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
