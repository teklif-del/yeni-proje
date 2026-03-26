import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Subeler from './pages/Subeler';
import SubeDetay from './pages/SubeDetay';
import Ogrenciler from './pages/Ogrenciler';
import FinansPage from './pages/FinansPage';
import PersonelPage from './pages/PersonelPage';
import AraclarPage from './pages/AraclarPage';
import RaporlarPage from './pages/RaporlarPage';
import KiraPage from './pages/KiraPage';
import GiderlerPage from './pages/GiderlerPage';
import GelirlerPage from './pages/GelirlerPage';
import './App.css';

function App() {
  const [aktifSayfa, setAktifSayfa] = useState('dashboard');
  const [sidebarAcik, setSidebarAcik] = useState(true);
  // seçili şube/şirket navigasyonu
  const [secilenSube, setSecilenSube]     = useState(null);  // { subeId, sirketId }
  const [secilenSirket, setSecilenSirket] = useState(null);  // direkt şirkete git → şube listesi

  // Sayfa + şube/şirket birlikte set eden yardımcı
  const navigate = (sayfa, extra = {}) => {
    setAktifSayfa(sayfa);
    if (extra.subeId !== undefined) setSecilenSube({ subeId: extra.subeId, sirketId: extra.sirketId });
    else setSecilenSube(null);
    if (extra.sirketId !== undefined && extra.subeId === undefined) setSecilenSirket(extra.sirketId);
    else if (!extra.sirketId) setSecilenSirket(null);
  };

  const sayfaRender = () => {
    switch (aktifSayfa) {
      case 'dashboard':  return <Dashboard navigate={navigate} />;
      case 'subeler':    return <Subeler navigate={navigate} secilenSirketId={secilenSirket} />;
      case 'sube_detay': return <SubeDetay subeId={secilenSube?.subeId} navigate={navigate} />;
      case 'ogrenciler': return <Ogrenciler />;
      case 'finans':     return <FinansPage />;
      case 'personel':   return <PersonelPage />;
      case 'araclar':    return <AraclarPage />;
      case 'raporlar':   return <RaporlarPage />;
      case 'giderler':   return <GiderlerPage />;
      case 'gelirler':   return <GelirlerPage />;
      case 'kira':       return <KiraPage />;
      default:           return <Dashboard navigate={navigate} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        aktifSayfa={aktifSayfa}
        setAktifSayfa={setAktifSayfa}
        acik={sidebarAcik}
        setAcik={setSidebarAcik}
        navigate={navigate}
      />
      <main className={`main-content ${sidebarAcik ? 'sidebar-acik' : 'sidebar-kapali'}`}>
        <div className="mobile-header">
          <button className="menu-btn" onClick={() => setSidebarAcik(!sidebarAcik)}>☰</button>
          <span className="mobile-logo">🎓 Kurs Yönetim</span>
        </div>
        <div className="sayfa-icerik">
          {sayfaRender()}
        </div>
      </main>
    </div>
  );
}

export default App;
