// =============================================
// MOCK DATA - Gerçek verilerle değiştirilecek
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
  { id: 1, sirketId: 1, ad: "Sürücü Kursu - Merkez Şube", sehir: "İstanbul", ilce: "Kadıköy", adres: "Kadıköy Mah. Örnek Sok. No:1", telefon: "0216 xxx xx xx", aktif: true },
  { id: 2, sirketId: 1, ad: "Sürücü Kursu - Anadolu Şube", sehir: "İstanbul", ilce: "Ümraniye", adres: "Ümraniye Mah. Örnek Sok. No:2", telefon: "0216 xxx xx xx", aktif: true },
  { id: 3, sirketId: 1, ad: "Sürücü Kursu - Avrupa Şube", sehir: "İstanbul", ilce: "Bağcılar", adres: "Bağcılar Mah. Örnek Sok. No:3", telefon: "0212 xxx xx xx", aktif: true },
  { id: 4, sirketId: 1, ad: "Sürücü Kursu - Kuzey Şube", sehir: "İstanbul", ilce: "Sarıyer", adres: "Sarıyer Mah. Örnek Sok. No:4", telefon: "0212 xxx xx xx", aktif: true },
  { id: 5, sirketId: 1, ad: "Sürücü Kursu - Güney Şube", sehir: "İstanbul", ilce: "Maltepe", adres: "Maltepe Mah. Örnek Sok. No:5", telefon: "0216 xxx xx xx", aktif: true },
  { id: 6, sirketId: 1, ad: "Sürücü Kursu - Ankara Şube", sehir: "Ankara", ilce: "Çankaya", adres: "Çankaya Mah. Örnek Sok. No:6", telefon: "0312 xxx xx xx", aktif: true },
  { id: 7, sirketId: 1, ad: "Sürücü Kursu - İzmir Şube", sehir: "İzmir", ilce: "Bornova", adres: "Bornova Mah. Örnek Sok. No:7", telefon: "0232 xxx xx xx", aktif: true },
  { id: 8, sirketId: 1, ad: "Sürücü Kursu - Bursa Şube", sehir: "Bursa", ilce: "Osmangazi", adres: "Osmangazi Mah. Örnek Sok. No:8", telefon: "0224 xxx xx xx", aktif: true },
  // İş Makineleri - 1 Şube
  { id: 9, sirketId: 2, ad: "İş Makineleri - Merkez", sehir: "İstanbul", ilce: "Pendik", adres: "Pendik Mah. Örnek Sok. No:1", telefon: "0216 xxx xx xx", aktif: true },
  // SRC Kursu - 3 Şube
  { id: 10, sirketId: 3, ad: "SRC Kursu - Merkez Şube", sehir: "İstanbul", ilce: "Kadıköy", adres: "Kadıköy Mah. Örnek Sok. No:10", telefon: "0216 xxx xx xx", aktif: true },
  { id: 11, sirketId: 3, ad: "SRC Kursu - Ankara Şube", sehir: "Ankara", ilce: "Etimesgut", adres: "Etimesgut Mah. Örnek Sok. No:11", telefon: "0312 xxx xx xx", aktif: true },
  { id: 12, sirketId: 3, ad: "SRC Kursu - İzmir Şube", sehir: "İzmir", ilce: "Konak", adres: "Konak Mah. Örnek Sok. No:12", telefon: "0232 xxx xx xx", aktif: true },
  // Psikoteknik - 2 Şube
  { id: 13, sirketId: 4, ad: "Psikoteknik - Merkez Şube", sehir: "İstanbul", ilce: "Şişli", adres: "Şişli Mah. Örnek Sok. No:13", telefon: "0212 xxx xx xx", aktif: true },
  { id: 14, sirketId: 4, ad: "Psikoteknik - Anadolu Şube", sehir: "İstanbul", ilce: "Kartal", adres: "Kartal Mah. Örnek Sok. No:14", telefon: "0216 xxx xx xx", aktif: true },
  // SRC 5 - 1 Şube
  { id: 15, sirketId: 5, ad: "SRC 5 - Merkez", sehir: "İstanbul", ilce: "Bakırköy", adres: "Bakırköy Mah. Örnek Sok. No:15", telefon: "0212 xxx xx xx", aktif: true },
  // TMGD - 1 Şube
  { id: 16, sirketId: 6, ad: "TMGD - Merkez", sehir: "İstanbul", ilce: "Levent", adres: "Levent Mah. Örnek Sok. No:16", telefon: "0212 xxx xx xx", aktif: true },
  // Kira - 1 Şirket
  { id: 17, sirketId: 7, ad: "Kira Gelirleri - Genel Merkez", sehir: "İstanbul", ilce: "Beşiktaş", adres: "Beşiktaş Mah. Örnek Sok. No:17", telefon: "0212 xxx xx xx", aktif: true },
];

export const OGRENCILER = [
  { id: 1, subeId: 1, ad: "Ahmet", soyad: "Yılmaz", tc: "12345678901", telefon: "0532 xxx xx xx", email: "ahmet@example.com", kayitTarihi: "2025-01-10", kurstipi: "B Sınıfı", durum: "devam_ediyor", toplamUcret: 8500, odenenUcret: 5000 },
  { id: 2, subeId: 1, ad: "Ayşe", soyad: "Kaya", tc: "12345678902", telefon: "0533 xxx xx xx", email: "ayse@example.com", kayitTarihi: "2025-01-15", kurstipi: "B Sınıfı", durum: "tamamladi", toplamUcret: 8500, odenenUcret: 8500 },
  { id: 3, subeId: 2, ad: "Mehmet", soyad: "Demir", tc: "12345678903", telefon: "0534 xxx xx xx", email: "mehmet@example.com", kayitTarihi: "2025-02-01", kurstipi: "A Sınıfı", durum: "devam_ediyor", toplamUcret: 6000, odenenUcret: 3000 },
  { id: 4, subeId: 10, ad: "Fatma", soyad: "Çelik", tc: "12345678904", telefon: "0535 xxx xx xx", email: "fatma@example.com", kayitTarihi: "2025-02-10", kurstipi: "SRC 2", durum: "devam_ediyor", toplamUcret: 4500, odenenUcret: 2000 },
  { id: 5, subeId: 13, ad: "Ali", soyad: "Şahin", tc: "12345678905", telefon: "0536 xxx xx xx", email: "ali@example.com", kayitTarihi: "2025-03-01", kurstipi: "Psikoteknik", durum: "devam_ediyor", toplamUcret: 800, odenenUcret: 800 },
];

export const GELIRLER = [
  { id: 1, subeId: 1, tarih: "2025-03-01", tutar: 15000, tip: "kurs_ucreti", aciklama: "Ocak ayı kurs ödemeleri", ogrenciId: null },
  { id: 2, subeId: 1, tarih: "2025-03-05", tutar: 8500, tip: "kurs_ucreti", aciklama: "Şubat kayıt ödemeleri", ogrenciId: 2 },
  { id: 3, subeId: 2, tarih: "2025-03-10", tutar: 12000, tip: "kurs_ucreti", aciklama: "Mart kayıt ödemeleri", ogrenciId: null },
  { id: 4, subeId: 17, tarih: "2025-03-01", tutar: 25000, tip: "kira_geliri", aciklama: "Mart kirası - Mülk 1", ogrenciId: null },
  { id: 5, subeId: 17, tarih: "2025-03-01", tutar: 18000, tip: "kira_geliri", aciklama: "Mart kirası - Mülk 2", ogrenciId: null },
  { id: 6, subeId: 10, tarih: "2025-03-15", tutar: 9000, tip: "kurs_ucreti", aciklama: "SRC kurs ödemeleri", ogrenciId: null },
  { id: 7, subeId: 13, tarih: "2025-03-20", tutar: 4800, tip: "kurs_ucreti", aciklama: "Psikoteknik sınav ücretleri", ogrenciId: null },
];

export const GIDERLER = [
  { id: 1, subeId: 1, tarih: "2025-03-01", tutar: 8500, tip: "kira", aciklama: "Mart ayı kira ödemesi" },
  { id: 2, subeId: 1, tarih: "2025-03-05", tutar: 3200, tip: "personel", aciklama: "Mart maaş ödemeleri" },
  { id: 3, subeId: 1, tarih: "2025-03-10", tutar: 1500, tip: "yakıt", aciklama: "Araç yakıt gideri" },
  { id: 4, subeId: 2, tarih: "2025-03-01", tutar: 7000, tip: "kira", aciklama: "Mart ayı kira ödemesi" },
  { id: 5, subeId: 10, tarih: "2025-03-01", tutar: 4500, tip: "kira", aciklama: "Mart ayı kira ödemesi" },
];

export const PERSONEL = [
  { id: 1, subeId: 1, ad: "Kadir", soyad: "Öztürk", pozisyon: "Müdür", maas: 25000, telefon: "0537 xxx xx xx", iseGirisTarihi: "2020-01-01", aktif: true },
  { id: 2, subeId: 1, ad: "Zeynep", soyad: "Arslan", pozisyon: "Sürücü Eğitmeni", maas: 18000, telefon: "0538 xxx xx xx", iseGirisTarihi: "2021-03-15", aktif: true },
  { id: 3, subeId: 1, ad: "Hasan", soyad: "Koç", pozisyon: "Sürücü Eğitmeni", maas: 18000, telefon: "0539 xxx xx xx", iseGirisTarihi: "2022-06-01", aktif: true },
  { id: 4, subeId: 2, ad: "Elif", soyad: "Yıldız", pozisyon: "Müdür", maas: 22000, telefon: "0530 xxx xx xx", iseGirisTarihi: "2019-09-01", aktif: true },
  { id: 5, subeId: 10, ad: "Murat", soyad: "Güneş", pozisyon: "SRC Eğitmeni", maas: 20000, telefon: "0531 xxx xx xx", iseGirisTarihi: "2023-01-15", aktif: true },
];

export const ARACLAR = [
  { id: 1, subeId: 1, plaka: "34 AAA 001", marka: "Ford", model: "Focus", yil: 2022, sinif: "B", km: 45000, sonBakim: "2025-01-15", aktif: true },
  { id: 2, subeId: 1, plaka: "34 AAA 002", marka: "Renault", model: "Clio", yil: 2021, sinif: "B", km: 62000, sonBakim: "2025-02-10", aktif: true },
  { id: 3, subeId: 2, plaka: "34 BBB 001", marka: "Honda", model: "CB500", yil: 2023, sinif: "A", km: 12000, sonBakim: "2025-03-01", aktif: true },
  { id: 4, subeId: 9, plaka: "34 CCC 001", marka: "Caterpillar", model: "320", yil: 2020, sinif: "İş Makinesi", km: 3200, sonBakim: "2025-01-20", aktif: true },
];

// Dashboard için özet veriler
export const getDashboardOzet = () => {
  const toplamSube = SUBELER.length;
  const toplamOgrenci = OGRENCILER.length;
  const aktifOgrenci = OGRENCILER.filter(o => o.durum === "devam_ediyor").length;
  const toplamGelir = GELIRLER.reduce((sum, g) => sum + g.tutar, 0);
  const toplamGider = GIDERLER.reduce((sum, g) => sum + g.tutar, 0);
  const netKar = toplamGelir - toplamGider;

  return {
    toplamSube,
    toplamOgrenci,
    aktifOgrenci,
    toplamGelir,
    toplamGider,
    netKar,
    toplamPersonel: PERSONEL.length,
    toplamArac: ARACLAR.length,
  };
};

export const getAylikGelirGider = () => {
  return [
    { ay: "Eki", gelir: 85000, gider: 42000 },
    { ay: "Kas", gelir: 92000, gider: 45000 },
    { ay: "Ara", gelir: 78000, gider: 38000 },
    { ay: "Oca", gelir: 95000, gider: 48000 },
    { ay: "Şub", gelir: 102000, gider: 51000 },
    { ay: "Mar", gelir: 118000, gider: 55000 },
  ];
};

export const getSirketGelirDagilimi = () => {
  return SIRKETLER.map(s => {
    const subeIds = SUBELER.filter(sb => sb.sirketId === s.id).map(sb => sb.id);
    const gelir = GELIRLER.filter(g => subeIds.includes(g.subeId)).reduce((sum, g) => sum + g.tutar, 0);
    return { name: s.ad.split(" ")[0] + " " + (s.ad.split(" ")[1] || ""), value: gelir || Math.floor(Math.random() * 50000) + 10000, renk: s.renk };
  });
};
