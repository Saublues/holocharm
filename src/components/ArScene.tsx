"use client";

import { useEffect, useRef, useState } from "react";
import { X, RefreshCcw } from "lucide-react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// @ts-expect-error - mind-ar does not ship TypeScript declarations for this build.
import { MindARThree } from "mind-ar/dist/mindar-image-three.prod.js";

interface ArSceneProps {
  onBack: () => void;
  markerUrl: string;
  modelUrl: string;
  audioUrl: string;
}

export default function ArScene({
  onBack,
  markerUrl,
  modelUrl,
  audioUrl,
}: ArSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mindarThree: any = null;
    let audio: HTMLAudioElement | null = null; // Tampung di luar biar bisa dimatiin pas keluar halaman

    const startAR = async () => {
      try {
        // 1. Inisialisasi MindAR Three
        mindarThree = new MindARThree({
          container: containerRef.current!,
          imageTargetSrc: markerUrl,
          uiScanning: "#scanning-overlay",
        });

        const { renderer, scene, camera } = mindarThree;

        // 2. Setup Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);
        const directLight = new THREE.DirectionalLight(0xffffff, 1);
        directLight.position.set(0, 10, 10);
        scene.add(directLight);

        // 3. Tambahkan Anchor
        const anchor = mindarThree.addAnchor(0);

        // 4. Logika Audio (Opsional, nyala kalau audioUrl diisi)
        if (audioUrl) {
          audio = new Audio(audioUrl);
          audio.loop = true;

          anchor.onTargetFound = () => {
            audio
              ?.play()
              .catch((err) => console.warn("Audio diblokir browser:", err));
          };
          anchor.onTargetLost = () => {
            audio?.pause();
          };
        }

        // 5. Load Model 3D & Siapkan Animasi
        const loader = new GLTFLoader();
        let mixer: THREE.AnimationMixer | null = null;
        const clock = new THREE.Clock();

        loader.load(modelUrl, (gltf) => {
          const model = gltf.scene;
          model.scale.set(0.2, 0.2, 0.2);
          model.rotation.set(0, Math.PI, 0);
          anchor.group.add(model);

          // Cek dan mainkan animasi bawaan dari file .glb
          if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);
            const action = mixer.clipAction(gltf.animations[0]);
            action.play();
          }
        });

        // 6. Jalankan Engine MindAR
        await mindarThree.start();
        setLoading(false);

        // 7. Render Loop (termasuk update frame animasi)
        renderer.setAnimationLoop(() => {
          const delta = clock.getDelta();
          if (mixer) mixer.update(delta); // Biar modelnya gerak!
          renderer.render(scene, camera);
        });
      } catch (err) {
        console.error(err);
        setError(
          "Gagal mengakses kamera. Pastikan HTTPS aktif dan izin diberikan.",
        );
        setLoading(false);
      }
    };

    startAR();

    // ==========================================
    // FUNGSI CLEANUP (Saat user keluar halaman)
    // ==========================================
    return () => {
      // 1. Matikan Audio
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }

      // 2. Matikan Kamera (Force Stop biar lampu webcam mati)
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

      // 3. Matikan Engine AR
      if (mindarThree) {
        try {
          mindarThree.stop();
        } catch (e) {
          // Abaikan error diam-diam
        }
        if (mindarThree.renderer) {
          mindarThree.renderer.setAnimationLoop(null);
        }
      }
    };
  }, [markerUrl, modelUrl, audioUrl]); // Pastikan props ini masuk dependency array

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      {/* Container untuk Video Kamera */}
      <div ref={containerRef} className="w-full h-full" />

      {/* CUSTOM UI OVERLAY */}
      <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none">
        {/* Top Header */}
        <div className="flex justify-between items-center pointer-events-auto">
          <button
            onClick={onBack}
            className="p-3 bg-white/20 backdrop-blur-lg rounded-full text-white border border-white/30 hover:bg-white/40 transition"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="px-4 py-2 bg-[#BFD1F9]/80 backdrop-blur-md rounded-full text-black font-semibold text-sm">
            Scanning Mode
          </div>
        </div>

        {/* Middle Scanning Frame (Warna Aksen #BFD1F9) */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-50">
            <RefreshCcw className="w-10 h-10 text-[#BFD1F9] animate-spin mb-4" />
            <p className="text-white font-medium">Initializing Camera...</p>
          </div>
        )}

        {/* Scanning Overlay (Target Marker) */}
        <div id="scanning-overlay" className="hidden">
          <div className="flex flex-col items-center">
            <div className="w-64 h-64 border-2 border-[#BFD1F9] border-dashed rounded-3xl animate-pulse relative">
              <div className="absolute top-[-2px] left-1/2 -translate-x-1/2 bg-[#BFD1F9] text-black text-[10px] px-2 py-0.5 rounded-full font-bold">
                FOCUS TARGET
              </div>
            </div>
            <p className="mt-8 text-[#BFD1F9] text-center font-medium drop-shadow-md">
              Arahkan kamera ke marker untuk memunculkan 3D
            </p>
          </div>
        </div>

        {/* Bottom Error/Status */}
        {error && (
          <div className="pointer-events-auto bg-red-500 text-white p-4 rounded-2xl text-center">
            {error}
          </div>
        )}

        <div className="flex justify-center pb-8">
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white/70 text-xs text-center max-w-[250px]">
            Tip: Pastikan cahaya ruangan cukup untuk hasil tracking maksimal.
          </div>
        </div>
      </div>
    </div>
  );
}
