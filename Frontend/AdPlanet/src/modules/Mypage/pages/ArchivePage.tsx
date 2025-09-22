// src/modules/Mypage/pages/ArchivePage.tsx
import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navigation from "../../../components/Layout/Navigation";
import ArchiveToolbar from "../components/ArchiveToolbar";
import LogoCardList from "../components/LogoCardList";
import PosterCardList from "../components/PosterCardList";
import LogoTagBar from "../components/LogoTagBar";
import type { LogoTagItem } from "../components/LogoTagBar";
import { parseKindFromPath, isTagsRoute, getPathTagCsv, csvToIds, buildTagsPath, toggleId } from "../../../utils/archiveRouteParser";
import LogoTagGrid from "../components/LogoTagGrid";
import { getAllLogoTags } from "../../../services/logoService";
import PosterTagBar from "../components/PosterTagBar";
import type { PosterTagItem } from "../components/PosterTagBar";
import PosterTagGrid from "../components/PosterTagGrid";
import { getAllPosterTags } from "../../../services/posterService";

const ArchivePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 경로만을 단일 소스로 사용
  const kind = parseKindFromPath(location.pathname) || "logo"; // "logo" | "poster"
  const tagsMode = isTagsRoute(location.pathname);             // /tags 경로 여부
  const selectedTagIds = useMemo(() => {
    const csv = getPathTagCsv(location.pathname);
    return csvToIds(csv); // 항상 [] 또는 [number...]
  }, [location.pathname]);

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

  // 태그 토글 시 경로만 바꿔줌 (쿼리는 그대로 유지)
  const goWithIds = (ids: number[]) => {
    const path = buildTagsPath(kind, ids);
    navigate(path + location.search, { replace: false });
  };
  const onToggleTag = (id: number) => goWithIds(toggleId(selectedTagIds, id));
  const onClearTags = () => goWithIds([]);

  return (
    <div className="min-h-screen bg-background items-center justify-center">
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
  );
};

export default ArchivePage;