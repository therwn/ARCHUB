# 🚀 Vercel Deployment Checklist - ARCHUB

## 📋 Proje İhtiyaçları Analizi

### Mevcut Özellikler:
- ✅ Frontend: HTML/CSS/JS (Three.js, GSAP)
- ✅ LocalStorage: Bölgeler, Tier List, Dış Kaynaklar
- ✅ Görsel Yükleme: Dosya seçimi (henüz storage yok)
- ✅ Müzik Dosyaları: Local assets/music/ klasörü

### Gereken Servisler:
1. **Frontend Hosting** → Vercel ✅
2. **Database** → MongoDB Atlas veya Vercel Postgres
3. **File Storage** → Cloudinary veya Vercel Blob Storage
4. **API Endpoints** → Vercel Serverless Functions

---

## ✅ VERCEL DEPLOYMENT CHECKLIST

### 🔵 PHASE 1: Vercel Projesi Kurulumu

#### 1.1 Vercel Hesabı
- [ ] Vercel hesabı oluştur (https://vercel.com)
- [ ] GitHub/GitLab/Bitbucket hesabı bağla
- [ ] Vercel CLI kurulumu: `npm i -g vercel`

#### 1.2 Proje Hazırlığı
- [ ] `package.json` oluştur
- [ ] `.gitignore` dosyası oluştur
- [ ] Git repository oluştur ve push et
- [ ] Vercel projesi oluştur (vercel.com veya CLI)

#### 1.3 Vercel CLI Kurulumu
```bash
npm install -g vercel
vercel login
vercel link
```

---

### 🟢 PHASE 2: Database Seçimi ve Kurulumu

#### Seçenek A: MongoDB Atlas (ÖNERİLEN) ⭐

**Kurulum:**
- [ ] MongoDB Atlas hesabı oluştur (https://www.mongodb.com/cloud/atlas)
- [ ] Yeni cluster oluştur (Free tier: M0)
- [ ] Database user oluştur (username + password)
- [ ] Network Access: IP whitelist (0.0.0.0/0 - tüm IP'ler)
- [ ] Connection string al
- [ ] Environment variable ekle: `MONGODB_URI`

**MongoDB Collections:**
- [ ] `regions` collection oluştur
- [ ] `tierList` collection oluştur
- [ ] `externalResources` collection oluştur

**Maliyet:** Ücretsiz (512MB storage)

---

#### Seçenek B: Vercel Postgres (YENİ) ⭐⭐

**Kurulum:**
- [ ] Vercel Dashboard → Storage → Create Database
- [ ] Postgres seç
- [ ] Region seç (en yakın)
- [ ] Database oluştur
- [ ] Connection string al
- [ ] Environment variable ekle: `POSTGRES_URL`

**PostgreSQL Tables:**
```sql
- [ ] CREATE TABLE regions (...)
- [ ] CREATE TABLE tier_list (...)
- [ ] CREATE TABLE external_resources (...)
```

**Maliyet:** Ücretsiz (256MB storage, 60 saat compute/ay)

---

### 🟡 PHASE 3: File Storage Kurulumu

#### Seçenek A: Cloudinary (ÖNERİLEN) ⭐

**Kurulum:**
- [ ] Cloudinary hesabı oluştur (https://cloudinary.com)
- [ ] Cloud name, API key, API secret al
- [ ] Environment variables ekle:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`

**Özellikler:**
- ✅ Otomatik image optimization
- ✅ CDN
- ✅ Transformations (resize, crop, etc.)
- ✅ Ücretsiz: 25GB storage, 25GB bandwidth/ay

---

#### Seçenek B: Vercel Blob Storage (YENİ) ⭐⭐

**Kurulum:**
- [ ] Vercel Dashboard → Storage → Create Store
- [ ] Blob Store oluştur
- [ ] Environment variable: `BLOB_READ_WRITE_TOKEN`

**Özellikler:**
- ✅ Vercel ekosistemi içinde
- ✅ Kolay entegrasyon
- ✅ Ücretsiz: 1GB storage, 100GB bandwidth/ay

---

### 🔴 PHASE 4: API Endpoints (Vercel Serverless Functions)

#### 4.1 Proje Yapısı
```
ARCHUB/
├── api/
│   ├── regions/
│   │   ├── index.js (GET, POST)
│   │   └── [id].js (GET, PUT, DELETE)
│   ├── tier-list/
│   │   ├── index.js
│   │   └── [id].js
│   ├── external-resources/
│   │   ├── index.js
│   │   └── [id].js
│   └── upload/
│       └── image.js
├── public/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── assets/
├── package.json
├── vercel.json
└── .env.local
```

#### 4.2 API Endpoints Oluştur

**Regions API:**
- [ ] `api/regions/index.js` - GET (list), POST (create)
- [ ] `api/regions/[id].js` - GET (detail), PUT (update), DELETE

**Tier List API:**
- [ ] `api/tier-list/index.js` - GET, POST
- [ ] `api/tier-list/[id].js` - GET, PUT, DELETE

**External Resources API:**
- [ ] `api/external-resources/index.js` - GET, POST
- [ ] `api/external-resources/[id].js` - GET, PUT, DELETE

**Upload API:**
- [ ] `api/upload/image.js` - POST (image upload to Cloudinary/Blob)

---

### 🟣 PHASE 5: Kod Entegrasyonu

#### 5.1 Dependencies Ekle
```json
{
  "dependencies": {
    "mongodb": "^6.0.0",  // veya "@vercel/postgres"
    "cloudinary": "^1.41.0",  // veya "@vercel/blob"
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@vercel/node": "^3.0.0"
  }
}
```

- [ ] `package.json` oluştur ve dependencies ekle
- [ ] `npm install` çalıştır

#### 5.2 Environment Variables
- [ ] `.env.local` dosyası oluştur (local development)
- [ ] Vercel Dashboard → Settings → Environment Variables ekle:
  - `MONGODB_URI` (veya `POSTGRES_URL`)
  - `CLOUDINARY_CLOUD_NAME` (veya `BLOB_READ_WRITE_TOKEN`)
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`

#### 5.3 Frontend Kod Değişiklikleri

**script.js Güncellemeleri:**
- [ ] LocalStorage fonksiyonlarını kaldır
- [ ] API fetch fonksiyonları ekle:
  - `fetchRegions()`
  - `createRegion(data)`
  - `updateRegion(id, data)`
  - `deleteRegion(id)`
  - `uploadImage(file)`
- [ ] Real-time updates için polling veya WebSocket ekle

**Örnek API Fonksiyonları:**
```javascript
// Eski:
localStorage.setItem("archub_regions", JSON.stringify(regions));

// Yeni:
async function saveRegion(regionData) {
  const response = await fetch('/api/regions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(regionData)
  });
  return response.json();
}
```

---

### 🟠 PHASE 6: Vercel Configuration

#### 6.1 vercel.json
- [ ] `vercel.json` dosyası oluştur
- [ ] Build settings yapılandır
- [ ] Environment variables yapılandır
- [ ] Headers ve redirects ayarla

**Örnek vercel.json:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### 6.2 Build Settings
- [ ] Vercel Dashboard → Settings → General
- [ ] Framework Preset: Other
- [ ] Build Command: (boş bırak veya `npm run build`)
- [ ] Output Directory: `public` (veya `.`)
- [ ] Install Command: `npm install`

---

### 🔵 PHASE 7: Testing

#### 7.1 Local Testing
- [ ] `vercel dev` ile local test
- [ ] API endpoints test et
- [ ] Database bağlantısı test et
- [ ] Image upload test et
- [ ] Frontend → API iletişimi test et

#### 7.2 Production Testing
- [ ] Vercel'e deploy et: `vercel --prod`
- [ ] Production URL'de test et
- [ ] Tüm CRUD işlemleri test et
- [ ] Image upload test et
- [ ] Performance test et

---

### 🟢 PHASE 8: Deployment

#### 8.1 İlk Deploy
- [ ] Git repository'ye push et
- [ ] Vercel Dashboard → Deployments
- [ ] Otomatik deploy kontrol et
- [ ] Production URL'i al

#### 8.2 Domain (Opsiyonel)
- [ ] Custom domain ekle
- [ ] DNS ayarları yap
- [ ] SSL sertifikası (otomatik)

#### 8.3 Monitoring
- [ ] Vercel Analytics ekle (opsiyonel)
- [ ] Error tracking (Sentry, vb.)
- [ ] Log monitoring

---

## 📦 Gerekli Dosyalar

### 1. package.json
```json
{
  "name": "archub",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vercel dev",
    "deploy": "vercel --prod"
  },
  "dependencies": {
    "mongodb": "^6.0.0",
    "cloudinary": "^1.41.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "@vercel/node": "^3.0.0"
  }
}
```

### 2. vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ]
}
```

### 3. .env.local (local development)
```
MONGODB_URI=mongodb+srv://...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### 4. .gitignore
```
node_modules/
.env.local
.vercel/
*.log
.DS_Store
```

---

## 🎯 Önerilen Stack

### Seçenek 1: MongoDB Atlas + Cloudinary (ÖNERİLEN)
- ✅ MongoDB: NoSQL, esnek yapı
- ✅ Cloudinary: Güçlü image processing
- ✅ Kolay kurulum
- ✅ Ücretsiz tier yeterli

### Seçenek 2: Vercel Postgres + Vercel Blob
- ✅ Tümü Vercel ekosistemi içinde
- ✅ Daha entegre çözüm
- ✅ Yeni teknolojiler
- ⚠️ Daha az storage (1GB)

---

## 💰 Maliyet Tahmini

### Ücretsiz Tier:
- **Vercel Hosting**: ✅ Sınırsız
- **Vercel Functions**: ✅ 100GB-hours/ay
- **MongoDB Atlas**: ✅ 512MB storage
- **Cloudinary**: ✅ 25GB storage, 25GB bandwidth/ay
- **Vercel Postgres**: ✅ 256MB storage, 60 hours/ay
- **Vercel Blob**: ✅ 1GB storage, 100GB bandwidth/ay

### Toplam: **$0/ay** (başlangıç için yeterli)

---

## ⏱️ Tahmini Süre

- **Phase 1-2**: 1 saat (Vercel + Database setup)
- **Phase 3**: 30 dakika (Storage setup)
- **Phase 4**: 2-3 saat (API endpoints)
- **Phase 5**: 2-3 saat (Kod entegrasyonu)
- **Phase 6-7**: 1 saat (Testing)
- **Phase 8**: 30 dakika (Deploy)

**Toplam: 7-9 saat**

---

## 🚀 Hızlı Başlangıç Komutları

```bash
# 1. Vercel CLI kurulumu
npm install -g vercel

# 2. Proje klasöründe
vercel login
vercel link

# 3. Dependencies kurulumu
npm install

# 4. Local development
vercel dev

# 5. Production deploy
vercel --prod
```

---

## 📝 Sonraki Adımlar

1. **Hangi database?** (MongoDB Atlas veya Vercel Postgres)
2. **Hangi storage?** (Cloudinary veya Vercel Blob)
3. **API endpoints kodlaması** başlat
4. **Frontend entegrasyonu** yap
5. **Test ve deploy**

---

## ❓ Sorular?

- Database seçimi için yardım?
- API endpoint kodları?
- Frontend entegrasyonu?
- Deploy süreci?

Hangi adımdan başlamak istersiniz? 🚀


