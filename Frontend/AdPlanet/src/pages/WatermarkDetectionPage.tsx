import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Navigation from '../components/Navigation';
import { Button } from '../components/Button';
import addFileImg from '../assets/add_file.png';
import scanningFileImg from '../assets/scanning_file.png';
import planetImg from '../assets/puple_planet.png';
import * as THREE from 'three';
import { detectWatermark } from '../services/watermarkService';

const WatermarkDetectionPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  // 최소 UI만 유지 (옵션 제거)

  const onFilesDropped = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    try {
      const url = URL.createObjectURL(selected);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    } catch {}
  }, []);

  const dropZoneProps = useMemo(() => ({
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
    },
    onDrop: (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      onFilesDropped(e.dataTransfer.files);
    },
  }), [onFilesDropped]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onFilesDropped(e.target.files);
  }, [onFilesDropped]);

  
  

  type DetectState = 'idle' | 'loading' | 'success' | 'failure';
  const [state, setState] = useState<DetectState>('idle');
  const [toast, setToast] = useState<{visible: boolean; text: string}>({visible: false, text: ''});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const showToast = useCallback((text: string) => {
    setToast({ visible: true, text });
    window.setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2000);
  }, []);

  const handleDetect = useCallback(async () => {
    if (!file) {
      showToast('파일을 선택해 주세요.');
      return;
    }
    
    setState('loading');
    
    try {
      // API 호출과 5초 딜레이를 병렬로 처리
      const [res] = await Promise.all([
        detectWatermark(file),
        new Promise(resolve => setTimeout(resolve, 5000)) // 5초 강제 딜레이
      ]);
      
      const ok = res?.data?.verified === true;
      setState(ok ? 'success' : 'failure');
    } catch (e) {
      // 에러가 발생해도 5초는 기다림
      await new Promise(resolve => setTimeout(resolve, 5000));
      setState('failure');
    }
  }, [file, showToast]);

  // three.js 배경: 메인 행성 + 위성 공전
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 조명
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const keyLight = new THREE.PointLight(0x87deda, 2, 100);
    keyLight.position.set(5, 5, 6);
    scene.add(keyLight);

    // 중심(0,0,0)을 기준으로 공전할 피벗들
    const pivot1 = new THREE.Object3D();
    const pivot2 = new THREE.Object3D();
    const pivot3 = new THREE.Object3D();
    scene.add(pivot1);
    scene.add(pivot2);
    scene.add(pivot3);

    // 서로 다른 반경/크기/기울기
    const moon1 = new THREE.Mesh(new THREE.SphereGeometry(0.45, 24, 24), new THREE.MeshStandardMaterial({ color: 0x87deda, emissive: 0x87deda, emissiveIntensity: 0.6 }));
    moon1.position.x = 3.8;
    pivot1.add(moon1);

    const moon2 = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 24), new THREE.MeshStandardMaterial({ color: 0xb388ff, emissive: 0xb388ff, emissiveIntensity: 0.5 }));
    moon2.position.x = -5.2;
    pivot2.rotation.x = Math.PI / 6;
    pivot2.add(moon2);

    const moon3 = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 24), new THREE.MeshStandardMaterial({ color: 0xffd166, emissive: 0xffd166, emissiveIntensity: 0.4 }));
    moon3.position.x = 6.4;
    pivot3.rotation.x = -Math.PI / 8;
    pivot3.add(moon3);

    camera.position.z = 8;

    let rafId = 0;
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      // 로딩 시 공전, 평상시 정지
      const speed = state === 'loading' ? 1 : 0;
      pivot1.rotation.y += 0.04 * speed;
      pivot2.rotation.y += 0.03 * speed;
      pivot3.rotation.y += 0.05 * speed;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, [state]);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navigation />
      {/* 토스트 */}
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[60] transition-all duration-300 ${toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'}`}>
        <div className="bg-white/90 text-background font-medium px-4 py-2 rounded-lg shadow-lg border border-white/50">
          {toast.text}
        </div>
      </div>
      {/* three.js 배경 캔버스 (위성) - 항상 배경(z-0), 필요 시 투명도만 조절 */}
      <canvas ref={canvasRef} className={`fixed inset-0 z-0 pointer-events-none transition-opacity duration-500 ${state === 'loading' ? 'opacity-100' : 'opacity-0'}`} />

      {/* 떠오르는 행성 이미지: 기본 좌하단, 로딩 시 중앙으로 */}
      <img
        src={planetImg}
        alt="planet"
         className={`fixed select-none transition-all duration-700 ease-out
           ${state === 'loading'
             ? 'left-1/2 bottom-1/2 -translate-x-1/2 translate-y-1/2 w-[420px] z-30 opacity-100 animate-planet-breath'
             : 'left-[-12%] bottom-[-28%] w-[720px] z-30 opacity-60'}`}
      />

      {/* 로딩 메시지 오버레이 */}
      <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center text-center transition-opacity duration-500 ${state === 'loading' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <h3 className={`text-3xl sm:text-4xl font-bold text-white mb-3 ${state === 'loading' ? 'animate-breath' : ''}`} style={{willChange: 'transform'}}>
          콘텐츠를 분석하고 있습니다...
        </h3>
        <p className={`text-lg sm:text-xl text-gray-200 ${state === 'loading' ? 'animate-breath' : ''}`} style={{animationDelay: '0.2s', willChange: 'transform'}}>
          잠시만 기다려주세요. 행성의 기운을 모아 소유권을 확인 중입니다.
        </p>
      </div>

      {/* 결과 오버레이: 성공 */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${state === 'success' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-8 w-[min(560px,90vw)] text-center">
          <h3 className="text-3xl font-bold text-primary mb-2">워터마크 검증 완료</h3>
          <p className="text-gray-200 mb-6">디지털 워터마크가 정상적으로 검증되었습니다. 본 콘텐츠는 우리 서비스가 생성한 이미지입니다.</p>
          <div className="flex gap-3 justify-center">
            <Button text="닫기" size="md" variant="fill" onClick={() => setState('idle')} />
          </div>
        </div>
      </div>

      {/* 결과 오버레이: 실패 */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${state === 'failure' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-8 w-[min(560px,90vw)] text-center">
          <h3 className="text-3xl font-bold text-red-400 mb-2">워터마크 검증 실패</h3>
          <p className="text-gray-200 mb-6">디지털 워터마크가 검증되지 않았습니다. 우리 서비스가 생성한 이미지가 아닐 수 있습니다.</p>
          <div className="flex gap-3 justify-center">
            <Button text="다시 시도" size="md" variant="fill" onClick={() => setState('idle')} />
          </div>
        </div>
      </div>

      <main className="px-4 lg:px-12 transition-opacity duration-500" style={{opacity: state === 'loading' ? 0 : 1}}>
        <section className="antialiased max-w-[1200px] mx-auto grid grid-cols-1 lg:[grid-template-columns:1fr_520px] gap-10 py-12">
          {/* 좌측 카피 영역 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={scanningFileImg} alt="scanning" className={`w-9 h-9 transition-opacity duration-300 ${state === 'loading' ? 'opacity-0' : 'opacity-50'}`} />
              <span className="font-jamsil text-primary text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight whitespace-nowrap">디지털 워터마크</span>
              <span className="font-jamsil text-text-color text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight whitespace-nowrap">확인하기</span>
            </div>
            <p className="text-gray-300 leading-relaxed mb-3">
              AdPlanet은 스테가노그래피(Steganography) 기반 디지털 워터마크로
              소유자의 권리를 안전하게 지켜드립니다.
            </p>
            <p className="text-gray-300 leading-relaxed">
              본 검증을 통해 해당 콘텐츠의 소유권을 확인하세요.
            </p>
          </div>

          {/* 우측 드롭존 */}
          <div
            {...dropZoneProps}
            className="relative justify-self-end rounded-3xl border-2 border-dotted border-primary p-8 lg:p-10 w-full lg:w-[520px] h-[300px] flex flex-col items-center justify-center text-center bg-transparent"
            onClick={() => document.getElementById('wm-image-input')?.click()}
          >
            {previewUrl ? (
              <>
                <div className="w-full h-[200px] flex items-center justify-center overflow-hidden rounded-lg bg-white/5 border border-white/10 mb-4">
                  <img src={previewUrl} alt="preview" className="max-h-full max-w-full object-contain" />
                </div>
                <p className="text-gray-300 text-sm mb-4">첨부된 이미지를 확인하세요. 클릭하면 다른 파일로 교체할 수 있어요.</p>
              </>
            ) : (
              <>
                <img src={addFileImg} alt="add file" className="w-16 h-16 mb-6" />
                <p className="text-gray-200 mb-8 whitespace-nowrap">파일을 드래그하여 첨부해 주세요.</p>
              </>
            )}
            <div className="w-full max-w-xs mx-auto">
              <Button
                text="검증하기"
                size="md"
                variant="fill"
                className="w-full font-jamsil"
                onClick={(e) => { e.stopPropagation(); handleDetect(); }}
                disabled={state === 'loading'}
              />
            </div>
            <input id="wm-image-input" type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
          </div>
        </section>
      </main>
    </div>
  );
};

export default WatermarkDetectionPage;
