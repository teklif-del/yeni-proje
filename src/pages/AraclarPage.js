import React, { useState, useMemo } from 'react';
import { ARACLAR, SUBELER, SIRKETLER } from '../data/mockData';
import Modal from '../components/Modal';

// ─── GİDER KATEGORİLERİ ────────────────────────────────────
const GIDER_KATEGORILERI = [
  { id: 'fenni_muayene',  label: 'Fenni Muayene',   ikon: '🔍', renk: '#3B82F6', bg: '#DBEAFE' },
  { id: 'trafik_sigortasi', label: 'Trafik Sigortası', ikon: '🛡️', renk: '#10B981', bg: '#DCFCE7' },
  { id: 'kasko',          label: 'Kasko',            ikon: '🔒', renk: '#8B5CF6', bg: '#EDE9FE' },
  { id: 'bakim',          label: 'Bakım / Servis',   ikon: '🔧', renk: '#F59E0B', bg: '#FEF9C3' },
  { id: 'trafik_cezasi',  label: 'Trafik Cezası',   ikon: '⚠️', renk: '#EF4444', bg: '#FEE2E2' },
  { id: 'lastik',         label: 'Lastik',           ikon: '⚙️', renk: '#06B6D4', bg: '#CFFAFE' },
  { id: 'akaryakit',      label: 'Akaryakıt',        ikon: '⛽', renk: '#F97316', bg: '#FEF3C7' },
  { id: 'yikama',         label: 'Araç Yıkama',      ikon: '🚿', renk: '#6366F1', bg: '#EEF2FF' },
  { id: 'park',           label: 'Park / Otopark',   ikon: '🅿️', renk: '#64748B', bg: '#F1F5F9' },
  { id: 'ekspertiz',      label: 'Ekspertiz',        ikon: '📋', renk: '#0EA5E9', bg: '#E0F2FE' },
  { id: 'onarim',         label: 'Onarım / Hasar',   ikon: '🛠️', renk: '#DC2626', bg: '#FEE2E2' },
  { id: 'diger',          label: 'Diğer',            ikon: '📌', renk: '#94A3B8', bg: '#F8FAFC' },
];

const kat = (id) => GIDER_KATEGORILERI.find(k => k.id === id) || GIDER_KATEGORILERI[GIDER_KATEGORILERI.length - 1];

// ─── BAŞLANGIÇ GİDER VERİSİ ────────────────────────────────
const BASLANGIC_GIDERLER = [
  { id: 1, aracId: 1, kategori: 'fenni_muayene',   tarih: '2025-01-10', tutar: 850,   aciklama: 'Yıllık fenni muayene', durum: 'odendi', sonrakiTarih: '2026-01-10' },
  { id: 2, aracId: 1, kategori: 'trafik_sigortasi', tarih: '2025-02-01', tutar: 4200,  aciklama: '1 yıllık trafik sigortası', durum: 'odendi', sonrakiTarih: '2026-02-01' },
  { id: 3, aracId: 1, kategori: 'kasko',           tarih: '2025-02-01', tutar: 18500, aciklama: '1 yıllık kasko', durum: 'odendi', sonrakiTarih: '2026-02-01' },
  { id: 4, aracId: 1, kategori: 'bakim',           tarih: '2025-01-15', tutar: 3200,  aciklama: 'Periyodik bakım - yağ, filtre', durum: 'odendi', sonrakiTarih: '2025-07-15' },
  { id: 5, aracId: 2, kategori: 'trafik_cezasi',   tarih: '2025-02-18', tutar: 1200,  aciklama: 'Hız ihlali cezası — 34 MMM 002', durum: 'bekliyor', sonrakiTarih: null },
  { id: 6, aracId: 2, kategori: 'fenni_muayene',   tarih: '2025-03-05', tutar: 850,   aciklama: 'Fenni muayene', durum: 'odendi', sonrakiTarih: '2026-03-05' },
  { id: 7, aracId: 2, kategori: 'lastik',          tarih: '2025-01-20', tutar: 6800,  aciklama: '4 adet kış lastiği', durum: 'odendi', sonrakiTarih: null },
  { id: 8, aracId: 3, kategori: 'kasko',           tarih: '2025-03-01', tutar: 9400,  aciklama: 'Motorsiklet kasko', durum: 'odendi', sonrakiTarih: '2026-03-01' },
  { id: 9, aracId: 4, kategori: 'bakim',           tarih: '2025-01-20', tutar: 8500,  aciklama: 'İş makinesi periyodik bakım', durum: 'odendi', sonrakiTarih: '2025-07-20' },
  { id:10, aracId: 4, kategori: 'onarim',          tarih: '2025-02-14', tutar: 22000, aciklama: 'Hidrolik sistem onarımı', durum: 'odendi', sonrakiTarih: null },
  { id:11, aracId: 1, kategori: 'trafik_cezasi',   tarih: '2025-03-10', tutar: 980,   aciklama: 'Park cezası', durum: 'bekliyor', sonrakiTarih: null },
  { id:12, aracId: 2, kategori: 'trafik_sigortasi', tarih: '2025-02-01', tutar: 3800,  aciklama: '1 yıllık trafik sigortası', durum: 'odendi', sonrakiTarih: '2026-02-01' },
];

const SINIFLAR = ['A', 'A1', 'A2', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'İş Makinesi', 'Forklift', 'Vinç', 'Ekskavatör', 'Diğer'];
const BOSFORM = { plaka:'', marka:'', model:'', yil:'', sinif:'B', km:'', sonBakim:'', subeId:'', aktif:true };
const BOS_GIDER = { aracId:'', kategori:'bakim', tarih: new Date().toISOString().split('T')[0], tutar:'', aciklama:'', durum:'odendi', sonrakiTarih:'' };

function InfoSatir({ etiket, deger, renk }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', background:'#F8FAFC', borderRadius:'8px', padding:'11px 14px', border:'1px solid #E2E8F0' }}>
      <span style={{ fontSize:'10px', color:'#64748B', marginBottom:'3px', textTransform:'uppercase', letterSpacing:'0.6px', fontWeight:'600' }}>{etiket}</span>
      <span style={{ fontSize:'14px', fontWeight:'600', color: renk||'#1E293B' }}>{deger||'—'}</span>
    </div>
  );
}

// ─── ARAÇ GİDERLER TABLOSU (detay modalda) ─────────────────
function AracGiderler({ arac, giderler, setGiderler }) {
  const [yeniGiderModal, setYeniGiderModal] = useState(false);
  const [giderForm, setGiderForm] = useState({ ...BOS_GIDER, aracId: arac.id });
  const [silOnay, setSilOnay] = useState(null);

  const aracGiderleri = giderler
    .filter(g => g.aracId === arac.id)
    .sort((a, b) => new Date(b.tarih) - new Date(a.tarih));

  const toplamGider  = aracGiderleri.reduce((s, g) => s + g.tutar, 0);
  const bekleyenAdet = aracGiderleri.filter(g => g.durum === 'bekliyor').length;
  const bekleyenTutar = aracGiderleri.filter(g => g.durum === 'bekliyor').reduce((s, g) => s + g.tutar, 0);

  // Kategori toplamları
  const katToplamlar = GIDER_KATEGORILERI.map(k => ({
    ...k,
    toplam: aracGiderleri.filter(g => g.kategori === k.id).reduce((s, g) => s + g.tutar, 0),
    adet: aracGiderleri.filter(g => g.kategori === k.id).length,
  })).filter(k => k.toplam > 0).sort((a, b) => b.toplam - a.toplam);

  // Yaklaşan/geçen tarihler
  const bugun = new Date();
  const yaklasan = aracGiderleri.filter(g => {
    if (!g.sonrakiTarih) return false;
    const gun = Math.ceil((new Date(g.sonrakiTarih) - bugun) / (1000 * 60 * 60 * 24));
    return gun <= 60;
  });

  const giderKaydet = () => {
    if (!giderForm.tutar || !giderForm.tarih) { alert('Tutar ve tarih zorunludur!'); return; }
    setGiderler(prev => [...prev, {
      ...giderForm,
      id: Date.now(),
      aracId: arac.id,
      tutar: parseFloat(giderForm.tutar) || 0,
    }]);
    setGiderForm({ ...BOS_GIDER, aracId: arac.id });
    setYeniGiderModal(false);
  };

  const giderOde = (id) => {
    setGiderler(prev => prev.map(g => g.id === id ? { ...g, durum: 'odendi' } : g));
  };

  const giderSil = (id) => {
    setGiderler(prev => prev.filter(g => g.id !== id));
    setSilOnay(null);
  };

  const Inp = ({ label, name, tip='text', options, tam }) => (
    <div style={{ display:'flex', flexDirection:'column', gap:'5px', gridColumn: tam ? '1/-1' : undefined }}>
      <label style={{ fontSize:'12px', fontWeight:'600', color:'#374151' }}>{label}</label>
      {options ? (
        <select style={{ padding:'9px 12px', border:'1.5px solid #E2E8F0', borderRadius:'8px', fontSize:'14px', outline:'none', background:'white' }}
          value={giderForm[name]||''} onChange={e => setGiderForm(p=>({...p,[name]:e.target.value}))}>
          <option value="">Seçin...</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input type={tip} style={{ padding:'9px 12px', border:'1.5px solid #E2E8F0', borderRadius:'8px', fontSize:'14px', outline:'none' }}
          value={giderForm[name]||''} onChange={e => setGiderForm(p=>({...p,[name]:e.target.value}))} placeholder={label} />
      )}
    </div>
  );

  return (
    <div>
      {/* Özet Kartlar */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px', marginBottom:'16px' }}>
        <div style={{ background:'linear-gradient(135deg,#FEE2E2,#FFF5F5)', borderRadius:'12px', padding:'14px', textAlign:'center', border:'1px solid #FCA5A5' }}>
          <div style={{ fontSize:'20px', fontWeight:'800', color:'#DC2626' }}>₺{toplamGider.toLocaleString('tr-TR')}</div>
          <div style={{ fontSize:'11px', color:'#EF4444', fontWeight:'600', marginTop:'2px' }}>TOPLAM GİDER</div>
        </div>
        <div style={{ background: bekleyenAdet > 0 ? 'linear-gradient(135deg,#FEF9C3,#FFFBF0)' : '#F8FAFC', borderRadius:'12px', padding:'14px', textAlign:'center', border: bekleyenAdet > 0 ? '1px solid #FDE68A' : '1px solid #E2E8F0' }}>
          <div style={{ fontSize:'20px', fontWeight:'800', color: bekleyenAdet>0?'#D97706':'#94A3B8' }}>{bekleyenAdet}</div>
          <div style={{ fontSize:'11px', color: bekleyenAdet>0?'#F59E0B':'#94A3B8', fontWeight:'600', marginTop:'2px' }}>BEKLEYEN ÖDEME</div>
        </div>
        <div style={{ background:'linear-gradient(135deg,#EDE9FE,#F5F3FF)', borderRadius:'12px', padding:'14px', textAlign:'center', border:'1px solid #C4B5FD' }}>
          <div style={{ fontSize:'20px', fontWeight:'800', color:'#6D28D9' }}>{aracGiderleri.length}</div>
          <div style={{ fontSize:'11px', color:'#7C3AED', fontWeight:'600', marginTop:'2px' }}>TOPLAM KAYIT</div>
        </div>
      </div>

      {/* Yaklaşan / Vadesi Geçen Uyarıları */}
      {yaklasan.length > 0 && (
        <div style={{ background:'linear-gradient(135deg,#FEF9C3,#FEF3C7)', border:'2px solid #FDE047', borderRadius:'10px', padding:'12px 14px', marginBottom:'14px' }}>
          <div style={{ fontWeight:'800', color:'#92400E', fontSize:'13px', marginBottom:'6px' }}>⚠️ Yaklaşan Yenileme Tarihleri</div>
          {yaklasan.map(g => {
            const k = kat(g.kategori);
            const gun = Math.ceil((new Date(g.sonrakiTarih) - bugun) / (1000*60*60*24));
            return (
              <div key={g.id} style={{ fontSize:'12px', color:'#78350F', display:'flex', alignItems:'center', gap:'6px', marginBottom:'3px' }}>
                <span>{k.ikon}</span>
                <span><b>{k.label}</b> — {gun<=0 ? <span style={{color:'#DC2626',fontWeight:'700'}}>Süresi doldu!</span> : `${gun} gün kaldı`} ({g.sonrakiTarih})</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Bekleyen ödemeler uyarısı */}
      {bekleyenTutar > 0 && (
        <div style={{ background:'linear-gradient(135deg,#FEE2E2,#FFF5F5)', border:'2px solid #FCA5A5', borderRadius:'10px', padding:'12px 14px', marginBottom:'14px' }}>
          <div style={{ fontWeight:'800', color:'#991B1B', fontSize:'13px' }}>
            🔴 {bekleyenAdet} adet bekleyen ödeme — Toplam: ₺{bekleyenTutar.toLocaleString('tr-TR')}
          </div>
        </div>
      )}

      {/* Kategori Özet Chips */}
      {katToplamlar.length > 0 && (
        <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'14px' }}>
          {katToplamlar.map(k => (
            <div key={k.id} style={{ background:k.bg, border:`1px solid`, borderColor:k.renk+'44', borderRadius:'20px', padding:'5px 12px', display:'flex', alignItems:'center', gap:'5px' }}>
              <span style={{ fontSize:'14px' }}>{k.ikon}</span>
              <span style={{ fontSize:'12px', fontWeight:'700', color:k.renk }}>{k.label}</span>
              <span style={{ fontSize:'12px', fontWeight:'800', color:k.renk }}>₺{k.toplam.toLocaleString('tr-TR')}</span>
            </div>
          ))}
        </div>
      )}

      {/* Başlık & Ekle Butonu */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
        <div style={{ fontWeight:'700', fontSize:'14px', color:'#374151' }}>📋 Gider Kayıtları</div>
        <button
          onClick={() => { setGiderForm({ ...BOS_GIDER, aracId: arac.id }); setYeniGiderModal(true); }}
          style={{ background:'linear-gradient(135deg,#3B82F6,#2563EB)', color:'white', border:'none', borderRadius:'8px', padding:'8px 16px', fontSize:'13px', fontWeight:'700', cursor:'pointer', boxShadow:'0 2px 8px rgba(59,130,246,0.3)' }}>
          + Gider Ekle
        </button>
      </div>

      {/* Gider Tablosu */}
      <div style={{ overflowX:'auto', borderRadius:'10px', border:'1px solid #E2E8F0' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
          <thead>
            <tr style={{ background:'linear-gradient(135deg,#1E3A5F,#0F2140)' }}>
              {['Kategori','Tarih','Tutar','Açıklama','Sonraki Tarih','Durum','İşlem'].map(h => (
                <th key={h} style={{ padding:'10px 12px', textAlign:'left', fontSize:'11px', fontWeight:'700', color:'#CBD5E1', whiteSpace:'nowrap', letterSpacing:'0.4px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {aracGiderleri.map((g, idx) => {
              const k = kat(g.kategori);
              const odendi = g.durum === 'odendi';
              const sonrakiGun = g.sonrakiTarih ? Math.ceil((new Date(g.sonrakiTarih) - bugun) / (1000*60*60*24)) : null;
              return (
                <tr key={g.id} style={{
                  borderBottom:'1px solid #F1F5F9',
                  background: !odendi
                    ? 'linear-gradient(90deg,#FFF9F0,white)'
                    : idx % 2 === 0 ? 'white' : '#FAFBFF',
                }}>
                  {/* Kategori */}
                  <td style={{ padding:'11px 12px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
                      <span style={{ fontSize:'18px' }}>{k.ikon}</span>
                      <span style={{ fontWeight:'700', color:k.renk, fontSize:'13px' }}>{k.label}</span>
                    </div>
                  </td>
                  {/* Tarih */}
                  <td style={{ padding:'11px 12px', fontSize:'13px', color:'#374151', fontWeight:'500' }}>
                    📅 {g.tarih}
                  </td>
                  {/* Tutar */}
                  <td style={{ padding:'11px 12px' }}>
                    <span style={{ fontWeight:'800', fontSize:'14px', color:'#DC2626' }}>
                      ₺{g.tutar.toLocaleString('tr-TR')}
                    </span>
                  </td>
                  {/* Açıklama */}
                  <td style={{ padding:'11px 12px', fontSize:'12px', color:'#64748B', maxWidth:'160px' }}>
                    {g.aciklama || '—'}
                  </td>
                  {/* Sonraki Tarih */}
                  <td style={{ padding:'11px 12px' }}>
                    {g.sonrakiTarih ? (
                      <div style={{ display:'flex', flexDirection:'column', gap:'2px' }}>
                        <span style={{ fontSize:'12px', color: sonrakiGun !== null && sonrakiGun<=0?'#DC2626':sonrakiGun!==null&&sonrakiGun<=60?'#D97706':'#374151', fontWeight: sonrakiGun!==null&&sonrakiGun<=60?'700':'400' }}>
                          {g.sonrakiTarih}
                        </span>
                        {sonrakiGun !== null && (
                          <span style={{ fontSize:'10px', fontWeight:'700',
                            color: sonrakiGun<=0?'#DC2626':sonrakiGun<=30?'#EF4444':sonrakiGun<=60?'#D97706':'#10B981',
                            background: sonrakiGun<=0?'#FEE2E2':sonrakiGun<=60?'#FEF9C3':'#DCFCE7',
                            padding:'2px 6px', borderRadius:'6px', display:'inline-block',
                          }}>
                            {sonrakiGun<=0 ? '❗ Süresi doldu' : `⏳ ${sonrakiGun} gün`}
                          </span>
                        )}
                      </div>
                    ) : <span style={{ color:'#CBD5E1', fontSize:'12px' }}>—</span>}
                  </td>
                  {/* Durum */}
                  <td style={{ padding:'11px 12px' }}>
                    {odendi ? (
                      <span style={{ background:'#DCFCE7', color:'#14532D', border:'1.5px solid #86EFAC', padding:'4px 10px', borderRadius:'16px', fontSize:'11px', fontWeight:'700' }}>
                        ✅ ÖDENDİ
                      </span>
                    ) : (
                      <span style={{ background:'#FEF9C3', color:'#713F12', border:'1.5px solid #FDE68A', padding:'4px 10px', borderRadius:'16px', fontSize:'11px', fontWeight:'700' }}>
                        ⏳ BEKLİYOR
                      </span>
                    )}
                  </td>
                  {/* İşlem */}
                  <td style={{ padding:'11px 12px' }}>
                    <div style={{ display:'flex', gap:'5px' }}>
                      {!odendi && (
                        <button onClick={() => giderOde(g.id)}
                          style={{ background:'linear-gradient(135deg,#10B981,#059669)', color:'white', border:'none', borderRadius:'7px', padding:'5px 12px', fontSize:'12px', fontWeight:'700', cursor:'pointer', whiteSpace:'nowrap' }}>
                          💳 Öde
                        </button>
                      )}
                      <button onClick={() => setSilOnay(g)}
                        style={{ background:'linear-gradient(135deg,#EF4444,#DC2626)', color:'white', border:'none', borderRadius:'7px', padding:'5px 9px', fontSize:'12px', cursor:'pointer' }}>
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {aracGiderleri.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign:'center', padding:'40px', color:'#64748B' }}>
                  Bu araç için henüz gider kaydı yok. <b>+ Gider Ekle</b> butonunu kullanın.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ─── Gider Ekle Modal ─── */}
      <Modal acik={yeniGiderModal} kapat={() => setYeniGiderModal(false)} baslik="+ Araç Gideri Ekle" genislik="560px">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          {/* Kategori Seçimi - büyük butonlar */}
          <div style={{ gridColumn:'1/-1' }}>
            <label style={{ fontSize:'12px', fontWeight:'700', color:'#374151', display:'block', marginBottom:'8px' }}>Gider Kategorisi</label>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'7px' }}>
              {GIDER_KATEGORILERI.map(k => (
                <button key={k.id}
                  onClick={() => setGiderForm(p => ({ ...p, kategori: k.id }))}
                  style={{
                    border: `2px solid ${giderForm.kategori===k.id ? k.renk : '#E2E8F0'}`,
                    background: giderForm.kategori===k.id ? k.bg : 'white',
                    borderRadius: '10px',
                    padding: '10px 6px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s',
                    transform: giderForm.kategori===k.id ? 'scale(1.04)' : 'scale(1)',
                  }}>
                  <div style={{ fontSize:'20px', marginBottom:'3px' }}>{k.ikon}</div>
                  <div style={{ fontSize:'10px', fontWeight:'700', color: giderForm.kategori===k.id ? k.renk : '#64748B', lineHeight:'1.2' }}>
                    {k.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Diğer alanlar */}
          <Inp label="Tarih" name="tarih" tip="date" />
          <Inp label="Tutar (₺)" name="tutar" tip="number" />
          <Inp label="Açıklama" name="aciklama" tam />
          <Inp label="Sonraki Yenileme Tarihi (Opsiyonel)" name="sonrakiTarih" tip="date" tam />
          <Inp label="Ödeme Durumu" name="durum"
            options={[{value:'odendi',label:'✅ ÖDENDİ'},{value:'bekliyor',label:'⏳ BEKLİYOR'}]} />
        </div>

        {/* Özet Önizleme */}
        {giderForm.tutar && (
          <div style={{ marginTop:'12px', background: kat(giderForm.kategori).bg, borderRadius:'10px', padding:'12px 14px', border:`1px solid ${kat(giderForm.kategori).renk}44`, display:'flex', alignItems:'center', gap:'10px' }}>
            <span style={{ fontSize:'24px' }}>{kat(giderForm.kategori).ikon}</span>
            <div>
              <div style={{ fontWeight:'700', color: kat(giderForm.kategori).renk, fontSize:'14px' }}>{kat(giderForm.kategori).label}</div>
              <div style={{ fontSize:'18px', fontWeight:'800', color:'#DC2626' }}>₺{parseFloat(giderForm.tutar||0).toLocaleString('tr-TR')}</div>
            </div>
            {giderForm.aciklama && <div style={{ fontSize:'12px', color:'#64748B', marginLeft:'auto', maxWidth:'160px', textAlign:'right' }}>{giderForm.aciklama}</div>}
          </div>
        )}

        <div style={{ display:'flex', gap:'8px', marginTop:'16px', justifyContent:'flex-end' }}>
          <button style={{ padding:'9px 20px', background:'#F1F5F9', border:'none', borderRadius:'8px', fontWeight:'600', cursor:'pointer', fontSize:'14px' }} onClick={() => setYeniGiderModal(false)}>İptal</button>
          <button style={{ padding:'9px 24px', background:'linear-gradient(135deg,#3B82F6,#2563EB)', color:'white', border:'none', borderRadius:'8px', fontWeight:'700', cursor:'pointer', fontSize:'14px', boxShadow:'0 3px 10px rgba(59,130,246,0.3)' }} onClick={giderKaydet}>✅ Kaydet</button>
        </div>
      </Modal>

      {/* ─── Gider Sil Onay ─── */}
      <Modal acik={!!silOnay} kapat={() => setSilOnay(null)} baslik="🗑️ Gideri Sil" genislik="380px">
        {silOnay && (
          <>
            <div style={{ textAlign:'center', padding:'8px 0 20px' }}>
              <div style={{ fontSize:'48px', marginBottom:'10px' }}>{kat(silOnay.kategori).ikon}</div>
              <p style={{ fontSize:'15px', color:'#374151', fontWeight:'600' }}><b>{kat(silOnay.kategori).label}</b> kaydını silmek istiyor musunuz?</p>
              <p style={{ fontSize:'18px', fontWeight:'800', color:'#DC2626', marginTop:'8px' }}>₺{silOnay.tutar.toLocaleString('tr-TR')}</p>
              <p style={{ fontSize:'12px', color:'#EF4444', marginTop:'6px' }}>Bu işlem geri alınamaz!</p>
            </div>
            <div style={{ display:'flex', gap:'8px' }}>
              <button style={{ flex:1, padding:'10px', background:'#F1F5F9', border:'none', borderRadius:'8px', fontWeight:'600', cursor:'pointer' }} onClick={() => setSilOnay(null)}>Vazgeç</button>
              <button style={{ flex:1, padding:'10px', background:'linear-gradient(135deg,#EF4444,#DC2626)', color:'white', border:'none', borderRadius:'8px', fontWeight:'700', cursor:'pointer' }} onClick={() => giderSil(silOnay.id)}>🗑️ Evet, Sil</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  ANA SAYFA
// ═══════════════════════════════════════════════════════════
export default function AraclarPage() {
  const [liste, setListe] = useState(ARACLAR);
  const [giderler, setGiderler] = useState(BASLANGIC_GIDERLER);
  const [aramaMetni, setAramaMetni] = useState('');
  const [aktifTab, setAktifTab] = useState('araclar');
  const [giderFiltresi, setGiderFiltresi] = useState('tumu');

  // Modallar
  const [detayModal, setDetayModal]   = useState(null);
  const [detaySekme, setDetaySekme]   = useState('bilgiler');
  const [duzenleModal, setDuzenleModal] = useState(null);
  const [yeniModal, setYeniModal]     = useState(false);
  const [bakimModal, setBakimModal]   = useState(null);
  const [silOnay, setSilOnay]         = useState(null);
  const [form, setForm]               = useState(BOSFORM);
  const [bakimNotu, setBakimNotu]     = useState('');

  // Hesaplar
  const toplamGider = useMemo(() => giderler.reduce((s, g) => s + g.tutar, 0), [giderler]);
  const bekleyenOdemeler = useMemo(() => giderler.filter(g => g.durum === 'bekliyor'), [giderler]);

  const yaklasanlar = useMemo(() => giderler.filter(g => {
    if (!g.sonrakiTarih) return false;
    const gun = Math.ceil((new Date(g.sonrakiTarih) - new Date()) / (1000*60*60*24));
    return gun <= 60;
  }), [giderler]);

  // Kategori bazlı toplam (tüm araçlar)
  const katToplamlarGenel = useMemo(() =>
    GIDER_KATEGORILERI.map(k => ({
      ...k,
      toplam: giderler.filter(g => g.kategori === k.id).reduce((s, g) => s + g.tutar, 0),
      adet: giderler.filter(g => g.kategori === k.id).length,
    })).filter(k => k.toplam > 0).sort((a, b) => b.toplam - a.toplam),
  [giderler]);

  // Araç bazlı toplam
  const aracGiderToplam = (aracId) => giderler.filter(g => g.aracId === aracId).reduce((s, g) => s + g.tutar, 0);

  const filtrelenenler = liste.filter(a =>
    aramaMetni === '' ||
    a.plaka.toLowerCase().includes(aramaMetni.toLowerCase()) ||
    a.marka.toLowerCase().includes(aramaMetni.toLowerCase()) ||
    (a.model||'').toLowerCase().includes(aramaMetni.toLowerCase())
  );

  // Gider listesi filtreleme
  const filtreliGiderler = useMemo(() => {
    let g = [...giderler].sort((a, b) => new Date(b.tarih) - new Date(a.tarih));
    if (giderFiltresi !== 'tumu') g = g.filter(x => x.kategori === giderFiltresi);
    return g;
  }, [giderler, giderFiltresi]);

  const kaydet = () => {
    if (!form.plaka || !form.marka) { alert('Plaka ve Marka zorunludur!'); return; }
    if (duzenleModal) {
      setListe(prev => prev.map(a => a.id === duzenleModal.id
        ? { ...duzenleModal, ...form, subeId:parseInt(form.subeId)||0, km:parseInt(form.km)||0, yil:parseInt(form.yil)||0 }
        : a));
      setDuzenleModal(null);
    } else {
      setListe(prev => [{ ...form, id:Date.now(), subeId:parseInt(form.subeId)||0, km:parseInt(form.km)||0, yil:parseInt(form.yil)||0, aktif:true }, ...prev]);
      setYeniModal(false);
    }
    setForm(BOSFORM);
  };

  const bakimKaydet = () => {
    const bugun = new Date().toISOString().split('T')[0];
    setListe(prev => prev.map(a => a.id === bakimModal.id ? { ...a, sonBakim:bugun, aktif:true } : a));
    if (bakimNotu) {
      setGiderler(prev => [...prev, {
        id: Date.now(), aracId: bakimModal.id, kategori: 'bakim',
        tarih: bugun, tutar: 0, aciklama: bakimNotu, durum: 'odendi', sonrakiTarih: '',
      }]);
    }
    setBakimModal(null); setBakimNotu('');
  };

  const sil = (id) => { setListe(prev => prev.filter(a => a.id !== id)); setSilOnay(null); setDetayModal(null); };
  const acDuzenle = (a) => { setForm({ ...a, subeId:a.subeId?.toString(), km:a.km?.toString(), yil:a.yil?.toString() }); setDuzenleModal(a); };

  const FormAlani = ({ label, name, tip='text', options }) => (
    <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
      <label style={{ fontSize:'12px', fontWeight:'600', color:'#374151' }}>{label}</label>
      {options ? (
        <select style={{ padding:'9px 12px', border:'1.5px solid #E2E8F0', borderRadius:'8px', fontSize:'14px', outline:'none', background:'white' }}
          value={form[name]||''} onChange={e => setForm(p=>({...p,[name]:e.target.value}))}>
          <option value="">Seçin...</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input type={tip} style={{ padding:'9px 12px', border:'1.5px solid #E2E8F0', borderRadius:'8px', fontSize:'14px', outline:'none' }}
          value={form[name]||''} onChange={e => setForm(p=>({...p,[name]:e.target.value}))} placeholder={label} />
      )}
    </div>
  );

  // ─────────────────────────────────────────────────────────
  return (
    <div>
      <div className="sayfa-baslik">
        <h1>🚗 Araçlar & Ekipmanlar</h1>
        <p>Araç filosu, gider takibi ve bakım yönetimi</p>
      </div>

      {/* Özet Kartlar */}
      <div className="ozet-kartlar">
        {[
          { ikon:'🚗', label:'Toplam Araç',       deger: liste.length,                                           bg:'#DBEAFE', renk:'#1D4ED8' },
          { ikon:'✅', label:'Aktif Araç',          deger: liste.filter(a=>a.aktif).length,                       bg:'#DCFCE7', renk:'#15803D' },
          { ikon:'🔧', label:'Bakımda',             deger: liste.filter(a=>!a.aktif).length,                      bg:'#FEF9C3', renk:'#B45309' },
          { ikon:'💰', label:'Toplam Araç Gideri',  deger:`₺${toplamGider.toLocaleString('tr-TR')}`,              bg:'#FEE2E2', renk:'#DC2626' },
          { ikon:'⏳', label:'Bekleyen Ödeme',       deger: bekleyenOdemeler.length,                               bg:'#FEF9C3', renk:'#D97706' },
          { ikon:'⚠️', label:'Yaklaşan Yenileme',   deger: yaklasanlar.length,                                    bg:'#FEE2E2', renk:'#EF4444' },
          { ikon:'🏗️', label:'İş Makinesi',         deger: liste.filter(a=>a.sinif==='İş Makinesi').length,       bg:'#EDE9FE', renk:'#6D28D9' },
          { ikon:'⚠️', label:'Trafik Cezası',       deger: `₺${giderler.filter(g=>g.kategori==='trafik_cezasi').reduce((s,g)=>s+g.tutar,0).toLocaleString('tr-TR')}`, bg:'#FEE2E2', renk:'#DC2626' },
        ].map(k => (
          <div key={k.label} className="ozet-kart">
            <div className="kart-ikon" style={{ background:k.bg }}>{k.ikon}</div>
            <div className="kart-bilgi"><h3 style={{ color:k.renk, fontSize:'15px' }}>{k.deger}</h3><p>{k.label}</p></div>
          </div>
        ))}
      </div>

      {/* Bekleyen ödeme uyarısı */}
      {bekleyenOdemeler.length > 0 && (
        <div style={{ background:'linear-gradient(135deg,#FEF9C3,#FEF3C7)', border:'2px solid #FDE047', borderRadius:'12px', padding:'12px 18px', marginBottom:'14px', display:'flex', alignItems:'center', gap:'12px' }}>
          <span style={{ fontSize:'24px' }}>⏳</span>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:'800', color:'#92400E', fontSize:'13px' }}>
              {bekleyenOdemeler.length} bekleyen araç ödemesi — ₺{bekleyenOdemeler.reduce((s,g)=>s+g.tutar,0).toLocaleString('tr-TR')}
            </div>
            <div style={{ fontSize:'12px', color:'#78350F', marginTop:'2px' }}>
              {bekleyenOdemeler.map(g => {
                const a = liste.find(x => x.id === g.aracId);
                return `${kat(g.kategori).ikon} ${a?.plaka} ${kat(g.kategori).label}`;
              }).join(' · ')}
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setAktifTab('giderler')}>Giderler →</button>
        </div>
      )}

      {/* Tab Bar */}
      <div className="tab-bar">
        <div className={`tab-item ${aktifTab==='araclar'?'aktif':''}`} onClick={()=>setAktifTab('araclar')}>🚗 Araç Listesi</div>
        <div className={`tab-item ${aktifTab==='giderler'?'aktif':''}`} onClick={()=>setAktifTab('giderler')}>
          💰 Tüm Giderler
          {bekleyenOdemeler.length > 0 && (
            <span style={{ marginLeft:'6px', background:'#EF4444', color:'white', borderRadius:'10px', padding:'1px 7px', fontSize:'11px', fontWeight:'700' }}>
              {bekleyenOdemeler.length}
            </span>
          )}
        </div>
        <div className={`tab-item ${aktifTab==='analiz'?'aktif':''}`} onClick={()=>setAktifTab('analiz')}>📊 Gider Analizi</div>
      </div>

      {/* ═══ ARAÇ LİSTESİ ═══ */}
      {aktifTab === 'araclar' && (
        <>
          <div className="filtre-bar">
            <input className="arama-input" placeholder="🔍 Plaka, marka veya model ara..." value={aramaMetni} onChange={e=>setAramaMetni(e.target.value)} />
            <button className="btn btn-primary" onClick={() => { setForm(BOSFORM); setYeniModal(true); }}>+ Araç Ekle</button>
          </div>
          <div className="panel">
            <div className="panel-baslik">
              <h3>🚗 Araç Listesi</h3>
              <span style={{ fontSize:'13px', color:'#64748B' }}>{filtrelenenler.length}/{liste.length} araç</span>
            </div>
            <div className="tablo-container">
              <table>
                <thead>
                  <tr>
                    <th>Plaka</th><th>Araç</th><th>Sınıf</th><th>Şube</th>
                    <th>KM</th><th>Son Bakım</th><th>Toplam Gider</th><th>Durum</th><th>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrelenenler.map(arac => {
                    const sube   = SUBELER.find(s => s.id === arac.subeId);
                    const sirket = SIRKETLER.find(s => s.id === sube?.sirketId);
                    const aTopGider = aracGiderToplam(arac.id);
                    const aBekleyen = giderler.filter(g=>g.aracId===arac.id&&g.durum==='bekliyor').length;
                    const aYaklasan = giderler.filter(g=>{
                      if(g.aracId!==arac.id||!g.sonrakiTarih) return false;
                      return Math.ceil((new Date(g.sonrakiTarih)-new Date())/(1000*60*60*24))<=60;
                    }).length;
                    return (
                      <tr key={arac.id}>
                        <td>
                          <div style={{ background:'#1E3A5F', color:'white', padding:'4px 10px', borderRadius:'6px', fontSize:'13px', fontWeight:'700', display:'inline-block', letterSpacing:'1px' }}>
                            {arac.plaka}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight:'700', fontSize:'14px' }}>{arac.marka} {arac.model}</div>
                          <div style={{ fontSize:'11px', color:'#64748B' }}>{arac.yil} Model</div>
                        </td>
                        <td><span style={{ background:'#DBEAFE', color:'#1D4ED8', padding:'3px 9px', borderRadius:'10px', fontSize:'12px', fontWeight:'700' }}>{arac.sinif}</span></td>
                        <td style={{ fontSize:'13px' }}>{sirket?.ikon} {sube?.ilce}</td>
                        <td style={{ fontSize:'13px', fontWeight:'600' }}>{arac.km?.toLocaleString('tr-TR')} km</td>
                        <td style={{ fontSize:'12px', color:'#374151' }}>{arac.sonBakim}</td>
                        <td>
                          <div>
                            <span style={{ fontWeight:'700', color:'#DC2626', fontSize:'13px' }}>₺{aTopGider.toLocaleString('tr-TR')}</span>
                            <div style={{ display:'flex', gap:'4px', marginTop:'3px' }}>
                              {aBekleyen>0 && <span style={{ background:'#FEF9C3', color:'#713F12', padding:'1px 6px', borderRadius:'6px', fontSize:'10px', fontWeight:'700' }}>⏳{aBekleyen}</span>}
                              {aYaklasan>0 && <span style={{ background:'#FEE2E2', color:'#7F1D1D', padding:'1px 6px', borderRadius:'6px', fontSize:'10px', fontWeight:'700' }}>⚠️{aYaklasan}</span>}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ padding:'4px 10px', borderRadius:'10px', fontSize:'12px', fontWeight:'700',
                            background: arac.aktif?'#DCFCE7':'#FEF9C3',
                            color: arac.aktif?'#14532D':'#713F12' }}>
                            {arac.aktif ? '✅ Aktif' : '🔧 Bakımda'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display:'flex', gap:'4px' }}>
                            <button className="btn btn-secondary btn-sm" title="Detay & Giderler"
                              onClick={() => { setDetayModal(arac); setDetaySekme('bilgiler'); }}>👁</button>
                            <button className="btn btn-secondary btn-sm" title="Düzenle"
                              onClick={() => acDuzenle(arac)}>✏️</button>
                            <button className="btn btn-secondary btn-sm" title="Bakım Kaydı"
                              onClick={() => { setBakimModal(arac); setBakimNotu(''); }}>🔧</button>
                            <button className="btn btn-danger btn-sm" title="Sil"
                              onClick={() => setSilOnay(arac)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ═══ TÜM GİDERLER ═══ */}
      {aktifTab === 'giderler' && (
        <div className="panel">
          <div className="panel-baslik">
            <h3>💰 Tüm Araç Giderleri</h3>
            <span style={{ fontWeight:'700', color:'#DC2626', fontSize:'14px' }}>₺{toplamGider.toLocaleString('tr-TR')}</span>
          </div>

          {/* Kategori Filtresi */}
          <div style={{ display:'flex', gap:'7px', flexWrap:'wrap', padding:'0 0 14px' }}>
            <button onClick={() => setGiderFiltresi('tumu')}
              style={{ padding:'6px 14px', borderRadius:'20px', border:'1.5px solid', fontSize:'12px', fontWeight:'700', cursor:'pointer',
                background: giderFiltresi==='tumu'?'#1E3A5F':'white',
                borderColor: giderFiltresi==='tumu'?'#1E3A5F':'#E2E8F0',
                color: giderFiltresi==='tumu'?'white':'#64748B' }}>
              Tümü ({giderler.length})
            </button>
            {katToplamlarGenel.map(k => (
              <button key={k.id} onClick={() => setGiderFiltresi(k.id)}
                style={{ padding:'6px 14px', borderRadius:'20px', border:'1.5px solid', fontSize:'12px', fontWeight:'700', cursor:'pointer',
                  background: giderFiltresi===k.id ? k.renk : k.bg,
                  borderColor: k.renk,
                  color: giderFiltresi===k.id ? 'white' : k.renk }}>
                {k.ikon} {k.label} ({k.adet})
              </button>
            ))}
          </div>

          <div className="tablo-container">
            <table>
              <thead>
                <tr>
                  <th>Araç</th><th>Kategori</th><th>Tarih</th><th>Tutar</th>
                  <th>Açıklama</th><th>Sonraki Tarih</th><th>Durum</th><th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filtreliGiderler.map(g => {
                  const a = liste.find(x => x.id === g.aracId);
                  const k = kat(g.kategori);
                  const odendi = g.durum === 'odendi';
                  const sonrakiGun = g.sonrakiTarih ? Math.ceil((new Date(g.sonrakiTarih)-new Date())/(1000*60*60*24)) : null;
                  return (
                    <tr key={g.id} style={{ background: !odendi?'linear-gradient(90deg,#FFFBF0,white)':'white' }}>
                      <td>
                        <div style={{ background:'#1E3A5F', color:'white', padding:'3px 8px', borderRadius:'5px', fontSize:'12px', fontWeight:'700', display:'inline-block', letterSpacing:'1px' }}>
                          {a?.plaka}
                        </div>
                        <div style={{ fontSize:'11px', color:'#64748B', marginTop:'3px' }}>{a?.marka} {a?.model}</div>
                      </td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                          <span style={{ fontSize:'16px' }}>{k.ikon}</span>
                          <span style={{ fontWeight:'700', color:k.renk, fontSize:'12px' }}>{k.label}</span>
                        </div>
                      </td>
                      <td style={{ fontSize:'13px' }}>📅 {g.tarih}</td>
                      <td style={{ fontWeight:'800', color:'#DC2626', fontSize:'14px' }}>₺{g.tutar.toLocaleString('tr-TR')}</td>
                      <td style={{ fontSize:'12px', color:'#64748B', maxWidth:'140px' }}>{g.aciklama||'—'}</td>
                      <td>
                        {g.sonrakiTarih ? (
                          <div>
                            <div style={{ fontSize:'12px', color: sonrakiGun!==null&&sonrakiGun<=0?'#DC2626':sonrakiGun!==null&&sonrakiGun<=60?'#D97706':'#374151', fontWeight: sonrakiGun!==null&&sonrakiGun<=60?'700':'400' }}>{g.sonrakiTarih}</div>
                            {sonrakiGun !== null && (
                              <span style={{ fontSize:'10px', fontWeight:'700',
                                color: sonrakiGun<=0?'#DC2626':sonrakiGun<=60?'#D97706':'#15803D',
                                background: sonrakiGun<=0?'#FEE2E2':sonrakiGun<=60?'#FEF9C3':'#DCFCE7',
                                padding:'1px 5px', borderRadius:'5px' }}>
                                {sonrakiGun<=0?'❗ Doldu':`⏳ ${sonrakiGun}g`}
                              </span>
                            )}
                          </div>
                        ) : '—'}
                      </td>
                      <td>
                        {odendi
                          ? <span style={{ background:'#DCFCE7', color:'#14532D', padding:'4px 10px', borderRadius:'14px', fontSize:'11px', fontWeight:'700' }}>✅ ÖDENDİ</span>
                          : <span style={{ background:'#FEF9C3', color:'#713F12', padding:'4px 10px', borderRadius:'14px', fontSize:'11px', fontWeight:'700' }}>⏳ BEKLİYOR</span>}
                      </td>
                      <td>
                        <div style={{ display:'flex', gap:'4px' }}>
                          {!odendi && (
                            <button onClick={() => setGiderler(prev=>prev.map(x=>x.id===g.id?{...x,durum:'odendi'}:x))}
                              style={{ background:'linear-gradient(135deg,#10B981,#059669)', color:'white', border:'none', borderRadius:'6px', padding:'5px 10px', fontSize:'12px', fontWeight:'700', cursor:'pointer' }}>
                              💳 Öde
                            </button>
                          )}
                          <button onClick={() => setGiderler(prev=>prev.filter(x=>x.id!==g.id))}
                            style={{ background:'linear-gradient(135deg,#EF4444,#DC2626)', color:'white', border:'none', borderRadius:'6px', padding:'5px 8px', fontSize:'12px', cursor:'pointer' }}>
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtreliGiderler.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign:'center', padding:'40px', color:'#64748B' }}>Gider kaydı bulunamadı.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ GİDER ANALİZİ ═══ */}
      {aktifTab === 'analiz' && (
        <div>
          {/* Kategori Kart Analizi */}
          <div className="panel" style={{ marginBottom:'16px' }}>
            <div className="panel-baslik"><h3>📊 Kategori Bazlı Gider Analizi</h3></div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'12px', padding:'0 0 4px' }}>
              {GIDER_KATEGORILERI.map(k => {
                const toplamK = giderler.filter(g=>g.kategori===k.id).reduce((s,g)=>s+g.tutar,0);
                const adetK   = giderler.filter(g=>g.kategori===k.id).length;
                const oran    = toplamGider > 0 ? Math.round((toplamK/toplamGider)*100) : 0;
                if (toplamK === 0) return null;
                return (
                  <div key={k.id} style={{ background:k.bg, border:`2px solid ${k.renk}33`, borderRadius:'14px', padding:'16px', position:'relative', overflow:'hidden' }}>
                    <div style={{ position:'absolute', top:0, left:0, height:'4px', background:k.renk, width:`${oran}%`, borderRadius:'14px 14px 0 0', transition:'width 0.5s' }} />
                    <div style={{ fontSize:'28px', marginBottom:'8px' }}>{k.ikon}</div>
                    <div style={{ fontWeight:'800', color:k.renk, fontSize:'13px', marginBottom:'4px' }}>{k.label}</div>
                    <div style={{ fontWeight:'900', color:'#1E293B', fontSize:'20px' }}>₺{toplamK.toLocaleString('tr-TR')}</div>
                    <div style={{ fontSize:'12px', color:'#64748B', marginTop:'2px' }}>{adetK} kayıt · %{oran}</div>
                    {/* İlerleme çubuğu */}
                    <div style={{ marginTop:'10px', background:'rgba(0,0,0,0.08)', borderRadius:'20px', height:'5px' }}>
                      <div style={{ height:'5px', background:k.renk, borderRadius:'20px', width:`${oran}%`, transition:'width 0.5s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Araç Bazlı Analiz */}
          <div className="panel">
            <div className="panel-baslik"><h3>🚗 Araç Bazlı Gider Analizi</h3></div>
            <div className="tablo-container">
              <table>
                <thead>
                  <tr>
                    <th>Araç</th>
                    <th>Fenni Muayene</th>
                    <th>Sigorta</th>
                    <th>Kasko</th>
                    <th>Bakım</th>
                    <th>Trafik Cezası</th>
                    <th>Diğer</th>
                    <th>TOPLAM</th>
                  </tr>
                </thead>
                <tbody>
                  {liste.map(a => {
                    const ag = giderler.filter(g=>g.aracId===a.id);
                    const fm   = ag.filter(g=>g.kategori==='fenni_muayene').reduce((s,g)=>s+g.tutar,0);
                    const sig  = ag.filter(g=>g.kategori==='trafik_sigortasi').reduce((s,g)=>s+g.tutar,0);
                    const kas  = ag.filter(g=>g.kategori==='kasko').reduce((s,g)=>s+g.tutar,0);
                    const bkm  = ag.filter(g=>['bakim','onarim'].includes(g.kategori)).reduce((s,g)=>s+g.tutar,0);
                    const cez  = ag.filter(g=>g.kategori==='trafik_cezasi').reduce((s,g)=>s+g.tutar,0);
                    const diger= ag.filter(g=>!['fenni_muayene','trafik_sigortasi','kasko','bakim','onarim','trafik_cezasi'].includes(g.kategori)).reduce((s,g)=>s+g.tutar,0);
                    const top  = ag.reduce((s,g)=>s+g.tutar,0);
                    const para = (v) => v > 0 ? `₺${v.toLocaleString('tr-TR')}` : <span style={{color:'#CBD5E1'}}>—</span>;
                    return (
                      <tr key={a.id}>
                        <td>
                          <div style={{ background:'#1E3A5F', color:'white', padding:'3px 8px', borderRadius:'5px', fontSize:'12px', fontWeight:'700', display:'inline-block', letterSpacing:'1px', marginBottom:'3px' }}>{a.plaka}</div>
                          <div style={{ fontSize:'11px', color:'#64748B' }}>{a.marka} {a.model}</div>
                        </td>
                        <td style={{ fontWeight:'600', color:'#1D4ED8' }}>{para(fm)}</td>
                        <td style={{ fontWeight:'600', color:'#15803D' }}>{para(sig)}</td>
                        <td style={{ fontWeight:'600', color:'#6D28D9' }}>{para(kas)}</td>
                        <td style={{ fontWeight:'600', color:'#B45309' }}>{para(bkm)}</td>
                        <td style={{ fontWeight:'700', color: cez>0?'#DC2626':'#CBD5E1' }}>{para(cez)}</td>
                        <td style={{ fontWeight:'600', color:'#64748B' }}>{para(diger)}</td>
                        <td>
                          <span style={{ fontWeight:'900', fontSize:'15px', color:'#DC2626' }}>₺{top.toLocaleString('tr-TR')}</span>
                        </td>
                      </tr>
                    );
                  })}
                  {/* Genel Toplam */}
                  <tr style={{ background:'#1E3A5F' }}>
                    <td style={{ fontWeight:'800', color:'white', fontSize:'13px' }}>GENEL TOPLAM</td>
                    {['fenni_muayene','trafik_sigortasi','kasko'].concat([['bakim','onarim']]).concat(['trafik_cezasi']).map((kat,i) => {
                      const arr = Array.isArray(kat) ? kat : [kat];
                      const t = giderler.filter(g=>arr.includes(g.kategori)).reduce((s,g)=>s+g.tutar,0);
                      return <td key={i} style={{ fontWeight:'800', color:'#6EE7B7', fontSize:'13px' }}>₺{t.toLocaleString('tr-TR')}</td>;
                    })}
                    <td style={{ fontWeight:'800', color:'#6EE7B7', fontSize:'13px' }}>—</td>
                    <td style={{ fontWeight:'900', color:'#FDE68A', fontSize:'15px' }}>₺{toplamGider.toLocaleString('tr-TR')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══ ARAÇ DETAY MODAL ═══ */}
      <Modal
        acik={!!detayModal}
        kapat={() => setDetayModal(null)}
        baslik={`🚗 ${detayModal?.plaka} — ${detayModal?.marka} ${detayModal?.model}`}
        genislik="860px"
      >
        {detayModal && (() => {
          const arac   = liste.find(a => a.id === detayModal.id) || detayModal;
          const sube   = SUBELER.find(s => s.id === arac.subeId);
          const sirket = SIRKETLER.find(s => s.id === sube?.sirketId);
          return (
            <>
              {/* Üst Kart */}
              <div style={{ display:'flex', gap:'16px', background:'linear-gradient(135deg,#1E3A5F,#0F2140)', borderRadius:'14px', padding:'18px', marginBottom:'16px', alignItems:'center' }}>
                <span style={{ fontSize:'40px' }}>🚗</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'22px', fontWeight:'800', color:'white', letterSpacing:'1px' }}>{arac.plaka}</div>
                  <div style={{ fontSize:'14px', color:'#93C5FD', marginTop:'3px' }}>{arac.marka} {arac.model} — {arac.yil} Model</div>
                  {sube && <div style={{ fontSize:'12px', color:'#94A3B8', marginTop:'3px' }}>{sirket?.ikon} {sube.ilce} — {sube.ad}</div>}
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:'22px', fontWeight:'800', color:'#FCA5A5' }}>₺{aracGiderToplam(arac.id).toLocaleString('tr-TR')}</div>
                  <div style={{ fontSize:'11px', color:'#94A3B8' }}>Toplam Gider</div>
                  <span style={{ marginTop:'6px', display:'inline-block', padding:'4px 12px', borderRadius:'10px', fontSize:'12px', fontWeight:'700',
                    background: arac.aktif?'rgba(21,128,61,0.3)':'rgba(245,158,11,0.3)',
                    color: arac.aktif?'#6EE7B7':'#FDE68A',
                    border:`1px solid ${arac.aktif?'#6EE7B7':'#FDE68A'}` }}>
                    {arac.aktif ? '✅ Aktif' : '🔧 Bakımda'}
                  </span>
                </div>
              </div>

              {/* Sekmeler */}
              <div className="tab-bar" style={{ marginBottom:'16px' }}>
                {[
                  { id:'bilgiler', label:'📋 Araç Bilgileri' },
                  { id:'giderler', label:'💰 Giderler' },
                ].map(t => (
                  <div key={t.id} className={`tab-item ${detaySekme===t.id?'aktif':''}`} onClick={()=>setDetaySekme(t.id)}>{t.label}</div>
                ))}
              </div>

              {/* BİLGİLER SEKMESİ */}
              {detaySekme === 'bilgiler' && (
                <div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', marginBottom:'16px' }}>
                    <InfoSatir etiket="Plaka"        deger={arac.plaka} />
                    <InfoSatir etiket="Sınıf"        deger={arac.sinif} />
                    <InfoSatir etiket="Marka / Model" deger={`${arac.marka} ${arac.model}`} />
                    <InfoSatir etiket="Model Yılı"   deger={arac.yil} />
                    <InfoSatir etiket="Kilometre"    deger={`${arac.km?.toLocaleString('tr-TR')} km`} />
                    <InfoSatir etiket="Son Bakım"    deger={arac.sonBakim} />
                    <InfoSatir etiket="Şube"         deger={sube ? `${sirket?.ikon} ${sube.ad}` : '—'} />
                    <InfoSatir etiket="Durum"        deger={arac.aktif?'✅ Aktif':'🔧 Bakımda'} renk={arac.aktif?'#15803D':'#B45309'} />
                    <InfoSatir etiket="Toplam Gider" deger={`₺${aracGiderToplam(arac.id).toLocaleString('tr-TR')}`} renk="#DC2626" />
                  </div>
                  <div style={{ display:'flex', gap:'8px' }}>
                    <button className="btn btn-primary" style={{ flex:1 }} onClick={() => { setDetayModal(null); acDuzenle(arac); }}>✏️ Düzenle</button>
                    <button className="btn btn-secondary" style={{ flex:1 }} onClick={() => { setDetayModal(null); setBakimModal(arac); setBakimNotu(''); }}>🔧 Bakım Kaydı</button>
                    <button className="btn btn-secondary" style={{ flex:1 }} onClick={() => setDetaySekme('giderler')}>💰 Giderleri Gör</button>
                    <button className="btn btn-danger btn-sm" onClick={() => { setDetayModal(null); setSilOnay(arac); }}>🗑️</button>
                  </div>
                </div>
              )}

              {/* GİDERLER SEKMESİ */}
              {detaySekme === 'giderler' && (
                <AracGiderler arac={arac} giderler={giderler} setGiderler={setGiderler} />
              )}
            </>
          );
        })()}
      </Modal>

      {/* ═══ YENİ / DÜZENLE ARAÇ MODAL ═══ */}
      <Modal
        acik={yeniModal || !!duzenleModal}
        kapat={() => { setYeniModal(false); setDuzenleModal(null); setForm(BOSFORM); }}
        baslik={duzenleModal ? '✏️ Araç Düzenle' : '+ Yeni Araç Ekle'}
        genislik="580px"
      >
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          <FormAlani label="Plaka *" name="plaka" />
          <FormAlani label="Marka *" name="marka" />
          <FormAlani label="Model" name="model" />
          <FormAlani label="Model Yılı" name="yil" tip="number" />
          <FormAlani label="Sınıf" name="sinif" options={SINIFLAR.map(s=>({value:s,label:s}))} />
          <FormAlani label="Kilometre" name="km" tip="number" />
          <FormAlani label="Şube" name="subeId"
            options={SUBELER.map(s=>({ value:s.id, label:`${SIRKETLER.find(sr=>sr.id===s.sirketId)?.ikon||''} ${s.ad}` }))} />
          <FormAlani label="Son Bakım Tarihi" name="sonBakim" tip="date" />
          <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
            <label style={{ fontSize:'12px', fontWeight:'600', color:'#374151' }}>Durum</label>
            <select style={{ padding:'9px 12px', border:'1.5px solid #E2E8F0', borderRadius:'8px', fontSize:'14px', outline:'none', background:'white' }}
              value={form.aktif ? 'aktif' : 'bakim'}
              onChange={e => setForm(p=>({...p,aktif:e.target.value==='aktif'}))}>
              <option value="aktif">✅ Aktif</option>
              <option value="bakim">🔧 Bakımda</option>
            </select>
          </div>
        </div>
        <div style={{ display:'flex', gap:'8px', marginTop:'20px', justifyContent:'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => { setYeniModal(false); setDuzenleModal(null); setForm(BOSFORM); }}>İptal</button>
          <button className="btn btn-primary" onClick={kaydet}>{duzenleModal ? '💾 Güncelle' : '✅ Kaydet'}</button>
        </div>
      </Modal>

      {/* ═══ BAKIM MODAL ═══ */}
      <Modal acik={!!bakimModal} kapat={() => { setBakimModal(null); setBakimNotu(''); }} baslik="🔧 Bakım Kaydı" genislik="440px">
        {bakimModal && (
          <>
            <div style={{ background:'linear-gradient(135deg,#FFF7ED,#FEF3C7)', border:'1px solid #FED7AA', borderRadius:'12px', padding:'14px', marginBottom:'18px' }}>
              <div style={{ fontWeight:'800', fontSize:'15px', marginBottom:'4px' }}>{bakimModal.plaka} — {bakimModal.marka} {bakimModal.model}</div>
              <div style={{ fontSize:'13px', color:'#64748B' }}>Son Bakım: {bakimModal.sonBakim || '—'} · {bakimModal.km?.toLocaleString('tr-TR')} km</div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'6px', marginBottom:'16px' }}>
              <label style={{ fontSize:'12px', fontWeight:'700', color:'#374151' }}>Yapılan İşlemler / Bakım Notu</label>
              <textarea
                style={{ padding:'10px 12px', border:'1.5px solid #E2E8F0', borderRadius:'8px', minHeight:'100px', resize:'vertical', fontSize:'14px', fontFamily:'inherit', outline:'none' }}
                placeholder="Yağ değişimi, filtre, fren, vb. yapılan tüm işlemleri yazın..."
                value={bakimNotu}
                onChange={e => setBakimNotu(e.target.value)}
              />
            </div>
            <p style={{ fontSize:'13px', color:'#64748B', marginBottom:'16px' }}>
              ✅ Bakım tarihi <b>{new Date().toLocaleDateString('tr-TR')}</b> olarak kaydedilecek.
              {bakimNotu && ' Gider kaydı da otomatik oluşturulacak.'}
            </p>
            <div style={{ display:'flex', gap:'8px' }}>
              <button className="btn btn-secondary" style={{ flex:1 }} onClick={() => { setBakimModal(null); setBakimNotu(''); }}>İptal</button>
              <button className="btn btn-primary" style={{ flex:1 }} onClick={bakimKaydet}>🔧 Bakımı Kaydet</button>
            </div>
          </>
        )}
      </Modal>

      {/* ═══ SİL ONAY ═══ */}
      <Modal acik={!!silOnay} kapat={() => setSilOnay(null)} baslik="🗑️ Araç Sil" genislik="400px">
        {silOnay && (
          <>
            <div style={{ textAlign:'center', padding:'10px 0 24px' }}>
              <div style={{ fontSize:'52px', marginBottom:'12px' }}>⚠️</div>
              <p style={{ fontSize:'16px', fontWeight:'600', color:'#374151' }}>
                <b>{silOnay.plaka} — {silOnay.marka} {silOnay.model}</b> aracını silmek istediğinizden emin misiniz?
              </p>
              <p style={{ fontSize:'13px', color:'#EF4444', marginTop:'8px' }}>Bu işlem geri alınamaz!</p>
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              <button className="btn btn-secondary" style={{ flex:1 }} onClick={() => setSilOnay(null)}>Vazgeç</button>
              <button className="btn btn-danger" style={{ flex:1 }} onClick={() => sil(silOnay.id)}>🗑️ Evet, Sil</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
