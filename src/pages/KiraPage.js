import React, { useState, useMemo, useEffect } from 'react';
import Modal from '../components/Modal';
import { supabase } from '../lib/supabase';

// ─── YARDIMCI ──────────────────────────────────────────────
const TIP_IKONLARI = { ofis: '🏢', dukkan: '🏪', depo: '🏭', daire: '🏠', arsa: '🌿', fabrika: '🏭', diger: '🏗️' };
const TIPLER = ['ofis', 'dukkan', 'depo', 'daire', 'arsa', 'fabrika', 'diger'];
const AY_ADLARI = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

const BOSFORM = {
  ad:'', adres:'', tip:'daire', kiraci:'', kiraci_tc:'', kiraci_telefon:'', kiraci_email:'',
  aylikKira:'', depozito:'', sozlesmeBaslangic:'', sozlesmeBitis:'',
  yenilemeAktif: false, yenilemeOrani:'20', durum:'aktif', faturaKes: false,
};

// DB satırı → uygulama objesi
function dbToMulk(row) {
  return {
    id:                row.id,
    ad:                row.ad || '',
    adres:             row.adres || '',
    tip:               row.tip || 'daire',
    kiraci:            row.kiraci || '',
    kiraci_tc:         row.kiraci_tc || '',
    kiraci_telefon:    row.kiraci_telefon || '',
    kiraci_email:      row.kiraci_email || '',
    aylikKira:         Number(row.aylik_kira) || 0,
    depozito:          Number(row.depozito) || 0,
    sozlesmeBaslangic: row.sozlesme_baslangic || '',
    sozlesmeBitis:     row.sozlesme_bitis || '',
    yenilemeAktif:     row.yenileme_aktif || false,
    yenilemeOrani:     Number(row.yenileme_orani) || 20,
    durum:             row.durum || 'aktif',
    faturaKes:         row.fatura_kes || false,
  };
}

// Hangi ek kolonların DB'de var olduğunu takip et
let _dbKolonlar = { kiraci_tc: null, fatura_kes: null }; // null=bilinmiyor, true=var, false=yok

function mulkToDB(m, ekstraKolonlar = true) {
  const obj = {
    ad:                 m.ad,
    adres:              m.adres || '',
    tip:                m.tip || 'daire',
    kiraci:             m.kiraci || '',
    kiraci_telefon:     m.kiraci_telefon || '',
    kiraci_email:       m.kiraci_email || '',
    aylik_kira:         Number(m.aylikKira) || 0,
    depozito:           Number(m.depozito) || 0,
    sozlesme_baslangic: m.sozlesmeBaslangic || null,
    sozlesme_bitis:     m.sozlesmeBitis || null,
    yenileme_aktif:     Boolean(m.yenilemeAktif),
    yenileme_orani:     Number(m.yenilemeOrani) || 20,
    durum:              m.durum || 'aktif',
  };
  // Sadece DB'de var olduğu bilinen kolonları ekle
  if (ekstraKolonlar && _dbKolonlar.kiraci_tc !== false) obj.kiraci_tc = m.kiraci_tc || '';
  if (ekstraKolonlar && _dbKolonlar.fatura_kes !== false) obj.fatura_kes = Boolean(m.faturaKes);
  return obj;
}

function dbToOdeme(row) {
  return {
    id:           row.id,
    mulkId:       row.mulk_id,
    vadeTarihi:   row.vade_tarihi || '',
    tutar:        Number(row.tutar) || 0,
    odenenTutar:  Number(row.odenen_tutar) || 0,
    odenmeTarihi: row.odeme_tarihi || null,
    aciklama:     row.aciklama || '',
    durum:        row.durum || 'bekliyor',
    faturaKesildi: row.fatura_kesildi || false,
    faturaNo:     row.fatura_no || '',
    faturaTarihi: row.fatura_tarihi || null,
  };
}

// ─── Sözleşme döneminden otomatik ödeme satırları üret ─────
// DÜZELTİLDİ: Geçmiş ödemeler artık otomatik "ödendi" sayılmıyor
const odemelerUret = (mulk) => {
  const liste = [];
  if (mulk.durum !== 'aktif' || !mulk.sozlesmeBaslangic) return liste;
  const bas    = new Date(mulk.sozlesmeBaslangic);
  const bit    = new Date(mulk.sozlesmeBitis || mulk.sozlesmeBaslangic);
  let cur      = new Date(bas.getFullYear(), bas.getMonth(), 1);
  const son    = new Date(bit.getFullYear(), bit.getMonth(), 1);
  const bugun  = new Date();

  while (cur <= son) {
    const vadeTarihi = new Date(cur.getFullYear(), cur.getMonth(), 1)
      .toISOString().split('T')[0];
    const vadeDt     = new Date(vadeTarihi);

    // Geçmiş aylar → sadece "gecikme", hiçbiri otomatik "ödendi" olmaz
    let durum;
    if (vadeDt < new Date(bugun.getFullYear(), bugun.getMonth(), 1)) {
      durum = 'gecikme';
    } else {
      durum = 'bekliyor';
    }

    liste.push({
      mulk_id:      mulk.id,
      vade_tarihi:  vadeTarihi,
      tutar:        mulk.aylikKira,
      odenen_tutar: 0,
      odeme_tarihi: null,
      aciklama:     '',
      durum,
    });
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }
  return liste;
};

// ─── DURUM BADGE ────────────────────────────────────────────
function DurumBadge({ durum, buyuk }) {
  const base = {
    padding: buyuk ? '6px 16px' : '4px 12px',
    borderRadius: '20px', fontSize: buyuk ? '13px' : '12px',
    fontWeight: '700', whiteSpace: 'nowrap',
    display: 'inline-flex', alignItems: 'center', gap: '5px', letterSpacing: '0.3px',
  };
  if (durum === 'odendi')
    return <span style={{ ...base, background: '#DCFCE7', color: '#14532D', border: '1.5px solid #86EFAC' }}>✅ ÖDENDİ</span>;
  if (durum === 'gecikme')
    return <span style={{ ...base, background: '#FEE2E2', color: '#7F1D1D', border: '1.5px solid #FCA5A5' }}>🔴 GECİKMEDE</span>;
  return <span style={{ ...base, background: '#FEF9C3', color: '#713F12', border: '1.5px solid #FDE68A' }}>⏳ BEKLİYOR</span>;
}

function InfoSatir({ etiket, deger, renk }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', background:'#F8FAFC', borderRadius:'8px', padding:'11px 14px', border:'1px solid #E2E8F0' }}>
      <span style={{ fontSize:'10px', color:'#64748B', marginBottom:'3px', textTransform:'uppercase', letterSpacing:'0.6px', fontWeight:'600' }}>{etiket}</span>
      <span style={{ fontSize:'14px', fontWeight:'600', color: renk || '#1E293B' }}>{deger || '—'}</span>
    </div>
  );
}

// ─── KISMI ÖDEME / ONAY MODAL ───────────────────────────────
function OdemeOnayModal({ odeme, mulk, acik, kapat, onOde }) {
  const [kismiTutar, setKismiTutar] = useState('');
  const [odemeYontemi, setOdemeYontemi] = useState('nakit');
  const [odenmeTarihi, setOdenmeTarihi] = useState(new Date().toISOString().split('T')[0]);
  const kalan = odeme ? odeme.tutar - odeme.odenenTutar : 0;

  if (!acik || !odeme) return null;

  const tamOde = () => {
    onOde(odeme.id, kalan, odenmeTarihi, 'tam');
    kapat();
  };

  const kismiOde = () => {
    const miktar = parseFloat(kismiTutar);
    if (!miktar || miktar <= 0 || miktar > kalan) {
      alert(`Geçerli bir tutar girin (max ₺${kalan.toLocaleString('tr-TR')})`);
      return;
    }
    onOde(odeme.id, miktar, odenmeTarihi, 'kismi');
    kapat();
  };

  return (
    <Modal acik={acik} kapat={kapat} baslik="💳 Ödeme Al" genislik="460px">
      <div style={{ marginBottom:'16px', background:'linear-gradient(135deg,#1E3A5F,#0F2140)', borderRadius:'12px', padding:'16px', color:'white' }}>
        <div style={{ fontSize:'13px', color:'#94A3B8', marginBottom:'4px' }}>{mulk?.ad} — {odeme?.vadeTarihi && `${AY_ADLARI[new Date(odeme.vadeTarihi).getMonth()]} ${new Date(odeme.vadeTarihi).getFullYear()}`}</div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:'12px', color:'#94A3B8' }}>Kira Bedeli</div>
            <div style={{ fontSize:'22px', fontWeight:'800', color:'#6EE7B7' }}>₺{odeme?.tutar?.toLocaleString('tr-TR')}</div>
          </div>
          {odeme?.odenenTutar > 0 && (
            <div>
              <div style={{ fontSize:'12px', color:'#94A3B8' }}>Daha Önce Ödenen</div>
              <div style={{ fontSize:'18px', fontWeight:'700', color:'#FCD34D' }}>₺{odeme?.odenenTutar?.toLocaleString('tr-TR')}</div>
            </div>
          )}
          <div>
            <div style={{ fontSize:'12px', color:'#94A3B8' }}>Kalan Borç</div>
            <div style={{ fontSize:'22px', fontWeight:'800', color:'#FCA5A5' }}>₺{kalan.toLocaleString('tr-TR')}</div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom:'14px' }}>
        <label style={{ fontSize:'12px', fontWeight:'600', color:'#374151', display:'block', marginBottom:'5px' }}>Ödeme Tarihi</label>
        <input type="date" value={odenmeTarihi} onChange={e => setOdenmeTarihi(e.target.value)}
          style={{ width:'100%', padding:'9px 12px', border:'1.5px solid #E2E8F0', borderRadius:'8px', fontSize:'14px', outline:'none', boxSizing:'border-box' }} />
      </div>

      <div style={{ marginBottom:'14px' }}>
        <label style={{ fontSize:'12px', fontWeight:'600', color:'#374151', display:'block', marginBottom:'5px' }}>Ödeme Yöntemi</label>
        <select value={odemeYontemi} onChange={e => setOdemeYontemi(e.target.value)}
          style={{ width:'100%', padding:'9px 12px', border:'1.5px solid #E2E8F0', borderRadius:'8px', fontSize:'14px', outline:'none', background:'white' }}>
          <option value="nakit">💵 Nakit</option>
          <option value="havale">🏦 Havale/EFT</option>
          <option value="kredi_karti">💳 Kredi Kartı</option>
          <option value="cek">📄 Çek</option>
        </select>
      </div>

      {/* TAM ÖDEME */}
      <button onClick={tamOde}
        style={{ width:'100%', background:'linear-gradient(135deg,#15803D,#16A34A)', color:'white', border:'none',
          borderRadius:'10px', padding:'14px', fontSize:'15px', fontWeight:'800', cursor:'pointer', marginBottom:'12px',
          boxShadow:'0 4px 14px rgba(21,128,61,0.4)' }}>
        ✅ Tam Öde — ₺{kalan.toLocaleString('tr-TR')}
      </button>

      {/* KISMİ ÖDEME */}
      <div style={{ background:'#F8FAFC', borderRadius:'10px', padding:'14px', border:'1px solid #E2E8F0' }}>
        <div style={{ fontSize:'13px', fontWeight:'700', color:'#374151', marginBottom:'10px' }}>💰 Kısmi Ödeme</div>
        <div style={{ display:'flex', gap:'8px' }}>
          <input type="number" placeholder={`Max ₺${kalan.toLocaleString('tr-TR')}`}
            value={kismiTutar} onChange={e => setKismiTutar(e.target.value)}
            style={{ flex:1, padding:'9px 12px', border:'1.5px solid #E2E8F0', borderRadius:'8px', fontSize:'14px', outline:'none' }} />
          <button onClick={kismiOde}
            style={{ background:'linear-gradient(135deg,#3B82F6,#2563EB)', color:'white', border:'none',
              borderRadius:'8px', padding:'9px 18px', fontSize:'13px', fontWeight:'700', cursor:'pointer' }}>
            Kısmen Öde
          </button>
        </div>
      </div>

      <button onClick={kapat}
        style={{ width:'100%', marginTop:'12px', background:'white', color:'#64748B', border:'1.5px solid #E2E8F0',
          borderRadius:'8px', padding:'10px', fontSize:'13px', fontWeight:'600', cursor:'pointer' }}>
        İptal
      </button>
    </Modal>
  );
}

// ─── FATURA MODAL ───────────────────────────────────────────
function FaturaModal({ odeme, mulk, acik, kapat, onFaturaKes }) {
  const [faturaNo, setFaturaNo] = useState('');
  const [faturaTarihi, setFaturaTarihi] = useState(new Date().toISOString().split('T')[0]);

  if (!acik || !odeme || !mulk) return null;

  const kes = () => {
    onFaturaKes(odeme.id, faturaNo, faturaTarihi);
    kapat();
  };

  return (
    <Modal acik={acik} kapat={kapat} baslik="🧾 Fatura Kes" genislik="440px">
      <div style={{ background:'linear-gradient(135deg,#F0FDF4,#DCFCE7)', borderRadius:'12px', padding:'16px', marginBottom:'16px', border:'1px solid #86EFAC' }}>
        <div style={{ fontSize:'13px', color:'#14532D', fontWeight:'700', marginBottom:'8px' }}>📋 Fatura Bilgileri</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
          <InfoSatir etiket="Mülk" deger={mulk?.ad} />
          <InfoSatir etiket="Kiracı" deger={mulk?.kiraci} />
          <InfoSatir etiket="TC No" deger={mulk?.kiraci_tc || '—'} />
          <InfoSatir etiket="Dönem" deger={odeme?.vadeTarihi ? `${AY_ADLARI[new Date(odeme.vadeTarihi).getMonth()]} ${new Date(odeme.vadeTarihi).getFullYear()}` : '—'} />
          <InfoSatir etiket="Tutar" deger={`₺${odeme?.tutar?.toLocaleString('tr-TR')}`} renk="#15803D" />
          <InfoSatir etiket="Ödeme Tarihi" deger={odeme?.odenmeTarihi || '—'} />
        </div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'16px' }}>
        <div>
          <label style={{ fontSize:'12px', fontWeight:'600', color:'#374151', display:'block', marginBottom:'5px' }}>Fatura No (opsiyonel)</label>
          <input type="text" placeholder="Ör: FAT-2026-001" value={faturaNo} onChange={e => setFaturaNo(e.target.value)}
            style={{ width:'100%', padding:'9px 12px', border:'1.5px solid #E2E8F0', borderRadius:'8px', fontSize:'14px', outline:'none', boxSizing:'border-box' }} />
        </div>
        <div>
          <label style={{ fontSize:'12px', fontWeight:'600', color:'#374151', display:'block', marginBottom:'5px' }}>Fatura Tarihi</label>
          <input type="date" value={faturaTarihi} onChange={e => setFaturaTarihi(e.target.value)}
            style={{ width:'100%', padding:'9px 12px', border:'1.5px solid #E2E8F0', borderRadius:'8px', fontSize:'14px', outline:'none', boxSizing:'border-box' }} />
        </div>
      </div>

      <div style={{ background:'#FEF9C3', borderRadius:'8px', padding:'12px', marginBottom:'16px', border:'1px solid #FDE68A' }}>
        <div style={{ fontSize:'12px', color:'#92400E', fontWeight:'600' }}>
          ⚠️ Not: Entegratör API bağlantısı kurulduktan sonra fatura otomatik gönderilecek. Şimdilik manuel kayıt yapılıyor.
        </div>
      </div>

      <div style={{ display:'flex', gap:'8px' }}>
        <button onClick={kapat}
          style={{ flex:1, background:'white', color:'#64748B', border:'1.5px solid #E2E8F0', borderRadius:'8px', padding:'10px', fontSize:'13px', fontWeight:'600', cursor:'pointer' }}>
          İptal
        </button>
        <button onClick={kes}
          style={{ flex:2, background:'linear-gradient(135deg,#059669,#047857)', color:'white', border:'none',
            borderRadius:'8px', padding:'12px', fontSize:'14px', fontWeight:'800', cursor:'pointer',
            boxShadow:'0 4px 14px rgba(5,150,105,0.4)' }}>
          🧾 Fatura Kes
        </button>
      </div>
    </Modal>
  );
}

// ─── AY AY ÖDEME TABLOSU ────────────────────────────────────
function AyAyOdemeler({ mulk, odemeler, onOde, onFaturaModal }) {
  const [siralama, setSiralama] = useState('yeni');

  const mulkOdemeleri = odemeler
    .filter(o => o.mulkId === mulk.id)
    .sort((a, b) => siralama === 'yeni'
      ? new Date(b.vadeTarihi) - new Date(a.vadeTarihi)
      : new Date(a.vadeTarihi) - new Date(b.vadeTarihi));

  const toplamBorc   = mulkOdemeleri.reduce((s, o) => s + o.tutar, 0);
  const toplamOdenen = mulkOdemeleri.reduce((s, o) => s + o.odenenTutar, 0);
  const toplamKalan  = toplamBorc - toplamOdenen;
  const gecikmeAdet  = mulkOdemeleri.filter(o => o.durum === 'gecikme').length;

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px', marginBottom:'16px' }}>
        {[
          { label:'TOPLAM BORÇ', deger:`₺${toplamBorc.toLocaleString('tr-TR')}`, renk:'#1D4ED8', bg:'linear-gradient(135deg,#DBEAFE,#EFF6FF)', brd:'#BFDBFE' },
          { label:'ÖDENEN',      deger:`₺${toplamOdenen.toLocaleString('tr-TR')}`, renk:'#15803D', bg:'linear-gradient(135deg,#DCFCE7,#F0FDF4)', brd:'#86EFAC' },
          { label:'KALAN',       deger:`₺${toplamKalan.toLocaleString('tr-TR')}`,  renk: toplamKalan>0?'#DC2626':'#15803D', bg: toplamKalan>0?'linear-gradient(135deg,#FEE2E2,#FFF5F5)':'linear-gradient(135deg,#DCFCE7,#F0FDF4)', brd: toplamKalan>0?'#FCA5A5':'#86EFAC' },
          { label:'GECİKMEDE',   deger: gecikmeAdet, renk: gecikmeAdet>0?'#D97706':'#94A3B8', bg: gecikmeAdet>0?'linear-gradient(135deg,#FEF3C7,#FEF9C3)':'linear-gradient(135deg,#F1F5F9,#F8FAFC)', brd: gecikmeAdet>0?'#FDE68A':'#E2E8F0' },
        ].map(k => (
          <div key={k.label} style={{ background:k.bg, borderRadius:'12px', padding:'14px 12px', textAlign:'center', border:`1px solid ${k.brd}` }}>
            <div style={{ fontSize:'20px', fontWeight:'800', color:k.renk }}>{k.deger}</div>
            <div style={{ fontSize:'11px', color:k.renk, fontWeight:'600', marginTop:'2px' }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
        <div style={{ fontSize:'13px', fontWeight:'600', color:'#374151' }}>{mulkOdemeleri.length} dönem kaydı</div>
        <div style={{ display:'flex', gap:'6px' }}>
          {['yeni','eski'].map(s => (
            <button key={s} onClick={() => setSiralama(s)}
              style={{ padding:'5px 12px', borderRadius:'6px', border:'1.5px solid', fontSize:'12px', fontWeight:'600', cursor:'pointer',
                background: siralama===s?'#3B82F6':'white', borderColor: siralama===s?'#3B82F6':'#E2E8F0',
                color: siralama===s?'white':'#64748B' }}>
              {s === 'yeni' ? '↓ En Yeni' : '↑ En Eski'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ overflowX:'auto', borderRadius:'10px', border:'1px solid #E2E8F0' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
          <thead>
            <tr style={{ background:'linear-gradient(135deg,#1E3A5F,#0F2140)' }}>
              {['Dönem','Vade Tarihi','Kira Bedeli','Ödenen Tutar','Kalan','Ödeme Tarihi','Durum','Fatura','İşlem'].map(h => (
                <th key={h} style={{ padding:'11px 12px', textAlign:'left', fontSize:'11px', fontWeight:'700', color:'#CBD5E1', whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mulkOdemeleri.map((o, idx) => {
              const dt         = new Date(o.vadeTarihi);
              const kalan      = o.tutar - o.odenenTutar;
              const gecikmisMi = o.durum === 'gecikme';
              const odendi     = o.durum === 'odendi';
              const kismiMi    = o.odenenTutar > 0 && !odendi;
              return (
                <tr key={o.id} style={{
                  borderBottom:'1px solid #F1F5F9',
                  background: gecikmisMi ? 'linear-gradient(90deg,#FFF5F5,#FFFBFB)' : odendi ? 'linear-gradient(90deg,#F0FFF4,#F7FFF8)' : kismiMi ? 'linear-gradient(90deg,#FEF9C3,#FFFEF5)' : idx%2===0?'white':'#FAFBFF',
                }}>
                  <td style={{ padding:'12px', fontWeight:'700', color:'#1E293B', fontSize:'14px' }}>
                    {AY_ADLARI[dt.getMonth()]} {dt.getFullYear()}
                  </td>
                  <td style={{ padding:'12px' }}>
                    <div style={{ color: gecikmisMi?'#DC2626':'#374151', fontWeight: gecikmisMi?'700':'500', fontSize:'13px' }}>
                      {o.vadeTarihi}
                    </div>
                    {gecikmisMi && (
                      <span style={{ fontSize:'10px', color:'#EF4444', fontWeight:'700' }}>
                        ⚠️ {Math.ceil((new Date()-new Date(o.vadeTarihi))/(1000*60*60*24))} gün gecikti
                      </span>
                    )}
                  </td>
                  <td style={{ padding:'12px', fontWeight:'700', color:'#1E293B', fontSize:'14px' }}>₺{o.tutar.toLocaleString('tr-TR')}</td>
                  <td style={{ padding:'12px' }}>
                    {o.odenenTutar > 0
                      ? <span style={{ fontWeight:'700', color:'#15803D', fontSize:'14px' }}>₺{o.odenenTutar.toLocaleString('tr-TR')}</span>
                      : <span style={{ color:'#CBD5E1' }}>—</span>}
                  </td>
                  {/* KALAN - sıfır veya miktar */}
                  <td style={{ padding:'12px' }}>
                    {kalan > 0
                      ? <span style={{ fontWeight:'800', color:'#DC2626', fontSize:'14px' }}>₺{kalan.toLocaleString('tr-TR')}</span>
                      : <span style={{ fontWeight:'800', color:'#15803D', fontSize:'14px' }}>₺0</span>}
                  </td>
                  {/* ÖDEME TARİHİ */}
                  <td style={{ padding:'12px' }}>
                    {o.odenmeTarihi
                      ? <span style={{ fontSize:'12px', background:'#F0FDF4', padding:'3px 8px', borderRadius:'6px', border:'1px solid #86EFAC' }}>📅 {o.odenmeTarihi}</span>
                      : <span style={{ color:'#CBD5E1' }}>—</span>}
                  </td>
                  <td style={{ padding:'12px' }}>
                    {kismiMi
                      ? <span style={{ padding:'4px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'700', background:'#FEF9C3', color:'#713F12', border:'1.5px solid #FDE68A' }}>💰 KISMİ</span>
                      : <DurumBadge durum={o.durum} />}
                  </td>
                  {/* FATURA */}
                  <td style={{ padding:'12px' }}>
                    {o.faturaKesildi ? (
                      <div>
                        <span style={{ background:'#DCFCE7', color:'#14532D', padding:'3px 8px', borderRadius:'8px', fontSize:'11px', fontWeight:'700', border:'1px solid #86EFAC' }}>
                          🧾 Kesildi
                        </span>
                        {o.faturaNo && <div style={{ fontSize:'10px', color:'#64748B', marginTop:'2px' }}>{o.faturaNo}</div>}
                      </div>
                    ) : (odendi && mulk.faturaKes) ? (
                      <button onClick={() => onFaturaModal(o)}
                        style={{ background:'linear-gradient(135deg,#059669,#047857)', color:'white', border:'none',
                          borderRadius:'8px', padding:'6px 12px', fontSize:'11px', fontWeight:'700', cursor:'pointer' }}>
                        🧾 Fatura Kes
                      </button>
                    ) : (
                      <span style={{ color:'#CBD5E1', fontSize:'12px' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding:'12px' }}>
                    {!odendi ? (
                      <button onClick={() => onOde(o)}
                        style={{ background: gecikmisMi?'linear-gradient(135deg,#DC2626,#B91C1C)':'linear-gradient(135deg,#3B82F6,#2563EB)',
                          color:'white', border:'none', borderRadius:'8px', padding:'7px 16px',
                          fontSize:'12px', fontWeight:'700', cursor:'pointer' }}>
                        {gecikmisMi ? '⚠️ ÖDE' : '💳 ÖDE'}
                      </button>
                    ) : (
                      <div style={{ background:'linear-gradient(135deg,#DCFCE7,#BBF7D0)', border:'1.5px solid #4ADE80',
                        borderRadius:'8px', padding:'6px 12px', fontSize:'12px', fontWeight:'700', color:'#14532D', textAlign:'center' }}>
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
        <div style={{ textAlign:'center', padding:'40px', color:'#64748B' }}>Bu mülke ait ödeme kaydı bulunamadı.</div>
      )}
    </div>
  );
}

// ─── SÖZLEŞME YENİLEME KARTI ───────────────────────────────
function SozlesmeKarti({ mulk, onYenile }) {
  const [oran, setOran]       = useState(mulk.yenilemeOrani || 20);
  const [suereYil, setSureYil] = useState(1);
  const yeniKira = Math.round(mulk.aylikKira * (1 + oran / 100));
  const artis    = yeniKira - mulk.aylikKira;

  if (!mulk.sozlesmeBitis && !mulk.sozlesmeBaslangic) return (
    <div style={{ background:'#F8FAFC', borderRadius:'12px', padding:'20px', textAlign:'center', color:'#64748B' }}>
      Bu mülk için henüz sözleşme tarihi girilmemiş.
    </div>
  );

  const bitDt      = new Date(mulk.sozlesmeBitis || mulk.sozlesmeBaslangic);
  const bugun      = new Date();
  const kalanGun   = Math.ceil((bitDt - bugun) / (1000 * 60 * 60 * 24));
  const yaklasiyor = kalanGun <= 60;
  const suruldu    = kalanGun <= 0;

  return (
    <div>
      <div style={{
        background: suruldu ? 'linear-gradient(135deg,#FEE2E2,#FFF5F5)' : yaklasiyor ? 'linear-gradient(135deg,#FEF9C3,#FFFBF0)' : 'linear-gradient(135deg,#DCFCE7,#F0FFF4)',
        border: `2px solid ${suruldu?'#FCA5A5':yaklasiyor?'#FDE68A':'#86EFAC'}`,
        borderRadius:'14px', padding:'20px', marginBottom:'16px',
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
          <div style={{ fontSize:'15px', fontWeight:'800', color: suruldu?'#991B1B':yaklasiyor?'#92400E':'#14532D' }}>
            {suruldu ? '❗ Sözleşme Süresi Doldu!' : yaklasiyor ? '⚠️ Sözleşme Yakında Bitiyor!' : '✅ Aktif Sözleşme'}
          </div>
          <span style={{ background: suruldu?'#FEE2E2':yaklasiyor?'#FEF9C3':'#DCFCE7',
            color: suruldu?'#991B1B':yaklasiyor?'#92400E':'#15803D',
            border:`1px solid ${suruldu?'#FCA5A5':yaklasiyor?'#FDE68A':'#86EFAC'}`,
            padding:'5px 14px', borderRadius:'20px', fontSize:'13px', fontWeight:'700' }}>
            {suruldu ? 'Süresi Doldu' : kalanGun === 0 ? 'Bugün Bitiyor' : `${kalanGun} gün kaldı`}
          </span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
          <InfoSatir etiket="Sözleşme Başlangıcı" deger={mulk.sozlesmeBaslangic} />
          <InfoSatir etiket="Sözleşme Bitişi"    deger={mulk.sozlesmeBitis} />
          <InfoSatir etiket="Mevcut Aylık Kira"   deger={`₺${mulk.aylikKira.toLocaleString('tr-TR')}`} renk="#15803D" />
          <InfoSatir etiket="Depozito"            deger={`₺${mulk.depozito.toLocaleString('tr-TR')}`} />
        </div>
      </div>

      {mulk.yenilemeAktif && (
        <div style={{ background:'linear-gradient(135deg,#F5F3FF,#EDE9FE)', border:'2px solid #C4B5FD', borderRadius:'14px', padding:'20px' }}>
          <div style={{ fontWeight:'800', fontSize:'15px', color:'#5B21B6', marginBottom:'16px' }}>🔄 Otomatik Yenileme Hesaplayıcı</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'16px' }}>
            <div style={{ background:'white', borderRadius:'10px', padding:'14px', border:'1px solid #DDD6FE' }}>
              <div style={{ fontSize:'11px', fontWeight:'700', color:'#7C3AED', textTransform:'uppercase', marginBottom:'8px' }}>Artış Oranı</div>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <input type="number" value={oran} min="0" max="200" onChange={e => setOran(parseFloat(e.target.value)||0)}
                  style={{ flex:1, padding:'10px', border:'2px solid #8B5CF6', borderRadius:'8px', fontSize:'20px', fontWeight:'800', textAlign:'center', color:'#5B21B6', outline:'none' }} />
                <span style={{ fontSize:'22px', fontWeight:'800', color:'#8B5CF6' }}>%</span>
              </div>
            </div>
            <div style={{ background:'white', borderRadius:'10px', padding:'14px', border:'1px solid #DDD6FE' }}>
              <div style={{ fontSize:'11px', fontWeight:'700', color:'#7C3AED', textTransform:'uppercase', marginBottom:'8px' }}>Yenileme Süresi</div>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <input type="number" value={suereYil} min="1" max="5" onChange={e => setSureYil(parseInt(e.target.value)||1)}
                  style={{ flex:1, padding:'10px', border:'2px solid #8B5CF6', borderRadius:'8px', fontSize:'20px', fontWeight:'800', textAlign:'center', color:'#5B21B6', outline:'none' }} />
                <span style={{ fontSize:'16px', fontWeight:'700', color:'#8B5CF6' }}>Yıl</span>
              </div>
            </div>
          </div>

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
                <div style={{ fontSize:'18px', fontWeight:'800', color:'#15803D' }}>+₺{artis.toLocaleString('tr-TR')}</div>
                <div style={{ fontSize:'11px', color:'#16A34A', fontWeight:'600' }}>+%{oran}</div>
              </div>
              <div style={{ background:'#EDE9FE', borderRadius:'10px', padding:'10px 16px', textAlign:'center', border:'1px solid #C4B5FD' }}>
                <div style={{ fontSize:'11px', color:'#64748B', fontWeight:'600', marginBottom:'2px' }}>YILLIK GELİR</div>
                <div style={{ fontSize:'18px', fontWeight:'800', color:'#5B21B6' }}>₺{(yeniKira*12).toLocaleString('tr-TR')}</div>
              </div>
            </div>
          </div>

          <button onClick={() => onYenile(mulk.id, oran, yeniKira, suereYil)}
            style={{ width:'100%', background:'linear-gradient(135deg,#7C3AED,#5B21B6)', color:'white', border:'none',
              borderRadius:'10px', padding:'14px', fontSize:'15px', fontWeight:'800', cursor:'pointer',
              boxShadow:'0 4px 14px rgba(124,58,237,0.4)' }}>
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

// ─── INPUT HELPER (Ana bileşen dışında - focus sorunu önlenir) ────
function Inp({ label, name, tip='text', options, tam, zorunlu, form: f, setForm: sf }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'5px', gridColumn: tam ? '1/-1' : undefined }}>
      <label style={{ fontSize:'12px', fontWeight:'600', color:'#374151' }}>
        {label}{zorunlu && <span style={{ color:'#EF4444' }}> *</span>}
      </label>
      {options ? (
        <select style={{ padding:'9px 12px', border:'1.5px solid #E2E8F0', borderRadius:'8px', fontSize:'14px', outline:'none', background:'white' }}
          value={f[name]??''} onChange={e => sf(p=>({...p,[name]:e.target.value}))}>
          <option value="">Seçin...</option>
          {options.map(o => <option key={o.value??o} value={o.value??o}>{o.label??o}</option>)}
        </select>
      ) : (
        <input style={{ padding:'9px 12px', border:'1.5px solid #E2E8F0', borderRadius:'8px', fontSize:'14px', outline:'none' }}
          type={tip} value={f[name]??''} onChange={e => sf(p=>({...p,[name]:e.target.value}))} placeholder={label} />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  ANA SAYFA
// ═══════════════════════════════════════════════════════════
export default function KiraPage() {
  const [mulkler, setMulkler]   = useState([]);
  const [odemeler, setOdemeler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [aktifTab, setAktifTab]  = useState('mulkler');
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
    mulkId:'', tarih: new Date().toISOString().split('T')[0],
    tutar:'', aciklama:'', durum:'odendi',
  });
  const [kaydediliyor, setKaydediliyor] = useState(false);

  // Kısmi/Onay ödeme modal
  const [odemeOnayModal, setOdemeOnayModal] = useState(false);
  const [seciliOdeme, setSeciliOdeme]       = useState(null);

  // Fatura modal
  const [faturaModalAcik, setFaturaModalAcik] = useState(false);
  const [faturaOdeme, setFaturaOdeme]         = useState(null);

  // ─── Veri Yükle ──────────────────────────────────────────
  useEffect(() => {
    async function yukle() {
      setYukleniyor(true);
      const [{ data: md }, { data: od }] = await Promise.all([
        supabase.from('kira_mulkleri').select('*').order('id'),
        supabase.from('kira_odemeleri').select('*').order('vade_tarihi', { ascending: false }),
      ]);
      setMulkler((md || []).map(dbToMulk));
      setOdemeler((od || []).map(dbToOdeme));
      setYukleniyor(false);
    }
    yukle();
  }, []);

  // ─── Hesaplar ────────────────────────────────────────────
  const toplamAylikKira  = useMemo(() => mulkler.filter(m=>m.durum==='aktif').reduce((s,m)=>s+m.aylikKira,0), [mulkler]);
  const toplamDepozito   = useMemo(() => mulkler.filter(m=>m.durum==='aktif').reduce((s,m)=>s+m.depozito,0),  [mulkler]);
  const gecikmeCount     = useMemo(() => odemeler.filter(o=>o.durum==='gecikme').length, [odemeler]);
  const toplamKalan      = useMemo(() => odemeler.filter(o=>o.durum!=='odendi').reduce((s,o)=>s+(o.tutar-o.odenenTutar),0), [odemeler]);

  const yaklasiyanSozlesmeler = useMemo(() =>
    mulkler.filter(m => {
      if (!m.sozlesmeBitis || m.durum !== 'aktif') return false;
      return Math.ceil((new Date(m.sozlesmeBitis) - new Date()) / (1000*60*60*24)) <= 60;
    }), [mulkler]);

  const filtrelenmis = useMemo(() =>
    mulkler.filter(m =>
      m.ad.toLowerCase().includes(aramaMetni.toLowerCase()) ||
      (m.kiraci||'').toLowerCase().includes(aramaMetni.toLowerCase()) ||
      (m.adres||'').toLowerCase().includes(aramaMetni.toLowerCase())
    ), [mulkler, aramaMetni]);

  // Fatura kesilecek ödemeler (ödendi + mülkün fatura_kes aktif + henüz fatura kesilmemiş)
  const faturaKesilenOdemeler = useMemo(() =>
    odemeler.filter(o => {
      const m = mulkler.find(x => x.id === o.mulkId);
      return o.durum === 'odendi' && m?.faturaKes && o.faturaKesildi;
    }), [odemeler, mulkler]);

  const faturaBekileyenOdemeler = useMemo(() =>
    odemeler.filter(o => {
      const m = mulkler.find(x => x.id === o.mulkId);
      return o.durum === 'odendi' && m?.faturaKes && !o.faturaKesildi;
    }), [odemeler, mulkler]);

  // ─── Ödeme al (tam veya kısmi) ───────────────────────────
  const odeIsaretle = async (odemeId, miktar, odenmeTarihi, tip) => {
    const mevcut = odemeler.find(o => o.id === odemeId);
    if (!mevcut) return;

    const yeniOdenen = mevcut.odenenTutar + miktar;
    const tamOdendi  = yeniOdenen >= mevcut.tutar;
    const yeniDurum  = tamOdendi ? 'odendi' : mevcut.durum === 'gecikme' ? 'gecikme' : 'bekliyor';

    const { error } = await supabase.from('kira_odemeleri')
      .update({
        durum:        yeniDurum,
        odenen_tutar: yeniOdenen,
        odeme_tarihi: tamOdendi ? odenmeTarihi : (mevcut.odenmeTarihi || odenmeTarihi),
      })
      .eq('id', odemeId);

    if (!error) {
      setOdemeler(prev => prev.map(o => o.id === odemeId
        ? { ...o, durum: yeniDurum, odenenTutar: yeniOdenen, odenmeTarihi: tamOdendi ? odenmeTarihi : o.odenmeTarihi }
        : o));

      // Eğer mülkün fatura_kes aktifse ve tam ödendiyse otomatik fatura listesine düşer (fatura modal açılır)
      if (tamOdendi) {
        const m = mulkler.find(x => x.id === mevcut.mulkId);
        if (m?.faturaKes) {
          setTimeout(() => {
            setFaturaOdeme({ ...mevcut, odenenTutar: yeniOdenen, durum: 'odendi', odenmeTarihi: odenmeTarihi });
            setFaturaModalAcik(true);
          }, 400);
        }
      }
    }
  };

  // ─── Fatura kes ──────────────────────────────────────────
  const faturaKes = async (odemeId, faturaNo, faturaTarihi) => {
    const { error } = await supabase.from('kira_odemeleri')
      .update({ fatura_kesildi: true, fatura_no: faturaNo, fatura_tarihi: faturaTarihi })
      .eq('id', odemeId);
    if (!error) {
      setOdemeler(prev => prev.map(o => o.id === odemeId
        ? { ...o, faturaKesildi: true, faturaNo, faturaTarihi }
        : o));
    }
  };

  // ─── Sözleşme yenile ─────────────────────────────────────
  const sozlesmeYenile = async (mulkId, oran, yeniKira, suereYil=1) => {
    const m = mulkler.find(x => x.id === mulkId);
    if (!m) return;
    const yeniBas = new Date(m.sozlesmeBitis);
    yeniBas.setDate(yeniBas.getDate() + 1);
    const yeniBit = new Date(yeniBas);
    yeniBit.setFullYear(yeniBit.getFullYear() + suereYil);
    yeniBit.setDate(yeniBit.getDate() - 1);

    const guncelM = {
      ...m,
      aylikKira: yeniKira,
      yenilemeOrani: oran,
      sozlesmeBaslangic: yeniBas.toISOString().split('T')[0],
      sozlesmeBitis:     yeniBit.toISOString().split('T')[0],
    };

    const { error } = await supabase.from('kira_mulkleri').update({
      aylik_kira: yeniKira,
      yenileme_orani: oran,
      sozlesme_baslangic: guncelM.sozlesmeBaslangic,
      sozlesme_bitis:     guncelM.sozlesmeBitis,
    }).eq('id', mulkId);

    if (!error) {
      setMulkler(prev => prev.map(x => x.id===mulkId ? guncelM : x));
      const yeniSatirlar = odemelerUret(guncelM);
      if (yeniSatirlar.length > 0) {
        const { data: eklenen } = await supabase.from('kira_odemeleri').insert(yeniSatirlar).select();
        if (eklenen) setOdemeler(prev => [...prev, ...eklenen.map(dbToOdeme)]);
      }
      alert(`✅ Sözleşme ${suereYil} yıl yenilendi! Yeni kira: ₺${yeniKira.toLocaleString('tr-TR')}`);
    }
  };

  // ─── Mülk kaydet ─────────────────────────────────────────
  const mulkKaydet = async () => {
    if (!form.ad) { alert('Mülk adı zorunludur!'); return; }
    setKaydediliyor(true);
    const obj = {
      ...form,
      aylikKira:    parseFloat(form.aylikKira) || 0,
      depozito:     parseFloat(form.depozito) || 0,
      yenilemeOrani: parseFloat(form.yenilemeOrani) || 0,
      yenilemeAktif: Boolean(form.yenilemeAktif),
      faturaKes:    Boolean(form.faturaKes),
    };

    // Ödeme satırlarını DB'ye yazar, kolon yoksa temiz veri ile tekrar dener
    const odemeInsert = async (satirlar) => {
      if (!satirlar.length) return [];
      const { data: d, error: e } = await supabase.from('kira_odemeleri').insert(satirlar).select();
      if (e) {
        console.warn('Ödeme insert hatası, basit veri ile tekrar deneniyor:', e.message);
        const temiz = satirlar.map(({ fatura_kesildi, fatura_no, fatura_tarihi, ...rest }) => rest);
        const { data: d2 } = await supabase.from('kira_odemeleri').insert(temiz).select();
        return d2 || [];
      }
      return d || [];
    };

    // Mulk insert/update - hata olursa ek kolonlar olmadan tekrar dene
    const mulkYaz = async (islem, id, veri) => {
      let res;
      if (islem === 'insert') {
        res = await supabase.from('kira_mulkleri').insert(veri).select().single();
      } else {
        res = await supabase.from('kira_mulkleri').update(veri).eq('id', id).select().single();
      }
      if (res.error) {
        // Bilinmeyen kolon hatası → ek kolonları çıkar
        _dbKolonlar.kiraci_tc = false;
        _dbKolonlar.fatura_kes = false;
        const { kiraci_tc, fatura_kes, ...temiz } = veri;
        if (islem === 'insert') {
          res = await supabase.from('kira_mulkleri').insert(temiz).select().single();
        } else {
          res = await supabase.from('kira_mulkleri').update(temiz).eq('id', id).select().single();
        }
      } else {
        _dbKolonlar.kiraci_tc = true;
        _dbKolonlar.fatura_kes = true;
      }
      return res;
    };

    if (duzenleModal) {
      const { data: guncellendi, error } = await mulkYaz('update', duzenleModal.id, mulkToDB(obj));
      if (!error) {
        const guncel = { ...duzenleModal, ...obj };
        setMulkler(prev => prev.map(m => m.id===duzenleModal.id ? guncel : m));
        await supabase.from('kira_odemeleri').delete().eq('mulk_id', duzenleModal.id);
        const yeniSatirlar = odemelerUret(guncel);
        const eklenen = await odemeInsert(yeniSatirlar);
        setOdemeler(prev => [
          ...prev.filter(o => o.mulkId !== duzenleModal.id),
          ...eklenen.map(dbToOdeme),
        ]);
      } else {
        alert('Güncelleme hatası: ' + error.message);
      }
      setDuzenle(null);
    } else {
      const { data: mulkData, error } = await mulkYaz('insert', null, mulkToDB(obj));
      if (error) { alert('Mülk eklenemedi: ' + error.message); setKaydediliyor(false); return; }
      const yeniMulk = dbToMulk(mulkData);
      setMulkler(prev => [...prev, yeniMulk]);
      const yeniSatirlar = odemelerUret(yeniMulk);
      const eklenen = await odemeInsert(yeniSatirlar);
      if (eklenen.length > 0) setOdemeler(prev => [...prev, ...eklenen.map(dbToOdeme)]);
      setYeniModal(false);
    }
    setForm(BOSFORM);
    setKaydediliyor(false);
  };

  // ─── Mülk sil ────────────────────────────────────────────
  const mulkSil = async (id) => {
    const { error } = await supabase.from('kira_mulkleri').delete().eq('id', id);
    if (!error) {
      setMulkler(prev => prev.filter(m => m.id !== id));
      setOdemeler(prev => prev.filter(o => o.mulkId !== id));
    }
    setSilOnay(null); setDetayMulk(null);
  };

  const acDuzenle = (m) => {
    setForm({ ...m, aylikKira: m.aylikKira?.toString(), depozito: m.depozito?.toString(), yenilemeOrani: m.yenilemeOrani?.toString() });
    setDuzenle(m);
  };

  // ─── Tekil ödeme ekle ────────────────────────────────────
  const tekOdemeKaydet = async () => {
    if (!odemeForm.mulkId || !odemeForm.tutar) { alert('Mülk ve tutar zorunludur!'); return; }
    const mulk = mulkler.find(m => m.id === parseInt(odemeForm.mulkId));
    const row = {
      mulk_id:      parseInt(odemeForm.mulkId),
      vade_tarihi:  odemeForm.tarih,
      tutar:        parseFloat(odemeForm.tutar) || mulk?.aylikKira || 0,
      odenen_tutar: odemeForm.durum === 'odendi' ? (parseFloat(odemeForm.tutar)||0) : 0,
      odeme_tarihi: odemeForm.durum === 'odendi' ? odemeForm.tarih : null,
      aciklama:     odemeForm.aciklama || '',
      durum:        odemeForm.durum,
      fatura_kesildi: false,
    };
    const { data, error } = await supabase.from('kira_odemeleri').insert(row).select().single();
    if (!error && data) setOdemeler(prev => [...prev, dbToOdeme(data)]);
    setOdemeModal(false);
    setOdemeForm({ mulkId:'', tarih: new Date().toISOString().split('T')[0], tutar:'', aciklama:'', durum:'odendi' });
  };

  if (yukleniyor) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'300px', flexDirection:'column', gap:'16px' }}>
      <div style={{ fontSize:'36px' }}>🏠</div>
      <div style={{ fontSize:'16px', color:'#64748B', fontWeight:'600' }}>Kira verileri yükleniyor...</div>
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
          { ikon:'🏠', label:'Toplam Mülk',       deger: mulkler.length,                               bg:'#DBEAFE', renk:'#1D4ED8' },
          { ikon:'✅', label:'Kiralık Mülk',        deger: mulkler.filter(m=>m.durum==='aktif').length,  bg:'#DCFCE7', renk:'#15803D' },
          { ikon:'💰', label:'Aylık Kira Geliri',  deger:`₺${toplamAylikKira.toLocaleString('tr-TR')}`, bg:'#FEF9C3', renk:'#B45309' },
          { ikon:'🔑', label:'Boş Mülk',           deger: mulkler.filter(m=>m.durum==='bos').length,    bg:'#FEE2E2', renk:'#DC2626' },
          { ikon:'⚠️', label:'GECİKMEDE',           deger: gecikmeCount,                                 bg:'#FEE2E2', renk:'#DC2626' },
          { ikon:'💳', label:'Tahsil Bekleyen',     deger:`₺${toplamKalan.toLocaleString('tr-TR')}`,     bg:'#EDE9FE', renk:'#6D28D9' },
          { ikon:'🛡️', label:'Toplam Depozito',     deger:`₺${toplamDepozito.toLocaleString('tr-TR')}`,  bg:'#CFFAFE', renk:'#0E7490' },
          { ikon:'🧾', label:'Fatura Bekleyen',     deger: faturaBekileyenOdemeler.length,               bg:'#FEF9C3', renk:'#D97706' },
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
        <div style={{ background:'linear-gradient(135deg,#FEF9C3,#FEF3C7)', border:'2px solid #FDE047',
          borderRadius:'12px', padding:'14px 18px', marginBottom:'16px', display:'flex', alignItems:'center', gap:'12px' }}>
          <span style={{ fontSize:'28px' }}>⚠️</span>
          <div>
            <div style={{ fontWeight:'800', color:'#92400E', fontSize:'14px', marginBottom:'3px' }}>Yaklaşan Sözleşme Bitişi — Hemen Yenileyin!</div>
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
        <div style={{ background:'linear-gradient(135deg,#FEE2E2,#FFF5F5)', border:'2px solid #FCA5A5',
          borderRadius:'12px', padding:'14px 18px', marginBottom:'16px', display:'flex', alignItems:'center', gap:'12px' }}>
          <span style={{ fontSize:'28px' }}>🔴</span>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:'800', color:'#991B1B', fontSize:'14px', marginBottom:'3px' }}>{gecikmeCount} adet GECİKMİŞ ödeme var!</div>
            <div style={{ fontSize:'13px', color:'#B91C1C' }}>
              Toplam geciken tutar: <b>₺{odemeler.filter(o=>o.durum==='gecikme').reduce((s,o)=>s+(o.tutar-o.odenenTutar),0).toLocaleString('tr-TR')}</b>
            </div>
          </div>
          <button className="btn btn-danger btn-sm" onClick={() => setAktifTab('gecikme')}>Gecikmeler →</button>
        </div>
      )}

      {/* Fatura bekleyen uyarısı */}
      {faturaBekileyenOdemeler.length > 0 && (
        <div style={{ background:'linear-gradient(135deg,#FEF9C3,#FEF3C7)', border:'2px solid #FDE68A',
          borderRadius:'12px', padding:'14px 18px', marginBottom:'16px', display:'flex', alignItems:'center', gap:'12px' }}>
          <span style={{ fontSize:'28px' }}>🧾</span>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:'800', color:'#92400E', fontSize:'14px', marginBottom:'3px' }}>{faturaBekileyenOdemeler.length} adet fatura bekliyor!</div>
            <div style={{ fontSize:'13px', color:'#78350F' }}>Ödeme alınan mülkler için fatura kesilmesi gerekiyor.</div>
          </div>
          <button className="btn btn-sm" onClick={() => setAktifTab('faturalar')}
            style={{ background:'#D97706', color:'white', border:'none', borderRadius:'8px', padding:'8px 14px', fontWeight:'700', cursor:'pointer' }}>
            Faturalar →
          </button>
        </div>
      )}

      {/* Tab Bar */}
      <div className="tab-bar">
        <div className={`tab-item ${aktifTab==='mulkler'?'aktif':''}`}  onClick={()=>setAktifTab('mulkler')}>🏠 Mülkler</div>
        <div className={`tab-item ${aktifTab==='odemeler'?'aktif':''}`} onClick={()=>setAktifTab('odemeler')}>💳 Tüm Ödemeler</div>
        <div className={`tab-item ${aktifTab==='gecikme'?'aktif':''}`}  onClick={()=>setAktifTab('gecikme')}>
          🔴 GECİKMEDE
          {gecikmeCount > 0 && (
            <span style={{ marginLeft:'6px', background:'#EF4444', color:'white', borderRadius:'10px', padding:'1px 7px', fontSize:'11px', fontWeight:'700' }}>
              {gecikmeCount}
            </span>
          )}
        </div>
        <div className={`tab-item ${aktifTab==='faturalar'?'aktif':''}`} onClick={()=>setAktifTab('faturalar')}>
          🧾 Faturalar
          {faturaBekileyenOdemeler.length > 0 && (
            <span style={{ marginLeft:'6px', background:'#D97706', color:'white', borderRadius:'10px', padding:'1px 7px', fontSize:'11px', fontWeight:'700' }}>
              {faturaBekileyenOdemeler.length}
            </span>
          )}
        </div>
      </div>

      {/* ═══ MÜLKLER ═══ */}
      {aktifTab === 'mulkler' && (
        <>
          <div className="filtre-bar">
            <input className="arama-input" placeholder="🔍 Mülk adı, kiracı veya adres ara..."
              value={aramaMetni} onChange={e => setAramaMetni(e.target.value)} />
            <button className="btn btn-primary" onClick={() => { setForm(BOSFORM); setYeniModal(true); }}>+ Mülk Ekle</button>
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
                    <th>Mülk</th><th>Kiracı</th><th>Aylık Kira</th><th>Sözleşme</th>
                    <th>Yenileme</th><th>Fatura</th><th>Ödeme Özeti</th><th>Durum</th><th>İşlem</th>
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
                          <div style={{ fontWeight:'600', fontSize:'13px' }}>{m.kiraci||<span style={{color:'#CBD5E1'}}>—</span>}</div>
                          {m.kiraci_telefon && <div style={{ fontSize:'11px', color:'#64748B' }}>{m.kiraci_telefon}</div>}
                          {m.kiraci_tc && <div style={{ fontSize:'11px', color:'#94A3B8' }}>TC: {m.kiraci_tc}</div>}
                        </td>
                        <td>
                          <span style={{ fontWeight:'800', fontSize:'15px', color:'#059669' }}>
                            {m.aylikKira>0 ? `₺${m.aylikKira.toLocaleString('tr-TR')}` : '—'}
                          </span>
                        </td>
                        <td>
                          {m.sozlesmeBaslangic ? (
                            <div style={{ lineHeight:'1.6' }}>
                              <div style={{ fontSize:'12px' }}>📅 {m.sozlesmeBaslangic}</div>
                              <div style={{ fontSize:'12px' }}>→ {m.sozlesmeBitis}</div>
                              {kalanGun !== null && (
                                <span style={{ fontSize:'11px', fontWeight:'700',
                                  color: kalanGun<=0?'#DC2626':kalanGun<=60?'#D97706':'#15803D',
                                  background: kalanGun<=0?'#FEE2E2':kalanGun<=60?'#FEF9C3':'#DCFCE7',
                                  padding:'2px 7px', borderRadius:'8px' }}>
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
                          {m.faturaKes
                            ? <span style={{ background:'#DCFCE7', color:'#14532D', padding:'4px 10px', borderRadius:'12px', fontSize:'12px', fontWeight:'700' }}>🧾 Aktif</span>
                            : <span style={{ background:'#F1F5F9', color:'#94A3B8', padding:'4px 10px', borderRadius:'12px', fontSize:'12px', fontWeight:'600' }}>—</span>}
                        </td>
                        <td>
                          <div style={{ display:'flex', gap:'4px', flexWrap:'wrap' }}>
                            {odenmis>0  && <span style={{background:'#DCFCE7',color:'#14532D',padding:'2px 7px',borderRadius:'8px',fontSize:'11px',fontWeight:'700'}}>✅{odenmis}</span>}
                            {gecikme>0  && <span style={{background:'#FEE2E2',color:'#7F1D1D',padding:'2px 7px',borderRadius:'8px',fontSize:'11px',fontWeight:'700'}}>🔴{gecikme}</span>}
                            {bekliyor>0 && <span style={{background:'#FEF9C3',color:'#713F12',padding:'2px 7px',borderRadius:'8px',fontSize:'11px',fontWeight:'700'}}>⏳{bekliyor}</span>}
                          </div>
                        </td>
                        <td>
                          <span style={{ padding:'5px 12px', borderRadius:'12px', fontSize:'12px', fontWeight:'700',
                            background: m.durum==='aktif'?'#DCFCE7':'#FEE2E2', color: m.durum==='aktif'?'#14532D':'#991B1B' }}>
                            {m.durum==='aktif' ? '✅ Kiralık' : '🔑 Boş'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display:'flex', gap:'4px' }}>
                            <button className="btn btn-secondary btn-sm" title="Detay" onClick={() => { setDetayMulk(m); setDetaySekme('ozet'); }}>👁</button>
                            <button className="btn btn-secondary btn-sm" title="Düzenle" onClick={() => acDuzenle(m)}>✏️</button>
                            <button className="btn btn-danger btn-sm" title="Sil" onClick={() => setSilOnay(m)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtrelenmis.length === 0 && (
                    <tr><td colSpan={9} style={{ textAlign:'center', padding:'40px', color:'#64748B' }}>Arama sonucu bulunamadı.</td></tr>
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
                  <th>Mülk / Kiracı</th><th>Dönem</th><th>Vade Tarihi</th><th>Borç</th>
                  <th>Ödenen</th><th>Kalan</th><th>Ödeme Tarihi</th><th>Durum</th><th>Fatura</th><th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {[...odemeler].sort((a,b)=>new Date(b.vadeTarihi)-new Date(a.vadeTarihi)).map(o => {
                  const m   = mulkler.find(x=>x.id===o.mulkId);
                  const kalan = o.tutar - o.odenenTutar;
                  const dt  = new Date(o.vadeTarihi);
                  const kismiMi = o.odenenTutar > 0 && o.durum !== 'odendi';
                  return (
                    <tr key={o.id} style={{
                      background: o.durum==='gecikme' ? 'linear-gradient(90deg,#FFF5F5,white)' : o.durum==='odendi' ? 'linear-gradient(90deg,#F0FFF4,white)' : kismiMi ? 'linear-gradient(90deg,#FFFBF0,white)' : 'white'
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
                      <td style={{ fontWeight:'800', color: kalan>0?'#DC2626':'#15803D' }}>
                        ₺{kalan.toLocaleString('tr-TR')}
                      </td>
                      <td style={{ fontSize:'12px' }}>{o.odenmeTarihi ? `📅 ${o.odenmeTarihi}` : '—'}</td>
                      <td>
                        {kismiMi
                          ? <span style={{ padding:'4px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:'700', background:'#FEF9C3', color:'#713F12', border:'1.5px solid #FDE68A' }}>💰 KISMİ</span>
                          : <DurumBadge durum={o.durum} />}
                      </td>
                      <td>
                        {o.faturaKesildi ? (
                          <span style={{ background:'#DCFCE7', color:'#14532D', padding:'3px 8px', borderRadius:'8px', fontSize:'11px', fontWeight:'700' }}>🧾 Kesildi</span>
                        ) : (o.durum === 'odendi' && m?.faturaKes) ? (
                          <button onClick={() => { setFaturaOdeme(o); setFaturaModalAcik(true); }}
                            style={{ background:'#059669', color:'white', border:'none', borderRadius:'8px', padding:'5px 10px', fontSize:'11px', fontWeight:'700', cursor:'pointer' }}>
                            🧾 Kes
                          </button>
                        ) : <span style={{ color:'#CBD5E1', fontSize:'11px' }}>—</span>}
                      </td>
                      <td>
                        {o.durum !== 'odendi' ? (
                          <button className="btn btn-success btn-sm" onClick={() => { setSeciliOdeme(o); setOdemeOnayModal(true); }}>💳 ÖDE</button>
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
                <tr><th>Mülk / Kiracı</th><th>Dönem</th><th>Vade Tarihi</th><th>Geciken Tutar</th><th>Gecikme Süresi</th><th>İşlem</th></tr>
              </thead>
              <tbody>
                {odemeler.filter(o=>o.durum==='gecikme').sort((a,b)=>new Date(a.vadeTarihi)-new Date(b.vadeTarihi)).map(o => {
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
                      <td><div style={{ color:'#DC2626', fontWeight:'700', fontSize:'13px' }}>{o.vadeTarihi}</div></td>
                      <td><span style={{ fontSize:'18px', fontWeight:'800', color:'#DC2626' }}>₺{(o.tutar-o.odenenTutar).toLocaleString('tr-TR')}</span></td>
                      <td>
                        <div style={{ background:'#FEE2E2', borderRadius:'8px', padding:'6px 12px', display:'inline-block' }}>
                          <span style={{ fontWeight:'700', color:'#991B1B', fontSize:'13px' }}>{gecikmeGun} gün</span>
                        </div>
                      </td>
                      <td>
                        <button onClick={() => { setSeciliOdeme(o); setOdemeOnayModal(true); }}
                          style={{ background:'linear-gradient(135deg,#DC2626,#B91C1C)', color:'white', border:'none',
                            borderRadius:'8px', padding:'8px 18px', fontSize:'13px', fontWeight:'700', cursor:'pointer' }}>
                          ⚠️ GECİKMEYİ ÖDE
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {odemeler.filter(o=>o.durum==='gecikme').length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign:'center', padding:'50px', color:'#64748B' }}>
                    <div style={{ fontSize:'40px', marginBottom:'12px' }}>✅</div>
                    <div style={{ fontWeight:'700', fontSize:'15px' }}>Gecikmiş ödeme yok!</div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ FATURALAR ═══ */}
      {aktifTab === 'faturalar' && (
        <div>
          {/* Fatura Bekleyenler */}
          {faturaBekileyenOdemeler.length > 0 && (
            <div className="panel" style={{ marginBottom:'16px' }}>
              <div className="panel-baslik">
                <h3>🧾 Fatura Kesilecekler</h3>
                <span style={{ background:'#FEF9C3', color:'#92400E', padding:'5px 14px', borderRadius:'12px', fontSize:'13px', fontWeight:'700' }}>
                  {faturaBekileyenOdemeler.length} adet bekliyor
                </span>
              </div>
              <div className="tablo-container">
                <table>
                  <thead>
                    <tr><th>Mülk</th><th>Kiracı</th><th>TC No</th><th>Dönem</th><th>Tutar</th><th>Ödeme Tarihi</th><th>İşlem</th></tr>
                  </thead>
                  <tbody>
                    {faturaBekileyenOdemeler.map(o => {
                      const m = mulkler.find(x => x.id === o.mulkId);
                      const dt = new Date(o.vadeTarihi);
                      return (
                        <tr key={o.id} style={{ background:'linear-gradient(90deg,#FFFBF0,white)' }}>
                          <td><div style={{ fontWeight:'700' }}>{TIP_IKONLARI[m?.tip]} {m?.ad}</div></td>
                          <td><div style={{ fontWeight:'600' }}>{m?.kiraci || '—'}</div></td>
                          <td><div style={{ fontSize:'12px', color:'#64748B' }}>{m?.kiraci_tc || '—'}</div></td>
                          <td>{AY_ADLARI[dt.getMonth()]} {dt.getFullYear()}</td>
                          <td style={{ fontWeight:'800', color:'#059669' }}>₺{o.tutar.toLocaleString('tr-TR')}</td>
                          <td style={{ fontSize:'12px' }}>{o.odenmeTarihi ? `📅 ${o.odenmeTarihi}` : '—'}</td>
                          <td>
                            <button onClick={() => { setFaturaOdeme(o); setFaturaModalAcik(true); }}
                              style={{ background:'linear-gradient(135deg,#059669,#047857)', color:'white', border:'none',
                                borderRadius:'8px', padding:'8px 16px', fontSize:'13px', fontWeight:'700', cursor:'pointer' }}>
                              🧾 Fatura Kes
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Kesilen Faturalar */}
          <div className="panel">
            <div className="panel-baslik">
              <h3>✅ Kesilen Faturalar</h3>
              <span style={{ background:'#DCFCE7', color:'#14532D', padding:'5px 14px', borderRadius:'12px', fontSize:'13px', fontWeight:'700' }}>
                {faturaKesilenOdemeler.length} adet
              </span>
            </div>
            <div className="tablo-container">
              <table>
                <thead>
                  <tr><th>Mülk</th><th>Kiracı</th><th>TC No</th><th>Dönem</th><th>Tutar</th><th>Fatura No</th><th>Fatura Tarihi</th><th>Durum</th></tr>
                </thead>
                <tbody>
                  {faturaKesilenOdemeler.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign:'center', padding:'40px', color:'#64748B' }}>
                      Henüz kesilmiş fatura yok.
                    </td></tr>
                  ) : faturaKesilenOdemeler.map(o => {
                    const m = mulkler.find(x => x.id === o.mulkId);
                    const dt = new Date(o.vadeTarihi);
                    return (
                      <tr key={o.id} style={{ background:'linear-gradient(90deg,#F0FFF4,white)' }}>
                        <td><div style={{ fontWeight:'700' }}>{TIP_IKONLARI[m?.tip]} {m?.ad}</div></td>
                        <td><div style={{ fontWeight:'600' }}>{m?.kiraci || '—'}</div></td>
                        <td><div style={{ fontSize:'12px', color:'#64748B' }}>{m?.kiraci_tc || '—'}</div></td>
                        <td>{AY_ADLARI[dt.getMonth()]} {dt.getFullYear()}</td>
                        <td style={{ fontWeight:'800', color:'#059669' }}>₺{o.tutar.toLocaleString('tr-TR')}</td>
                        <td><span style={{ fontSize:'12px', fontWeight:'700', color:'#14532D' }}>{o.faturaNo || '—'}</span></td>
                        <td style={{ fontSize:'12px' }}>{o.faturaTarihi ? `📅 ${o.faturaTarihi}` : '—'}</td>
                        <td><span style={{ background:'#DCFCE7', color:'#14532D', padding:'4px 10px', borderRadius:'12px', fontSize:'12px', fontWeight:'700' }}>🧾 Kesildi</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MÜLK DETAY MODAL ═══ */}
      <Modal acik={!!detayMulk} kapat={() => setDetayMulk(null)}
        baslik={`${TIP_IKONLARI[detayMulk?.tip]||'🏠'} ${detayMulk?.ad}`} genislik="820px">
        {detayMulk && (() => {
          const gm = mulkler.find(m => m.id === detayMulk.id) || detayMulk;
          return (
            <>
              <div style={{ display:'flex', gap:'16px', background:'linear-gradient(135deg,#1E3A5F,#0F2140)',
                borderRadius:'14px', padding:'20px', marginBottom:'16px', alignItems:'center' }}>
                <span style={{ fontSize:'48px' }}>{TIP_IKONLARI[gm.tip]||'🏠'}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'20px', fontWeight:'800', color:'white' }}>{gm.ad}</div>
                  <div style={{ fontSize:'13px', color:'#94A3B8', marginTop:'3px' }}>📍 {gm.adres}</div>
                  {gm.kiraci && <div style={{ fontSize:'13px', color:'#93C5FD', marginTop:'5px' }}>👤 {gm.kiraci}{gm.kiraci_telefon && ` — ${gm.kiraci_telefon}`}{gm.kiraci_tc && ` | TC: ${gm.kiraci_tc}`}</div>}
                  {gm.faturaKes && <div style={{ fontSize:'12px', color:'#6EE7B7', marginTop:'4px' }}>🧾 Fatura kesilecek</div>}
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:'28px', fontWeight:'800', color:'#6EE7B7' }}>
                    {gm.aylikKira > 0 ? `₺${gm.aylikKira.toLocaleString('tr-TR')}` : '—'}
                  </div>
                  <div style={{ fontSize:'11px', color:'#94A3B8', marginBottom:'6px' }}>Aylık Kira</div>
                  <span style={{ padding:'5px 14px', borderRadius:'12px', fontSize:'12px', fontWeight:'700',
                    background: gm.durum==='aktif'?'rgba(21,128,61,0.3)':'rgba(220,38,38,0.3)',
                    color: gm.durum==='aktif'?'#6EE7B7':'#FCA5A5',
                    border:`1px solid ${gm.durum==='aktif'?'#6EE7B7':'#FCA5A5'}` }}>
                    {gm.durum==='aktif' ? '✅ Kiralık' : '🔑 Boş'}
                  </span>
                </div>
              </div>

              <div className="tab-bar" style={{ marginBottom:'16px' }}>
                {[
                  {id:'ozet',label:'📋 Özet'},
                  {id:'odemeler',label:'💳 Ay Ay Ödemeler'},
                  {id:'sozlesme',label:'📄 Sözleşme & Yenileme'},
                  {id:'fatura_detay',label:'🧾 Faturalar'},
                ].map(t => (
                  <div key={t.id} className={`tab-item ${detaySekme===t.id?'aktif':''}`} onClick={()=>setDetaySekme(t.id)}>{t.label}</div>
                ))}
              </div>

              {detaySekme === 'ozet' && (
                <div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', marginBottom:'16px' }}>
                    <InfoSatir etiket="Mülk Tipi" deger={gm.tip?.toUpperCase()} />
                    <InfoSatir etiket="Kiracı" deger={gm.kiraci} />
                    <InfoSatir etiket="Kiracı Telefon" deger={gm.kiraci_telefon} />
                    <InfoSatir etiket="Kiracı TC No" deger={gm.kiraci_tc || '—'} />
                    <InfoSatir etiket="Aylık Kira" deger={`₺${gm.aylikKira.toLocaleString('tr-TR')}`} renk="#059669" />
                    <InfoSatir etiket="Depozito" deger={`₺${gm.depozito.toLocaleString('tr-TR')}`} />
                    <InfoSatir etiket="E-posta" deger={gm.kiraci_email} />
                    <InfoSatir etiket="Sözleşme Başlangıç" deger={gm.sozlesmeBaslangic} />
                    <InfoSatir etiket="Sözleşme Bitiş" deger={gm.sozlesmeBitis} />
                    <InfoSatir etiket="Oto. Yenileme" deger={gm.yenilemeAktif ? `✅ Aktif — %${gm.yenilemeOrani} artış` : '❌ Pasif'} renk={gm.yenilemeAktif?'#7C3AED':'#64748B'} />
                    <InfoSatir etiket="Fatura Kesilecek" deger={gm.faturaKes ? '✅ Evet' : '❌ Hayır'} renk={gm.faturaKes?'#059669':'#64748B'} />
                  </div>
                  <div style={{ display:'flex', gap:'8px' }}>
                    <button className="btn btn-primary" style={{ flex:1 }} onClick={() => { setDetayMulk(null); acDuzenle(gm); }}>✏️ Düzenle</button>
                    <button className="btn btn-secondary" style={{ flex:1 }} onClick={() => setDetaySekme('odemeler')}>💳 Ödemeleri Gör</button>
                    <button className="btn btn-secondary" style={{ flex:1 }} onClick={() => setDetaySekme('sozlesme')}>📄 Sözleşme</button>
                    <button className="btn btn-danger btn-sm" onClick={() => setSilOnay(gm)}>🗑️</button>
                  </div>
                </div>
              )}

              {detaySekme === 'odemeler' && (
                <AyAyOdemeler
                  mulk={gm}
                  odemeler={odemeler}
                  onOde={(o) => { setSeciliOdeme(o); setOdemeOnayModal(true); }}
                  onFaturaModal={(o) => { setFaturaOdeme(o); setFaturaModalAcik(true); }}
                />
              )}

              {detaySekme === 'sozlesme' && (
                <SozlesmeKarti mulk={gm} onYenile={(id,oran,yeniKira,sure) => {
                  sozlesmeYenile(id, oran, yeniKira, sure);
                  setDetayMulk(m => ({ ...m, aylikKira: yeniKira, yenilemeOrani: oran }));
                }} />
              )}

              {detaySekme === 'fatura_detay' && (() => {
                const mulkFaturaOdemeleri = odemeler.filter(o => o.mulkId === gm.id);
                const kesilmis = mulkFaturaOdemeleri.filter(o => o.faturaKesildi);
                const bekleyen = mulkFaturaOdemeleri.filter(o => o.durum === 'odendi' && !o.faturaKesildi && gm.faturaKes);
                return (
                  <div>
                    {!gm.faturaKes && (
                      <div style={{ background:'#FEF9C3', borderRadius:'10px', padding:'16px', marginBottom:'16px', border:'1px solid #FDE68A', textAlign:'center' }}>
                        <div style={{ fontWeight:'700', color:'#92400E' }}>Bu mülk için fatura kesilecek özelliği aktif değil.</div>
                        <div style={{ fontSize:'13px', color:'#78350F', marginTop:'4px' }}>Düzenle butonundan "Fatura Kesilecek" seçeneğini aktif edebilirsiniz.</div>
                      </div>
                    )}
                    {bekleyen.length > 0 && (
                      <div style={{ marginBottom:'16px' }}>
                        <div style={{ fontWeight:'700', fontSize:'14px', color:'#92400E', marginBottom:'8px' }}>🧾 Fatura Bekleyenler</div>
                        {bekleyen.map(o => {
                          const dt = new Date(o.vadeTarihi);
                          return (
                            <div key={o.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:'#FFFBF0', border:'1px solid #FDE68A', borderRadius:'8px', padding:'12px 16px', marginBottom:'8px' }}>
                              <div>
                                <div style={{ fontWeight:'700', fontSize:'13px' }}>{AY_ADLARI[dt.getMonth()]} {dt.getFullYear()}</div>
                                <div style={{ fontSize:'12px', color:'#64748B' }}>₺{o.tutar.toLocaleString('tr-TR')}</div>
                              </div>
                              <button onClick={() => { setFaturaOdeme(o); setFaturaModalAcik(true); }}
                                style={{ background:'linear-gradient(135deg,#059669,#047857)', color:'white', border:'none',
                                  borderRadius:'8px', padding:'8px 16px', fontSize:'13px', fontWeight:'700', cursor:'pointer' }}>
                                🧾 Fatura Kes
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <div style={{ fontWeight:'700', fontSize:'14px', color:'#14532D', marginBottom:'8px' }}>✅ Kesilen Faturalar ({kesilmis.length})</div>
                    {kesilmis.length === 0 ? (
                      <div style={{ textAlign:'center', padding:'24px', color:'#64748B', background:'#F8FAFC', borderRadius:'8px' }}>Henüz kesilmiş fatura yok.</div>
                    ) : kesilmis.map(o => {
                      const dt = new Date(o.vadeTarihi);
                      return (
                        <div key={o.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:'#F0FFF4', border:'1px solid #86EFAC', borderRadius:'8px', padding:'12px 16px', marginBottom:'8px' }}>
                          <div>
                            <div style={{ fontWeight:'700', fontSize:'13px' }}>{AY_ADLARI[dt.getMonth()]} {dt.getFullYear()}</div>
                            <div style={{ fontSize:'12px', color:'#14532D' }}>₺{o.tutar.toLocaleString('tr-TR')} {o.faturaNo && `| ${o.faturaNo}`}</div>
                            {o.faturaTarihi && <div style={{ fontSize:'11px', color:'#64748B' }}>Fatura Tarihi: {o.faturaTarihi}</div>}
                          </div>
                          <span style={{ background:'#DCFCE7', color:'#14532D', padding:'5px 12px', borderRadius:'12px', fontSize:'12px', fontWeight:'700' }}>🧾 Kesildi</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </>
          );
        })()}
      </Modal>

      {/* ═══ Mülk Yeni / Düzenle Modal ═══ */}
      <Modal acik={yeniModal || !!duzenleModal} kapat={() => { setYeniModal(false); setDuzenle(null); setForm(BOSFORM); }}
        baslik={duzenleModal ? '✏️ Mülk Düzenle' : '+ Yeni Mülk Ekle'} genislik="640px">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          <Inp label="Mülk Adı" name="ad" zorunlu tam form={form} setForm={setForm} />
          <Inp label="Adres" name="adres" tam form={form} setForm={setForm} />
          <Inp label="Mülk Tipi" name="tip" options={TIPLER.map(t=>({ value:t, label:`${TIP_IKONLARI[t]||'🏠'} ${t.charAt(0).toUpperCase()+t.slice(1)}` }))} form={form} setForm={setForm} />
          <Inp label="Durum" name="durum" options={[{value:'aktif',label:'✅ Kiralık'},{value:'bos',label:'🔑 Boş'}]} form={form} setForm={setForm} />
          <Inp label="Kiracı Adı" name="kiraci" form={form} setForm={setForm} />
          <Inp label="Kiracı TC No (opsiyonel)" name="kiraci_tc" form={form} setForm={setForm} />
          <Inp label="Kiracı Telefon" name="kiraci_telefon" form={form} setForm={setForm} />
          <Inp label="Kiracı E-posta" name="kiraci_email" tip="email" form={form} setForm={setForm} />
          <Inp label="Aylık Kira (₺)" name="aylikKira" tip="number" form={form} setForm={setForm} />
          <Inp label="Depozito (₺)" name="depozito" tip="number" form={form} setForm={setForm} />
          <Inp label="Sözleşme Başlangıç" name="sozlesmeBaslangic" tip="date" form={form} setForm={setForm} />
          <Inp label="Sözleşme Bitiş" name="sozlesmeBitis" tip="date" form={form} setForm={setForm} />

          {/* Fatura Kesilecek */}
          <div style={{ gridColumn:'1/-1', background:'linear-gradient(135deg,#F0FDF4,#DCFCE7)', border:'2px solid #86EFAC', borderRadius:'12px', padding:'14px 16px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <input type="checkbox" id="faturaChk" checked={Boolean(form.faturaKes)}
                onChange={e => setForm(p=>({...p,faturaKes:e.target.checked}))}
                style={{ width:'18px', height:'18px', accentColor:'#059669', cursor:'pointer' }} />
              <label htmlFor="faturaChk" style={{ fontWeight:'800', fontSize:'15px', color:'#14532D', cursor:'pointer' }}>
                🧾 Fatura Kesilecek
              </label>
            </div>
            {form.faturaKes && (
              <div style={{ fontSize:'13px', color:'#15803D', marginTop:'8px', paddingLeft:'28px' }}>
                ✅ Bu mülk için ödeme alındığında otomatik olarak fatura kesilecekler listesine düşer.
              </div>
            )}
          </div>

          {/* Otomatik Yenileme */}
          <div style={{ gridColumn:'1/-1', background:'linear-gradient(135deg,#F5F3FF,#EDE9FE)', border:'2px solid #C4B5FD', borderRadius:'12px', padding:'16px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
              <input type="checkbox" id="yenilemeChk" checked={Boolean(form.yenilemeAktif)}
                onChange={e => setForm(p=>({...p,yenilemeAktif:e.target.checked}))}
                style={{ width:'18px', height:'18px', accentColor:'#8B5CF6', cursor:'pointer' }} />
              <label htmlFor="yenilemeChk" style={{ fontWeight:'800', fontSize:'15px', color:'#5B21B6', cursor:'pointer' }}>
                🔄 Otomatik Sözleşme Yenileme
              </label>
            </div>
            {form.yenilemeAktif && (
              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <label style={{ fontSize:'13px', color:'#6D28D9', fontWeight:'600' }}>Artış Oranı:</label>
                <input type="number" value={form.yenilemeOrani||''} min="0" max="200"
                  onChange={e=>setForm(p=>({...p,yenilemeOrani:e.target.value}))}
                  style={{ width:'70px', padding:'8px', border:'2px solid #8B5CF6', borderRadius:'8px', fontSize:'18px', fontWeight:'800', textAlign:'center', color:'#5B21B6', outline:'none' }} />
                <span style={{ fontWeight:'800', fontSize:'18px', color:'#8B5CF6' }}>%</span>
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
          <button className="btn btn-secondary" onClick={() => { setYeniModal(false); setDuzenle(null); setForm(BOSFORM); }}>İptal</button>
          <button className="btn btn-primary" onClick={mulkKaydet} disabled={kaydediliyor}>
            {kaydediliyor ? '⏳ Kaydediliyor...' : duzenleModal ? '💾 Güncelle' : '✅ Kaydet'}
          </button>
        </div>
      </Modal>

      {/* ═══ Tekil Ödeme Ekle Modal ═══ */}
      <Modal acik={odemeModal} kapat={() => setOdemeModal(false)} baslik="+ Kira Ödemesi Ekle" genislik="440px">
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          <Inp label="Mülk" name="mulkId" zorunlu options={mulkler.map(m=>({ value:m.id, label:`${TIP_IKONLARI[m.tip]} ${m.ad}` }))} form={odemeForm} setForm={setOdemeForm} />
          <Inp label="Tarih" name="tarih" tip="date" form={odemeForm} setForm={setOdemeForm} />
          <Inp label="Tutar (₺)" name="tutar" tip="number" zorunlu form={odemeForm} setForm={setOdemeForm} />
          <Inp label="Durum" name="durum" options={[{value:'odendi',label:'✅ ÖDENDİ'},{value:'bekliyor',label:'⏳ BEKLİYOR'},{value:'gecikme',label:'🔴 GECİKMEDE'}]} form={odemeForm} setForm={setOdemeForm} />
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

      {/* ═══ Kısmi/Onay Ödeme Modal ═══ */}
      <OdemeOnayModal
        acik={odemeOnayModal}
        odeme={seciliOdeme}
        mulk={seciliOdeme ? mulkler.find(m => m.id === seciliOdeme.mulkId) : null}
        kapat={() => { setOdemeOnayModal(false); setSeciliOdeme(null); }}
        onOde={odeIsaretle}
      />

      {/* ═══ Fatura Modal ═══ */}
      <FaturaModal
        acik={faturaModalAcik}
        odeme={faturaOdeme}
        mulk={faturaOdeme ? mulkler.find(m => m.id === faturaOdeme.mulkId) : null}
        kapat={() => { setFaturaModalAcik(false); setFaturaOdeme(null); }}
        onFaturaKes={faturaKes}
      />
    </div>
  );
}
