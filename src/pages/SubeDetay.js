import React, { useState, useMemo } from 'react';
import { SIRKETLER, SUBELER, OGRENCILER, PERSONEL, ARACLAR, GELIRLER, GIDERLER } from '../data/mockData';
import Modal from '../components/Modal';

const AY_ADLARI = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

function InfoKart({ ikon, label, deger, renk, bg }) {
  return (
    <div style={{
      background: bg || '#F8FAFC',
      borderRadius: '12px',
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      border: `1px solid ${renk}33`,
    }}>
      <div style={{
        width: '44px', height: '44px', borderRadius: '12px',
        background: renk + '20', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '22px', flexShrink: 0,
      }}>
        {ikon}
      </div>
      <div>
        <div style={{ fontSize: '20px', fontWeight: '800', color: renk }}>{deger}</div>
        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '1px' }}>{label}</div>
      </div>
    </div>
  );
}

function InfoSatir({ etiket, deger, renk }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', background:'#F8FAFC', borderRadius:'8px', padding:'11px 14px', border:'1px solid #E2E8F0' }}>
      <span style={{ fontSize:'10px', color:'#64748B', marginBottom:'3px', textTransform:'uppercase', letterSpacing:'0.6px', fontWeight:'600' }}>{etiket}</span>
      <span style={{ fontSize:'14px', fontWeight:'600', color: renk||'#1E293B' }}>{deger||'—'}</span>
    </div>
  );
}

export default function SubeDetay({ subeId, navigate }) {
  const [aktifTab, setAktifTab] = useState('ozet');
  const [duzenleModal, setDuzenleModal] = useState(false);
  const [subeListe, setSubeListe] = useState(SUBELER);
  const [form, setForm] = useState({});

  const sube   = subeListe.find(s => s.id === subeId);
  const sirket = sube ? SIRKETLER.find(s => s.id === sube.sirketId) : null;

  // Bu şubeye ait veriler
  const subeOgrenciler  = useMemo(() => OGRENCILER.filter(o => o.subeId === subeId), [subeId]);
  const subePersonel    = useMemo(() => PERSONEL.filter(p => p.subeId === subeId), [subeId]);
  const subeAraclar     = useMemo(() => ARACLAR.filter(a => a.subeId === subeId), [subeId]);
  const subeGelirler    = useMemo(() => GELIRLER.filter(g => g.subeId === subeId), [subeId]);
  const subeGiderler    = useMemo(() => GIDERLER.filter(g => g.subeId === subeId), [subeId]);

  const toplamGelir    = subeGelirler.reduce((s, g) => s + g.tutar, 0);
  const toplamGider    = subeGiderler.reduce((s, g) => s + g.tutar, 0);
  const netKar         = toplamGelir - toplamGider;
  const aktifOgrenci   = subeOgrenciler.filter(o => o.durum === 'devam_ediyor').length;
  const tahsilatOrani  = subeOgrenciler.length > 0
    ? Math.round(subeOgrenciler.reduce((s,o)=>s+o.odenenUcret,0) / (subeOgrenciler.reduce((s,o)=>s+o.toplamUcret,0)||1) * 100)
    : 0;

  if (!sube || !sirket) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
        <div style={{ fontSize: '16px', fontWeight: '600' }}>Şube bulunamadı.</div>
        <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => navigate('subeler')}>
          ← Şubelere Dön
        </button>
      </div>
    );
  }

  // Şirketin diğer şubeleri
  const kardesSubeler = subeListe.filter(s => s.sirketId === sube.sirketId && s.id !== sube.id);

  const subeGuncelle = () => {
    setSubeListe(prev => prev.map(s => s.id === sube.id ? { ...s, ...form } : s));
    setDuzenleModal(false);
  };

  const Inp = ({ label, name, tip = 'text' }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>{label}</label>
      <input type={tip}
        style={{ padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
        value={form[name] || ''} onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))}
        placeholder={label} />
    </div>
  );

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '13px', color: '#64748B' }}>
        <span style={{ cursor: 'pointer', color: '#3B82F6', fontWeight: '600' }}
          onClick={() => navigate('subeler', { sirketId: sube.sirketId })}>
          {sirket.ikon} {sirket.ad}
        </span>
        <span>›</span>
        <span style={{ color: '#1E293B', fontWeight: '700' }}>{sube.ad}</span>
      </div>

      {/* Hero Başlık */}
      <div style={{
        background: `linear-gradient(135deg, #0F2140 0%, ${sirket.renk}33 100%)`,
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '20px',
        border: `1px solid ${sirket.renk}44`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Arka plan dekoratif */}
        <div style={{
          position: 'absolute', right: '-20px', top: '-20px',
          fontSize: '120px', opacity: 0.06, userSelect: 'none',
        }}>{sirket.ikon}</div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '18px', position: 'relative' }}>
          {/* Şirket renk çizgisi + ikon */}
          <div style={{
            width: '60px', height: '60px', borderRadius: '14px',
            background: sirket.renk + '30',
            border: `2px solid ${sirket.renk}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '30px', flexShrink: 0,
          }}>
            {sirket.ikon}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '22px', fontWeight: '800', color: 'white', marginBottom: '4px' }}>
              {sube.ad}
            </div>
            <div style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '6px' }}>
              📍 {sube.adres} — {sube.ilce}, {sube.sehir}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{
                background: sirket.renk + '25', color: sirket.renk === '#3B82F6' ? '#93C5FD' : sirket.renk,
                border: `1px solid ${sirket.renk}55`,
                padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
              }}>
                {sirket.ikon} {sirket.ad}
              </span>
              <span style={{
                background: sube.aktif ? 'rgba(21,128,61,0.25)' : 'rgba(220,38,38,0.25)',
                color: sube.aktif ? '#6EE7B7' : '#FCA5A5',
                border: `1px solid ${sube.aktif ? '#6EE7B7' : '#FCA5A5'}55`,
                padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
              }}>
                {sube.aktif ? '✅ Aktif' : '❌ Pasif'}
              </span>
              {sube.telefon && (
                <span style={{ color: '#94A3B8', fontSize: '13px' }}>📞 {sube.telefon}</span>
              )}
            </div>
          </div>

          {/* Sağ üst: Düzenle butonu */}
          <button
            onClick={() => { setForm({ ...sube }); setDuzenleModal(true); }}
            style={{
              background: 'rgba(255,255,255,0.1)', color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px', padding: '8px 16px',
              fontSize: '13px', fontWeight: '600', cursor: 'pointer',
              flexShrink: 0,
            }}>
            ✏️ Düzenle
          </button>
        </div>
      </div>

      {/* Özet KPI Kartları */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <InfoKart ikon="👨‍🎓" label="Toplam Öğrenci"  deger={subeOgrenciler.length}  renk="#3B82F6" />
        <InfoKart ikon="✅"  label="Aktif Öğrenci"   deger={aktifOgrenci}           renk="#10B981" />
        <InfoKart ikon="👥"  label="Personel"         deger={subePersonel.length}    renk="#8B5CF6" />
        <InfoKart ikon="🚗"  label="Araç"             deger={subeAraclar.length}     renk="#F59E0B" />
        <InfoKart ikon="💰"  label="Toplam Gelir"     deger={`₺${toplamGelir.toLocaleString('tr-TR')}`}  renk="#10B981" />
        <InfoKart ikon="📤"  label="Toplam Gider"     deger={`₺${toplamGider.toLocaleString('tr-TR')}`}  renk="#EF4444" />
        <InfoKart ikon={netKar >= 0 ? '📈' : '📉'} label="Net Kâr / Zarar"
          deger={`₺${Math.abs(netKar).toLocaleString('tr-TR')}`}
          renk={netKar >= 0 ? '#10B981' : '#EF4444'} />
        <InfoKart ikon="💳"  label="Tahsilat Oranı"  deger={`%${tahsilatOrani}`}    renk="#06B6D4" />
      </div>

      {/* Tab Bar */}
      <div className="tab-bar">
        {[
          { id: 'ozet',      label: '📋 Özet'         },
          { id: 'ogrenciler',label: `👨‍🎓 Öğrenciler (${subeOgrenciler.length})` },
          { id: 'personel',  label: `👥 Personel (${subePersonel.length})` },
          { id: 'araclar',   label: `🚗 Araçlar (${subeAraclar.length})` },
          { id: 'finans',    label: '💰 Gelir & Gider' },
          { id: 'kardessube',label: `🏢 Diğer Şubeler (${kardesSubeler.length})` },
        ].map(t => (
          <div key={t.id} className={`tab-item ${aktifTab === t.id ? 'aktif' : ''}`}
            onClick={() => setAktifTab(t.id)}>
            {t.label}
          </div>
        ))}
      </div>

      {/* ═══ ÖZET ═══ */}
      {aktifTab === 'ozet' && (
        <div className="panel">
          <div className="panel-baslik"><h3>📋 Şube Bilgileri</h3></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            <InfoSatir etiket="Şube Adı"     deger={sube.ad} />
            <InfoSatir etiket="Şirket"       deger={`${sirket.ikon} ${sirket.ad}`} renk={sirket.renk} />
            <InfoSatir etiket="Durum"        deger={sube.aktif ? '✅ Aktif' : '❌ Pasif'} renk={sube.aktif?'#10B981':'#EF4444'} />
            <InfoSatir etiket="Şehir"        deger={sube.sehir} />
            <InfoSatir etiket="İlçe"         deger={sube.ilce} />
            <InfoSatir etiket="Telefon"      deger={sube.telefon} />
            <InfoSatir etiket="Adres" deger={sube.adres} />
          </div>

          {/* Şirketteki diğer şubeler hızlı erişim */}
          {kardesSubeler.length > 0 && (
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '10px' }}>
                {sirket.ikon} {sirket.ad} — Diğer Şubeler
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {kardesSubeler.map(ks => (
                  <button key={ks.id}
                    onClick={() => navigate('sube_detay', { subeId: ks.id, sirketId: ks.sirketId })}
                    style={{
                      padding: '7px 14px', borderRadius: '10px', cursor: 'pointer',
                      background: sirket.renk + '15', border: `1px solid ${sirket.renk}44`,
                      color: sirket.renk, fontSize: '13px', fontWeight: '600',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = sirket.renk + '30'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = sirket.renk + '15'; }}
                  >
                    {sirket.ikon} {ks.ilce}
                    {ks.sehir !== 'İstanbul' ? ` / ${ks.sehir}` : ''}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ ÖĞRENCİLER ═══ */}
      {aktifTab === 'ogrenciler' && (
        <div className="panel">
          <div className="panel-baslik">
            <h3>👨‍🎓 Öğrenciler</h3>
            <span style={{ fontSize: '13px', color: '#64748B' }}>{subeOgrenciler.length} kayıt</span>
          </div>
          {subeOgrenciler.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
              Bu şubeye kayıtlı öğrenci bulunmamaktadır.
            </div>
          ) : (
            <div className="tablo-container">
              <table>
                <thead>
                  <tr>
                    <th>Ad Soyad</th><th>TC</th><th>Telefon</th>
                    <th>Kurs Tipi</th><th>Kayıt Tarihi</th>
                    <th>Ücret</th><th>Ödenen</th><th>Kalan</th><th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {subeOgrenciler.map(o => {
                    const kalan = o.toplamUcret - o.odenenUcret;
                    return (
                      <tr key={o.id}>
                        <td>
                          <div style={{ fontWeight: '700' }}>{o.ad} {o.soyad}</div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>{o.email}</div>
                        </td>
                        <td style={{ fontSize: '12px', color: '#64748B' }}>{o.tc}</td>
                        <td style={{ fontSize: '13px' }}>{o.telefon}</td>
                        <td>
                          <span style={{ background: '#DBEAFE', color: '#1D4ED8', padding: '3px 9px', borderRadius: '10px', fontSize: '12px', fontWeight: '700' }}>
                            {o.kurstipi}
                          </span>
                        </td>
                        <td style={{ fontSize: '12px' }}>📅 {o.kayitTarihi}</td>
                        <td style={{ fontWeight: '700', fontSize: '13px' }}>₺{o.toplamUcret.toLocaleString('tr-TR')}</td>
                        <td style={{ fontWeight: '700', color: '#15803D' }}>₺{o.odenenUcret.toLocaleString('tr-TR')}</td>
                        <td style={{ fontWeight: '700', color: kalan > 0 ? '#DC2626' : '#15803D' }}>
                          {kalan > 0 ? `₺${kalan.toLocaleString('tr-TR')}` : '✔ Tamam'}
                        </td>
                        <td>
                          <span style={{
                            padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700',
                            background: o.durum === 'devam_ediyor' ? '#DCFCE7' : o.durum === 'tamamladi' ? '#DBEAFE' : '#FEF9C3',
                            color: o.durum === 'devam_ediyor' ? '#14532D' : o.durum === 'tamamladi' ? '#1D4ED8' : '#713F12',
                          }}>
                            {o.durum === 'devam_ediyor' ? '📚 Devam Ediyor' : o.durum === 'tamamladi' ? '🎓 Tamamladı' : '⏸ Bekleme'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══ PERSONEL ═══ */}
      {aktifTab === 'personel' && (
        <div className="panel">
          <div className="panel-baslik">
            <h3>👥 Personel</h3>
            <span style={{ fontSize: '13px', color: '#64748B' }}>{subePersonel.length} kişi</span>
          </div>
          {subePersonel.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
              Bu şubede kayıtlı personel bulunmamaktadır.
            </div>
          ) : (
            <div className="tablo-container">
              <table>
                <thead>
                  <tr><th>Ad Soyad</th><th>Pozisyon</th><th>Telefon</th><th>İşe Giriş</th><th>Maaş</th><th>Durum</th></tr>
                </thead>
                <tbody>
                  {subePersonel.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: '700' }}>{p.ad} {p.soyad}</div>
                      </td>
                      <td>
                        <span style={{ background: '#EDE9FE', color: '#5B21B6', padding: '3px 9px', borderRadius: '10px', fontSize: '12px', fontWeight: '700' }}>
                          {p.pozisyon}
                        </span>
                      </td>
                      <td style={{ fontSize: '13px' }}>{p.telefon}</td>
                      <td style={{ fontSize: '12px' }}>📅 {p.iseGirisTarihi}</td>
                      <td style={{ fontWeight: '700', color: '#15803D', fontSize: '14px' }}>₺{p.maas?.toLocaleString('tr-TR')}</td>
                      <td>
                        <span style={{
                          background: p.aktif ? '#DCFCE7' : '#FEE2E2',
                          color: p.aktif ? '#14532D' : '#991B1B',
                          padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700',
                        }}>
                          {p.aktif ? '✅ Aktif' : '❌ Pasif'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══ ARAÇLAR ═══ */}
      {aktifTab === 'araclar' && (
        <div className="panel">
          <div className="panel-baslik">
            <h3>🚗 Şube Araçları</h3>
            <span style={{ fontSize: '13px', color: '#64748B' }}>{subeAraclar.length} araç</span>
          </div>
          {subeAraclar.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
              Bu şubeye atanmış araç bulunmamaktadır.
            </div>
          ) : (
            <div className="tablo-container">
              <table>
                <thead>
                  <tr><th>Plaka</th><th>Araç</th><th>Sınıf</th><th>KM</th><th>Son Bakım</th><th>Durum</th></tr>
                </thead>
                <tbody>
                  {subeAraclar.map(a => (
                    <tr key={a.id}>
                      <td>
                        <div style={{ background: '#1E3A5F', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: '700', display: 'inline-block', letterSpacing: '1px' }}>
                          {a.plaka}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '700' }}>{a.marka} {a.model}</div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>{a.yil} Model</div>
                      </td>
                      <td>
                        <span style={{ background: '#DBEAFE', color: '#1D4ED8', padding: '3px 9px', borderRadius: '10px', fontSize: '12px', fontWeight: '700' }}>
                          {a.sinif}
                        </span>
                      </td>
                      <td style={{ fontWeight: '600' }}>{a.km?.toLocaleString('tr-TR')} km</td>
                      <td style={{ fontSize: '12px' }}>{a.sonBakim}</td>
                      <td>
                        <span style={{
                          background: a.aktif ? '#DCFCE7' : '#FEF9C3',
                          color: a.aktif ? '#14532D' : '#713F12',
                          padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700',
                        }}>
                          {a.aktif ? '✅ Aktif' : '🔧 Bakımda'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══ GELİR & GİDER ═══ */}
      {aktifTab === 'finans' && (
        <div>
          {/* Özet */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: 'linear-gradient(135deg,#DCFCE7,#F0FDF4)', borderRadius: '14px', padding: '18px', border: '1px solid #86EFAC', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#15803D' }}>₺{toplamGelir.toLocaleString('tr-TR')}</div>
              <div style={{ fontSize: '12px', color: '#16A34A', fontWeight: '700', marginTop: '4px' }}>TOPLAM GELİR</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg,#FEE2E2,#FFF5F5)', borderRadius: '14px', padding: '18px', border: '1px solid #FCA5A5', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#DC2626' }}>₺{toplamGider.toLocaleString('tr-TR')}</div>
              <div style={{ fontSize: '12px', color: '#EF4444', fontWeight: '700', marginTop: '4px' }}>TOPLAM GİDER</div>
            </div>
            <div style={{ background: netKar >= 0 ? 'linear-gradient(135deg,#DCFCE7,#F0FDF4)' : 'linear-gradient(135deg,#FEE2E2,#FFF5F5)', borderRadius: '14px', padding: '18px', border: `1px solid ${netKar >= 0 ? '#86EFAC' : '#FCA5A5'}`, textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: netKar >= 0 ? '#15803D' : '#DC2626' }}>₺{Math.abs(netKar).toLocaleString('tr-TR')}</div>
              <div style={{ fontSize: '12px', color: netKar >= 0 ? '#16A34A' : '#EF4444', fontWeight: '700', marginTop: '4px' }}>{netKar >= 0 ? 'NET KÂR' : 'NET ZARAR'}</div>
            </div>
          </div>

          {/* Gelirler */}
          <div className="panel" style={{ marginBottom: '16px' }}>
            <div className="panel-baslik"><h3>💰 Gelirler</h3></div>
            {subeGelirler.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#64748B' }}>Gelir kaydı yok.</div>
            ) : (
              <div className="tablo-container">
                <table>
                  <thead><tr><th>Tarih</th><th>Tutar</th><th>Tip</th><th>Açıklama</th></tr></thead>
                  <tbody>
                    {subeGelirler.map(g => (
                      <tr key={g.id}>
                        <td>📅 {g.tarih}</td>
                        <td style={{ fontWeight: '700', color: '#15803D', fontSize: '15px' }}>₺{g.tutar.toLocaleString('tr-TR')}</td>
                        <td>
                          <span style={{ background: '#DCFCE7', color: '#14532D', padding: '3px 9px', borderRadius: '10px', fontSize: '12px', fontWeight: '700' }}>
                            {g.tip === 'kurs_ucreti' ? '📚 Kurs Ücreti' : '🏠 Kira Geliri'}
                          </span>
                        </td>
                        <td style={{ fontSize: '13px', color: '#64748B' }}>{g.aciklama}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Giderler */}
          <div className="panel">
            <div className="panel-baslik"><h3>📤 Giderler</h3></div>
            {subeGiderler.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#64748B' }}>Gider kaydı yok.</div>
            ) : (
              <div className="tablo-container">
                <table>
                  <thead><tr><th>Tarih</th><th>Tutar</th><th>Tip</th><th>Açıklama</th></tr></thead>
                  <tbody>
                    {subeGiderler.map(g => (
                      <tr key={g.id}>
                        <td>📅 {g.tarih}</td>
                        <td style={{ fontWeight: '700', color: '#DC2626', fontSize: '15px' }}>₺{g.tutar.toLocaleString('tr-TR')}</td>
                        <td>
                          <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '3px 9px', borderRadius: '10px', fontSize: '12px', fontWeight: '700' }}>
                            {g.tip}
                          </span>
                        </td>
                        <td style={{ fontSize: '13px', color: '#64748B' }}>{g.aciklama}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ KARDEŞ ŞUBELER ═══ */}
      {aktifTab === 'kardessube' && (
        <div className="panel">
          <div className="panel-baslik">
            <h3>{sirket.ikon} {sirket.ad} — Tüm Şubeler</h3>
            <span style={{ fontSize: '13px', color: '#64748B' }}>{kardesSubeler.length + 1} şube</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
            {/* Mevcut şube */}
            <div style={{
              background: `linear-gradient(135deg,${sirket.renk}25,${sirket.renk}10)`,
              border: `2px solid ${sirket.renk}`,
              borderRadius: '14px', padding: '16px',
            }}>
              <div style={{ fontWeight: '800', color: sirket.renk, fontSize: '14px', marginBottom: '6px' }}>
                {sirket.ikon} {sube.ad}
              </div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>📍 {sube.ilce}, {sube.sehir}</div>
              {sube.telefon && <div style={{ fontSize: '12px', color: '#64748B', marginTop: '3px' }}>📞 {sube.telefon}</div>}
              <div style={{ marginTop: '8px' }}>
                <span style={{ background: sirket.renk + '20', color: sirket.renk, padding: '3px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '700', border: `1px solid ${sirket.renk}44` }}>
                  📌 Mevcut Şube
                </span>
              </div>
            </div>

            {/* Kardeş şubeler */}
            {kardesSubeler.map(ks => (
              <div key={ks.id}
                onClick={() => navigate('sube_detay', { subeId: ks.id, sirketId: ks.sirketId })}
                style={{
                  background: '#F8FAFC', border: `1px solid ${sirket.renk}33`,
                  borderRadius: '14px', padding: '16px', cursor: 'pointer',
                  transition: 'all 0.18s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = sirket.renk + '12';
                  e.currentTarget.style.border = `1px solid ${sirket.renk}88`;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 4px 16px ${sirket.renk}25`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#F8FAFC';
                  e.currentTarget.style.border = `1px solid ${sirket.renk}33`;
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontWeight: '700', color: '#1E293B', fontSize: '14px', marginBottom: '6px' }}>
                  {sirket.ikon} {ks.ad}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>📍 {ks.ilce}, {ks.sehir}</div>
                {ks.telefon && <div style={{ fontSize: '12px', color: '#64748B', marginTop: '3px' }}>📞 {ks.telefon}</div>}
                <div style={{ marginTop: '10px', display: 'flex', gap: '6px' }}>
                  <span style={{
                    background: ks.aktif ? '#DCFCE7' : '#FEE2E2',
                    color: ks.aktif ? '#14532D' : '#991B1B',
                    padding: '3px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '700',
                  }}>
                    {ks.aktif ? '✅ Aktif' : '❌ Pasif'}
                  </span>
                  <span style={{ background: '#EDE9FE', color: '#5B21B6', padding: '3px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '700' }}>
                    {OGRENCILER.filter(o => o.subeId === ks.id).length} öğrenci
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Düzenle Modal */}
      <Modal acik={duzenleModal} kapat={() => setDuzenleModal(false)} baslik="✏️ Şube Düzenle" genislik="560px">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ gridColumn: '1/-1' }}><Inp label="Şube Adı" name="ad" /></div>
          <Inp label="Telefon" name="telefon" />
          <Inp label="Şehir" name="sehir" />
          <Inp label="İlçe" name="ilce" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>Durum</label>
            <select style={{ padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'white' }}
              value={form.aktif ? 'aktif' : 'pasif'} onChange={e => setForm(p => ({ ...p, aktif: e.target.value === 'aktif' }))}>
              <option value="aktif">✅ Aktif</option>
              <option value="pasif">❌ Pasif</option>
            </select>
          </div>
          <div style={{ gridColumn: '1/-1' }}><Inp label="Adres" name="adres" /></div>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => setDuzenleModal(false)}>İptal</button>
          <button className="btn btn-primary" onClick={subeGuncelle}>💾 Güncelle</button>
        </div>
      </Modal>
    </div>
  );
}
