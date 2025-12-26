# 📊 Vercel Postgres Database Setup

## Adım 1: Vercel Postgres Oluştur

1. Vercel Dashboard'a git: https://vercel.com/dashboard
2. Projeni seç
3. **Storage** sekmesine git
4. **Create Database** → **Postgres** seç
5. Database adı ver (örn: `archub-db`)
6. Region seç (en yakın bölge)
7. **Create** butonuna tıkla

## Adım 2: Environment Variable Ekle

1. Vercel Dashboard → Projen → **Settings** → **Environment Variables**
2. `POSTGRES_URL` adında yeni variable ekle
3. Değer olarak connection string'i yapıştır (Vercel otomatik oluşturur)
4. **Save** butonuna tıkla

## Adım 3: Database Tablolarını Oluştur

1. Vercel Dashboard → Projen → **Storage** → Database'ine tıkla
2. **Query** sekmesine git
3. `database-schema.sql` dosyasındaki SQL komutlarını çalıştır:

```sql
-- Regions table
CREATE TABLE IF NOT EXISTS regions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  map VARCHAR(100) NOT NULL,
  description TEXT,
  image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tier List table
CREATE TABLE IF NOT EXISTS tier_list (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- External Resources table
CREATE TABLE IF NOT EXISTS external_resources (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_regions_created_at ON regions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tier_list_created_at ON tier_list(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_external_resources_created_at ON external_resources(created_at DESC);
```

4. **Run** butonuna tıkla

## Adım 4: Test Et

1. Vercel'e deploy et: `git push`
2. Site açıldığında veriler artık herkeste görünecek
3. Bir şey ekle ve başka bir cihazdan kontrol et

## Notlar

- Veriler artık Vercel Postgres'te saklanıyor
- Herkes aynı verileri görüyor
- API endpoint'leri `/api/regions`, `/api/tier-list`, `/api/external-resources`
- LocalStorage fallback mevcut (API başarısız olursa)

