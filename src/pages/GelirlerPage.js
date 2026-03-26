import React, { useState, useMemo } from 'react';
import { SUBELER, SIRKETLER } from '../data/mockData';
import Modal from '../components/Modal';

// ─── GELİR KATEGORİLERİ ────────────────────────────────────
const GELIR_KATEGORILER = [
  { id: 'kurs_ucreti',   label: 'Kurs Ücreti',        ikon: '📚', renk: '#3B82F6' },
  { id: 'sinav_ucreti',  label: 'Sınav Ücreti',        ikon: '📝', renk: '#8B5CF6' },
  { id: 'kira_geliri',   label: 'Kira Geliri',          ikon: '🏢', renk: '#10B981' },
  { id: 'diger',         label: 'Diğer Gelir',          ikon: '💼', renk: '#64748B' },
];

// ─── ÖDEME YÖNTEMLERİ ──────────────────────────────────────
const ODEME_YONTEMLERI = [
  { id: 'nakit', label: 'Nakit',          ikon: '💵', renk: '#10B981', bg: '#DCFCE7' },
  { id: 'kk',    label: 'Kredi Kartı',    ikon: '💳', renk: '#3B82F6', bg: '#DBEAFE' },
  { id: 'banka', label: 'Banka Transferi',ikon: '🏦', renk: '#8B5CF6', bg: '#EDE9FE' },
];

const KAT_MAP   = Object.fromEntries(GELIR_KATEGORILER.map(k => [k.id, k]));
const ODEME_MAP = Object.fromEntries(ODEME_YONTEMLERI.map(o => [o.id, o]));

const AYLAR = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

// ─── BAŞLANGIÇ GELİR VERİSİ ────────────────────────────────
const BASLANGIC_GELIRLER = [
  // Sürücü Kursu şubeleri
  { id: 1,  subeId: 1,  kategori: 'kurs_ucreti',   tarih: '2025-03-05', tutar: 8500,  odemeYontemi: 'nakit', aciklama: 'B sınıfı kurs kayıt ücreti',      belgeNo: 'GLR-2025-0301', ogrenciAd: 'Ahmet Yılmaz' },
  { id: 2,  subeId: 1,  kategori: 'kurs_ucreti',   tarih: '2025-03-10', tutar: 8500,  odemeYontemi: 'kk',    aciklama: 'B sınıfı kurs kayıt ücreti',      belgeNo: 'GLR-2025-0302', ogrenciAd: 'Fatma Demir' },
  { id: 3,  subeId: 1,  kategori: 'sinav_ucreti',  tarih: '2025-03-15', tutar: 1200,  odemeYontemi: 'nakit', aciklama: 'Teorik sınav ücreti',              belgeNo: 'GLR-2025-0303', ogrenciAd: 'Mehmet Kaya' },
  { id: 5,  subeId: 2,  kategori: 'kurs_ucreti',   tarih: '2025-03-07', tutar: 9200,  odemeYontemi: 'kk',    aciklama: 'C sınıfı kurs ücreti',             belgeNo: 'GLR-2025-0305', ogrenciAd: 'Ali Çelik' },
  { id: 6,  subeId: 2,  kategori: 'kurs_ucreti',   tarih: '2025-03-12', tutar: 7800,  odemeYontemi: 'nakit', aciklama: 'B sınıfı 2. taksit',               belgeNo: 'GLR-2025-0306', ogrenciAd: 'Zeynep Yıldız' },
  { id: 7,  subeId: 2,  kategori: 'sinav_ucreti',  tarih: '2025-03-20', tutar: 1200,  odemeYontemi: 'nakit', aciklama: 'Direksiyon sınav ücreti',           belgeNo: 'GLR-2025-0307', ogrenciAd: 'Hasan Aydın' },
  // SRC Kursu
  { id: 8,  subeId: 10, kategori: 'kurs_ucreti',   tarih: '2025-03-03', tutar: 4500,  odemeYontemi: 'banka', aciklama: 'SRC 2 kurs ücreti',                belgeNo: 'GLR-2025-0308', ogrenciAd: 'Fatma Çelik' },
  { id: 9,  subeId: 10, kategori: 'kurs_ucreti',   tarih: '2025-03-08', tutar: 4800,  odemeYontemi: 'kk',    aciklama: 'SRC 4 kurs ücreti',                belgeNo: 'GLR-2025-0309', ogrenciAd: 'Özlem Güler' },
  { id: 10, subeId: 10, kategori: 'sinav_ucreti',  tarih: '2025-03-22', tutar: 850,   odemeYontemi: 'nakit', aciklama: 'SRC sınav giriş ücreti',            belgeNo: 'GLR-2025-0310', ogrenciAd: '' },
  { id: 11, subeId: 11, kategori: 'kurs_ucreti',   tarih: '2025-03-14', tutar: 4500,  odemeYontemi: 'banka', aciklama: 'SRC 2 kurs ücreti',                belgeNo: 'GLR-2025-0311', ogrenciAd: 'Cemil Arslan' },
  // Psikoteknik
  { id: 12, subeId: 13, kategori: 'kurs_ucreti',   tarih: '2025-03-06', tutar: 1200,  odemeYontemi: 'nakit', aciklama: 'Psikoteknik test ücreti',           belgeNo: 'GLR-2025-0312', ogrenciAd: 'Kemal Aydın' },
  { id: 13, subeId: 13, kategori: 'sinav_ucreti',  tarih: '2025-03-19', tutar: 1200,  odemeYontemi: 'kk',    aciklama: 'Psikoteknik test ücreti',           belgeNo: 'GLR-2025-0313', ogrenciAd: 'Selin Kara' },
  // TMGD
  { id: 14, subeId: 16, kategori: 'kurs_ucreti',   tarih: '2025-03-11', tutar: 6000,  odemeYontemi: 'banka', aciklama: 'TMGD Temel kurs ücreti',            belgeNo: 'GLR-2025-0314', ogrenciAd: 'Serkan Koç' },
  // Kira geliri
  { id: 16, subeId: 1,  kategori: 'kira_geliri',   tarih: '2025-03-01', tutar: 5500,  odemeYontemi: 'banka', aciklama: 'Şube derslik kiralama geliri',     belgeNo: 'GLR-2025-0316', ogrenciAd: '' },
];

const BOS_FORM = {
  subeId: '', kategori: 'kurs_ucreti', odemeYontemi: 'nakit',
  tarih: new Date().toISOString().split('T')[0],
  tutar: '', aciklama: '', belgeNo: '', ogrenciAd: '',
};

// ─── Yardımcı Bileşenler ───────────────────────────────────
function OdemeYontemiRozetleri({ yontem, buyuk }) {
  const o = ODEME_MAP[yontem];
  if (!o) return null;
  const p = buyuk ? '5px 14px' : '3px 9px';
  const fs = buyuk ? '12px' : '11px';
  return (
    <span style={{ background: o.bg, color: o.renk, border: `1px solid ${o.renk}44`,
      padding: p, borderRadius: '12px', fontSize: fs, fontWeight: '700', whiteSpace: 'nowrap' }}>
      {o.ikon} {o.label}
    </span>
  );
}

function KategoriRozet({ kategori }) {
  const k = KAT_MAP[kategori];
  if (!k) return null;
  return (
    <span style={{ background: k.renk + '18', color: k.renk, border: `1px solid ${k.renk}33`,
      padding: '3px 9px', borderRadius: '10px', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap' }}>
      {k.ikon} {k.label}
    </span>
  );
}

// ─── ANA SAYFA ─────────────────────────────────────────────
export default function GelirlerPage() {
  const [gelirler, setGelirler] = useState(BASLANGIC_GELIRLER);
  const [aktifTab, setAktifTab]     = useState('liste');
  const [aramaMetni, setArama]      = useState('');
  const [katFiltre, setKatFiltre]   = useState('tumu');
  const [subeFiltre, setSubeFiltre] = useState('tumu');
  const [odemeFiltre, setOdemeFiltre] = useState('tumu');

  const [yeniModal, setYeniModal]   = useState(false);
  const [duzenleModal, setDuzenle]  = useState(null);
  const [detayModal, setDetay]      = useState(null);
  const [silOnay, setSilOnay]       = useState(null);
  const [form, setForm]             = useState(BOS_FORM);

  // ── Filtreleme ──
  const filtrelenenler = useMemo(() => gelirler.filter(g => {
    const katEsles   = katFiltre   === 'tumu' || g.kategori     === katFiltre;
    const subeEsles  = subeFiltre  === 'tumu' || g.subeId       === parseInt(subeFiltre);
    const odemeEsles = odemeFiltre === 'tumu' || g.odemeYontemi === odemeFiltre;
    const aramaEsles = aramaMetni  === '' ||
      (g.aciklama||'').toLowerCase().includes(aramaMetni.toLowerCase()) ||
      (g.belgeNo ||'').toLowerCase().includes(aramaMetni.toLowerCase()) ||
      (g.ogrenciAd||'').toLowerCase().includes(aramaMetni.toLowerCase());
    return katEsles && subeEsles && odemeEsles && aramaEsles;
  }), [gelirler, katFiltre, subeFiltre, odemeFiltre, aramaMetni]);

  // ── Özet hesaplar ──
  const toplamTutar  = gelirler.reduce((s, g) => s + g.tutar, 0);
  const nakitToplam  = gelirler.filter(g => g.odemeYontemi === 'nakit').reduce((s, g) => s + g.tutar, 0);
  const kkToplam     = gelirler.filter(g => g.odemeYontemi === 'kk').reduce((s, g) => s + g.tutar, 0);
  const bankaToplam  = gelirler.filter(g => g.odemeYontemi === 'banka').reduce((s, g) => s + g.tutar, 0);

  // Şube bazlı toplamlar
  const subeToplam = useMemo(() => {
    const map = {};
    gelirler.forEach(g => {
      map[g.subeId] = (map[g.subeId] || 0) + g.tutar;
    });
    return map;
  }, [gelirler]);

  // Kategori bazlı toplamlar
  const katToplam = useMemo(() => {
    const map = {};
    gelirler.forEach(g => {
      map[g.kategori] = (map[g.kategori] || 0) + g.tutar;
    });
    return map;
  }, [gelirler]);

  // Ay bazlı toplamlar (bu ay / geçen ay)
  const buAy = new Date().getMonth();
  const buAyToplam   = gelirler.filter(g => new Date(g.tarih).getMonth() === buAy).reduce((s, g) => s + g.tutar, 0);
  const gecenAyToplam= gelirler.filter(g => new Date(g.tarih).getMonth() === (buAy - 1 + 12) % 12).reduce((s, g) => s + g.tutar, 0);
  const ayDegisim    = gecenAyToplam > 0 ? Math.round(((buAyToplam - gecenAyToplam) / gecenAyToplam) * 100) : 0;

  // ── CRUD ──
  const kaydet = () => {
    if (!form.subeId || !form.tutar || !form.tarih) {
      alert('Şube, tutar ve tarih zorunludur!'); return;
    }
    const obj = { ...form, subeId: parseInt(form.subeId), tutar: parseInt(form.tutar) };
    if (duzenleModal) {
      setGelirler(prev => prev.map(g => g.id === duzenleModal.id ? { ...duzenleModal, ...obj } : g));
      setDuzenle(null);
    } else {
      setGelirler(prev => [{ ...obj, id: Date.now() }, ...prev]);
      setYeniModal(false);
    }
    setForm(BOS_FORM);
  };

  const sil = (id) => { setGelirler(prev => prev.filter(g => g.id !== id)); setSilOnay(null); setDetay(null); };

  const acDuzenle = (g) => {
    setForm({ ...g, subeId: g.subeId.toString(), tutar: g.tutar.toString() });
    setDuzenle(g);
  };

  const F = ({ label, name, tip = 'text', options }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151' }}>{label}</label>
      {options ? (
        <select style={{ padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'white' }}
          value={form[name] || ''} onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))}>
          <option value="">Seçin...</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input type={tip} style={{ padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
          value={form[name] || ''} onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))} placeholder={label} />
      )}
    </div>
  );

  return (
    <div>
      <div className="sayfa-baslik">
        <h1>💚 Gelir Takibi</h1>
        <p>Tüm şubelerin gelirlerini şube bazında takip edin — Nakit, Kredi Kartı, Banka</p>
      </div>

      {/* ── Özet Kartlar ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {[
          { ikon: '💚', label: 'Toplam Gelir',     deger: `₺${toplamTutar.toLocaleString('tr-TR')}`,   bg: '#DCFCE7', renk: '#15803D' },
          { ikon: '💵', label: 'Nakit',             deger: `₺${nakitToplam.toLocaleString('tr-TR')}`,   bg: '#F0FDF4', renk: '#16A34A' },
          { ikon: '💳', label: 'Kredi Kartı',       deger: `₺${kkToplam.toLocaleString('tr-TR')}`,      bg: '#DBEAFE', renk: '#1D4ED8' },
          { ikon: '🏦', label: 'Banka Transferi',   deger: `₺${bankaToplam.toLocaleString('tr-TR')}`,   bg: '#EDE9FE', renk: '#6D28D9' },
          { ikon: '📅', label: 'Bu Ay',             deger: `₺${buAyToplam.toLocaleString('tr-TR')}`,    bg: '#FEF9C3', renk: '#B45309' },
          { ikon: ayDegisim >= 0 ? '📈' : '📉', label: 'Geçen Aya Göre',
            deger: `${ayDegisim >= 0 ? '+' : ''}%${ayDegisim}`,
            bg: ayDegisim >= 0 ? '#DCFCE7' : '#FEE2E2', renk: ayDegisim >= 0 ? '#15803D' : '#DC2626' },
          { ikon: '🏢', label: 'Aktif Şube',        deger: Object.keys(subeToplam).length,               bg: '#F1F5F9', renk: '#475569' },
          { ikon: '📋', label: 'Kayıt Sayısı',      deger: gelirler.length,                               bg: '#F1F5F9', renk: '#475569' },
        ].map(k => (
          <div key={k.label} className="ozet-kart">
            <div className="kart-ikon" style={{ background: k.bg }}>{k.ikon}</div>
            <div className="kart-bilgi">
              <h3 style={{ color: k.renk, fontSize: '15px' }}>{k.deger}</h3>
              <p>{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tab Bar ── */}
      <div className="tab-bar">
        {[
          { id: 'liste',    label: '📋 Gelir Listesi' },
          { id: 'sube',     label: '🏢 Şube Bazlı' },
          { id: 'odeme',    label: '💳 Ödeme Yöntemi' },
          { id: 'kategori', label: '📊 Kategori' },
        ].map(t => (
          <div key={t.id} className={`tab-item ${aktifTab === t.id ? 'aktif' : ''}`} onClick={() => setAktifTab(t.id)}>
            {t.label}
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════ */}
      {/* GELİR LİSTESİ TAB                                */}
      {/* ══════════════════════════════════════════════════ */}
      {aktifTab === 'liste' && (
        <>
          {/* Filtre Bar */}
          <div className="filtre-bar">
            <input className="arama-input" placeholder="🔍 Açıklama, öğrenci adı, belge no..."
              value={aramaMetni} onChange={e => setArama(e.target.value)} />
            <select style={{ padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', outline: 'none', background: 'white' }}
              value={subeFiltre} onChange={e => setSubeFiltre(e.target.value)}>
              <option value="tumu">Tüm Şubeler</option>
              {SUBELER.map(s => {
                const sir = SIRKETLER.find(sr => sr.id === s.sirketId);
                return <option key={s.id} value={s.id}>{sir?.ikon} {s.ilce}</option>;
              })}
            </select>
            <select style={{ padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', outline: 'none', background: 'white' }}
              value={katFiltre} onChange={e => setKatFiltre(e.target.value)}>
              <option value="tumu">Tüm Kategoriler</option>
              {GELIR_KATEGORILER.map(k => <option key={k.id} value={k.id}>{k.ikon} {k.label}</option>)}
            </select>
            <select style={{ padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', outline: 'none', background: 'white' }}
              value={odemeFiltre} onChange={e => setOdemeFiltre(e.target.value)}>
              <option value="tumu">Tüm Ödeme Yöntemleri</option>
              {ODEME_YONTEMLERI.map(o => <option key={o.id} value={o.id}>{o.ikon} {o.label}</option>)}
            </select>
            <button className="btn btn-primary" onClick={() => { setForm(BOS_FORM); setYeniModal(true); }}>+ Gelir Ekle</button>
          </div>

          <div className="panel">
            <div className="panel-baslik">
              <h3>💚 Gelir Kayıtları</h3>
              <span style={{ fontSize: '13px', color: '#64748B' }}>{filtrelenenler.length} kayıt · ₺{filtrelenenler.reduce((s,g)=>s+g.tutar,0).toLocaleString('tr-TR')}</span>
            </div>
            <div className="tablo-container">
              <table>
                <thead>
                  <tr>
                    <th>Tarih</th>
                    <th>Şube</th>
                    <th>Açıklama / Öğrenci</th>
                    <th>Kategori</th>
                    <th>Ödeme</th>
                    <th>Belge No</th>
                    <th>Tutar</th>
                    <th>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrelenenler.length === 0 && (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>Kayıt bulunamadı.</td></tr>
                  )}
                  {filtrelenenler.map(g => {
                    const sube   = SUBELER.find(s => s.id === g.subeId);
                    const sirket = SIRKETLER.find(s => s.id === sube?.sirketId);
                    return (
                      <tr key={g.id}>
                        <td style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>📅 {g.tarih}</td>
                        <td>
                          <div style={{ fontWeight: '600', fontSize: '13px' }}>{sirket?.ikon} {sube?.ilce}</div>
                          <div style={{ fontSize: '11px', color: '#94A3B8' }}>{sirket?.ad?.split(' ')[0]}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: '13px', fontWeight: '500' }}>{g.aciklama}</div>
                          {g.ogrenciAd && <div style={{ fontSize: '11px', color: '#3B82F6', marginTop: '2px' }}>👤 {g.ogrenciAd}</div>}
                        </td>
                        <td><KategoriRozet kategori={g.kategori} /></td>
                        <td><OdemeYontemiRozetleri yontem={g.odemeYontemi} /></td>
                        <td style={{ fontSize: '12px', color: '#64748B' }}>{g.belgeNo || '—'}</td>
                        <td>
                          <span style={{ fontWeight: '800', fontSize: '15px', color: '#15803D' }}>
                            ₺{g.tutar.toLocaleString('tr-TR')}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button className="btn btn-secondary btn-sm" title="Detay" onClick={() => setDetay(g)}>👁</button>
                            <button className="btn btn-secondary btn-sm" title="Düzenle" onClick={() => acDuzenle(g)}>✏️</button>
                            <button className="btn btn-danger btn-sm" title="Sil" onClick={() => setSilOnay(g)}>🗑️</button>
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

      {/* ══════════════════════════════════════════════════ */}
      {/* ŞUBE BAZLI TAB                                   */}
      {/* ══════════════════════════════════════════════════ */}
      {aktifTab === 'sube' && (
        <div>
          {SIRKETLER.map(sirket => {
            const sirketSubeleri = SUBELER.filter(s => s.sirketId === sirket.id);
            const sirketToplamGelir = sirketSubeleri.reduce((s, sb) => s + (subeToplam[sb.id] || 0), 0);
            if (sirketToplamGelir === 0 && sirketSubeleri.every(sb => !subeToplam[sb.id])) return null;
            return (
              <div key={sirket.id} className="panel" style={{ marginBottom: '16px' }}>
                {/* Şirket Başlığı */}
                <div style={{ background: `linear-gradient(135deg, ${sirket.renk}22, ${sirket.renk}11)`, border: `2px solid ${sirket.renk}44`, borderRadius: '12px', padding: '14px 18px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>{sirket.ikon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '800', color: sirket.renk, fontSize: '15px' }}>{sirket.ad}</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>{sirketSubeleri.length} şube</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '900', fontSize: '18px', color: sirket.renk }}>₺{sirketToplamGelir.toLocaleString('tr-TR')}</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>Toplam Gelir</div>
                  </div>
                </div>

                {/* Şubeler */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                  {sirketSubeleri.map(sube => {
                    const subeGelir   = subeToplam[sube.id] || 0;
                    const subeKayitlar = gelirler.filter(g => g.subeId === sube.id);
                    const subeNakit   = subeKayitlar.filter(g => g.odemeYontemi === 'nakit').reduce((s, g) => s + g.tutar, 0);
                    const subeKK      = subeKayitlar.filter(g => g.odemeYontemi === 'kk').reduce((s, g) => s + g.tutar, 0);
                    const subeBanka   = subeKayitlar.filter(g => g.odemeYontemi === 'banka').reduce((s, g) => s + g.tutar, 0);
                    const oran        = sirketToplamGelir > 0 ? Math.round((subeGelir / sirketToplamGelir) * 100) : 0;

                    return (
                      <div key={sube.id} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '14px', color: '#1E293B' }}>{sube.ilce}</div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>{sube.sehir} · {subeKayitlar.length} kayıt</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: '800', fontSize: '16px', color: '#15803D' }}>₺{subeGelir.toLocaleString('tr-TR')}</div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>%{oran} payı</div>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px' }}>
                          <div style={{ height: '100%', width: `${oran}%`, background: sirket.renk, borderRadius: '10px', transition: 'width 0.4s' }} />
                        </div>

                        {/* Ödeme yöntemi kırılımı */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                          {[
                            { ikon: '💵', label: 'Nakit',  tutar: subeNakit,  bg: '#F0FDF4', renk: '#16A34A' },
                            { ikon: '💳', label: 'KK',     tutar: subeKK,     bg: '#DBEAFE', renk: '#1D4ED8' },
                            { ikon: '🏦', label: 'Banka',  tutar: subeBanka,  bg: '#EDE9FE', renk: '#6D28D9' },
                          ].map(p => (
                            <div key={p.label} style={{ background: p.tutar > 0 ? p.bg : '#F1F5F9', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                              <div style={{ fontSize: '14px' }}>{p.ikon}</div>
                              <div style={{ fontSize: '12px', fontWeight: '700', color: p.tutar > 0 ? p.renk : '#CBD5E1' }}>
                                {p.tutar > 0 ? `₺${(p.tutar / 1000).toFixed(1)}K` : '—'}
                              </div>
                              <div style={{ fontSize: '10px', color: '#94A3B8' }}>{p.label}</div>
                            </div>
                          ))}
                        </div>

                        <button className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: '10px', fontSize: '12px' }}
                          onClick={() => { setSubeFiltre(sube.id.toString()); setAktifTab('liste'); }}>
                          📋 Gelir Listesini Gör
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════════ */}
      {/* ÖDEME YÖNTEMİ TAB                               */}
      {/* ══════════════════════════════════════════════════ */}
      {aktifTab === 'odeme' && (
        <div>
          {/* Özet Kartlar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '20px' }}>
            {ODEME_YONTEMLERI.map(o => {
              const kayitlar = gelirler.filter(g => g.odemeYontemi === o.id);
              const toplam   = kayitlar.reduce((s, g) => s + g.tutar, 0);
              const oran     = toplamTutar > 0 ? Math.round((toplam / toplamTutar) * 100) : 0;
              return (
                <div key={o.id} style={{ background: o.bg, border: `2px solid ${o.renk}44`, borderRadius: '14px', padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '36px', marginBottom: '8px' }}>{o.ikon}</div>
                  <div style={{ fontWeight: '900', fontSize: '24px', color: o.renk }}>₺{toplam.toLocaleString('tr-TR')}</div>
                  <div style={{ fontWeight: '700', color: o.renk, marginTop: '4px', fontSize: '14px' }}>{o.label}</div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>{kayitlar.length} işlem · %{oran}</div>
                  <div style={{ height: '8px', background: 'rgba(0,0,0,0.08)', borderRadius: '20px', overflow: 'hidden', marginTop: '10px' }}>
                    <div style={{ height: '100%', width: `${oran}%`, background: o.renk, borderRadius: '20px' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Şube x Ödeme Yöntemi Tablosu */}
          <div className="panel">
            <div className="panel-baslik"><h3>🏢 Şube × Ödeme Yöntemi Dağılımı</h3></div>
            <div className="tablo-container">
              <table>
                <thead>
                  <tr>
                    <th>Şube</th>
                    <th>Şirket</th>
                    <th>💵 Nakit</th>
                    <th>💳 Kredi Kartı</th>
                    <th>🏦 Banka</th>
                    <th>Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  {SUBELER.filter(s => gelirler.some(g => g.subeId === s.id)).map(sube => {
                    const sirket  = SIRKETLER.find(sr => sr.id === sube.sirketId);
                    const kayitlar= gelirler.filter(g => g.subeId === sube.id);
                    const nakit   = kayitlar.filter(g => g.odemeYontemi === 'nakit').reduce((s, g) => s + g.tutar, 0);
                    const kk      = kayitlar.filter(g => g.odemeYontemi === 'kk').reduce((s, g) => s + g.tutar, 0);
                    const banka   = kayitlar.filter(g => g.odemeYontemi === 'banka').reduce((s, g) => s + g.tutar, 0);
                    const toplam  = nakit + kk + banka;
                    return (
                      <tr key={sube.id}>
                        <td style={{ fontWeight: '600' }}>{sube.ilce}</td>
                        <td style={{ fontSize: '12px' }}>{sirket?.ikon} {sirket?.ad?.split(' ')[0]}</td>
                        <td style={{ color: '#16A34A', fontWeight: '700' }}>{nakit > 0 ? `₺${nakit.toLocaleString('tr-TR')}` : '—'}</td>
                        <td style={{ color: '#1D4ED8', fontWeight: '700' }}>{kk    > 0 ? `₺${kk.toLocaleString('tr-TR')}`    : '—'}</td>
                        <td style={{ color: '#6D28D9', fontWeight: '700' }}>{banka > 0 ? `₺${banka.toLocaleString('tr-TR')}` : '—'}</td>
                        <td style={{ fontWeight: '800', fontSize: '14px', color: '#15803D' }}>₺{toplam.toLocaleString('tr-TR')}</td>
                      </tr>
                    );
                  })}
                  <tr style={{ background: '#F0FDF4', fontWeight: '800' }}>
                    <td colSpan={2} style={{ fontWeight: '800' }}>TOPLAM</td>
                    <td style={{ color: '#16A34A', fontWeight: '800' }}>₺{nakitToplam.toLocaleString('tr-TR')}</td>
                    <td style={{ color: '#1D4ED8', fontWeight: '800' }}>₺{kkToplam.toLocaleString('tr-TR')}</td>
                    <td style={{ color: '#6D28D9', fontWeight: '800' }}>₺{bankaToplam.toLocaleString('tr-TR')}</td>
                    <td style={{ color: '#15803D', fontWeight: '800', fontSize: '15px' }}>₺{toplamTutar.toLocaleString('tr-TR')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════ */}
      {/* KATEGORİ TAB                                     */}
      {/* ══════════════════════════════════════════════════ */}
      {aktifTab === 'kategori' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            {GELIR_KATEGORILER.map(k => {
              const toplam   = katToplam[k.id] || 0;
              const kayitSay = gelirler.filter(g => g.kategori === k.id).length;
              const oran     = toplamTutar > 0 ? Math.round((toplam / toplamTutar) * 100) : 0;
              return (
                <div key={k.id} style={{ background: k.renk + '12', border: `1.5px solid ${k.renk}33`, borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '24px' }}>{k.ikon}</span>
                    <div>
                      <div style={{ fontWeight: '700', color: '#1E293B', fontSize: '13px' }}>{k.label}</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>{kayitSay} kayıt</div>
                    </div>
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                      <div style={{ fontWeight: '800', color: k.renk, fontSize: '16px' }}>₺{toplam.toLocaleString('tr-TR')}</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>%{oran}</div>
                    </div>
                  </div>
                  <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${oran}%`, background: k.renk, borderRadius: '10px' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Kategori detay tablosu */}
          <div className="panel">
            <div className="panel-baslik"><h3>📊 Kategori Detayı</h3></div>
            <div className="tablo-container">
              <table>
                <thead>
                  <tr>
                    <th>Kategori</th>
                    <th>Kayıt Sayısı</th>
                    <th>💵 Nakit</th>
                    <th>💳 KK</th>
                    <th>🏦 Banka</th>
                    <th>Toplam</th>
                    <th>Pay</th>
                  </tr>
                </thead>
                <tbody>
                  {GELIR_KATEGORILER.filter(k => (katToplam[k.id] || 0) > 0).map(k => {
                    const kayitlar = gelirler.filter(g => g.kategori === k.id);
                    const nakit    = kayitlar.filter(g => g.odemeYontemi === 'nakit').reduce((s, g) => s + g.tutar, 0);
                    const kk       = kayitlar.filter(g => g.odemeYontemi === 'kk').reduce((s, g) => s + g.tutar, 0);
                    const banka    = kayitlar.filter(g => g.odemeYontemi === 'banka').reduce((s, g) => s + g.tutar, 0);
                    const toplam   = katToplam[k.id] || 0;
                    const oran     = toplamTutar > 0 ? Math.round((toplam / toplamTutar) * 100) : 0;
                    return (
                      <tr key={k.id}>
                        <td><KategoriRozet kategori={k.id} /></td>
                        <td style={{ fontSize: '13px', fontWeight: '600' }}>{kayitlar.length}</td>
                        <td style={{ color: '#16A34A', fontWeight: '700' }}>{nakit > 0 ? `₺${nakit.toLocaleString('tr-TR')}` : '—'}</td>
                        <td style={{ color: '#1D4ED8', fontWeight: '700' }}>{kk    > 0 ? `₺${kk.toLocaleString('tr-TR')}`    : '—'}</td>
                        <td style={{ color: '#6D28D9', fontWeight: '700' }}>{banka > 0 ? `₺${banka.toLocaleString('tr-TR')}` : '—'}</td>
                        <td style={{ fontWeight: '800', color: '#15803D', fontSize: '14px' }}>₺{toplam.toLocaleString('tr-TR')}</td>
                        <td>
                          <span style={{ background: k.renk + '18', color: k.renk, padding: '3px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: '700' }}>%{oran}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════ */}
      {/* YENİ / DÜZENLE MODAL                             */}
      {/* ══════════════════════════════════════════════════ */}
      <Modal acik={yeniModal || !!duzenleModal}
        kapat={() => { setYeniModal(false); setDuzenle(null); setForm(BOS_FORM); }}
        baslik={duzenleModal ? '✏️ Gelir Düzenle' : '💚 Yeni Gelir Ekle'} genislik="640px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Şube seçimi */}
          <F label="🏢 Şube *" name="subeId" options={
            SUBELER.map(s => {
              const sir = SIRKETLER.find(sr => sr.id === s.sirketId);
              return { value: s.id, label: `${sir?.ikon || ''} ${s.ilce} — ${sir?.ad?.split(' ')[0] || ''}` };
            })
          } />

          {/* Kategori */}
          <F label="📋 Kategori *" name="kategori" options={
            GELIR_KATEGORILER.map(k => ({ value: k.id, label: `${k.ikon} ${k.label}` }))
          } />

          {/* Ödeme Yöntemi — Büyük Butonlar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151' }}>💳 Ödeme Yöntemi *</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {ODEME_YONTEMLERI.map(o => (
                <button key={o.id} type="button"
                  onClick={() => setForm(p => ({ ...p, odemeYontemi: o.id }))}
                  style={{
                    padding: '14px 8px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center',
                    border: `2px solid ${form.odemeYontemi === o.id ? o.renk : '#E2E8F0'}`,
                    background: form.odemeYontemi === o.id ? o.bg : 'white',
                    transform: form.odemeYontemi === o.id ? 'scale(1.02)' : 'scale(1)',
                    transition: 'all 0.15s',
                  }}>
                  <div style={{ fontSize: '22px' }}>{o.ikon}</div>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: form.odemeYontemi === o.id ? o.renk : '#94A3B8', marginTop: '4px' }}>{o.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Tutar + Tarih */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151' }}>₺ Tutar *</label>
              <input type="number" min="0"
                style={{ padding: '12px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '20px', fontWeight: '700', textAlign: 'center', outline: 'none',
                  background: form.tutar ? '#F0FDF4' : 'white', color: form.tutar ? '#15803D' : '#1E293B', borderColor: form.tutar ? '#86EFAC' : '#E2E8F0' }}
                placeholder="0" value={form.tutar}
                onChange={e => setForm(p => ({ ...p, tutar: e.target.value }))} />
              {/* Hızlı tutar butonları */}
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {[500, 1000, 1200, 2000, 4500, 5000, 8500, 9000].map(t => (
                  <button key={t} type="button"
                    onClick={() => setForm(p => ({ ...p, tutar: t.toString() }))}
                    style={{ padding: '4px 8px', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                    ₺{t.toLocaleString('tr-TR')}
                  </button>
                ))}
              </div>
            </div>
            <F label="📅 Tarih *" name="tarih" tip="date" />
          </div>

          {/* Açıklama + Öğrenci */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <F label="📝 Açıklama *"    name="aciklama" />
            <F label="👤 Öğrenci Adı"  name="ogrenciAd" />
          </div>

          <F label="🧾 Belge / Makbuz No" name="belgeNo" />

          {/* Önizleme */}
          {form.tutar && form.subeId && (
            <div style={{ background: 'linear-gradient(135deg,#F0FDF4,#DCFCE7)', border: '2px solid #86EFAC', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>💚</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '13px', color: '#15803D' }}>
                  {SUBELER.find(s => s.id === parseInt(form.subeId))?.ilce} · {KAT_MAP[form.kategori]?.ikon} {KAT_MAP[form.kategori]?.label}
                </div>
                <div style={{ fontSize: '11px', color: '#16A34A', marginTop: '2px' }}>
                  {ODEME_MAP[form.odemeYontemi]?.ikon} {ODEME_MAP[form.odemeYontemi]?.label} · {form.tarih}
                </div>
              </div>
              <div style={{ fontWeight: '900', fontSize: '20px', color: '#15803D' }}>
                ₺{parseInt(form.tutar || 0).toLocaleString('tr-TR')}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '20px', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => { setYeniModal(false); setDuzenle(null); setForm(BOS_FORM); }}>İptal</button>
          <button className="btn btn-primary" style={{ background: 'linear-gradient(135deg,#10B981,#059669)', borderColor: '#059669' }}
            onClick={kaydet}>{duzenleModal ? '💾 Güncelle' : '✅ Kaydet'}</button>
        </div>
      </Modal>

      {/* ══════════════════════════════════════════════════ */}
      {/* DETAY MODAL                                      */}
      {/* ══════════════════════════════════════════════════ */}
      <Modal acik={!!detayModal} kapat={() => setDetay(null)} baslik="💚 Gelir Detayı" genislik="480px">
        {detayModal && (() => {
          const sube   = SUBELER.find(s => s.id === detayModal.subeId);
          const sirket = SIRKETLER.find(s => s.id === sube?.sirketId);
          const k      = KAT_MAP[detayModal.kategori];
          const o      = ODEME_MAP[detayModal.odemeYontemi];
          return (
            <div>
              <div style={{ background: 'linear-gradient(135deg,#F0FDF4,#DCFCE7)', border: '2px solid #86EFAC', borderRadius: '12px', padding: '20px', textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '40px', fontWeight: '900', color: '#15803D' }}>₺{detayModal.tutar.toLocaleString('tr-TR')}</div>
                <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <KategoriRozet kategori={detayModal.kategori} />
                  <OdemeYontemiRozetleri yontem={detayModal.odemeYontemi} buyuk />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { etiket: 'Şube',       deger: `${sirket?.ikon} ${sube?.ilce}` },
                  { etiket: 'Şirket',     deger: sirket?.ad?.split(' ')[0] },
                  { etiket: 'Tarih',      deger: `📅 ${detayModal.tarih}` },
                  { etiket: 'Belge No',   deger: detayModal.belgeNo || '—' },
                  { etiket: 'Açıklama',   deger: detayModal.aciklama },
                  { etiket: 'Öğrenci',    deger: detayModal.ogrenciAd || '—' },
                ].map(r => (
                  <div key={r.etiket} style={{ background: '#F8FAFC', borderRadius: '8px', padding: '10px 12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '10px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>{r.etiket}</div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#1E293B' }}>{r.deger}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setDetay(null); acDuzenle(detayModal); }}>✏️ Düzenle</button>
                <button className="btn btn-danger" onClick={() => setSilOnay(detayModal)}>🗑️ Sil</button>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setDetay(null)}>Kapat</button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* ══════════════════════════════════════════════════ */}
      {/* SİL ONAY MODAL                                   */}
      {/* ══════════════════════════════════════════════════ */}
      <Modal acik={!!silOnay} kapat={() => setSilOnay(null)} baslik="🗑️ Gelir Kaydını Sil" genislik="380px">
        {silOnay && (
          <div>
            <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
              <div style={{ fontSize: '52px', marginBottom: '12px' }}>⚠️</div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                <b>₺{silOnay.tutar.toLocaleString('tr-TR')}</b> tutarındaki gelir kaydını silmek istiyor musunuz?
              </p>
              <p style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>{silOnay.aciklama}</p>
              <p style={{ fontSize: '13px', color: '#EF4444', marginTop: '8px' }}>Bu işlem geri alınamaz!</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSilOnay(null)}>Vazgeç</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => sil(silOnay.id)}>🗑️ Evet, Sil</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
