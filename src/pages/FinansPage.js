import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { dbGelirler, dbGiderler, dbSubeler, dbSirketler } from '../lib/db';

const AY_ADLARI = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];

function FinansPage() {
  const [aktifTab, setAktifTab] = useState('ozet');
  const [gelirler, setGelirler] = useState([]);
  const [giderler, setGiderler] = useState([]);
  const [subeler, setSubeler] = useState([]);
  const [sirketler, setSirketler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    async function yukle() {
      const [gel, gid, sub, sir] = await Promise.all([
        dbGelirler.getAll(),
        dbGiderler.getAll(),
        dbSubeler.getAll(),
        dbSirketler.getAll(),
      ]);
      setGelirler(gel);
      setGiderler(gid);
      setSubeler(sub);
      setSirketler(sir);
      setYukleniyor(false);
    }
    yukle();
  }, []);

  const toplamGelir      = gelirler.reduce((sum, g) => sum + (g.tutar || 0), 0);
  const toplamGiderBrut  = giderler.reduce((sum, g) => sum + (g.tutar || 0), 0); // KDV dahil
  const toplamGiderKdv   = giderler.reduce((sum, g) => sum + (g.kdv || 0), 0);
  const toplamGider      = toplamGiderBrut; // grafiklerde KDV dahil kullan
  const netKar           = toplamGelir - toplamGiderBrut;

  // Aylık gelir/gider (son 6 ay)
  const bugun = new Date();
  const aylikVeri = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(bugun.getFullYear(), bugun.getMonth() - 5 + i, 1);
    const ay = d.getMonth(); const yil = d.getFullYear();
    const gelir = gelirler.filter(g => { const t = new Date(g.tarih); return t.getMonth() === ay && t.getFullYear() === yil; }).reduce((s, g) => s + g.tutar, 0);
    const gider = giderler.filter(g => { const t = new Date(g.tarih); return t.getMonth() === ay && t.getFullYear() === yil; }).reduce((s, g) => s + g.tutar, 0);
    return { ay: AY_ADLARI[ay], gelir, gider };
  });

  // Gelir kategorisi dağılımı
  const gelirKat = {};
  gelirler.forEach(g => { gelirKat[g.kategori] = (gelirKat[g.kategori] || 0) + g.tutar; });

  // Gider kategori dağılımı
  const giderKat = {};
  giderler.forEach(g => { giderKat[g.kategori] = (giderKat[g.kategori] || 0) + g.tutar; });

  if (yukleniyor) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '48px' }}>⏳</div>
        <div style={{ fontSize: '16px', color: '#64748B', fontWeight: '600' }}>Finans verileri yükleniyor...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="sayfa-baslik">
        <h1>💰 Gelir & Gider Takibi</h1>
        <p>Tüm şirketlerin finansal durumu</p>
      </div>

      {/* Özet Kartlar */}
      <div className="ozet-kartlar" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        {[
          { ikon: '💚', label: 'Toplam Gelir',        deger: toplamGelir,     bg: '#DCFCE7', renk: '#10B981', format: true },
          { ikon: '🔴', label: 'Toplam Gider (KDV Dahil)', deger: toplamGiderBrut, bg: '#FEE2E2', renk: '#EF4444', format: true },
          { ikon: '🧾', label: 'Gider KDV Toplamı',   deger: toplamGiderKdv,  bg: '#FEF9C3', renk: '#F59E0B', format: true },
          { ikon: '📊', label: 'Net Kar',              deger: netKar,          bg: netKar >= 0 ? '#DCFCE7' : '#FEE2E2', renk: netKar >= 0 ? '#10B981' : '#EF4444', format: true },
          { ikon: '📈', label: 'Kar Marjı', deger: toplamGelir > 0 ? `%${Math.round((netKar / toplamGelir) * 100)}` : '—', bg: '#EDE9FE', renk: '#8B5CF6', format: false },
        ].map(k => (
          <div key={k.label} className="ozet-kart">
            <div className="kart-ikon" style={{ background: k.bg, fontSize: '24px' }}>{k.ikon}</div>
            <div className="kart-bilgi">
              <h3 style={{ color: k.renk }}>
                {k.format ? `₺${k.deger.toLocaleString('tr-TR')}` : k.deger}
              </h3>
              <p>{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Bar */}
      <div className="tab-bar">
        {['ozet', 'gelirler', 'giderler', 'sirketler'].map(tab => (
          <div key={tab} className={`tab-item ${aktifTab === tab ? 'aktif' : ''}`} onClick={() => setAktifTab(tab)}>
            {tab === 'ozet' && '📊 Özet'}
            {tab === 'gelirler' && '💚 Gelirler'}
            {tab === 'giderler' && '🔴 Giderler'}
            {tab === 'sirketler' && '🏢 Şirket Bazlı'}
          </div>
        ))}
      </div>

      {/* Özet Tab */}
      {aktifTab === 'ozet' && (
        <>
          <div className="panel mb-20">
            <div className="panel-baslik"><h3>📈 Aylık Gelir & Gider</h3></div>
            <div className="panel-icerik">
              <div className="grafik-alani">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={aylikVeri}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="ay" />
                    <YAxis tickFormatter={(v) => `₺${v / 1000}K`} />
                    <Tooltip formatter={(val) => [`₺${val.toLocaleString('tr-TR')}`, '']} />
                    <Legend />
                    <Bar dataKey="gelir" name="Gelir" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="gider" name="Gider" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="iki-kolon">
            <div className="panel">
              <div className="panel-baslik"><h3>💚 Gelir Dağılımı</h3></div>
              <div className="panel-icerik">
                {Object.entries(gelirKat).sort((a, b) => b[1] - a[1]).map(([kat, tutar]) => (
                  <div key={kat} style={{ marginBottom: '16px' }}>
                    <div className="flex-between mb-8">
                      <span className="text-sm font-semibold">{kat}</span>
                      <span className="text-sm para-yesil">₺{tutar.toLocaleString('tr-TR')}</span>
                    </div>
                    <div className="progress-bar" style={{ height: '8px' }}>
                      <div className="progress-dolu" style={{ width: `${toplamGelir > 0 ? Math.round((tutar / toplamGelir) * 100) : 0}%`, background: '#10B981' }} />
                    </div>
                    <div className="text-xs text-muted" style={{ marginTop: '4px' }}>
                      %{toplamGelir > 0 ? Math.round((tutar / toplamGelir) * 100) : 0}
                    </div>
                  </div>
                ))}
                {Object.keys(gelirKat).length === 0 && <div style={{ color: '#94A3B8', fontSize: '13px' }}>Henüz gelir kaydı yok.</div>}
              </div>
            </div>

            <div className="panel">
              <div className="panel-baslik"><h3>🔴 Gider Dağılımı</h3></div>
              <div className="panel-icerik">
                {Object.entries(giderKat).sort((a, b) => b[1] - a[1]).map(([kat, tutar]) => (
                  <div key={kat} style={{ marginBottom: '16px' }}>
                    <div className="flex-between mb-8">
                      <span className="text-sm font-semibold">{kat}</span>
                      <span className="text-sm para-kirmizi">₺{tutar.toLocaleString('tr-TR')}</span>
                    </div>
                    <div className="progress-bar" style={{ height: '8px' }}>
                      <div className="progress-dolu" style={{ width: `${toplamGider > 0 ? Math.round((tutar / toplamGider) * 100) : 0}%`, background: '#EF4444' }} />
                    </div>
                    <div className="text-xs text-muted" style={{ marginTop: '4px' }}>
                      %{toplamGider > 0 ? Math.round((tutar / toplamGider) * 100) : 0}
                    </div>
                  </div>
                ))}
                {Object.keys(giderKat).length === 0 && <div style={{ color: '#94A3B8', fontSize: '13px' }}>Henüz gider kaydı yok.</div>}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Gelirler Tab */}
      {aktifTab === 'gelirler' && (
        <div className="panel">
          <div className="panel-baslik">
            <h3>💚 Gelir Listesi</h3>
            <span style={{ fontSize: '13px', color: '#64748B' }}>{gelirler.length} kayıt</span>
          </div>
          <div className="tablo-container">
            <table>
              <thead>
                <tr><th>Tarih</th><th>Şube</th><th>Açıklama</th><th>Kategori</th><th>Tutar</th></tr>
              </thead>
              <tbody>
                {gelirler.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>Gelir kaydı bulunamadı.</td></tr>
                ) : gelirler.map(gelir => {
                  const sube = subeler.find(s => s.id === gelir.subeId);
                  const sirket = sirketler.find(s => s.id === (sube?.sirket_id || sube?.sirketId));
                  return (
                    <tr key={gelir.id}>
                      <td>{gelir.tarih}</td>
                      <td><div className="text-sm">{sirket?.ikon} {sube?.ilce || sube?.ad}</div></td>
                      <td>{gelir.aciklama}</td>
                      <td><span className="badge badge-mavi">{gelir.kategori}</span></td>
                      <td className="para-yesil">₺{gelir.tutar.toLocaleString('tr-TR')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Giderler Tab */}
      {aktifTab === 'giderler' && (
        <div className="panel">
          <div className="panel-baslik">
            <h3>🔴 Gider Listesi</h3>
            <span style={{ fontSize: '13px', color: '#64748B' }}>{giderler.length} kayıt</span>
          </div>
          <div className="tablo-container">
            <table>
              <thead>
                <tr><th>Tarih</th><th>Şube</th><th>Açıklama</th><th>Kategori</th><th>Tutar</th></tr>
              </thead>
              <tbody>
                {giderler.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>Gider kaydı bulunamadı.</td></tr>
                ) : giderler.map(gider => {
                  const sube = subeler.find(s => s.id === gider.subeId);
                  const sirket = sirketler.find(s => s.id === (sube?.sirket_id || sube?.sirketId));
                  return (
                    <tr key={gider.id}>
                      <td>{gider.tarih}</td>
                      <td><div className="text-sm">{sirket?.ikon} {sube?.ilce || sube?.ad}</div></td>
                      <td>{gider.aciklama}</td>
                      <td><span className="badge badge-gri">{gider.kategori}</span></td>
                      <td className="para-kirmizi">₺{gider.tutar.toLocaleString('tr-TR')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Şirket Bazlı Tab */}
      {aktifTab === 'sirketler' && (
        <div className="panel">
          <div className="panel-baslik"><h3>🏢 Şirket Bazlı Finansal Durum</h3></div>
          <div className="tablo-container">
            <table>
              <thead>
                <tr><th>Şirket</th><th>Şube Sayısı</th><th>Gelir</th><th>Gider</th><th>Net Kar</th><th>Kar Marjı</th></tr>
              </thead>
              <tbody>
                {sirketler.map(sirket => {
                  const subeIds = subeler.filter(s => (s.sirket_id || s.sirketId) === sirket.id).map(s => s.id);
                  const gelir = gelirler.filter(g => subeIds.includes(g.subeId)).reduce((s, g) => s + g.tutar, 0);
                  const gider = giderler.filter(g => subeIds.includes(g.subeId)).reduce((s, g) => s + g.tutar, 0);
                  const kar = gelir - gider;
                  const marj = gelir > 0 ? Math.round((kar / gelir) * 100) : 0;
                  return (
                    <tr key={sirket.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{sirket.ikon}</span>
                          <div>
                            <div className="font-semibold">{sirket.ad}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-mavi">{subeIds.length} şube</span></td>
                      <td className="para-yesil">₺{gelir.toLocaleString('tr-TR')}</td>
                      <td className="para-kirmizi">₺{gider.toLocaleString('tr-TR')}</td>
                      <td className={kar >= 0 ? 'para-yesil' : 'para-kirmizi'}>₺{kar.toLocaleString('tr-TR')}</td>
                      <td>
                        <span className={`badge ${marj >= 40 ? 'badge-yesil' : marj >= 20 ? 'badge-sari' : 'badge-kirmizi'}`}>%{marj}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default FinansPage;
