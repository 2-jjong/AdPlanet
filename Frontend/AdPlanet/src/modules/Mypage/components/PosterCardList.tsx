// src/modules/Mypage/components/PosterCardList.tsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getPosterGroups } from "../../../services/posterService";
import type { PosterGroupItem } from "../../../services/dto/poster.dto";
import { PosterCard } from "./PosterCard";

// (선택) 절대경로 보정이 필요하다면 유틸 사용
const toAbsolute = (url?: string | null) => {
  if (!url) return "";
  if (/^(https?:)?\/\//.test(url) || url.startsWith("data:")) return url;
  return url.startsWith("/") ? url : `/${url}`;
};

export default function PosterCardList() {
  const [items, setItems] = useState<PosterGroupItem[]>([]);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    (async () => {
      try {
        setError("");
        // ArchiveToolbar에서 넘어오는 쿼리 파라미터 반영 (없으면 기본값)
        const orderParam = (params.get("order") || "LATEST") as "LATEST" | "OLDEST";
        const tagIdParam = params.get("tagId");
        const res = await getPosterGroups({
          order: orderParam,
          tagId: tagIdParam ? Number(tagIdParam) : undefined,
        });
        setItems(res.data ?? []);
      } catch (e: any) {
        console.error("[PosterCardList] fetch error:", e?.response || e);
        setError("포스터 목록을 불러오지 못했어요.");
      }
    })();
  }, [params]);

  if (error) return <div className="text-red-400">{error}</div>;
  if (!items.length) return <div className="text-slate-400">표시할 포스터가 없어요.</div>;

  // ✅ 레이아웃은 그대로: 각 카드 UI는 PosterCard를 사용 (기존 스타일 유지)
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {items.map((it) => (
        <button
          key={it.posterGroupId}
          onClick={() => navigate(`/archive/poster/${it.posterGroupId}`)}
          className="text-left"
          title={it.title}
        >
          <PosterCard
            title={it.title}
            imgUrl={toAbsolute(it.imgUrl)}
          />
        </button>
      ))}
    </div>
  );
}
