# 🚀 Vercel MongoDB Atlas Integration Setup

## ✅ Adım 1: Vercel'de MongoDB Oluşturuldu

Vercel üzerinden MongoDB Atlas oluşturdunuz ve "Connect project" yaptınız. Bu durumda:

1. ✅ MongoDB cluster oluşturuldu
2. ✅ Vercel otomatik olarak environment variable ekledi
3. ✅ Connection string hazır

## 🔍 Adım 2: Environment Variable Kontrolü

Vercel Dashboard'da kontrol edin:

1. **Settings** → **Environment Variables** sekmesine git
2. `MONGODB_URI` adında bir variable olmalı
3. Eğer yoksa, MongoDB Atlas'tan connection string'i alıp manuel ekleyin

**Vercel'in otomatik eklediği variable adı farklı olabilir:**
- `MONGODB_URI` (standart)
- `MONGODB_CONNECTION_STRING` (Vercel integration)
- `ATLAS_URI` (bazı durumlarda)

Eğer farklı bir isimle eklenmişse, `api/db.js` dosyasındaki `process.env.MONGODB_URI` kısmını güncelleyin.

## 📝 Adım 3: Connection String Formatı

Connection string şu formatta olmalı:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/archub?retryWrites=true&w=majority
```

**Önemli:** Sonunda `/archub` database adı olmalı!

## 🧪 Adım 4: Test Et

1. Vercel'e deploy et: `git push` (zaten yapıldı)
2. Site açıldığında bir bölge ekle
3. Başka bir cihazdan/browser'dan kontrol et - aynı veriler görünmeli

## 🔧 Adım 5: Sorun Giderme

**API çalışmıyor?**
- Vercel Dashboard → **Functions** → **Logs** sekmesine bak
- Hata mesajlarını kontrol et
- Environment variable doğru mu kontrol et

**Connection Error?**
- MongoDB Atlas → **Network Access** → IP adresleri kontrol et
- `0.0.0.0/0` ekli olmalı (tüm IP'ler)

**Database bulunamıyor?**
- MongoDB Atlas → **Database** → Collections
- `archub` database'i otomatik oluşacak (ilk veri eklendiğinde)
- Collections: `regions`, `tier_list`, `external_resources`

## 📊 Database Yapısı

MongoDB otomatik olarak şu collections'ı oluşturacak:
- `regions` - Bölgeler
- `tier_list` - Tier list öğeleri  
- `external_resources` - Dış kaynaklar

Her document şu yapıda:
```javascript
{
  _id: ObjectId("..."),  // MongoDB otomatik ID
  id: "...",              // Frontend için string ID
  name: "...",
  // ... diğer alanlar
  created_at: Date,
  updated_at: Date
}
```

## ✅ Hazır!

Artık veriler MongoDB Atlas'ta saklanıyor ve herkeste görünüyor! 🎉

