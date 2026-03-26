import React, { useState } from 'react';
import { SIRKETLER, SUBELER, OGRENCILER, PERSONEL } from '../data/mockData';
import Modal from '../components/Modal';

const bosForm = { ad: '', sehir: '', ilce: '', adres: '', telefon: '', sirketId: '', aktif: true };

function InfoSatir({ etiket, deger, renk }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', background: '#F8FAFC', borderRadius: '8px', padding: '12px 14px' }}>
      <span style={{ fontSize: '11px', color: '#64748B', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{etiket}</span>
      <span style={{ fontSize: '14px', fontWeight: '600', color: renk || '#1E293B' }}>{deger || '-'}</span>
    </div>
  );
}

function Subeler({ navigate, secilenSirketId }) {
  const [liste, setListe] = useState(SUBELER);
  const [secilenSirket, setSecilenSirket] = useState(secilenSirketId ? secilenSirketId.toString() : 'tumu');
  const [aramaMetni, setAramaMetni] = useState('');

  const [detayModal, setDetayModal] = useState(null);
  const [duzenleModal, setDuzenleModal] = useState(null);
  const [yeniModal, setYeniModal] = useState(false);
  const [silOnay, setSilOnay] = useState(null);
  const [form, setForm] = useState(bosForm);

  const filtrelenenler = liste.filter(s => {
    const sirketEsles = secilenSirket === 'tumu' || s.sirketId === parseInt(secilenSirket);
    const aramaEsles = aramaMetni === '' ||
      s.ad.toLowerCase().includes(aramaMetni.toLowerCase()) ||
      s.sehir.toLowerCase().includes(aramaMetni.toLowerCase()) ||
      s.ilce.toLowerCase().includes(aramaMetni.toLowerCase());
    return sirketEsles && aramaEsles;
  });

  const kaydet = () => {
    if (!form.ad || !form.sirketId) { alert('Şube adı ve şirket zorunludur!'); return; }
    if (duzenleModal) {
      setListe(prev => prev.map(s => s.id === duzenleModal.id
        ? { ...duzenleModal, ...form, sirketId: parseInt(form.sirketId) }
        : s));
      setDuzenleModal(null);
    } else {
      setListe(prev => [...prev, { ...form, id: Date.now(), sirketId: parseInt(form.sirketId), aktif: true }]);
      setYeniModal(false);
    }
    setForm(bosForm);
  };

  const sil = (id) => { setListe(prev => prev.filter(s => s.id !== id)); setSilOnay(null); setDetayModal(null); };

  const acDuzenle = (s) => {
    setForm({ ...s, sirketId: s.sirketId?.toString() });
    setDuzenleModal(s);
  };

  const FormAlani = ({ label, name, tip = 'text', options }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>{label}</label>
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
          placeholder={label}
        />
      )}
    </div>
  );

  return (
    <div>
      <div className="sayfa-baslik">
        <h1>🏢 Şubeler</h1>
        <p>Tüm şirket ve şubelerinizi yönetin • {liste.length} şube</p>
      </div>

      {/* Şirket Filtreleri */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button className={`btn ${secilenSirket === 'tumu' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSecilenSirket('tumu')}>
          🏢 Tümü ({liste.length})
        </button>
        {SIRKETLER.map(s => (
          <button key={s.id} className="btn btn-secondary"
            style={{ borderLeft: `4px solid ${s.renk}`, background: secilenSirket === s.id.toString() ? s.renk + '18' : '' }}
            onClick={() => setSecilenSirket(s.id.toString())}>
            {s.ikon} {s.ad.split(' ')[0]} ({liste.filter(sb => sb.sirketId === s.id).length})
          </button>
        ))}
      </div>

      {/* Arama */}
      <div className="filtre-bar">
        <input className="arama-input" placeholder="🔍 Şube adı, şehir veya ilçe ara..." value={aramaMetni} onChange={e => setAramaMetni(e.target.value)} />
        <button className="btn btn-primary" onClick={() => { setForm(bosForm); setYeniModal(true); }}>+ Yeni Şube</button>
      </div>

      {/* Tablo */}
      <div className="panel">
        <div className="panel-baslik">
          <h3>📋 Şube Listesi</h3>
          <span className="text-sm text-muted">{filtrelenenler.length} şube gösteriliyor</span>
        </div>
        <div className="tablo-container">
          <table>
            <thead>
              <tr><th>Şube Adı</th><th>Şirket</th><th>Şehir / İlçe</th><th>Öğrenci</th><th>Personel</th><th>Durum</th><th>İşlem</th></tr>
            </thead>
            <tbody>
              {filtrelenenler.map(sube => {
                const sirket = SIRKETLER.find(s => s.id === sube.sirketId);
                const subeOgrenci = OGRENCILER.filter(o => o.subeId === sube.id).length;
                const subePersonel = PERSONEL.filter(p => p.subeId === sube.id).length;
                return (
                  <tr key={sube.id}>
                    <td>
                      <div className="font-semibold">{sube.ad}</div>
                      <div className="text-xs text-muted">📞 {sube.telefon}</div>
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="renk-nokta" style={{ background: sirket?.renk }} />
                        <span className="text-sm">{sirket?.ikon} {sirket?.ad.split(' ')[0]}</span>
                      </span>
                    </td>
                    <td>
                      <div>{sube.sehir}</div>
                      <div className="text-xs text-muted">{sube.ilce}</div>
                    </td>
                    <td><span className="badge badge-mavi">{subeOgrenci} öğrenci</span></td>
                    <td><span className="badge badge-mor">{subePersonel} personel</span></td>
                    <td>
                      <span className={`badge ${sube.aktif ? 'badge-yesil' : 'badge-kirmizi'}`}>
                        {sube.aktif ? '✅ Aktif' : '❌ Pasif'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn btn-secondary btn-sm" title="Detay" onClick={() => navigate ? navigate('sube_detay', { subeId: sube.id, sirketId: sube.sirketId }) : setDetayModal(sube)}>👁</button>
                        <button className="btn btn-secondary btn-sm" title="Düzenle" onClick={() => acDuzenle(sube)}>✏️</button>
                        <button className="btn btn-danger btn-sm" title="Sil" onClick={() => setSilOnay(sube)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== DETAY MODAL ===== */}
      <Modal acik={!!detayModal} kapat={() => setDetayModal(null)} baslik={`🏢 ${detayModal?.ad}`} genislik="520px">
        {detayModal && (() => {
          const sirket = SIRKETLER.find(s => s.id === detayModal.sirketId);
          const subeOgrenciler = OGRENCILER.filter(o => o.subeId === detayModal.id);
          const subePersoneller = PERSONEL.filter(p => p.subeId === detayModal.id);
          const aktifOgrenci = subeOgrenciler.filter(o => o.durum === 'devam_ediyor').length;
          return (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#F8FAFC', borderRadius: '10px', padding: '14px', marginBottom: '20px' }}>
                <span style={{ fontSize: '36px' }}>{sirket?.ikon}</span>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#1E293B' }}>{detayModal.ad}</div>
                  <div style={{ fontSize: '13px', color: '#64748B' }}>{sirket?.ad}</div>
                  <span className={`badge ${detayModal.aktif ? 'badge-yesil' : 'badge-kirmizi'}`} style={{ marginTop: '4px', display: 'inline-block' }}>
                    {detayModal.aktif ? '✅ Aktif' : '❌ Pasif'}
                  </span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                <InfoSatir etiket="Şehir" deger={detayModal.sehir} />
                <InfoSatir etiket="İlçe" deger={detayModal.ilce} />
                <InfoSatir etiket="Telefon" deger={detayModal.telefon} />
                <InfoSatir etiket="Şirket" deger={sirket?.ad} />
                <InfoSatir etiket="Toplam Öğrenci" deger={subeOgrenciler.length} />
                <InfoSatir etiket="Aktif Öğrenci" deger={aktifOgrenci} renk="#F59E0B" />
                <InfoSatir etiket="Personel Sayısı" deger={subePersoneller.length} />
              </div>
              <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>
                📍 <b>Adres:</b> {detayModal.adres}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { setDetayModal(null); acDuzenle(detayModal); }}>✏️ Düzenle</button>
                <button className="btn btn-danger btn-sm" onClick={() => { setDetayModal(null); setSilOnay(detayModal); }}>🗑️ Sil</button>
              </div>
            </>
          );
        })()}
      </Modal>

      {/* ===== YENİ / DÜZENLE MODAL ===== */}
      <Modal
        acik={yeniModal || !!duzenleModal}
        kapat={() => { setYeniModal(false); setDuzenleModal(null); setForm(bosForm); }}
        baslik={duzenleModal ? '✏️ Şube Düzenle' : '+ Yeni Şube Ekle'}
        genislik="560px"
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ gridColumn: '1 / -1' }}><FormAlani label="Şube Adı *" name="ad" /></div>
          <FormAlani label="Şirket *" name="sirketId" options={SIRKETLER.map(s => ({ value: s.id, label: `${s.ikon} ${s.ad}` }))} />
          <FormAlani label="Telefon" name="telefon" />
          <FormAlani label="Şehir" name="sehir" />
          <FormAlani label="İlçe" name="ilce" />
          <div style={{ gridColumn: '1 / -1' }}><FormAlani label="Adres" name="adres" /></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>Durum</label>
            <select className="secim-input" style={{ padding: '9px 12px' }} value={form.aktif ? 'aktif' : 'pasif'}
              onChange={e => setForm(p => ({ ...p, aktif: e.target.value === 'aktif' }))}>
              <option value="aktif">✅ Aktif</option>
              <option value="pasif">❌ Pasif</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => { setYeniModal(false); setDuzenleModal(null); setForm(bosForm); }}>İptal</button>
          <button className="btn btn-primary" onClick={kaydet}>{duzenleModal ? '💾 Güncelle' : '✅ Kaydet'}</button>
        </div>
      </Modal>

      {/* ===== SİL ONAY ===== */}
      <Modal acik={!!silOnay} kapat={() => setSilOnay(null)} baslik="🗑️ Şube Sil" genislik="380px">
        {silOnay && (
          <>
            <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
              <p style={{ fontSize: '15px', color: '#374151' }}><b>{silOnay.ad}</b> şubesini silmek istediğinizden emin misiniz?</p>
              <p style={{ fontSize: '13px', color: '#EF4444', marginTop: '8px' }}>Bu işlem geri alınamaz!</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSilOnay(null)}>Vazgeç</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => sil(silOnay.id)}>🗑️ Evet, Sil</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

export default Subeler;
