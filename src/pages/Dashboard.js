import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { dbSirketler, dbSubeler, dbOgrenciler, dbGelirler, dbGiderler, dbPersonel, dbAraclar } from '../lib/db';

const formatPara = (sayi) => {
  if (sayi >= 1000000) return `₺${(sayi / 1000000).toFixed(1)}M`;
  if (sayi >= 1000) return `₺${(sayi / 1000).toFixed(0)}K`;
  return `₺${sayi.toLocaleString('tr-TR')}`;
};

const OZET_KARTLAR = [
  { key: 'toplamSube', ikon: '🏢', label: 'Toplam Şube', renk: '#3B82F6', bg: '#DBEAFE' },
  { key: 'toplamOgrenci', ikon: '👨‍🎓', label: 'Toplam Öğrenci', renk: '#10B981', bg: '#DCFCE7' },
  { key: 'aktifOgrenci', ikon: '✅', label: 'Aktif Öğrenci', renk: '#F59E0B', bg: '#FEF9C3' },
  { key: 'toplamPersonel', ikon: '👥', label: 'Personel Sayısı', renk: '#8B5CF6', bg: '#EDE9FE' },
  { key: 'toplamGelir', ikon: '💰', label: 'Toplam Gelir', renk: '#10B981', bg: '#DCFCE7', para: true },
  { key: 'toplamGider', ikon: '📉', label: 'Toplam Gider', renk: '#EF4444', bg: '#FEE2E2', para: true },
  { key: 'netKar', ikon: '📊', label: 'Net Kar', renk: '#06B6D4', bg: '#CFFAFE', para: true },
  { key: 'toplamArac', ikon: '🚗', label: 'Toplam Araç', renk: '#84CC16', bg: '#ECFCCB' },
];

const AY_ADLARI = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
const RENKLER = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#06B6D4','#84CC16'];

function Dashboard() {
  const [sirketler, setSirketler] = useState([]);
  const [subeler, setSubeler] = useState([]);
  const [ogrenciler, setOgrenciler] = useState([]);
  const [gelirler, setGelirler] = useState([]);
  const [giderler, setGiderler] = useState([]);
  const [personel, setPersonel] = useState([]);
  const [araclar, setAraclar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    async function yukle() {
      const [sir, sub, ogr, gel, gid, per, ara] = await Promise.all([
        dbSirketler.getAll(),
        dbSubeler.getAll(),
        dbOgrenciler.getAll(),
        dbGelirler.getAll(),
        dbGiderler.getAll(),
        dbPersonel.getAll(),
        dbAraclar.getAll(),
      ]);
      setSirketler(sir);
      setSubeler(sub);
      setOgrenciler(ogr);
      setGelirler(gel);
      setGiderler(gid);
      setPersonel(per);
      setAraclar(ara);
      setYukleniyor(false);
    }
    yukle();
  }, []);

  // Özet hesaplar
  const toplamGelir = gelirler.reduce((s, g) => s + g.tutar, 0);
  const toplamGider = giderler.reduce((s, g) => s + g.tutar, 0);
  const ozet = {
    toplamSube: subeler.length,
    toplamOgrenci: ogrenciler.length,
    aktifOgrenci: ogrenciler.filter(o => o.durum === 'devam_ediyor').length,
    toplamPersonel: personel.filter(p => p.aktif !== false).length,
    toplamGelir,
    toplamGider,
    netKar: toplamGelir - toplamGider,
    toplamArac: araclar.filter(a => a.aktif !== false).length,
  };

  // Aylık gelir/gider (son 6 ay)
  const bugun = new Date();
  const aylikVeri = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(bugun.getFullYear(), bugun.getMonth() - 5 + i, 1);
    const ay = d.getMonth();
    const yil = d.getFullYear();
    const gelir = gelirler.filter(g => {
      const t = new Date(g.tarih);
      return t.getMonth() === ay && t.getFullYear() === yil;
    }).reduce((s, g) => s + g.tutar, 0);
    const gider = giderler.filter(g => {
      const t = new Date(g.tarih);
      return t.getMonth() === ay && t.getFullYear() === yil;
    }).reduce((s, g) => s + g.tutar, 0);
    return { ay: AY_ADLARI[ay], gelir, gider };
  });

  // Şirket bazlı gelir dağılımı
  const sirketGelir = sirketler.map((sir, idx) => {
    const sirketSubeleri = subeler.filter(s => s.sirket_id === sir.id || s.sirketId === sir.id);
    const toplam = sirketSubeleri.reduce((sum, sb) => {
      return sum + gelirler.filter(g => g.subeId === sb.id).reduce((s, g) => s + g.tutar, 0);
    }, 0);
    return { name: sir.ad, value: toplam, renk: sir.renk || RENKLER[idx % RENKLER.length] };
  }).filter(s => s.value > 0);

  // Son kayıt öğrenciler
  const sonOgrenciler = [...ogrenciler]
    .sort((a, b) => new Date(b.kayitTarihi) - new Date(a.kayitTarihi))
    .slice(0, 5);

  if (yukleniyor) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '48px' }}>⏳</div>
        <div style={{ fontSize: '16px', color: '#64748B', fontWeight: '600' }}>Veriler yükleniyor...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="sayfa-baslik">
        <h1>📊 Genel Bakış</h1>
        <p>Tüm şubeler ve şirketlerin anlık özeti • {new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Özet Kartlar */}
      <div className="ozet-kartlar">
        {OZET_KARTLAR.map(kart => (
          <div key={kart.key} className="ozet-kart">
            <div className="kart-ikon" style={{ background: kart.bg }}>
              {kart.ikon}
            </div>
            <div className="kart-bilgi">
              <h3 style={{ color: kart.renk }}>
                {kart.para
                  ? formatPara(ozet[kart.key])
                  : ozet[kart.key]?.toLocaleString('tr-TR')}
              </h3>
              <p>{kart.label}</p>
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
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₺${v / 1000}K`} />
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
            <span className="text-sm text-muted">Tüm zamanlar</span>
          </div>
          <div className="panel-icerik">
            <div className="grafik-alani">
              {sirketGelir.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8', fontSize: '14px' }}>
                  Henüz gelir kaydı yok
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sirketGelir} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                      {sirketGelir.map((entry, index) => (
                        <Cell key={index} fill={entry.renk} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => [`₺${val.toLocaleString('tr-TR')}`, '']} />
                    <Legend formatter={(value) => <span style={{ fontSize: '12px' }}>{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              )}
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
            {sirketler.map(sirket => {
              const sirketSubeleri = subeler.filter(s => s.sirket_id === sirket.id || s.sirketId === sirket.id);
              const sirketOgrenciler = ogrenciler.filter(o =>
                sirketSubeleri.some(s => s.id === o.subeId)
              );
              return (
                <div key={sirket.id} className="sirket-kart" style={{ borderTopColor: sirket.renk }}>
                  <div className="sirket-baslik">
                    <span className="sirket-ikon">{sirket.ikon}</span>
                    <div className="sirket-ad">
                      <h3>{sirket.ad}</h3>
                      <span>{sirketSubeleri.length} Şube</span>
                    </div>
                  </div>
                  <div className="sirket-istatistik">
                    <div className="sirket-istat">
                      <div className="deger" style={{ color: sirket.renk }}>{sirketSubeleri.length}</div>
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
        </div>
        <div className="tablo-container">
          {sonOgrenciler.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>Henüz öğrenci kaydı yok.</div>
          ) : (
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
                  const sube = subeler.find(s => s.id === ogr.subeId);
                  const odemeOrani = ogr.toplamUcret > 0 ? Math.round((ogr.odenenUcret / ogr.toplamUcret) * 100) : 0;
                  return (
                    <tr key={ogr.id}>
                      <td>
                        <div className="font-semibold">{ogr.ad} {ogr.soyad}</div>
                        <div className="text-xs text-muted">{ogr.telefon}</div>
                      </td>
                      <td><span className="badge badge-mavi">{ogr.kurstipi}</span></td>
                      <td className="text-sm">{sube?.ad || sube?.ilce}</td>
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
                          <div className="progress-dolu" style={{
                            width: `${odemeOrani}%`,
                            background: odemeOrani === 100 ? '#10B981' : '#3B82F6'
                          }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
