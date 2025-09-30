import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "../../../components/UI/Button/Button";
import addFileImg from "../../../assets/images/add_file.png";
import scanningFileImg from "../../../assets/images/scanning_file.png";
import * as THREE from "three";
import Navigation from "../../../components/Layout/Navigation";
import { useDetectWatermark } from "../hooks/useDetectWatermark";
import Lottie from "react-lottie-player";
import detectAnimation from "../../../assets/animation/detect.json";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import austronaut from "../../../assets/images/astronaut_watermark.png";
import Stars from "../../Home/components/Stars";
import Planet from "../components/Planet";

const WatermarkDetectionPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoadingOverlayVisible, setLoadingOverlayVisible] = useState(false);

  const { mutate: detect, data, isPending, error } = useDetectWatermark();

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
    } catch {
      return;
    }
  }, []);

  const dropZoneProps = useMemo(
    () => ({
      onDragOver: (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
      },
      onDrop: (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        onFilesDropped(e.dataTransfer.files);
      },
    }),
    [onFilesDropped]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFilesDropped(e.target.files);
    },
    [onFilesDropped]
  );

  type DetectState = "idle" | "loading" | "success" | "failure";
  const [state, setState] = useState<DetectState>("idle");
  const [toast, setToast] = useState<{ visible: boolean; text: string }>({
    visible: false,
    text: "",
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const showToast = useCallback((text: string) => {
    setToast({ visible: true, text });
    window.setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2000);
  }, []);

  const handleDetect = useCallback(() => {
    if (!file) {
      showToast("파일을 선택해 주세요.");
      return;
    }

    setState("loading");
    setLoadingOverlayVisible(true);

    const delay = new Promise((resolve) => setTimeout(resolve, 7000));

    detect(
      {
        image: file,
      },
      {
        onSuccess: async (res) => {
          await delay;
          const ok = res?.data?.isDetected === true;
          setState(ok ? "success" : "failure");
          setLoadingOverlayVisible(false);
        },
        onError: async () => {
          await delay;
          setState("failure");
          setLoadingOverlayVisible(false);
        },
      }
    );
  }, [file, showToast, detect]);

  return (
    <div className="h-screen bg-background relative overflow-hidden">
      <Navigation />

      {/* 별 배경 - 전체 화면에 꽉 차도록 */}
      <div className="fixed top-0 left-0 w-full h-full -z-10">
        <Canvas>
          <Stars size={1} />
        </Canvas>
      </div>

      <main className="relative z-10 w-full h-full">
        <div className="w-full h-screen flex flex-col lg:flex-row">
          {/* 좌측 카피 영역 - 모든 패딩 제거 */}
          <div className="flex-1 lg:w-1/2 flex flex-col justify-center">
            <div className="absolute top-20 left-6 lg:left-12 z-20 max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={scanningFileImg}
                  alt="scanning"
                  className={`w-9 h-9 transition-opacity duration-300 ${
                    state === "loading" ? "opacity-0" : "opacity-50"
                  }`}
                />
                <span className="font-jamsil text-primary text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight whitespace-nowrap">
                  디지털 워터마크
                </span>
                <span className="font-jamsil text-text-color text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight whitespace-nowrap">
                  확인하기
                </span>
              </div>
              <p className="text-gray-300 leading-relaxed mb-3">
                AdPlanet은 비가시성 디지털 워터마크로 소유자의 권리를 안전하게
                지켜드립니다.
              </p>
              <p className="text-gray-300 leading-relaxed">
                본 검증을 통해 해당 콘텐츠의 소유권을 확인하세요.
              </p>
            </div>

            {/* Planet 영역 - 전체 공간 사용 */}
            <div className="absolute inset-0 w-full h-full">
              <Planet />
            </div>
          </div>

          {/* 우측 드롭존 - 패딩 최소화 */}
          <div className="w-full lg:w-[550px] xl:w-[650px] 2xl:w-[700px] flex items-center justify-center lg:justify-start pr-6 lg:pr-4 xl:pr-6">
            <div
              {...dropZoneProps}
              className="relative rounded-3xl border-2 border-dotted border-primary 
        p-8 lg:p-10 xl:p-12 w-full max-w-[500px] lg:max-w-[500px] xl:max-w-[600px] 2xl:max-w-[650px] 
        h-[520px] lg:h-[580px] xl:h-[620px] 2xl:h-[660px] flex flex-col items-center 
        justify-center text-center bg-transparent cursor-pointer lg:-ml-8 xl:-ml-12"
              onClick={() => document.getElementById("wm-image-input")?.click()}
            >
              {previewUrl ? (
                <>
                  <div className="w-full h-[340px] lg:h-[380px] xl:h-[420px] 2xl:h-[460px] flex items-center justify-center overflow-hidden rounded-lg bg-white/5 border border-white/10 mb-3">
                    <img
                      src={previewUrl}
                      alt="preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <p className="text-gray-300 text-sm mb-4">
                    첨부된 이미지를 확인하세요. 클릭하면 다른 파일로 교체할 수
                    있어요.
                  </p>
                </>
              ) : (
                <>
                  <img
                    src={addFileImg}
                    alt="add file"
                    className="w-16 h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 mb-6"
                  />
                  <p className="text-gray-200 mb-10 text-lg whitespace-nowrap">
                    파일을 드래그하여 첨부해 주세요.
                  </p>
                </>
              )}
              <div className="w-full max-w-sm mx-auto">
                <Button
                  text="검증하기"
                  size="md"
                  variant="fill"
                  className="w-full font-jamsil text-lg py-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDetect();
                  }}
                  disabled={state === "loading"}
                />
              </div>
              <input
                id="wm-image-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInput}
              />
              {isLoadingOverlayVisible && (
                <div
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center 
                    bg-gray-800/70 rounded-3xl"
                >
                  <Lottie
                    animationData={detectAnimation}
                    loop
                    play
                    style={{ width: "100%", height: "340px" }}
                  />
                  <p className="text-white font-bold mt-4">검증 중...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 결과 오버레이: 성공 */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center duration-500 ${
          state === "success" ? "opacity-100" : "opacity-0 pointer-events-none"
        } bg-background`}
      >
        <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-8 w-[min(560px,90vw)] text-center">
          <h3 className="text-3xl font-bold text-primary mb-2">
            워터마크 검증 완료
          </h3>
          <p className="text-gray-200 mb-6">
            디지털 워터마크가 정상적으로 검증되었습니다.
          </p>
          <p className="text-gray-200 mb-6 font-bold text-2xl">
            본 콘텐츠는 우리 서비스가 생성한 이미지입니다.
          </p>
          <div className="flex flex-col items-start text-left w-full mt-10 p-3">
            <p className="text-gray-200 mb-4 text-xl font-semibold">
              ☑️ 검출된 내용
            </p>
            <p className="text-gray-200 mb-3 text-xl">
              제작자: {data?.data.creator}
            </p>
            <p className="text-gray-200 mb-6 text-xl">
              내용: {data?.data.content}
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button
              text="닫기"
              size="md"
              variant="fill"
              onClick={() => setState("idle")}
            />
          </div>
        </div>
      </div>

      {/* 결과 오버레이: 실패 */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center duration-500 ${
          state === "failure" ? "opacity-100" : "opacity-0 pointer-events-none"
        } bg-background`}
      >
        <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-8 w-[min(560px,90vw)] text-center">
          <h3 className="text-3xl font-bold text-red-400 mb-2">
            워터마크 검증 실패
          </h3>
          <p className="text-gray-200 mb-6">
            디지털 워터마크가 검증되지 않았습니다. 우리 서비스가 생성한 이미지가
            아닐 수 있습니다.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              text="다시 시도"
              size="md"
              variant="fill"
              onClick={() => setState("idle")}
            />
          </div>
        </div>
      </div>

      {/* 토스트 */}
      <div
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-[60] transition-all duration-300 ${
          toast.visible
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-3 pointer-events-none"
        }`}
      >
        <div className="bg-white/90 text-background font-medium px-4 py-2 rounded-lg shadow-lg border border-white/50">
          {toast.text}
        </div>
      </div>
    </div>
  );
};

export default WatermarkDetectionPage;
