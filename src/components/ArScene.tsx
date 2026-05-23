import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Box } from "lucide-react"; // Import ikon Box untuk visual focus
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// @ts-ignore
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

// Import MindAR bawaan proyekmu
// @ts-ignore
import { MindARThree } from "mind-ar/dist/mindar-image-three.prod.js";

interface ArSceneProps {
  onBack: () => void;
}

// DAFTAR DATA PRODUK (Urutan HARUS PERSIS sama dengan urutan pas kamu upload gambar di web compiler)
const arItems = [
  { index: 0, model: "/models/lngshot.glb", audio: "/audio/lngshot.mp3" },
  { index: 1, model: "/models/hindia.glb", audio: "/audio/hindia.mp3" },
  { index: 2, model: "/models/biguy.glb", audio: "/audio/biguy.mp3" },
  { index: 3, model: "/models/blackbink.glb", audio: "/audio/blackpink.mp3" },
  { index: 4, model: "/models/taylorswift.glb", audio: "/audio/auladik.mp3" },
  { index: 5, model: "/models/love.glb", audio: "/audio/love.mp3" },
  { index: 6, model: "/models/cascade.glb", audio: "/audio/nmixx.mp3" },
];

export default function ArScene({ onBack }: ArSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mindarThree: any = null;
    const activeAudios: { [key: number]: HTMLAudioElement } = {};
    const mixers: THREE.AnimationMixer[] = [];
    const clock = new THREE.Clock();

    const startAR = async () => {
      try {
        // 1. Inisialisasi MindAR dengan 1 file .mind GABUNGAN
        mindarThree = new MindARThree({
          container: containerRef.current!,
          imageTargetSrc: "/markers/targets.mind", // File gabungan marker master
          // Kita panggil ID elemen overlay bidding yang ada di return JSX
          uiScanning: "#scanning-overlay",
        });

        const { renderer, scene, camera } = mindarThree;

        // 2. Setup Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);
        const directLight = new THREE.DirectionalLight(0xffffff, 1);
        directLight.position.set(0, 10, 10);
        scene.add(directLight);

        // 3. Setup Loader + DRACO Compression Decoder
        const loader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath(
          "https://www.gstatic.com/draco/versioned/decoders/1.5.6/",
        );
        loader.setDRACOLoader(dracoLoader);

        // 4. LOOPING UNTUK DAFTARKAN SEMUA PRODUK SEKALIGUS
        arItems.forEach((item) => {
          const anchor = mindarThree.addAnchor(item.index);

          // Setup Audio
          const audio = new Audio(item.audio);
          audio.loop = true;
          activeAudios[item.index] = audio;

          // Kontrol On/Off Audio berdasarkan deteksi kamera
          anchor.onTargetFound = () => {
            audio
              .play()
              .catch((err) => console.warn("Audio diblokir browser:", err));
          };
          anchor.onTargetLost = () => {
            audio.pause();
          };

          // Load model 3D
          loader.load(item.model, (gltf) => {
            const model = gltf.scene;
            model.scale.set(0.2, 0.2, 0.2); // Sesuaikan skala jika perlu
            model.rotation.set(0, Math.PI, 0);
            anchor.group.add(model);

            // Setup Animasi jika ada
            if (gltf.animations && gltf.animations.length > 0) {
              const mixer = new THREE.AnimationMixer(model);
              const action = mixer.clipAction(gltf.animations[0]);
              action.play();
              mixers.push(mixer);
            }
          });
        });

        // 5. Jalankan Engine Kamera
        await mindarThree.start();
        setLoading(false);

        // 6. Render Loop (Mengupdate seluruh animasi yang aktif)
        renderer.setAnimationLoop(() => {
          const delta = clock.getDelta();
          mixers.forEach((mixer) => mixer.update(delta));
          renderer.render(scene, camera);
        });
      } catch (err) {
        console.error(err);
        setError("Gagal membuka kamera. Pastikan izin kamera diberikan.");
        setLoading(false);
      }
    };

    startAR();

    // ==========================================
    // CLEANUP SYSTEM (Mematikan semua aset saat keluar)
    // ==========================================
    return () => {
      // Matikan semua audio
      Object.values(activeAudios).forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });

      // Matikan hardware kamera laptop/HP
      let stream: MediaStream | null = null;
      if (mindarThree?.video?.srcObject) {
        stream = mindarThree.video.srcObject as MediaStream;
      } else {
        const videoEl = document.querySelector("video");
        if (videoEl?.srcObject) stream = videoEl.srcObject as MediaStream;
      }
      if (stream?.getTracks) {
        stream.getTracks().forEach((track) => track.stop());
      }

      // Matikan Engine MindAR
      if (mindarThree) {
        try {
          mindarThree.stop();
        } catch (e) {}
        if (mindarThree.renderer) {
          mindarThree.renderer.setAnimationLoop(null);
        }
      }
    };
  }, []);

  return (
    // PERBAIKAN CSS: Background transparan agar kamera MindAR (z-index: -2) bisa terlihat
    <div
      ref={containerRef}
      className="w-full h-screen relative bg-transparent overflow-hidden"
    >
      {/* Tombol Melayang untuk Kembali ke Landing Page */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 z-50 flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-md rounded-full text-white border border-white/30 hover:bg-white/40 transition-colors shadow-lg"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>
      {/* Layar Loading Awal */}
      {loading && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#111111] text-white">
          <div className="w-10 h-10 border-4 border-[#BFD1F9] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[#BFD1F9] font-medium animate-pulse">
            Membuka Kamera AR...
          </p>
        </div>
      )}
      {/* Layar Error */}
      {error && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#111111] text-red-400 p-4 text-center">
          <p>{error}</p>
        </div>
      )}
      <div
        id="scanning-overlay"
        className="hidden absolute inset-0 z-30 flex flex-col items-center justify-center bg-transparent pointer-events-none p-8 text-center overflow-hidden"
      >
        {/* Kotak Bidik Putus-putus */}
        <div className="w-64 h-64 md:w-80 md:h-80 border-4 border-dashed border-[#BFD1F9] rounded-3xl relative flex items-center justify-center">
          {/* Aksen Sudut (Mewah) */}
          <div className="absolute top-[-4px] left-[-4px] w-10 h-10 border-t-8 border-l-8 border-white rounded-tl-[30px]"></div>
          <div className="absolute top-[-4px] right-[-4px] w-10 h-10 border-t-8 border-r-8 border-white rounded-tr-[30px]"></div>
          <div className="absolute bottom-[-4px] left-[-4px] w-10 h-10 border-b-8 border-l-8 border-white rounded-bl-[30px]"></div>
          <div className="absolute bottom-[-4px] right-[-4px] w-10 h-10 border-b-8 border-r-8 border-white rounded-br-[30px]"></div>

          {/* Ikon Box dan Teks Pusat */}
          <div className="flex flex-col items-center animate-pulse">
            <Box className="w-20 h-20 text-white drop-shadow-xl mb-6" />
            <p className="text-white font-bold text-xl md:text-2xl tracking-tight">
              Target Focused
            </p>
          </div>
        </div>

        {/* Status Disclaimer & Tips Melayang di Bawah (Glassmorphism) */}
        <div className="absolute bottom-12 w-[85%] max-w-sm left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl px-6 py-4 rounded-2xl shadow-2xl border border-white/20 flex flex-col gap-2">
          <p className="text-sm text-white/90 font-medium leading-relaxed">
            <strong className="text-white">Tips:</strong> Arahkan kamera pas ke
            gambar. Pastikan pencahayaan terang dan gambar tidak terpotong
            layar.
          </p>
        </div>
      </div>
    </div>
  );
}
