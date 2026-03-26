import React, { useState, useMemo } from 'react';
import Modal from '../components/Modal';

// ─── BAŞLANGIÇ VERİSİ ──────────────────────────────────────
const BASLANGIC_MULKLER = [
  {
    id: 1, ad: 'Kadıköy İş Merkezi', adres: 'Kadıköy, İstanbul', tip: 'ofis',
    kiraci: 'ABC Ltd. Şti.', kiraci_telefon: '0216 555 11 22', kiraci_email: 'info@abc.com',
    aylikKira: 25000, depozito: 75000,
    sozlesmeBaslangic: '2024-02-01', sozlesmeBitis: '2025-01-31',
    yenilemeAktif: true, yenilemeOrani: 25,
    durum: 'aktif',
  },
  {
    id: 2, ad: 'Bağcılar Dükkan', adres: 'Bağcılar, İstanbul', tip: 'dukkan',
    kiraci: 'XYZ A.Ş.', kiraci_telefon: '0212 444 33 11', kiraci_email: 'xyz@mail.com',
    aylikKira: 18000, depozito: 54000,
    sozlesmeBaslangic: '2024-10-01', sozlesmeBitis: '2025-09-30',
    yenilemeAktif: true, yenilemeOrani: 20,
    durum: 'aktif',
  },
  {
    id: 3, ad: 'Ankara Depo', adres: 'Etimesgut, Ankara', tip: 'depo',
    kiraci: 'DEF Kargo', kiraci_telefon: '0312 222 77 88', kiraci_email: '',
    aylikKira: 12000, depozito: 36000,
    sozlesmeBaslangic: '2024-07-01', sozlesmeBitis: '2025-06-30',
    yenilemeAktif: false, yenilemeOrani: 15,
    durum: 'aktif',
  },
  {
    id: 4, ad: 'İzmir Ofis', adres: 'Konak, İzmir', tip: 'ofis',
    kiraci: '', kiraci_telefon: '', kiraci_email: '',
    aylikKira: 0, depozito: 0,
    sozlesmeBaslangic: '', sozlesmeBitis: '',
    yenilemeAktif: false, yenilemeOrani: 20,
    durum: 'bos',
  },
  {
    id: 5, ad: 'Ümraniye Daire', adres: 'Ümraniye, İstanbul', tip: 'daire',
    kiraci: 'Ali Veli', kiraci_telefon: '0535 666 55 44', kiraci_email: '',
    aylikKira: 8500, depozito: 17000,
    sozlesmeBaslangic: '2025-01-01', sozlesmeBitis: '2025-12-31',
    yenilemeAktif: true, yenilemeOrani: 30,
    durum: 'aktif',
  },
];

// ─── ÖDEME KAYITLARI: her mülk için aylık ödemeler üretiriz ──
const odemelerUret = (mulkler) => {
  const liste = [];
  let nextId = 1;
  const bugun = new Date();

  mulkler.forEach(m => {
    if (m.durum !== 'aktif' || !m.sozlesmeBaslangic) return;
    const bas = new Date(m.sozlesmeBaslangic);
    const bit = new Date(m.sozlesmeBitis || m.sozlesmeBaslangic);
    let cur = new Date(bas.getFullYear(), bas.getMonth(), 1);
    const son = new Date(bit.getFullYear(), bit.getMonth(), 1);
    while (cur <= son) {
      const vadeTarihi = new Date(cur.getFullYear(), cur.getMonth(), 1)
        .toISOString().split('T')[0];
      const vadeDt = new Date(vadeTarihi);
      let durum;
      if (vadeDt < new Date(bugun.getFullYear(), bugun.getMonth(), 1)) {
        const ayFarki = (bugun.getFullYear() - vadeDt.getFullYear()) * 12 + (bugun.getMonth() - vadeDt.getMonth());
        durum = ayFarki >= 2 ? 'odendi' : 'gecikme';
      } else {
        durum = 'bekliyor';
      }
      liste.push({
        id: nextId++,
        mulkId: m.id,
        vadeTarihi,
        tutar: m.aylikKira,
        odenenTutar: durum === 'odendi' ? m.aylikKira : 0,
        odenmeTarihi: durum === 'odendi' ? vadeTarihi : null,
        durum,
      });
      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
    }
  });
  return liste;
};

// ─── YARDIMCI ──────────────────────────────────────────────
const TIP_IKONLARI = { ofis: '🏢', dukkan: '🏪', depo: '🏭', daire: '🏠', arsa: '🌿', fabrika: '🏭', diger: '🏗️' };
const TIPLER = ['ofis', 'dukkan', 'depo', 'daire', 'arsa', 'fabrika', 'diger'];
const AY_ADLARI = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

const BOSFORM = {
  ad:'', adres:'', tip:'daire', kiraci:'', kiraci_telefon:'', kiraci_email:'',
  aylikKira:'', depozito:'', sozlesmeBaslangic:'', sozlesmeBitis:'',
  yenilemeAktif: false, yenilemeOrani:'20', durum:'aktif',
};

// ─── DURUM BADGE (ÖDENDİ / GECİKMEDE / BEKLİYOR) ──────────
function DurumBadge({ durum, buyuk }) {
  const base = {
    padding: buyuk ? '6px 16px' : '4px 12px',
    borderRadius: '20px',
    fontSize: buyuk ? '13px' : '12px',
    fontWeight: '700',
    whiteSpace: 'nowrap',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    letterSpacing: '0.3px',
  };

  if (durum === 'odendi')
    return <span style={{ ...base, background: '#DCFCE7', color: '#14532D', border: '1.5px solid #86EFAC' }}>
      ✅ ÖDENDİ
    </span>;

  if (durum === 'gecikme')
    return <span style={{ ...base, background: '#FEE2E2', color: '#7F1D1D', border: '1.5px solid #FCA5A5', animation: 'pulse 2s infinite' }}>
      🔴 GECİKMEDE
    </span>;

  return <span style={{ ...base, background: '#FEF9C3', color: '#713F12', border: '1.5px solid #FDE68A' }}>
    ⏳ BEKLİYOR
  </span>;
}

function InfoSatir({ etiket, deger, renk }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', background:'#F8FAFC', borderRadius:'8px', padding:'11px 14px', border:'1px solid #E2E8F0' }}>
      <span style={{ fontSize:'10px', color:'#64748B', marginBottom:'3px', textTransform:'uppercase', letterSpacing:'0.6px', fontWeight:'600' }}>{etiket}</span>
      <span style={{ fontSize:'14px', fontWeight:'600', color: renk || '#1E293B' }}>{deger || '—'}</span>
    </div>
  );
}

// ─── AY AY ÖDEME TABLOSU ────────────────────────────────────
function AyAyOdemeler({ mulk, odemeler, setOdemeler }) {
  const [siralama, setSiralama] = useState('yeni'); // 'yeni' | 'eski'

  const mulkOdemeleri = odemeler
    .filter(o => o.mulkId === mulk.id)
    .sort((a, b) => siralama === 'yeni'
      ? new Date(b.vadeTarihi) - new Date(a.vadeTarihi)
      : new Date(a.vadeTarihi) - new Date(b.vadeTarihi));

  const toplamBorc   = mulkOdemeleri.reduce((s, o) => s + o.tutar, 0);
  const toplamOdenen = mulkOdemeleri.reduce((s, o) => s + o.odenenTutar, 0);
  const toplamKalan  = toplamBorc - toplamOdenen;
  const gecikmeAdet  = mulkOdemeleri.filter(o => o.durum === 'gecikme').length;
  const bugun        = new Date();

  const ode = (id) => {
    const bugunStr = bugun.toISOString().split('T')[0];
    setOdemeler(prev => prev.map(o =>
      o.id === id ? { ...o, durum: 'odendi', odenenTutar: o.tutar, odenmeTarihi: bugunStr } : o
    ));
  };

  return (
    <div>
      {/* Özet Kartlar */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px', marginBottom:'16px' }}>
        <div style={{ background:'linear-gradient(135deg,#DBEAFE,#EFF6FF)', borderRadius:'12px', padding:'14px 12px', textAlign:'center', border:'1px solid #BFDBFE' }}>
          <div style={{ fontSize:'20px', fontWeight:'800', color:'#1D4ED8' }}>₺{toplamBorc.toLocaleString('tr-TR')}</div>
          <div style={{ fontSize:'11px', color:'#3B82F6', fontWeight:'600', marginTop:'2px' }}>TOPLAM BORÇ</div>
        </div>
        <div style={{ background:'linear-gradient(135deg,#DCFCE7,#F0FDF4)', borderRadius:'12px', padding:'14px 12px', textAlign:'center', border:'1px solid #86EFAC' }}>
          <div style={{ fontSize:'20px', fontWeight:'800', color:'#15803D' }}>₺{toplamOdenen.toLocaleString('tr-TR')}</div>
          <div style={{ fontSize:'11px', color:'#16A34A', fontWeight:'600', marginTop:'2px' }}>ÖDENEN</div>
        </div>
        <div style={{ background: toplamKalan > 0 ? 'linear-gradient(135deg,#FEE2E2,#FFF5F5)' : 'linear-gradient(135deg,#DCFCE7,#F0FDF4)', borderRadius:'12px', padding:'14px 12px', textAlign:'center', border: toplamKalan > 0 ? '1px solid #FCA5A5' : '1px solid #86EFAC' }}>
          <div style={{ fontSize:'20px', fontWeight:'800', color: toplamKalan > 0 ? '#DC2626' : '#15803D' }}>₺{toplamKalan.toLocaleString('tr-TR')}</div>
          <div style={{ fontSize:'11px', color: toplamKalan > 0 ? '#EF4444' : '#16A34A', fontWeight:'600', marginTop:'2px' }}>KALAN</div>
        </div>
        <div style={{ background: gecikmeAdet > 0 ? 'linear-gradient(135deg,#FEF3C7,#FEF9C3)' : 'linear-gradient(135deg,#F1F5F9,#F8FAFC)', borderRadius:'12px', padding:'14px 12px', textAlign:'center', border: gecikmeAdet > 0 ? '1px solid #FDE68A' : '1px solid #E2E8F0' }}>
          <div style={{ fontSize:'20px', fontWeight:'800', color: gecikmeAdet > 0 ? '#D97706' : '#94A3B8' }}>{gecikmeAdet}</div>
          <div style={{ fontSize:'11px', color: gecikmeAdet > 0 ? '#F59E0B' : '#94A3B8', fontWeight:'600', marginTop:'2px' }}>GECİKMEDE</div>
        </div>
      </div>

      {/* Tablo Başlık & Sıralama */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
        <div style={{ fontSize:'13px', fontWeight:'600', color:'#374151' }}>
          {mulkOdemeleri.length} dönem kaydı
        </div>
        <div style={{ display:'flex', gap:'6px' }}>
          {['yeni','eski'].map(s => (
            <button key={s} onClick={() => setSiralama(s)}
              style={{ padding:'5px 12px', borderRadius:'6px', border:'1.5px solid', fontSize:'12px', fontWeight:'600', cursor:'pointer',
                background: siralama===s ? '#3B82F6' : 'white',
                borderColor: siralama===s ? '#3B82F6' : '#E2E8F0',
                color: siralama===s ? 'white' : '#64748B' }}>
              {s === 'yeni' ? '↓ En Yeni' : '↑ En Eski'}
            </button>
          ))}
        </div>
      </div>

      {/* Tablo */}
      <div style={{ overflowX:'auto', borderRadius:'10px', border:'1px solid #E2E8F0' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
          <thead>
            <tr style={{ background:'linear-gradient(135deg,#1E3A5F,#0F2140)' }}>
              {['Dönem','Vade Tarihi','Kira Bedeli','Ödenen Tutar','Ödeme Tarihi','Kalan','Durum','İşlem'].map(h => (
                <th key={h} style={{ padding:'11px 12px', textAlign:'left', fontSize:'11px', fontWeight:'700', color:'#CBD5E1', whiteSpace:'nowrap', letterSpacing:'0.4px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mulkOdemeleri.map((o, idx) => {
              const dt         = new Date(o.vadeTarihi);
              const kalan      = o.tutar - o.odenenTutar;
              const gecikmisMi = o.durum === 'gecikme';
              const odendi     = o.durum === 'odendi';
              const bekliyor   = o.durum === 'bekliyor';

              return (
                <tr key={o.id}
                  style={{
                    borderBottom: '1px solid #F1F5F9',
                    background: gecikmisMi
                      ? 'linear-gradient(90deg,#FFF5F5,#FFFBFB)'
                      : odendi
                        ? 'linear-gradient(90deg,#F0FFF4,#F7FFF8)'
                        : idx % 2 === 0 ? 'white' : '#FAFBFF',
                    transition: 'all 0.2s',
                  }}>

                  {/* Dönem */}
                  <td style={{ padding:'12px 12px', fontWeight:'700', color:'#1E293B', fontSize:'14px' }}>
                    {AY_ADLARI[dt.getMonth()]} {dt.getFullYear()}
                  </td>

                  {/* Vade Tarihi */}
                  <td style={{ padding:'12px 12px' }}>
                    <div style={{ display:'flex', flexDirection:'column', gap:'2px' }}>
                      <span style={{
                        color: gecikmisMi ? '#DC2626' : '#374151',
                        fontWeight: gecikmisMi ? '700' : '500',
                        fontSize: '13px'
                      }}>
                        {o.vadeTarihi}
                      </span>
                      {gecikmisMi && (() => {
                        const gecikmeGun = Math.ceil((new Date() - new Date(o.vadeTarihi)) / (1000*60*60*24));
                        return <span style={{ fontSize:'10px', color:'#EF4444', fontWeight:'700' }}>⚠️ {gecikmeGun} gün gecikti</span>;
                      })()}
                    </div>
                  </td>

                  {/* Kira Bedeli */}
                  <td style={{ padding:'12px 12px', fontWeight:'700', color:'#1E293B', fontSize:'14px' }}>
                    ₺{o.tutar.toLocaleString('tr-TR')}
                  </td>

                  {/* Ödenen Tutar */}
                  <td style={{ padding:'12px 12px' }}>
                    {o.odenenTutar > 0 ? (
                      <span style={{ fontWeight:'700', color:'#15803D', fontSize:'14px' }}>
                        ₺{o.odenenTutar.toLocaleString('tr-TR')}
                      </span>
                    ) : (
                      <span style={{ color:'#CBD5E1', fontSize:'13px' }}>—</span>
                    )}
                  </td>

                  {/* Ödeme Tarihi */}
                  <td style={{ padding:'12px 12px' }}>
                    {o.odenmeTarihi ? (
                      <span style={{ fontSize:'12px', color:'#374151', background:'#F0FDF4', padding:'3px 8px', borderRadius:'6px', border:'1px solid #86EFAC' }}>
                        📅 {o.odenmeTarihi}
                      </span>
                    ) : (
                      <span style={{ color:'#CBD5E1', fontSize:'13px' }}>—</span>
                    )}
                  </td>

                  {/* Kalan */}
                  <td style={{ padding:'12px 12px' }}>
                    {kalan > 0 ? (
                      <span style={{ fontWeight:'800', color:'#DC2626', fontSize:'14px' }}>
                        ₺{kalan.toLocaleString('tr-TR')}
                      </span>
                    ) : (
                      <span style={{ color:'#15803D', fontWeight:'700', fontSize:'13px' }}>✔ Tamam</span>
                    )}
                  </td>

                  {/* Durum */}
                  <td style={{ padding:'12px 12px' }}>
                    <DurumBadge durum={o.durum} />
                  </td>

                  {/* İşlem */}
                  <td style={{ padding:'12px 12px' }}>
                    {!odendi ? (
                      <button
                        onClick={() => ode(o.id)}
                        style={{
                          background: gecikmisMi
                            ? 'linear-gradient(135deg,#DC2626,#B91C1C)'
                            : 'linear-gradient(135deg,#3B82F6,#2563EB)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '7px 16px',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          boxShadow: gecikmisMi
                            ? '0 3px 10px rgba(220,38,38,0.4)'
                            : '0 3px 10px rgba(59,130,246,0.35)',
                          transition: 'all 0.15s',
                          letterSpacing: '0.3px',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.opacity = '0.9'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.opacity = '1'; }}
                      >
                        {gecikmisMi ? '⚠️ ÖDE' : '💳 ÖDE'}
                      </button>
                    ) : (
                      <div style={{
                        background: 'linear-gradient(135deg,#DCFCE7,#BBF7D0)',
                        border: '1.5px solid #4ADE80',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#14532D',
                        whiteSpace: 'nowrap',
                        textAlign: 'center',
                      }}>
                        ✅ ÖDENDİ
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {mulkOdemeleri.length === 0 && (
        <div style={{ textAlign:'center', padding:'40px', color:'#64748B' }}>
          Bu mülke ait ödeme kaydı bulunamadı.
        </div>
      )}
    </div>
  );
}

// ─── SÖZLEŞME YENİLEME KARTI ───────────────────────────────
function SozlesmeKarti({ mulk, onYenile }) {
  const [oran, setOran] = useState(mulk.yenilemeOrani || 20);
  const [suereYil, setSureYil] = useState(1);
  const yeniKira  = Math.round(mulk.aylikKira * (1 + oran / 100));
  const artis     = yeniKira - mulk.aylikKira;

  if (!mulk.sozlesmeBitis && !mulk.sozlesmeBaslangic) return (
    <div style={{ background:'#F8FAFC', borderRadius:'12px', padding:'20px', textAlign:'center', color:'#64748B' }}>
      Bu mülk için henüz sözleşme tarihi girilmemiş.
    </div>
  );

  const bitDt    = new Date(mulk.sozlesmeBitis || mulk.sozlesmeBaslangic);
  const bugun    = new Date();
  const kalanGun = Math.ceil((bitDt - bugun) / (1000 * 60 * 60 * 24));
  const yaklasiyor = kalanGun <= 60;
  const suruldu    = kalanGun <= 0;

  return (
    <div>
      {/* Sözleşme Durum Kartı */}
      <div style={{
        background: suruldu
          ? 'linear-gradient(135deg,#FEE2E2,#FFF5F5)'
          : yaklasiyor
            ? 'linear-gradient(135deg,#FEF9C3,#FFFBF0)'
            : 'linear-gradient(135deg,#DCFCE7,#F0FFF4)',
        border: `2px solid ${suruldu ? '#FCA5A5' : yaklasiyor ? '#FDE68A' : '#86EFAC'}`,
        borderRadius: '14px',
        padding: '20px',
        marginBottom: '16px',
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
          <div style={{ fontSize:'15px', fontWeight:'800', color: suruldu ? '#991B1B' : yaklasiyor ? '#92400E' : '#14532D' }}>
            {suruldu ? '❗ Sözleşme Süresi Doldu!' : yaklasiyor ? '⚠️ Sözleşme Yakında Bitiyor!' : '✅ Aktif Sözleşme'}
          </div>
          <span style={{
            background: suruldu ? '#FEE2E2' : yaklasiyor ? '#FEF9C3' : '#DCFCE7',
            color: suruldu ? '#991B1B' : yaklasiyor ? '#92400E' : '#15803D',
            border: `1px solid ${suruldu ? '#FCA5A5' : yaklasiyor ? '#FDE68A' : '#86EFAC'}`,
            padding: '5px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '700',
          }}>
            {suruldu ? 'Süresi Doldu' : kalanGun === 0 ? 'Bugün Bitiyor' : `${kalanGun} gün kaldı`}
          </span>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
          <InfoSatir etiket="Sözleşme Başlangıcı" deger={mulk.sozlesmeBaslangic} />
          <InfoSatir etiket="Sözleşme Bitişi" deger={mulk.sozlesmeBitis} />
          <InfoSatir etiket="Mevcut Aylık Kira" deger={`₺${mulk.aylikKira.toLocaleString('tr-TR')}`} renk="#15803D" />
          <InfoSatir etiket="Depozito" deger={`₺${mulk.depozito.toLocaleString('tr-TR')}`} />
        </div>
      </div>

      {/* Otomatik Yenileme Paneli */}
      {mulk.yenilemeAktif && (
        <div style={{
          background: 'linear-gradient(135deg,#F5F3FF,#EDE9FE)',
          border: '2px solid #C4B5FD',
          borderRadius: '14px',
          padding: '20px',
        }}>
          <div style={{ fontWeight:'800', fontSize:'15px', color:'#5B21B6', marginBottom:'16px' }}>
            🔄 Otomatik Yenileme Hesaplayıcı
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'16px' }}>
            {/* Artış Oranı */}
            <div style={{ background:'white', borderRadius:'10px', padding:'14px', border:'1px solid #DDD6FE' }}>
              <div style={{ fontSize:'11px', fontWeight:'700', color:'#7C3AED', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'8px' }}>
                Artış Oranı
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <input
                  type="number"
                  value={oran}
                  min="0"
                  max="200"
                  onChange={e => setOran(parseFloat(e.target.value) || 0)}
                  style={{
                    flex:1, padding:'10px', border:'2px solid #8B5CF6', borderRadius:'8px',
                    fontSize:'20px', fontWeight:'800', textAlign:'center', color:'#5B21B6',
                    outline:'none',
                  }}
                />
                <span style={{ fontSize:'22px', fontWeight:'800', color:'#8B5CF6' }}>%</span>
              </div>
            </div>

            {/* Süre */}
            <div style={{ background:'white', borderRadius:'10px', padding:'14px', border:'1px solid #DDD6FE' }}>
              <div style={{ fontSize:'11px', fontWeight:'700', color:'#7C3AED', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'8px' }}>
                Yenileme Süresi
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <input
                  type="number"
                  value={suereYil}
                  min="1"
                  max="5"
                  onChange={e => setSureYil(parseInt(e.target.value) || 1)}
                  style={{
                    flex:1, padding:'10px', border:'2px solid #8B5CF6', borderRadius:'8px',
                    fontSize:'20px', fontWeight:'800', textAlign:'center', color:'#5B21B6',
                    outline:'none',
                  }}
                />
                <span style={{ fontSize:'16px', fontWeight:'700', color:'#8B5CF6' }}>Yıl</span>
              </div>
            </div>
          </div>

          {/* Fiyat Hesaplama Gösterimi */}
          <div style={{ background:'white', borderRadius:'10px', padding:'16px', border:'1px solid #DDD6FE', marginBottom:'14px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'16px', flexWrap:'wrap' }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:'11px', color:'#64748B', fontWeight:'600', marginBottom:'4px' }}>MEVCUT KİRA</div>
                <div style={{ fontSize:'22px', fontWeight:'800', color:'#374151' }}>₺{mulk.aylikKira.toLocaleString('tr-TR')}</div>
              </div>
              <div style={{ fontSize:'30px', color:'#8B5CF6' }}>→</div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:'11px', color:'#10B981', fontWeight:'600', marginBottom:'4px' }}>YENİ KİRA</div>
                <div style={{ fontSize:'26px', fontWeight:'900', color:'#059669' }}>₺{yeniKira.toLocaleString('tr-TR')}</div>
              </div>
              <div style={{ background:'#DCFCE7', borderRadius:'10px', padding:'10px 16px', textAlign:'center', border:'1px solid #86EFAC' }}>
                <div style={{ fontSize:'11px', color:'#64748B', fontWeight:'600', marginBottom:'2px' }}>ARTIŞ</div>
                <div style={{ fontSize:'18px', fontWeight:'800', color:'#15803D' }}>
                  +₺{artis.toLocaleString('tr-TR')}
                </div>
                <div style={{ fontSize:'11px', color:'#16A34A', fontWeight:'600' }}>+%{oran}</div>
              </div>
              <div style={{ background:'#EDE9FE', borderRadius:'10px', padding:'10px 16px', textAlign:'center', border:'1px solid #C4B5FD' }}>
                <div style={{ fontSize:'11px', color:'#64748B', fontWeight:'600', marginBottom:'2px' }}>YILLIK GELİR</div>
                <div style={{ fontSize:'18px', fontWeight:'800', color:'#5B21B6' }}>
                  ₺{(yeniKira * 12).toLocaleString('tr-TR')}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onYenile(mulk.id, oran, yeniKira, suereYil)}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg,#7C3AED,#5B21B6)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '14px',
              fontSize: '15px',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(124,58,237,0.4)',
              letterSpacing: '0.5px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(124,58,237,0.4)'; }}
          >
            🔄 Sözleşmeyi Yenile — ₺{yeniKira.toLocaleString('tr-TR')}/ay ({suereYil} yıl)
          </button>
        </div>
      )}

      {!mulk.yenilemeAktif && (
        <div style={{ background:'#F8FAFC', borderRadius:'10px', padding:'16px', textAlign:'center', color:'#64748B', border:'1px solid #E2E8F0' }}>
          Bu mülk için otomatik yenileme aktif değil. Düzenle butonundan aktifleştirebilirsiniz.
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  ANA SAYFA
// ═══════════════════════════════════════════════════════════
export default function KiraPage() {
  const [mulkler, setMulkler] = useState(BASLANGIC_MULKLER);
  const [odemeler, setOdemeler] = useState(() => odemelerUret(BASLANGIC_MULKLER));
  const [aktifTab, setAktifTab] = useState('mulkler');
  const [aramaMetni, setAramaMetni] = useState('');

  // Modallar
  const [detayMulk, setDetayMulk]   = useState(null);
  const [detaySekme, setDetaySekme] = useState('ozet');
  const [duzenleModal, setDuzenle]  = useState(null);
  const [yeniModal, setYeniModal]   = useState(false);
  const [silOnay, setSilOnay]       = useState(null);
  const [form, setForm]             = useState(BOSFORM);
  const [odemeModal, setOdemeModal] = useState(false);
  const [odemeForm, setOdemeForm]   = useState({
    mulkId: '', tarih: new Date().toISOString().split('T')[0],
    tutar: '', aciklama: '', durum: 'odendi'
  });

  // Hesaplar
  const toplamAylikKira  = useMemo(() => mulkler.filter(m=>m.durum==='aktif').reduce((s,m)=>s+m.aylikKira,0), [mulkler]);
  const toplamDepozito   = useMemo(() => mulkler.filter(m=>m.durum==='aktif').reduce((s,m)=>s+m.depozito,0), [mulkler]);
  const gecikmeCount     = useMemo(() => odemeler.filter(o=>o.durum==='gecikme').length, [odemeler]);
  const toplamKalan      = useMemo(() => odemeler.filter(o=>o.durum!=='odendi').reduce((s,o)=>s+(o.tutar-o.odenenTutar),0), [odemeler]);
  const toplamOdenen12ay = useMemo(() => {
    const sinir = new Date(); sinir.setMonth(sinir.getMonth()-11);
    return odemeler.filter(o=>o.durum==='odendi'&&new Date(o.vadeTarihi)>=sinir).reduce((s,o)=>s+o.odenenTutar,0);
  }, [odemeler]);

  const yaklasiyanSozlesmeler = useMemo(() =>
    mulkler.filter(m => {
      if (!m.sozlesmeBitis || m.durum !== 'aktif') return false;
      const kalan = Math.ceil((new Date(m.sozlesmeBitis) - new Date()) / (1000*60*60*24));
      return kalan <= 60;
    }), [mulkler]);

  const filtrelenmis = useMemo(() =>
    mulkler.filter(m =>
      m.ad.toLowerCase().includes(aramaMetni.toLowerCase()) ||
      (m.kiraci||'').toLowerCase().includes(aramaMetni.toLowerCase()) ||
      (m.adres||'').toLowerCase().includes(aramaMetni.toLowerCase())
    ), [mulkler, aramaMetni]);

  // Sözleşme yenile
  const sozlesmeYenile = (mulkId, oran, yeniKira, suereYil=1) => {
    setMulkler(prev => prev.map(m => {
      if (m.id !== mulkId) return m;
      const yeniBas = new Date(m.sozlesmeBitis);
      yeniBas.setDate(yeniBas.getDate() + 1);
      const yeniBit = new Date(yeniBas);
      yeniBit.setFullYear(yeniBit.getFullYear() + suereYil);
      yeniBit.setDate(yeniBit.getDate() - 1);
      const guncellenmis = {
        ...m,
        aylikKira: yeniKira,
        yenilemeOrani: oran,
        sozlesmeBaslangic: yeniBas.toISOString().split('T')[0],
        sozlesmeBitis: yeniBit.toISOString().split('T')[0],
      };
      const yeniOdemeler = odemelerUret([guncellenmis]);
      setOdemeler(o => [...o.filter(x=>x.mulkId !== mulkId), ...yeniOdemeler]);
      return guncellenmis;
    }));
    alert(`✅ Sözleşme başarıyla ${suereYil} yıl yenilendi!\nYeni aylık kira: ₺${yeniKira.toLocaleString('tr-TR')}`);
  };

  // Mülk kaydet
  const mulkKaydet = () => {
    if (!form.ad) { alert('Mülk adı zorunludur!'); return; }
    const obj = {
      ...form,
      aylikKira: parseFloat(form.aylikKira) || 0,
      depozito: parseFloat(form.depozito) || 0,
      yenilemeOrani: parseFloat(form.yenilemeOrani) || 0,
      yenilemeAktif: Boolean(form.yenilemeAktif),
    };
    if (duzenleModal) {
      setMulkler(prev => prev.map(m => m.id === duzenleModal.id ? { ...m, ...obj } : m));
      const yeniOdemeler = odemelerUret([{ ...duzenleModal, ...obj }]);
      setOdemeler(prev => [...prev.filter(o=>o.mulkId!==duzenleModal.id), ...yeniOdemeler]);
      setDuzenle(null);
    } else {
      const yeni = { ...obj, id: Date.now() };
      setMulkler(prev => [...prev, yeni]);
      const yeniOdemeler = odemelerUret([yeni]);
      setOdemeler(prev => [...prev, ...yeniOdemeler]);
      setYeniModal(false);
    }
    setForm(BOSFORM);
  };

  const mulkSil = id => {
    setMulkler(prev => prev.filter(m=>m.id!==id));
    setOdemeler(prev => prev.filter(o=>o.mulkId!==id));
    setSilOnay(null); setDetayMulk(null);
  };

  const acDuzenle = m => {
    setForm({ ...m, aylikKira: m.aylikKira?.toString(), depozito: m.depozito?.toString(), yenilemeOrani: m.yenilemeOrani?.toString() });
    setDuzenle(m);
  };

  const tekOdemeKaydet = () => {
    if (!odemeForm.mulkId || !odemeForm.tutar) { alert('Mülk ve tutar zorunludur!'); return; }
    const mulk = mulkler.find(m => m.id === parseInt(odemeForm.mulkId));
    setOdemeler(prev => [...prev, {
      ...odemeForm, id: Date.now(),
      mulkId: parseInt(odemeForm.mulkId),
      tutar: parseFloat(odemeForm.tutar) || mulk?.aylikKira || 0,
      odenenTutar: odemeForm.durum === 'odendi' ? (parseFloat(odemeForm.tutar) || 0) : 0,
      odenmeTarihi: odemeForm.durum === 'odendi' ? odemeForm.tarih : null,
      vadeTarihi: odemeForm.tarih,
    }]);
    setOdemeModal(false);
    setOdemeForm({ mulkId:'', tarih: new Date().toISOString().split('T')[0], tutar:'', aciklama:'', durum:'odendi' });
  };

  // Input helper
  const Inp = ({ label, name, tip='text', options, tam, zorunlu, form: f = form, setForm: sf = setForm }) => (
    <div style={{ display:'flex', flexDirection:'column', gap:'5px', gridColumn: tam ? '1/-1' : undefined }}>
      <label style={{ fontSize:'12px', fontWeight:'600', color:'#374151' }}>
        {label}{zorunlu && <span style={{color:'#EF4444'}}> *</span>}
      </label>
      {options ? (
        <select
          style={{ padding:'9px 12px', border:'1.5px solid #E2E8F0', borderRadius:'8px', fontSize:'14px', outline:'none', background:'white' }}
          value={f[name] ?? ''} onChange={e => sf(p => ({ ...p, [name]: e.target.value }))}>
          <option value="">Seçin...</option>
          {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
        </select>
      ) : (
        <input
          style={{ padding:'9px 12px', border:'1.5px solid #E2E8F0', borderRadius:'8px', fontSize:'14px', outline:'none' }}
          type={tip} value={f[name] ?? ''} onChange={e => sf(p => ({ ...p, [name]: e.target.value }))} placeholder={label} />
      )}
    </div>
  );

  // ─────────────────────────────────────────────────────────
  return (
    <div>
      <div className="sayfa-baslik">
        <h1>🏠 Kira Gelirleri</h1>
        <p>Mülk portföyü, sözleşme takibi ve aylık kira ödemeleri</p>
      </div>

      {/* Özet Kartlar */}
      <div className="ozet-kartlar">
        {[
          { ikon:'🏠', label:'Toplam Mülk',          deger: mulkler.length,                               bg:'#DBEAFE', renk:'#1D4ED8' },
          { ikon:'✅', label:'Kiralık Mülk',           deger: mulkler.filter(m=>m.durum==='aktif').length,  bg:'#DCFCE7', renk:'#15803D' },
          { ikon:'💰', label:'Aylık Kira Geliri',     deger:`₺${toplamAylikKira.toLocaleString('tr-TR')}`, bg:'#FEF9C3', renk:'#B45309' },
          { ikon:'🔑', label:'Boş Mülk',              deger: mulkler.filter(m=>m.durum==='bos').length,    bg:'#FEE2E2', renk:'#DC2626' },
          { ikon:'⚠️', label:'GECİKMEDE',              deger: gecikmeCount,                                 bg:'#FEE2E2', renk:'#DC2626' },
          { ikon:'💳', label:'Tahsil Bekleyen',        deger:`₺${toplamKalan.toLocaleString('tr-TR')}`,     bg:'#EDE9FE', renk:'#6D28D9' },
          { ikon:'🛡️', label:'Toplam Depozito',         deger:`₺${toplamDepozito.toLocaleString('tr-TR')}`,  bg:'#CFFAFE', renk:'#0E7490' },
          { ikon:'📄', label:'Yaklaşan Sözleşme',     deger: yaklasiyanSozlesmeler.length,                 bg:'#FEF9C3', renk:'#D97706' },
        ].map(k => (
          <div key={k.label} className="ozet-kart">
            <div className="kart-ikon" style={{ background:k.bg, fontSize:'20px' }}>{k.ikon}</div>
            <div className="kart-bilgi">
              <h3 style={{ color:k.renk, fontSize:'16px' }}>{k.deger}</h3>
              <p style={{ fontSize:'12px' }}>{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Yaklaşan sözleşme uyarısı */}
      {yaklasiyanSozlesmeler.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg,#FEF9C3,#FEF3C7)',
          border: '2px solid #FDE047',
          borderRadius: '12px',
          padding: '14px 18px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{ fontSize:'28px' }}>⚠️</span>
          <div>
            <div style={{ fontWeight:'800', color:'#92400E', fontSize:'14px', marginBottom:'3px' }}>
              Yaklaşan Sözleşme Bitişi — Hemen Yenileyin!
            </div>
            <div style={{ fontSize:'13px', color:'#78350F' }}>
              {yaklasiyanSozlesmeler.map(m => {
                const kalan = Math.ceil((new Date(m.sozlesmeBitis)-new Date())/(1000*60*60*24));
                return `${TIP_IKONLARI[m.tip]} ${m.ad} (${kalan > 0 ? kalan + ' gün' : 'Süresi doldu'})`;
              }).join('  ·  ')}
            </div>
          </div>
        </div>
      )}

      {/* Gecikme uyarısı */}
      {gecikmeCount > 0 && (
        <div style={{
          background: 'linear-gradient(135deg,#FEE2E2,#FFF5F5)',
          border: '2px solid #FCA5A5',
          borderRadius: '12px',
          padding: '14px 18px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{ fontSize:'28px' }}>🔴</span>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:'800', color:'#991B1B', fontSize:'14px', marginBottom:'3px' }}>
              {gecikmeCount} adet GECİKMİŞ ödeme var!
            </div>
            <div style={{ fontSize:'13px', color:'#B91C1C' }}>
              Toplam geciken tutar: <b>₺{odemeler.filter(o=>o.durum==='gecikme').reduce((s,o)=>s+(o.tutar-o.odenenTutar),0).toLocaleString('tr-TR')}</b>
            </div>
          </div>
          <button className="btn btn-danger btn-sm" onClick={() => setAktifTab('gecikme')}>
            Gecikmeler →
          </button>
        </div>
      )}

      {/* Tab Bar */}
      <div className="tab-bar">
        <div className={`tab-item ${aktifTab==='mulkler'?'aktif':''}`} onClick={()=>setAktifTab('mulkler')}>🏠 Mülkler</div>
        <div className={`tab-item ${aktifTab==='odemeler'?'aktif':''}`} onClick={()=>setAktifTab('odemeler')}>💳 Tüm Ödemeler</div>
        <div className={`tab-item ${aktifTab==='gecikme'?'aktif':''}`} onClick={()=>setAktifTab('gecikme')}>
          🔴 GECİKMEDE
          {gecikmeCount > 0 && (
            <span style={{ marginLeft:'6px', background:'#EF4444', color:'white', borderRadius:'10px', padding:'1px 7px', fontSize:'11px', fontWeight:'700' }}>
              {gecikmeCount}
            </span>
          )}
        </div>
      </div>

      {/* ═══ MÜLKLER ═══ */}
      {aktifTab === 'mulkler' && (
        <>
          <div className="filtre-bar">
            <input
              className="arama-input"
              placeholder="🔍 Mülk adı, kiracı veya adres ara..."
              value={aramaMetni}
              onChange={e => setAramaMetni(e.target.value)}
            />
            <button className="btn btn-primary" onClick={() => { setForm(BOSFORM); setYeniModal(true); }}>
              + Mülk Ekle
            </button>
          </div>

          <div className="panel">
            <div className="panel-baslik">
              <h3>🏠 Mülk Listesi</h3>
              <span style={{ fontSize:'13px', color:'#64748B' }}>{filtrelenmis.length}/{mulkler.length} mülk</span>
            </div>
            <div className="tablo-container">
              <table>
                <thead>
                  <tr>
                    <th>Mülk</th>
                    <th>Kiracı</th>
                    <th>Aylık Kira</th>
                    <th>Sözleşme</th>
                    <th>Yenileme</th>
                    <th>Ödeme Özeti</th>
                    <th>Durum</th>
                    <th>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrelenmis.map(m => {
                    const mulkOdemeleri = odemeler.filter(o=>o.mulkId===m.id);
                    const odenmis  = mulkOdemeleri.filter(o=>o.durum==='odendi').length;
                    const gecikme  = mulkOdemeleri.filter(o=>o.durum==='gecikme').length;
                    const bekliyor = mulkOdemeleri.filter(o=>o.durum==='bekliyor').length;
                    const bitDt    = m.sozlesmeBitis ? new Date(m.sozlesmeBitis) : null;
                    const kalanGun = bitDt ? Math.ceil((bitDt-new Date())/(1000*60*60*24)) : null;

                    return (
                      <tr key={m.id}>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                            <span style={{ fontSize:'24px' }}>{TIP_IKONLARI[m.tip]||'🏠'}</span>
                            <div>
                              <div style={{ fontWeight:'700', fontSize:'14px', color:'#1E293B' }}>{m.ad}</div>
                              <div style={{ fontSize:'11px', color:'#64748B' }}>📍 {m.adres}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight:'600', fontSize:'13px', color:'#374151' }}>{m.kiraci || <span style={{color:'#CBD5E1'}}>—</span>}</div>
                          {m.kiraci_telefon && <div style={{ fontSize:'11px', color:'#64748B' }}>{m.kiraci_telefon}</div>}
                        </td>
                        <td>
                          <span style={{ fontWeight:'800', fontSize:'15px', color:'#059669' }}>
                            {m.aylikKira > 0 ? `₺${m.aylikKira.toLocaleString('tr-TR')}` : '—'}
                          </span>
                        </td>
                        <td>
                          {m.sozlesmeBaslangic ? (
                            <div style={{ lineHeight:'1.6' }}>
                              <div style={{ fontSize:'12px', color:'#374151' }}>📅 {m.sozlesmeBaslangic}</div>
                              <div style={{ fontSize:'12px', color:'#374151' }}>→ {m.sozlesmeBitis}</div>
                              {kalanGun !== null && (
                                <span style={{
                                  fontSize:'11px', fontWeight:'700',
                                  color: kalanGun<=0?'#DC2626':kalanGun<=60?'#D97706':'#15803D',
                                  background: kalanGun<=0?'#FEE2E2':kalanGun<=60?'#FEF9C3':'#DCFCE7',
                                  padding:'2px 7px', borderRadius:'8px',
                                }}>
                                  {kalanGun<=0 ? '❗ Süresi doldu' : kalanGun<=60 ? `⚠️ ${kalanGun}g` : `✅ ${kalanGun}g`}
                                </span>
                              )}
                            </div>
                          ) : <span style={{color:'#CBD5E1'}}>—</span>}
                        </td>
                        <td>
                          {m.yenilemeAktif
                            ? <span style={{ background:'#EDE9FE', color:'#5B21B6', padding:'4px 10px', borderRadius:'12px', fontSize:'12px', fontWeight:'700' }}>🔄 %{m.yenilemeOrani}</span>
                            : <span style={{ background:'#F1F5F9', color:'#64748B', padding:'4px 10px', borderRadius:'12px', fontSize:'12px', fontWeight:'600' }}>Manuel</span>}
                        </td>
                        <td>
                          <div style={{ display:'flex', gap:'4px', flexWrap:'wrap' }}>
                            {odenmis>0  && <span style={{background:'#DCFCE7',color:'#14532D',padding:'2px 7px',borderRadius:'8px',fontSize:'11px',fontWeight:'700'}}>✅{odenmis}</span>}
                            {gecikme>0  && <span style={{background:'#FEE2E2',color:'#7F1D1D',padding:'2px 7px',borderRadius:'8px',fontSize:'11px',fontWeight:'700'}}>🔴{gecikme}</span>}
                            {bekliyor>0 && <span style={{background:'#FEF9C3',color:'#713F12',padding:'2px 7px',borderRadius:'8px',fontSize:'11px',fontWeight:'700'}}>⏳{bekliyor}</span>}
                          </div>
                        </td>
                        <td>
                          <span style={{
                            padding:'5px 12px', borderRadius:'12px', fontSize:'12px', fontWeight:'700',
                            background: m.durum==='aktif'?'#DCFCE7':'#FEE2E2',
                            color: m.durum==='aktif'?'#14532D':'#991B1B',
                          }}>
                            {m.durum==='aktif' ? '✅ Kiralık' : '🔑 Boş'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display:'flex', gap:'4px' }}>
                            <button className="btn btn-secondary btn-sm" title="Detay & Ödemeler"
                              onClick={() => { setDetayMulk(m); setDetaySekme('ozet'); }}>👁</button>
                            <button className="btn btn-secondary btn-sm" title="Düzenle"
                              onClick={() => acDuzenle(m)}>✏️</button>
                            <button className="btn btn-danger btn-sm" title="Sil"
                              onClick={() => setSilOnay(m)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtrelenmis.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign:'center', padding:'40px', color:'#64748B' }}>
                        Arama sonucu bulunamadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ═══ TÜM ÖDEMELER ═══ */}
      {aktifTab === 'odemeler' && (
        <div className="panel">
          <div className="panel-baslik">
            <h3>💳 Tüm Kira Ödemeleri</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setOdemeModal(true)}>+ Ödeme Ekle</button>
          </div>
          <div className="tablo-container">
            <table>
              <thead>
                <tr>
                  <th>Mülk / Kiracı</th>
                  <th>Dönem</th>
                  <th>Vade Tarihi</th>
                  <th>Borç</th>
                  <th>Ödenen</th>
                  <th>Ödeme Tarihi</th>
                  <th>Kalan</th>
                  <th>Durum</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {[...odemeler].sort((a,b)=>new Date(b.vadeTarihi)-new Date(a.vadeTarihi)).map(o => {
                  const m     = mulkler.find(x=>x.id===o.mulkId);
                  const kalan = o.tutar - o.odenenTutar;
                  const dt    = new Date(o.vadeTarihi);
                  return (
                    <tr key={o.id} style={{
                      background: o.durum==='gecikme'
                        ? 'linear-gradient(90deg,#FFF5F5,white)'
                        : o.durum==='odendi'
                          ? 'linear-gradient(90deg,#F0FFF4,white)'
                          : 'white'
                    }}>
                      <td>
                        <div style={{ fontWeight:'700', fontSize:'13px' }}>{TIP_IKONLARI[m?.tip]} {m?.ad}</div>
                        <div style={{ fontSize:'11px', color:'#64748B' }}>{m?.kiraci}</div>
                      </td>
                      <td style={{ fontSize:'13px', fontWeight:'600' }}>{AY_ADLARI[dt.getMonth()]} {dt.getFullYear()}</td>
                      <td>
                        <div style={{ fontSize:'13px', color: o.durum==='gecikme'?'#DC2626':'#374151', fontWeight: o.durum==='gecikme'?'700':'400' }}>
                          {o.durum==='gecikme' && '⚠️ '}{o.vadeTarihi}
                        </div>
                      </td>
                      <td style={{ fontWeight:'700', fontSize:'14px' }}>₺{o.tutar.toLocaleString('tr-TR')}</td>
                      <td style={{ fontWeight:'700', color: o.odenenTutar>0?'#15803D':'#CBD5E1' }}>
                        {o.odenenTutar>0 ? `₺${o.odenenTutar.toLocaleString('tr-TR')}` : '—'}
                      </td>
                      <td style={{ fontSize:'12px', color:'#374151' }}>
                        {o.odenmeTarihi ? `📅 ${o.odenmeTarihi}` : '—'}
                      </td>
                      <td style={{ fontWeight:'800', color: kalan>0?'#DC2626':'#15803D' }}>
                        {kalan>0 ? `₺${kalan.toLocaleString('tr-TR')}` : '✔'}
                      </td>
                      <td><DurumBadge durum={o.durum} /></td>
                      <td>
                        {o.durum !== 'odendi' ? (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => setOdemeler(prev => prev.map(x => x.id===o.id
                              ? { ...x, durum:'odendi', odenenTutar:x.tutar, odenmeTarihi: new Date().toISOString().split('T')[0] }
                              : x))}>
                            💳 ÖDE
                          </button>
                        ) : (
                          <span style={{ fontSize:'12px', color:'#14532D', fontWeight:'700' }}>✅ ÖDENDİ</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ GECİKMEDE ═══ */}
      {aktifTab === 'gecikme' && (
        <div className="panel">
          <div className="panel-baslik">
            <h3>🔴 GECİKMEDE Olan Ödemeler</h3>
            <span style={{ background:'#FEE2E2', color:'#991B1B', padding:'5px 14px', borderRadius:'12px', fontSize:'13px', fontWeight:'700' }}>
              ₺{odemeler.filter(o=>o.durum==='gecikme').reduce((s,o)=>s+(o.tutar-o.odenenTutar),0).toLocaleString('tr-TR')} gecikmiş
            </span>
          </div>
          <div className="tablo-container">
            <table>
              <thead>
                <tr>
                  <th>Mülk / Kiracı</th>
                  <th>Dönem</th>
                  <th>Vade Tarihi</th>
                  <th>Geciken Tutar</th>
                  <th>Gecikme Süresi</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {odemeler
                  .filter(o=>o.durum==='gecikme')
                  .sort((a,b)=>new Date(a.vadeTarihi)-new Date(b.vadeTarihi))
                  .map(o => {
                    const m = mulkler.find(x=>x.id===o.mulkId);
                    const dt = new Date(o.vadeTarihi);
                    const gecikmeGun = Math.ceil((new Date()-new Date(o.vadeTarihi))/(1000*60*60*24));
                    return (
                      <tr key={o.id} style={{ background:'linear-gradient(90deg,#FFF5F5,white)' }}>
                        <td>
                          <div style={{ fontWeight:'700', fontSize:'14px' }}>{TIP_IKONLARI[m?.tip]} {m?.ad}</div>
                          <div style={{ fontSize:'12px', color:'#DC2626', fontWeight:'600' }}>👤 {m?.kiraci}</div>
                        </td>
                        <td style={{ fontWeight:'600' }}>{AY_ADLARI[dt.getMonth()]} {dt.getFullYear()}</td>
                        <td>
                          <div style={{ color:'#DC2626', fontWeight:'700', fontSize:'13px' }}>{o.vadeTarihi}</div>
                        </td>
                        <td>
                          <span style={{ fontSize:'18px', fontWeight:'800', color:'#DC2626' }}>
                            ₺{(o.tutar-o.odenenTutar).toLocaleString('tr-TR')}
                          </span>
                        </td>
                        <td>
                          <div style={{ background:'#FEE2E2', borderRadius:'8px', padding:'6px 12px', display:'inline-block' }}>
                            <span style={{ fontWeight:'700', color:'#991B1B', fontSize:'13px' }}>{gecikmeGun} gün</span>
                          </div>
                        </td>
                        <td>
                          <button
                            style={{
                              background:'linear-gradient(135deg,#DC2626,#B91C1C)',
                              color:'white', border:'none', borderRadius:'8px',
                              padding:'8px 18px', fontSize:'13px', fontWeight:'700',
                              cursor:'pointer', boxShadow:'0 3px 10px rgba(220,38,38,0.4)',
                              transition:'all 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            onClick={() => setOdemeler(prev => prev.map(x => x.id===o.id
                              ? { ...x, durum:'odendi', odenenTutar:x.tutar, odenmeTarihi:new Date().toISOString().split('T')[0] }
                              : x))}>
                            ⚠️ GECİKMEYİ ÖDE
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                {odemeler.filter(o=>o.durum==='gecikme').length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign:'center', padding:'50px', color:'#64748B' }}>
                      <div style={{ fontSize:'40px', marginBottom:'12px' }}>✅</div>
                      <div style={{ fontWeight:'700', fontSize:'15px' }}>Gecikmiş ödeme yok!</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ MÜLK DETAY MODAL ═══ */}
      <Modal
        acik={!!detayMulk}
        kapat={() => setDetayMulk(null)}
        baslik={`${TIP_IKONLARI[detayMulk?.tip]||'🏠'} ${detayMulk?.ad}`}
        genislik="820px"
      >
        {detayMulk && (() => {
          // detayMulk'ü güncel mulkler'den bul
          const guncelMulk = mulkler.find(m => m.id === detayMulk.id) || detayMulk;
          return (
            <>
              {/* Üst kart */}
              <div style={{
                display:'flex', gap:'16px',
                background:'linear-gradient(135deg,#1E3A5F,#0F2140)',
                borderRadius:'14px', padding:'20px', marginBottom:'16px', alignItems:'center',
              }}>
                <span style={{ fontSize:'48px' }}>{TIP_IKONLARI[guncelMulk.tip]||'🏠'}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'20px', fontWeight:'800', color:'white' }}>{guncelMulk.ad}</div>
                  <div style={{ fontSize:'13px', color:'#94A3B8', marginTop:'3px' }}>📍 {guncelMulk.adres}</div>
                  {guncelMulk.kiraci && (
                    <div style={{ fontSize:'13px', color:'#93C5FD', marginTop:'5px' }}>
                      👤 {guncelMulk.kiraci}
                      {guncelMulk.kiraci_telefon && ` — ${guncelMulk.kiraci_telefon}`}
                    </div>
                  )}
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:'28px', fontWeight:'800', color:'#6EE7B7' }}>
                    {guncelMulk.aylikKira > 0 ? `₺${guncelMulk.aylikKira.toLocaleString('tr-TR')}` : '—'}
                  </div>
                  <div style={{ fontSize:'11px', color:'#94A3B8', marginBottom:'6px' }}>Aylık Kira</div>
                  <span style={{
                    padding:'5px 14px', borderRadius:'12px', fontSize:'12px', fontWeight:'700',
                    background: guncelMulk.durum==='aktif'?'rgba(21,128,61,0.3)':'rgba(220,38,38,0.3)',
                    color: guncelMulk.durum==='aktif'?'#6EE7B7':'#FCA5A5',
                    border: `1px solid ${guncelMulk.durum==='aktif'?'#6EE7B7':'#FCA5A5'}`,
                  }}>
                    {guncelMulk.durum==='aktif' ? '✅ Kiralık' : '🔑 Boş'}
                  </span>
                </div>
              </div>

              {/* Sekmeler */}
              <div className="tab-bar" style={{ marginBottom:'16px' }}>
                {[
                  { id:'ozet',      label:'📋 Özet' },
                  { id:'odemeler',  label:'💳 Ay Ay Ödemeler' },
                  { id:'sozlesme',  label:'📄 Sözleşme & Yenileme' },
                ].map(t => (
                  <div key={t.id} className={`tab-item ${detaySekme===t.id?'aktif':''}`} onClick={()=>setDetaySekme(t.id)}>
                    {t.label}
                  </div>
                ))}
              </div>

              {/* ÖZET */}
              {detaySekme === 'ozet' && (
                <div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', marginBottom:'16px' }}>
                    <InfoSatir etiket="Mülk Tipi" deger={guncelMulk.tip?.toUpperCase()} />
                    <InfoSatir etiket="Kiracı" deger={guncelMulk.kiraci} />
                    <InfoSatir etiket="Kiracı Telefon" deger={guncelMulk.kiraci_telefon} />
                    <InfoSatir etiket="Aylık Kira" deger={`₺${guncelMulk.aylikKira.toLocaleString('tr-TR')}`} renk="#059669" />
                    <InfoSatir etiket="Depozito" deger={`₺${guncelMulk.depozito.toLocaleString('tr-TR')}`} />
                    <InfoSatir etiket="E-posta" deger={guncelMulk.kiraci_email} />
                    <InfoSatir etiket="Sözleşme Başlangıç" deger={guncelMulk.sozlesmeBaslangic} />
                    <InfoSatir etiket="Sözleşme Bitiş" deger={guncelMulk.sozlesmeBitis} />
                    <InfoSatir
                      etiket="Oto. Yenileme"
                      deger={guncelMulk.yenilemeAktif ? `✅ Aktif — %${guncelMulk.yenilemeOrani} artış` : '❌ Pasif'}
                      renk={guncelMulk.yenilemeAktif?'#7C3AED':'#64748B'}
                    />
                  </div>
                  {guncelMulk.yenilemeAktif && guncelMulk.aylikKira > 0 && (
                    <div style={{ background:'#F5F3FF', borderRadius:'10px', padding:'14px', marginBottom:'14px', border:'1px solid #DDD6FE' }}>
                      <div style={{ fontSize:'12px', fontWeight:'700', color:'#7C3AED', marginBottom:'6px' }}>🔄 Yenileme Sonrası Tahmini Kira</div>
                      <div style={{ fontSize:'22px', fontWeight:'800', color:'#059669' }}>
                        ₺{Math.round(guncelMulk.aylikKira*(1+guncelMulk.yenilemeOrani/100)).toLocaleString('tr-TR')}
                        <span style={{ fontSize:'13px', color:'#10B981', marginLeft:'8px' }}>
                          (+₺{(Math.round(guncelMulk.aylikKira*(1+guncelMulk.yenilemeOrani/100))-guncelMulk.aylikKira).toLocaleString('tr-TR')})
                        </span>
                      </div>
                    </div>
                  )}
                  <div style={{ display:'flex', gap:'8px' }}>
                    <button className="btn btn-primary" style={{ flex:1 }}
                      onClick={() => { setDetayMulk(null); acDuzenle(guncelMulk); }}>✏️ Düzenle</button>
                    <button className="btn btn-secondary" style={{ flex:1 }}
                      onClick={() => setDetaySekme('odemeler')}>💳 Ödemeleri Gör</button>
                    <button className="btn btn-secondary" style={{ flex:1 }}
                      onClick={() => setDetaySekme('sozlesme')}>📄 Sözleşme</button>
                    <button className="btn btn-danger btn-sm" onClick={() => setSilOnay(guncelMulk)}>🗑️</button>
                  </div>
                </div>
              )}

              {/* AY AY ÖDEMELER */}
              {detaySekme === 'odemeler' && (
                <AyAyOdemeler
                  mulk={guncelMulk}
                  odemeler={odemeler}
                  setOdemeler={setOdemeler}
                />
              )}

              {/* SÖZLEŞME & YENİLEME */}
              {detaySekme === 'sozlesme' && (
                <SozlesmeKarti
                  mulk={guncelMulk}
                  onYenile={(id, oran, yeniKira, sure) => {
                    sozlesmeYenile(id, oran, yeniKira, sure);
                    setDetayMulk(m => ({ ...m, aylikKira: yeniKira, yenilemeOrani: oran }));
                  }}
                />
              )}
            </>
          );
        })()}
      </Modal>

      {/* ═══ Mülk Yeni / Düzenle Modal ═══ */}
      <Modal
        acik={yeniModal || !!duzenleModal}
        kapat={() => { setYeniModal(false); setDuzenle(null); setForm(BOSFORM); }}
        baslik={duzenleModal ? '✏️ Mülk Düzenle' : '+ Yeni Mülk Ekle'}
        genislik="640px"
      >
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          <Inp label="Mülk Adı" name="ad" zorunlu tam />
          <Inp label="Adres" name="adres" tam />
          <Inp label="Mülk Tipi" name="tip"
            options={TIPLER.map(t=>({ value:t, label:`${TIP_IKONLARI[t]||'🏠'} ${t.charAt(0).toUpperCase()+t.slice(1)}` }))} />
          <Inp label="Durum" name="durum"
            options={[{value:'aktif',label:'✅ Kiralık'},{value:'bos',label:'🔑 Boş'}]} />
          <Inp label="Kiracı Adı" name="kiraci" />
          <Inp label="Kiracı Telefon" name="kiraci_telefon" />
          <Inp label="Kiracı E-posta" name="kiraci_email" tip="email" />
          <div />
          <Inp label="Aylık Kira (₺)" name="aylikKira" tip="number" />
          <Inp label="Depozito (₺)" name="depozito" tip="number" />
          <Inp label="Sözleşme Başlangıç" name="sozlesmeBaslangic" tip="date" />
          <Inp label="Sözleşme Bitiş" name="sozlesmeBitis" tip="date" />

          {/* Otomatik yenileme */}
          <div style={{
            gridColumn: '1/-1',
            background: 'linear-gradient(135deg,#F5F3FF,#EDE9FE)',
            border: '2px solid #C4B5FD',
            borderRadius: '12px',
            padding: '16px',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
              <input type="checkbox" id="yenilemeChk" checked={Boolean(form.yenilemeAktif)}
                onChange={e => setForm(p=>({...p, yenilemeAktif: e.target.checked}))}
                style={{ width:'18px', height:'18px', accentColor:'#8B5CF6', cursor:'pointer' }} />
              <label htmlFor="yenilemeChk" style={{ fontWeight:'800', fontSize:'15px', color:'#5B21B6', cursor:'pointer' }}>
                🔄 Otomatik Sözleşme Yenileme
              </label>
            </div>
            <div style={{ fontSize:'12px', color:'#6D28D9', marginBottom: form.yenilemeAktif ? '10px' : '0' }}>
              Sözleşme bitişinde kira belirtilen oranda artarak otomatik yenilenir.
            </div>
            {form.yenilemeAktif && (
              <div style={{ display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <label style={{ fontSize:'13px', color:'#6D28D9', fontWeight:'600' }}>Artış Oranı:</label>
                  <input type="number" value={form.yenilemeOrani || ''} min="0" max="200"
                    onChange={e=>setForm(p=>({...p,yenilemeOrani:e.target.value}))}
                    style={{ width:'70px', padding:'8px', border:'2px solid #8B5CF6', borderRadius:'8px', fontSize:'18px', fontWeight:'800', textAlign:'center', color:'#5B21B6', outline:'none' }} />
                  <span style={{ fontWeight:'800', fontSize:'18px', color:'#8B5CF6' }}>%</span>
                </div>
                {form.aylikKira && form.yenilemeOrani && (
                  <div style={{ background:'white', borderRadius:'8px', padding:'8px 14px', border:'1px solid #DDD6FE' }}>
                    <span style={{ fontSize:'12px', color:'#64748B' }}>Yeni Kira: </span>
                    <span style={{ fontSize:'16px', fontWeight:'800', color:'#059669' }}>
                      ₺{Math.round((parseFloat(form.aylikKira)||0)*(1+(parseFloat(form.yenilemeOrani)||0)/100)).toLocaleString('tr-TR')}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{ display:'flex', gap:'8px', marginTop:'20px', justifyContent:'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => { setYeniModal(false); setDuzenle(null); setForm(BOSFORM); }}>
            İptal
          </button>
          <button className="btn btn-primary" onClick={mulkKaydet}>
            {duzenleModal ? '💾 Güncelle' : '✅ Kaydet'}
          </button>
        </div>
      </Modal>

      {/* ═══ Tekil Ödeme Ekle Modal ═══ */}
      <Modal acik={odemeModal} kapat={() => setOdemeModal(false)} baslik="+ Kira Ödemesi Ekle" genislik="440px">
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          <Inp label="Mülk" name="mulkId" zorunlu
            options={mulkler.map(m=>({ value:m.id, label:`${TIP_IKONLARI[m.tip]} ${m.ad}` }))}
            form={odemeForm} setForm={setOdemeForm} />
          <Inp label="Tarih" name="tarih" tip="date" form={odemeForm} setForm={setOdemeForm} />
          <Inp label="Tutar (₺)" name="tutar" tip="number" zorunlu form={odemeForm} setForm={setOdemeForm} />
          <Inp label="Durum" name="durum"
            options={[
              {value:'odendi',  label:'✅ ÖDENDİ'},
              {value:'bekliyor',label:'⏳ BEKLİYOR'},
              {value:'gecikme', label:'🔴 GECİKMEDE'},
            ]}
            form={odemeForm} setForm={setOdemeForm} />
          <Inp label="Açıklama" name="aciklama" form={odemeForm} setForm={setOdemeForm} />
        </div>
        <div style={{ display:'flex', gap:'8px', marginTop:'16px', justifyContent:'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => setOdemeModal(false)}>İptal</button>
          <button className="btn btn-primary" onClick={tekOdemeKaydet}>✅ Kaydet</button>
        </div>
      </Modal>

      {/* ═══ Sil Onay Modal ═══ */}
      <Modal acik={!!silOnay} kapat={() => setSilOnay(null)} baslik="🗑️ Mülk Sil" genislik="400px">
        {silOnay && (
          <>
            <div style={{ textAlign:'center', padding:'8px 0 24px' }}>
              <div style={{ fontSize:'52px', marginBottom:'12px' }}>⚠️</div>
              <p style={{ fontSize:'16px', color:'#374151', fontWeight:'600' }}>
                <b>"{silOnay.ad}"</b> mülkünü ve tüm ödeme kayıtlarını silmek istiyor musunuz?
              </p>
              <p style={{ fontSize:'13px', color:'#EF4444', marginTop:'8px' }}>Bu işlem geri alınamaz!</p>
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              <button className="btn btn-secondary" style={{ flex:1 }} onClick={() => setSilOnay(null)}>Vazgeç</button>
              <button className="btn btn-danger" style={{ flex:1 }} onClick={() => mulkSil(silOnay.id)}>🗑️ Evet, Sil</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
