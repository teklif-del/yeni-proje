import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Modal from '../components/Modal';
import { supabase } from '../lib/supabase';

// ─── KATEGORİ TANIMI ───────────────────────────────────────
const KATEGORILER = [
  { id: 'sgk',       label: 'SGK Primi',           ikon: '🏥', renk: '#EF4444', aciklama: 'İşveren & işçi SGK prim ödemeleri' },
  { id: 'vergi',     label: 'Vergi',                ikon: '🏛️', renk: '#F59E0B', aciklama: 'KDV, muhtasar, kurumlar vergisi vb.' },
  { id: 'fatura',    label: 'Fatura (Elektrik/Su/Gaz/İnt)', ikon: '💡', renk: '#06B6D4', aciklama: 'Elektrik, su, doğalgaz, internet faturaları' },
  { id: 'kira',      label: 'Kira',                 ikon: '🏢', renk: '#8B5CF6', aciklama: 'Şube / ofis kira ödemeleri' },
  { id: 'personel',  label: 'Personel / Maaş',      ikon: '👥', renk: '#3B82F6', aciklama: 'Maaş, prim, ikramiye ödemeleri' },
  { id: 'arac',      label: 'Araç Giderleri',        ikon: '🚗', renk: '#10B981', aciklama: 'Yakıt, bakım, sigorta, muayene' },
  { id: 'malzeme',   label: 'Malzeme / Sarf',        ikon: '📦', renk: '#84CC16', aciklama: 'Kırtasiye, temizlik, ekipman' },
  { id: 'bakim',     label: 'Bakım / Onarım',        ikon: '🔧', renk: '#F97316', aciklama: 'Bina, araç, ekipman bakım-onarım' },
  { id: 'sigorta',   label: 'Sigorta',               ikon: '🛡️', renk: '#EC4899', aciklama: 'Bina, araç, işyeri sigorta primleri' },
  { id: 'reklam',    label: 'Reklam / Pazarlama',    ikon: '📣', renk: '#A855F7', aciklama: 'Sosyal medya, billboard, broşür vb.' },
  { id: 'muhasebe',  label: 'Muhasebe / Danışmanlık',ikon: '📊', renk: '#64748B', aciklama: 'Mali müşavir, hukuk, danışmanlık' },
  { id: 'diger',     label: 'Diğer',                 ikon: '📋', renk: '#94A3B8', aciklama: 'Diğer gider kalemleri' },
];

const KAT_MAP = Object.fromEntries(KATEGORILER.map(k => [k.id, k]));

// ─── VERGİ ALT TİPLERİ ─────────────────────────────────────
const VERGI_TIPLERI = ['KDV', 'Muhtasar Beyanname', 'Kurumlar Vergisi', 'Gelir Vergisi', 'Damga Vergisi', 'ÖTV', 'Diğer Vergi'];
const FATURA_TIPLERI = ['Elektrik', 'Su', 'Doğalgaz', 'İnternet', 'Telefon', 'Diğer'];
const ARAC_TIPLERI = ['Yakıt', 'Bakım / Servis', 'Sigorta', 'Muayene', 'Trafik Cezası', 'Diğer'];

// ─── BAŞLANGIÇ VERİSİ ──────────────────────────────────────
const BASLANGIC_GIDERLER = [];

const AYLAR = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

const BOSfORM = {
  subeId: '', kategori: '', altTip: '', tarih: new Date().toISOString().split('T')[0],
  tutar: '', kdvOrani: '20', aciklama: '', belgeNo: '', durum: 'odendi', tekrar: 'tek_sefer',
};

// ─── Input yardımcısı (bileşen DIŞINDA — focus sorunu önlenir) ──
function GiderInp({ label, name, tip='text', options, tam, zorunlu, form, setForm }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'5px', gridColumn: tam ? '1/-1' : undefined }}>
      <label style={{ fontSize:'12px', fontWeight:'600', color:'#374151' }}>{label}{zorunlu && <span style={{color:'#EF4444'}}> *</span>}</label>
      {options ? (
        <select style={{ padding:'9px 12px', border:'1.5px solid #E2E8F0', borderRadius:'8px', fontSize:'14px', outline:'none', background:'white' }}
          value={form[name] || ''} onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))}>
          <option value="">Seçin...</option>
          {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
        </select>
      ) : (
        <input style={{ padding:'9px 12px', border:'1.5px solid #E2E8F0', borderRadius:'8px', fontSize:'14px', outline:'none' }}
          type={tip} value={form[name] || ''} onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))} placeholder={label} />
      )}
    </div>
  );
}

// ─── InfoSatir ─────────────────────────────────────────────
function InfoSatir({ etiket, deger, renk }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', background:'#F8FAFC', borderRadius:'8px', padding:'11px 14px' }}>
      <span style={{ fontSize:'11px', color:'#64748B', marginBottom:'3px', textTransform:'uppercase', letterSpacing:'0.4px' }}>{etiket}</span>
      <span style={{ fontSize:'14px', fontWeight:'600', color: renk || '#1E293B' }}>{deger || '—'}</span>
    </div>
  );
}

// ─── ANA SAYFA ─────────────────────────────────────────────
export default function GiderlerPage() {
  const [giderler, setGiderler] = useState(BASLANGIC_GIDERLER);
  const [subeler,  setSubeler]  = useState([]);
  const [sirketler,setSirketler]= useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [aktifTab, setAktifTab]   = useState('liste');
  const [aramaMetni, setArama]    = useState('');
  const [katFiltre, setKatFiltre] = useState('tumu');
  const [subeFiltre, setSubeFiltre] = useState('tumu');
  const [durumFiltre, setDurumFiltre] = useState('tumu');

  const [yeniModal, setYeniModal]    = useState(false);
  const [duzenleModal, setDuzenle]   = useState(null);
  const [detayModal, setDetay]       = useState(null);
  const [silOnay, setSilOnay]        = useState(null);
  const [form, setForm]              = useState(BOSfORM);

  // ── Supabase'den giderler + şube & şirket yükle ──
  useEffect(() => {
    async function yukle() {
      setYukleniyor(true);
      const [{ data: gd }, { data: sd }, { data: srd }] = await Promise.all([
        supabase.from('giderler').select('*').order('tarih', { ascending: false }),
        supabase.from('subeler').select('*').order('id'),
        supabase.from('sirketler').select('*').order('id'),
      ]);
      setGiderler((gd || []).map(r => ({
        id: r.id, subeId: r.sube_id, kategori: r.kategori, altTip: r.alt_tip || '',
        tarih: r.tarih, tutar: Number(r.tutar) || 0, kdv: Number(r.kdv) || 0,
        aciklama: r.aciklama || '', belgeNo: r.belge_no || '', durum: r.durum || 'odendi',
      })));
      setSubeler(sd || []);
      setSirketler(srd || []);
      setYukleniyor(false);
    }
    yukle();
  }, []);

  // ── filtre ──
  const filtrelenenler = useMemo(() => giderler.filter(g => {
    const katEsles  = katFiltre === 'tumu' || g.kategori === katFiltre;
    const subeEsles = subeFiltre === 'tumu' || g.subeId === parseInt(subeFiltre);
    const durumEsles= durumFiltre === 'tumu' || g.durum === durumFiltre;
    const aramaEsles= aramaMetni === '' ||
      g.aciklama.toLowerCase().includes(aramaMetni.toLowerCase()) ||
      (g.belgeNo || '').toLowerCase().includes(aramaMetni.toLowerCase()) ||
      (g.altTip || '').toLowerCase().includes(aramaMetni.toLowerCase());
    return katEsles && subeEsles && durumEsles && aramaEsles;
  }), [giderler, katFiltre, subeFiltre, durumFiltre, aramaMetni]);

  // ── özet hesaplar ──
  // tutar = KDV dahil toplam (girilen rakam), kdv = hesaplanan kdv tutarı
  const toplamBrut    = giderler.reduce((s, g) => s + (g.tutar || 0), 0);
  const toplamKdv     = giderler.reduce((s, g) => s + (g.kdv || 0), 0);
  const toplamTutar   = toplamBrut - toplamKdv; // KDV hariç (matrah)
  const bekleyenTutar = giderler.filter(g => g.durum === 'bekliyor').reduce((s, g) => s + g.tutar, 0);

  // ── grafik: kategori dağılımı ──
  const katGrafik = useMemo(() => KATEGORILER.map(k => ({
    name: k.label.split('(')[0].trim(),
    value: giderler.filter(g => g.kategori === k.id).reduce((s, g) => s + g.tutar, 0),
    renk: k.renk,
  })).filter(k => k.value > 0), [giderler]);

  // ── grafik: aylık ──
  const aylikGrafik = useMemo(() => AYLAR.slice(0, 6).map((ay, i) => ({
    ay,
    tutar: giderler.filter(g => new Date(g.tarih).getMonth() === i).reduce((s, g) => s + g.tutar, 0),
  })), [giderler]);

  // ── kaydet (Supabase'e yazar) ──
  const kaydet = async () => {
    if (!form.kategori || !form.tutar || !form.tarih) { alert('Kategori, tutar ve tarih zorunludur!'); return; }
    // Girilen tutar KDV DAHİL → matrah ve kdv hesapla
    const kdvDahil  = parseFloat(form.tutar) || 0;
    const kdvOrani  = parseFloat(form.kdvOrani) || 0;
    const matrah    = kdvOrani > 0 ? Math.round(kdvDahil / (1 + kdvOrani / 100)) : kdvDahil;
    const kdvTutar  = kdvDahil - matrah;
    const row = {
      sube_id:   parseInt(form.subeId) || null,
      kategori:  form.kategori,
      alt_tip:   form.altTip || '',
      tarih:     form.tarih,
      tutar:     kdvDahil,        // KDV dahil tutar
      kdv:       kdvTutar,        // hesaplanan KDV
      aciklama:  form.aciklama || '',
      belge_no:  form.belgeNo || '',
      durum:     form.durum || 'odendi',
    };
    if (duzenleModal) {
      const { error } = await supabase.from('giderler').update(row).eq('id', duzenleModal.id);
      if (!error) {
        setGiderler(prev => prev.map(g => g.id === duzenleModal.id
          ? { ...g, subeId: row.sube_id, kategori: row.kategori, altTip: row.alt_tip,
              tarih: row.tarih, tutar: row.tutar, kdv: row.kdv,
              aciklama: row.aciklama, belgeNo: row.belge_no, durum: row.durum }
          : g));
      } else { alert('Güncelleme hatası: ' + error.message); }
      setDuzenle(null);
    } else {
      const { data, error } = await supabase.from('giderler').insert(row).select().single();
      if (!error && data) {
        setGiderler(prev => [{
          id: data.id, subeId: data.sube_id, kategori: data.kategori, altTip: data.alt_tip,
          tarih: data.tarih, tutar: data.tutar, kdv: data.kdv,
          aciklama: data.aciklama, belgeNo: data.belge_no, durum: data.durum,
        }, ...prev]);
      } else { alert('Gider eklenemedi: ' + (error?.message || '')); }
      setYeniModal(false);
    }
    setForm(BOSfORM);
  };

  const sil = async id => {
    const { error } = await supabase.from('giderler').delete().eq('id', id);
    if (!error) setGiderler(prev => prev.filter(g => g.id !== id));
    setSilOnay(null); setDetay(null);
  };
  const acDuzenle = g => {
    // KDV dahil tutardan oranı geri hesapla
    const kdvOrani = g.kdv > 0 && g.tutar > 0 ? Math.round((g.kdv / g.tutar) * 100 / (1 - g.kdv / g.tutar)) : 0;
    setForm({ ...g, subeId: g.subeId?.toString(), tutar: g.tutar?.toString(), kdvOrani: kdvOrani.toString(), belgeNo: g.belgeNo || '' });
    setDuzenle(g);
  };
  const odendi = async id => {
    await supabase.from('giderler').update({ durum: 'odendi' }).eq('id', id);
    setGiderler(prev => prev.map(g => g.id === id ? { ...g, durum: 'odendi' } : g));
  };

  // ── altTip listesi ──
  const altTipler = useMemo(() => {
    if (form.kategori === 'vergi')  return VERGI_TIPLERI;
    if (form.kategori === 'fatura') return FATURA_TIPLERI;
    if (form.kategori === 'arac')   return ARAC_TIPLERI;
    return [];
  }, [form.kategori]);

  // KDV hesabı (anlık)
  const kdvDahilTutar = parseFloat(form.tutar) || 0;
  const kdvOraniVal   = parseFloat(form.kdvOrani) || 0;
  const matrahHesap   = kdvOraniVal > 0 ? Math.round(kdvDahilTutar / (1 + kdvOraniVal / 100)) : kdvDahilTutar;
  const kdvTutarHesap = kdvDahilTutar - matrahHesap;

  const tabs = [
    { id:'liste',     label:'📋 Gider Listesi' },
    { id:'kategori',  label:'📊 Kategori Analizi' },
    { id:'aylik',     label:'📈 Aylık Trend' },
    { id:'takvim',    label:'📅 Ödeme Takvimi' },
  ];

  return (
    <div>
      <div className="sayfa-baslik">
        <h1>📤 Gider Takibi</h1>
        <p>SGK, vergi, fatura ve tüm gider kalemlerinizi yönetin</p>
      </div>

      {/* ── Özet Kartlar ── */}
      <div className="ozet-kartlar">
        {[
          { ikon:'📊', label:'Toplam Gider (KDV Dahil)',  deger:`₺${toplamBrut.toLocaleString('tr-TR')}`,  bg:'#FEE2E2', renk:'#EF4444' },
          { ikon:'🧾', label:'KDV Toplamı',               deger:`₺${toplamKdv.toLocaleString('tr-TR')}`,    bg:'#FEF9C3', renk:'#F59E0B' },
          { ikon:'💸', label:'Toplam (KDV Hariç)',         deger:`₺${toplamTutar.toLocaleString('tr-TR')}`,   bg:'#DBEAFE', renk:'#3B82F6' },
          { ikon:'⏳', label:'Bekleyen Ödemeler',          deger:`₺${bekleyenTutar.toLocaleString('tr-TR')}`, bg:'#EDE9FE', renk:'#8B5CF6' },
          { ikon:'📂', label:'Toplam Kayıt',               deger:giderler.length,                             bg:'#DCFCE7', renk:'#10B981' },
          { ikon:'🏛️', label:'SGK + Vergi Toplam',          deger:`₺${giderler.filter(g=>['sgk','vergi'].includes(g.kategori)).reduce((s,g)=>s+g.tutar,0).toLocaleString('tr-TR')}`, bg:'#CFFAFE', renk:'#06B6D4' },
        ].map(k => (
          <div key={k.label} className="ozet-kart">
            <div className="kart-ikon" style={{ background:k.bg, fontSize:'22px' }}>{k.ikon}</div>
            <div className="kart-bilgi"><h3 style={{ color:k.renk, fontSize:'16px' }}>{k.deger}</h3><p style={{fontSize:'12px'}}>{k.label}</p></div>
          </div>
        ))}
      </div>

      {/* ── Tab Bar ── */}
      <div className="tab-bar">
        {tabs.map(t => (
          <div key={t.id} className={`tab-item ${aktifTab===t.id?'aktif':''}`} onClick={()=>setAktifTab(t.id)}>{t.label}</div>
        ))}
      </div>

      {/* ═══════════════════════════════════════
          GİDER LİSTESİ
      ═══════════════════════════════════════ */}
      {aktifTab === 'liste' && (
        <>
          {/* Filtre Bar */}
          <div className="filtre-bar">
            <input className="arama-input" placeholder="🔍 Açıklama veya belge no ara..."
              value={aramaMetni} onChange={e => setArama(e.target.value)} />
            <select className="secim-input" value={katFiltre} onChange={e => setKatFiltre(e.target.value)}>
              <option value="tumu">Tüm Kategoriler</option>
              {KATEGORILER.map(k => <option key={k.id} value={k.id}>{k.ikon} {k.label.split('(')[0].trim()}</option>)}
            </select>
            <select className="secim-input" value={subeFiltre} onChange={e => setSubeFiltre(e.target.value)}>
              <option value="tumu">Tüm Şubeler</option>
              {subeler.map(s => { const sr = sirketler.find(x=>x.id===s.sirket_id); return <option key={s.id} value={s.id}>{sr?.ikon} {s.ad || s.ilce}</option>; })}
            </select>
            <select className="secim-input" value={durumFiltre} onChange={e => setDurumFiltre(e.target.value)}>
              <option value="tumu">Tüm Durumlar</option>
              <option value="odendi">✅ Ödendi</option>
              <option value="bekliyor">⏳ Bekliyor</option>
            </select>
            <button className="btn btn-primary" onClick={() => { setForm(BOSfORM); setYeniModal(true); }}>+ Gider Ekle</button>
          </div>

          {/* Kategori Hızlı Filtre Butonları */}
          <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'12px' }}>
            <button className={`btn btn-sm ${katFiltre==='tumu'?'btn-primary':'btn-secondary'}`} onClick={()=>setKatFiltre('tumu')}>Tümü</button>
            {KATEGORILER.map(k => (
              <button key={k.id}
                className={`btn btn-sm ${katFiltre===k.id?'btn-primary':'btn-secondary'}`}
                style={{ borderLeft: `3px solid ${k.renk}` }}
                onClick={() => setKatFiltre(k.id)}>
                {k.ikon} {k.label.split('(')[0].trim()}
                <span style={{ marginLeft:'4px', background: katFiltre===k.id?'rgba(255,255,255,0.3)':'#E2E8F0', padding:'1px 5px', borderRadius:'8px', fontSize:'11px' }}>
                  {giderler.filter(g=>g.kategori===k.id).length}
                </span>
              </button>
            ))}
          </div>

          <div className="panel">
            <div className="panel-baslik">
              <h3>📋 Gider Kayıtları</h3>
              <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                <span className="text-sm text-muted">{filtrelenenler.length} kayıt</span>
                <span className="text-sm font-bold" style={{ color:'#EF4444' }}>
                  Toplam: ₺{filtrelenenler.reduce((s,g)=>s+g.tutar,0).toLocaleString('tr-TR')}
                </span>
              </div>
            </div>
            <div className="tablo-container">
              <table>
                <thead>
                  <tr>
                    <th>Kategori</th><th>Şube</th><th>Açıklama</th><th>Belge No</th>
                    <th>Tarih</th><th>Tutar (KDV Hariç)</th><th>KDV</th><th>Toplam</th><th>Durum</th><th>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrelenenler.map(g => {
                    const kat  = KAT_MAP[g.kategori];
                    const sube = subeler.find(s => s.id === g.subeId);
                    const sirket = sirketler.find(s => s.id === sube?.sirket_id);
                    return (
                      <tr key={g.id}>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                            <span style={{ width:'28px', height:'28px', borderRadius:'6px', background: kat?.renk+'20', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'15px', flexShrink:0 }}>{kat?.ikon}</span>
                            <div>
                              <div style={{ fontSize:'12px', fontWeight:'600', color:'#1E293B' }}>{kat?.label.split('(')[0].trim()}</div>
                              {g.altTip && <div style={{ fontSize:'11px', color:'#64748B' }}>{g.altTip}</div>}
                            </div>
                          </div>
                        </td>
                        <td><div className="text-sm">{sirket?.ikon} {sube?.ad || sube?.ilce}</div></td>
                        <td><div className="text-sm" style={{ maxWidth:'180px' }}>{g.aciklama}</div></td>
                        <td><span style={{ fontSize:'11px', background:'#F1F5F9', padding:'2px 6px', borderRadius:'4px', fontFamily:'monospace' }}>{g.belgeNo || '—'}</span></td>
                        <td className="text-sm">{g.tarih}</td>
                        <td className="para-kirmizi font-semibold">₺{g.tutar.toLocaleString('tr-TR')}</td>
                        <td className="text-sm text-muted">{g.kdv > 0 ? `₺${g.kdv.toLocaleString('tr-TR')}` : '—'}</td>
                        <td className="font-bold">₺{(g.tutar + (g.kdv||0)).toLocaleString('tr-TR')}</td>
                        <td>
                          <span className={`badge ${g.durum==='odendi'?'badge-yesil':'badge-sari'}`}>
                            {g.durum==='odendi' ? '✅ Ödendi' : '⏳ Bekliyor'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display:'flex', gap:'3px' }}>
                            <button className="btn btn-secondary btn-sm" title="Detay"   onClick={()=>setDetay(g)}>👁</button>
                            <button className="btn btn-secondary btn-sm" title="Düzenle" onClick={()=>acDuzenle(g)}>✏️</button>
                            {g.durum==='bekliyor' && <button className="btn btn-success btn-sm" title="Öde" onClick={()=>odendi(g.id)}>✅</button>}
                            <button className="btn btn-danger btn-sm"  title="Sil"      onClick={()=>setSilOnay(g)}>🗑️</button>
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

      {/* ═══════════════════════════════════════
          KATEGORİ ANALİZİ
      ═══════════════════════════════════════ */}
      {aktifTab === 'kategori' && (
        <>
          <div className="iki-kolon">
            {/* Pasta grafik */}
            <div className="panel">
              <div className="panel-baslik"><h3>🥧 Kategori Dağılımı</h3></div>
              <div className="panel-icerik">
                <div style={{ height:'280px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={katGrafik} cx="50%" cy="50%" innerRadius={55} outerRadius={100} paddingAngle={3} dataKey="value">
                        {katGrafik.map((entry,i) => <Cell key={i} fill={entry.renk} />)}
                      </Pie>
                      <Tooltip formatter={v=>[`₺${v.toLocaleString('tr-TR')}`,'']} />
                      <Legend formatter={v=><span style={{fontSize:'12px'}}>{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            {/* Kategori kartları */}
            <div className="panel">
              <div className="panel-baslik"><h3>📊 Kategori Detayı</h3></div>
              <div className="panel-icerik" style={{ overflowY:'auto', maxHeight:'320px' }}>
                {KATEGORILER.map(kat => {
                  const katGiderler = giderler.filter(g => g.kategori === kat.id);
                  const toplam = katGiderler.reduce((s,g)=>s+g.tutar,0);
                  if (toplam === 0) return null;
                  const oran = Math.round((toplam / toplamTutar) * 100);
                  return (
                    <div key={kat.id} style={{ marginBottom:'14px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                          <span>{kat.ikon}</span>
                          <span style={{ fontSize:'13px', fontWeight:'600' }}>{kat.label.split('(')[0].trim()}</span>
                          <span style={{ fontSize:'11px', color:'#94A3B8' }}>({katGiderler.length} kayıt)</span>
                        </div>
                        <span style={{ fontSize:'13px', fontWeight:'700', color: kat.renk }}>₺{toplam.toLocaleString('tr-TR')}</span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                        <div className="progress-bar" style={{ flex:1, height:'8px' }}>
                          <div className="progress-dolu" style={{ width:`${oran}%`, background: kat.renk }} />
                        </div>
                        <span style={{ fontSize:'11px', color:'#64748B', minWidth:'30px' }}>%{oran}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Şube bazlı gider tablosu */}
          <div className="panel">
            <div className="panel-baslik"><h3>🏢 Şube Bazlı Gider Dağılımı</h3></div>
            <div className="tablo-container">
              <table>
                <thead>
                  <tr>
                    <th>Şube</th>
                    {KATEGORILER.filter(k => giderler.some(g=>g.kategori===k.id)).map(k=>(
                      <th key={k.id} title={k.label}>{k.ikon}</th>
                    ))}
                    <th>TOPLAM</th>
                  </tr>
                </thead>
                <tbody>
                  {subeler.filter(s => giderler.some(g=>g.subeId===s.id)).map(sube => {
                    const sirket = sirketler.find(x=>x.id===sube.sirket_id);
                    const subeGiderler = giderler.filter(g=>g.subeId===sube.id);
                    const toplam = subeGiderler.reduce((s,g)=>s+g.tutar,0);
                    return (
                      <tr key={sube.id}>
                        <td><div className="font-semibold text-sm">{sirket?.ikon} {sube.ad||sube.ilce}</div></td>
                        {KATEGORILER.filter(k => giderler.some(g=>g.kategori===k.id)).map(k=>{
                          const t = subeGiderler.filter(g=>g.kategori===k.id).reduce((s,g)=>s+g.tutar,0);
                          return <td key={k.id} className="text-sm" style={{ color: t>0?k.renk:'#CBD5E1' }}>{t>0?`₺${t.toLocaleString('tr-TR')}`:'—'}</td>;
                        })}
                        <td className="font-bold para-kirmizi">₺{toplam.toLocaleString('tr-TR')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════
          AYLIK TREND
      ═══════════════════════════════════════ */}
      {aktifTab === 'aylik' && (
        <div className="panel">
          <div className="panel-baslik"><h3>📈 Aylık Gider Trendi</h3></div>
          <div className="panel-icerik">
            <div style={{ height:'300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aylikGrafik}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="ay" tick={{ fontSize:12 }} />
                  <YAxis tickFormatter={v=>`₺${(v/1000).toFixed(0)}K`} tick={{ fontSize:11 }} />
                  <Tooltip formatter={v=>[`₺${v.toLocaleString('tr-TR')}`, 'Toplam Gider']} />
                  <Bar dataKey="tutar" name="Gider" fill="#EF4444" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Aylık kategori breakdown */}
          <div className="panel-icerik" style={{ borderTop:'1px solid #F1F5F9' }}>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
                <thead>
                  <tr>
                    <th style={{ background:'#F8FAFC', padding:'8px 12px', textAlign:'left', fontSize:'11px', fontWeight:'600', color:'#64748B', borderBottom:'1px solid #E2E8F0' }}>Kategori</th>
                    {AYLAR.slice(0,6).map(ay => (
                      <th key={ay} style={{ background:'#F8FAFC', padding:'8px 12px', textAlign:'right', fontSize:'11px', fontWeight:'600', color:'#64748B', borderBottom:'1px solid #E2E8F0' }}>{ay}</th>
                    ))}
                    <th style={{ background:'#F8FAFC', padding:'8px 12px', textAlign:'right', fontSize:'11px', fontWeight:'600', color:'#1E293B', borderBottom:'1px solid #E2E8F0' }}>TOPLAM</th>
                  </tr>
                </thead>
                <tbody>
                  {KATEGORILER.map(kat => {
                    const satir = AYLAR.slice(0,6).map((_,i) =>
                      giderler.filter(g => g.kategori===kat.id && new Date(g.tarih).getMonth()===i).reduce((s,g)=>s+g.tutar,0)
                    );
                    const satirToplam = satir.reduce((s,v)=>s+v,0);
                    if (satirToplam === 0) return null;
                    return (
                      <tr key={kat.id} style={{ borderBottom:'1px solid #F1F5F9' }}>
                        <td style={{ padding:'8px 12px' }}>
                          <span style={{ fontSize:'14px', marginRight:'6px' }}>{kat.ikon}</span>
                          <span style={{ fontWeight:'600', fontSize:'13px' }}>{kat.label.split('(')[0].trim()}</span>
                        </td>
                        {satir.map((v,i) => (
                          <td key={i} style={{ padding:'8px 12px', textAlign:'right', color: v>0?kat.renk:'#CBD5E1' }}>
                            {v>0 ? `₺${v.toLocaleString('tr-TR')}` : '—'}
                          </td>
                        ))}
                        <td style={{ padding:'8px 12px', textAlign:'right', fontWeight:'700', color: kat.renk }}>₺{satirToplam.toLocaleString('tr-TR')}</td>
                      </tr>
                    );
                  })}
                  {/* toplam satırı */}
                  <tr style={{ background:'#F8FAFC', borderTop:'2px solid #E2E8F0' }}>
                    <td style={{ padding:'10px 12px', fontWeight:'700' }}>TOPLAM</td>
                    {AYLAR.slice(0,6).map((_,i)=>{
                      const v = giderler.filter(g=>new Date(g.tarih).getMonth()===i).reduce((s,g)=>s+g.tutar,0);
                      return <td key={i} style={{ padding:'10px 12px', textAlign:'right', fontWeight:'700', color:'#EF4444' }}>{v>0?`₺${v.toLocaleString('tr-TR')}`:'—'}</td>;
                    })}
                    <td style={{ padding:'10px 12px', textAlign:'right', fontWeight:'700', color:'#EF4444', fontSize:'15px' }}>₺{toplamTutar.toLocaleString('tr-TR')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          ÖDEME TAKVİMİ
      ═══════════════════════════════════════ */}
      {aktifTab === 'takvim' && (
        <div className="panel">
          <div className="panel-baslik">
            <h3>📅 Bekleyen & Yaklaşan Ödemeler</h3>
            <span className="badge badge-sari">
              ₺{giderler.filter(g=>g.durum==='bekliyor').reduce((s,g)=>s+g.tutar,0).toLocaleString('tr-TR')} bekliyor
            </span>
          </div>
          <div className="tablo-container">
            <table>
              <thead>
                <tr><th>Kategori</th><th>Şube</th><th>Açıklama</th><th>Son Ödeme</th><th>Tutar</th><th>Durum</th><th>İşlem</th></tr>
              </thead>
              <tbody>
                {giderler.filter(g=>g.durum==='bekliyor').sort((a,b)=>new Date(a.tarih)-new Date(b.tarih)).map(g=>{
                  const kat  = KAT_MAP[g.kategori];
                  const sube = subeler.find(s=>s.id===g.subeId);
                  const sirket = sirketler.find(s=>s.id===sube?.sirket_id);
                  const gecmis = new Date(g.tarih) < new Date();
                  return (
                    <tr key={g.id} style={{ background: gecmis ? '#FFF5F5' : 'white' }}>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                          <span>{kat?.ikon}</span>
                          <div>
                            <div style={{ fontSize:'12px', fontWeight:'600' }}>{kat?.label.split('(')[0].trim()}</div>
                            {g.altTip && <div style={{ fontSize:'11px', color:'#64748B' }}>{g.altTip}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="text-sm">{sirket?.ikon} {sube?.ad||sube?.ilce}</td>
                      <td className="text-sm">{g.aciklama}</td>
                      <td>
                        <span style={{ color: gecmis?'#EF4444':'#374151', fontWeight: gecmis?'700':'400', fontSize:'13px' }}>
                          {gecmis && '⚠️ '}{g.tarih}
                        </span>
                      </td>
                      <td className="para-kirmizi font-bold">₺{g.tutar.toLocaleString('tr-TR')}</td>
                      <td><span className="badge badge-sari">⏳ Bekliyor</span></td>
                      <td>
                        <div style={{ display:'flex', gap:'4px' }}>
                          <button className="btn btn-success btn-sm" onClick={()=>odendi(g.id)}>✅ Öde</button>
                          <button className="btn btn-secondary btn-sm" onClick={()=>acDuzenle(g)}>✏️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {giderler.filter(g=>g.durum==='bekliyor').length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign:'center', padding:'40px', color:'#64748B' }}>✅ Bekleyen ödeme yok</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          GİDER EKLE / DÜZENLE MODAL
      ═══════════════════════════════════════ */}
      <Modal
        acik={yeniModal || !!duzenleModal}
        kapat={() => { setYeniModal(false); setDuzenle(null); setForm(BOSfORM); }}
        baslik={duzenleModal ? '✏️ Gider Düzenle' : '+ Yeni Gider Ekle'}
        genislik="620px"
      >
        {/* Kategori seçici (büyük butonlar) */}
        {!form.kategori ? (
          <div>
            <p style={{ fontSize:'14px', color:'#374151', marginBottom:'16px', fontWeight:'600' }}>Gider Kategorisi Seçin:</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'10px' }}>
              {KATEGORILER.map(k => (
                <button key={k.id}
                  onClick={() => setForm(p => ({ ...p, kategori: k.id }))}
                  style={{ background:'white', border:`2px solid ${k.renk}30`, borderRadius:'10px', padding:'14px 10px', cursor:'pointer', textAlign:'center', transition:'all 0.15s', display:'flex', flexDirection:'column', alignItems:'center', gap:'6px' }}
                  onMouseEnter={e => { e.currentTarget.style.background = k.renk+'12'; e.currentTarget.style.borderColor = k.renk; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = k.renk+'30'; }}
                >
                  <span style={{ fontSize:'26px' }}>{k.ikon}</span>
                  <span style={{ fontSize:'12px', fontWeight:'600', color:'#1E293B', lineHeight:'1.3' }}>{k.label.split('(')[0].trim()}</span>
                  <span style={{ fontSize:'10px', color:'#94A3B8', lineHeight:'1.2' }}>{k.aciklama}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            {/* Kategori değiştir butonu */}
            <div style={{ display:'flex', alignItems:'center', gap:'10px', background: KAT_MAP[form.kategori]?.renk+'15', borderRadius:'8px', padding:'10px 14px', marginBottom:'16px' }}>
              <span style={{ fontSize:'22px' }}>{KAT_MAP[form.kategori]?.ikon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:'700', color:'#1E293B' }}>{KAT_MAP[form.kategori]?.label}</div>
                <div style={{ fontSize:'12px', color:'#64748B' }}>{KAT_MAP[form.kategori]?.aciklama}</div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setForm(p => ({ ...p, kategori:'', altTip:'' }))}>↩ Değiştir</button>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
              <GiderInp label="Şube" name="subeId" zorunlu form={form} setForm={setForm} options={subeler.map(s => { const sr = sirketler.find(x=>x.id===s.sirket_id); return { value: s.id, label: `${sr?.ikon||'🏢'} ${s.ad||s.ilce||''}` }; })} />
              {altTipler.length > 0
                ? <GiderInp label="Alt Tip" name="altTip" form={form} setForm={setForm} options={altTipler.map(t => ({ value: t, label: t }))} />
                : <GiderInp label="Alt Tip / Açıklama" name="altTip" form={form} setForm={setForm} />
              }
              <GiderInp label="Tarih" name="tarih" tip="date" zorunlu form={form} setForm={setForm} />
              <GiderInp label="Belge / Fatura No" name="belgeNo" form={form} setForm={setForm} />

              {/* KDV DAHİL tutar + oran → matrah otomatik hesaplanır */}
              <GiderInp label="Tutar (KDV Dahil) ₺ *" name="tutar" tip="number" zorunlu form={form} setForm={setForm} />
              <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                <label style={{ fontSize:'12px', fontWeight:'600', color:'#374151' }}>KDV Oranı (%)</label>
                <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
                  {[0,10,20].map(o => (
                    <button key={o} type="button"
                      onClick={() => setForm(p => ({ ...p, kdvOrani: o.toString() }))}
                      style={{ padding:'7px 14px', borderRadius:'8px', border:'1.5px solid', fontSize:'13px', fontWeight:'700', cursor:'pointer',
                        background: String(form.kdvOrani)===String(o) ? '#3B82F6' : 'white',
                        borderColor: String(form.kdvOrani)===String(o) ? '#3B82F6' : '#CBD5E1',
                        color: String(form.kdvOrani)===String(o) ? 'white' : '#374151' }}>
                      %{o}
                    </button>
                  ))}
                  <input type="number" min="0" max="100" value={form.kdvOrani || ''}
                    onChange={e => setForm(p => ({ ...p, kdvOrani: e.target.value }))}
                    style={{ width:'60px', padding:'7px 8px', border:'1.5px solid #CBD5E1', borderRadius:'8px', fontSize:'13px', textAlign:'center', outline:'none' }} />
                </div>
              </div>

              {kdvDahilTutar > 0 && (
                <div style={{ gridColumn:'1/-1', background:'linear-gradient(135deg,#EFF6FF,#DBEAFE)', borderRadius:'10px', padding:'14px 16px', border:'1.5px solid #93C5FD' }}>
                  <div style={{ fontSize:'12px', fontWeight:'700', color:'#1D4ED8', marginBottom:'10px' }}>🔢 KDV Hesabı</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px' }}>
                    <div style={{ background:'white', borderRadius:'8px', padding:'10px', border:'1px solid #BFDBFE', textAlign:'center' }}>
                      <div style={{ fontSize:'10px', color:'#64748B', fontWeight:'700', textTransform:'uppercase', marginBottom:'3px' }}>Matrah (KDV Hariç)</div>
                      <div style={{ fontSize:'16px', fontWeight:'800', color:'#1E293B' }}>₺{matrahHesap.toLocaleString('tr-TR')}</div>
                    </div>
                    <div style={{ background:'white', borderRadius:'8px', padding:'10px', border:'1px solid #BFDBFE', textAlign:'center' }}>
                      <div style={{ fontSize:'10px', color:'#64748B', fontWeight:'700', textTransform:'uppercase', marginBottom:'3px' }}>KDV (%{kdvOraniVal})</div>
                      <div style={{ fontSize:'16px', fontWeight:'800', color:'#2563EB' }}>₺{kdvTutarHesap.toLocaleString('tr-TR')}</div>
                    </div>
                    <div style={{ background:'linear-gradient(135deg,#1D4ED8,#1E40AF)', borderRadius:'8px', padding:'10px', textAlign:'center' }}>
                      <div style={{ fontSize:'10px', color:'#BFDBFE', fontWeight:'700', textTransform:'uppercase', marginBottom:'3px' }}>KDV Dahil</div>
                      <div style={{ fontSize:'16px', fontWeight:'800', color:'white' }}>₺{kdvDahilTutar.toLocaleString('tr-TR')}</div>
                    </div>
                  </div>
                </div>
              )}

              <GiderInp label="Ödeme Durumu" name="durum" form={form} setForm={setForm} options={[{value:'odendi',label:'✅ Ödendi'},{value:'bekliyor',label:'⏳ Bekliyor'}]} />
              <GiderInp label="Tekrar" name="tekrar" form={form} setForm={setForm} options={[
                {value:'tek_sefer',label:'Tek Seferlik'},
                {value:'aylik',label:'Aylık Tekrar'},
                {value:'3_aylik',label:'3 Aylık'},
                {value:'yillik',label:'Yıllık'},
              ]} />
              <GiderInp label="Açıklama / Not" name="aciklama" tam form={form} setForm={setForm} />
            </div>

            <div style={{ display:'flex', gap:'8px', marginTop:'20px', justifyContent:'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => { setYeniModal(false); setDuzenle(null); setForm(BOSfORM); }}>İptal</button>
              <button className="btn btn-primary" onClick={kaydet}>{duzenleModal ? '💾 Güncelle' : '✅ Kaydet'}</button>
            </div>
          </div>
        )}
      </Modal>

      {/* ═══════════════════════════════════════
          DETAY MODAL
      ═══════════════════════════════════════ */}
      <Modal acik={!!detayModal} kapat={() => setDetay(null)} baslik="📋 Gider Detayı" genislik="500px">
        {detayModal && (() => {
          const kat  = KAT_MAP[detayModal.kategori];
          const sube = subeler.find(s => s.id === detayModal.subeId);
          const sirket = sirketler.find(s => s.id === sube?.sirket_id);
          return (
            <>
              <div style={{ display:'flex', alignItems:'center', gap:'14px', background: kat?.renk+'15', borderRadius:'10px', padding:'16px', marginBottom:'20px' }}>
                <span style={{ fontSize:'36px' }}>{kat?.ikon}</span>
                <div>
                  <div style={{ fontSize:'16px', fontWeight:'700', color:'#1E293B' }}>{kat?.label}</div>
                  {detayModal.altTip && <div style={{ fontSize:'13px', color:'#64748B' }}>{detayModal.altTip}</div>}
                </div>
                <span className={`badge ${detayModal.durum==='odendi'?'badge-yesil':'badge-sari'}`} style={{ marginLeft:'auto' }}>
                  {detayModal.durum==='odendi'?'✅ Ödendi':'⏳ Bekliyor'}
                </span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'20px' }}>
                <InfoSatir etiket="Şube" deger={`${sirket?.ikon||''} ${sube?.ad||sube?.ilce||'—'}`} />
                <InfoSatir etiket="Tarih" deger={detayModal.tarih} />
                <InfoSatir etiket="Belge / Fatura No" deger={detayModal.belgeNo} />
                <InfoSatir etiket="Tekrar" deger={detayModal.tekrar === 'tek_sefer' ? 'Tek Seferlik' : detayModal.tekrar === 'aylik' ? 'Aylık' : detayModal.tekrar} />
                <InfoSatir etiket="Tutar (KDV Hariç)" deger={`₺${detayModal.tutar.toLocaleString('tr-TR')}`} renk="#EF4444" />
                <InfoSatir etiket="KDV" deger={detayModal.kdv > 0 ? `₺${detayModal.kdv.toLocaleString('tr-TR')}` : '—'} />
              </div>
              <div style={{ background:'linear-gradient(135deg,#1E3A5F,#0F2140)', borderRadius:'10px', padding:'16px', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
                <span style={{ color:'white', fontWeight:'600' }}>KDV Dahil Toplam</span>
                <span style={{ color:'#FCA5A5', fontSize:'22px', fontWeight:'700' }}>₺{(detayModal.tutar + (detayModal.kdv||0)).toLocaleString('tr-TR')}</span>
              </div>
              {detayModal.aciklama && (
                <div style={{ background:'#F8FAFC', borderRadius:'8px', padding:'12px', marginBottom:'16px', fontSize:'13px', color:'#374151' }}>
                  📝 {detayModal.aciklama}
                </div>
              )}
              <div style={{ display:'flex', gap:'8px' }}>
                <button className="btn btn-primary" style={{ flex:1 }} onClick={() => { setDetay(null); acDuzenle(detayModal); }}>✏️ Düzenle</button>
                {detayModal.durum === 'bekliyor' && (
                  <button className="btn btn-success" style={{ flex:1 }} onClick={() => { odendi(detayModal.id); setDetay(null); }}>✅ Öde</button>
                )}
                <button className="btn btn-danger btn-sm" onClick={() => { setDetay(null); setSilOnay(detayModal); }}>🗑️</button>
              </div>
            </>
          );
        })()}
      </Modal>

      {/* ═══════════════════════════════════════
          SİL ONAY MODAL
      ═══════════════════════════════════════ */}
      <Modal acik={!!silOnay} kapat={() => setSilOnay(null)} baslik="🗑️ Gider Sil" genislik="380px">
        {silOnay && (
          <>
            <div style={{ textAlign:'center', padding:'8px 0 20px' }}>
              <div style={{ fontSize:'48px', marginBottom:'12px' }}>⚠️</div>
              <p style={{ fontSize:'15px', color:'#374151' }}>
                <b>{KAT_MAP[silOnay.kategori]?.ikon} {silOnay.aciklama || KAT_MAP[silOnay.kategori]?.label}</b> kaydını silmek istiyor musunuz?
              </p>
              <p style={{ fontSize:'16px', color:'#EF4444', fontWeight:'700', marginTop:'8px' }}>₺{silOnay.tutar.toLocaleString('tr-TR')}</p>
              <p style={{ fontSize:'13px', color:'#94A3B8', marginTop:'4px' }}>Bu işlem geri alınamaz!</p>
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
