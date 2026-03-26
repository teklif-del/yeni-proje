import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SIRKETLER, SUBELER, OGRENCILER, getAylikGelirGider } from '../data/mockData';

const AYLIK_OGRENCI = [
  { ay: 'Eki', surucu: 45, src: 18, psiko: 22, diger: 8 },
  { ay: 'Kas', surucu: 52, src: 22, psiko: 25, diger: 10 },
  { ay: 'Ara', surucu: 38, src: 15, psiko: 18, diger: 7 },
  { ay: 'Oca', surucu: 61, src: 28, psiko: 30, diger: 12 },
  { ay: 'Şub', surucu: 58, src: 25, psiko: 28, diger: 11 },
  { ay: 'Mar', surucu: 72, src: 32, psiko: 35, diger: 15 },
];

function RaporlarPage() {
  const [seciliRapor, setSeciliRapor] = useState('genel');
  const aylikVeri = getAylikGelirGider();

  return (
    <div>
      <div className="sayfa-baslik">
        <h1>📈 Raporlar & Analizler</h1>
        <p>Detaylı iş analitiği ve performans raporları</p>
      </div>

      {/* Rapor Seçici */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { id: 'genel', label: '📊 Genel Rapor' },
          { id: 'ogrenci', label: '👨‍🎓 Öğrenci Analizi' },
          { id: 'finans', label: '💰 Finansal Rapor' },
          { id: 'sube', label: '🏢 Şube Performansı' },
        ].map(r => (
          <button
            key={r.id}
            className={`btn ${seciliRapor === r.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSeciliRapor(r.id)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Genel Rapor */}
      {seciliRapor === 'genel' && (
        <>
          <div className="iki-kolon">
            <div className="panel">
              <div className="panel-baslik"><h3>📈 Aylık Gelir Trendi</h3></div>
              <div className="panel-icerik">
                <div className="grafik-alani">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={aylikVeri}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="ay" />
                      <YAxis tickFormatter={v => `₺${v/1000}K`} />
                      <Tooltip formatter={val => [`₺${val.toLocaleString('tr-TR')}`, '']} />
                      <Legend />
                      <Line type="monotone" dataKey="gelir" name="Gelir" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="gider" name="Gider" stroke="#EF4444" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-baslik"><h3>👨‍🎓 Aylık Öğrenci Kayıtları</h3></div>
              <div className="panel-icerik">
                <div className="grafik-alani">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={AYLIK_OGRENCI}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="ay" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="surucu" name="Sürücü Kursu" fill="#3B82F6" radius={[2,2,0,0]} />
                      <Bar dataKey="src" name="SRC" fill="#F59E0B" radius={[2,2,0,0]} />
                      <Bar dataKey="psiko" name="Psikoteknik" fill="#8B5CF6" radius={[2,2,0,0]} />
                      <Bar dataKey="diger" name="Diğer" fill="#10B981" radius={[2,2,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* KPI Tablosu */}
          <div className="panel">
            <div className="panel-baslik"><h3>🎯 Temel Performans Göstergeleri (KPI)</h3></div>
            <div className="tablo-container">
              <table>
                <thead>
                  <tr>
                    <th>Gösterge</th>
                    <th>Bu Ay</th>
                    <th>Geçen Ay</th>
                    <th>Değişim</th>
                    <th>Hedef</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { gosterge: '💰 Toplam Gelir', buAy: '₺118.000', gecenAy: '₺102.000', degisim: '+15.7%', hedef: '₺120.000', durum: 'iyi' },
                    { gosterge: '👨‍🎓 Yeni Öğrenci', buAy: '154', gecenAy: '122', degisim: '+26.2%', hedef: '150', durum: 'cok_iyi' },
                    { gosterge: '✅ Sınav Başarı', buAy: '%82', gecenAy: '%79', degisim: '+3.8%', hedef: '%85', durum: 'iyi' },
                    { gosterge: '💳 Tahsilat Oranı', buAy: '%78', gecenAy: '%74', degisim: '+5.4%', hedef: '%90', durum: 'orta' },
                    { gosterge: '📊 Kar Marjı', buAy: '%53', gecenAy: '%50', degisim: '+6%', hedef: '%55', durum: 'iyi' },
                  ].map((kpi, i) => (
                    <tr key={i}>
                      <td className="font-semibold">{kpi.gosterge}</td>
                      <td className="font-bold">{kpi.buAy}</td>
                      <td className="text-muted">{kpi.gecenAy}</td>
                      <td>
                        <span className={kpi.degisim.startsWith('+') ? 'para-yesil' : 'para-kirmizi'}>
                          {kpi.degisim}
                        </span>
                      </td>
                      <td className="text-muted">{kpi.hedef}</td>
                      <td>
                        <span className={`badge ${
                          kpi.durum === 'cok_iyi' ? 'badge-yesil' :
                          kpi.durum === 'iyi' ? 'badge-mavi' : 'badge-sari'
                        }`}>
                          {kpi.durum === 'cok_iyi' ? '🌟 Mükemmel' : kpi.durum === 'iyi' ? '✅ İyi' : '⚠️ Orta'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Şube Performansı */}
      {seciliRapor === 'sube' && (
        <div className="panel">
          <div className="panel-baslik"><h3>🏢 Şube Performans Tablosu</h3></div>
          <div className="tablo-container">
            <table>
              <thead>
                <tr>
                  <th>Şube</th>
                  <th>Şirket</th>
                  <th>Öğrenci</th>
                  <th>Tamamlama %</th>
                  <th>Gelir</th>
                  <th>Performans</th>
                </tr>
              </thead>
              <tbody>
                {SUBELER.slice(0, 10).map(sube => {
                  const sirket = SIRKETLER.find(s => s.id === sube.sirketId);
                  const subeOgrenci = OGRENCILER.filter(o => o.subeId === sube.id);
                  const tamamlayan = subeOgrenci.filter(o => o.durum === 'tamamladi').length;
                  const tamamlamaOrani = subeOgrenci.length > 0 ? Math.round((tamamlayan / subeOgrenci.length) * 100) : 0;
                  const performans = Math.floor(Math.random() * 40) + 60;
                  return (
                    <tr key={sube.id}>
                      <td className="font-semibold">{sube.ad.split(' - ')[1] || sube.ad}</td>
                      <td>
                        <span>{sirket?.ikon} {sirket?.ad.split(' ')[0]}</span>
                      </td>
                      <td><span className="badge badge-mavi">{subeOgrenci.length}</span></td>
                      <td>
                        <div className="progress-bar" style={{ marginBottom: '4px' }}>
                          <div className="progress-dolu" style={{ width: `${tamamlamaOrani}%` }} />
                        </div>
                        <span className="text-xs text-muted">%{tamamlamaOrani}</span>
                      </td>
                      <td className="para-yesil">₺{(Math.floor(Math.random() * 50) + 10).toLocaleString('tr-TR')}.000</td>
                      <td>
                        <span className={`badge ${performans >= 80 ? 'badge-yesil' : performans >= 65 ? 'badge-mavi' : 'badge-sari'}`}>
                          {performans >= 80 ? '🌟 Yüksek' : performans >= 65 ? '✅ İyi' : '⚠️ Orta'}
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

      {/* Dışa Aktarma */}
      <div className="panel" style={{ marginTop: '20px' }}>
        <div className="panel-baslik"><h3>📤 Rapor Dışa Aktarma</h3></div>
        <div className="panel-icerik">
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { label: '📊 Excel İndir', renk: '#10B981' },
              { label: '📄 PDF Rapor', renk: '#EF4444' },
              { label: '📧 E-posta Gönder', renk: '#3B82F6' },
              { label: '🖨️ Yazdır', renk: '#64748B' },
            ].map(btn => (
              <button
                key={btn.label}
                className="btn"
                style={{ background: btn.renk, color: 'white' }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RaporlarPage;
