import React, { useState, useMemo } from 'react';
import { OGRENCILER, SUBELER, SIRKETLER } from '../data/mockData';
import Modal from '../components/Modal';

// ─── PSİKOTEKNİK TEST KATEGORİLERİ ────────────────────────
const PSİKO_TESTLER = [
  { id: 'dikkat',       label: 'Dikkat & Konsantrasyon', ikon: '🎯' },
  { id: 'reaksiyon',    label: 'Reaksiyon Süresi',        ikon: '⚡' },
  { id: 'gorme',        label: 'Görme / Algı',            ikon: '👁️' },
  { id: 'koordinasyon', label: 'El-Göz Koordinasyonu',    ikon: '🤝' },
  { id: 'stres',        label: 'Stres Toleransı',          ikon: '🧘' },
  { id: 'hafiza',       label: 'Hafıza & Oryantasyon',    ikon: '🧠' },
];

// Psikoteknik şubelerinin IDs (sirketId: 4)
const getPsikoSubeIdler = () => SUBELER.filter(s => s.sirketId === 4).map(s => s.id);

// Bir öğrencinin psikoteknik öğrencisi olup olmadığı
const isPsiko = (ogr) => {
  const sube = SUBELER.find(s => s.id === ogr.subeId);
  return sube?.sirketId === 4 || ogr.kurstipi === 'Psikoteknik';
};

// ─── BAŞLANGIÇ VERİSİ ──────────────────────────────────────
const BASLANGIC_OGRENCILER = [
  ...OGRENCILER,
  // Psikoteknik demo öğrencileri
  {
    id: 101, subeId: 13, ad: 'Kemal', soyad: 'Aydın', tc: '22222222201',
    telefon: '0532 111 22 33', email: 'kemal@mail.com',
    kayitTarihi: '2025-02-10', kurstipi: 'Psikoteknik',
    durum: 'devam_ediyor', toplamUcret: 1200, odenenUcret: 1200,
    psiko: {
      randevuTarihi: '2025-04-05', randevuSaati: '09:30',
      randevuDurumu: 'bekliyor', // 'bekliyor' | 'gerceklesti' | 'iptal'
      testSonucu: null, // null | 'basarili' | 'basarisiz'
      testTarihi: null,
      testNotu: '',
      testDetaylari: {},
      yenidenSinavHakki: 0,
      sertifikaTarihi: null,
    }
  },
  {
    id: 102, subeId: 13, ad: 'Selin', soyad: 'Kara', tc: '22222222202',
    telefon: '0544 222 33 44', email: 'selin@mail.com',
    kayitTarihi: '2025-02-15', kurstipi: 'Psikoteknik',
    durum: 'devam_ediyor', toplamUcret: 1200, odenenUcret: 600,
    psiko: {
      randevuTarihi: '2025-04-08', randevuSaati: '14:00',
      randevuDurumu: 'bekliyor',
      testSonucu: null, testTarihi: null, testNotu: '',
      testDetaylari: {}, yenidenSinavHakki: 0, sertifikaTarihi: null,
    }
  },
  {
    id: 103, subeId: 14, ad: 'Burak', soyad: 'Şen', tc: '22222222203',
    telefon: '0555 333 44 55', email: '',
    kayitTarihi: '2025-01-20', kurstipi: 'Psikoteknik',
    durum: 'tamamladi', toplamUcret: 1200, odenenUcret: 1200,
    psiko: {
      randevuTarihi: '2025-03-10', randevuSaati: '10:00',
      randevuDurumu: 'gerceklesti',
      testSonucu: 'basarili', testTarihi: '2025-03-10', testNotu: 'Tüm testleri başarıyla geçti.',
      testDetaylari: { dikkat: 'basarili', reaksiyon: 'basarili', gorme: 'basarili', koordinasyon: 'basarili', stres: 'basarili', hafiza: 'basarili' },
      yenidenSinavHakki: 0, sertifikaTarihi: '2025-03-12',
    }
  },
  {
    id: 104, subeId: 14, ad: 'Derya', soyad: 'Yurt', tc: '22222222204',
    telefon: '0566 444 55 66', email: '',
    kayitTarihi: '2025-01-25', kurstipi: 'Psikoteknik',
    durum: 'devam_ediyor', toplamUcret: 1200, odenenUcret: 1200,
    psiko: {
      randevuTarihi: '2025-03-15', randevuSaati: '11:00',
      randevuDurumu: 'gerceklesti',
      testSonucu: 'basarisiz', testTarihi: '2025-03-15', testNotu: 'Reaksiyon testi başarısız. Yeniden sınav gerekli.',
      testDetaylari: { dikkat: 'basarili', reaksiyon: 'basarisiz', gorme: 'basarili', koordinasyon: 'basarili', stres: 'basarisiz', hafiza: 'basarili' },
      yenidenSinavHakki: 1, sertifikaTarihi: null,
    }
  },
];

const BOS_FORM = {
  ad:'', soyad:'', tc:'', telefon:'', email:'',
  kayitTarihi:'', kurstipi:'', subeId:'',
  durum:'devam_ediyor', toplamUcret:'', odenenUcret:'',
  // Psikoteknik kayıt alanları
  randevuTarihi:'', randevuSaati:'', testSonucu:'',
};

const BOS_PSIKO = {
  randevuTarihi:'', randevuSaati:'', randevuDurumu:'bekliyor',
  testSonucu: null, testTarihi:'', testNotu:'',
  testDetaylari:{}, yenidenSinavHakki:0, sertifikaTarihi:'',
};

// ─── YARDIMCI BİLEŞENLER ───────────────────────────────────
function InfoSatir({ etiket, deger, renk }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', background:'#F8FAFC', borderRadius:'8px', padding:'11px 14px', border:'1px solid #E2E8F0' }}>
      <span style={{ fontSize:'10px', color:'#64748B', marginBottom:'3px', textTransform:'uppercase', letterSpacing:'0.6px', fontWeight:'600' }}>{etiket}</span>
      <span style={{ fontSize:'14px', fontWeight:'600', color:renk||'#1E293B' }}>{deger||'—'}</span>
    </div>
  );
}

function TestSonucBadge({ sonuc, buyuk }) {
  if (!sonuc) return <span style={{ background:'#F1F5F9', color:'#64748B', padding: buyuk?'6px 16px':'4px 10px', borderRadius:'20px', fontSize: buyuk?'13px':'11px', fontWeight:'700' }}>⏳ Bekleniyor</span>;
  if (sonuc === 'basarili') return <span style={{ background:'#DCFCE7', color:'#14532D', border:'1.5px solid #86EFAC', padding: buyuk?'6px 16px':'4px 10px', borderRadius:'20px', fontSize: buyuk?'13px':'11px', fontWeight:'700' }}>✅ BAŞARILI</span>;
  return <span style={{ background:'#FEE2E2', color:'#7F1D1D', border:'1.5px solid #FCA5A5', padding: buyuk?'6px 16px':'4px 10px', borderRadius:'20px', fontSize: buyuk?'13px':'11px', fontWeight:'700' }}>❌ BAŞARISIZ</span>;
}

function RandevuBadge({ durum }) {
  if (durum === 'gerceklesti') return <span style={{ background:'#DBEAFE', color:'#1D4ED8', padding:'4px 10px', borderRadius:'12px', fontSize:'11px', fontWeight:'700' }}>✔ Gerçekleşti</span>;
  if (durum === 'iptal') return <span style={{ background:'#FEE2E2', color:'#991B1B', padding:'4px 10px', borderRadius:'12px', fontSize:'11px', fontWeight:'700' }}>❌ İptal</span>;
  return <span style={{ background:'#FEF9C3', color:'#713F12', padding:'4px 10px', borderRadius:'12px', fontSize:'11px', fontWeight:'700' }}>⏳ Bekliyor</span>;
}

// ─── PSİKOTEKNİK DETAY PANELİ ──────────────────────────────
function PsikoPanel({ ogr, onGuncelle }) {
  const p = ogr.psiko || BOS_PSIKO;
  const [randevuForm, setRandevuForm] = useState({ tarih: p.randevuTarihi||'', saat: p.randevuSaati||'', durum: p.randevuDurumu||'bekliyor' });
  const [testForm, setTestForm]       = useState({
    sonuc: p.testSonucu||'', tarih: p.testTarihi||'', not: p.testNotu||'',
    detaylar: p.testDetaylari||{}, yenidenHak: p.yenidenSinavHakki||0, sertifika: p.sertifikaTarihi||'',
  });
  const [randevuEdit, setRandevuEdit] = useState(false);
  const [testEdit, setTestEdit]       = useState(false);

  const randevuKaydet = () => {
    onGuncelle({ ...ogr, psiko: { ...p, randevuTarihi: randevuForm.tarih, randevuSaati: randevuForm.saat, randevuDurumu: randevuForm.durum } });
    setRandevuEdit(false);
  };

  const testKaydet = () => {
    const yeniDurum = testForm.sonuc === 'basarili' ? 'tamamladi' : 'devam_ediyor';
    onGuncelle({
      ...ogr,
      durum: yeniDurum,
      psiko: {
        ...p,
        testSonucu: testForm.sonuc || null,
        testTarihi: testForm.tarih,
        testNotu: testForm.not,
        testDetaylari: testForm.detaylar,
        yenidenSinavHakki: parseInt(testForm.yenidenHak)||0,
        sertifikaTarihi: testForm.sonuc === 'basarili' ? testForm.sertifika : null,
        randevuDurumu: testForm.sonuc ? 'gerceklesti' : p.randevuDurumu,
      }
    });
    setTestEdit(false);
  };

  const bugun = new Date().toISOString().split('T')[0];

  return (
    <div>
      {/* ── RANDEVU KARTI ── */}
      <div style={{
        background: p.testSonucu === 'basarili'
          ? 'linear-gradient(135deg,#DCFCE7,#F0FDF4)'
          : p.testSonucu === 'basarisiz'
            ? 'linear-gradient(135deg,#FEE2E2,#FFF5F5)'
            : 'linear-gradient(135deg,#EFF6FF,#DBEAFE)',
        border: `2px solid ${p.testSonucu === 'basarili' ? '#86EFAC' : p.testSonucu === 'basarisiz' ? '#FCA5A5' : '#93C5FD'}`,
        borderRadius: '14px', padding: '18px', marginBottom: '16px',
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
          <div style={{ fontSize:'15px', fontWeight:'800', color:'#1E293B' }}>🧠 Psikoteknik Test Durumu</div>
          <TestSonucBadge sonuc={p.testSonucu} buyuk />
        </div>

        {/* Randevu bilgisi */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px' }}>
          <InfoSatir etiket="Randevu Tarihi" deger={p.randevuTarihi ? `📅 ${p.randevuTarihi}` : '—'} />
          <InfoSatir etiket="Randevu Saati"  deger={p.randevuSaati  ? `🕐 ${p.randevuSaati}` : '—'} />
          <div style={{ display:'flex', flexDirection:'column', background:'#F8FAFC', borderRadius:'8px', padding:'11px 14px', border:'1px solid #E2E8F0' }}>
            <span style={{ fontSize:'10px', color:'#64748B', marginBottom:'5px', textTransform:'uppercase', letterSpacing:'0.6px', fontWeight:'600' }}>Randevu Durumu</span>
            <RandevuBadge durum={p.randevuDurumu} />
          </div>
          {p.testTarihi    && <InfoSatir etiket="Test Tarihi"     deger={`📅 ${p.testTarihi}`} />}
          {p.sertifikaTarihi && <InfoSatir etiket="Sertifika Tarihi" deger={`📜 ${p.sertifikaTarihi}`} renk="#15803D" />}
          {p.yenidenSinavHakki > 0 && <InfoSatir etiket="Yeniden Sınav" deger={`${p.yenidenSinavHakki} hak kaldı`} renk="#D97706" />}
        </div>

        {p.testNotu && (
          <div style={{ marginTop:'12px', background:'rgba(255,255,255,0.7)', borderRadius:'8px', padding:'10px 14px', fontSize:'13px', color:'#374151' }}>
            📝 <b>Not:</b> {p.testNotu}
          </div>
        )}

        {/* Butonlar */}
        <div style={{ display:'flex', gap:'8px', marginTop:'14px' }}>
          <button onClick={() => setRandevuEdit(true)}
            style={{ flex:1, padding:'9px', background:'linear-gradient(135deg,#3B82F6,#2563EB)', color:'white', border:'none', borderRadius:'8px', fontWeight:'700', cursor:'pointer', fontSize:'13px' }}>
            📅 Randevu {p.randevuTarihi ? 'Güncelle' : 'Ekle'}
          </button>
          <button onClick={() => setTestEdit(true)}
            style={{ flex:1, padding:'9px', background:'linear-gradient(135deg,#8B5CF6,#6D28D9)', color:'white', border:'none', borderRadius:'8px', fontWeight:'700', cursor:'pointer', fontSize:'13px' }}>
            🧪 Test Sonucu {p.testSonucu ? 'Güncelle' : 'Gir'}
          </button>
        </div>
      </div>

      {/* ── TEST DETAYLARI (kategoriler) ── */}
      {p.testSonucu && Object.keys(p.testDetaylari||{}).length > 0 && (
        <div style={{ background:'#F8FAFC', borderRadius:'12px', padding:'16px', marginBottom:'16px', border:'1px solid #E2E8F0' }}>
          <div style={{ fontWeight:'700', fontSize:'13px', color:'#374151', marginBottom:'12px' }}>📊 Test Kategorileri</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:'8px' }}>
            {PSİKO_TESTLER.map(t => {
              const sonuc = p.testDetaylari[t.id];
              if (!sonuc) return null;
              return (
                <div key={t.id} style={{
                  background: sonuc === 'basarili' ? '#DCFCE7' : '#FEE2E2',
                  border: `1px solid ${sonuc === 'basarili' ? '#86EFAC' : '#FCA5A5'}`,
                  borderRadius:'10px', padding:'10px 12px',
                  display:'flex', alignItems:'center', gap:'8px',
                }}>
                  <span style={{ fontSize:'18px' }}>{t.ikon}</span>
                  <div>
                    <div style={{ fontSize:'12px', fontWeight:'700', color:'#1E293B' }}>{t.label}</div>
                    <div style={{ fontSize:'11px', fontWeight:'700', color: sonuc === 'basarili' ? '#15803D' : '#991B1B', marginTop:'2px' }}>
                      {sonuc === 'basarili' ? '✅ Başarılı' : '❌ Başarısız'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ RANDEVU DÜZENLEME MODAL ══ */}
      <Modal acik={randevuEdit} kapat={() => setRandevuEdit(false)} baslik="📅 Test Randevusu" genislik="460px">
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          {/* Randevu kartı önizleme */}
          {(randevuForm.tarih || randevuForm.saat) && (
            <div style={{ background:'linear-gradient(135deg,#EFF6FF,#DBEAFE)', border:'2px solid #93C5FD', borderRadius:'12px', padding:'14px', display:'flex', alignItems:'center', gap:'12px' }}>
              <span style={{ fontSize:'32px' }}>📅</span>
              <div>
                <div style={{ fontWeight:'800', color:'#1D4ED8', fontSize:'16px' }}>{randevuForm.tarih || '—'}</div>
                <div style={{ fontWeight:'700', color:'#3B82F6', fontSize:'20px' }}>{randevuForm.saat || '—'}</div>
              </div>
            </div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            {/* Tarih */}
            <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
              <label style={{ fontSize:'12px', fontWeight:'700', color:'#374151' }}>📅 Randevu Tarihi</label>
              <input type="date"
                style={{ padding:'10px 12px', border:'1.5px solid #E2E8F0', borderRadius:'8px', fontSize:'15px', fontWeight:'600', outline:'none', color:'#1E293B' }}
                value={randevuForm.tarih}
                onChange={e => setRandevuForm(p => ({ ...p, tarih: e.target.value }))}
              />
            </div>

            {/* Saat */}
            <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
              <label style={{ fontSize:'12px', fontWeight:'700', color:'#374151' }}>🕐 Randevu Saati</label>
              <input type="time"
                style={{ padding:'10px 12px', border:'1.5px solid #E2E8F0', borderRadius:'8px', fontSize:'15px', fontWeight:'600', outline:'none', color:'#1E293B' }}
                value={randevuForm.saat}
                onChange={e => setRandevuForm(p => ({ ...p, saat: e.target.value }))}
              />
            </div>
          </div>

          {/* Hızlı saat seçimi */}
          <div>
            <div style={{ fontSize:'12px', fontWeight:'700', color:'#374151', marginBottom:'6px' }}>Hızlı Saat Seçimi</div>
            <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
              {['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'].map(s => (
                <button key={s} onClick={() => setRandevuForm(p => ({ ...p, saat: s }))}
                  style={{
                    padding:'5px 10px', borderRadius:'8px', border:'1.5px solid', fontSize:'12px', fontWeight:'600', cursor:'pointer',
                    background: randevuForm.saat === s ? '#3B82F6' : '#F1F5F9',
                    borderColor: randevuForm.saat === s ? '#3B82F6' : '#E2E8F0',
                    color: randevuForm.saat === s ? 'white' : '#374151',
                  }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Durum */}
          <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
            <label style={{ fontSize:'12px', fontWeight:'700', color:'#374151' }}>Randevu Durumu</label>
            <div style={{ display:'flex', gap:'8px' }}>
              {[
                { v:'bekliyor',    l:'⏳ Bekliyor',    bg:'#FEF9C3', renk:'#713F12', sel:'#F59E0B' },
                { v:'gerceklesti', l:'✔ Gerçekleşti',  bg:'#DBEAFE', renk:'#1D4ED8', sel:'#3B82F6' },
                { v:'iptal',       l:'❌ İptal',        bg:'#FEE2E2', renk:'#991B1B', sel:'#EF4444' },
              ].map(opt => (
                <button key={opt.v} onClick={() => setRandevuForm(p => ({ ...p, durum: opt.v }))}
                  style={{
                    flex:1, padding:'10px', borderRadius:'10px', border:`2px solid ${randevuForm.durum===opt.v ? opt.sel : '#E2E8F0'}`,
                    background: randevuForm.durum===opt.v ? opt.bg : 'white',
                    color: randevuForm.durum===opt.v ? opt.renk : '#94A3B8',
                    fontWeight:'700', fontSize:'12px', cursor:'pointer', transition:'all 0.15s',
                  }}>
                  {opt.l}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display:'flex', gap:'8px', marginTop:'18px', justifyContent:'flex-end' }}>
          <button style={{ padding:'9px 20px', background:'#F1F5F9', border:'none', borderRadius:'8px', fontWeight:'600', cursor:'pointer' }} onClick={() => setRandevuEdit(false)}>İptal</button>
          <button style={{ padding:'9px 24px', background:'linear-gradient(135deg,#3B82F6,#2563EB)', color:'white', border:'none', borderRadius:'8px', fontWeight:'700', cursor:'pointer', boxShadow:'0 3px 10px rgba(59,130,246,0.35)' }} onClick={randevuKaydet}>💾 Kaydet</button>
        </div>
      </Modal>

      {/* ══ TEST SONUCU MODAL ══ */}
      <Modal acik={testEdit} kapat={() => setTestEdit(false)} baslik="🧪 Psikoteknik Test Sonucu" genislik="620px">
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>

          {/* Sonuç Seçimi — büyük butonlar */}
          <div>
            <div style={{ fontSize:'13px', fontWeight:'800', color:'#374151', marginBottom:'10px' }}>Test Sonucu *</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              <button onClick={() => setTestForm(p => ({ ...p, sonuc: 'basarili' }))}
                style={{
                  padding:'18px', borderRadius:'14px', border:`2px solid ${testForm.sonuc==='basarili'?'#16A34A':'#E2E8F0'}`,
                  background: testForm.sonuc==='basarili' ? 'linear-gradient(135deg,#DCFCE7,#BBF7D0)' : 'white',
                  cursor:'pointer', transition:'all 0.15s',
                  transform: testForm.sonuc==='basarili' ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: testForm.sonuc==='basarili' ? '0 4px 14px rgba(22,163,74,0.25)' : 'none',
                }}>
                <div style={{ fontSize:'36px', marginBottom:'8px' }}>✅</div>
                <div style={{ fontWeight:'800', fontSize:'16px', color: testForm.sonuc==='basarili'?'#14532D':'#94A3B8' }}>BAŞARILI</div>
                <div style={{ fontSize:'12px', color: testForm.sonuc==='basarili'?'#15803D':'#CBD5E1', marginTop:'3px' }}>Tüm testleri geçti</div>
              </button>
              <button onClick={() => setTestForm(p => ({ ...p, sonuc: 'basarisiz' }))}
                style={{
                  padding:'18px', borderRadius:'14px', border:`2px solid ${testForm.sonuc==='basarisiz'?'#DC2626':'#E2E8F0'}`,
                  background: testForm.sonuc==='basarisiz' ? 'linear-gradient(135deg,#FEE2E2,#FECACA)' : 'white',
                  cursor:'pointer', transition:'all 0.15s',
                  transform: testForm.sonuc==='basarisiz' ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: testForm.sonuc==='basarisiz' ? '0 4px 14px rgba(220,38,38,0.25)' : 'none',
                }}>
                <div style={{ fontSize:'36px', marginBottom:'8px' }}>❌</div>
                <div style={{ fontWeight:'800', fontSize:'16px', color: testForm.sonuc==='basarisiz'?'#7F1D1D':'#94A3B8' }}>BAŞARISIZ</div>
                <div style={{ fontSize:'12px', color: testForm.sonuc==='basarisiz'?'#991B1B':'#CBD5E1', marginTop:'3px' }}>Yeniden sınav gerekli</div>
              </button>
            </div>
          </div>

          {/* Test Kategori Detayları */}
          <div>
            <div style={{ fontSize:'13px', fontWeight:'800', color:'#374151', marginBottom:'10px' }}>📊 Kategori Bazlı Sonuçlar</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
              {PSİKO_TESTLER.map(t => (
                <div key={t.id} style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  background:'#F8FAFC', borderRadius:'10px', padding:'10px 12px',
                  border:`1px solid ${testForm.detaylar[t.id]==='basarili'?'#86EFAC':testForm.detaylar[t.id]==='basarisiz'?'#FCA5A5':'#E2E8F0'}`,
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
                    <span style={{ fontSize:'18px' }}>{t.ikon}</span>
                    <span style={{ fontSize:'12px', fontWeight:'600', color:'#374151' }}>{t.label}</span>
                  </div>
                  <div style={{ display:'flex', gap:'4px' }}>
                    <button onClick={() => setTestForm(p => ({ ...p, detaylar: { ...p.detaylar, [t.id]: 'basarili' } }))}
                      style={{ padding:'4px 10px', borderRadius:'8px', border:'none', cursor:'pointer', fontWeight:'700', fontSize:'11px',
                        background: testForm.detaylar[t.id]==='basarili'?'#DCFCE7':'#F1F5F9',
                        color: testForm.detaylar[t.id]==='basarili'?'#14532D':'#94A3B8' }}>✅</button>
                    <button onClick={() => setTestForm(p => ({ ...p, detaylar: { ...p.detaylar, [t.id]: 'basarisiz' } }))}
                      style={{ padding:'4px 10px', borderRadius:'8px', border:'none', cursor:'pointer', fontWeight:'700', fontSize:'11px',
                        background: testForm.detaylar[t.id]==='basarisiz'?'#FEE2E2':'#F1F5F9',
                        color: testForm.detaylar[t.id]==='basarisiz'?'#991B1B':'#94A3B8' }}>❌</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Test Tarihi + Sertifika */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
              <label style={{ fontSize:'12px', fontWeight:'700', color:'#374151' }}>📅 Test Tarihi</label>
              <input type="date" style={{ padding:'9px 12px', border:'1.5px solid #E2E8F0', borderRadius:'8px', fontSize:'14px', outline:'none' }}
                value={testForm.tarih} onChange={e => setTestForm(p => ({ ...p, tarih: e.target.value }))} />
            </div>
            {testForm.sonuc === 'basarili' && (
              <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                <label style={{ fontSize:'12px', fontWeight:'700', color:'#374151' }}>📜 Sertifika Tarihi</label>
                <input type="date" style={{ padding:'9px 12px', border:'1.5px solid #86EFAC', borderRadius:'8px', fontSize:'14px', outline:'none', background:'#F0FDF4' }}
                  value={testForm.sertifika} onChange={e => setTestForm(p => ({ ...p, sertifika: e.target.value }))} />
              </div>
            )}
            {testForm.sonuc === 'basarisiz' && (
              <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                <label style={{ fontSize:'12px', fontWeight:'700', color:'#374151' }}>🔁 Yeniden Sınav Hakkı</label>
                <input type="number" min="0" max="3" style={{ padding:'9px 12px', border:'1.5px solid #FCA5A5', borderRadius:'8px', fontSize:'14px', outline:'none', background:'#FFF5F5' }}
                  value={testForm.yenidenHak} onChange={e => setTestForm(p => ({ ...p, yenidenHak: e.target.value }))} />
              </div>
            )}
          </div>

          {/* Not */}
          <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
            <label style={{ fontSize:'12px', fontWeight:'700', color:'#374151' }}>📝 Değerlendirme Notu</label>
            <textarea style={{ padding:'10px 12px', border:'1.5px solid #E2E8F0', borderRadius:'8px', fontSize:'13px', minHeight:'75px', resize:'vertical', outline:'none', fontFamily:'inherit' }}
              placeholder="Test sonucu hakkında notlar, gözlemler..."
              value={testForm.not} onChange={e => setTestForm(p => ({ ...p, not: e.target.value }))} />
          </div>
        </div>

        <div style={{ display:'flex', gap:'8px', marginTop:'18px', justifyContent:'flex-end' }}>
          <button style={{ padding:'9px 20px', background:'#F1F5F9', border:'none', borderRadius:'8px', fontWeight:'600', cursor:'pointer' }} onClick={() => setTestEdit(false)}>İptal</button>
          <button
            disabled={!testForm.sonuc}
            style={{ padding:'9px 24px', background: testForm.sonuc ? 'linear-gradient(135deg,#8B5CF6,#6D28D9)' : '#E2E8F0', color: testForm.sonuc?'white':'#94A3B8', border:'none', borderRadius:'8px', fontWeight:'700', cursor: testForm.sonuc?'pointer':'not-allowed', boxShadow: testForm.sonuc?'0 3px 10px rgba(109,40,217,0.35)':'none' }}
            onClick={testKaydet}>
            💾 Kaydet
          </button>
        </div>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  ANA SAYFA
// ═══════════════════════════════════════════════════════════
export default function Ogrenciler() {
  const [liste, setListe]           = useState(BASLANGIC_OGRENCILER);
  const [aramaMetni, setAramaMetni] = useState('');
  const [durumFiltre, setDurumFiltre]   = useState('tumu');
  const [sirketFiltre, setSirketFiltre] = useState('tumu');
  const [aktifTab, setAktifTab]     = useState('tumu'); // 'tumu' | 'psiko'

  const [detayModal, setDetayModal]     = useState(null);
  const [duzenleModal, setDuzenleModal] = useState(null);
  const [odemeModal, setOdemeModal]     = useState(null);
  const [yeniModal, setYeniModal]       = useState(false);
  const [silOnay, setSilOnay]           = useState(null);
  const [form, setForm]                 = useState(BOS_FORM);
  const [yeniOdeme, setYeniOdeme]       = useState('');
  const [detaySekme, setDetaySekme]     = useState('bilgiler');

  // ── Filtreleme ──
  const filtrelenenler = useMemo(() => liste.filter(o => {
    const aramaEsles = aramaMetni === '' ||
      `${o.ad} ${o.soyad}`.toLowerCase().includes(aramaMetni.toLowerCase()) ||
      (o.tc||'').includes(aramaMetni) || (o.telefon||'').includes(aramaMetni);
    const durumEsles  = durumFiltre === 'tumu' || o.durum === durumFiltre;
    const sube        = SUBELER.find(s => s.id === o.subeId);
    const sirketEsles = sirketFiltre === 'tumu' || sube?.sirketId === parseInt(sirketFiltre);
    const tabEsles    = aktifTab === 'tumu' || (aktifTab === 'psiko' && isPsiko(o));
    return aramaEsles && durumEsles && sirketEsles && tabEsles;
  }), [liste, aramaMetni, durumFiltre, sirketFiltre, aktifTab]);

  const psikoOgrenciler = useMemo(() => liste.filter(isPsiko), [liste]);
  const toplamBorc      = useMemo(() => liste.reduce((s, o) => s + (o.toplamUcret - o.odenenUcret), 0), [liste]);
  const psikoBasarili   = useMemo(() => psikoOgrenciler.filter(o => o.psiko?.testSonucu === 'basarili').length, [psikoOgrenciler]);
  const psikoBasarisiz  = useMemo(() => psikoOgrenciler.filter(o => o.psiko?.testSonucu === 'basarisiz').length, [psikoOgrenciler]);
  const psikoBekliyor   = useMemo(() => psikoOgrenciler.filter(o => !o.psiko?.testSonucu).length, [psikoOgrenciler]);

  // Bugün & bu hafta randevuları
  const bugun      = new Date().toISOString().split('T')[0];
  const bugunRandevular = useMemo(() => psikoOgrenciler.filter(o => o.psiko?.randevuTarihi === bugun && o.psiko?.randevuDurumu === 'bekliyor'), [psikoOgrenciler, bugun]);

  // ── İşlemler ──
  const ogrenciGuncelle = (guncel) => {
    setListe(prev => prev.map(o => o.id === guncel.id ? guncel : o));
    if (detayModal?.id === guncel.id) setDetayModal(guncel);
  };

  const kaydet = () => {
    if (!form.ad || !form.soyad || !form.tc) { alert('Ad, Soyad ve TC zorunludur!'); return; }
    const psikoMu = SUBELER.find(s => s.id === parseInt(form.subeId))?.sirketId === 4 || form.kurstipi === 'Psikoteknik';
    // Mevcut psiko verisini koru, form'daki randevu/sonuç bilgilerini üzerine yaz
    const mevcutPsiko = duzenleModal?.psiko || { ...BOS_PSIKO };
    const psikoObj = psikoMu ? {
      ...mevcutPsiko,
      randevuTarihi: form.randevuTarihi || mevcutPsiko.randevuTarihi,
      randevuSaati:  form.randevuSaati  || mevcutPsiko.randevuSaati,
      testSonucu:    form.testSonucu    || mevcutPsiko.testSonucu || null,
      randevuDurumu: form.testSonucu === 'basarili' || form.testSonucu === 'basarisiz'
        ? 'gerceklesti'
        : mevcutPsiko.randevuDurumu || 'bekliyor',
    } : undefined;
    // form'dan psikoteknike özel alanları çıkar
    const { randevuTarihi: _rt, randevuSaati: _rs, testSonucu: _ts, ...formTemiz } = form;
    const obj = {
      ...formTemiz, subeId: parseInt(form.subeId),
      toplamUcret: parseInt(form.toplamUcret)||0, odenenUcret: parseInt(form.odenenUcret)||0,
      durum: (psikoMu && form.testSonucu === 'basarili') ? 'tamamladi' : formTemiz.durum,
      psiko: psikoObj,
    };
    if (duzenleModal) {
      setListe(prev => prev.map(o => o.id === duzenleModal.id ? { ...duzenleModal, ...obj } : o));
      setDuzenleModal(null);
    } else {
      setListe(prev => [{ ...obj, id: Date.now() }, ...prev]);
      setYeniModal(false);
    }
    setForm(BOS_FORM);
  };

  const odemeEkle = () => {
    const tutar = parseInt(yeniOdeme);
    if (!tutar || tutar <= 0) { alert('Geçerli bir tutar girin!'); return; }
    setListe(prev => prev.map(o => {
      if (o.id !== odemeModal.id) return o;
      const yeniOdenen = Math.min(o.odenenUcret + tutar, o.toplamUcret);
      return { ...o, odenenUcret: yeniOdened, durum: yeniOdened >= o.toplamUcret ? 'tamamladi' : o.durum };
    }));
    setOdemeModal(null); setYeniOdeme('');
  };

  // Fix typo
  const odemeEkleDuzgun = () => {
    const tutar = parseInt(yeniOdeme);
    if (!tutar || tutar <= 0) { alert('Geçerli bir tutar girin!'); return; }
    setListe(prev => prev.map(o => {
      if (o.id !== odemeModal.id) return o;
      const yeniOdenen = Math.min(o.odenenUcret + tutar, o.toplamUcret);
      return { ...o, odenenUcret: yeniOdenen, durum: yeniOdenen >= o.toplamUcret ? 'tamamladi' : o.durum };
    }));
    setOdemeModal(null); setYeniOdeme('');
  };

  const sil = (id) => { setListe(prev => prev.filter(o => o.id !== id)); setSilOnay(null); setDetayModal(null); };
  const acDuzenle = (ogr) => {
    setForm({
      ...ogr,
      subeId: ogr.subeId?.toString(),
      toplamUcret: ogr.toplamUcret?.toString(),
      odenenUcret: ogr.odenenUcret?.toString(),
      // Psikoteknik alanlarını form'a taşı
      randevuTarihi: ogr.psiko?.randevuTarihi || '',
      randevuSaati:  ogr.psiko?.randevuSaati  || '',
      testSonucu:    ogr.psiko?.testSonucu    || '',
    });
    setDuzenleModal(ogr);
  };

  const FormAlani = ({ label, name, tip='text', options, tam }) => (
    <div style={{ display:'flex', flexDirection:'column', gap:'5px', gridColumn: tam?'1/-1':undefined }}>
      <label style={{ fontSize:'12px', fontWeight:'600', color:'#374151' }}>{label}</label>
      {options ? (
        <select style={{ padding:'9px 12px', border:'1.5px solid #E2E8F0', borderRadius:'8px', fontSize:'14px', outline:'none', background:'white' }}
          value={form[name]||''} onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))}>
          <option value="">Seçin...</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input type={tip} style={{ padding:'9px 12px', border:'1.5px solid #E2E8F0', borderRadius:'8px', fontSize:'14px', outline:'none' }}
          value={form[name]||''} onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))} placeholder={label} />
      )}
    </div>
  );

  // Psikoteknik seçildi mi (form'da)?
  const formPsikoMu = useMemo(() => {
    const sube = SUBELER.find(s => s.id === parseInt(form.subeId));
    return sube?.sirketId === 4 || form.kurstipi === 'Psikoteknik';
  }, [form.subeId, form.kurstipi]);

  return (
    <div>
      <div className="sayfa-baslik">
        <h1>👨‍🎓 Öğrenciler</h1>
        <p>Tüm öğrenci kayıtları, ödeme ve psikoteknik test takibi</p>
      </div>

      {/* ── Özet Kartlar ── */}
      <div className="ozet-kartlar">
        {[
          { ikon:'👥', label:'Toplam Öğrenci', deger: liste.length,                                             bg:'#DBEAFE', renk:'#1D4ED8' },
          { ikon:'🔄', label:'Devam Eden',     deger: liste.filter(o=>o.durum==='devam_ediyor').length,         bg:'#FEF9C3', renk:'#B45309' },
          { ikon:'✅', label:'Tamamlayan',      deger: liste.filter(o=>o.durum==='tamamladi').length,            bg:'#DCFCE7', renk:'#15803D' },
          { ikon:'💳', label:'Toplam Alacak',  deger:`₺${toplamBorc.toLocaleString('tr-TR')}`,                  bg:'#FEE2E2', renk:'#DC2626' },
          { ikon:'🧠', label:'Psiko Öğrenci',  deger: psikoOgrenciler.length,                                   bg:'#EDE9FE', renk:'#6D28D9' },
          { ikon:'✅', label:'Psiko Başarılı',  deger: psikoBasarili,                                           bg:'#DCFCE7', renk:'#15803D' },
          { ikon:'❌', label:'Psiko Başarısız', deger: psikoBasarisiz,                                          bg:'#FEE2E2', renk:'#DC2626' },
          { ikon:'📅', label:'Bugün Randevu',   deger: bugunRandevular.length,                                  bg:'#CFFAFE', renk:'#0E7490' },
        ].map(k => (
          <div key={k.label} className="ozet-kart">
            <div className="kart-ikon" style={{ background:k.bg }}>{k.ikon}</div>
            <div className="kart-bilgi"><h3 style={{ color:k.renk, fontSize:'15px' }}>{k.deger}</h3><p>{k.label}</p></div>
          </div>
        ))}
      </div>

      {/* Bugün randevu uyarısı */}
      {bugunRandevular.length > 0 && (
        <div style={{ background:'linear-gradient(135deg,#CFFAFE,#E0F2FE)', border:'2px solid #67E8F9', borderRadius:'12px', padding:'12px 18px', marginBottom:'14px', display:'flex', alignItems:'center', gap:'12px' }}>
          <span style={{ fontSize:'24px' }}>📅</span>
          <div>
            <div style={{ fontWeight:'800', color:'#0E7490', fontSize:'13px' }}>Bugün {bugunRandevular.length} psikoteknik randevusu var!</div>
            <div style={{ fontSize:'12px', color:'#0891B2', marginTop:'2px' }}>
              {bugunRandevular.map(o => `🧠 ${o.ad} ${o.soyad} — ${o.psiko?.randevuSaati}`).join('  ·  ')}
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" style={{ marginLeft:'auto' }} onClick={() => { setAktifTab('psiko'); setDurumFiltre('tumu'); }}>
            Psiko →
          </button>
        </div>
      )}

      {/* ── Tab Bar ── */}
      <div className="tab-bar">
        <div className={`tab-item ${aktifTab==='tumu'?'aktif':''}`} onClick={() => setAktifTab('tumu')}>
          👨‍🎓 Tüm Öğrenciler ({liste.length})
        </div>
        <div className={`tab-item ${aktifTab==='psiko'?'aktif':''}`} onClick={() => setAktifTab('psiko')}>
          🧠 Psikoteknik ({psikoOgrenciler.length})
          {psikoBasarisiz > 0 && (
            <span style={{ marginLeft:'6px', background:'#EF4444', color:'white', borderRadius:'10px', padding:'1px 7px', fontSize:'11px', fontWeight:'700' }}>{psikoBasarisiz}</span>
          )}
        </div>
      </div>

      {/* Psikoteknik özet (sadece psiko tabında) */}
      {aktifTab === 'psiko' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:'10px', marginBottom:'14px' }}>
          {[
            { label:'Bekliyor',    deger: psikoBekliyor,  bg:'#FEF9C3', renk:'#B45309', ikon:'⏳' },
            { label:'Başarılı',    deger: psikoBasarili,  bg:'#DCFCE7', renk:'#15803D', ikon:'✅' },
            { label:'Başarısız',   deger: psikoBasarisiz, bg:'#FEE2E2', renk:'#DC2626', ikon:'❌' },
            { label:'Başarı Oranı', deger: psikoOgrenciler.filter(o=>o.psiko?.testSonucu).length > 0
                ? `%${Math.round(psikoBasarili / psikoOgrenciler.filter(o=>o.psiko?.testSonucu).length * 100)}`
                : '—',
              bg:'#EDE9FE', renk:'#6D28D9', ikon:'📊' },
          ].map(k => (
            <div key={k.label} style={{ background:k.bg, borderRadius:'12px', padding:'14px', textAlign:'center', border:`1px solid ${k.renk}33` }}>
              <div style={{ fontSize:'22px' }}>{k.ikon}</div>
              <div style={{ fontSize:'22px', fontWeight:'800', color:k.renk, marginTop:'4px' }}>{k.deger}</div>
              <div style={{ fontSize:'11px', color:k.renk, fontWeight:'600', opacity:0.8 }}>{k.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Filtre Bar ── */}
      <div className="filtre-bar">
        <input className="arama-input" placeholder="🔍 Ad, TC veya telefon ara..." value={aramaMetni} onChange={e => setAramaMetni(e.target.value)} />
        <select style={{ padding:'9px 12px', border:'1.5px solid #E2E8F0', borderRadius:'8px', fontSize:'13px', outline:'none', background:'white' }}
          value={durumFiltre} onChange={e => setDurumFiltre(e.target.value)}>
          <option value="tumu">Tüm Durumlar</option>
          <option value="devam_ediyor">Devam Ediyor</option>
          <option value="tamamladi">Tamamladı</option>
          <option value="iptal">İptal</option>
        </select>
        {aktifTab !== 'psiko' && (
          <select style={{ padding:'9px 12px', border:'1.5px solid #E2E8F0', borderRadius:'8px', fontSize:'13px', outline:'none', background:'white' }}
            value={sirketFiltre} onChange={e => setSirketFiltre(e.target.value)}>
            <option value="tumu">Tüm Şirketler</option>
            {SIRKETLER.map(s => <option key={s.id} value={s.id}>{s.ikon} {s.ad.split(' ')[0]}</option>)}
          </select>
        )}
        <button className="btn btn-primary" onClick={() => { setForm(BOS_FORM); setYeniModal(true); }}>+ Öğrenci Ekle</button>
      </div>

      {/* ── Tablo ── */}
      <div className="panel">
        <div className="panel-baslik">
          <h3>{aktifTab === 'psiko' ? '🧠 Psikoteknik Öğrencileri' : '📋 Öğrenci Listesi'}</h3>
          <span style={{ fontSize:'13px', color:'#64748B' }}>{filtrelenenler.length} kayıt</span>
        </div>
        <div className="tablo-container">
          <table>
            <thead>
              <tr>
                <th>Öğrenci</th>
                <th>Kurs</th>
                <th>Şube</th>
                {aktifTab === 'psiko' && <th>📅 Randevu</th>}
                {aktifTab === 'psiko' && <th>🧪 Test Sonucu</th>}
                <th>Kayıt</th>
                <th>Ödeme</th>
                <th>Durum</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filtrelenenler.map(ogr => {
                const sube      = SUBELER.find(s => s.id === ogr.subeId);
                const sirket    = SIRKETLER.find(s => s.id === sube?.sirketId);
                const odemeOrani= ogr.toplamUcret > 0 ? Math.round((ogr.odenenUcret / ogr.toplamUcret) * 100) : 0;
                const kalan     = ogr.toplamUcret - ogr.odenenUcret;
                const psikoMu   = isPsiko(ogr);

                return (
                  <tr key={ogr.id}>
                    <td>
                      <div style={{ fontWeight:'700', fontSize:'14px' }}>{ogr.ad} {ogr.soyad}</div>
                      <div style={{ fontSize:'11px', color:'#64748B' }}>TC: {ogr.tc}</div>
                      <div style={{ fontSize:'11px', color:'#64748B' }}>📞 {ogr.telefon}</div>
                    </td>
                    <td>
                      <span style={{
                        background: sirket?.renk + '20' || '#DBEAFE',
                        color: sirket?.renk || '#1D4ED8',
                        padding:'4px 10px', borderRadius:'10px', fontSize:'12px', fontWeight:'700',
                        border:`1px solid ${sirket?.renk||'#93C5FD'}44`,
                      }}>
                        {sirket?.ikon} {ogr.kurstipi}
                      </span>
                    </td>
                    <td style={{ fontSize:'12px', color:'#374151' }}>{sirket?.ikon} {sube?.ilce}</td>

                    {/* RANDEVU (sadece psiko tab veya psiko öğrenci) */}
                    {aktifTab === 'psiko' && (
                      <td>
                        {psikoMu && ogr.psiko?.randevuTarihi ? (
                          <div>
                            <div style={{ fontWeight:'700', fontSize:'13px', color:'#1D4ED8' }}>📅 {ogr.psiko.randevuTarihi}</div>
                            <div style={{ fontWeight:'700', fontSize:'13px', color:'#3B82F6' }}>🕐 {ogr.psiko.randevuSaati}</div>
                            <RandevuBadge durum={ogr.psiko.randevuDurumu} />
                          </div>
                        ) : psikoMu ? (
                          <span style={{ color:'#CBD5E1', fontSize:'12px' }}>Randevu yok</span>
                        ) : '—'}
                      </td>
                    )}

                    {/* TEST SONUCU (sadece psiko tab) */}
                    {aktifTab === 'psiko' && (
                      <td>
                        {psikoMu ? <TestSonucBadge sonuc={ogr.psiko?.testSonucu} /> : '—'}
                      </td>
                    )}

                    <td style={{ fontSize:'12px' }}>📅 {ogr.kayitTarihi}</td>

                    <td style={{ minWidth:'150px' }}>
                      <div style={{ fontSize:'12px', marginBottom:'4px' }}>
                        <span style={{ color:'#15803D', fontWeight:'700' }}>₺{ogr.odenenUcret.toLocaleString('tr-TR')}</span>
                        <span style={{ color:'#94A3B8' }}> / ₺{ogr.toplamUcret.toLocaleString('tr-TR')}</span>
                      </div>
                      <div style={{ height:'6px', background:'#E2E8F0', borderRadius:'10px', overflow:'hidden' }}>
                        <div style={{ height:'100%', borderRadius:'10px', transition:'width 0.3s',
                          background: odemeOrani===100?'#10B981':odemeOrani>50?'#3B82F6':'#F59E0B',
                          width:`${odemeOrani}%` }} />
                      </div>
                      {kalan > 0 && <div style={{ fontSize:'11px', color:'#DC2626', fontWeight:'600', marginTop:'2px' }}>Kalan: ₺{kalan.toLocaleString('tr-TR')}</div>}
                    </td>

                    <td>
                      <span style={{
                        padding:'4px 10px', borderRadius:'12px', fontSize:'11px', fontWeight:'700',
                        background: ogr.durum==='tamamladi'?'#DCFCE7':ogr.durum==='devam_ediyor'?'#FEF9C3':'#FEE2E2',
                        color: ogr.durum==='tamamladi'?'#14532D':ogr.durum==='devam_ediyor'?'#713F12':'#991B1B',
                      }}>
                        {ogr.durum==='tamamladi'?'✅ Tamamladı':ogr.durum==='devam_ediyor'?'🔄 Devam':'❌ İptal'}
                      </span>
                    </td>

                    <td>
                      <div style={{ display:'flex', gap:'4px' }}>
                        <button className="btn btn-secondary btn-sm" title="Detay"
                          onClick={() => { setDetayModal(ogr); setDetaySekme(psikoMu ? 'psiko' : 'bilgiler'); }}>👁</button>
                        <button className="btn btn-secondary btn-sm" title="Düzenle" onClick={() => acDuzenle(ogr)}>✏️</button>
                        <button className="btn btn-success btn-sm" title="Ödeme Al" onClick={() => { setOdemeModal(ogr); setYeniOdeme(''); }}>💳</button>
                        <button className="btn btn-danger btn-sm" title="Sil" onClick={() => setSilOnay(ogr)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtrelenenler.length === 0 && (
                <tr><td colSpan={aktifTab==='psiko'?9:7} style={{ textAlign:'center', padding:'40px', color:'#64748B' }}>Kayıt bulunamadı.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══ DETAY MODAL ═══ */}
      <Modal acik={!!detayModal} kapat={() => setDetayModal(null)}
        baslik={`👨‍🎓 ${detayModal?.ad} ${detayModal?.soyad}`} genislik="700px">
        {detayModal && (() => {
          const sube      = SUBELER.find(s => s.id === detayModal.subeId);
          const sirket    = SIRKETLER.find(s => s.id === sube?.sirketId);
          const odemeOrani= detayModal.toplamUcret > 0 ? Math.round((detayModal.odenenUcret / detayModal.toplamUcret) * 100) : 0;
          const psikoMu   = isPsiko(detayModal);
          const guncel    = liste.find(o => o.id === detayModal.id) || detayModal;

          return (
            <>
              {/* Üst kart */}
              <div style={{ background:'linear-gradient(135deg,#1E3A5F,#0F2140)', borderRadius:'14px', padding:'18px', marginBottom:'16px', display:'flex', alignItems:'center', gap:'16px' }}>
                <div style={{ width:'52px', height:'52px', borderRadius:'50%', background:sirket?.renk+'30', border:`2px solid ${sirket?.renk}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'26px', flexShrink:0 }}>
                  {psikoMu ? '🧠' : sirket?.ikon}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'20px', fontWeight:'800', color:'white' }}>{guncel.ad} {guncel.soyad}</div>
                  <div style={{ fontSize:'13px', color:'#94A3B8', marginTop:'3px' }}>TC: {guncel.tc} · {guncel.telefon}</div>
                  <div style={{ fontSize:'12px', color:'#93C5FD', marginTop:'3px' }}>{sirket?.ikon} {sube?.ad}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  {psikoMu && <TestSonucBadge sonuc={guncel.psiko?.testSonucu} buyuk />}
                  <div style={{ marginTop:'6px' }}>
                    <span style={{
                      padding:'5px 14px', borderRadius:'12px', fontSize:'12px', fontWeight:'700',
                      background: guncel.durum==='tamamladi'?'rgba(21,128,61,0.3)':guncel.durum==='devam_ediyor'?'rgba(245,158,11,0.3)':'rgba(220,38,38,0.3)',
                      color: guncel.durum==='tamamladi'?'#6EE7B7':guncel.durum==='devam_ediyor'?'#FDE68A':'#FCA5A5',
                    }}>
                      {guncel.durum==='tamamladi'?'✅ Tamamladı':guncel.durum==='devam_ediyor'?'🔄 Devam':'❌ İptal'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sekmeler */}
              <div className="tab-bar" style={{ marginBottom:'16px' }}>
                <div className={`tab-item ${detaySekme==='bilgiler'?'aktif':''}`} onClick={()=>setDetaySekme('bilgiler')}>📋 Bilgiler</div>
                <div className={`tab-item ${detaySekme==='odeme'?'aktif':''}`} onClick={()=>setDetaySekme('odeme')}>💳 Ödeme</div>
                {psikoMu && (
                  <div className={`tab-item ${detaySekme==='psiko'?'aktif':''}`} onClick={()=>setDetaySekme('psiko')}>
                    🧠 Psikoteknik
                    {guncel.psiko?.testSonucu && (
                      <span style={{ marginLeft:'6px', background: guncel.psiko.testSonucu==='basarili'?'#10B981':'#EF4444', color:'white', borderRadius:'10px', padding:'1px 6px', fontSize:'10px', fontWeight:'700' }}>
                        {guncel.psiko.testSonucu==='basarili'?'✅':'❌'}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* BİLGİLER */}
              {detaySekme === 'bilgiler' && (
                <div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', marginBottom:'16px' }}>
                    <InfoSatir etiket="TC Kimlik" deger={guncel.tc} />
                    <InfoSatir etiket="Telefon"   deger={guncel.telefon} />
                    <InfoSatir etiket="E-posta"   deger={guncel.email} />
                    <InfoSatir etiket="Kayıt Tarihi" deger={guncel.kayitTarihi} />
                    <InfoSatir etiket="Kurs Tipi" deger={guncel.kurstipi} renk={sirket?.renk} />
                    <InfoSatir etiket="Şube"      deger={`${sirket?.ikon} ${sube?.ilce}`} />
                  </div>
                  <div style={{ display:'flex', gap:'8px' }}>
                    <button className="btn btn-primary" style={{ flex:1 }} onClick={() => { setDetayModal(null); acDuzenle(guncel); }}>✏️ Düzenle</button>
                    <button className="btn btn-success" style={{ flex:1 }} onClick={() => { setDetayModal(null); setOdemeModal(guncel); setYeniOdeme(''); }}>💳 Ödeme Al</button>
                    {psikoMu && <button className="btn btn-secondary" style={{ flex:1 }} onClick={()=>setDetaySekme('psiko')}>🧠 Psikoteknik</button>}
                    <button className="btn btn-danger btn-sm" onClick={() => setSilOnay(guncel)}>🗑️</button>
                  </div>
                </div>
              )}

              {/* ÖDEME */}
              {detaySekme === 'odeme' && (
                <div>
                  <div style={{ background:'#F8FAFC', borderRadius:'12px', padding:'16px', marginBottom:'16px', border:'1px solid #E2E8F0' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                      <span style={{ fontWeight:'600', fontSize:'13px' }}>Ödeme Durumu</span>
                      <span style={{ fontWeight:'800', color: odemeOrani===100?'#15803D':'#3B82F6' }}>%{odemeOrani}</span>
                    </div>
                    <div style={{ height:'12px', background:'#E2E8F0', borderRadius:'20px', overflow:'hidden', marginBottom:'12px' }}>
                      <div style={{ height:'100%', background: odemeOrani===100?'#10B981':'#3B82F6', borderRadius:'20px', width:`${odemeOrani}%`, transition:'width 0.4s' }} />
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px' }}>
                      <InfoSatir etiket="Toplam Ücret"  deger={`₺${guncel.toplamUcret.toLocaleString('tr-TR')}`} />
                      <InfoSatir etiket="Ödenen"         deger={`₺${guncel.odenenUcret.toLocaleString('tr-TR')}`} renk="#15803D" />
                      <InfoSatir etiket="Kalan"          deger={`₺${(guncel.toplamUcret-guncel.odenenUcret).toLocaleString('tr-TR')}`} renk={guncel.toplamUcret>guncel.odenenUcret?'#DC2626':'#15803D'} />
                    </div>
                  </div>
                  <button className="btn btn-success" style={{ width:'100%', padding:'12px' }}
                    onClick={() => { setDetayModal(null); setOdemeModal(guncel); setYeniOdeme(''); }}>
                    💳 Ödeme Al
                  </button>
                </div>
              )}

              {/* PSİKOTEKNİK */}
              {detaySekme === 'psiko' && psikoMu && (
                <PsikoPanel
                  ogr={guncel}
                  onGuncelle={(g) => { ogrenciGuncelle(g); setDetayModal(g); }}
                />
              )}
            </>
          );
        })()}
      </Modal>

      {/* ═══ YENİ / DÜZENLE MODAL ═══ */}
      <Modal
        acik={yeniModal || !!duzenleModal}
        kapat={() => { setYeniModal(false); setDuzenleModal(null); setForm(BOS_FORM); }}
        baslik={duzenleModal ? '✏️ Öğrenci Düzenle' : '+ Yeni Öğrenci Ekle'}
        genislik="640px"
      >
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          <FormAlani label="Ad *"      name="ad" />
          <FormAlani label="Soyad *"   name="soyad" />
          <FormAlani label="TC *"      name="tc" />
          <FormAlani label="Telefon"   name="telefon" />
          <FormAlani label="E-posta"   name="email" tip="email" />
          <FormAlani label="Kayıt Tarihi" name="kayitTarihi" tip="date" />
          <FormAlani label="Şube" name="subeId" options={SUBELER.map(s => ({ value:s.id, label:`${SIRKETLER.find(sr=>sr.id===s.sirketId)?.ikon||''} ${s.ad}` }))} />
          <FormAlani label="Kurs Tipi" name="kurstipi" options={[
            'A Sınıfı','A1','A2','B Sınıfı','C Sınıfı','D Sınıfı','E Sınıfı',
            'SRC 2','SRC 4','SRC 5','Forklift','Vinç','Ekskavatör',
            'Psikoteknik','TMGD Temel','TMGD Yenileme',
          ].map(k => ({ value:k, label:k }))} />
          <FormAlani label="Toplam Ücret (₺)" name="toplamUcret" tip="number" />
          <FormAlani label="Ödenen Ücret (₺)" name="odenenUcret" tip="number" />
          <FormAlani label="Durum" name="durum" options={[
            { value:'devam_ediyor', label:'🔄 Devam Ediyor' },
            { value:'tamamladi',   label:'✅ Tamamladı' },
            { value:'iptal',       label:'❌ İptal' },
          ]} />
        </div>

        {/* Psikoteknik alanları */}
        {formPsikoMu && (
          <div style={{ marginTop:'16px', background:'linear-gradient(135deg,#F5F3FF,#EDE9FE)', border:'2px solid #C4B5FD', borderRadius:'12px', padding:'16px' }}>
            <div style={{ fontWeight:'800', color:'#5B21B6', fontSize:'14px', marginBottom:'14px' }}>🧠 Psikoteknik Bilgileri</div>

            {/* Randevu Tarihi & Saati */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'14px' }}>
              <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                <label style={{ fontSize:'12px', fontWeight:'700', color:'#374151' }}>📅 Test Randevu Tarihi</label>
                <input type="date" style={{ padding:'9px 12px', border:'1.5px solid #C4B5FD', borderRadius:'8px', fontSize:'14px', outline:'none', background:'white' }}
                  value={form.randevuTarihi||''} onChange={e => setForm(p => ({ ...p, randevuTarihi:e.target.value }))} />
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                <label style={{ fontSize:'12px', fontWeight:'700', color:'#374151' }}>🕐 Test Randevu Saati</label>
                <input type="time" style={{ padding:'9px 12px', border:'1.5px solid #C4B5FD', borderRadius:'8px', fontSize:'14px', outline:'none', background:'white' }}
                  value={form.randevuSaati||''} onChange={e => setForm(p => ({ ...p, randevuSaati:e.target.value }))} />
              </div>
            </div>

            {/* Hızlı saat seçimi */}
            {form.randevuTarihi && (
              <div style={{ marginBottom:'14px' }}>
                <div style={{ fontSize:'11px', fontWeight:'700', color:'#7C3AED', marginBottom:'6px' }}>⚡ Hızlı Saat Seç</div>
                <div style={{ display:'flex', gap:'5px', flexWrap:'wrap' }}>
                  {['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00'].map(s => (
                    <button key={s} type="button"
                      onClick={() => setForm(p => ({ ...p, randevuSaati: s }))}
                      style={{
                        padding:'4px 9px', borderRadius:'7px', border:'1.5px solid',
                        fontSize:'11px', fontWeight:'600', cursor:'pointer',
                        background: form.randevuSaati === s ? '#7C3AED' : '#F5F3FF',
                        borderColor: form.randevuSaati === s ? '#7C3AED' : '#C4B5FD',
                        color: form.randevuSaati === s ? 'white' : '#5B21B6',
                      }}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Test Sonucu */}
            <div>
              <div style={{ fontSize:'12px', fontWeight:'700', color:'#374151', marginBottom:'8px' }}>🧪 Test Sonucu <span style={{ fontWeight:'400', color:'#94A3B8' }}>(opsiyonel — kayıt sonrası da girilebilir)</span></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px' }}>
                {[
                  { v:'',           l:'⏳ Belirsiz',   bg:'#F8FAFC', renk:'#64748B', sel:'#94A3B8', desc:'Henüz bilinmiyor' },
                  { v:'basarili',   l:'✅ BAŞARILI',   bg:'#DCFCE7', renk:'#14532D', sel:'#16A34A', desc:'Tüm testleri geçti' },
                  { v:'basarisiz',  l:'❌ BAŞARISIZ',  bg:'#FEE2E2', renk:'#7F1D1D', sel:'#DC2626', desc:'Yeniden sınav gerek' },
                ].map(opt => (
                  <button key={opt.v} type="button"
                    onClick={() => setForm(p => ({ ...p, testSonucu: opt.v }))}
                    style={{
                      padding:'12px 8px', borderRadius:'10px',
                      border:`2px solid ${form.testSonucu === opt.v ? opt.sel : '#E2E8F0'}`,
                      background: form.testSonucu === opt.v ? opt.bg : 'white',
                      cursor:'pointer', transition:'all 0.15s', textAlign:'center',
                      transform: form.testSonucu === opt.v ? 'scale(1.02)' : 'scale(1)',
                      boxShadow: form.testSonucu === opt.v ? `0 3px 10px ${opt.sel}40` : 'none',
                    }}>
                    <div style={{ fontSize:'13px', fontWeight:'800', color: form.testSonucu === opt.v ? opt.renk : '#94A3B8' }}>{opt.l}</div>
                    <div style={{ fontSize:'10px', color: form.testSonucu === opt.v ? opt.renk : '#CBD5E1', marginTop:'3px', opacity: 0.85 }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Randevu önizleme */}
            {(form.randevuTarihi || form.randevuSaati || form.testSonucu) && (
              <div style={{ marginTop:'12px', background:'rgba(255,255,255,0.7)', borderRadius:'10px', padding:'10px 14px', border:'1px solid #C4B5FD', display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
                {form.randevuTarihi && (
                  <span style={{ fontSize:'13px', fontWeight:'700', color:'#5B21B6' }}>📅 {form.randevuTarihi}</span>
                )}
                {form.randevuSaati && (
                  <span style={{ fontSize:'13px', fontWeight:'700', color:'#7C3AED' }}>🕐 {form.randevuSaati}</span>
                )}
                {form.testSonucu === 'basarili' && (
                  <span style={{ background:'#DCFCE7', color:'#14532D', border:'1.5px solid #86EFAC', padding:'3px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'700' }}>✅ BAŞARILI</span>
                )}
                {form.testSonucu === 'basarisiz' && (
                  <span style={{ background:'#FEE2E2', color:'#7F1D1D', border:'1.5px solid #FCA5A5', padding:'3px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'700' }}>❌ BAŞARISIZ</span>
                )}
              </div>
            )}
          </div>
        )}

        <div style={{ display:'flex', gap:'8px', marginTop:'20px', justifyContent:'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => { setYeniModal(false); setDuzenleModal(null); setForm(BOS_FORM); }}>İptal</button>
          <button className="btn btn-primary" onClick={kaydet}>{duzenleModal ? '💾 Güncelle' : '✅ Kaydet'}</button>
        </div>
      </Modal>

      {/* ═══ ÖDEME MODAL ═══ */}
      <Modal acik={!!odemeModal} kapat={() => { setOdemeModal(null); setYeniOdeme(''); }} baslik="💳 Ödeme Al" genislik="420px">
        {odemeModal && (
          <>
            <div style={{ background:'#F0FDF4', border:'1px solid #86EFAC', borderRadius:'12px', padding:'14px', marginBottom:'16px' }}>
              <div style={{ fontWeight:'800', fontSize:'15px', marginBottom:'4px' }}>{odemeModal.ad} {odemeModal.soyad}</div>
              <div style={{ fontSize:'13px', color:'#64748B', marginBottom:'10px' }}>Kurs: {odemeModal.kurstipi}</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px', fontSize:'13px' }}>
                <div style={{ textAlign:'center' }}><div style={{ fontWeight:'700' }}>₺{odemeModal.toplamUcret.toLocaleString('tr-TR')}</div><div style={{ fontSize:'11px', color:'#64748B' }}>Toplam</div></div>
                <div style={{ textAlign:'center' }}><div style={{ fontWeight:'700', color:'#15803D' }}>₺{odemeModal.odenenUcret.toLocaleString('tr-TR')}</div><div style={{ fontSize:'11px', color:'#64748B' }}>Ödenen</div></div>
                <div style={{ textAlign:'center' }}><div style={{ fontWeight:'700', color:'#DC2626' }}>₺{(odemeModal.toplamUcret-odemeModal.odenenUcret).toLocaleString('tr-TR')}</div><div style={{ fontSize:'11px', color:'#64748B' }}>Kalan</div></div>
              </div>
              <div style={{ height:'8px', background:'#E2E8F0', borderRadius:'20px', marginTop:'10px', overflow:'hidden' }}>
                <div style={{ height:'100%', background:'#10B981', borderRadius:'20px', width:`${Math.round(odemeModal.odenenUcret/odemeModal.toplamUcret*100)}%` }} />
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'6px', marginBottom:'12px' }}>
              <label style={{ fontSize:'13px', fontWeight:'700', color:'#374151' }}>Tahsil Edilecek Tutar (₺) *</label>
              <input type="number" style={{ padding:'12px', border:'1.5px solid #E2E8F0', borderRadius:'8px', fontSize:'20px', fontWeight:'700', textAlign:'center', outline:'none' }}
                placeholder="0" value={yeniOdeme} onChange={e => setYeniOdeme(e.target.value)} />
              <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                {[500,1000,2000,2500,5000].map(t => (
                  <button key={t} style={{ padding:'5px 12px', background:'#F1F5F9', border:'1px solid #E2E8F0', borderRadius:'8px', fontSize:'12px', fontWeight:'600', cursor:'pointer' }}
                    onClick={() => setYeniOdeme(t.toString())}>₺{t.toLocaleString('tr-TR')}</button>
                ))}
                <button style={{ padding:'5px 12px', background:'#DCFCE7', border:'1px solid #86EFAC', borderRadius:'8px', fontSize:'12px', fontWeight:'700', color:'#15803D', cursor:'pointer' }}
                  onClick={() => setYeniOdeme((odemeModal.toplamUcret - odemeModal.odenenUcret).toString())}>Tamamı</button>
              </div>
            </div>
            <div style={{ display:'flex', gap:'8px' }}>
              <button className="btn btn-secondary" style={{ flex:1 }} onClick={() => { setOdemeModal(null); setYeniOdeme(''); }}>İptal</button>
              <button className="btn btn-success" style={{ flex:1 }} onClick={odemeEkleDuzgun}>✅ Ödemeyi Kaydet</button>
            </div>
          </>
        )}
      </Modal>

      {/* ═══ SİL ONAY ═══ */}
      <Modal acik={!!silOnay} kapat={() => setSilOnay(null)} baslik="🗑️ Öğrenci Sil" genislik="380px">
        {silOnay && (
          <>
            <div style={{ textAlign:'center', padding:'8px 0 20px' }}>
              <div style={{ fontSize:'52px', marginBottom:'12px' }}>⚠️</div>
              <p style={{ fontSize:'15px', fontWeight:'600', color:'#374151' }}>
                <b>{silOnay.ad} {silOnay.soyad}</b> isimli öğrenciyi silmek istediğinizden emin misiniz?
              </p>
              <p style={{ fontSize:'13px', color:'#EF4444', marginTop:'8px' }}>Bu işlem geri alınamaz!</p>
            </div>
            <div style={{ display:'flex', gap:'8px' }}>
              <button className="btn btn-secondary" style={{ flex:1 }} onClick={() => setSilOnay(null)}>Vazgeç</button>
              <button className="btn btn-danger" style={{ flex:1 }} onClick={() => sil(silOnay.id)}>🗑️ Evet, Sil</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
