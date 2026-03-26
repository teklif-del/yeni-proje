import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { GELIRLER, GIDERLER, SUBELER, SIRKETLER, getAylikGelirGider } from '../data/mockData';

function FinansPage() {
  const [aktifTab, setAktifTab] = useState('ozet');
  const [subeFiltre, setSubeFiltre] = useState('tumu');

  const toplamGelir = GELIRLER.reduce((sum, g) => sum + g.tutar, 0);
  const toplamGider = GIDERLER.reduce((sum, g) => sum + g.tutar, 0);
  const netKar = toplamGelir - toplamGider;
  const aylikVeri = getAylikGelirGider();

  const gelirTipleri = {
    kurs_ucreti: GELIRLER.filter(g => g.tip === 'kurs_ucreti').reduce((s, g) => s + g.tutar, 0),
    kira_geliri: GELIRLER.filter(g => g.tip === 'kira_geliri').reduce((s, g) => s + g.tutar, 0),
  };

  const giderTipleri = {};
  GIDERLER.forEach(g => {
    giderTipleri[g.tip] = (giderTipleri[g.tip] || 0) + g.tutar;
  });

  return (
    <div>
      <div className="sayfa-baslik">
        <h1>💰 Gelir & Gider Takibi</h1>
        <p>Tüm şirketlerin finansal durumu</p>
      </div>

      {/* Özet Kartlar */}
      <div className="ozet-kartlar" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        {[
          { ikon: '💚', label: 'Toplam Gelir', deger: toplamGelir, bg: '#DCFCE7', renk: '#10B981', format: true },
          { ikon: '🔴', label: 'Toplam Gider', deger: toplamGider, bg: '#FEE2E2', renk: '#EF4444', format: true },
          { ikon: '📊', label: 'Net Kar', deger: netKar, bg: '#DBEAFE', renk: '#3B82F6', format: true },
          { ikon: '📈', label: 'Kar Marjı', deger: `%${Math.round((netKar / toplamGelir) * 100)}`, bg: '#EDE9FE', renk: '#8B5CF6', format: false },
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
          <div
            key={tab}
            className={`tab-item ${aktifTab === tab ? 'aktif' : ''}`}
            onClick={() => setAktifTab(tab)}
          >
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
            <div className="panel-baslik">
              <h3>📈 Aylık Gelir & Gider</h3>
            </div>
            <div className="panel-icerik">
              <div className="grafik-alani">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={aylikVeri}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="ay" />
                    <YAxis tickFormatter={(v) => `₺${v/1000}K`} />
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
            {/* Gelir Tipleri */}
            <div className="panel">
              <div className="panel-baslik"><h3>💚 Gelir Dağılımı</h3></div>
              <div className="panel-icerik">
                {[
                  { label: 'Kurs Ücretleri', tutar: gelirTipleri.kurs_ucreti, renk: '#3B82F6' },
                  { label: 'Kira Gelirleri', tutar: gelirTipleri.kira_geliri, renk: '#10B981' },
                ].map(item => (
                  <div key={item.label} style={{ marginBottom: '16px' }}>
                    <div className="flex-between mb-8">
                      <span className="text-sm font-semibold">{item.label}</span>
                      <span className="text-sm para-yesil">₺{item.tutar.toLocaleString('tr-TR')}</span>
                    </div>
                    <div className="progress-bar" style={{ height: '8px' }}>
                      <div
                        className="progress-dolu"
                        style={{
                          width: `${Math.round((item.tutar / toplamGelir) * 100)}%`,
                          background: item.renk
                        }}
                      />
                    </div>
                    <div className="text-xs text-muted" style={{ marginTop: '4px' }}>
                      %{Math.round((item.tutar / toplamGelir) * 100)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gider Tipleri */}
            <div className="panel">
              <div className="panel-baslik"><h3>🔴 Gider Dağılımı</h3></div>
              <div className="panel-icerik">
                {Object.entries(giderTipleri).map(([tip, tutar]) => {
                  const etiketler = { kira: '🏠 Kira', personel: '👥 Personel', yakit: '⛽ Yakıt', diger: '📦 Diğer' };
                  return (
                    <div key={tip} style={{ marginBottom: '16px' }}>
                      <div className="flex-between mb-8">
                        <span className="text-sm font-semibold">{etiketler[tip] || tip}</span>
                        <span className="text-sm para-kirmizi">₺{tutar.toLocaleString('tr-TR')}</span>
                      </div>
                      <div className="progress-bar" style={{ height: '8px' }}>
                        <div
                          className="progress-dolu"
                          style={{
                            width: `${Math.round((tutar / toplamGider) * 100)}%`,
                            background: '#EF4444'
                          }}
                        />
                      </div>
                      <div className="text-xs text-muted" style={{ marginTop: '4px' }}>
                        %{Math.round((tutar / toplamGider) * 100)}
                      </div>
                    </div>
                  );
                })}
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
            <button className="btn btn-primary btn-sm">+ Gelir Ekle</button>
          </div>
          <div className="tablo-container">
            <table>
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Şube</th>
                  <th>Açıklama</th>
                  <th>Tip</th>
                  <th>Tutar</th>
                </tr>
              </thead>
              <tbody>
                {GELIRLER.map(gelir => {
                  const sube = SUBELER.find(s => s.id === gelir.subeId);
                  const sirket = SIRKETLER.find(s => s.id === sube?.sirketId);
                  return (
                    <tr key={gelir.id}>
                      <td>{gelir.tarih}</td>
                      <td>
                        <div className="text-sm">{sirket?.ikon} {sube?.ilce}</div>
                      </td>
                      <td>{gelir.aciklama}</td>
                      <td>
                        <span className={`badge ${gelir.tip === 'kira_geliri' ? 'badge-yesil' : 'badge-mavi'}`}>
                          {gelir.tip === 'kira_geliri' ? '🏠 Kira' : '📚 Kurs'}
                        </span>
                      </td>
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
            <button className="btn btn-primary btn-sm">+ Gider Ekle</button>
          </div>
          <div className="tablo-container">
            <table>
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Şube</th>
                  <th>Açıklama</th>
                  <th>Kategori</th>
                  <th>Tutar</th>
                </tr>
              </thead>
              <tbody>
                {GIDERLER.map(gider => {
                  const sube = SUBELER.find(s => s.id === gider.subeId);
                  const sirket = SIRKETLER.find(s => s.id === sube?.sirketId);
                  return (
                    <tr key={gider.id}>
                      <td>{gider.tarih}</td>
                      <td>
                        <div className="text-sm">{sirket?.ikon} {sube?.ilce}</div>
                      </td>
                      <td>{gider.aciklama}</td>
                      <td>
                        <span className="badge badge-gri">
                          {gider.tip === 'kira' ? '🏠 Kira' : gider.tip === 'personel' ? '👥 Personel' : '⛽ Yakıt'}
                        </span>
                      </td>
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
                <tr>
                  <th>Şirket</th>
                  <th>Şube Sayısı</th>
                  <th>Gelir</th>
                  <th>Gider</th>
                  <th>Net Kar</th>
                  <th>Kar Marjı</th>
                </tr>
              </thead>
              <tbody>
                {SIRKETLER.map(sirket => {
                  const subeIds = SUBELER.filter(s => s.sirketId === sirket.id).map(s => s.id);
                  const gelir = GELIRLER.filter(g => subeIds.includes(g.subeId)).reduce((s, g) => s + g.tutar, 0);
                  const gider = GIDERLER.filter(g => subeIds.includes(g.subeId)).reduce((s, g) => s + g.tutar, 0);
                  const kar = gelir - gider;
                  const marj = gelir > 0 ? Math.round((kar / gelir) * 100) : 0;
                  return (
                    <tr key={sirket.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{sirket.ikon}</span>
                          <div>
                            <div className="font-semibold">{sirket.ad.split(' ')[0]}</div>
                            <div className="text-xs text-muted">{sirket.ad}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-mavi">
                          {SUBELER.filter(s => s.sirketId === sirket.id).length} şube
                        </span>
                      </td>
                      <td className="para-yesil">₺{gelir.toLocaleString('tr-TR')}</td>
                      <td className="para-kirmizi">₺{gider.toLocaleString('tr-TR')}</td>
                      <td className={kar >= 0 ? 'para-yesil' : 'para-kirmizi'}>
                        ₺{kar.toLocaleString('tr-TR')}
                      </td>
                      <td>
                        <span className={`badge ${marj >= 40 ? 'badge-yesil' : marj >= 20 ? 'badge-sari' : 'badge-kirmizi'}`}>
                          %{marj}
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
    </div>
  );
}

export default FinansPage;
