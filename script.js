import * as THREE from "https://esm.sh/three@0.177.0";
import { EffectComposer } from "https://esm.sh/three@0.177.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://esm.sh/three@0.177.0/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "https://esm.sh/three@0.177.0/examples/jsm/postprocessing/ShaderPass.js";
import { Pane } from "https://cdn.skypack.dev/tweakpane@4.0.4";

(function () {
  "use strict";

  const supportsWebGL = () => {
    try {
      const c = document.createElement("canvas");
      return !!(
        window.WebGLRenderingContext &&
        (c.getContext("webgl") || c.getContext("experimental-webgl"))
      );
    } catch {
      return false;
    }
  };

  if (!Array.prototype.forEach) {
    Array.prototype.forEach = function (cb, ctx) {
      for (let i = 0; i < this.length; i++) cb.call(ctx, this[i], i, this);
    };
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (cb) => setTimeout(cb, 16.67);
  }

  const App = {
    PARAMS: {
      distortion: {
        strength: 0.15,
        radius: 0.2,
        size: 1,
        edgeWidth: 0.05,
        edgeOpacity: 0.2,
        rimLightIntensity: 0.3,
        rimLightWidth: 0.08,
        chromaticAberration: 0.03,
        reflectionIntensity: 0.3,
        waveDistortion: 0.08,
        waveSpeed: 1.2,
        lensBlur: 0.15,
        clearCenterSize: 0.3,
        followMouse: true,
        animationSpeed: 1,
        overallIntensity: 0,
        preset: "Classic Glass"
      },
      presets: {
        Minimal: {
          strength: 0.05,
          radius: 0.12,
          size: 0.8,
          edgeWidth: 0.02,
          edgeOpacity: 0.1,
          rimLightIntensity: 0.1,
          rimLightWidth: 0.04,
          chromaticAberration: 0.01,
          reflectionIntensity: 0.15,
          waveDistortion: 0.02,
          waveSpeed: 0.8,
          lensBlur: 0.05,
          clearCenterSize: 0.5
        },
        Subtle: {
          strength: 0.08,
          radius: 0.16,
          size: 0.9,
          edgeWidth: 0.03,
          edgeOpacity: 0.15,
          rimLightIntensity: 0.2,
          rimLightWidth: 0.06,
          chromaticAberration: 0.02,
          reflectionIntensity: 0.2,
          waveDistortion: 0.04,
          waveSpeed: 1,
          lensBlur: 0.08,
          clearCenterSize: 0.4
        },
        "Classic Glass": {
          strength: 0.12,
          radius: 0.18,
          size: 1,
          edgeWidth: 0.04,
          edgeOpacity: 0.25,
          rimLightIntensity: 0.3,
          rimLightWidth: 0.08,
          chromaticAberration: 0.025,
          reflectionIntensity: 0.35,
          waveDistortion: 0.03,
          waveSpeed: 0.5,
          lensBlur: 0.12,
          clearCenterSize: 0.2
        },
        Dramatic: {
          strength: 0.25,
          radius: 0.35,
          size: 1.2,
          edgeWidth: 0.08,
          edgeOpacity: 0.4,
          rimLightIntensity: 0.5,
          rimLightWidth: 0.1,
          chromaticAberration: 0.06,
          reflectionIntensity: 0.5,
          waveDistortion: 0.15,
          waveSpeed: 1.8,
          lensBlur: 0.25,
          clearCenterSize: 0.15
        },
        "Chromatic Focus": {
          strength: 0.1,
          radius: 0.22,
          size: 1,
          edgeWidth: 0.06,
          edgeOpacity: 0.3,
          rimLightIntensity: 0.25,
          rimLightWidth: 0.07,
          chromaticAberration: 0.08,
          reflectionIntensity: 0.2,
          waveDistortion: 0.05,
          waveSpeed: 0.8,
          lensBlur: 0.1,
          clearCenterSize: 0.25
        },
        "Liquid Wave": {
          strength: 0.18,
          radius: 0.28,
          size: 1.1,
          edgeWidth: 0.05,
          edgeOpacity: 0.2,
          rimLightIntensity: 0.4,
          rimLightWidth: 0.09,
          chromaticAberration: 0.04,
          reflectionIntensity: 0.4,
          waveDistortion: 0.2,
          waveSpeed: 2.5,
          lensBlur: 0.15,
          clearCenterSize: 0.1
        },
        Gigantic: {
          strength: 0.4,
          radius: 0.65,
          size: 1.8,
          edgeWidth: 0.12,
          edgeOpacity: 0.6,
          rimLightIntensity: 0.8,
          rimLightWidth: 0.15,
          chromaticAberration: 0.1,
          reflectionIntensity: 0.7,
          waveDistortion: 0.25,
          waveSpeed: 1.5,
          lensBlur: 0.35,
          clearCenterSize: 0.05
        }
      }
    },

    scene: null,
    camera: null,
    renderer: null,
    composer: null,
    customPass: null,
    backgroundTexture: null,
    backgroundMesh: null,
    aspect: 1,
    backgroundScene: null,
    backgroundCamera: null,
    mousePosition: { x: 0.5, y: 0.5 },
    targetMousePosition: { x: 0.5, y: 0.5 },
    staticMousePosition: { x: 0.5, y: 0.5 },
    performanceMonitor: { frameCount: 0, lastTime: 0, fps: 60 },
    pane: null,
    isBackgroundPlaying: false,
    paneVisible: false,
    paneInitialized: false,
    isSceneReady: false,
    isTextureLoaded: false,
    webglSupported: supportsWebGL(),
    noiseInitialized: false,
    noiseAnimationId: null,
    
    // Bölge yönetimi
    regions: [], // Eklenen tüm bölgeler
    tierListItems: [], // Tier list öğeleri
    externalResources: [], // Dış kaynaklar
    
    // Müzik sistemi
    musicFiles: [
      "assets/music/arc1.mp3",
      "assets/music/arc2.mp3",
      "assets/music/arc3.mp3"
    ],
    currentMusicIndex: -1,
    playedMusicIndices: [],
    backgroundMusic: null,

    init() {
      this.setupAudio();
      this.setupKeyboardControls();
      this.bindEvents();
      // Noise canvas lazy load - START butonuna basıldığında başlatılacak
      this.loadRegionsFromStorage(); // Kaydedilmiş bölgeleri yükle
      this.loadTierListFromStorage(); // Kaydedilmiş tier list öğelerini yükle
      this.loadExternalResourcesFromStorage(); // Kaydedilmiş dış kaynakları yükle
      this.setupModalHandlers();
      this.setupNavClickHandlers();
      this.setupCrosshair();
      if (!this.webglSupported) {
        this.showFallback();
        return;
      }
      this.waitForDependencies();
    },
    
    setupCrosshair() {
      const crosshair = document.getElementById("crosshair");
      if (!crosshair) return;
      
      let mouseX = 0;
      let mouseY = 0;
      let crosshairX = 0;
      let crosshairY = 0;
      let isAnimating = false;
      
      const updateCrosshair = () => {
        if (!isAnimating) return;
        
        // Smooth follow
        crosshairX += (mouseX - crosshairX) * 0.1;
        crosshairY += (mouseY - crosshairY) * 0.1;
        
        crosshair.style.left = crosshairX + "px";
        crosshair.style.top = crosshairY + "px";
        
        requestAnimationFrame(updateCrosshair);
      };
      
      document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!crosshair.classList.contains("visible")) {
          crosshair.classList.add("visible");
        }
        if (!isAnimating) {
          isAnimating = true;
          updateCrosshair();
        }
      });
      
      document.addEventListener("mouseenter", () => {
        crosshair.classList.add("visible");
        if (!isAnimating) {
          isAnimating = true;
          updateCrosshair();
        }
      });
      
      document.addEventListener("mouseleave", () => {
        crosshair.classList.remove("visible");
        isAnimating = false;
      });
    },
    
    initNoiseCanvas() {
      const canvas = document.getElementById("noise");
      if (!canvas) return;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      // Canvas boyutunu küçült - performans optimizasyonu
      const scale = Math.min(window.devicePixelRatio || 1, 1.5);
      const canvasWidth = Math.floor(window.innerWidth / scale);
      const canvasHeight = Math.floor(window.innerHeight / scale);
      
      const resizeCanvas = () => {
        const newWidth = Math.floor(window.innerWidth / scale);
        const newHeight = Math.floor(window.innerHeight / scale);
        canvas.width = newWidth;
        canvas.height = newHeight;
        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = window.innerHeight + "px";
      };
      
      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);
      
      // Noise generation - optimized subtle effect
      let frameCount = 0;
      const noiseIntensity = 0.2; // Noise yoğunluğu azaltıldı (0.3 -> 0.2)
      const updateInterval = 12; // Update interval artırıldı (3 -> 12)
      const pixelSkip = 2; // Her 2 pikselde bir işle (performans optimizasyonu)
      
      // Önceden hesaplanmış noise pattern (daha hızlı)
      let noisePattern = null;
      const generateNoisePattern = () => {
        const width = canvas.width;
        const height = canvas.height;
        const pattern = new Uint8ClampedArray(width * height);
        
        for (let i = 0; i < pattern.length; i++) {
          pattern[i] = Math.random() < noiseIntensity ? Math.floor(Math.random() * 30 + 120) : 0;
        }
        return pattern;
      };
      
      const generateNoise = () => {
        if (!noisePattern || canvas.width * canvas.height !== noisePattern.length) {
          noisePattern = generateNoisePattern();
        }
        
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;
        
        // Optimize edilmiş noise generation - sadece gerekli pikselleri işle
        for (let y = 0; y < height; y += pixelSkip) {
          for (let x = 0; x < width; x += pixelSkip) {
            const idx = y * width + x;
            const value = noisePattern[idx];
            
            if (value > 0) {
              const i = (y * width + x) * 4;
              data[i] = value;     // R
              data[i + 1] = value; // G
              data[i + 2] = value; // B
              data[i + 3] = 255;   // A
            }
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
      };
      
      // Generate noise with slower update rate
      let animationId = null;
      const animate = () => {
        frameCount++;
        if (frameCount % updateInterval === 0) {
          generateNoise();
        }
        animationId = requestAnimationFrame(animate);
      };
      
      // Animation'ı başlat ve ID'yi sakla
      this.noiseAnimationId = requestAnimationFrame(animate);
      animate();
    },

    waitForDependencies() {
      const chk = setInterval(() => {
        // GSAP yüklendi mi kontrol et (SplitText opsiyonel)
        if (window.gsap) {
          clearInterval(chk);
          // SplitText varsa trial uyarısını kapat
          if (window.SplitText && window.gsap && window.gsap.config) {
            window.gsap.config({ trialWarn: false });
          }
          this.onDependenciesReady();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(chk);
        // Timeout sonrası da çalıştır (GSAP yüklüyse)
        if (window.gsap) {
          this.onDependenciesReady();
        }
      }, 10000);
    },

    onDependenciesReady() {},

    showError(m) {
      const el = document.getElementById("errorMessage");
      if (!el) return;
      el.textContent = m;
      el.style.display = "block";
      setTimeout(() => (el.style.display = "none"), 5000);
    },

    showFallback() {
      document.getElementById("fallbackBg").classList.add("active");
      this.finishPreloader();
    },

    setupAudio() {
      this.startClickSound = document.getElementById("startClickSound");
      this.preloaderSound = document.getElementById("preloaderSound");
      this.hoverSound = document.getElementById("hoverSound");
      // Background music will be created dynamically
      this.initMusicSystem();
    },
    
    initMusicSystem() {
      // Müzik dosyalarını kontrol et ve geçerli olanları filtrele
      this.musicFiles = this.musicFiles.filter((file, index) => {
        // Burada dosya varlığını kontrol edebilirsiniz
        // Şimdilik tüm dosyaları kabul ediyoruz
        return true;
      });
      
      if (this.musicFiles.length === 0) {
        console.warn("No music files found in assets/music/");
        return;
      }
      
      // İlk rastgele şarkıyı seç
      this.selectRandomMusic();
    },
    
    selectRandomMusic() {
      // Eğer tüm şarkılar çalındıysa, listeyi sıfırla
      if (this.playedMusicIndices.length >= this.musicFiles.length) {
        this.playedMusicIndices = [];
      }
      
      // Çalınmamış şarkıları bul
      const availableIndices = this.musicFiles
        .map((_, index) => index)
        .filter(index => !this.playedMusicIndices.includes(index));
      
      // Rastgele bir şarkı seç
      const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      this.currentMusicIndex = randomIndex;
      this.playedMusicIndices.push(randomIndex);
      
      // Yeni audio elementi oluştur
      this.createMusicPlayer();
    },
    
    createMusicPlayer() {
      // Eski müzik player'ı kaldır
      if (this.backgroundMusic) {
        this.backgroundMusic.pause();
        this.backgroundMusic.removeEventListener("ended", this.onMusicEnd);
        this.backgroundMusic.removeEventListener("error", this.onMusicError);
        if (this.backgroundMusic.parentNode) {
          this.backgroundMusic.parentNode.removeChild(this.backgroundMusic);
        }
        this.backgroundMusic = null;
      }
      
      // Yeni audio elementi oluştur
      const audio = document.createElement("audio");
      audio.preload = "auto";
      audio.volume = 0.3;
      
      const source = document.createElement("source");
      source.src = this.musicFiles[this.currentMusicIndex];
      source.type = "audio/mpeg";
      
      audio.appendChild(source);
      document.body.appendChild(audio);
      
      // Event listener'ları bağla (arrow function ile this context'ini koru)
      audio.addEventListener("ended", () => this.onMusicEnd());
      audio.addEventListener("error", (e) => this.onMusicError(e));
      
      this.backgroundMusic = audio;
      console.log(`Loaded music: ${this.musicFiles[this.currentMusicIndex]}`);
    },
    
    onMusicError(e) {
      console.warn(`Error loading music: ${this.musicFiles[this.currentMusicIndex]}`, e);
      // Bir sonraki şarkıya geç
      this.onMusicEnd();
    },
    
    onMusicEnd() {
      console.log("Music ended, playing next track...");
      // Bir sonraki şarkıyı seç ve çal
      this.selectRandomMusic();
      if (this.backgroundMusic && this.isBackgroundPlaying) {
        this.backgroundMusic.play().catch((err) => {
          console.warn("Error playing next music:", err);
        });
      }
    },

    bindEvents() {
      const enableBtn = document.getElementById("enableBtn");
      if (!enableBtn) {
        console.error("enableBtn not found!");
        this.showError("START button not found. Please refresh the page.");
        return;
      }
      
      enableBtn.onclick = () => {
        console.log("START button clicked");
        this.onStartClick();
      };
      
      // Enter tuşu desteği
      document.addEventListener("keydown", (e) => {
        const audioEnable = document.querySelector(".audio-enable");
        // Eğer audio-enable görünürse ve Enter tuşuna basılırsa
        if (e.key === "Enter" && audioEnable && audioEnable.style.display !== "none") {
          e.preventDefault();
          console.log("Enter key pressed");
          this.onStartClick();
        }
      });
    },

    onStartClick() {
      console.log("onStartClick called");
      try {
        document.body.classList.add("loading-active");
        this.startClickSound?.play().catch((err) => console.warn("Start sound error:", err));
        
        const audioEnable = document.querySelector(".audio-enable");
        if (audioEnable) {
          audioEnable.style.display = "none";
        } else {
          console.error("audio-enable element not found");
        }
        
        const preloader = document.getElementById("preloader");
        if (preloader) {
          preloader.style.display = "flex";
        } else {
          console.error("preloader element not found");
        }
        
        this.preloaderSound?.play().catch((err) => console.warn("Preloader sound error:", err));
        
        // Noise canvas'ı başlat (lazy load)
        if (!this.noiseInitialized) {
          this.initNoiseCanvas();
          this.noiseInitialized = true;
        }
        
        setTimeout(() => {
          if (this.backgroundMusic && this.musicFiles.length > 0) {
            this.backgroundMusic.volume = 0.3;
            this.backgroundMusic.play().catch((err) => {
              console.warn("Background music error:", err);
              // Hata durumunda bir sonraki şarkıya geç
              this.onMusicEnd();
            });
            this.isBackgroundPlaying = true;
          } else if (this.musicFiles.length === 0) {
            console.warn("No music files available to play");
          }
        }, 500);
        this.webglSupported ? this.initializeScene() : this.showFallback();
        this.startPreloader();
      } catch (error) {
        console.error("Error in onStartClick:", error);
        this.showError("Failed to start: " + error.message);
      }
    },

    startPreloader() {
      let c = 0;
      const timer = setInterval(() => {
        const el = document.getElementById("counter");
        if (el)
          el.textContent =
            "[" + (c < 10 ? "00" : c < 100 ? "0" : "") + ++c + "]";
        if (c >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            this.preloaderSound?.pause();
            if (this.preloaderSound) this.preloaderSound.currentTime = 0;
            this.finishPreloader();
          }, 200);
        }
      }, 30);
    },

    finishPreloader() {
      const wait = () => {
        if (
          (this.isSceneReady && this.isTextureLoaded) ||
          !this.webglSupported
        ) {
          const pre = document.getElementById("preloader");
          pre.classList.add("fade-out");
          if (this.webglSupported)
            document.getElementById("canvas").classList.add("ready");
          setTimeout(() => {
            document.body.classList.remove("loading-active");
            pre.style.display = "none";
            pre.classList.remove("fade-out");
            this.animateTextElements();
            this.showLogo();
          }, 800);
        } else setTimeout(wait, 50);
      };
      wait();
    },

    // SplitText alternatifi - metinleri satır bazında böler
    // HTML'deki <br> tag'lerini kullanarak satırları ayırır
    splitTextIntoLines(selector) {
      const element = document.querySelector(selector);
      if (!element) return [];

      // Mevcut içeriği al
      const originalHTML = element.innerHTML;
      
      // <br> veya <br/> tag'lerini ayırıcı olarak kullan
      // Satırları ayır ve boş satırları filtrele
      const lines = originalHTML
        .split(/<br\s*\/?>/i)
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      // Eğer sadece bir satır varsa (br yoksa), direkt döndür
      if (lines.length === 1) {
        const lineSpan = document.createElement('span');
        lineSpan.className = 'line';
        lineSpan.style.display = 'block';
        lineSpan.innerHTML = lines[0];
        element.innerHTML = '';
        element.appendChild(lineSpan);
        return [lineSpan];
      }
      
      // Her satırı <span class="line"> içine al
      element.innerHTML = '';
      const lineElements = lines.map(line => {
        const lineSpan = document.createElement('span');
        lineSpan.className = 'line';
        lineSpan.style.display = 'block';
        lineSpan.innerHTML = line;
        element.appendChild(lineSpan);
        return lineSpan;
      });
      
      return lineElements;
    },

    animateTextElements() {
      if (!window.gsap) {
        this.fallbackTextAnimation();
        return;
      }

      const ease = window.CustomEase
        ? (CustomEase.create("customOut", "0.65,0.05,0.36,1"), "customOut")
        : "power2.out";
      const containers = [
        ".description",
        ".division",
        ".signal",
        ".central-text",
        ".footer"
      ];

      gsap.set(containers.concat(".nav-links"), { opacity: 0 });

      // SplitText yerine kendi fonksiyonumuzu kullan
      let splits;
      if (window.SplitText) {
        // SplitText varsa kullan (trial versiyonu)
        splits = containers.map(
          (sel) =>
            SplitText.create(sel, { type: "lines", linesClass: "line" }).lines
        );
      } else {
        // Alternatif çözüm: kendi fonksiyonumuz
        splits = containers.map((sel) => this.splitTextIntoLines(sel));
      }
      
      const [descLines, divLines, sigLines, centralLines, footerLines] = splits;

      gsap.set(containers, { opacity: 1 });
      gsap.set(splits.flat().concat(".nav-links a"), { opacity: 0, y: 30 });

      const tl = gsap.timeline();
      tl.to(descLines, { opacity: 1, y: 0, duration: 0.8, ease, stagger: 0.18 })
        .to(".nav-links", { opacity: 1, duration: 0.2 }, 0.12)
        .to(
          ".nav-links a",
          { opacity: 1, y: 0, duration: 0.8, ease, stagger: 0.15 },
          0.12
        )
        .to(
          centralLines,
          { opacity: 1, y: 0, duration: 0.8, ease, stagger: 0.22 },
          0.25
        )
        .to(
          footerLines,
          { opacity: 1, y: 0, duration: 0.8, ease, stagger: 0.18 },
          0.4
        )
        .to(
          divLines,
          { opacity: 1, y: 0, duration: 0.8, ease, stagger: 0.18 },
          0.55
        )
        .to(
          sigLines,
          { opacity: 1, y: 0, duration: 0.8, ease, stagger: 0.18 },
          0.55
        );
    },

    fallbackTextAnimation() {
      let d = 0;
      document.querySelectorAll(".text-element").forEach((el) => {
        setTimeout(() => {
          el.style.opacity = "1";
          el.style.transform = el.classList.contains("central-text")
            ? "translateX(-50%) translateY(0)"
            : "translateY(0)";
        }, d);
        d += 250;
      });
    },
    
    showLogo() {
      const logoContainer = document.querySelector(".logo-container");
      if (logoContainer) {
        setTimeout(() => {
          logoContainer.classList.add("visible");
        }, 1000);
      }
    },

    initializeScene() {
      if (!this.webglSupported) {
        this.isSceneReady = this.isTextureLoaded = true;
        return;
      }

      const canvas = document.getElementById("canvas");
      this.renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        premultipliedAlpha: false
      });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.autoClear = false;

      this.aspect = window.innerWidth / window.innerHeight;

      this.backgroundScene = new THREE.Scene();
      this.backgroundCamera = new THREE.OrthographicCamera(
        -this.aspect,
        this.aspect,
        1,
        -1,
        0.1,
        10
      );
      this.backgroundCamera.position.z = 1;

      this.scene = new THREE.Scene();
      this.camera = new THREE.OrthographicCamera(
        -this.aspect,
        this.aspect,
        1,
        -1,
        0.1,
        10
      );
      this.camera.position.z = 1;

      this.loadBackgroundTexture();
      this.setupPostProcessing();
      this.setupPane();
      this.setupNavHoverSounds();

      const onResize = this.onWindowResize.bind(this);
      const onMouseMove = this.onMouseMove.bind(this);
      const onTouchMove = this.onTouchMove.bind(this);
      const onTouchStart = this.onTouchStart.bind(this);

      window.addEventListener("resize", onResize);
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("touchmove", onTouchMove);
      document.addEventListener("touchstart", onTouchStart);

      this.animate();
      this.isSceneReady = true;
    },

    onMouseMove(e) {
      if (this.PARAMS.distortion.followMouse) {
        this.targetMousePosition.x = e.clientX / window.innerWidth;
        this.targetMousePosition.y = 1 - e.clientY / window.innerHeight;
      }
    },

    onTouchStart(e) {
      e.preventDefault();
      if (e.touches.length) this.onTouchMove(e);
    },

    onTouchMove(e) {
      e.preventDefault();
      if (this.PARAMS.distortion.followMouse && e.touches.length) {
        const t = e.touches[0];
        this.targetMousePosition.x = t.clientX / window.innerWidth;
        this.targetMousePosition.y = 1 - t.clientY / window.innerHeight;
      }
    },

    loadBackgroundTexture() {
      new THREE.TextureLoader().load(
        "assets/Background.jpg",
        (tex) => {
          this.backgroundTexture = tex;
          this.createBackgroundMesh();
          this.isTextureLoaded = true;
        },
        undefined,
        () => {
          // JPG yüklenemezse PNG dene
          new THREE.TextureLoader().load(
            "assets/Background.png",
            (tex) => {
              this.backgroundTexture = tex;
              this.createBackgroundMesh();
              this.isTextureLoaded = true;
            },
            undefined,
            () => (this.isTextureLoaded = true)
          );
        }
      );
    },

    createBackgroundMesh() {
      if (this.backgroundMesh) this.backgroundScene.remove(this.backgroundMesh);

      const imgAspect =
        this.backgroundTexture.image.width /
        this.backgroundTexture.image.height;
      const scAspect = window.innerWidth / window.innerHeight;
      let sx, sy;

      if (scAspect > imgAspect) {
        sx = scAspect * 2;
        sy = sx / imgAspect;
      } else {
        sy = 2;
        sx = sy * imgAspect;
      }

      const g = new THREE.PlaneGeometry(sx, sy);
      const m = new THREE.MeshBasicMaterial({ map: this.backgroundTexture });
      this.backgroundMesh = new THREE.Mesh(g, m);
      this.backgroundScene.add(this.backgroundMesh);
    },

    setupPostProcessing() {
      this.composer = new EffectComposer(this.renderer);
      const rp = new RenderPass(this.backgroundScene, this.backgroundCamera);
      this.composer.addPass(rp);
      this.setupDistortionPass();
    },

    setupDistortionPass() {
      const v = `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
      const f = `uniform sampler2D tDiffuse;uniform vec2 uMouse;uniform float uRadius;uniform float uSize;uniform float uStrength;uniform float uEdgeWidth;uniform float uEdgeOpacity;uniform float uRimLightIntensity;uniform float uRimLightWidth;uniform float uChromaticAberration;uniform float uReflectionIntensity;uniform float uWaveDistortion;uniform float uWaveSpeed;uniform float uLensBlur;uniform float uClearCenterSize;uniform float uOverallIntensity;uniform float uAspect;uniform float uTime;varying vec2 vUv;

vec4 blur(sampler2D i,vec2 uv,vec2 r,vec2 d,float it){vec4 c=vec4(0.);vec2 o=1.3333333*d*it;c+=texture2D(i,uv)*.2941176;c+=texture2D(i,uv+(o/r))*.3529412;c+=texture2D(i,uv-(o/r))*.3529412;return c;}

void main(){
  vec2 c=uMouse;
  vec2 a=vUv;
  a.x*=uAspect;
  c.x*=uAspect;
  float dist=distance(a,c);
  float rad=uRadius*uSize;
  vec4 orig=texture2D(tDiffuse,vUv);
  
  // Calculate the effect for all pixels
  float nd=dist/rad;
  vec2 dir=normalize(a-c);
  float cl=uClearCenterSize*rad;
  float df=smoothstep(cl,rad,dist);
  float powd=1.+nd*2.;
  vec2 dUv=a-dir*uStrength*pow(df,powd);
  float w1=sin(nd*8.-uTime*uWaveSpeed)*uWaveDistortion;
  float w2=cos(nd*12.-uTime*uWaveSpeed*.7)*uWaveDistortion*.5;
  dUv+=dir*(w1+w2)*df;
  dUv.x/=uAspect;
  float ab=uChromaticAberration*df*(1.+nd);
  vec2 rO=dir*ab*1.2/vec2(uAspect,1.);
  vec2 bO=dir*ab*0.8/vec2(uAspect,1.);
  vec4 colR=texture2D(tDiffuse,dUv+rO);
  vec4 colG=texture2D(tDiffuse,dUv);
  vec4 colB=texture2D(tDiffuse,dUv-bO);
  vec4 ref1=texture2D(tDiffuse,vUv+dir*0.08*df);
  vec4 ref2=texture2D(tDiffuse,vUv+dir*0.15*df);
  vec4 ref=mix(ref1,ref2,.6);
  vec4 col=vec4(colR.r,colG.g,colB.b,1.);
  col=mix(col,ref,uReflectionIntensity*df);
  float bl=uLensBlur*df*(1.+nd*.5);
  vec4 blr=blur(tDiffuse,dUv,vec2(1./uAspect,1.),vec2(1.),bl);
  col=mix(col,blr,df*.7);
  float edge=smoothstep(rad-uEdgeWidth,rad,dist);
  vec3 eCol=mix(vec3(1.),vec3(.8,.9,1.),nd);
  col=mix(col,vec4(eCol,1.),edge*uEdgeOpacity);
  float rimD=rad-uRimLightWidth;
  float rim=smoothstep(rimD-0.02,rimD+0.02,dist);
  rim*=(1.-smoothstep(rad-0.01,rad,dist));
  col=mix(col,vec4(1.),rim*uRimLightIntensity);
  float br=1.+sin(nd*6.-uTime*2.)*.1*df;
  col.rgb*=br;
  
  // Replace hard cutoff with ultra-tight smoothstep to fix jagged edges
  float effectMask = 1.0 - smoothstep(rad - 0.001, rad + 0.001, dist);
  
  gl_FragColor=mix(orig, mix(orig,col,uOverallIntensity), effectMask);
}`;

      this.customPass = new ShaderPass({
        uniforms: {
          tDiffuse: { value: null },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          uRadius: { value: this.PARAMS.distortion.radius },
          uSize: { value: this.PARAMS.distortion.size },
          uStrength: { value: this.PARAMS.distortion.strength },
          uEdgeWidth: { value: this.PARAMS.distortion.edgeWidth },
          uEdgeOpacity: { value: this.PARAMS.distortion.edgeOpacity },
          uRimLightIntensity: {
            value: this.PARAMS.distortion.rimLightIntensity
          },
          uRimLightWidth: { value: this.PARAMS.distortion.rimLightWidth },
          uChromaticAberration: {
            value: this.PARAMS.distortion.chromaticAberration
          },
          uReflectionIntensity: {
            value: this.PARAMS.distortion.reflectionIntensity
          },
          uWaveDistortion: { value: this.PARAMS.distortion.waveDistortion },
          uWaveSpeed: { value: this.PARAMS.distortion.waveSpeed },
          uLensBlur: { value: this.PARAMS.distortion.lensBlur },
          uClearCenterSize: { value: this.PARAMS.distortion.clearCenterSize },
          uOverallIntensity: { value: this.PARAMS.distortion.overallIntensity },
          uAspect: { value: this.aspect },
          uTime: { value: 0 }
        },
        vertexShader: v,
        fragmentShader: f
      });

      this.customPass.renderToScreen = true;
      this.composer.addPass(this.customPass);
    },

    setupNavHoverSounds() {
      document.querySelectorAll(".nav-links a").forEach((a) => {
        a.addEventListener("mouseenter", () => {
          if (this.hoverSound && this.isBackgroundPlaying) {
            this.hoverSound.currentTime = 0;
            this.hoverSound.volume = 0.4;
            this.hoverSound.play().catch(() => {});
          }
        });
      });
    },
    
    setupNavClickHandlers() {
      document.querySelectorAll(".nav-links a").forEach((link, index) => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const menuText = link.textContent.trim();
          
          if (menuText === "YENİ BÖLGE EKLE") {
            this.openNewRegionModal();
          } else if (menuText === "BÖLGELER") {
            this.openRegionsModal();
          } else if (menuText === "TIER LIST") {
            this.openTierListModal();
          } else if (menuText === "DIŞ KAYNAKLAR") {
            this.openExternalResourcesModal();
          } else {
            console.log(`Nav link clicked: ${menuText}`);
          }
        });
      });
    },
    
    openNewRegionModal() {
      const modal = document.getElementById("newRegionModal");
      if (modal) {
        modal.classList.add("active");
        // Formu sıfırla
        const form = document.getElementById("newRegionForm");
        if (form) form.reset();
        const fileNameDisplay = document.getElementById("imageFileName");
        if (fileNameDisplay) fileNameDisplay.textContent = "Dosya seçilmedi.";
      }
    },
    
    closeModal() {
      const modal = document.getElementById("newRegionModal");
      if (modal) {
        modal.classList.remove("active");
      }
    },
    
    setupModalHandlers() {
      const modal = document.getElementById("newRegionModal");
      if (!modal) return;

      const closeBtn = modal.querySelector("#modalCloseBtn");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => this.closeModal());
      }

      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.closeModal();
        }
      });

      const form = document.getElementById("newRegionForm");
      if (form) {
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          const formData = new FormData(form);
          const data = Object.fromEntries(formData.entries());
          
          // Bölgeyi kaydet
          const region = {
            id: Date.now(), // Basit ID
            name: data.regionName,
            category: data.regionCategory,
            map: data.regionMap,
            description: data.regionDescription || "",
            image: data.regionImage ? data.regionImage.name : null,
            createdAt: new Date().toISOString()
          };
          
          this.regions.push(region);
          console.log("Bölge eklendi:", region);
          console.log("Toplam bölge sayısı:", this.regions.length);
          
          // LocalStorage'a kaydet (opsiyonel)
          this.saveRegionsToStorage();
          
          this.closeModal();
        });
      }

      const fileInput = document.getElementById("regionImage");
      const fileButton = modal.querySelector("#imageUploadBtn");
      const fileNameDisplay = document.getElementById("imageFileName");

      if (fileButton && fileInput && fileNameDisplay) {
        fileButton.addEventListener("click", () => {
          fileInput.click();
        });

        fileInput.addEventListener("change", () => {
          if (fileInput.files.length > 0) {
            fileNameDisplay.textContent = fileInput.files[0].name;
          } else {
            fileNameDisplay.textContent = "Dosya seçilmedi.";
          }
        });
      }

      const cancelButton = modal.querySelector("#modalCancelBtn");
      if (cancelButton) {
        cancelButton.addEventListener("click", () => this.closeModal());
      }
    },
    
    openRegionsModal() {
      const modal = document.getElementById("regionsModal");
      if (modal) {
        modal.classList.add("active");
        this.renderRegions();
        this.setupRegionsModalHandlers();
      }
    },
    
    closeRegionsModal() {
      const modal = document.getElementById("regionsModal");
      if (modal) {
        modal.classList.remove("active");
      }
    },
    
    setupRegionsModalHandlers() {
      const modal = document.getElementById("regionsModal");
      if (!modal) return;

      const closeBtn = modal.querySelector("#regionsModalCloseBtn");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => this.closeRegionsModal());
      }

      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.closeRegionsModal();
        }
      });

      // Arama input'u
      const searchInput = document.getElementById("regionsSearchInput");
      if (searchInput) {
        searchInput.addEventListener("input", () => {
          this.filterRegions();
        });
      }

      // Harita filtresi
      const mapFilter = document.getElementById("regionsMapFilter");
      if (mapFilter) {
        mapFilter.addEventListener("change", () => {
          this.filterRegions();
        });
      }
    },
    
    renderRegions(filteredRegions = null) {
      const listContainer = document.getElementById("regionsList");
      if (!listContainer) return;

      const regionsToShow = filteredRegions !== null ? filteredRegions : this.regions;

      if (regionsToShow.length === 0) {
        listContainer.innerHTML = `
          <div class="empty-state">
            <p>Henüz bölge eklenmemiş.</p>
            <p class="empty-hint">Yeni bölge eklemek için "YENİ BÖLGE EKLE" menüsünü kullanın.</p>
          </div>
        `;
        return;
      }

      listContainer.innerHTML = regionsToShow.map(region => `
        <div class="loot-region-card" data-region-id="${region.id}" style="cursor: pointer;">
          <div class="region-card-header">
            <h3 class="region-card-title">${region.name}</h3>
            <span class="region-card-badge">${region.category}</span>
          </div>
          <div class="region-card-info">
            <div class="region-card-info-item">
              <span class="region-card-info-label">Harita:</span>
              <span>${region.map}</span>
            </div>
            ${region.description ? `
            <div class="region-card-description">
              ${region.description}
            </div>
            ` : ''}
          </div>
        </div>
      `).join('');
      
      // Kartlara tıklama event'i ekle
      listContainer.querySelectorAll('.loot-region-card').forEach(card => {
        card.addEventListener('click', (e) => {
          const regionId = parseInt(card.getAttribute('data-region-id'));
          const region = this.regions.find(r => r.id === regionId);
          if (region) {
            this.openRegionDetailModal(region);
          }
        });
      });
    },
    
    filterRegions() {
      const searchInput = document.getElementById("regionsSearchInput");
      const mapFilter = document.getElementById("regionsMapFilter");
      
      const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";
      const selectedMap = mapFilter ? mapFilter.value : "";

      let filtered = [...this.regions];

      // Harita filtresi
      if (selectedMap) {
        filtered = filtered.filter(region => region.map === selectedMap);
      }

      // Arama filtresi
      if (searchTerm) {
        filtered = filtered.filter(region => 
          region.name.toLowerCase().includes(searchTerm) ||
          (region.description && region.description.toLowerCase().includes(searchTerm)) ||
          region.map.toLowerCase().includes(searchTerm) ||
          region.category.toLowerCase().includes(searchTerm)
        );
      }

      this.renderRegions(filtered);
    },
    
    openTierListModal() {
      const modal = document.getElementById("tierListModal");
      if (modal) {
        modal.classList.add("active");
        this.renderTierListItems();
        this.setupTierListModalHandlers();
      }
    },
    
    closeTierListModal() {
      const modal = document.getElementById("tierListModal");
      if (modal) {
        modal.classList.remove("active");
      }
    },
    
    setupTierListModalHandlers() {
      const modal = document.getElementById("tierListModal");
      if (!modal) return;

      const closeBtn = modal.querySelector("#tierListModalCloseBtn");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => this.closeTierListModal());
      }

      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.closeTierListModal();
        }
      });

      const addBtn = document.getElementById("tierListAddBtn");
      if (addBtn) {
        addBtn.addEventListener("click", () => {
          this.openTierListAddModal();
        });
      }
    },
    
    renderTierListItems() {
      const listContainer = document.getElementById("tierListItems");
      if (!listContainer) return;

      if (this.tierListItems.length === 0) {
        listContainer.innerHTML = `
          <div class="empty-state">
            <p>Henüz tier list öğesi eklenmemiş.</p>
            <p class="empty-hint">Yeni öğe eklemek için "YENİ EKLE" butonunu kullanın.</p>
          </div>
        `;
        return;
      }

      listContainer.innerHTML = this.tierListItems.map(item => `
        <div class="loot-region-card">
          <div class="region-card-header">
            <h3 class="region-card-title">${item.title}</h3>
            <span class="region-card-badge">${item.category}</span>
          </div>
          <div class="region-card-info">
            ${item.description ? `
            <div class="region-card-description">
              ${item.description}
            </div>
            ` : ''}
            ${item.image ? `
            <div class="region-card-image">
              <img src="${item.image}" alt="${item.title}" style="max-width: 100%; height: auto; margin-top: 0.5rem;">
            </div>
            ` : ''}
          </div>
        </div>
      `).join('');
    },
    
    openTierListAddModal() {
      const modal = document.getElementById("tierListAddModal");
      if (modal) {
        // Mevcut açık modal'ı kontrol et
        const existingModal = document.querySelector('.modal-overlay.active');
        if (existingModal && existingModal.id !== 'tierListAddModal') {
          modal.classList.add('modal-nested');
        }
        modal.classList.add("active");
        const form = document.getElementById("tierListAddForm");
        if (form) form.reset();
        const fileNameDisplay = document.getElementById("tierListImageFileName");
        if (fileNameDisplay) fileNameDisplay.textContent = "Dosya seçilmedi";
        this.setupTierListAddModalHandlers();
      }
    },
    
    closeTierListAddModal() {
      const modal = document.getElementById("tierListAddModal");
      if (modal) {
        modal.classList.remove("active");
        modal.classList.remove("modal-nested");
      }
    },
    
    setupTierListAddModalHandlers() {
      const modal = document.getElementById("tierListAddModal");
      if (!modal) return;

      const closeBtn = modal.querySelector("#tierListAddModalCloseBtn");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => this.closeTierListAddModal());
      }

      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.closeTierListAddModal();
        }
      });

      const form = document.getElementById("tierListAddForm");
      if (form) {
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          const formData = new FormData(form);
          const data = Object.fromEntries(formData.entries());
          
          const item = {
            id: Date.now(),
            title: data.tierListTitle,
            category: data.tierListCategory,
            description: data.tierListDescription || "",
            image: data.tierListImage ? data.tierListImage.name : null,
            createdAt: new Date().toISOString()
          };
          
          this.tierListItems.push(item);
          this.saveTierListToStorage();
          this.closeTierListAddModal();
          this.renderTierListItems();
        });
      }

      const fileInput = document.getElementById("tierListImage");
      const fileButton = modal.querySelector("#tierListImageUploadBtn");
      const fileNameDisplay = document.getElementById("tierListImageFileName");

      if (fileButton && fileInput && fileNameDisplay) {
        fileButton.addEventListener("click", () => {
          fileInput.click();
        });

        fileInput.addEventListener("change", () => {
          if (fileInput.files.length > 0) {
            fileNameDisplay.textContent = fileInput.files[0].name;
          } else {
            fileNameDisplay.textContent = "Dosya seçilmedi";
          }
        });
      }

      const cancelButton = modal.querySelector("#tierListAddCancelBtn");
      if (cancelButton) {
        cancelButton.addEventListener("click", () => this.closeTierListAddModal());
      }
    },
    
    openExternalResourcesModal() {
      const modal = document.getElementById("externalResourcesModal");
      if (modal) {
        modal.classList.add("active");
        this.renderExternalResources();
        this.setupExternalResourcesModalHandlers();
      }
    },
    
    closeExternalResourcesModal() {
      const modal = document.getElementById("externalResourcesModal");
      if (modal) {
        modal.classList.remove("active");
      }
    },
    
    setupExternalResourcesModalHandlers() {
      const modal = document.getElementById("externalResourcesModal");
      if (!modal) return;

      const closeBtn = modal.querySelector("#externalResourcesModalCloseBtn");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => this.closeExternalResourcesModal());
      }

      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.closeExternalResourcesModal();
        }
      });

      const addBtn = document.getElementById("externalResourcesAddBtn");
      if (addBtn) {
        addBtn.addEventListener("click", () => {
          this.openExternalResourcesAddModal();
        });
      }
    },
    
    renderExternalResources() {
      const listContainer = document.getElementById("externalResourcesItems");
      if (!listContainer) return;

      if (this.externalResources.length === 0) {
        listContainer.innerHTML = `
          <div class="empty-state">
            <p>Henüz dış kaynak eklenmemiş.</p>
            <p class="empty-hint">Yeni kaynak eklemek için "YENİ EKLE" butonunu kullanın.</p>
          </div>
        `;
        return;
      }

      listContainer.innerHTML = this.externalResources.map(item => `
        <div class="loot-region-card">
          <div class="region-card-header">
            <h3 class="region-card-title">${item.title}</h3>
            <span class="region-card-badge">${item.category}</span>
          </div>
          <div class="region-card-info">
            ${item.description ? `
            <div class="region-card-description">
              ${item.description}
            </div>
            ` : ''}
          </div>
        </div>
      `).join('');
    },
    
    openExternalResourcesAddModal() {
      const modal = document.getElementById("externalResourcesAddModal");
      if (modal) {
        // Mevcut açık modal'ı kontrol et
        const existingModal = document.querySelector('.modal-overlay.active');
        if (existingModal && existingModal.id !== 'externalResourcesAddModal') {
          modal.classList.add('modal-nested');
        }
        modal.classList.add("active");
        const form = document.getElementById("externalResourcesAddForm");
        if (form) form.reset();
        this.setupExternalResourcesAddModalHandlers();
      }
    },
    
    openRegionDetailModal(region) {
      const modal = document.getElementById("regionDetailModal");
      if (!modal || !region) return;
      
      // Mevcut açık modal'ı kontrol et
      const existingModal = document.querySelector('.modal-overlay.active');
      if (existingModal && existingModal.id !== 'regionDetailModal') {
        modal.classList.add('modal-nested');
      }
      
      modal.classList.add("active");
      
      // Detay içeriğini doldur
      const titleEl = document.getElementById("regionDetailTitle");
      const contentEl = document.getElementById("regionDetailContent");
      
      if (titleEl) titleEl.textContent = region.name.toUpperCase();
      
      if (contentEl) {
        contentEl.innerHTML = `
          <div class="region-detail-section">
            <div class="detail-row">
              <span class="detail-label">Kategori:</span>
              <span class="detail-value">${region.category}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Harita:</span>
              <span class="detail-value">${region.map}</span>
            </div>
            ${region.description ? `
            <div class="detail-row detail-description">
              <span class="detail-label">Açıklama:</span>
              <p class="detail-value">${region.description}</p>
            </div>
            ` : ''}
            ${region.image ? `
            <div class="detail-row detail-image">
              <span class="detail-label">Görsel:</span>
              <div class="detail-image-container">
                <p class="detail-value">${region.image}</p>
              </div>
            </div>
            ` : ''}
            <div class="detail-row">
              <span class="detail-label">Oluşturulma:</span>
              <span class="detail-value">${new Date(region.createdAt).toLocaleDateString('tr-TR')}</span>
            </div>
          </div>
        `;
      }
      
      this.setupRegionDetailModalHandlers();
    },
    
    closeRegionDetailModal() {
      const modal = document.getElementById("regionDetailModal");
      if (modal) {
        modal.classList.remove("active");
        modal.classList.remove("modal-nested");
      }
    },
    
    setupRegionDetailModalHandlers() {
      const modal = document.getElementById("regionDetailModal");
      if (!modal) return;

      // Event listener'ları sadece bir kez ekle
      const closeBtn = modal.querySelector("#regionDetailModalCloseBtn");
      if (closeBtn && !closeBtn.hasAttribute('data-listener-added')) {
        closeBtn.setAttribute('data-listener-added', 'true');
        closeBtn.addEventListener("click", () => this.closeRegionDetailModal());
      }

      if (!modal.hasAttribute('data-listener-added')) {
        modal.setAttribute('data-listener-added', 'true');
        modal.addEventListener("click", (e) => {
          if (e.target === modal) {
            this.closeRegionDetailModal();
          }
        });
      }
    },
    
    closeExternalResourcesAddModal() {
      const modal = document.getElementById("externalResourcesAddModal");
      if (modal) {
        modal.classList.remove("active");
        modal.classList.remove("modal-nested");
      }
    },
    
    setupExternalResourcesAddModalHandlers() {
      const modal = document.getElementById("externalResourcesAddModal");
      if (!modal) return;

      const closeBtn = modal.querySelector("#externalResourcesAddModalCloseBtn");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => this.closeExternalResourcesAddModal());
      }

      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.closeExternalResourcesAddModal();
        }
      });

      const form = document.getElementById("externalResourcesAddForm");
      if (form) {
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          const formData = new FormData(form);
          const data = Object.fromEntries(formData.entries());
          
          const item = {
            id: Date.now(),
            title: data.externalResourceTitle,
            category: data.externalResourceCategory,
            description: data.externalResourceDescription || "",
            createdAt: new Date().toISOString()
          };
          
          this.externalResources.push(item);
          this.saveExternalResourcesToStorage();
          this.closeExternalResourcesAddModal();
          this.renderExternalResources();
        });
      }

      const cancelButton = modal.querySelector("#externalResourcesAddCancelBtn");
      if (cancelButton) {
        cancelButton.addEventListener("click", () => this.closeExternalResourcesAddModal());
      }
    },
    
    saveTierListToStorage() {
      try {
        localStorage.setItem("archub_tierlist", JSON.stringify(this.tierListItems));
      } catch (e) {
        console.warn("LocalStorage'a kayıt yapılamadı:", e);
      }
    },
    
    loadTierListFromStorage() {
      try {
        const stored = localStorage.getItem("archub_tierlist");
        if (stored) {
          this.tierListItems = JSON.parse(stored);
        }
      } catch (e) {
        console.warn("LocalStorage'dan yükleme yapılamadı:", e);
      }
    },
    
    saveExternalResourcesToStorage() {
      try {
        localStorage.setItem("archub_external_resources", JSON.stringify(this.externalResources));
      } catch (e) {
        console.warn("LocalStorage'a kayıt yapılamadı:", e);
      }
    },
    
    loadExternalResourcesFromStorage() {
      try {
        const stored = localStorage.getItem("archub_external_resources");
        if (stored) {
          this.externalResources = JSON.parse(stored);
        }
      } catch (e) {
        console.warn("LocalStorage'dan yükleme yapılamadı:", e);
      }
    },
    
    saveRegionsToStorage() {
      try {
        localStorage.setItem("archub_regions", JSON.stringify(this.regions));
      } catch (e) {
        console.warn("LocalStorage'a kayıt yapılamadı:", e);
      }
    },
    
    loadRegionsFromStorage() {
      try {
        const stored = localStorage.getItem("archub_regions");
        if (stored) {
          this.regions = JSON.parse(stored);
          console.log("Kaydedilmiş bölgeler yüklendi:", this.regions.length);
        }
      } catch (e) {
        console.warn("LocalStorage'dan yükleme yapılamadı:", e);
      }
    },

    setupKeyboardControls() {
      // CTRL + H ve H tuşu kombinasyonlarını engelle
      document.addEventListener("keydown", (e) => {
        if (e.key.toLowerCase() === "h" || (e.ctrlKey && e.key.toLowerCase() === "h")) {
          e.preventDefault();
          e.stopPropagation();
          // Pane açılmasını engelle
        }
      }, true);
    },

    togglePane() {
      if (!this.paneInitialized) this.setupPane();
      if (this.pane) {
        this.paneVisible = !this.paneVisible;
        this.pane.hidden = !this.paneVisible;
      }
    },

    setupPane() {
      if (this.paneInitialized) return;

      const p = (this.pane = new Pane({
        title: "Glass Refraction Controls",
        expanded: true
      }));

      p.addBinding(this.PARAMS.distortion, "preset", {
        label: "Presets",
        options: {
          Minimal: "Minimal",
          Subtle: "Subtle",
          "Classic Glass": "Classic Glass",
          Dramatic: "Dramatic",
          "Chromatic Focus": "Chromatic Focus",
          "Liquid Wave": "Liquid Wave",
          Gigantic: "Gigantic"
        }
      }).on("change", (ev) => this.loadPreset(ev.value));

      p.addButton({ title: "Reload Preset" }).on("click", () =>
        this.loadPreset(this.PARAMS.distortion.preset)
      );

      const addBinding = (prop, opts) =>
        p.addBinding(this.PARAMS.distortion, prop, opts).on("change", (ev) => {
          const uniformName =
            "u" + prop.charAt(0).toUpperCase() + prop.slice(1);
          if (this.customPass?.uniforms[uniformName])
            this.customPass.uniforms[uniformName].value = ev.value;
        });

      addBinding("overallIntensity", {
        min: 0,
        max: 2,
        step: 0.01,
        label: "Overall Intensity"
      });
      p.addBinding(this.PARAMS.distortion, "followMouse", {
        label: "Follow Mouse"
      }).on("change", (ev) => {
        if (!ev.value) this.staticMousePosition = { x: 0.5, y: 0.5 };
      });
      addBinding("animationSpeed", {
        min: 0,
        max: 3,
        step: 0.1,
        label: "Animation Speed"
      });

      const f1 = p.addFolder({ title: "Size Controls" });
      f1.addBinding(this.PARAMS.distortion, "size", {
        min: 0.2,
        max: 3,
        step: 0.1,
        label: "Effect Size"
      }).on(
        "change",
        (ev) => (this.customPass.uniforms.uSize.value = ev.value)
      );
      f1.addBinding(this.PARAMS.distortion, "radius", {
        min: 0.05,
        max: 0.8,
        step: 0.01,
        label: "Base Radius"
      }).on(
        "change",
        (ev) => (this.customPass.uniforms.uRadius.value = ev.value)
      );

      const f2 = p.addFolder({ title: "Refraction Properties" });
      f2.addBinding(this.PARAMS.distortion, "strength", {
        min: 0,
        max: 0.5,
        step: 0.01,
        label: "Refraction Strength"
      }).on(
        "change",
        (ev) => (this.customPass.uniforms.uStrength.value = ev.value)
      );
      f2.addBinding(this.PARAMS.distortion, "clearCenterSize", {
        min: 0,
        max: 1,
        step: 0.01,
        label: "Clear Center"
      }).on(
        "change",
        (ev) => (this.customPass.uniforms.uClearCenterSize.value = ev.value)
      );

      const f3 = p.addFolder({ title: "Visual Effects" });
      f3.addBinding(this.PARAMS.distortion, "chromaticAberration", {
        min: 0,
        max: 0.15,
        step: 0.001,
        label: "Chromatic Aberration"
      }).on(
        "change",
        (ev) => (this.customPass.uniforms.uChromaticAberration.value = ev.value)
      );
      f3.addBinding(this.PARAMS.distortion, "reflectionIntensity", {
        min: 0,
        max: 1,
        step: 0.01,
        label: "Reflections"
      }).on(
        "change",
        (ev) => (this.customPass.uniforms.uReflectionIntensity.value = ev.value)
      );
      f3.addBinding(this.PARAMS.distortion, "lensBlur", {
        min: 0,
        max: 0.5,
        step: 0.01,
        label: "Lens Blur"
      }).on(
        "change",
        (ev) => (this.customPass.uniforms.uLensBlur.value = ev.value)
      );

      const f4 = p.addFolder({ title: "Wave Animation" });
      f4.addBinding(this.PARAMS.distortion, "waveDistortion", {
        min: 0,
        max: 0.3,
        step: 0.01,
        label: "Wave Strength"
      }).on(
        "change",
        (ev) => (this.customPass.uniforms.uWaveDistortion.value = ev.value)
      );
      f4.addBinding(this.PARAMS.distortion, "waveSpeed", {
        min: 0,
        max: 5,
        step: 0.1,
        label: "Wave Speed"
      }).on(
        "change",
        (ev) => (this.customPass.uniforms.uWaveSpeed.value = ev.value)
      );

      const f5 = p.addFolder({ title: "Edge Effects" });
      f5.addBinding(this.PARAMS.distortion, "edgeWidth", {
        min: 0,
        max: 0.2,
        step: 0.01,
        label: "Edge Width"
      }).on(
        "change",
        (ev) => (this.customPass.uniforms.uEdgeWidth.value = ev.value)
      );
      f5.addBinding(this.PARAMS.distortion, "edgeOpacity", {
        min: 0,
        max: 1,
        step: 0.01,
        label: "Edge Opacity"
      }).on(
        "change",
        (ev) => (this.customPass.uniforms.uEdgeOpacity.value = ev.value)
      );

      const f6 = p.addFolder({ title: "Rim Lighting" });
      f6.addBinding(this.PARAMS.distortion, "rimLightIntensity", {
        min: 0,
        max: 1,
        step: 0.01,
        label: "Rim Light Intensity"
      }).on(
        "change",
        (ev) => (this.customPass.uniforms.uRimLightIntensity.value = ev.value)
      );
      f6.addBinding(this.PARAMS.distortion, "rimLightWidth", {
        min: 0,
        max: 0.3,
        step: 0.01,
        label: "Rim Light Width"
      }).on(
        "change",
        (ev) => (this.customPass.uniforms.uRimLightWidth.value = ev.value)
      );

      Object.assign(p.element.style, {
        position: "fixed",
        top: "10px",
        right: "10px",
        zIndex: "3000"
      });
      p.hidden = true;
      this.paneVisible = false;
      this.paneInitialized = true;
      this.loadPreset("Classic Glass");
    },

    loadPreset(name) {
      const preset = this.PARAMS.presets[name];
      if (!preset) return;

      Object.entries(preset).forEach(([k, v]) => {
        if (k in this.PARAMS.distortion) {
          this.PARAMS.distortion[k] = v;
          const uniformName = "u" + k.charAt(0).toUpperCase() + k.slice(1);
          if (this.customPass?.uniforms[uniformName])
            this.customPass.uniforms[uniformName].value = v;
        }
      });

      this.PARAMS.distortion.preset = name;
      this.pane?.refresh();
    },

    onWindowResize() {
      this.aspect = window.innerWidth / window.innerHeight;

      if (this.camera) {
        this.camera.left = this.camera.right = this.backgroundCamera.left = this.backgroundCamera.right = null;
        [this.camera, this.backgroundCamera].forEach((cam) => {
          cam.left = -this.aspect;
          cam.right = this.aspect;
          cam.updateProjectionMatrix();
        });
      }

      this.renderer?.setSize(window.innerWidth, window.innerHeight);
      this.composer?.setSize(window.innerWidth, window.innerHeight);

      if (this.customPass) this.customPass.uniforms.uAspect.value = this.aspect;
      if (this.backgroundTexture) this.createBackgroundMesh();
    },

    animate(time = 0) {
      requestAnimationFrame((t) => this.animate(t));
      if (!this.webglSupported || !this.renderer) return;

      this.performanceMonitor.frameCount++;
      if (time - this.performanceMonitor.lastTime >= 1000) {
        this.performanceMonitor.fps = this.performanceMonitor.frameCount;
        this.performanceMonitor.frameCount = 0;
        this.performanceMonitor.lastTime = time;

        const fpsElement = document.getElementById("fpsCounter");
        if (fpsElement)
          fpsElement.textContent = String(this.performanceMonitor.fps);
      }

      const tgt = this.PARAMS.distortion.followMouse
        ? this.targetMousePosition
        : this.staticMousePosition;
      this.mousePosition.x += (tgt.x - this.mousePosition.x) * 0.1;
      this.mousePosition.y += (tgt.y - this.mousePosition.y) * 0.1;

      if (this.customPass) {
        this.customPass.uniforms.uMouse.value.set(
          this.mousePosition.x,
          this.mousePosition.y
        );
        this.customPass.uniforms.uTime.value =
          time * 0.001 * this.PARAMS.distortion.animationSpeed;
      }

      this.composer
        ? this.composer.render()
        : (this.renderer.clear(),
          this.renderer.render(this.backgroundScene, this.backgroundCamera));
    }
  };

  window.addEventListener("error", (e) => {
    let m = "An error occurred";
    if (e.error?.message) m += ": " + e.error.message;
    if (e.filename) m += " in " + e.filename;
    App.showError(m + ". Some features may not work properly.");
  });

  window.addEventListener("unhandledrejection", (e) => {
    App.showError(
      "Loading failed: " + (e.reason || "Unknown error") + ". Retrying..."
    );
  });

  // App'i window'a ekle
  window.App = App;

  // Başlatma fonksiyonu
  const initializeApp = () => {
    try {
      console.log("Initializing App...");
      App.init();
      console.log("App initialized successfully");
    } catch (error) {
      console.error("Failed to initialize App:", error);
      App.showError("Failed to initialize: " + error.message);
    }
  };

  // DOM hazır olduğunda başlat
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApp);
  } else {
    // DOM zaten hazırsa hemen başlat
    initializeApp();
  }
})();

