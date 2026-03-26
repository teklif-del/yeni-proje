// ============================================================
// PERSONEL EK VERİ - Maaş, İzin, Mesai, Devamsızlık
// ============================================================

// Maaş Ödemeleri
export const MAAS_ODEMELERI = [
  { id: 1, personelId: 1, yil: 2025, ay: 1, brutMaas: 25000, kesintiler: 4250, netMaas: 20750, mesaiUcreti: 1500, ikramiye: 0, odenmeTarihi: '2025-01-31', durum: 'odendi', not: '' },
  { id: 2, personelId: 1, yil: 2025, ay: 2, brutMaas: 25000, kesintiler: 4250, netMaas: 20750, mesaiUcreti: 2000, ikramiye: 0, odenmeTarihi: '2025-02-28', durum: 'odendi', not: '' },
  { id: 3, personelId: 1, yil: 2025, ay: 3, brutMaas: 25000, kesintiler: 4250, netMaas: 20750, mesaiUcreti: 1000, ikramiye: 0, odenmeTarihi: null, durum: 'bekliyor', not: '' },
  { id: 4, personelId: 2, yil: 2025, ay: 1, brutMaas: 18000, kesintiler: 3060, netMaas: 14940, mesaiUcreti: 800, ikramiye: 0, odenmeTarihi: '2025-01-31', durum: 'odendi', not: '' },
  { id: 5, personelId: 2, yil: 2025, ay: 2, brutMaas: 18000, kesintiler: 3060, netMaas: 14940, mesaiUcreti: 1200, ikramiye: 0, odenmeTarihi: '2025-02-28', durum: 'odendi', not: '' },
  { id: 6, personelId: 2, yil: 2025, ay: 3, brutMaas: 18000, kesintiler: 3060, netMaas: 14940, mesaiUcreti: 0, ikramiye: 0, odenmeTarihi: null, durum: 'bekliyor', not: '' },
  { id: 7, personelId: 3, yil: 2025, ay: 1, brutMaas: 18000, kesintiler: 3060, netMaas: 14940, mesaiUcreti: 500, ikramiye: 0, odenmeTarihi: '2025-01-31', durum: 'odendi', not: '' },
  { id: 8, personelId: 3, yil: 2025, ay: 2, brutMaas: 18000, kesintiler: 3060, netMaas: 14940, mesaiUcreti: 750, ikramiye: 0, odenmeTarihi: '2025-02-28', durum: 'odendi', not: '' },
  { id: 9, personelId: 3, yil: 2025, ay: 3, brutMaas: 18000, kesintiler: 3060, netMaas: 14940, mesaiUcreti: 0, ikramiye: 0, odenmeTarihi: null, durum: 'bekliyor', not: '' },
  { id: 10, personelId: 4, yil: 2025, ay: 1, brutMaas: 22000, kesintiler: 3740, netMaas: 18260, mesaiUcreti: 1000, ikramiye: 5000, odenmeTarihi: '2025-01-31', durum: 'odendi', not: 'Yılbaşı ikramiyesi dahil' },
  { id: 11, personelId: 4, yil: 2025, ay: 2, brutMaas: 22000, kesintiler: 3740, netMaas: 18260, mesaiUcreti: 0, ikramiye: 0, odenmeTarihi: '2025-02-28', durum: 'odendi', not: '' },
  { id: 12, personelId: 4, yil: 2025, ay: 3, brutMaas: 22000, kesintiler: 3740, netMaas: 18260, mesaiUcreti: 0, ikramiye: 0, odenmeTarihi: null, durum: 'bekliyor', not: '' },
  { id: 13, personelId: 5, yil: 2025, ay: 1, brutMaas: 20000, kesintiler: 3400, netMaas: 16600, mesaiUcreti: 0, ikramiye: 0, odenmeTarihi: '2025-01-31', durum: 'odendi', not: '' },
  { id: 14, personelId: 5, yil: 2025, ay: 2, brutMaas: 20000, kesintiler: 3400, netMaas: 16600, mesaiUcreti: 600, ikramiye: 0, odenmeTarihi: '2025-02-28', durum: 'odendi', not: '' },
  { id: 15, personelId: 5, yil: 2025, ay: 3, brutMaas: 20000, kesintiler: 3400, netMaas: 16600, mesaiUcreti: 0, ikramiye: 0, odenmeTarihi: null, durum: 'bekliyor', not: '' },
];

// İzin Kayıtları
export const IZIN_KAYITLARI = [
  { id: 1, personelId: 1, tip: 'yillik', baslangic: '2025-03-10', bitis: '2025-03-14', gun: 5, durum: 'onaylandi', aciklama: 'Yıllık izin', onaylayan: 'Genel Müdür' },
  { id: 2, personelId: 2, tip: 'raporlu', baslangic: '2025-02-18', bitis: '2025-02-20', gun: 3, durum: 'onaylandi', aciklama: 'Grip', onaylayan: 'Müdür' },
  { id: 3, personelId: 3, tip: 'haftalik', baslangic: '2025-03-01', bitis: '2025-03-01', gun: 1, durum: 'onaylandi', aciklama: 'Haftalık izin', onaylayan: 'Müdür' },
  { id: 4, personelId: 4, tip: 'yillik', baslangic: '2025-01-20', bitis: '2025-01-24', gun: 5, durum: 'onaylandi', aciklama: 'Tatil', onaylayan: 'Genel Müdür' },
  { id: 5, personelId: 1, tip: 'raporlu', baslangic: '2025-01-08', bitis: '2025-01-09', gun: 2, durum: 'onaylandi', aciklama: 'Doktor raporu', onaylayan: 'Müdür' },
  { id: 6, personelId: 5, tip: 'yillik', baslangic: '2025-04-07', bitis: '2025-04-11', gun: 5, durum: 'bekliyor', aciklama: 'Tatil planı', onaylayan: '' },
  { id: 7, personelId: 2, tip: 'haftalik', baslangic: '2025-03-08', bitis: '2025-03-08', gun: 1, durum: 'onaylandi', aciklama: 'Haftalık izin', onaylayan: 'Müdür' },
  { id: 8, personelId: 3, tip: 'mazeret', baslangic: '2025-03-15', bitis: '2025-03-15', gun: 1, durum: 'bekliyor', aciklama: 'Aile durumu', onaylayan: '' },
];

// Mesai Kayıtları
export const MESAI_KAYITLARI = [
  { id: 1, personelId: 1, tarih: '2025-03-01', saat: 3, ucretPerSaat: 500, toplam: 1500, aciklama: 'Hafta sonu sınav', durum: 'odendi' },
  { id: 2, personelId: 1, tarih: '2025-02-15', saat: 4, ucretPerSaat: 500, toplam: 2000, aciklama: 'Yoğun dönem', durum: 'odendi' },
  { id: 3, personelId: 2, tarih: '2025-03-08', saat: 2, ucretPerSaat: 360, toplam: 720, aciklama: 'Hafta sonu ders', durum: 'bekliyor' },
  { id: 4, personelId: 2, tarih: '2025-02-22', saat: 3, ucretPerSaat: 360, toplam: 1080, aciklama: 'Ekstra ders', durum: 'odendi' },
  { id: 5, personelId: 3, tarih: '2025-03-15', saat: 2, ucretPerSaat: 360, toplam: 720, aciklama: 'Sınav günü', durum: 'bekliyor' },
  { id: 6, personelId: 4, tarih: '2025-02-10', saat: 5, ucretPerSaat: 440, toplam: 2200, aciklama: 'Akreditasyon çalışması', durum: 'odendi' },
  { id: 7, personelId: 5, tarih: '2025-03-20', saat: 2, ucretPerSaat: 400, toplam: 800, aciklama: 'Hafta sonu', durum: 'bekliyor' },
];

// Geç Gelme & Devamsızlık Kayıtları
export const GEC_GELME_KAYITLARI = [
  { id: 1, personelId: 1, tarih: '2025-03-03', tip: 'gec_gelme', dakika: 25, aciklama: 'Trafik', kesinti: 0 },
  { id: 2, personelId: 2, tarih: '2025-03-05', tip: 'gec_gelme', dakika: 45, aciklama: 'Araç arızası', kesinti: 0 },
  { id: 3, personelId: 3, tarih: '2025-02-20', tip: 'gec_gelme', dakika: 15, aciklama: '', kesinti: 0 },
  { id: 4, personelId: 3, tarih: '2025-03-10', tip: 'gec_gelme', dakika: 60, aciklama: 'Ulaşım sorunu', kesinti: 200 },
  { id: 5, personelId: 4, tarih: '2025-01-15', tip: 'gec_gelme', dakika: 30, aciklama: 'Trafik', kesinti: 0 },
  { id: 6, personelId: 5, tarih: '2025-02-28', tip: 'devamsizlik', dakika: 480, aciklama: 'İzinsiz', kesinti: 800 },
  { id: 7, personelId: 1, tarih: '2025-02-10', tip: 'gec_gelme', dakika: 20, aciklama: '', kesinti: 0 },
  { id: 8, personelId: 2, tarih: '2025-03-18', tip: 'gec_gelme', dakika: 35, aciklama: 'Trafik', kesinti: 0 },
];

// Yıllık İzin Hakları (yasal: 1-5 yıl=14, 5-15 yıl=20, 15+=26)
export const IZIN_HAKLARI = [
  { personelId: 1, yillikHak: 20, kullanilanGun: 7, kalanGun: 13, yil: 2025 },
  { personelId: 2, yillikHak: 14, kullanilanGun: 4, kalanGun: 10, yil: 2025 },
  { personelId: 3, yillikHak: 14, kullanilanGun: 2, kalanGun: 12, yil: 2025 },
  { personelId: 4, yillikHak: 26, kullanilanGun: 10, kalanGun: 16, yil: 2025 },
  { personelId: 5, yillikHak: 14, kullanilanGun: 0, kalanGun: 14, yil: 2025 },
];

// Tazminat Hesaplama Yardımcısı
export const tazminatHesapla = (personel) => {
  if (!personel.iseGirisTarihi) return null;
  const giris = new Date(personel.iseGirisTarihi);
  const bugun = new Date();
  const toplamGun = Math.floor((bugun - giris) / (1000 * 60 * 60 * 24));
  const toplamYil = toplamGun / 365;
  const gunlukMaas = personel.maas / 30;
  const kidemTazminati = Math.floor(toplamYil) * (personel.maas); // 1 yıl = 1 aylık brüt
  const ihbarSuresi = toplamYil < 0.5 ? 2 : toplamYil < 1.5 ? 4 : toplamYil < 3 ? 6 : 8; // hafta
  const ihbarTazminati = ihbarSuresi * 7 * gunlukMaas;
  return {
    toplamGun,
    toplamYil: toplamYil.toFixed(1),
    tamYil: Math.floor(toplamYil),
    kidemTazminati: Math.round(kidemTazminati),
    ihbarSuresi,
    ihbarTazminati: Math.round(ihbarTazminati),
    toplamTazminat: Math.round(kidemTazminati + ihbarTazminati),
    gunlukMaas: Math.round(gunlukMaas),
  };
};

export const AYLAR = ['', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
