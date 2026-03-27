-- ═══════════════════════════════════════════════════════════════
--  KURS YÖNETİM SİSTEMİ — Supabase Tablo Tanımları
--  Supabase → SQL Editor'e kopyala-yapıştır yaparak çalıştır
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. SİRKETLER ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sirketler (
  id      SERIAL PRIMARY KEY,
  ad      TEXT NOT NULL,
  ikon    TEXT DEFAULT '🏢',
  aktif   BOOLEAN DEFAULT TRUE
);

-- Başlangıç verileri (şirketleri projeye göre düzenle)
INSERT INTO sirketler (id, ad, ikon, aktif) VALUES
  (1, 'Sürücü Kursu',    '🚗', true),
  (2, 'Direksiyon',      '🎯', true),
  (3, 'SRC Kursu',       '🚛', true),
  (4, 'Psikoteknik',     '🧠', true),
  (5, 'SRC 5',           '🏭', true),
  (6, 'TMGD',            '⚗️',  true)
ON CONFLICT (id) DO NOTHING;

-- Sequence güncelle (yeni kayıt eklerken çakışmasın)
SELECT setval('sirketler_id_seq', (SELECT MAX(id) FROM sirketler));


-- ─── 2. ŞUBELER ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subeler (
  id         SERIAL PRIMARY KEY,
  sirket_id  INTEGER REFERENCES sirketler(id) ON DELETE SET NULL,
  ad         TEXT NOT NULL,
  sehir      TEXT DEFAULT '',
  ilce       TEXT DEFAULT '',
  adres      TEXT DEFAULT '',
  telefon    TEXT DEFAULT '',
  aktif      BOOLEAN DEFAULT TRUE
);


-- ─── 3. ÖĞRENCİLER ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ogrenciler (
  id             SERIAL PRIMARY KEY,
  sube_id        INTEGER REFERENCES subeler(id) ON DELETE SET NULL,
  ad             TEXT NOT NULL,
  soyad          TEXT NOT NULL,
  tc             TEXT DEFAULT '',
  telefon        TEXT DEFAULT '',
  email          TEXT DEFAULT '',
  kayit_tarihi   DATE DEFAULT CURRENT_DATE,
  kurstipi       TEXT DEFAULT '',
  durum          TEXT DEFAULT 'devam_ediyor',
  toplam_ucret   NUMERIC(12,2) DEFAULT 0,
  odenen_ucret   NUMERIC(12,2) DEFAULT 0,
  -- SRC sınav verileri (JSON): { sinavlar: [...], belgeTarihi: '', belgeNo: '' }
  src            JSONB DEFAULT '{"sinavlar":[],"belgeTarihi":"","belgeNo":""}',
  -- Psikoteknik verileri (JSON): { randevuTarihi, randevuSaati, sonuc }
  psiko          JSONB DEFAULT NULL
);


-- ─── 4. GELİRLER ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gelirler (
  id             SERIAL PRIMARY KEY,
  sube_id        INTEGER REFERENCES subeler(id) ON DELETE SET NULL,
  kategori       TEXT DEFAULT 'kurs_ucreti',
  odeme_yontemi  TEXT DEFAULT 'nakit',
  tarih          DATE DEFAULT CURRENT_DATE,
  tutar          NUMERIC(12,2) DEFAULT 0,
  aciklama       TEXT DEFAULT ''
);


-- ─── 5. GİDERLER ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS giderler (
  id        SERIAL PRIMARY KEY,
  sube_id   INTEGER REFERENCES subeler(id) ON DELETE SET NULL,
  kategori  TEXT DEFAULT '',
  alt_tip   TEXT DEFAULT '',
  tarih     DATE DEFAULT CURRENT_DATE,
  tutar     NUMERIC(12,2) DEFAULT 0,
  kdv       NUMERIC(12,2) DEFAULT 0,
  aciklama  TEXT DEFAULT '',
  belge_no  TEXT DEFAULT '',
  durum     TEXT DEFAULT 'odendi'
);


-- ─── 6. PERSONEL ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS personel (
  id                SERIAL PRIMARY KEY,
  sube_id           INTEGER REFERENCES subeler(id) ON DELETE SET NULL,
  ad                TEXT NOT NULL,
  soyad             TEXT NOT NULL,
  pozisyon          TEXT DEFAULT '',
  maas              NUMERIC(12,2) DEFAULT 0,
  telefon           TEXT DEFAULT '',
  ise_giris_tarihi  DATE DEFAULT CURRENT_DATE,
  aktif             BOOLEAN DEFAULT TRUE
);


-- ─── 7. ARAÇLAR ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS araclar (
  id        SERIAL PRIMARY KEY,
  sube_id   INTEGER REFERENCES subeler(id) ON DELETE SET NULL,
  plaka     TEXT DEFAULT '',
  marka     TEXT DEFAULT '',
  model     TEXT DEFAULT '',
  yil       INTEGER DEFAULT 2020,
  sinif     TEXT DEFAULT '',
  km        INTEGER DEFAULT 0,
  son_bakim DATE DEFAULT CURRENT_DATE,
  aktif     BOOLEAN DEFAULT TRUE
);


-- ─── 8. ARAÇ GİDERLERİ ──────────────────────────────────────
-- (AraclarPage'de her araç için gider kaydı — ayrı tablo)
CREATE TABLE IF NOT EXISTS arac_giderler (
  id          SERIAL PRIMARY KEY,
  arac_id     INTEGER REFERENCES araclar(id) ON DELETE CASCADE,
  kategori    TEXT DEFAULT '',
  tarih       DATE DEFAULT CURRENT_DATE,
  tutar       NUMERIC(12,2) DEFAULT 0,
  aciklama    TEXT DEFAULT '',
  sonraki_tarih DATE DEFAULT NULL,
  durum       TEXT DEFAULT 'odendi'
);


-- ─── 9. KİRA MÜLKLERİ ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS kira_mulkleri (
  id                  SERIAL PRIMARY KEY,
  ad                  TEXT NOT NULL,
  adres               TEXT DEFAULT '',
  tip                 TEXT DEFAULT 'daire',   -- ofis / dukkan / depo / daire / arsa / fabrika / diger
  kiraci              TEXT DEFAULT '',
  kiraci_tc           TEXT DEFAULT '',        -- Kiracı TC kimlik no (opsiyonel)
  kiraci_telefon      TEXT DEFAULT '',
  kiraci_email        TEXT DEFAULT '',
  aylik_kira          NUMERIC(12,2) DEFAULT 0,
  depozito            NUMERIC(12,2) DEFAULT 0,
  sozlesme_baslangic  DATE DEFAULT NULL,
  sozlesme_bitis      DATE DEFAULT NULL,
  yenileme_aktif      BOOLEAN DEFAULT FALSE,
  yenileme_orani      NUMERIC(5,2) DEFAULT 20,
  durum               TEXT DEFAULT 'aktif',   -- aktif / bos
  fatura_kes          BOOLEAN DEFAULT FALSE   -- Ödeme alındığında fatura listesine düşsün mü?
);

-- Mevcut kira_mulkleri tablosuna eksik kolonları ekle (tablo zaten varsa)
ALTER TABLE kira_mulkleri ADD COLUMN IF NOT EXISTS kiraci_tc    TEXT DEFAULT '';
ALTER TABLE kira_mulkleri ADD COLUMN IF NOT EXISTS fatura_kes   BOOLEAN DEFAULT FALSE;


-- ─── 10. KİRA ÖDEMELERİ ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS kira_odemeleri (
  id              SERIAL PRIMARY KEY,
  mulk_id         INTEGER REFERENCES kira_mulkleri(id) ON DELETE CASCADE,
  vade_tarihi     DATE NOT NULL,
  tutar           NUMERIC(12,2) DEFAULT 0,
  odenen_tutar    NUMERIC(12,2) DEFAULT 0,
  odeme_tarihi    DATE DEFAULT NULL,
  aciklama        TEXT DEFAULT '',
  durum           TEXT DEFAULT 'bekliyor',  -- odendi / gecikme / bekliyor
  fatura_kesildi  BOOLEAN DEFAULT FALSE,
  fatura_no       TEXT DEFAULT '',
  fatura_tarihi   DATE DEFAULT NULL,
  kdv_orani       NUMERIC(5,2) DEFAULT 0,
  kdv_tutar       NUMERIC(12,2) DEFAULT 0,
  matrah          NUMERIC(12,2) DEFAULT 0
);

-- Mevcut kira_odemeleri tablosuna eksik kolonları ekle (tablo zaten varsa)
ALTER TABLE kira_odemeleri ADD COLUMN IF NOT EXISTS fatura_kesildi  BOOLEAN DEFAULT FALSE;
ALTER TABLE kira_odemeleri ADD COLUMN IF NOT EXISTS fatura_no       TEXT DEFAULT '';
ALTER TABLE kira_odemeleri ADD COLUMN IF NOT EXISTS fatura_tarihi   DATE DEFAULT NULL;
ALTER TABLE kira_odemeleri ADD COLUMN IF NOT EXISTS kdv_orani       NUMERIC(5,2) DEFAULT 0;
ALTER TABLE kira_odemeleri ADD COLUMN IF NOT EXISTS kdv_tutar       NUMERIC(12,2) DEFAULT 0;
ALTER TABLE kira_odemeleri ADD COLUMN IF NOT EXISTS matrah          NUMERIC(12,2) DEFAULT 0;


-- ─── 11. KİRA GİDERLERİ ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS kira_giderler (
  id        SERIAL PRIMARY KEY,
  mulk_id   INTEGER REFERENCES kira_mulkleri(id) ON DELETE SET NULL,  -- NULL = genel gider
  tarih     DATE NOT NULL DEFAULT CURRENT_DATE,
  tutar     NUMERIC(12,2) DEFAULT 0,
  kategori  TEXT DEFAULT 'Diğer',   -- Bakım/Onarım, Vergi, Sigorta, Yönetim Komisyonu, vb.
  aciklama  TEXT DEFAULT ''
);


-- ─── ROW LEVEL SECURITY (isteğe bağlı — geliştirme için kapat) ───
-- Eğer RLS aktifse ve hata alıyorsan aşağıdaki satırları çalıştır:
-- ALTER TABLE sirketler      DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE subeler        DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE ogrenciler     DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE gelirler       DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE giderler       DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE personel       DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE araclar        DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE arac_giderler  DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE kira_mulkleri  DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE kira_odemeleri DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE kira_giderler  DISABLE ROW LEVEL SECURITY;


-- ─── YETKİLENDİRME (anon key ile okuma/yazma için) ───────────
GRANT ALL ON sirketler     TO anon, authenticated;
GRANT ALL ON subeler       TO anon, authenticated;
GRANT ALL ON ogrenciler    TO anon, authenticated;
GRANT ALL ON gelirler      TO anon, authenticated;
GRANT ALL ON giderler      TO anon, authenticated;
GRANT ALL ON personel      TO anon, authenticated;
GRANT ALL ON araclar       TO anon, authenticated;
GRANT ALL ON arac_giderler TO anon, authenticated;
GRANT ALL ON kira_mulkleri TO anon, authenticated;
GRANT ALL ON kira_odemeleri TO anon, authenticated;
GRANT ALL ON kira_giderler TO anon, authenticated;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
