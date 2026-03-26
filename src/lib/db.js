// ═══════════════════════════════════════════════════════════
//  MERKEZ VERİTABANI KATMANI — Supabase
// ═══════════════════════════════════════════════════════════
import { supabase } from './supabase';

// ─── YARDIMCI ───────────────────────────────────────────────
const handle = (data, error, isim) => {
  if (error) console.error(`[DB] ${isim} hata:`, error.message);
  return data || [];
};

// ─── SİRKETLER ──────────────────────────────────────────────
export const dbSirketler = {
  getAll: async () => {
    const { data, error } = await supabase.from('sirketler').select('*').order('id');
    return handle(data, error, 'sirketler.getAll');
  },
};

// ─── ŞUBELER ────────────────────────────────────────────────
export const dbSubeler = {
  getAll: async () => {
    const { data, error } = await supabase.from('subeler').select('*').order('id');
    return handle(data, error, 'subeler.getAll');
  },
  update: async (id, fields) => {
    const { data, error } = await supabase.from('subeler').update(fields).eq('id', id).select().single();
    if (error) console.error('[DB] subeler.update hata:', error.message);
    return data;
  },
};

// ─── ÖĞRENCİLER ─────────────────────────────────────────────
export const dbOgrenciler = {
  getAll: async () => {
    const { data, error } = await supabase.from('ogrenciler').select('*').order('id');
    if (error) { console.error('[DB] ogrenciler.getAll hata:', error.message); return []; }
    // DB → uygulama format dönüşümü
    return (data || []).map(dbToOgrenci);
  },
  insert: async (ogr) => {
    const row = ogrenciToDB(ogr);
    const { data, error } = await supabase.from('ogrenciler').insert(row).select().single();
    if (error) { console.error('[DB] ogrenciler.insert hata:', error.message); return null; }
    return dbToOgrenci(data);
  },
  update: async (id, ogr) => {
    const row = ogrenciToDB(ogr);
    const { data, error } = await supabase.from('ogrenciler').update(row).eq('id', id).select().single();
    if (error) { console.error('[DB] ogrenciler.update hata:', error.message); return null; }
    return dbToOgrenci(data);
  },
  delete: async (id) => {
    const { error } = await supabase.from('ogrenciler').delete().eq('id', id);
    if (error) console.error('[DB] ogrenciler.delete hata:', error.message);
    return !error;
  },
};

// ─── GELİRLER ───────────────────────────────────────────────
export const dbGelirler = {
  getAll: async () => {
    const { data, error } = await supabase.from('gelirler').select('*').order('tarih', { ascending: false });
    if (error) { console.error('[DB] gelirler.getAll hata:', error.message); return []; }
    return (data || []).map(dbToGelir);
  },
  insert: async (g) => {
    const row = gelirToDB(g);
    const { data, error } = await supabase.from('gelirler').insert(row).select().single();
    if (error) { console.error('[DB] gelirler.insert hata:', error.message); return null; }
    return dbToGelir(data);
  },
  update: async (id, g) => {
    const row = gelirToDB(g);
    const { data, error } = await supabase.from('gelirler').update(row).eq('id', id).select().single();
    if (error) { console.error('[DB] gelirler.update hata:', error.message); return null; }
    return dbToGelir(data);
  },
  delete: async (id) => {
    const { error } = await supabase.from('gelirler').delete().eq('id', id);
    if (error) console.error('[DB] gelirler.delete hata:', error.message);
    return !error;
  },
};

// ─── GİDERLER ───────────────────────────────────────────────
export const dbGiderler = {
  getAll: async () => {
    const { data, error } = await supabase.from('giderler').select('*').order('tarih', { ascending: false });
    if (error) { console.error('[DB] giderler.getAll hata:', error.message); return []; }
    return (data || []).map(dbToGider);
  },
  insert: async (g) => {
    const row = giderToDB(g);
    const { data, error } = await supabase.from('giderler').insert(row).select().single();
    if (error) { console.error('[DB] giderler.insert hata:', error.message); return null; }
    return dbToGider(data);
  },
  update: async (id, g) => {
    const row = giderToDB(g);
    const { data, error } = await supabase.from('giderler').update(row).eq('id', id).select().single();
    if (error) { console.error('[DB] giderler.update hata:', error.message); return null; }
    return dbToGider(data);
  },
  delete: async (id) => {
    const { error } = await supabase.from('giderler').delete().eq('id', id);
    if (error) console.error('[DB] giderler.delete hata:', error.message);
    return !error;
  },
};

// ─── PERSONEL ───────────────────────────────────────────────
export const dbPersonel = {
  getAll: async () => {
    const { data, error } = await supabase.from('personel').select('*').order('id');
    if (error) { console.error('[DB] personel.getAll hata:', error.message); return []; }
    return (data || []).map(dbToPersonel);
  },
  insert: async (p) => {
    const row = personelToDB(p);
    const { data, error } = await supabase.from('personel').insert(row).select().single();
    if (error) { console.error('[DB] personel.insert hata:', error.message); return null; }
    return dbToPersonel(data);
  },
  update: async (id, p) => {
    const row = personelToDB(p);
    const { data, error } = await supabase.from('personel').update(row).eq('id', id).select().single();
    if (error) { console.error('[DB] personel.update hata:', error.message); return null; }
    return dbToPersonel(data);
  },
  delete: async (id) => {
    const { error } = await supabase.from('personel').delete().eq('id', id);
    if (error) console.error('[DB] personel.delete hata:', error.message);
    return !error;
  },
};

// ─── ARAÇLAR ────────────────────────────────────────────────
export const dbAraclar = {
  getAll: async () => {
    const { data, error } = await supabase.from('araclar').select('*').order('id');
    if (error) { console.error('[DB] araclar.getAll hata:', error.message); return []; }
    return (data || []).map(dbToArac);
  },
  insert: async (a) => {
    const row = aracToDB(a);
    const { data, error } = await supabase.from('araclar').insert(row).select().single();
    if (error) { console.error('[DB] araclar.insert hata:', error.message); return null; }
    return dbToArac(data);
  },
  update: async (id, a) => {
    const row = aracToDB(a);
    const { data, error } = await supabase.from('araclar').update(row).eq('id', id).select().single();
    if (error) { console.error('[DB] araclar.update hata:', error.message); return null; }
    return dbToArac(data);
  },
  delete: async (id) => {
    const { error } = await supabase.from('araclar').delete().eq('id', id);
    if (error) console.error('[DB] araclar.delete hata:', error.message);
    return !error;
  },
};

// ═══════════════════════════════════════════════════════════
//  FORMAT DÖNÜŞÜM FONKSİYONLARI (DB ↔ Uygulama)
// ═══════════════════════════════════════════════════════════

// Öğrenci: DB → Uygulama
function dbToOgrenci(row) {
  return {
    id:           row.id,
    subeId:       row.sube_id,
    ad:           row.ad,
    soyad:        row.soyad,
    tc:           row.tc || '',
    telefon:      row.telefon || '',
    email:        row.email || '',
    kayitTarihi:  row.kayit_tarihi || '',
    kurstipi:     row.kurstipi || '',
    durum:        row.durum || 'devam_ediyor',
    toplamUcret:  Number(row.toplam_ucret) || 0,
    odenenUcret:  Number(row.odenen_ucret) || 0,
    src:          row.src  || { sinavlar: [], belgeTarihi: '', belgeNo: '' },
    psiko:        row.psiko || null,
  };
}

// Öğrenci: Uygulama → DB
function ogrenciToDB(ogr) {
  const row = {
    sube_id:       ogr.subeId,
    ad:            ogr.ad,
    soyad:         ogr.soyad,
    tc:            ogr.tc || '',
    telefon:       ogr.telefon || '',
    email:         ogr.email || '',
    kayit_tarihi:  ogr.kayitTarihi || new Date().toISOString().split('T')[0],
    kurstipi:      ogr.kurstipi || '',
    durum:         ogr.durum || 'devam_ediyor',
    toplam_ucret:  Number(ogr.toplamUcret) || 0,
    odenen_ucret:  Number(ogr.odenenUcret) || 0,
    src:           ogr.src  || { sinavlar: [], belgeTarihi: '', belgeNo: '' },
    psiko:         ogr.psiko || null,
  };
  return row;
}

// Gelir: DB → Uygulama
function dbToGelir(row) {
  return {
    id:            row.id,
    subeId:        row.sube_id,
    kategori:      row.kategori || 'kurs_ucreti',
    odemeYontemi:  row.odeme_yontemi || 'nakit',
    tarih:         row.tarih || '',
    tutar:         Number(row.tutar) || 0,
    aciklama:      row.aciklama || '',
  };
}

// Gelir: Uygulama → DB
function gelirToDB(g) {
  return {
    sube_id:       g.subeId ? parseInt(g.subeId) : null,
    kategori:      g.kategori || 'kurs_ucreti',
    odeme_yontemi: g.odemeYontemi || 'nakit',
    tarih:         g.tarih || new Date().toISOString().split('T')[0],
    tutar:         Number(g.tutar) || 0,
    aciklama:      g.aciklama || '',
  };
}

// Gider: DB → Uygulama
function dbToGider(row) {
  return {
    id:       row.id,
    subeId:   row.sube_id,
    kategori: row.kategori || '',
    altTip:   row.alt_tip  || '',
    tarih:    row.tarih    || '',
    tutar:    Number(row.tutar) || 0,
    kdv:      Number(row.kdv)   || 0,
    aciklama: row.aciklama  || '',
    belgeNo:  row.belge_no  || '',
    durum:    row.durum     || 'odendi',
  };
}

// Gider: Uygulama → DB
function giderToDB(g) {
  return {
    sube_id:  g.subeId ? parseInt(g.subeId) : null,
    kategori: g.kategori || '',
    alt_tip:  g.altTip   || '',
    tarih:    g.tarih    || new Date().toISOString().split('T')[0],
    tutar:    Number(g.tutar) || 0,
    kdv:      Number(g.kdv)   || 0,
    aciklama: g.aciklama  || '',
    belge_no: g.belgeNo   || '',
    durum:    g.durum     || 'odendi',
  };
}

// Personel: DB → Uygulama
function dbToPersonel(row) {
  return {
    id:             row.id,
    subeId:         row.sube_id,
    ad:             row.ad,
    soyad:          row.soyad,
    pozisyon:       row.pozisyon       || '',
    maas:           Number(row.maas)   || 0,
    telefon:        row.telefon        || '',
    iseGirisTarihi: row.ise_giris_tarihi || '',
    aktif:          row.aktif !== false,
  };
}

// Personel: Uygulama → DB
function personelToDB(p) {
  return {
    sube_id:          p.subeId,
    ad:               p.ad,
    soyad:            p.soyad,
    pozisyon:         p.pozisyon       || '',
    maas:             Number(p.maas)   || 0,
    telefon:          p.telefon        || '',
    ise_giris_tarihi: p.iseGirisTarihi || new Date().toISOString().split('T')[0],
    aktif:            p.aktif !== false,
  };
}

// Araç: DB → Uygulama
function dbToArac(row) {
  return {
    id:       row.id,
    subeId:   row.sube_id,
    plaka:    row.plaka    || '',
    marka:    row.marka    || '',
    model:    row.model    || '',
    yil:      Number(row.yil) || 2020,
    sinif:    row.sinif    || '',
    km:       Number(row.km)  || 0,
    sonBakim: row.son_bakim || '',
    aktif:    row.aktif !== false,
  };
}

// Araç: Uygulama → DB
function aracToDB(a) {
  return {
    sube_id:   a.subeId,
    plaka:     a.plaka    || '',
    marka:     a.marka    || '',
    model:     a.model    || '',
    yil:       Number(a.yil) || 2020,
    sinif:     a.sinif    || '',
    km:        Number(a.km)  || 0,
    son_bakim: a.sonBakim || new Date().toISOString().split('T')[0],
    aktif:     a.aktif !== false,
  };
}
