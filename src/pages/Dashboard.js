import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { getDashboardOzet, getAylikGelirGider, getSirketGelirDagilimi, SIRKETLER, SUBELER, OGRENCILER } from '../data/mockData';

const formatPara = (sayi) => {
  if (sayi >= 1000000) return `₺${(sayi / 1000000).toFixed(1)}M`;
  if (sayi >= 1000) return `₺${(sayi / 1000).toFixed(0)}K`;
  return `₺${sayi.toLocaleString('tr-TR')}`;
};

const OZET_KARTLAR = [
  { key: 'toplamSube', ikon: '🏢', label: 'Toplam Şube', renk: '#3B82F6', bg: '#DBEAFE', degisim: '+2', artis: true },
  { key: 'toplamOgrenci', ikon: '👨‍🎓', label: 'Toplam Öğrenci', renk: '#10B981', bg: '#DCFCE7', degisim: '+12%', artis: true },
  { key: 'aktifOgrenci', ikon: '✅', label: 'Aktif Öğrenci', renk: '#F59E0B', bg: '#FEF9C3', degisim: '+8%', artis: true },
  { key: 'toplamPersonel', ikon: '👥', label: 'Personel Sayısı', renk: '#8B5CF6', bg: '#EDE9FE', degisim: '+3', artis: true },
  { key: 'toplamGelir', ikon: '💰', label: 'Aylık Gelir', renk: '#10B981', bg: '#DCFCE7', degisim: '+15%', artis: true, para: true },
  { key: 'toplamGider', ikon: '📉', label: 'Aylık Gider', renk: '#EF4444', bg: '#FEE2E2', degisim: '+5%', artis: false, para: true },
  { key: 'netKar', ikon: '📊', label: 'Net Kar', renk: '#06B6D4', bg: '#CFFAFE', degisim: '+22%', artis: true, para: true },
  { key: 'toplamArac', ikon: '🚗', label: 'Toplam Araç', renk: '#84CC16', bg: '#ECFCCB', degisim: '0', artis: true },
];

function Dashboard() {
  const ozet = getDashboardOzet();
  const aylikVeri = getAylikGelirGider();
  const sirketDagilim = getSirketGelirDagilimi();

  const sonOgrenciler = OGRENCILER.slice(0, 5);

  return (
    <div>
      <div className="sayfa-baslik">
        <h1>📊 Genel Bakış</h1>
        <p>Tüm şubeler ve şirketlerin anlık özeti • Mart 2025</p>
      </div>

      {/* Özet Kartlar */}
      <div className="ozet-kartlar">
        {OZET_KARTLAR.map(kart => (
          <div key={kart.key} className="ozet-kart">
            <div className="kart-ikon" style={{ background: kart.bg }}>
              {kart.ikon}
            </div>
            <div className="kart-bilgi">
              <h3>
                {kart.para
                  ? formatPara(ozet[kart.key])
                  : ozet[kart.key]?.toLocaleString('tr-TR')}
              </h3>
              <p>{kart.label}</p>
              <div className={`kart-degisim ${kart.artis ? 'artis' : 'azalis'}`}>
                {kart.artis ? '↑' : '↓'} {kart.degisim} bu ay
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Grafikler */}
      <div className="iki-kolon">
        {/* Gelir - Gider Grafiği */}
        <div className="panel">
          <div className="panel-baslik">
            <h3>📈 Gelir & Gider Trendi</h3>
            <span className="text-sm text-muted">Son 6 ay</span>
          </div>
          <div className="panel-icerik">
            <div className="grafik-alani">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={aylikVeri}>
                  <defs>
                    <linearGradient id="gelirGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="giderGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="ay" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₺${v/1000}K`} />
                  <Tooltip formatter={(val) => [`₺${val.toLocaleString('tr-TR')}`, '']} />
                  <Legend />
                  <Area type="monotone" dataKey="gelir" name="Gelir" stroke="#3B82F6" fill="url(#gelirGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="gider" name="Gider" stroke="#EF4444" fill="url(#giderGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Şirket Gelir Dağılımı */}
        <div className="panel">
          <div className="panel-baslik">
            <h3>🥧 Şirket Bazlı Gelir Dağılımı</h3>
            <span className="text-sm text-muted">Bu ay</span>
          </div>
          <div className="panel-icerik">
            <div className="grafik-alani">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sirketDagilim}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {sirketDagilim.map((entry, index) => (
                      <Cell key={index} fill={entry.renk} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`₺${val.toLocaleString('tr-TR')}`, '']} />
                  <Legend
                    formatter={(value) => <span style={{ fontSize: '12px' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Şirketler Özeti */}
      <div className="panel mb-20">
        <div className="panel-baslik">
          <h3>🏢 Şirket & Şube Özeti</h3>
        </div>
        <div className="panel-icerik">
          <div className="sirket-grid">
            {SIRKETLER.map(sirket => {
              const sirketSubeleri = SUBELER.filter(s => s.sirketId === sirket.id);
              const sirketOgrenciler = OGRENCILER.filter(o =>
                sirketSubeleri.some(s => s.id === o.subeId)
              );
              return (
                <div
                  key={sirket.id}
                  className="sirket-kart"
                  style={{ borderTopColor: sirket.renk }}
                >
                  <div className="sirket-baslik">
                    <span className="sirket-ikon">{sirket.ikon}</span>
                    <div className="sirket-ad">
                      <h3>{sirket.ad.split(' ').slice(0, 2).join(' ')}</h3>
                      <span>{sirketSubeleri.length} Şube</span>
                    </div>
                  </div>
                  <div className="sirket-istatistik">
                    <div className="sirket-istat">
                      <div className="deger" style={{ color: sirket.renk }}>
                        {sirketSubeleri.length}
                      </div>
                      <div className="etiket">Şube</div>
                    </div>
                    <div className="sirket-istat">
                      <div className="deger">{sirketOgrenciler.length}</div>
                      <div className="etiket">Öğrenci</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Son Öğrenciler */}
      <div className="panel">
        <div className="panel-baslik">
          <h3>👨‍🎓 Son Kayıt Olan Öğrenciler</h3>
          <span className="text-sm text-muted badge badge-mavi">Bu Hafta: 12</span>
        </div>
        <div className="tablo-container">
          <table>
            <thead>
              <tr>
                <th>Öğrenci</th>
                <th>Kurs Tipi</th>
                <th>Şube</th>
                <th>Durum</th>
                <th>Ödeme</th>
              </tr>
            </thead>
            <tbody>
              {sonOgrenciler.map(ogr => {
                const sube = SUBELER.find(s => s.id === ogr.subeId);
                const odemeOrani = Math.round((ogr.odenenUcret / ogr.toplamUcret) * 100);
                return (
                  <tr key={ogr.id}>
                    <td>
                      <div className="font-semibold">{ogr.ad} {ogr.soyad}</div>
                      <div className="text-xs text-muted">{ogr.telefon}</div>
                    </td>
                    <td><span className="badge badge-mavi">{ogr.kurstipi}</span></td>
                    <td className="text-sm">{sube?.ad?.split(' - ')[1] || sube?.ad}</td>
                    <td>
                      <span className={`badge ${ogr.durum === 'tamamladi' ? 'badge-yesil' : 'badge-sari'}`}>
                        {ogr.durum === 'tamamladi' ? '✅ Tamamladı' : '🔄 Devam Ediyor'}
                      </span>
                    </td>
                    <td>
                      <div className="text-sm mb-4">
                        ₺{ogr.odenenUcret.toLocaleString('tr-TR')} / ₺{ogr.toplamUcret.toLocaleString('tr-TR')}
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-dolu"
                          style={{
                            width: `${odemeOrani}%`,
                            background: odemeOrani === 100 ? '#10B981' : '#3B82F6'
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
