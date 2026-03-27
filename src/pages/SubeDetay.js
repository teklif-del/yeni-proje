import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  dbSubeler, dbSirketler, dbOgrenciler, dbPersonel,
  dbAraclar, dbGelirler, dbGiderler,
} from '../lib/db';
import Modal from '../components/Modal';

// ─── SABİTLER ────────────────────────────────────────────────

const GELIR_KATEGORILER = [
  { id: 'kurs_ucreti',  label: 'Kurs Ücreti',   ikon: '📚', renk: '#3B82F6' },
  { id: 'sinav_ucreti', label: 'Sınav Ücreti',   ikon: '📝', renk: '#8B5CF6' },
  { id: 'kira_geliri',  label: 'Kira Geliri',    ikon: '🏢', renk: '#10B981' },
  { id: 'diger',        label: 'Diğer Gelir',    ikon: '💼', renk: '#64748B' },
];
const GELIR_KAT_MAP = Object.fromEntries(GELIR_KATEGORILER.map(k => [k.id, k]));

const ODEME_YONTEMLERI = [
  { id: 'nakit', label: 'Nakit',           ikon: '💵', renk: '#10B981', bg: '#DCFCE7' },
  { id: 'kk',   label: 'Kredi Kartı',     ikon: '💳', renk: '#3B82F6', bg: '#DBEAFE' },
  { id: 'banka',label: 'Banka Transferi', ikon: '🏦', renk: '#8B5CF6', bg: '#EDE9FE' },
];

const GIDER_KATEGORILER = [
  { id: 'sgk',       label: 'SGK Primi',      ikon: '🏛️',  renk: '#6366F1' },
  { id: 'vergi',     label: 'Vergi',           ikon: '📋',  renk: '#EF4444' },
  { id: 'fatura',    label: 'Fatura',          ikon: '⚡',  renk: '#F59E0B' },
  { id: 'kira',      label: 'Kira',            ikon: '🏠',  renk: '#8B5CF6' },
  { id: 'personel',  label: 'Personel Maaşı', ikon: '👥',  renk: '#10B981' },
  { id: 'arac',      label: 'Araç Gideri',    ikon: '🚗',  renk: '#06B6D4' },
  { id: 'malzeme',   label: 'Malzeme',        ikon: '📦',  renk: '#84CC16' },
  { id: 'bakim',     label: 'Bakım/Onarım',   ikon: '🔧',  renk: '#F97316' },
  { id: 'diger',     label: 'Diğer',          ikon: '💼',  renk: '#64748B' },
];
const GIDER_KAT_MAP = Object.fromEntries(GIDER_KATEGORILER.map(k => [k.id, k]));

const SINIF_TIPLERI = ['A', 'B', 'BE', 'C', 'CE', 'D', 'DE', 'F', 'G', 'H', 'K', 'M'];

const bugun = () => new Date().toISOString().split('T')[0];

const BOS_GELIR = { subeId: '', kategori: 'kurs_ucreti', odemeYontemi: 'nakit', tarih: bugun(), tutar: '', aciklama: '' };
const BOS_GIDER = { subeId: '', kategori: 'diger', tarih: bugun(), tutar: '', kdv: '', aciklama: '', belgeNo: '', durum: 'odendi' };
const BOS_PERSONEL = { subeId: '', ad: '', soyad: '', pozisyon: '', maas: '', telefon: '', iseGirisTarihi: bugun(), aktif: true };
const BOS_ARAC = { subeId: '', plaka: '', marka: '', model: '', yil: new Date().getFullYear(), sinif: 'B', km: '', sonBakim: bugun(), aktif: true };

// ─── YARDIMCI BİLEŞENLER ─────────────────────────────────────

function InfoKart({ ikon, label, deger, renk, bg }) {
  return (
    <div style={{
      background: bg || '#F8FAFC', borderRadius: '12px', padding: '16px',
      display: 'flex', alignItems: 'center', gap: '12px',
      border: `1px solid ${renk}33`,
    }}>
      <div style={{
        width: '44px', height: '44px', borderRadius: '12px',
        background: renk + '20', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '22px', flexShrink: 0,
      }}>{ikon}</div>
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

// Genel etiketli input (bileşen DIŞARIDA tanımlı → re-mount yok)
function Inp({ label, name, tip = 'text', form, setForm, placeholder, required }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>
        {label}{required && <span style={{ color: '#EF4444' }}> *</span>}
      </label>
      <input
        type={tip}
        style={{ padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'white' }}
        value={form[name] ?? ''}
        onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))}
        placeholder={placeholder || label}
      />
    </div>
  );
}

function Sel({ label, name, options, form, setForm }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>{label}</label>
      <select
        style={{ padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'white' }}
        value={form[name] ?? ''}
        onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))}
      >
        {options.map(o => (
          <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
        ))}
      </select>
    </div>
  );
}

// ─── ANA BİLEŞEN ─────────────────────────────────────────────
export default function SubeDetay({ subeId, navigate }) {
  const [aktifTab, setAktifTab] = useState('ozet');

  // — Temel veri —
  const [subeListe,   setSubeListe]   = useState([]);
  const [sirketler,   setSirketler]   = useState([]);
  const [ogrenciler,  setOgrenciler]  = useState([]);
  const [personel,    setPersonel]    = useState([]);
  const [araclar,     setAraclar]     = useState([]);
  const [gelirler,    setGelirler]    = useState([]);
  const [giderler,    setGiderler]    = useState([]);
  const [yukleniyor,  setYukleniyor]  = useState(true);

  // — Modallar —
  const [subeModal,     setSubeModal]     = useState(false);
  const [gelirModal,    setGelirModal]    = useState(false);
  const [giderModal,    setGiderModal]    = useState(false);
  const [personelModal, setPersonelModal] = useState(false);
  const [aracModal,     setAracModal]     = useState(false);
  const [silOnay,       setSilOnay]       = useState(null);  // { tip, id, ad }

  // — Formlar —
  const [subeForm,     setSubeForm]     = useState({});
  const [gelirForm,    setGelirForm]    = useState(BOS_GELIR);
  const [giderForm,    setGiderForm]    = useState(BOS_GIDER);
  const [personelForm, setPersonelForm] = useState(BOS_PERSONEL);
  const [aracForm,     setAracForm]     = useState(BOS_ARAC);

  // — Düzenleme id'leri —
  const [duzenGelir,    setDuzenGelir]    = useState(null);
  const [duzenGider,    setDuzenGider]    = useState(null);
  const [duzenPersonel, setDuzenPersonel] = useState(null);
  const [duzenArac,     setDuzenArac]     = useState(null);

  // — Kaydediyor bayrakları —
  const [kaydediyor, setKaydediyor] = useState(false);

  // ── Veri Yükle ──
  const yukle = useCallback(async () => {
    setYukleniyor(true);
    const [sub, sir, ogr, per, ara, gel, gid] = await Promise.all([
      dbSubeler.getAll(), dbSirketler.getAll(), dbOgrenciler.getAll(),
      dbPersonel.getAll(), dbAraclar.getAll(), dbGelirler.getAll(), dbGiderler.getAll(),
    ]);
    setSubeListe(sub); setSirketler(sir); setOgrenciler(ogr);
    setPersonel(per); setAraclar(ara); setGelirler(gel); setGiderler(gid);
    setYukleniyor(false);
  }, []);

  useEffect(() => { yukle(); }, [subeId, yukle]);

  // ── Şubeye özel filtreler ──
  const sube  = subeListe.find(s => s.id === subeId);
  const sirket = sube ? sirketler.find(s => s.id === (sube.sirket_id || sube.sirketId)) : null;

  const subeOgrenciler = useMemo(() => ogrenciler.filter(o => o.subeId === subeId), [ogrenciler, subeId]);
  const subePersonel   = useMemo(() => personel.filter(p => p.subeId === subeId),   [personel, subeId]);
  const subeAraclar    = useMemo(() => araclar.filter(a => a.subeId === subeId),     [araclar, subeId]);
  const subeGelirler   = useMemo(() => gelirler.filter(g => g.subeId === subeId),   [gelirler, subeId]);
  const subeGiderler   = useMemo(() => giderler.filter(g => g.subeId === subeId),   [giderler, subeId]);

  const toplamGelir   = subeGelirler.reduce((s, g) => s + (g.tutar || 0), 0);
  const toplamGider   = subeGiderler.reduce((s, g) => s + (g.tutar || 0) + (g.kdv || 0), 0);
  const netKar        = toplamGelir - toplamGider;
  const aktifOgrenci  = subeOgrenciler.filter(o => o.durum === 'devam_ediyor').length;
  const aktifPersonel = subePersonel.filter(p => p.aktif !== false).length;
  const kardesSubeler = subeListe.filter(s => {
    const sk = s.sirket_id || s.sirketId;
    const bk = sube ? (sube.sirket_id || sube.sirketId) : -1;
    return sk === bk && s.id !== subeId;
  });

  // ════════════════════════════════════════════════════════════
  //  GELİR CRUD
  // ════════════════════════════════════════════════════════════
  const gelirAc = (g) => {
    if (g) { setDuzenGelir(g.id); setGelirForm({ ...g }); }
    else   { setDuzenGelir(null); setGelirForm({ ...BOS_GELIR, subeId }); }
    setGelirModal(true);
  };

  const gelirKaydet = async () => {
    if (!gelirForm.tutar || Number(gelirForm.tutar) <= 0) return alert('Tutar giriniz.');
    setKaydediyor(true);
    const data = { ...gelirForm, subeId, tutar: Number(gelirForm.tutar) };
    if (duzenGelir) {
      const gunc = await dbGelirler.update(duzenGelir, data);
      if (gunc) setGelirler(prev => prev.map(g => g.id === duzenGelir ? gunc : g));
    } else {
      const yeni = await dbGelirler.insert(data);
      if (yeni) setGelirler(prev => [yeni, ...prev]);
    }
    setGelirModal(false);
    setKaydediyor(false);
  };

  const gelirSil = async (id) => {
    await dbGelirler.delete(id);
    setGelirler(prev => prev.filter(g => g.id !== id));
    setSilOnay(null);
  };

  // ════════════════════════════════════════════════════════════
  //  GİDER CRUD
  // ════════════════════════════════════════════════════════════
  const giderAc = (g) => {
    if (g) { setDuzenGider(g.id); setGiderForm({ ...g }); }
    else   { setDuzenGider(null); setGiderForm({ ...BOS_GIDER, subeId }); }
    setGiderModal(true);
  };

  const giderKaydet = async () => {
    if (!giderForm.tutar || Number(giderForm.tutar) <= 0) return alert('Tutar giriniz.');
    setKaydediyor(true);
    const data = { ...giderForm, subeId, tutar: Number(giderForm.tutar), kdv: Number(giderForm.kdv) || 0 };
    if (duzenGider) {
      const gunc = await dbGiderler.update(duzenGider, data);
      if (gunc) setGiderler(prev => prev.map(g => g.id === duzenGider ? gunc : g));
    } else {
      const yeni = await dbGiderler.insert(data);
      if (yeni) setGiderler(prev => [yeni, ...prev]);
    }
    setGiderModal(false);
    setKaydediyor(false);
  };

  const giderSil = async (id) => {
    await dbGiderler.delete(id);
    setGiderler(prev => prev.filter(g => g.id !== id));
    setSilOnay(null);
  };

  // ════════════════════════════════════════════════════════════
  //  PERSONEL CRUD
  // ════════════════════════════════════════════════════════════
  const personelAc = (p) => {
    if (p) { setDuzenPersonel(p.id); setPersonelForm({ ...p }); }
    else   { setDuzenPersonel(null); setPersonelForm({ ...BOS_PERSONEL, subeId }); }
    setPersonelModal(true);
  };

  const personelKaydet = async () => {
    if (!personelForm.ad || !personelForm.soyad) return alert('Ad Soyad zorunludur.');
    setKaydediyor(true);
    const data = { ...personelForm, subeId, maas: Number(personelForm.maas) || 0 };
    if (duzenPersonel) {
      const gunc = await dbPersonel.update(duzenPersonel, data);
      if (gunc) setPersonel(prev => prev.map(p => p.id === duzenPersonel ? gunc : p));
    } else {
      const yeni = await dbPersonel.insert(data);
      if (yeni) setPersonel(prev => [...prev, yeni]);
    }
    setPersonelModal(false);
    setKaydediyor(false);
  };

  const personelSil = async (id) => {
    await dbPersonel.delete(id);
    setPersonel(prev => prev.filter(p => p.id !== id));
    setSilOnay(null);
  };

  // ════════════════════════════════════════════════════════════
  //  ARAÇ CRUD
  // ════════════════════════════════════════════════════════════
  const aracAc = (a) => {
    if (a) { setDuzenArac(a.id); setAracForm({ ...a }); }
    else   { setDuzenArac(null); setAracForm({ ...BOS_ARAC, subeId }); }
    setAracModal(true);
  };

  const aracKaydet = async () => {
    if (!aracForm.plaka) return alert('Plaka zorunludur.');
    setKaydediyor(true);
    const data = { ...aracForm, subeId, km: Number(aracForm.km) || 0, yil: Number(aracForm.yil) || new Date().getFullYear() };
    if (duzenArac) {
      const gunc = await dbAraclar.update(duzenArac, data);
      if (gunc) setAraclar(prev => prev.map(a => a.id === duzenArac ? gunc : a));
    } else {
      const yeni = await dbAraclar.insert(data);
      if (yeni) setAraclar(prev => [...prev, yeni]);
    }
    setAracModal(false);
    setKaydediyor(false);
  };

  const aracSil = async (id) => {
    await dbAraclar.delete(id);
    setAraclar(prev => prev.filter(a => a.id !== id));
    setSilOnay(null);
  };

  // ════════════════════════════════════════════════════════════
  //  ŞUBE GÜNCELLE
  // ════════════════════════════════════════════════════════════
  const subeGuncelle = async () => {
    setKaydediyor(true);
    const gunc = await dbSubeler.update(subeId, {
      ad: subeForm.ad, telefon: subeForm.telefon,
      sehir: subeForm.sehir, ilce: subeForm.ilce,
      adres: subeForm.adres, aktif: subeForm.aktif,
    });
    if (gunc) {
      setSubeListe(prev => prev.map(s => s.id === subeId ? { ...s, ...subeForm } : s));
    }
    setSubeModal(false);
    setKaydediyor(false);
  };

  // ════════════════════════════════════════════════════════════
  //  RENDER
  // ════════════════════════════════════════════════════════════
  if (yukleniyor) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', flexDirection:'column', gap:'16px' }}>
        <div style={{ fontSize:'48px' }}>⏳</div>
        <div style={{ fontSize:'16px', color:'#64748B', fontWeight:'600' }}>Yükleniyor...</div>
      </div>
    );
  }

  if (!sube || !sirket) {
    return (
      <div style={{ padding:'40px', textAlign:'center', color:'#64748B' }}>
        <div style={{ fontSize:'48px', marginBottom:'16px' }}>🔍</div>
        <div style={{ fontSize:'16px', fontWeight:'600' }}>Şube bulunamadı.</div>
        <button className="btn btn-primary" style={{ marginTop:'16px' }} onClick={() => navigate('subeler')}>
          ← Şubelere Dön
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'ozet',       label: '📋 Özet' },
    { id: 'gelirler',   label: `💰 Gelirler (${subeGelirler.length})` },
    { id: 'giderler',   label: `📤 Giderler (${subeGiderler.length})` },
    { id: 'personel',   label: `👥 Personel (${subePersonel.length})` },
    { id: 'araclar',    label: `🚗 Araçlar (${subeAraclar.length})` },
    { id: 'ogrenciler', label: `👨‍🎓 Öğrenciler (${subeOgrenciler.length})` },
    { id: 'kardessube', label: `🏢 Diğer Şubeler (${kardesSubeler.length})` },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px', fontSize:'13px', color:'#64748B' }}>
        <span style={{ cursor:'pointer', color:'#3B82F6', fontWeight:'600' }}
          onClick={() => navigate('subeler', { sirketId: sube.sirket_id || sube.sirketId })}>
          {sirket.ikon} {sirket.ad}
        </span>
        <span>›</span>
        <span style={{ color:'#1E293B', fontWeight:'700' }}>{sube.ad}</span>
      </div>

      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg,#0F2140 0%,${sirket.renk || '#3B82F6'}33 100%)`,
        borderRadius:'16px', padding:'24px', marginBottom:'20px',
        border:`1px solid ${sirket.renk || '#3B82F6'}44`, position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute', right:'-20px', top:'-20px', fontSize:'120px', opacity:0.06, userSelect:'none' }}>
          {sirket.ikon}
        </div>
        <div style={{ display:'flex', alignItems:'flex-start', gap:'18px', position:'relative' }}>
          <div style={{
            width:'60px', height:'60px', borderRadius:'14px',
            background:(sirket.renk || '#3B82F6')+'30', border:`2px solid ${sirket.renk || '#3B82F6'}`,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:'30px', flexShrink:0,
          }}>{sirket.ikon}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:'22px', fontWeight:'800', color:'white', marginBottom:'4px' }}>{sube.ad}</div>
            <div style={{ fontSize:'13px', color:'#94A3B8', marginBottom:'6px' }}>
              📍 {sube.adres} — {sube.ilce}, {sube.sehir}
            </div>
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', alignItems:'center' }}>
              <span style={{ background:(sirket.renk||'#3B82F6')+'25', color:'#93C5FD', border:`1px solid ${sirket.renk||'#3B82F6'}55`, padding:'4px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'700' }}>
                {sirket.ikon} {sirket.ad}
              </span>
              <span style={{ background: sube.aktif ? 'rgba(21,128,61,0.25)' : 'rgba(220,38,38,0.25)', color: sube.aktif ? '#6EE7B7' : '#FCA5A5', border:`1px solid ${sube.aktif ? '#6EE7B7' : '#FCA5A5'}55`, padding:'4px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'700' }}>
                {sube.aktif ? '✅ Aktif' : '❌ Pasif'}
              </span>
              {sube.telefon && <span style={{ color:'#94A3B8', fontSize:'13px' }}>📞 {sube.telefon}</span>}
            </div>
          </div>
          <button onClick={() => { setSubeForm({ ...sube }); setSubeModal(true); }}
            style={{ background:'rgba(255,255,255,0.1)', color:'white', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'8px', padding:'8px 16px', fontSize:'13px', fontWeight:'600', cursor:'pointer', flexShrink:0 }}>
            ✏️ Düzenle
          </button>
        </div>
      </div>

      {/* KPI Kartlar */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:'12px', marginBottom:'20px' }}>
        <InfoKart ikon="👨‍🎓" label="Toplam Öğrenci"   deger={subeOgrenciler.length}  renk="#3B82F6" />
        <InfoKart ikon="✅"  label="Aktif Öğrenci"    deger={aktifOgrenci}           renk="#10B981" />
        <InfoKart ikon="👥"  label="Aktif Personel"   deger={aktifPersonel}          renk="#8B5CF6" />
        <InfoKart ikon="🚗"  label="Araç"              deger={subeAraclar.length}     renk="#F59E0B" />
        <InfoKart ikon="💰"  label="Toplam Gelir"      deger={`₺${toplamGelir.toLocaleString('tr-TR')}`}       renk="#10B981" />
        <InfoKart ikon="📤"  label="Toplam Gider"      deger={`₺${toplamGider.toLocaleString('tr-TR')}`}       renk="#EF4444" />
        <InfoKart ikon={netKar >= 0 ? '📈' : '📉'} label="Net Kâr / Zarar"
          deger={`₺${Math.abs(netKar).toLocaleString('tr-TR')}`}
          renk={netKar >= 0 ? '#10B981' : '#EF4444'} />
      </div>

      {/* Tab Bar */}
      <div className="tab-bar" style={{ flexWrap:'wrap' }}>
        {tabs.map(t => (
          <div key={t.id} className={`tab-item ${aktifTab === t.id ? 'aktif' : ''}`}
            onClick={() => setAktifTab(t.id)}>{t.label}</div>
        ))}
      </div>

      {/* ═══════════════ ÖZET ═══════════════ */}
      {aktifTab === 'ozet' && (
        <div className="panel">
          <div className="panel-baslik"><h3>📋 Şube Bilgileri</h3></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', marginBottom:'20px' }}>
            <InfoSatir etiket="Şube Adı"   deger={sube.ad} />
            <InfoSatir etiket="Şirket"     deger={`${sirket.ikon} ${sirket.ad}`} renk={sirket.renk} />
            <InfoSatir etiket="Durum"      deger={sube.aktif ? '✅ Aktif' : '❌ Pasif'} renk={sube.aktif ? '#10B981' : '#EF4444'} />
            <InfoSatir etiket="Şehir"      deger={sube.sehir} />
            <InfoSatir etiket="İlçe"       deger={sube.ilce} />
            <InfoSatir etiket="Telefon"    deger={sube.telefon} />
            <InfoSatir etiket="Adres"      deger={sube.adres} />
          </div>

          {/* Finans özet */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px', marginBottom:'16px' }}>
            {[
              { label:'TOPLAM GELİR', deger:`₺${toplamGelir.toLocaleString('tr-TR')}`, bg:'linear-gradient(135deg,#DCFCE7,#F0FDF4)', border:'#86EFAC', renk:'#15803D' },
              { label:'TOPLAM GİDER', deger:`₺${toplamGider.toLocaleString('tr-TR')}`, bg:'linear-gradient(135deg,#FEE2E2,#FFF5F5)', border:'#FCA5A5', renk:'#DC2626' },
              { label: netKar >= 0 ? 'NET KÂR' : 'NET ZARAR',
                deger:`₺${Math.abs(netKar).toLocaleString('tr-TR')}`,
                bg: netKar >= 0 ? 'linear-gradient(135deg,#DCFCE7,#F0FDF4)' : 'linear-gradient(135deg,#FEE2E2,#FFF5F5)',
                border: netKar >= 0 ? '#86EFAC' : '#FCA5A5', renk: netKar >= 0 ? '#15803D' : '#DC2626' },
            ].map((k, i) => (
              <div key={i} style={{ background:k.bg, borderRadius:'14px', padding:'18px', border:`1px solid ${k.border}`, textAlign:'center' }}>
                <div style={{ fontSize:'22px', fontWeight:'900', color:k.renk }}>{k.deger}</div>
                <div style={{ fontSize:'12px', color:k.renk, fontWeight:'700', marginTop:'4px' }}>{k.label}</div>
              </div>
            ))}
          </div>

          {/* Kardeş şubeler hızlı erişim */}
          {kardesSubeler.length > 0 && (
            <div>
              <div style={{ fontSize:'13px', fontWeight:'700', color:'#374151', marginBottom:'10px' }}>
                {sirket.ikon} {sirket.ad} — Diğer Şubeler
              </div>
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                {kardesSubeler.map(ks => (
                  <button key={ks.id}
                    onClick={() => navigate('sube_detay', { subeId: ks.id, sirketId: ks.sirket_id || ks.sirketId })}
                    style={{ padding:'7px 14px', borderRadius:'10px', cursor:'pointer', background:(sirket.renk||'#3B82F6')+'15', border:`1px solid ${sirket.renk||'#3B82F6'}44`, color:sirket.renk||'#3B82F6', fontSize:'13px', fontWeight:'600' }}>
                    {sirket.ikon} {ks.ilce || ks.ad}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ GELİRLER ═══════════════ */}
      {aktifTab === 'gelirler' && (
        <div className="panel">
          <div className="panel-baslik">
            <h3>💰 Gelirler</h3>
            <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
              <span style={{ fontSize:'13px', color:'#64748B' }}>
                Toplam: <strong style={{ color:'#15803D' }}>₺{toplamGelir.toLocaleString('tr-TR')}</strong>
              </span>
              <button className="btn btn-primary" style={{ padding:'6px 14px', fontSize:'13px' }}
                onClick={() => gelirAc(null)}>+ Gelir Ekle</button>
            </div>
          </div>

          {subeGelirler.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px', color:'#64748B' }}>
              <div style={{ fontSize:'40px', marginBottom:'12px' }}>💰</div>
              <div>Henüz gelir kaydı yok. İlk kaydı ekleyin.</div>
              <button className="btn btn-primary" style={{ marginTop:'12px' }} onClick={() => gelirAc(null)}>+ Gelir Ekle</button>
            </div>
          ) : (
            <div className="tablo-container">
              <table>
                <thead>
                  <tr><th>Tarih</th><th>Kategori</th><th>Ödeme Yöntemi</th><th>Tutar</th><th>Açıklama</th><th>İşlem</th></tr>
                </thead>
                <tbody>
                  {subeGelirler.map(g => {
                    const kat = GELIR_KAT_MAP[g.kategori];
                    const odm = ODEME_YONTEMLERI.find(o => o.id === g.odemeYontemi);
                    return (
                      <tr key={g.id}>
                        <td style={{ fontSize:'13px' }}>📅 {g.tarih}</td>
                        <td>
                          {kat && (
                            <span style={{ background:kat.renk+'18', color:kat.renk, border:`1px solid ${kat.renk}33`, padding:'3px 9px', borderRadius:'10px', fontSize:'11px', fontWeight:'700' }}>
                              {kat.ikon} {kat.label}
                            </span>
                          )}
                        </td>
                        <td>
                          {odm && (
                            <span style={{ background:odm.bg, color:odm.renk, border:`1px solid ${odm.renk}44`, padding:'3px 9px', borderRadius:'10px', fontSize:'11px', fontWeight:'700' }}>
                              {odm.ikon} {odm.label}
                            </span>
                          )}
                        </td>
                        <td style={{ fontWeight:'800', color:'#15803D', fontSize:'15px' }}>
                          ₺{(g.tutar||0).toLocaleString('tr-TR')}
                        </td>
                        <td style={{ fontSize:'13px', color:'#64748B' }}>{g.aciklama || '—'}</td>
                        <td>
                          <div style={{ display:'flex', gap:'6px' }}>
                            <button style={{ background:'#EFF6FF', color:'#2563EB', border:'none', borderRadius:'6px', padding:'5px 10px', fontSize:'12px', cursor:'pointer', fontWeight:'600' }}
                              onClick={() => gelirAc(g)}>✏️ Düzenle</button>
                            <button style={{ background:'#FFF5F5', color:'#DC2626', border:'none', borderRadius:'6px', padding:'5px 10px', fontSize:'12px', cursor:'pointer', fontWeight:'600' }}
                              onClick={() => setSilOnay({ tip:'gelir', id:g.id, ad:`₺${(g.tutar||0).toLocaleString('tr-TR')} gelir` })}>🗑️ Sil</button>
                          </div>
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

      {/* ═══════════════ GİDERLER ═══════════════ */}
      {aktifTab === 'giderler' && (
        <div className="panel">
          <div className="panel-baslik">
            <h3>📤 Giderler</h3>
            <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
              <span style={{ fontSize:'13px', color:'#64748B' }}>
                Toplam: <strong style={{ color:'#DC2626' }}>₺{toplamGider.toLocaleString('tr-TR')}</strong>
              </span>
              <button className="btn btn-primary" style={{ padding:'6px 14px', fontSize:'13px' }}
                onClick={() => giderAc(null)}>+ Gider Ekle</button>
            </div>
          </div>

          {subeGiderler.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px', color:'#64748B' }}>
              <div style={{ fontSize:'40px', marginBottom:'12px' }}>📤</div>
              <div>Henüz gider kaydı yok.</div>
              <button className="btn btn-primary" style={{ marginTop:'12px' }} onClick={() => giderAc(null)}>+ Gider Ekle</button>
            </div>
          ) : (
            <div className="tablo-container">
              <table>
                <thead>
                  <tr><th>Tarih</th><th>Kategori</th><th>KDV Hariç</th><th>KDV</th><th>Toplam</th><th>Açıklama</th><th>İşlem</th></tr>
                </thead>
                <tbody>
                  {subeGiderler.map(g => {
                    const kat = GIDER_KAT_MAP[g.kategori];
                    const toplam = (g.tutar || 0) + (g.kdv || 0);
                    return (
                      <tr key={g.id}>
                        <td style={{ fontSize:'13px' }}>📅 {g.tarih}</td>
                        <td>
                          {kat && (
                            <span style={{ background:kat.renk+'18', color:kat.renk, border:`1px solid ${kat.renk}33`, padding:'3px 9px', borderRadius:'10px', fontSize:'11px', fontWeight:'700' }}>
                              {kat.ikon} {kat.label}
                            </span>
                          )}
                        </td>
                        <td style={{ fontWeight:'700', color:'#374151' }}>₺{(g.tutar||0).toLocaleString('tr-TR')}</td>
                        <td style={{ color:'#EF4444', fontWeight:'600', fontSize:'13px' }}>
                          {g.kdv > 0 ? `₺${g.kdv.toLocaleString('tr-TR')}` : '—'}
                        </td>
                        <td style={{ fontWeight:'800', color:'#DC2626', fontSize:'15px' }}>₺{toplam.toLocaleString('tr-TR')}</td>
                        <td style={{ fontSize:'13px', color:'#64748B' }}>{g.aciklama || '—'}</td>
                        <td>
                          <div style={{ display:'flex', gap:'6px' }}>
                            <button style={{ background:'#EFF6FF', color:'#2563EB', border:'none', borderRadius:'6px', padding:'5px 10px', fontSize:'12px', cursor:'pointer', fontWeight:'600' }}
                              onClick={() => giderAc(g)}>✏️ Düzenle</button>
                            <button style={{ background:'#FFF5F5', color:'#DC2626', border:'none', borderRadius:'6px', padding:'5px 10px', fontSize:'12px', cursor:'pointer', fontWeight:'600' }}
                              onClick={() => setSilOnay({ tip:'gider', id:g.id, ad:`₺${toplam.toLocaleString('tr-TR')} gider` })}>🗑️ Sil</button>
                          </div>
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

      {/* ═══════════════ PERSONEL ═══════════════ */}
      {aktifTab === 'personel' && (
        <div className="panel">
          <div className="panel-baslik">
            <h3>👥 Personel</h3>
            <button className="btn btn-primary" style={{ padding:'6px 14px', fontSize:'13px' }}
              onClick={() => personelAc(null)}>+ Personel Ekle</button>
          </div>
          {subePersonel.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px', color:'#64748B' }}>
              <div style={{ fontSize:'40px', marginBottom:'12px' }}>👥</div>
              <div>Bu şubede kayıtlı personel yok.</div>
              <button className="btn btn-primary" style={{ marginTop:'12px' }} onClick={() => personelAc(null)}>+ Personel Ekle</button>
            </div>
          ) : (
            <div className="tablo-container">
              <table>
                <thead>
                  <tr><th>Ad Soyad</th><th>Pozisyon</th><th>Telefon</th><th>İşe Giriş</th><th>Maaş</th><th>Durum</th><th>İşlem</th></tr>
                </thead>
                <tbody>
                  {subePersonel.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight:'700' }}>{p.ad} {p.soyad}</td>
                      <td>
                        <span style={{ background:'#EDE9FE', color:'#5B21B6', padding:'3px 9px', borderRadius:'10px', fontSize:'12px', fontWeight:'700' }}>
                          {p.pozisyon || '—'}
                        </span>
                      </td>
                      <td style={{ fontSize:'13px' }}>{p.telefon || '—'}</td>
                      <td style={{ fontSize:'12px' }}>📅 {p.iseGirisTarihi}</td>
                      <td style={{ fontWeight:'700', color:'#15803D', fontSize:'14px' }}>₺{(p.maas||0).toLocaleString('tr-TR')}</td>
                      <td>
                        <span style={{ background: p.aktif !== false ? '#DCFCE7' : '#FEE2E2', color: p.aktif !== false ? '#14532D' : '#991B1B', padding:'4px 10px', borderRadius:'12px', fontSize:'11px', fontWeight:'700' }}>
                          {p.aktif !== false ? '✅ Aktif' : '❌ Pasif'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display:'flex', gap:'6px' }}>
                          <button style={{ background:'#EFF6FF', color:'#2563EB', border:'none', borderRadius:'6px', padding:'5px 10px', fontSize:'12px', cursor:'pointer', fontWeight:'600' }}
                            onClick={() => personelAc(p)}>✏️ Düzenle</button>
                          <button style={{ background:'#FFF5F5', color:'#DC2626', border:'none', borderRadius:'6px', padding:'5px 10px', fontSize:'12px', cursor:'pointer', fontWeight:'600' }}
                            onClick={() => setSilOnay({ tip:'personel', id:p.id, ad:`${p.ad} ${p.soyad}` })}>🗑️ Sil</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ ARAÇLAR ═══════════════ */}
      {aktifTab === 'araclar' && (
        <div className="panel">
          <div className="panel-baslik">
            <h3>🚗 Araçlar</h3>
            <button className="btn btn-primary" style={{ padding:'6px 14px', fontSize:'13px' }}
              onClick={() => aracAc(null)}>+ Araç Ekle</button>
          </div>
          {subeAraclar.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px', color:'#64748B' }}>
              <div style={{ fontSize:'40px', marginBottom:'12px' }}>🚗</div>
              <div>Bu şubeye atanmış araç yok.</div>
              <button className="btn btn-primary" style={{ marginTop:'12px' }} onClick={() => aracAc(null)}>+ Araç Ekle</button>
            </div>
          ) : (
            <div className="tablo-container">
              <table>
                <thead>
                  <tr><th>Plaka</th><th>Araç</th><th>Sınıf</th><th>KM</th><th>Son Bakım</th><th>Durum</th><th>İşlem</th></tr>
                </thead>
                <tbody>
                  {subeAraclar.map(a => (
                    <tr key={a.id}>
                      <td>
                        <div style={{ background:'#1E3A5F', color:'white', padding:'4px 10px', borderRadius:'6px', fontSize:'13px', fontWeight:'700', display:'inline-block', letterSpacing:'1px' }}>
                          {a.plaka}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight:'700' }}>{a.marka} {a.model}</div>
                        <div style={{ fontSize:'11px', color:'#64748B' }}>{a.yil} Model</div>
                      </td>
                      <td>
                        <span style={{ background:'#DBEAFE', color:'#1D4ED8', padding:'3px 9px', borderRadius:'10px', fontSize:'12px', fontWeight:'700' }}>
                          {a.sinif}
                        </span>
                      </td>
                      <td style={{ fontWeight:'600' }}>{(a.km||0).toLocaleString('tr-TR')} km</td>
                      <td style={{ fontSize:'12px' }}>{a.sonBakim || '—'}</td>
                      <td>
                        <span style={{ background: a.aktif !== false ? '#DCFCE7' : '#FEF9C3', color: a.aktif !== false ? '#14532D' : '#713F12', padding:'4px 10px', borderRadius:'12px', fontSize:'11px', fontWeight:'700' }}>
                          {a.aktif !== false ? '✅ Aktif' : '🔧 Bakımda'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display:'flex', gap:'6px' }}>
                          <button style={{ background:'#EFF6FF', color:'#2563EB', border:'none', borderRadius:'6px', padding:'5px 10px', fontSize:'12px', cursor:'pointer', fontWeight:'600' }}
                            onClick={() => aracAc(a)}>✏️ Düzenle</button>
                          <button style={{ background:'#FFF5F5', color:'#DC2626', border:'none', borderRadius:'6px', padding:'5px 10px', fontSize:'12px', cursor:'pointer', fontWeight:'600' }}
                            onClick={() => setSilOnay({ tip:'arac', id:a.id, ad:`${a.plaka} - ${a.marka} ${a.model}` })}>🗑️ Sil</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ ÖĞRENCİLER ═══════════════ */}
      {aktifTab === 'ogrenciler' && (
        <div className="panel">
          <div className="panel-baslik">
            <h3>👨‍🎓 Öğrenciler</h3>
            <span style={{ fontSize:'13px', color:'#64748B' }}>{subeOgrenciler.length} kayıt</span>
          </div>
          {subeOgrenciler.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px', color:'#64748B' }}>
              Bu şubeye kayıtlı öğrenci bulunmamaktadır.
            </div>
          ) : (
            <div className="tablo-container">
              <table>
                <thead>
                  <tr><th>Ad Soyad</th><th>TC</th><th>Telefon</th><th>Kurs Tipi</th><th>Kayıt Tarihi</th><th>Ücret</th><th>Ödenen</th><th>Kalan</th><th>Durum</th></tr>
                </thead>
                <tbody>
                  {subeOgrenciler.map(o => {
                    const kalan = (o.toplamUcret || 0) - (o.odenenUcret || 0);
                    return (
                      <tr key={o.id}>
                        <td>
                          <div style={{ fontWeight:'700' }}>{o.ad} {o.soyad}</div>
                          <div style={{ fontSize:'11px', color:'#64748B' }}>{o.email}</div>
                        </td>
                        <td style={{ fontSize:'12px', color:'#64748B' }}>{o.tc || '—'}</td>
                        <td style={{ fontSize:'13px' }}>{o.telefon}</td>
                        <td><span style={{ background:'#DBEAFE', color:'#1D4ED8', padding:'3px 9px', borderRadius:'10px', fontSize:'12px', fontWeight:'700' }}>{o.kurstipi}</span></td>
                        <td style={{ fontSize:'12px' }}>📅 {o.kayitTarihi}</td>
                        <td style={{ fontWeight:'700', fontSize:'13px' }}>₺{(o.toplamUcret||0).toLocaleString('tr-TR')}</td>
                        <td style={{ fontWeight:'700', color:'#15803D' }}>₺{(o.odenenUcret||0).toLocaleString('tr-TR')}</td>
                        <td style={{ fontWeight:'700', color: kalan > 0 ? '#DC2626' : '#15803D' }}>
                          {kalan > 0 ? `₺${kalan.toLocaleString('tr-TR')}` : '✔ Tamam'}
                        </td>
                        <td>
                          <span style={{ padding:'4px 10px', borderRadius:'12px', fontSize:'11px', fontWeight:'700', background: o.durum==='devam_ediyor' ? '#DCFCE7' : o.durum==='tamamladi' ? '#DBEAFE' : '#FEF9C3', color: o.durum==='devam_ediyor' ? '#14532D' : o.durum==='tamamladi' ? '#1D4ED8' : '#713F12' }}>
                            {o.durum==='devam_ediyor' ? '📚 Devam Ediyor' : o.durum==='tamamladi' ? '🎓 Tamamladı' : '⏸ Bekleme'}
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

      {/* ═══════════════ KARDEŞ ŞUBELER ═══════════════ */}
      {aktifTab === 'kardessube' && (
        <div className="panel">
          <div className="panel-baslik">
            <h3>{sirket.ikon} {sirket.ad} — Tüm Şubeler</h3>
            <span style={{ fontSize:'13px', color:'#64748B' }}>{kardesSubeler.length + 1} şube</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'12px' }}>
            <div style={{ background:`linear-gradient(135deg,${sirket.renk||'#3B82F6'}25,${sirket.renk||'#3B82F6'}10)`, border:`2px solid ${sirket.renk||'#3B82F6'}`, borderRadius:'14px', padding:'16px' }}>
              <div style={{ fontWeight:'800', color:sirket.renk||'#3B82F6', fontSize:'14px', marginBottom:'6px' }}>{sirket.ikon} {sube.ad}</div>
              <div style={{ fontSize:'12px', color:'#64748B' }}>📍 {sube.ilce}, {sube.sehir}</div>
              {sube.telefon && <div style={{ fontSize:'12px', color:'#64748B', marginTop:'3px' }}>📞 {sube.telefon}</div>}
              <div style={{ marginTop:'8px' }}>
                <span style={{ background:(sirket.renk||'#3B82F6')+'20', color:sirket.renk||'#3B82F6', padding:'3px 10px', borderRadius:'10px', fontSize:'11px', fontWeight:'700', border:`1px solid ${sirket.renk||'#3B82F6'}44` }}>📌 Mevcut Şube</span>
              </div>
            </div>
            {kardesSubeler.map(ks => (
              <div key={ks.id}
                onClick={() => navigate('sube_detay', { subeId: ks.id, sirketId: ks.sirket_id || ks.sirketId })}
                style={{ background:'#F8FAFC', border:`1px solid ${sirket.renk||'#3B82F6'}33`, borderRadius:'14px', padding:'16px', cursor:'pointer', transition:'all 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.background=(sirket.renk||'#3B82F6')+'12'; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background='#F8FAFC'; e.currentTarget.style.transform='translateY(0)'; }}>
                <div style={{ fontWeight:'700', color:'#1E293B', fontSize:'14px', marginBottom:'6px' }}>{sirket.ikon} {ks.ad}</div>
                <div style={{ fontSize:'12px', color:'#64748B' }}>📍 {ks.ilce}, {ks.sehir}</div>
                {ks.telefon && <div style={{ fontSize:'12px', color:'#64748B', marginTop:'3px' }}>📞 {ks.telefon}</div>}
                <div style={{ marginTop:'10px', display:'flex', gap:'6px' }}>
                  <span style={{ background: ks.aktif !== false ? '#DCFCE7' : '#FEE2E2', color: ks.aktif !== false ? '#14532D' : '#991B1B', padding:'3px 8px', borderRadius:'8px', fontSize:'11px', fontWeight:'700' }}>
                    {ks.aktif !== false ? '✅ Aktif' : '❌ Pasif'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MODALLAR
      ══════════════════════════════════════════ */}

      {/* Şube Düzenle Modal */}
      <Modal acik={subeModal} kapat={() => setSubeModal(false)} baslik="✏️ Şube Düzenle" genislik="560px">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          <div style={{ gridColumn:'1/-1' }}>
            <Inp label="Şube Adı" name="ad" form={subeForm} setForm={setSubeForm} required />
          </div>
          <Inp label="Telefon"  name="telefon" form={subeForm} setForm={setSubeForm} />
          <Inp label="Şehir"    name="sehir"   form={subeForm} setForm={setSubeForm} />
          <Inp label="İlçe"     name="ilce"    form={subeForm} setForm={setSubeForm} />
          <Sel label="Durum" name="aktif"
            options={[{ value: true, label:'✅ Aktif' }, { value: false, label:'❌ Pasif' }]}
            form={{ aktif: subeForm.aktif ? 'true' : 'false' }}
            setForm={f => setSubeForm(p => ({ ...p, aktif: f.aktif === 'true' }))}
          />
          <div style={{ gridColumn:'1/-1' }}>
            <Inp label="Adres" name="adres" form={subeForm} setForm={setSubeForm} />
          </div>
        </div>
        <div style={{ display:'flex', gap:'8px', marginTop:'20px', justifyContent:'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => setSubeModal(false)}>İptal</button>
          <button className="btn btn-primary" disabled={kaydediyor} onClick={subeGuncelle}>
            {kaydediyor ? '⏳ Kaydediliyor...' : '💾 Güncelle'}
          </button>
        </div>
      </Modal>

      {/* Gelir Ekle/Düzenle Modal */}
      <Modal acik={gelirModal} kapat={() => setGelirModal(false)} baslik={duzenGelir ? '✏️ Gelir Düzenle' : '+ Gelir Ekle'} genislik="520px">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          <Sel label="Kategori" name="kategori"
            options={GELIR_KATEGORILER.map(k => ({ value:k.id, label:`${k.ikon} ${k.label}` }))}
            form={gelirForm} setForm={setGelirForm} />
          <Sel label="Ödeme Yöntemi" name="odemeYontemi"
            options={ODEME_YONTEMLERI.map(o => ({ value:o.id, label:`${o.ikon} ${o.label}` }))}
            form={gelirForm} setForm={setGelirForm} />
          <Inp label="Tarih"  name="tarih"  tip="date"   form={gelirForm} setForm={setGelirForm} required />
          <Inp label="Tutar (₺)" name="tutar" tip="number" form={gelirForm} setForm={setGelirForm} required />
          <div style={{ gridColumn:'1/-1' }}>
            <Inp label="Açıklama" name="aciklama" form={gelirForm} setForm={setGelirForm} />
          </div>
        </div>
        <div style={{ display:'flex', gap:'8px', marginTop:'20px', justifyContent:'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => setGelirModal(false)}>İptal</button>
          <button className="btn btn-primary" disabled={kaydediyor} onClick={gelirKaydet}>
            {kaydediyor ? '⏳ Kaydediliyor...' : duzenGelir ? '💾 Güncelle' : '✅ Kaydet'}
          </button>
        </div>
      </Modal>

      {/* Gider Ekle/Düzenle Modal */}
      <Modal acik={giderModal} kapat={() => setGiderModal(false)} baslik={duzenGider ? '✏️ Gider Düzenle' : '+ Gider Ekle'} genislik="520px">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          <Sel label="Kategori" name="kategori"
            options={GIDER_KATEGORILER.map(k => ({ value:k.id, label:`${k.ikon} ${k.label}` }))}
            form={giderForm} setForm={setGiderForm} />
          <Inp label="Tarih" name="tarih" tip="date" form={giderForm} setForm={setGiderForm} required />
          <Inp label="Tutar (KDV Hariç) ₺" name="tutar" tip="number" form={giderForm} setForm={setGiderForm} required />
          <Inp label="KDV Tutarı ₺"       name="kdv"   tip="number" form={giderForm} setForm={setGiderForm} />
          {(Number(giderForm.tutar) > 0 || Number(giderForm.kdv) > 0) && (
            <div style={{ gridColumn:'1/-1', background:'linear-gradient(135deg,#FEE2E2,#FFF5F5)', borderRadius:'10px', padding:'12px 16px', border:'1px solid #FCA5A5' }}>
              <div style={{ fontSize:'12px', color:'#EF4444', fontWeight:'700', marginBottom:'4px' }}>KDV DAHİL TOPLAM</div>
              <div style={{ fontSize:'22px', fontWeight:'900', color:'#DC2626' }}>
                ₺{(Number(giderForm.tutar||0) + Number(giderForm.kdv||0)).toLocaleString('tr-TR')}
              </div>
            </div>
          )}
          <Inp label="Belge No" name="belgeNo" form={giderForm} setForm={setGiderForm} />
          <Sel label="Durum" name="durum"
            options={[{ value:'odendi', label:'✅ Ödendi' }, { value:'bekliyor', label:'⏳ Bekliyor' }]}
            form={giderForm} setForm={setGiderForm} />
          <div style={{ gridColumn:'1/-1' }}>
            <Inp label="Açıklama" name="aciklama" form={giderForm} setForm={setGiderForm} />
          </div>
        </div>
        <div style={{ display:'flex', gap:'8px', marginTop:'20px', justifyContent:'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => setGiderModal(false)}>İptal</button>
          <button className="btn btn-primary" disabled={kaydediyor} onClick={giderKaydet}>
            {kaydediyor ? '⏳ Kaydediliyor...' : duzenGider ? '💾 Güncelle' : '✅ Kaydet'}
          </button>
        </div>
      </Modal>

      {/* Personel Ekle/Düzenle Modal */}
      <Modal acik={personelModal} kapat={() => setPersonelModal(false)} baslik={duzenPersonel ? '✏️ Personel Düzenle' : '+ Personel Ekle'} genislik="560px">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          <Inp label="Ad"       name="ad"     form={personelForm} setForm={setPersonelForm} required />
          <Inp label="Soyad"    name="soyad"  form={personelForm} setForm={setPersonelForm} required />
          <Inp label="Pozisyon" name="pozisyon" form={personelForm} setForm={setPersonelForm} />
          <Inp label="Telefon"  name="telefon"  form={personelForm} setForm={setPersonelForm} />
          <Inp label="Maaş (₺)" name="maas"   tip="number" form={personelForm} setForm={setPersonelForm} />
          <Inp label="İşe Giriş" name="iseGirisTarihi" tip="date" form={personelForm} setForm={setPersonelForm} />
          <Sel label="Durum" name="aktif"
            options={[{ value:'true', label:'✅ Aktif' }, { value:'false', label:'❌ Pasif' }]}
            form={{ aktif: personelForm.aktif !== false ? 'true' : 'false' }}
            setForm={f => setPersonelForm(p => ({ ...p, aktif: f.aktif === 'true' }))}
          />
        </div>
        <div style={{ display:'flex', gap:'8px', marginTop:'20px', justifyContent:'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => setPersonelModal(false)}>İptal</button>
          <button className="btn btn-primary" disabled={kaydediyor} onClick={personelKaydet}>
            {kaydediyor ? '⏳ Kaydediliyor...' : duzenPersonel ? '💾 Güncelle' : '✅ Kaydet'}
          </button>
        </div>
      </Modal>

      {/* Araç Ekle/Düzenle Modal */}
      <Modal acik={aracModal} kapat={() => setAracModal(false)} baslik={duzenArac ? '✏️ Araç Düzenle' : '+ Araç Ekle'} genislik="560px">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          <Inp label="Plaka"  name="plaka"  form={aracForm} setForm={setAracForm} required />
          <Inp label="Marka"  name="marka"  form={aracForm} setForm={setAracForm} />
          <Inp label="Model"  name="model"  form={aracForm} setForm={setAracForm} />
          <Inp label="Yıl"    name="yil"    tip="number" form={aracForm} setForm={setAracForm} />
          <Sel label="Sınıf"  name="sinif"
            options={SINIF_TIPLERI.map(s => ({ value:s, label:s }))}
            form={aracForm} setForm={setAracForm} />
          <Inp label="KM"      name="km"       tip="number" form={aracForm} setForm={setAracForm} />
          <Inp label="Son Bakım" name="sonBakim" tip="date" form={aracForm} setForm={setAracForm} />
          <Sel label="Durum" name="aktif"
            options={[{ value:'true', label:'✅ Aktif' }, { value:'false', label:'🔧 Bakımda' }]}
            form={{ aktif: aracForm.aktif !== false ? 'true' : 'false' }}
            setForm={f => setAracForm(p => ({ ...p, aktif: f.aktif === 'true' }))}
          />
        </div>
        <div style={{ display:'flex', gap:'8px', marginTop:'20px', justifyContent:'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => setAracModal(false)}>İptal</button>
          <button className="btn btn-primary" disabled={kaydediyor} onClick={aracKaydet}>
            {kaydediyor ? '⏳ Kaydediliyor...' : duzenArac ? '💾 Güncelle' : '✅ Kaydet'}
          </button>
        </div>
      </Modal>

      {/* Silme Onay Modal */}
      <Modal acik={!!silOnay} kapat={() => setSilOnay(null)} baslik="🗑️ Silme Onayı" genislik="400px">
        {silOnay && (
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:'48px', marginBottom:'12px' }}>⚠️</div>
            <div style={{ fontWeight:'700', fontSize:'16px', marginBottom:'8px' }}>Bu kaydı silmek istediğinize emin misiniz?</div>
            <div style={{ background:'#FFF5F5', border:'1px solid #FCA5A5', borderRadius:'8px', padding:'10px 16px', marginBottom:'20px', color:'#DC2626', fontWeight:'600' }}>
              {silOnay.ad}
            </div>
            <div style={{ fontSize:'13px', color:'#64748B', marginBottom:'20px' }}>Bu işlem geri alınamaz.</div>
            <div style={{ display:'flex', gap:'10px', justifyContent:'center' }}>
              <button className="btn btn-secondary" onClick={() => setSilOnay(null)}>İptal</button>
              <button
                style={{ background:'#DC2626', color:'white', border:'none', borderRadius:'8px', padding:'10px 22px', fontWeight:'700', cursor:'pointer', fontSize:'14px' }}
                onClick={() => {
                  if (silOnay.tip === 'gelir')    gelirSil(silOnay.id);
                  if (silOnay.tip === 'gider')    giderSil(silOnay.id);
                  if (silOnay.tip === 'personel') personelSil(silOnay.id);
                  if (silOnay.tip === 'arac')     aracSil(silOnay.id);
                }}>
                🗑️ Evet, Sil
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
