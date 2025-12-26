# Interactive Glass Lens Effect with Sound FX

Bu proje, CodePen'den klonlanmış interaktif cam lens efekti içeren bir Three.js uygulamasıdır.

## Özellikler

- 🎨 **Three.js ile Cam Lens Efekti**: Fareyi takip eden interaktif cam lens distorsiyon efekti
- 🎵 **Ses Efektleri**: Hover ve arka plan müzik efektleri
- 🎭 **GSAP Animasyonları**: Metin elementlerinde smooth animasyonlar
- 🎛️ **Tweakpane Kontrolleri**: 'H' tuşu ile açılan gelişmiş kontrol paneli
- 📱 **Responsive Tasarım**: Mobil ve tablet cihazlar için optimize edilmiş

## Kullanım

### ⚠️ ÖNEMLİ: Local Server Gereklidir

Bu proje ES6 modülleri kullandığı için, dosyayı doğrudan tarayıcıda açmak CORS hatasına neden olur. **Mutlaka bir local server kullanmalısınız.**

### Yöntem 1: Python Server (Önerilen)

1. Terminal/Command Prompt'u proje klasöründe açın
2. Şu komutu çalıştırın:
   ```bash
   python server.py
   ```
3. Tarayıcı otomatik olarak açılacak. Açılmazsa: http://localhost:8000

### Yöntem 2: Python HTTP Server

```bash
python -m http.server 8000
```

Sonra tarayıcıda: http://localhost:8000/index.html

### Yöntem 3: VS Code Live Server

1. VS Code'da "Live Server" extension'ını yükleyin
2. `index.html` dosyasına sağ tıklayın
3. "Open with Live Server" seçeneğini seçin

### Yöntem 4: Node.js http-server

```bash
npx http-server -p 8000
```

## Kontroller

- **START Butonu**: Deneyimi başlatır
- **Enter Tuşu**: START butonuna alternatif
- **H Tuşu**: Refraction kontrol panelini açar/kapatır
- **Fare Hareketi**: Cam lens efekti fareyi takip eder

## Teknolojiler

- **Three.js**: 3D grafik ve WebGL rendering
- **GSAP**: Animasyon kütüphanesi
- **Tweakpane**: Kontrol paneli
- **WebGL Shaders**: Özel cam lens efekti shader'ları

## Müzik Sistemi

Proje, rastgele müzik çalma sistemi içerir:

1. `assets/music/` klasörüne 3 adet MP3 dosyası ekleyin:
   - `arc1.mp3`
   - `arc2.mp3`
   - `arc3.mp3`
2. Site açıldığında rastgele bir şarkı seçilir
3. Şarkı bittiğinde diğer şarkılardan biri otomatik olarak çalmaya başlar
4. Tüm şarkılar çalındıktan sonra liste sıfırlanır ve tekrar başlar

**Not:** Müzik dosyaları yoksa sistem sessizce çalışmaya devam eder.

## Sorun Giderme

### CORS Hatası Görüyorsanız
- Mutlaka bir local server kullanın (yukarıdaki yöntemlerden biri)
- `file://` protokolü ile açmayın

### START Butonu Çalışmıyorsa
- Browser console'u açın (F12)
- Hata mesajlarını kontrol edin
- Local server kullandığınızdan emin olun

### Müzik Çalmıyorsa
- `assets/music/` klasöründe MP3 dosyalarının olduğundan emin olun
- Dosya yollarının `script.js`'deki `musicFiles` dizisiyle eşleştiğini kontrol edin
- Browser console'da hata mesajlarını kontrol edin

## Orijinal Proje

[CodePen - Interactive Glass Lens Effect](https://codepen.io/filipz/pen/vEOpMvo)
