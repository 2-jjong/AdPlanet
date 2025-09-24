// src/modules/Mypage/pages/ArchivePage.tsx
import React, { useState, useMemo, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Navigation from "../../../components/Layout/Navigation";
import ArchiveToolbar from "../components/ArchiveToolbar";
import LogoCardList from "../components/LogoCardList";
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

  return (
    <section className="relative w-screen h-screen">
      <Canvas className="absolute inset-0 !w-full !h-full" camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} />
        <Stars size={3} />
      </Canvas>

    <div className="min-h-screen items-center justify-center absolute inset-0">
      <Navigation />
      <main className="font-jamsil relative z-10 flex flex-col items-center justify-start min-h-[calc(100vh-80px)] lg:px-12 text-center">
        <h1 className="text-4xl lg:text-5xl font-bold text-white mt-6">Archive</h1>

        <div className="mt-4">
          <ArchiveToolbar />
        </div>

        {tagsMode && (
          <div className="ml-12 w-full max-w-6xl">
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
            <LogoCardList />
          ) : (
            <PosterCardList />
          )}
        </div>
      </main>
    </div>



    </section>
  );
};

export default ArchivePage;