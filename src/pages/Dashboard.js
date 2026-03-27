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

const AY_ADLARI = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
const RENKLER   = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#06B6D4','#84CC16'];

function Dashboard({ navigate }) {
  const [sirketler, setSirketler] = useState([]);
  const [subeler,   setSubeler]   = useState([]);
  const [ogrenciler,setOgrenciler]= useState([]);
  const [gelirler,  setGelirler]  = useState([]);
  const [giderler,  setGiderler]  = useState([]);
  const [personel,  setPersonel]  = useState([]);
  const [araclar,   setAraclar]   = useState([]);
  const [yukleniyor,setYukleniyor]= useState(true);

  useEffect(() => {
    async function yukle() {
      const [sir, sub, ogr, gel, gid, per, ara] = await Promise.all([
        dbSirketler.getAll(), dbSubeler.getAll(), dbOgrenciler.getAll(),
        dbGelirler.getAll(), dbGiderler.getAll(), dbPersonel.getAll(), dbAraclar.getAll(),
      ]);
      setSirketler(sir); setSubeler(sub); setOgrenciler(ogr);
      setGelirler(gel); setGiderler(gid); setPersonel(per); setAraclar(ara);
      setYukleniyor(false);
    }
    yukle();
  }, []);

  const toplamGelir = gelirler.reduce((s, g) => s + g.tutar, 0);
  const toplamGider = giderler.reduce((s, g) => s + g.tutar, 0);
  const netKar = toplamGelir - toplamGider;

  const ozet = {
    toplamSube:     subeler.length,
    toplamOgrenci:  ogrenciler.length,
    aktifOgrenci:   ogrenciler.filter(o => o.durum === 'devam_ediyor').length,
    toplamPersonel: personel.filter(p => p.aktif !== false).length,
    toplamGelir,
    toplamGider,
    netKar,
    toplamArac:     araclar.filter(a => a.aktif !== false).length,
  };

  // Son 6 ay aylık trend
  const bugun = new Date();
  const aylikVeri = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(bugun.getFullYear(), bugun.getMonth() - 5 + i, 1);
    const ay = d.getMonth(); const yil = d.getFullYear();
    const gelir = gelirler.filter(g => { const t = new Date(g.tarih); return t.getMonth()===ay && t.getFullYear()===yil; }).reduce((s,g)=>s+g.tutar,0);
    const gider = giderler.filter(g => { const t = new Date(g.tarih); return t.getMonth()===ay && t.getFullYear()===yil; }).reduce((s,g)=>s+g.tutar,0);
    return { ay: AY_ADLARI[ay], gelir, gider, kar: gelir - gider };
  });

  // Şirket bazlı gelir dağılımı
  const sirketGelir = sirketler.map((sir, idx) => {
    const sirketSubeleri = subeler.filter(s => (s.sirket_id||s.sirketId) === sir.id);
    const toplam = sirketSubeleri.reduce((sum, sb) =>
      sum + gelirler.filter(g => g.subeId === sb.id).reduce((s,g) => s+g.tutar, 0), 0);
    return { name: sir.ad, value: toplam, renk: sir.renk || RENKLER[idx % RENKLER.length] };
  }).filter(s => s.value > 0);

  // Şube bazlı özet
  const subeBazliOzet = subeler.map(sb => {
    const sir = sirketler.find(s => s.id === (sb.sirket_id || sb.sirketId));
    const gelir = gelirler.filter(g => g.subeId === sb.id).reduce((s,g)=>s+g.tutar,0);
    const gider = giderler.filter(g => g.subeId === sb.id).reduce((s,g)=>s+g.tutar,0);
    const ogrSayisi = ogrenciler.filter(o => o.subeId === sb.id).length;
    return { ...sb, sirket: sir, gelir, gider, netKar: gelir - gider, ogrSayisi };
  }).sort((a,b) => b.gelir - a.gelir);

  if (yukleniyor) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', flexDirection:'column', gap:'16px' }}>
        <div style={{ fontSize:'48px' }}>⏳</div>
        <div style={{ fontSize:'16px', color:'#64748B', fontWeight:'600' }}>Veriler yükleniyor...</div>
      </div>
    );
  }

  const kartlar = [
    { ikon:'🏢', label:'Toplam Şube',     deger: ozet.toplamSube,     renk:'#3B82F6', bg:'#DBEAFE', para:false },
    { ikon:'👨‍🎓', label:'Toplam Öğrenci', deger: ozet.toplamOgrenci,  renk:'#10B981', bg:'#DCFCE7', para:false },
    { ikon:'✅', label:'Aktif Öğrenci',   deger: ozet.aktifOgrenci,   renk:'#F59E0B', bg:'#FEF9C3', para:false },
    { ikon:'👥', label:'Personel',         deger: ozet.toplamPersonel, renk:'#8B5CF6', bg:'#EDE9FE', para:false },
    { ikon:'💰', label:'Toplam Gelir',     deger: ozet.toplamGelir,    renk:'#10B981', bg:'#DCFCE7', para:true  },
    { ikon:'📉', label:'Toplam Gider',     deger: ozet.toplamGider,    renk:'#EF4444', bg:'#FEE2E2', para:true  },
    { ikon:'📊', label:'Net Kâr',          deger: ozet.netKar,         renk: netKar >= 0 ? '#06B6D4' : '#EF4444', bg: netKar >= 0 ? '#CFFAFE' : '#FEE2E2', para:true },
    { ikon:'🚗', label:'Toplam Araç',      deger: ozet.toplamArac,     renk:'#84CC16', bg:'#ECFCCB', para:false },
  ];

  return (
    <div>
      <div className="sayfa-baslik">
        <h1>📊 Genel Bakış</h1>
        <p>Tüm şubeler ve şirketlerin anlık özeti • {new Date().toLocaleDateString('tr-TR', { month:'long', year:'numeric' })}</p>
      </div>

      {/* Özet Kartlar */}
      <div className="ozet-kartlar">
        {kartlar.map((k, i) => (
          <div key={i} className="ozet-kart">
            <div className="kart-ikon" style={{ background: k.bg }}>{k.ikon}</div>
            <div className="kart-bilgi">
              <h3 style={{ color: k.renk }}>
                {k.para ? formatPara(k.deger) : k.deger?.toLocaleString('tr-TR')}
              </h3>
              <p>{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Grafikler */}
      <div className="iki-kolon">
        {/* Gelir - Gider Trendi */}
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
                      <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="giderGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="ay" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₺${v/1000}K`} />
                  <Tooltip formatter={val => [`₺${val.toLocaleString('tr-TR')}`, '']} />
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
            <h3>🥧 Şirket Bazlı Gelir</h3>
            <span className="text-sm text-muted">Tüm zamanlar</span>
          </div>
          <div className="panel-icerik">
            <div className="grafik-alani">
              {sirketGelir.length === 0 ? (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'#94A3B8', fontSize:'14px' }}>
                  Henüz gelir kaydı yok
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sirketGelir} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                      {sirketGelir.map((e, i) => <Cell key={i} fill={e.renk} />)}
                    </Pie>
                    <Tooltip formatter={val => [`₺${val.toLocaleString('tr-TR')}`, '']} />
                    <Legend formatter={v => <span style={{ fontSize:'12px' }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Şube Bazlı Performans Tablosu */}
      <div className="panel" style={{ marginBottom:'20px' }}>
        <div className="panel-baslik">
          <h3>🏢 Şube Performansı</h3>
          <span className="text-sm text-muted">{subeBazliOzet.length} şube</span>
        </div>
        {subeBazliOzet.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px', color:'#64748B' }}>Henüz şube kaydı yok.</div>
        ) : (
          <div className="tablo-container">
            <table>
              <thead>
                <tr>
                  <th>Şube</th>
                  <th>Şirket</th>
                  <th>Öğrenci</th>
                  <th>Toplam Gelir</th>
                  <th>Toplam Gider</th>
                  <th>Net Kâr</th>
                  <th>Durum</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {subeBazliOzet.map(sb => (
                  <tr key={sb.id}>
                    <td>
                      <div style={{ fontWeight:'700', fontSize:'14px' }}>{sb.ad}</div>
                      <div style={{ fontSize:'11px', color:'#64748B' }}>📍 {sb.ilce}, {sb.sehir}</div>
                    </td>
                    <td>
                      {sb.sirket && (
                        <span style={{ background:(sb.sirket.renk||'#3B82F6')+'18', color:sb.sirket.renk||'#3B82F6', border:`1px solid ${sb.sirket.renk||'#3B82F6'}33`, padding:'3px 9px', borderRadius:'10px', fontSize:'12px', fontWeight:'700' }}>
                          {sb.sirket.ikon} {sb.sirket.ad}
                        </span>
                      )}
                    </td>
                    <td style={{ fontWeight:'700', textAlign:'center' }}>{sb.ogrSayisi}</td>
                    <td style={{ fontWeight:'700', color:'#15803D' }}>₺{sb.gelir.toLocaleString('tr-TR')}</td>
                    <td style={{ fontWeight:'700', color:'#DC2626' }}>₺{sb.gider.toLocaleString('tr-TR')}</td>
                    <td>
                      <span style={{ fontWeight:'800', color: sb.netKar >= 0 ? '#15803D' : '#DC2626', fontSize:'14px' }}>
                        {sb.netKar >= 0 ? '+' : ''}₺{sb.netKar.toLocaleString('tr-TR')}
                      </span>
                    </td>
                    <td>
                      <span style={{ background: sb.aktif !== false ? '#DCFCE7' : '#FEE2E2', color: sb.aktif !== false ? '#14532D' : '#991B1B', padding:'4px 10px', borderRadius:'12px', fontSize:'11px', fontWeight:'700' }}>
                        {sb.aktif !== false ? '✅ Aktif' : '❌ Pasif'}
                      </span>
                    </td>
                    <td>
                      {navigate && (
                        <button
                          onClick={() => navigate('sube_detay', { subeId: sb.id, sirketId: sb.sirket_id || sb.sirketId })}
                          style={{ background:'#EFF6FF', color:'#2563EB', border:'none', borderRadius:'6px', padding:'5px 12px', fontSize:'12px', cursor:'pointer', fontWeight:'600', whiteSpace:'nowrap' }}>
                          🔍 Detay
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Şirketler Özet Kartları */}
      <div className="panel">
        <div className="panel-baslik"><h3>🏢 Şirket Özeti</h3></div>
        <div className="panel-icerik">
          <div className="sirket-grid">
            {sirketler.map(sirket => {
              const sirketSubeleri = subeler.filter(s => (s.sirket_id||s.sirketId) === sirket.id);
              const sirketOgrenciler = ogrenciler.filter(o => sirketSubeleri.some(s => s.id === o.subeId));
              const sirketGelirToplam = sirketSubeleri.reduce((sum, sb) =>
                sum + gelirler.filter(g => g.subeId === sb.id).reduce((s,g)=>s+g.tutar,0), 0);
              return (
                <div key={sirket.id} className="sirket-kart" style={{ borderTopColor: sirket.renk, cursor:'pointer' }}
                  onClick={() => navigate && navigate('subeler', { sirketId: sirket.id })}>
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
                    <div className="sirket-istat">
                      <div className="deger" style={{ color:'#10B981', fontSize:'13px' }}>{formatPara(sirketGelirToplam)}</div>
                      <div className="etiket">Gelir</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
