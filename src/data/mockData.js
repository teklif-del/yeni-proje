// =============================================
// VERİ — Supabase'den gelir, burada sabit
// tanımlamalar sadece referans için kalır
// =============================================

// Sabit referans (şubeler/şirketler Supabase'den çekilir)
// Bu dosya artık sadece uygulama başlangıcında
// boş array döndürür; gerçek veriler her sayfada
// useEffect ile Supabase'den yüklenir.

export const SIRKETLER = [];
export const SUBELER   = [];
export const OGRENCILER = [];
export const GELIRLER   = [];
export const GIDERLER   = [];
export const PERSONEL   = [];
export const ARACLAR    = [];

export const getDashboardOzet = () => ({
  toplamSube: 0, toplamOgrenci: 0, aktifOgrenci: 0,
  toplamGelir: 0, toplamGider: 0, netKar: 0,
  toplamPersonel: 0, toplamArac: 0,
});

export const getAylikGelirGider = () => [
  { ay: 'Eki', gelir: 0, gider: 0 },
  { ay: 'Kas', gelir: 0, gider: 0 },
  { ay: 'Ara', gelir: 0, gider: 0 },
  { ay: 'Oca', gelir: 0, gider: 0 },
  { ay: 'Şub', gelir: 0, gider: 0 },
  { ay: 'Mar', gelir: 0, gider: 0 },
];

export const getSirketGelirDagilimi = () => [];
