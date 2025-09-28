// src/modules/Mypage/pages/ArchivePage.tsx
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Navigation from "../../../components/Layout/Navigation";
import ArchiveToolbar from "../components/ArchiveToolbar";
import LogoCardList, { type LogoCardListHandle } from "../components/LogoCardList";
import PosterCardList from "../components/PosterCardList";
import LogoTagBar from "../components/LogoTagBar";
import type { LogoTagItem } from "../components/LogoTagBar";
import { toggleId, type ArchiveKind } from "../../../utils/archiveRouteParser";
import LogoTagGrid from "../components/LogoTagGrid";
import { getAllLogoTags } from "../../../services/logoService";
import PosterTagBar from "../components/PosterTagBar";
import type { PosterTagItem } from "../components/PosterTagBar";
import PosterTagGrid from "../components/PosterTagGrid";
import { getAllPosterTags } from "../../../services/posterService";
import Stars from "../../Home/components/Stars";
import { Canvas } from '@react-three/fiber';


const ArchivePage: React.FC = () => {
  const { kind: kindParam } = useParams();
  const [sp, setSp] = useSearchParams();

  // LogoCardList ref
  const logoCardListRef = useRef<LogoCardListHandle>(null);

  // URL 파라미터/쿼리를 단일 소스로 사용
  const kind = (kindParam === "poster" ? "poster" : "logo") as ArchiveKind;
  const selectedTagIds = useMemo(() => {
    const all = sp.getAll("tags");
    return [...new Set(all.map(Number).filter(n => Number.isFinite(n) && n > 0))];
  }, [sp]);
  const tagsMode = (sp.get("mode") === "tags") || selectedTagIds.length > 0;

  // LogoTagBar용 태그 상태
  const [tags, setTags] = useState<LogoTagItem[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [tagsError, setTagsError] = useState<string | null>(null);

  // 실제 태그 로드 (kind 에 따라 분기)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setTagsLoading(true);
        setTagsError(null);

        if (kind === "logo") {
          const res = await getAllLogoTags(); // ApiResponse<LogoTag[]>
          const raw = res?.data ?? [];
          const map = new Map<number, string>();
          for (const t of raw as any[]) {
            const id = t?.tagId ?? t?.id;
            const name = t?.tagName ?? t?.name;
            if (typeof id === "number" && id > 0 && typeof name === "string" && name) {
              if (!map.has(id)) map.set(id, name);
            }
          }
          const list: LogoTagItem[] = Array.from(map, ([id, name]) => ({ id, name }));
          if (!alive) return;
          setTags(list);
        } else if (kind === "poster") {
          const res = await getAllPosterTags(); 
          const raw = res?.data ?? [];
          const map = new Map<number, string>();
          for (const t of raw as any[]) {
            const id = t?.tagId ?? t?.id;
            const name = t?.tagName ?? t?.name;
            if (typeof id === "number" && id > 0 && typeof name === "string" && name) {
              if (!map.has(id)) map.set(id, name);
            }
          }
          const list: PosterTagItem[] = Array.from(map, ([id, name]) => ({ id, name }));
          if (!alive) return;
          setTags(list);
        }
      } catch (e: any) {
        if (!alive) return;
        setTags([]);
        setTagsError(e?.message ?? "태그를 불러오지 못했습니다.");
      } finally {
        if (!alive) return;
        setTagsLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [kind]);

  // 태그 토글 시 쿼리만 업데이트
  const goWithIds = (ids: number[]) => {
    const next = new URLSearchParams(sp);
    next.delete("tags");
    ids.forEach(id => next.append("tags", String(id)));
    setSp(next, { replace: false });
  };
  const onToggleTag = (id: number) => goWithIds(toggleId(selectedTagIds, id));
  const onClearTags = () => {
    const next = new URLSearchParams(sp);
    next.delete("tags");
    next.set("mode", "tags"); // 태그 모드 유지
    setSp(next, { replace: false });
  };

  // 상위 컨테이너에서 스크롤 이벤트 처리
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    // LogoCardList가 표시되고 있을 때만 처리
    if (kind === "logo" && !tagsMode && logoCardListRef.current) {
      // 세로 스크롤만 처리
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;

      e.preventDefault();
      e.stopPropagation();

      logoCardListRef.current.handleExternalWheel(e.deltaY);
    }
  };

  return (
    <section className="relative w-screen h-screen overflow-hidden">
      {/* 배경 Canvas (전체 화면 고정) */}
      <Canvas
        style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
        gl={{ alpha: true }}
        camera={{ position: [0, 0, 10], fov: 50 }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} />
        <Stars size={3} />
      </Canvas>

    <div className="h-full items-center justify-center absolute inset-0" style={{ zIndex: 10 }} onWheel={handleWheel}>
      <Navigation />
      <main className="font-jamsil relative z-10 flex flex-col h-screen lg:px-12 text-center overflow-hidden">
        <div className="pt-6">
          <h1 className="text-4xl lg:text-5xl font-bold text-white">Archive</h1>
          <div className="mt-4 flex justify-center">
            <ArchiveToolbar />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center mx-14">
          {tagsMode && (
            <div className="ml-12 w-full max-w-6xl mb-6">
              {tagsLoading ? (
                <div className="text-slate-400">태그 불러오는 중…</div>
              ) : tagsError ? (
                <div className="text-red-300">{tagsError}</div>
              ) : kind === "logo" ? (
                <LogoTagBar
                  items={tags}
                  selectedIds={selectedTagIds}
                  onToggle={onToggleTag}
                  onClear={onClearTags}
                />
              ) : (
                <PosterTagBar
                  items={tags}
                  selectedIds={selectedTagIds}
                  onToggle={onToggleTag}
                  onClear={onClearTags}
                />
              )}
            </div>
          )}

          <div className="w-full flex flex-col items-center">
            {tagsMode ? (
              kind === "logo" ? (
                <LogoTagGrid tagIds={selectedTagIds} />
              ) : (
                <PosterTagGrid tagIds={selectedTagIds} />
              )
            ) : kind === "logo" ? (
              <LogoCardList ref={logoCardListRef} />
            ) : (
              <PosterCardList />
            )}
          </div>
        </div>
      </main>
    </div>



    </section>
  );
};

export default ArchivePage;