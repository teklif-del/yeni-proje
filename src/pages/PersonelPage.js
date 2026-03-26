import React, { useState } from 'react';
import { PERSONEL, SUBELER, SIRKETLER } from '../data/mockData';
import {
  MAAS_ODEMELERI, IZIN_KAYITLARI, MESAI_KAYITLARI,
  GEC_GELME_KAYITLARI, IZIN_HAKLARI, tazminatHesapla, AYLAR
} from '../data/personelData';
import Modal from '../components/Modal';

const bosPersonelForm = { ad: '', soyad: '', pozisyon: '', maas: '', telefon: '', email: '', subeId: '', iseGirisTarihi: '', aktif: true };
const POZISYONLAR = ['Müdür', 'Sürücü Eğitmeni', 'SRC Eğitmeni', 'TMGD Eğitmeni', 'İş Makinesi Eğitmeni', 'Psikolog', 'Muhasebe', 'Sekreter', 'Güvenlik', 'Temizlik', 'Diğer'];

/* ── küçük yardımcılar ── */
function InfoSatir({ etiket, deger, renk }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', background: '#F8FAFC', borderRadius: '8px', padding: '11px 14px' }}>
      <span style={{ fontSize: '11px', color: '#64748B', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{etiket}</span>
      <span style={{ fontSize: '14px', fontWeight: '600', color: renk || '#1E293B' }}>{deger || '—'}</span>
    </div>
  );
}

function SekmeBar({ tabs, aktif, setAktif }) {
  return (
    <div className="tab-bar" style={{ marginBottom: '20px' }}>
      {tabs.map(t => (
        <div key={t.id} className={`tab-item ${aktif === t.id ? 'aktif' : ''}`} onClick={() => setAktif(t.id)}>
          {t.label}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ANA BİLEŞEN
───────────────────────────────────────────────────────────── */
function PersonelPage() {
  /* liste state */
  const [personelListe, setPersonelListe] = useState(PERSONEL);
  const [maaslar, setMaaslar] = useState(MAAS_ODEMELERI);
  const [izinler, setIzinler] = useState(IZIN_KAYITLARI);
  const [mesailer, setMesailer] = useState(MESAI_KAYITLARI);
  const [gecGelmeler, setGecGelmeler] = useState(GEC_GELME_KAYITLARI);
  const [izinHaklari] = useState(IZIN_HAKLARI);

  /* filtre */
  const [aramaMetni, setAramaMetni] = useState('');
  const [sirketFiltre, setSirketFiltre] = useState('tumu');

  /* sayfanın ana sekmesi */
  const [anaSekme, setAnaSekme] = useState('liste');

  /* modallar */
  const [secilenPersonel, setSecilenPersonel] = useState(null);
  const [detaySekme, setDetaySekme] = useState('ozet');

  const [personelForm, setPersonelForm] = useState(bosPersonelForm);
  const [personelDuzenle, setPersonelDuzenle] = useState(null);
  const [personelYeni, setPersonelYeni] = useState(false);
  const [silOnay, setSilOnay] = useState(null);

  /* ödeme modal */
  const [odemeModal, setOdemeModal] = useState(false);
  const [odemeForm, setOdemeForm] = useState({ personelId: '', yil: 2025, ay: new Date().getMonth() + 1, brutMaas: '', mesaiUcreti: '', ikramiye: '', kesintiler: '', not: '', odenmeTarihi: new Date().toISOString().split('T')[0] });

  /* izin modal */
  const [izinModal, setIzinModal] = useState(false);
  const [izinForm, setIzinForm] = useState({ personelId: '', tip: 'yillik', baslangic: '', bitis: '', gun: '', aciklama: '' });

  /* mesai modal */
  const [mesaiModal, setMesaiModal] = useState(false);
  const [mesaiForm, setMesaiForm] = useState({ personelId: '', tarih: '', saat: '', ucretPerSaat: '', aciklama: '' });

  /* geç gelme modal */
  const [gecModal, setGecModal] = useState(false);
  const [gecForm, setGecForm] = useState({ personelId: '', tarih: '', tip: 'gec_gelme', dakika: '', kesinti: '', aciklama: '' });

  /* ── filtreli liste ── */
  const filtrelenenler = personelListe.filter(p => {
    const esles = aramaMetni === '' || `${p.ad} ${p.soyad}`.toLowerCase().includes(aramaMetni.toLowerCase()) || p.pozisyon.toLowerCase().includes(aramaMetni.toLowerCase());
    const sube = SUBELER.find(s => s.id === p.subeId);
    return esles && (sirketFiltre === 'tumu' || sube?.sirketId === parseInt(sirketFiltre));
  });

  /* ── hesaplamalar ── */
  const toplamMaas = personelListe.reduce((s, p) => s + p.maas, 0);
  const bekleyenOdeme = maaslar.filter(m => m.durum === 'bekliyor').length;

  /* ── personel form kaydet ── */
  const personelKaydet = () => {
    if (!personelForm.ad || !personelForm.soyad) { alert('Ad ve Soyad zorunludur!'); return; }
    if (personelDuzenle) {
      setPersonelListe(prev => prev.map(p => p.id === personelDuzenle.id ? { ...personelDuzenle, ...personelForm, subeId: parseInt(personelForm.subeId), maas: parseInt(personelForm.maas) || 0 } : p));
      setPersonelDuzenle(null);
    } else {
      setPersonelListe(prev => [{ ...personelForm, id: Date.now(), subeId: parseInt(personelForm.subeId), maas: parseInt(personelForm.maas) || 0, aktif: true }, ...prev]);
      setPersonelYeni(false);
    }
    setPersonelForm(bosPersonelForm);
  };

  const personelSil = (id) => { setPersonelListe(prev => prev.filter(p => p.id !== id)); setSilOnay(null); setSecilenPersonel(null); };
  const acDuzenle = (p) => { setPersonelForm({ ...p, subeId: p.subeId?.toString(), maas: p.maas?.toString() }); setPersonelDuzenle(p); };

  /* ── maaş kaydet ── */
  const odemeKaydet = () => {
    if (!odemeForm.personelId || !odemeForm.brutMaas) { alert('Personel ve brüt maaş zorunludur!'); return; }
    const brut = parseInt(odemeForm.brutMaas) || 0;
    const kes = parseInt(odemeForm.kesintiler) || Math.round(brut * 0.17);
    const mesai = parseInt(odemeForm.mesaiUcreti) || 0;
    const ikr = parseInt(odemeForm.ikramiye) || 0;
    const net = brut - kes + mesai + ikr;
    const yeni = { ...odemeForm, id: Date.now(), personelId: parseInt(odemeForm.personelId), brutMaas: brut, kesintiler: kes, netMaas: net, mesaiUcreti: mesai, ikramiye: ikr, durum: 'odendi' };
    setMaaslar(prev => [yeni, ...prev]);
    setOdemeModal(false);
    setOdemeForm({ personelId: '', yil: 2025, ay: new Date().getMonth() + 1, brutMaas: '', mesaiUcreti: '', ikramiye: '', kesintiler: '', not: '', odenmeTarihi: new Date().toISOString().split('T')[0] });
  };

  /* ── izin kaydet ── */
  const izinKaydet = () => {
    if (!izinForm.personelId || !izinForm.baslangic) { alert('Personel ve başlangıç tarihi zorunludur!'); return; }
    const bas = new Date(izinForm.baslangic), bit = new Date(izinForm.bitis || izinForm.baslangic);
    const gun = izinForm.gun || Math.round((bit - bas) / (1000 * 60 * 60 * 24)) + 1;
    setIzinler(prev => [{ ...izinForm, id: Date.now(), personelId: parseInt(izinForm.personelId), gun, durum: 'bekliyor', onaylayan: '' }, ...prev]);
    setIzinModal(false);
    setIzinForm({ personelId: '', tip: 'yillik', baslangic: '', bitis: '', gun: '', aciklama: '' });
  };

  /* ── mesai kaydet ── */
  const mesaiKaydet = () => {
    if (!mesaiForm.personelId || !mesaiForm.saat) { alert('Personel ve saat zorunludur!'); return; }
    const saat = parseFloat(mesaiForm.saat);
    const ucret = parseFloat(mesaiForm.ucretPerSaat) || 0;
    setMesailer(prev => [{ ...mesaiForm, id: Date.now(), personelId: parseInt(mesaiForm.personelId), saat, ucretPerSaat: ucret, toplam: Math.round(saat * ucret), durum: 'bekliyor' }, ...prev]);
    setMesaiModal(false);
    setMesaiForm({ personelId: '', tarih: '', saat: '', ucretPerSaat: '', aciklama: '' });
  };

  /* ── geç gelme kaydet ── */
  const gecKaydet = () => {
    if (!gecForm.personelId || !gecForm.tarih) { alert('Personel ve tarih zorunludur!'); return; }
    setGecGelmeler(prev => [{ ...gecForm, id: Date.now(), personelId: parseInt(gecForm.personelId), dakika: parseInt(gecForm.dakika) || 0, kesinti: parseInt(gecForm.kesinti) || 0 }, ...prev]);
    setGecModal(false);
    setGecForm({ personelId: '', tarih: '', tip: 'gec_gelme', dakika: '', kesinti: '', aciklama: '' });
  };

  /* ── izin onayla ── */
  const izinOnayla = (id) => setIzinler(prev => prev.map(i => i.id === id ? { ...i, durum: 'onaylandi', onaylayan: 'Genel Müdür' } : i));
  const izinReddet = (id) => setIzinler(prev => prev.map(i => i.id === id ? { ...i, durum: 'reddedildi' } : i));

  /* ─── yardımcı input bileşeni ─── */
  const Input = ({ label, name, form, setForm, tip = 'text', options, tam, zorunlu }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', gridColumn: tam ? '1 / -1' : undefined }}>
      <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>{label}{zorunlu && ' *'}</label>
      {options ? (
        <select className="secim-input" style={{ padding: '9px 12px' }} value={form[name] || ''}
          onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))}>
          <option value="">Seçin...</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input className="arama-input" style={{ minWidth: 0 }} type={tip}
          value={form[name] || ''}
          onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))}
          placeholder={label} />
      )}
    </div>
  );

  /* ================================================================
     RENDER
  ================================================================ */
  return (
    <div>
      <div className="sayfa-baslik">
        <h1>👥 Personel Yönetimi</h1>
        <p>Maaş, izin, mesai ve tazminat takibi</p>
      </div>

      {/* Özet Kartlar */}
      <div className="ozet-kartlar">
        {[
          { ikon: '👥', label: 'Toplam Personel', deger: personelListe.length, bg: '#DBEAFE', renk: '#3B82F6' },
          { ikon: '✅', label: 'Aktif Personel', deger: personelListe.filter(p => p.aktif).length, bg: '#DCFCE7', renk: '#10B981' },
          { ikon: '💰', label: 'Aylık Maaş Gideri', deger: `₺${toplamMaas.toLocaleString('tr-TR')}`, bg: '#FEE2E2', renk: '#EF4444' },
          { ikon: '⏳', label: 'Bekleyen Ödeme', deger: bekleyenOdeme, bg: '#FEF9C3', renk: '#F59E0B' },
          { ikon: '🏖️', label: 'Aktif İzinler', deger: izinler.filter(i => i.durum === 'onaylandi' && new Date(i.bitis) >= new Date()).length, bg: '#EDE9FE', renk: '#8B5CF6' },
          { ikon: '⏰', label: 'Bekleyen Mesai', deger: mesailer.filter(m => m.durum === 'bekliyor').length, bg: '#CFFAFE', renk: '#06B6D4' },
        ].map(k => (
          <div key={k.label} className="ozet-kart">
            <div className="kart-ikon" style={{ background: k.bg }}>{k.ikon}</div>
            <div className="kart-bilgi"><h3 style={{ color: k.renk }}>{k.deger}</h3><p>{k.label}</p></div>
          </div>
        ))}
      </div>

      {/* Ana Sekmeler */}
      <SekmeBar
        tabs={[
          { id: 'liste', label: '👥 Personel Listesi' },
          { id: 'maas', label: '💰 Maaş Ödemeleri' },
          { id: 'izin', label: '🏖️ İzin Yönetimi' },
          { id: 'mesai', label: '⏰ Mesai Takibi' },
          { id: 'devamsizlik', label: '⚠️ Geç Gelme / Devamsızlık' },
        ]}
        aktif={anaSekme}
        setAktif={setAnaSekme}
      />

      {/* ──────────────────── PERSONEL LİSTESİ ──────────────────── */}
      {anaSekme === 'liste' && (
        <>
          <div className="filtre-bar">
            <input className="arama-input" placeholder="🔍 Personel adı veya pozisyon ara..." value={aramaMetni} onChange={e => setAramaMetni(e.target.value)} />
            <select className="secim-input" value={sirketFiltre} onChange={e => setSirketFiltre(e.target.value)}>
              <option value="tumu">Tüm Şirketler</option>
              {SIRKETLER.map(s => <option key={s.id} value={s.id}>{s.ikon} {s.ad.split(' ')[0]}</option>)}
            </select>
            <button className="btn btn-primary" onClick={() => { setPersonelForm(bosPersonelForm); setPersonelYeni(true); }}>+ Personel Ekle</button>
          </div>
          <div className="panel">
            <div className="panel-baslik">
              <h3>📋 Personel Listesi</h3>
              <span className="text-sm text-muted">{filtrelenenler.length} personel</span>
            </div>
            <div className="tablo-container">
              <table>
                <thead>
                  <tr><th>Personel</th><th>Pozisyon</th><th>Şube</th><th>Maaş</th><th>İşe Giriş</th><th>İzin Hakkı</th><th>Durum</th><th>İşlem</th></tr>
                </thead>
                <tbody>
                  {filtrelenenler.map(p => {
                    const sube = SUBELER.find(s => s.id === p.subeId);
                    const sirket = SIRKETLER.find(s => s.id === sube?.sirketId);
                    const izinHak = izinHaklari.find(h => h.personelId === p.id);
                    return (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: (sirket?.renk || '#3B82F6') + '25', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: sirket?.renk || '#3B82F6', flexShrink: 0 }}>
                              {p.ad[0]}{p.soyad[0]}
                            </div>
                            <div>
                              <div className="font-semibold">{p.ad} {p.soyad}</div>
                              <div className="text-xs text-muted">📞 {p.telefon}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="badge badge-mor">{p.pozisyon}</span></td>
                        <td><div className="text-sm">{sirket?.ikon} {sube?.ilce}</div></td>
                        <td><span className="para-yesil">₺{p.maas.toLocaleString('tr-TR')}</span></td>
                        <td className="text-sm">{p.iseGirisTarihi}</td>
                        <td>
                          {izinHak ? (
                            <div>
                              <div className="text-xs font-semibold">{izinHak.kalanGun} / {izinHak.yillikHak} gün</div>
                              <div className="progress-bar" style={{ marginTop: '3px' }}>
                                <div className="progress-dolu" style={{ width: `${(izinHak.kullanilanGun / izinHak.yillikHak) * 100}%`, background: '#8B5CF6' }} />
                              </div>
                            </div>
                          ) : '—'}
                        </td>
                        <td><span className={`badge ${p.aktif ? 'badge-yesil' : 'badge-kirmizi'}`}>{p.aktif ? '✅ Aktif' : '❌ Pasif'}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button className="btn btn-secondary btn-sm" title="Detay" onClick={() => { setSecilenPersonel(p); setDetaySekme('ozet'); }}>👁</button>
                            <button className="btn btn-secondary btn-sm" title="Düzenle" onClick={() => acDuzenle(p)}>✏️</button>
                            <button className="btn btn-danger btn-sm" title="Sil" onClick={() => setSilOnay(p)}>🗑️</button>
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

      {/* ──────────────────── MAAŞ ÖDEMELERİ ──────────────────── */}
      {anaSekme === 'maas' && (
        <div className="panel">
          <div className="panel-baslik">
            <h3>💰 Maaş Ödemeleri</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setOdemeModal(true)}>+ Ödeme Ekle</button>
          </div>
          <div className="tablo-container">
            <table>
              <thead>
                <tr><th>Personel</th><th>Dönem</th><th>Brüt Maaş</th><th>Mesai</th><th>İkramiye</th><th>Kesinti</th><th>Net Maaş</th><th>Durum</th><th>Tarih</th></tr>
              </thead>
              <tbody>
                {maaslar.map(m => {
                  const p = personelListe.find(x => x.id === m.personelId);
                  const toplam = m.netMaas + m.mesaiUcreti + m.ikramiye;
                  return (
                    <tr key={m.id}>
                      <td>
                        <div className="font-semibold">{p?.ad} {p?.soyad}</div>
                        <div className="text-xs text-muted">{p?.pozisyon}</div>
                      </td>
                      <td><span className="badge badge-gri">{AYLAR[m.ay]} {m.yil}</span></td>
                      <td>₺{m.brutMaas.toLocaleString('tr-TR')}</td>
                      <td className={m.mesaiUcreti > 0 ? 'para-yesil' : 'text-muted'}>
                        {m.mesaiUcreti > 0 ? `+₺${m.mesaiUcreti.toLocaleString('tr-TR')}` : '—'}
                      </td>
                      <td className={m.ikramiye > 0 ? 'para-yesil' : 'text-muted'}>
                        {m.ikramiye > 0 ? `+₺${m.ikramiye.toLocaleString('tr-TR')}` : '—'}
                      </td>
                      <td className="para-kirmizi">-₺{m.kesintiler.toLocaleString('tr-TR')}</td>
                      <td><span className="font-bold">₺{(m.netMaas + m.mesaiUcreti + m.ikramiye).toLocaleString('tr-TR')}</span></td>
                      <td>
                        <span className={`badge ${m.durum === 'odendi' ? 'badge-yesil' : 'badge-sari'}`}>
                          {m.durum === 'odendi' ? '✅ Ödendi' : '⏳ Bekliyor'}
                        </span>
                      </td>
                      <td className="text-sm text-muted">{m.odenmeTarihi || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──────────────────── İZİN YÖNETİMİ ──────────────────── */}
      {anaSekme === 'izin' && (
        <>
          {/* İzin Hakları Kartları */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            {personelListe.map(p => {
              const hak = izinHaklari.find(h => h.personelId === p.id) || { yillikHak: 14, kullanilanGun: 0, kalanGun: 14 };
              const sube = SUBELER.find(s => s.id === p.subeId);
              const sirket = SIRKETLER.find(s => s.id === sube?.sirketId);
              return (
                <div key={p.id} style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: (sirket?.renk || '#3B82F6') + '25', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px', color: sirket?.renk || '#3B82F6' }}>
                      {p.ad[0]}{p.soyad[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>{p.ad} {p.soyad}</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>{p.pozisyon}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                    <span className="text-muted">Yıllık Hak: <b>{hak.yillikHak} gün</b></span>
                    <span style={{ color: hak.kalanGun > 5 ? '#10B981' : '#EF4444', fontWeight: '700' }}>Kalan: {hak.kalanGun}</span>
                  </div>
                  <div className="progress-bar" style={{ height: '8px' }}>
                    <div className="progress-dolu" style={{ width: `${(hak.kullanilanGun / hak.yillikHak) * 100}%`, background: hak.kalanGun <= 5 ? '#EF4444' : '#8B5CF6' }} />
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>Kullanılan: {hak.kullanilanGun} gün</div>
                </div>
              );
            })}
          </div>

          <div className="panel">
            <div className="panel-baslik">
              <h3>🏖️ İzin Kayıtları</h3>
              <button className="btn btn-primary btn-sm" onClick={() => setIzinModal(true)}>+ İzin Ekle</button>
            </div>
            <div className="tablo-container">
              <table>
                <thead>
                  <tr><th>Personel</th><th>İzin Tipi</th><th>Başlangıç</th><th>Bitiş</th><th>Süre</th><th>Açıklama</th><th>Durum</th><th>İşlem</th></tr>
                </thead>
                <tbody>
                  {izinler.map(iz => {
                    const p = personelListe.find(x => x.id === iz.personelId);
                    const tipRenk = { yillik: 'badge-mavi', raporlu: 'badge-kirmizi', haftalik: 'badge-yesil', mazeret: 'badge-sari' };
                    const tipAd = { yillik: '🌴 Yıllık', raporlu: '🏥 Raporlu', haftalik: '🔄 Haftalık', mazeret: '📝 Mazeret' };
                    return (
                      <tr key={iz.id}>
                        <td className="font-semibold">{p?.ad} {p?.soyad}</td>
                        <td><span className={`badge ${tipRenk[iz.tip] || 'badge-gri'}`}>{tipAd[iz.tip] || iz.tip}</span></td>
                        <td className="text-sm">{iz.baslangic}</td>
                        <td className="text-sm">{iz.bitis || iz.baslangic}</td>
                        <td><span className="badge badge-gri">{iz.gun} gün</span></td>
                        <td className="text-sm text-muted">{iz.aciklama}</td>
                        <td>
                          <span className={`badge ${iz.durum === 'onaylandi' ? 'badge-yesil' : iz.durum === 'reddedildi' ? 'badge-kirmizi' : 'badge-sari'}`}>
                            {iz.durum === 'onaylandi' ? '✅ Onaylandı' : iz.durum === 'reddedildi' ? '❌ Reddedildi' : '⏳ Bekliyor'}
                          </span>
                        </td>
                        <td>
                          {iz.durum === 'bekliyor' && (
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button className="btn btn-success btn-sm" onClick={() => izinOnayla(iz.id)}>✅</button>
                              <button className="btn btn-danger btn-sm" onClick={() => izinReddet(iz.id)}>❌</button>
                            </div>
                          )}
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

      {/* ──────────────────── MESAİ TAKİBİ ──────────────────── */}
      {anaSekme === 'mesai' && (
        <div className="panel">
          <div className="panel-baslik">
            <h3>⏰ Mesai Kayıtları</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span className="text-sm text-muted" style={{ display: 'flex', alignItems: 'center' }}>
                Bekleyen: <b style={{ color: '#F59E0B', marginLeft: '4px' }}>₺{mesailer.filter(m => m.durum === 'bekliyor').reduce((s, m) => s + m.toplam, 0).toLocaleString('tr-TR')}</b>
              </span>
              <button className="btn btn-primary btn-sm" onClick={() => setMesaiModal(true)}>+ Mesai Ekle</button>
            </div>
          </div>
          <div className="tablo-container">
            <table>
              <thead>
                <tr><th>Personel</th><th>Tarih</th><th>Süre</th><th>Saat Ücreti</th><th>Toplam</th><th>Açıklama</th><th>Durum</th><th>İşlem</th></tr>
              </thead>
              <tbody>
                {mesailer.map(m => {
                  const p = personelListe.find(x => x.id === m.personelId);
                  return (
                    <tr key={m.id}>
                      <td className="font-semibold">{p?.ad} {p?.soyad}</td>
                      <td className="text-sm">{m.tarih}</td>
                      <td><span className="badge badge-mavi">{m.saat} saat</span></td>
                      <td className="text-sm">₺{m.ucretPerSaat}/saat</td>
                      <td className="para-yesil font-bold">₺{m.toplam.toLocaleString('tr-TR')}</td>
                      <td className="text-sm text-muted">{m.aciklama}</td>
                      <td>
                        <span className={`badge ${m.durum === 'odendi' ? 'badge-yesil' : 'badge-sari'}`}>
                          {m.durum === 'odendi' ? '✅ Ödendi' : '⏳ Bekliyor'}
                        </span>
                      </td>
                      <td>
                        {m.durum === 'bekliyor' && (
                          <button className="btn btn-success btn-sm" onClick={() => setMesailer(prev => prev.map(x => x.id === m.id ? { ...x, durum: 'odendi' } : x))}>✅ Öde</button>
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

      {/* ──────────────────── GEÇ GELME / DEVAMSIZLIK ──────────────────── */}
      {anaSekme === 'devamsizlik' && (
        <div className="panel">
          <div className="panel-baslik">
            <h3>⚠️ Geç Gelme & Devamsızlık Kayıtları</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setGecModal(true)}>+ Kayıt Ekle</button>
          </div>
          <div className="tablo-container">
            <table>
              <thead>
                <tr><th>Personel</th><th>Tarih</th><th>Tip</th><th>Süre</th><th>Açıklama</th><th>Kesinti</th></tr>
              </thead>
              <tbody>
                {gecGelmeler.map(g => {
                  const p = personelListe.find(x => x.id === g.personelId);
                  return (
                    <tr key={g.id}>
                      <td className="font-semibold">{p?.ad} {p?.soyad}</td>
                      <td className="text-sm">{g.tarih}</td>
                      <td>
                        <span className={`badge ${g.tip === 'devamsizlik' ? 'badge-kirmizi' : 'badge-sari'}`}>
                          {g.tip === 'devamsizlik' ? '🚫 Devamsızlık' : '⏱️ Geç Gelme'}
                        </span>
                      </td>
                      <td>
                        {g.tip === 'devamsizlik'
                          ? <span className="badge badge-kirmizi">Tam Gün</span>
                          : <span className="text-sm">{g.dakika} dakika</span>}
                      </td>
                      <td className="text-sm text-muted">{g.aciklama || '—'}</td>
                      <td>
                        {g.kesinti > 0
                          ? <span className="para-kirmizi">-₺{g.kesinti.toLocaleString('tr-TR')}</span>
                          : <span className="text-muted">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================================
           DETAY MODAL (Personel Kartı — Tab'lı)
      ================================================================ */}
      <Modal
        acik={!!secilenPersonel}
        kapat={() => setSecilenPersonel(null)}
        baslik={`👤 ${secilenPersonel?.ad} ${secilenPersonel?.soyad}`}
        genislik="680px"
      >
        {secilenPersonel && (() => {
          const p = secilenPersonel;
          const sube = SUBELER.find(s => s.id === p.subeId);
          const sirket = SIRKETLER.find(s => s.id === sube?.sirketId);
          const izinHak = izinHaklari.find(h => h.personelId === p.id) || { yillikHak: 14, kullanilanGun: 0, kalanGun: 14 };
          const kisiMaaslar = maaslar.filter(m => m.personelId === p.id).slice(0, 6);
          const kisiIzinler = izinler.filter(i => i.personelId === p.id);
          const kisiMesailer = mesailer.filter(m => m.personelId === p.id);
          const kisiGecGelmeler = gecGelmeler.filter(g => g.personelId === p.id);
          const tazminat = tazminatHesapla(p);

          return (
            <>
              {/* Kişi başlık kartı */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'linear-gradient(135deg,#1E3A5F,#0F2140)', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: (sirket?.renk || '#3B82F6') + '40', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '700', color: 'white', flexShrink: 0, border: '2px solid rgba(255,255,255,0.2)' }}>
                  {p.ad[0]}{p.soyad[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}>{p.ad} {p.soyad}</div>
                  <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '2px' }}>{p.pozisyon} · {sirket?.ikon} {sube?.ad}</div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                    <span style={{ background: 'rgba(255,255,255,0.1)', color: '#E2E8F0', padding: '3px 10px', borderRadius: '20px', fontSize: '12px' }}>📞 {p.telefon}</span>
                    <span style={{ background: 'rgba(255,255,255,0.1)', color: '#E2E8F0', padding: '3px 10px', borderRadius: '20px', fontSize: '12px' }}>📅 {p.iseGirisTarihi}</span>
                    <span style={{ background: p.aktif ? '#10B98130' : '#EF444430', color: p.aktif ? '#6EE7B7' : '#FCA5A5', padding: '3px 10px', borderRadius: '20px', fontSize: '12px' }}>
                      {p.aktif ? '✅ Aktif' : '❌ Pasif'}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '22px', fontWeight: '700', color: '#6EE7B7' }}>₺{p.maas.toLocaleString('tr-TR')}</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>Aylık Maaş</div>
                </div>
              </div>

              {/* Detay sekmeleri */}
              <div className="tab-bar" style={{ marginBottom: '16px' }}>
                {[
                  { id: 'ozet', label: '📋 Özet' },
                  { id: 'maas', label: '💰 Maaşlar' },
                  { id: 'izin', label: '🏖️ İzinler' },
                  { id: 'mesai', label: '⏰ Mesai' },
                  { id: 'devam', label: '⚠️ Devam' },
                  { id: 'tazminat', label: '📊 Tazminat' },
                ].map(t => (
                  <div key={t.id} className={`tab-item ${detaySekme === t.id ? 'aktif' : ''}`} onClick={() => setDetaySekme(t.id)}>{t.label}</div>
                ))}
              </div>

              {/* ÖZET */}
              {detaySekme === 'ozet' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                    <InfoSatir etiket="Telefon" deger={p.telefon} />
                    <InfoSatir etiket="E-posta" deger={p.email} />
                    <InfoSatir etiket="Şube" deger={`${sirket?.ikon} ${sube?.ilce}`} />
                    <InfoSatir etiket="Brüt Maaş" deger={`₺${p.maas.toLocaleString('tr-TR')}`} renk="#10B981" />
                    <InfoSatir etiket="Yıllık İzin Hakkı" deger={`${izinHak.yillikHak} gün`} />
                    <InfoSatir etiket="Kalan İzin" deger={`${izinHak.kalanGun} gün`} renk={izinHak.kalanGun > 5 ? '#10B981' : '#EF4444'} />
                    <InfoSatir etiket="Toplam Mesai" deger={`${kisiMesailer.reduce((s, m) => s + m.saat, 0)} saat`} />
                    <InfoSatir etiket="Geç Gelme" deger={`${kisiGecGelmeler.filter(g => g.tip === 'gec_gelme').length} kez`} renk={kisiGecGelmeler.length > 3 ? '#EF4444' : '#1E293B'} />
                    <InfoSatir etiket="Devamsızlık" deger={`${kisiGecGelmeler.filter(g => g.tip === 'devamsizlik').length} gün`} renk={kisiGecGelmeler.filter(g => g.tip === 'devamsizlik').length > 0 ? '#EF4444' : '#10B981'} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { setSecilenPersonel(null); acDuzenle(p); }}>✏️ Düzenle</button>
                    <button className="btn btn-success" style={{ flex: 1 }} onClick={() => { setDetaySekme('tazminat'); }}>📊 Tazminat Hesapla</button>
                    <button className="btn btn-danger btn-sm" onClick={() => setSilOnay(p)}>🗑️</button>
                  </div>
                </div>
              )}

              {/* MAAŞLAR */}
              {detaySekme === 'maas' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ background: '#F0FDF4', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#10B981' }}>₺{(p.maas * 0.83).toLocaleString('tr-TR')}</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>Ortalama Net</div>
                    </div>
                    <div style={{ background: '#EDE9FE', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#8B5CF6' }}>{kisiMaaslar.filter(m => m.durum === 'odendi').length}</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>Ödenen Ay</div>
                    </div>
                    <div style={{ background: '#FEF9C3', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#F59E0B' }}>{kisiMaaslar.filter(m => m.durum === 'bekliyor').length}</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>Bekleyen</div>
                    </div>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr>
                          {['Dönem', 'Brüt', 'Mesai', 'İkramiye', 'Kesinti', 'Net', 'Durum'].map(h => (
                            <th key={h} style={{ background: '#F8FAFC', padding: '8px 10px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {kisiMaaslar.map(m => (
                          <tr key={m.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '8px 10px' }}><b>{AYLAR[m.ay]}</b></td>
                            <td style={{ padding: '8px 10px' }}>₺{m.brutMaas.toLocaleString('tr-TR')}</td>
                            <td style={{ padding: '8px 10px', color: m.mesaiUcreti > 0 ? '#10B981' : '#94A3B8' }}>{m.mesaiUcreti > 0 ? `+₺${m.mesaiUcreti.toLocaleString('tr-TR')}` : '—'}</td>
                            <td style={{ padding: '8px 10px', color: m.ikramiye > 0 ? '#10B981' : '#94A3B8' }}>{m.ikramiye > 0 ? `+₺${m.ikramiye.toLocaleString('tr-TR')}` : '—'}</td>
                            <td style={{ padding: '8px 10px', color: '#EF4444' }}>-₺{m.kesintiler.toLocaleString('tr-TR')}</td>
                            <td style={{ padding: '8px 10px', fontWeight: '700' }}>₺{(m.netMaas + m.mesaiUcreti + m.ikramiye).toLocaleString('tr-TR')}</td>
                            <td style={{ padding: '8px 10px' }}>
                              <span className={`badge ${m.durum === 'odendi' ? 'badge-yesil' : 'badge-sari'}`} style={{ fontSize: '11px' }}>
                                {m.durum === 'odendi' ? '✅' : '⏳'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* İZİNLER */}
              {detaySekme === 'izin' && (
                <div>
                  {/* İzin hakkı progress */}
                  <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '600', fontSize: '14px' }}>🌴 Yıllık İzin Hakkı — 2025</span>
                      <span style={{ fontWeight: '700', color: '#8B5CF6' }}>{izinHak.kalanGun} / {izinHak.yillikHak} gün kaldı</span>
                    </div>
                    <div className="progress-bar" style={{ height: '10px', marginBottom: '6px' }}>
                      <div className="progress-dolu" style={{ width: `${(izinHak.kullanilanGun / izinHak.yillikHak) * 100}%`, background: '#8B5CF6' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '20px', fontSize: '12px' }}>
                      <span className="text-muted">Kullanılan: <b>{izinHak.kullanilanGun} gün</b></span>
                      <span style={{ color: '#10B981' }}>Kalan: <b>{izinHak.kalanGun} gün</b></span>
                      <span className="text-muted">Raporlu: <b>{kisiIzinler.filter(i => i.tip === 'raporlu').reduce((s, i) => s + i.gun, 0)} gün</b></span>
                    </div>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr>
                          {['Tip', 'Başlangıç', 'Bitiş', 'Süre', 'Açıklama', 'Durum'].map(h => (
                            <th key={h} style={{ background: '#F8FAFC', padding: '8px 10px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {kisiIzinler.map(iz => {
                          const tipRenk = { yillik: 'badge-mavi', raporlu: 'badge-kirmizi', haftalik: 'badge-yesil', mazeret: 'badge-sari' };
                          const tipAd = { yillik: '🌴 Yıllık', raporlu: '🏥 Raporlu', haftalik: '🔄 Haftalık', mazeret: '📝 Mazeret' };
                          return (
                            <tr key={iz.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                              <td style={{ padding: '8px 10px' }}><span className={`badge ${tipRenk[iz.tip] || 'badge-gri'}`}>{tipAd[iz.tip] || iz.tip}</span></td>
                              <td style={{ padding: '8px 10px' }}>{iz.baslangic}</td>
                              <td style={{ padding: '8px 10px' }}>{iz.bitis || iz.baslangic}</td>
                              <td style={{ padding: '8px 10px' }}><b>{iz.gun}</b> gün</td>
                              <td style={{ padding: '8px 10px', color: '#64748B' }}>{iz.aciklama}</td>
                              <td style={{ padding: '8px 10px' }}>
                                <span className={`badge ${iz.durum === 'onaylandi' ? 'badge-yesil' : iz.durum === 'reddedildi' ? 'badge-kirmizi' : 'badge-sari'}`} style={{ fontSize: '11px' }}>
                                  {iz.durum === 'onaylandi' ? '✅ Onay' : iz.durum === 'reddedildi' ? '❌ Red' : '⏳'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MESAİ */}
              {detaySekme === 'mesai' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ background: '#F0FDF4', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#10B981' }}>{kisiMesailer.reduce((s, m) => s + m.saat, 0)}</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>Toplam Saat</div>
                    </div>
                    <div style={{ background: '#DBEAFE', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#3B82F6' }}>₺{kisiMesailer.reduce((s, m) => s + m.toplam, 0).toLocaleString('tr-TR')}</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>Toplam Tutar</div>
                    </div>
                    <div style={{ background: '#FEF9C3', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#F59E0B' }}>₺{kisiMesailer.filter(m => m.durum === 'bekliyor').reduce((s, m) => s + m.toplam, 0).toLocaleString('tr-TR')}</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>Bekleyen</div>
                    </div>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr>
                          {['Tarih', 'Süre', 'Saat Ücreti', 'Toplam', 'Açıklama', 'Durum'].map(h => (
                            <th key={h} style={{ background: '#F8FAFC', padding: '8px 10px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {kisiMesailer.map(m => (
                          <tr key={m.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '8px 10px' }}>{m.tarih}</td>
                            <td style={{ padding: '8px 10px' }}><b>{m.saat}</b> saat</td>
                            <td style={{ padding: '8px 10px' }}>₺{m.ucretPerSaat}/saat</td>
                            <td style={{ padding: '8px 10px', fontWeight: '700', color: '#10B981' }}>₺{m.toplam.toLocaleString('tr-TR')}</td>
                            <td style={{ padding: '8px 10px', color: '#64748B' }}>{m.aciklama}</td>
                            <td style={{ padding: '8px 10px' }}>
                              <span className={`badge ${m.durum === 'odendi' ? 'badge-yesil' : 'badge-sari'}`} style={{ fontSize: '11px' }}>
                                {m.durum === 'odendi' ? '✅ Ödendi' : '⏳ Bekliyor'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* DEVAM/DEVAMSIZLIK */}
              {detaySekme === 'devam' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ background: '#FEF9C3', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: '#F59E0B' }}>{kisiGecGelmeler.filter(g => g.tip === 'gec_gelme').length}</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>Geç Gelme</div>
                    </div>
                    <div style={{ background: '#FEE2E2', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: '#EF4444' }}>{kisiGecGelmeler.filter(g => g.tip === 'devamsizlik').length}</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>Devamsızlık</div>
                    </div>
                    <div style={{ background: '#FEE2E2', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: '#EF4444' }}>₺{kisiGecGelmeler.reduce((s, g) => s + (g.kesinti || 0), 0).toLocaleString('tr-TR')}</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>Toplam Kesinti</div>
                    </div>
                  </div>
                  {kisiGecGelmeler.length === 0
                    ? <div style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>✅ Devamsızlık kaydı yok</div>
                    : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                          <thead>
                            <tr>
                              {['Tarih', 'Tip', 'Süre', 'Açıklama', 'Kesinti'].map(h => (
                                <th key={h} style={{ background: '#F8FAFC', padding: '8px 10px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#64748B', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {kisiGecGelmeler.map(g => (
                              <tr key={g.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                <td style={{ padding: '8px 10px' }}>{g.tarih}</td>
                                <td style={{ padding: '8px 10px' }}>
                                  <span className={`badge ${g.tip === 'devamsizlik' ? 'badge-kirmizi' : 'badge-sari'}`} style={{ fontSize: '11px' }}>
                                    {g.tip === 'devamsizlik' ? '🚫 Devamsız' : '⏱️ Geç'}
                                  </span>
                                </td>
                                <td style={{ padding: '8px 10px' }}>{g.tip === 'devamsizlik' ? 'Tam gün' : `${g.dakika} dk`}</td>
                                <td style={{ padding: '8px 10px', color: '#64748B' }}>{g.aciklama || '—'}</td>
                                <td style={{ padding: '8px 10px', color: g.kesinti > 0 ? '#EF4444' : '#94A3B8', fontWeight: g.kesinti > 0 ? '700' : '400' }}>
                                  {g.kesinti > 0 ? `-₺${g.kesinti.toLocaleString('tr-TR')}` : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                </div>
              )}

              {/* TAZMİNAT */}
              {detaySekme === 'tazminat' && tazminat && (
                <div>
                  <div style={{ background: 'linear-gradient(135deg,#FEF9C3,#FEF08A)', borderRadius: '12px', padding: '20px', marginBottom: '16px', border: '1px solid #FDE047' }}>
                    <div style={{ fontSize: '13px', color: '#713F12', marginBottom: '4px', fontWeight: '600' }}>⚠️ TAHMİNİ HESAPLAMA</div>
                    <div style={{ fontSize: '12px', color: '#854D0E' }}>Bu hesaplama yaklaşık değerdir. Kesin rakamlar için muhasebe veya hukuk danışmanına başvurun.</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <InfoSatir etiket="İşe Giriş Tarihi" deger={p.iseGirisTarihi} />
                    <InfoSatir etiket="Toplam Çalışma" deger={`${tazminat.toplamYil} yıl (${tazminat.toplamGun} gün)`} />
                    <InfoSatir etiket="Brüt Maaş" deger={`₺${p.maas.toLocaleString('tr-TR')}`} />
                    <InfoSatir etiket="Günlük Maaş" deger={`₺${tazminat.gunlukMaas.toLocaleString('tr-TR')}`} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                    {[
                      { label: '📅 Kıdem Tazminatı', aciklama: `${tazminat.tamYil} tam yıl × ₺${p.maas.toLocaleString('tr-TR')} brüt maaş`, tutar: tazminat.kidemTazminati, renk: '#10B981', bg: '#F0FDF4' },
                      { label: '📣 İhbar Tazminatı', aciklama: `${tazminat.ihbarSuresi} hafta ihbar süresi × ${tazminat.ihbarSuresi * 7} gün × ₺${tazminat.gunlukMaas}/gün`, tutar: tazminat.ihbarTazminati, renk: '#3B82F6', bg: '#EFF6FF' },
                    ].map(item => (
                      <div key={item.label} style={{ background: item.bg, borderRadius: '10px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '15px', color: '#1E293B' }}>{item.label}</div>
                          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{item.aciklama}</div>
                        </div>
                        <div style={{ fontSize: '22px', fontWeight: '700', color: item.renk }}>₺{item.tutar.toLocaleString('tr-TR')}</div>
                      </div>
                    ))}
                    <div style={{ background: 'linear-gradient(135deg,#1E3A5F,#0F2140)', borderRadius: '10px', padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '16px', color: 'white' }}>💼 Toplam Tazminat (Tahmini)</div>
                        <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>Kıdem + İhbar tazminatı toplamı</div>
                      </div>
                      <div style={{ fontSize: '26px', fontWeight: '700', color: '#6EE7B7' }}>₺{tazminat.toplamTazminat.toLocaleString('tr-TR')}</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </Modal>

      {/* ================================================================
          YARDIMCI MODALLAR
      ================================================================ */}

      {/* Personel Yeni / Düzenle */}
      <Modal acik={personelYeni || !!personelDuzenle} kapat={() => { setPersonelYeni(false); setPersonelDuzenle(null); setPersonelForm(bosPersonelForm); }} baslik={personelDuzenle ? '✏️ Personel Düzenle' : '+ Yeni Personel'} genislik="580px">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Input label="Ad *" name="ad" form={personelForm} setForm={setPersonelForm} />
          <Input label="Soyad *" name="soyad" form={personelForm} setForm={setPersonelForm} />
          <Input label="Telefon" name="telefon" form={personelForm} setForm={setPersonelForm} />
          <Input label="E-posta" name="email" form={personelForm} setForm={setPersonelForm} tip="email" />
          <Input label="Pozisyon" name="pozisyon" form={personelForm} setForm={setPersonelForm} options={POZISYONLAR.map(p => ({ value: p, label: p }))} />
          <Input label="Şube" name="subeId" form={personelForm} setForm={setPersonelForm} options={SUBELER.map(s => ({ value: s.id, label: `${SIRKETLER.find(sr => sr.id === s.sirketId)?.ikon} ${s.ad}` }))} />
          <Input label="Brüt Maaş (₺)" name="maas" form={personelForm} setForm={setPersonelForm} tip="number" />
          <Input label="İşe Giriş Tarihi" name="iseGirisTarihi" form={personelForm} setForm={setPersonelForm} tip="date" />
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => { setPersonelYeni(false); setPersonelDuzenle(null); setPersonelForm(bosPersonelForm); }}>İptal</button>
          <button className="btn btn-primary" onClick={personelKaydet}>{personelDuzenle ? '💾 Güncelle' : '✅ Kaydet'}</button>
        </div>
      </Modal>

      {/* Maaş Ödeme */}
      <Modal acik={odemeModal} kapat={() => setOdemeModal(false)} baslik="💰 Maaş Ödemesi Ekle" genislik="520px">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Input label="Personel *" name="personelId" form={odemeForm} setForm={setOdemeForm} options={personelListe.map(p => ({ value: p.id, label: `${p.ad} ${p.soyad}` }))} tam />
          <Input label="Yıl" name="yil" form={odemeForm} setForm={setOdemeForm} tip="number" />
          <Input label="Ay" name="ay" form={odemeForm} setForm={setOdemeForm} options={AYLAR.slice(1).map((a, i) => ({ value: i + 1, label: a }))} />
          <Input label="Ödeme Tarihi" name="odenmeTarihi" form={odemeForm} setForm={setOdemeForm} tip="date" />
          <Input label="Brüt Maaş (₺) *" name="brutMaas" form={odemeForm} setForm={setOdemeForm} tip="number" />
          <Input label="Kesintiler (₺)" name="kesintiler" form={odemeForm} setForm={setOdemeForm} tip="number" />
          <Input label="Mesai Ücreti (₺)" name="mesaiUcreti" form={odemeForm} setForm={setOdemeForm} tip="number" />
          <Input label="İkramiye (₺)" name="ikramiye" form={odemeForm} setForm={setOdemeForm} tip="number" />
          {odemeForm.brutMaas && (
            <div style={{ gridColumn: '1 / -1', background: '#F0FDF4', borderRadius: '8px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#064E3B' }}>Tahmini Net Maaş</span>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#10B981' }}>
                ₺{(
                  (parseInt(odemeForm.brutMaas) || 0)
                  - (parseInt(odemeForm.kesintiler) || Math.round((parseInt(odemeForm.brutMaas) || 0) * 0.17))
                  + (parseInt(odemeForm.mesaiUcreti) || 0)
                  + (parseInt(odemeForm.ikramiye) || 0)
                ).toLocaleString('tr-TR')}
              </span>
            </div>
          )}
          <Input label="Not" name="not" form={odemeForm} setForm={setOdemeForm} tam />
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => setOdemeModal(false)}>İptal</button>
          <button className="btn btn-primary" onClick={odemeKaydet}>✅ Ödemeyi Kaydet</button>
        </div>
      </Modal>

      {/* İzin Ekle */}
      <Modal acik={izinModal} kapat={() => setIzinModal(false)} baslik="🏖️ İzin Ekle" genislik="480px">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Input label="Personel *" name="personelId" form={izinForm} setForm={setIzinForm} options={personelListe.map(p => ({ value: p.id, label: `${p.ad} ${p.soyad}` }))} tam />
          <Input label="İzin Tipi" name="tip" form={izinForm} setForm={setIzinForm} options={[
            { value: 'yillik', label: '🌴 Yıllık İzin' },
            { value: 'raporlu', label: '🏥 Raporlu' },
            { value: 'haftalik', label: '🔄 Haftalık İzin' },
            { value: 'mazeret', label: '📝 Mazeret İzni' },
          ]} />
          <Input label="Başlangıç Tarihi *" name="baslangic" form={izinForm} setForm={setIzinForm} tip="date" />
          <Input label="Bitiş Tarihi" name="bitis" form={izinForm} setForm={setIzinForm} tip="date" />
          <Input label="Gün Sayısı" name="gun" form={izinForm} setForm={setIzinForm} tip="number" />
          <Input label="Açıklama" name="aciklama" form={izinForm} setForm={setIzinForm} tam />
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => setIzinModal(false)}>İptal</button>
          <button className="btn btn-primary" onClick={izinKaydet}>✅ İzin Kaydet</button>
        </div>
      </Modal>

      {/* Mesai Ekle */}
      <Modal acik={mesaiModal} kapat={() => setMesaiModal(false)} baslik="⏰ Mesai Ekle" genislik="460px">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Input label="Personel *" name="personelId" form={mesaiForm} setForm={setMesaiForm} options={personelListe.map(p => ({ value: p.id, label: `${p.ad} ${p.soyad}` }))} tam />
          <Input label="Tarih" name="tarih" form={mesaiForm} setForm={setMesaiForm} tip="date" />
          <Input label="Süre (Saat) *" name="saat" form={mesaiForm} setForm={setMesaiForm} tip="number" />
          <Input label="Saat Ücreti (₺)" name="ucretPerSaat" form={mesaiForm} setForm={setMesaiForm} tip="number" />
          <Input label="Açıklama" name="aciklama" form={mesaiForm} setForm={setMesaiForm} tam />
        </div>
        {mesaiForm.saat && mesaiForm.ucretPerSaat && (
          <div style={{ background: '#F0FDF4', borderRadius: '8px', padding: '12px', marginTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: '#064E3B' }}>Toplam Mesai Ücreti</span>
            <span style={{ fontSize: '18px', fontWeight: '700', color: '#10B981' }}>
              ₺{((parseFloat(mesaiForm.saat) || 0) * (parseFloat(mesaiForm.ucretPerSaat) || 0)).toLocaleString('tr-TR')}
            </span>
          </div>
        )}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => setMesaiModal(false)}>İptal</button>
          <button className="btn btn-primary" onClick={mesaiKaydet}>✅ Mesai Kaydet</button>
        </div>
      </Modal>

      {/* Geç Gelme Ekle */}
      <Modal acik={gecModal} kapat={() => setGecModal(false)} baslik="⚠️ Geç Gelme / Devamsızlık Ekle" genislik="460px">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Input label="Personel *" name="personelId" form={gecForm} setForm={setGecForm} options={personelListe.map(p => ({ value: p.id, label: `${p.ad} ${p.soyad}` }))} tam />
          <Input label="Tarih *" name="tarih" form={gecForm} setForm={setGecForm} tip="date" />
          <Input label="Tip" name="tip" form={gecForm} setForm={setGecForm} options={[
            { value: 'gec_gelme', label: '⏱️ Geç Gelme' },
            { value: 'devamsizlik', label: '🚫 Devamsızlık' },
          ]} />
          <Input label="Süre (Dakika)" name="dakika" form={gecForm} setForm={setGecForm} tip="number" />
          <Input label="Kesinti (₺)" name="kesinti" form={gecForm} setForm={setGecForm} tip="number" />
          <Input label="Açıklama" name="aciklama" form={gecForm} setForm={setGecForm} tam />
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => setGecModal(false)}>İptal</button>
          <button className="btn btn-primary" onClick={gecKaydet}>✅ Kaydet</button>
        </div>
      </Modal>

      {/* Sil Onay */}
      <Modal acik={!!silOnay} kapat={() => setSilOnay(null)} baslik="🗑️ Personel Sil" genislik="380px">
        {silOnay && (
          <>
            <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
              <p style={{ fontSize: '15px', color: '#374151' }}><b>{silOnay.ad} {silOnay.soyad}</b> isimli personeli silmek istediğinizden emin misiniz?</p>
              <p style={{ fontSize: '13px', color: '#EF4444', marginTop: '8px' }}>Bu işlem geri alınamaz!</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSilOnay(null)}>Vazgeç</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => personelSil(silOnay.id)}>🗑️ Evet, Sil</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

export default PersonelPage;
