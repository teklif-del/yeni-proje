// =============================================
// VERİ DOSYASI
// =============================================

export const SIRKETLER = [
  { id: 1, ad: "Sürücü Kursu A.Ş.", tip: "surucu_kursu", renk: "#3B82F6", ikon: "🚗" },
  { id: 2, ad: "İş Makineleri Kursu Ltd.", tip: "is_makineleri", renk: "#10B981", ikon: "🏗️" },
  { id: 3, ad: "SRC Kursu A.Ş.", tip: "src_kursu", renk: "#F59E0B", ikon: "📋" },
  { id: 4, ad: "Psikoteknik Merkezi Ltd.", tip: "psikoteknik", renk: "#8B5CF6", ikon: "🧠" },
  { id: 5, ad: "SRC 5 Eğitim A.Ş.", tip: "src5_kursu", renk: "#EF4444", ikon: "📄" },
  { id: 6, ad: "TMGD Eğitim Ltd.", tip: "tmgd_kursu", renk: "#06B6D4", ikon: "🚛" },
  { id: 7, ad: "Kira Gelirleri Holding", tip: "kira", renk: "#84CC16", ikon: "🏠" },
];

export const SUBELER = [
  // Sürücü Kursu - 8 Şube
  { id: 1,  sirketId: 1, ad: "Sürücü Kursu - Merkez",    sehir: "Balıkesir", ilce: "Merkez",    adres: "", telefon: "", aktif: true },
  { id: 2,  sirketId: 1, ad: "Sürücü Kursu - Karesi",    sehir: "Balıkesir", ilce: "Karesi",    adres: "", telefon: "", aktif: true },
  { id: 3,  sirketId: 1, ad: "Sürücü Kursu - Paşaalanı", sehir: "Balıkesir", ilce: "Paşaalanı", adres: "", telefon: "", aktif: true },
  { id: 4,  sirketId: 1, ad: "Sürücü Kursu - Bigadiç",   sehir: "Balıkesir", ilce: "Bigadiç",   adres: "", telefon: "", aktif: true },
  { id: 5,  sirketId: 1, ad: "Sürücü Kursu - Kepsut",    sehir: "Balıkesir", ilce: "Kepsut",    adres: "", telefon: "", aktif: true },
  { id: 6,  sirketId: 1, ad: "Sürücü Kursu - Dursunbey", sehir: "Balıkesir", ilce: "Dursunbey", adres: "", telefon: "", aktif: true },
  { id: 7,  sirketId: 1, ad: "Sürücü Kursu - Plevne",    sehir: "Balıkesir", ilce: "Plevne",    adres: "", telefon: "", aktif: true },
  { id: 8,  sirketId: 1, ad: "Sürücü Kursu - Tan",       sehir: "Balıkesir", ilce: "Tan",       adres: "", telefon: "", aktif: true },
  // İş Makineleri - 1 Şube
  { id: 9,  sirketId: 2, ad: "İş Makineleri - Merkez",   sehir: "Balıkesir", ilce: "Merkez",    adres: "", telefon: "", aktif: true },
  // SRC Kursu - 3 Şube
  { id: 10, sirketId: 3, ad: "Okan SRC",                 sehir: "Balıkesir", ilce: "Okan SRC",           adres: "", telefon: "", aktif: true },
  { id: 11, sirketId: 3, ad: "Sürüş Akademisi",          sehir: "Balıkesir", ilce: "Sürüş Akademisi",    adres: "", telefon: "", aktif: true },
  { id: 12, sirketId: 3, ad: "Çetinel SRC",              sehir: "Balıkesir", ilce: "Çetinel SRC",        adres: "", telefon: "", aktif: true },
  // Psikoteknik - 2 Şube
  { id: 13, sirketId: 4, ad: "Okan Psikoteknik",         sehir: "Balıkesir", ilce: "Okan Psikoteknik",   adres: "", telefon: "", aktif: true },
  { id: 14, sirketId: 4, ad: "Çetinel Psikoteknik",      sehir: "Balıkesir", ilce: "Çetinel Psikoteknik",adres: "", telefon: "", aktif: true },
  // SRC 5 - 1 Şube
  { id: 15, sirketId: 5, ad: "SRC 5 - Merkez",          sehir: "Balıkesir", ilce: "Merkez",    adres: "", telefon: "", aktif: true },
  // TMGD - 1 Şube
  { id: 16, sirketId: 6, ad: "TMGD - Merkez",           sehir: "Balıkesir", ilce: "Merkez",    adres: "", telefon: "", aktif: true },
  // Kira
  { id: 17, sirketId: 7, ad: "Kira Gelirleri - Genel",  sehir: "Balıkesir", ilce: "Genel",     adres: "", telefon: "", aktif: true },
];

export const OGRENCILER = [];

export const GELIRLER = [];

export const GIDERLER = [];

export const PERSONEL = [];

export const ARACLAR = [];

// Dashboard için özet veriler
export const getDashboardOzet = () => {
  const toplamSube     = SUBELER.length;
  const toplamOgrenci  = OGRENCILER.length;
  const aktifOgrenci   = OGRENCILER.filter(o => o.durum === "devam_ediyor").length;
  const toplamGelir    = GELIRLER.reduce((sum, g) => sum + g.tutar, 0);
  const toplamGider    = GIDERLER.reduce((sum, g) => sum + g.tutar, 0);
  const netKar         = toplamGelir - toplamGider;

  return {
    toplamSube,
    toplamOgrenci,
    aktifOgrenci,
    toplamGelir,
    toplamGider,
    netKar,
    toplamPersonel: PERSONEL.length,
    toplamArac:     ARACLAR.length,
  };
};

export const getAylikGelirGider = () => {
  return [
    { ay: "Eki", gelir: 0, gider: 0 },
    { ay: "Kas", gelir: 0, gider: 0 },
    { ay: "Ara", gelir: 0, gider: 0 },
    { ay: "Oca", gelir: 0, gider: 0 },
    { ay: "Şub", gelir: 0, gider: 0 },
    { ay: "Mar", gelir: 0, gider: 0 },
  ];
};

export const getSirketGelirDagilimi = () => {
  return SIRKETLER.map(s => {
    const subeIds = SUBELER.filter(sb => sb.sirketId === s.id).map(sb => sb.id);
    const gelir   = GELIRLER.filter(g => subeIds.includes(g.subeId)).reduce((sum, g) => sum + g.tutar, 0);
    return { name: s.ad.split(" ")[0] + " " + (s.ad.split(" ")[1] || ""), value: gelir, renk: s.renk };
  });
};
