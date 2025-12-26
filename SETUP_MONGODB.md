# 📊 MongoDB Atlas Database Setup

## Adım 1: MongoDB Atlas Hesabı Oluştur

1. MongoDB Atlas'a git: https://www.mongodb.com/cloud/atlas
2. **Sign Up** veya **Log In** yap
3. **Build a Database** butonuna tıkla

## Adım 2: Free Cluster Oluştur

1. **M0 FREE** (Free tier) seçeneğini seç
2. Cloud Provider: **AWS** (veya istediğin)
3. Region: En yakın bölgeyi seç (örn: `eu-central-1` - Frankfurt)
4. Cluster adı ver (örn: `ARCHUB-Cluster`)
5. **Create** butonuna tıkla (1-3 dakika sürebilir)

## Adım 3: Database User Oluştur

1. **Database Access** sekmesine git
2. **Add New Database User** butonuna tıkla
3. Authentication Method: **Password**
4. Username ve Password oluştur (kaydet!)
5. Database User Privileges: **Read and write to any database**
6. **Add User** butonuna tıkla

## Adım 4: Network Access Ayarla

1. **Network Access** sekmesine git
2. **Add IP Address** butonuna tıkla
3. **Allow Access from Anywhere** seçeneğini işaretle (0.0.0.0/0)
4. **Confirm** butonuna tıkla

## Adım 5: Connection String Al

1. **Database** sekmesine git
2. **Connect** butonuna tıkla
3. **Connect your application** seçeneğini seç
4. Driver: **Node.js**, Version: **5.5 or later**
5. Connection string'i kopyala (şu formatta olacak):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. `<username>` ve `<password>` kısımlarını kendi bilgilerinle değiştir
7. Connection string'in sonuna database adını ekle:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/archub?retryWrites=true&w=majority
   ```

## Adım 6: Vercel Environment Variable Ekle

1. Vercel Dashboard → Projen → **Settings** → **Environment Variables**
2. **Add New** butonuna tıkla
3. Name: `MONGODB_URI`
4. Value: Connection string'i yapıştır (Adım 5'teki)
5. **Save** butonuna tıkla

## Adım 7: Test Et

1. Vercel'e deploy et: `git push`
2. Site açıldığında veriler artık herkeste görünecek
3. Bir şey ekle ve başka bir cihazdan kontrol et

## Notlar

- Veriler artık MongoDB Atlas'ta saklanıyor
- Herkes aynı verileri görüyor
- API endpoint'leri `/api/regions`, `/api/tier-list`, `/api/external-resources`
- LocalStorage fallback mevcut (API başarısız olursa)
- MongoDB ObjectId kullanılıyor (otomatik ID oluşturma)

## Troubleshooting

**Connection Error?**
- Network Access'te IP adresin ekli mi kontrol et
- Connection string'de username/password doğru mu kontrol et
- Database adı (`archub`) connection string'de var mı kontrol et

**API çalışmıyor?**
- Vercel Dashboard → Functions → Logs'a bak
- Environment variable doğru eklenmiş mi kontrol et
- MongoDB cluster aktif mi kontrol et

