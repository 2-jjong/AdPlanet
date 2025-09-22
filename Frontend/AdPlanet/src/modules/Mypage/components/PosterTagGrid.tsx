// src/modules/Mypage/components/PosterTagGrid.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom"; 
import { getPosterGroups } from "../../../services/posterService";
import type { PosterGroupItem } from "../../../services/dto/poster.response";

type Props = { tagIds?: number[] };

export default function PosterTagGrid({ tagIds = [] }: Props) {
  const location = useLocation();
  const search = new URLSearchParams(location.search);
  const order = (search.get("order") as "NEWEST" | "OLDEST") || "NEWEST";

  const idsKey = useMemo(() => tagIds.join(","), [tagIds]);

  const [items, setItems] = useState<PosterGroupItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        if (tagIds.length === 0) {
          if (!alive) return;
          setItems([]);
          return;
        }

        if (tagIds.length === 1) {
          const resp = await getPosterGroups({ order, tagId: tagIds[0] });
          if (!alive) return;
          setItems(resp.data ?? []);
          return;
        }

        const responses = await Promise.all(
          tagIds.map((id) =>
            getPosterGroups({ order, tagId: id })
              .then((r) => r.data ?? [])
              .catch(() => [] as PosterGroupItem[])
          )
        );

        if (!alive) return;

        const merged = new Map<number, PosterGroupItem>();
        for (const arr of responses) {
          for (const g of arr) {
            if (!merged.has(g.posterGroupId)) merged.set(g.posterGroupId, g);
          }
        }

        const list = Array.from(merged.values());
        list.sort((a, b) => {
          const ta = new Date(a.createdAt).getTime();
          const tb = new Date(b.createdAt).getTime();
          return order === "OLDEST" ? ta - tb : tb - ta;
        });

        setItems(list);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message ?? "포스터 목록을 불러오지 못했어요.");
        setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, idsKey]);

  // 태그를 선택하지 않은 경우
  if (tagIds.length === 0) {
    return <div className="mt-8 text-slate-400">태그를 선택하세요.</div>;
  }

  // 로딩 중
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] rounded-xl bg-slate-800 animate-pulse" />
        ))}
      </div>
    );
  }

  // 에러 발생
  if (err) return <div className="mt-6 text-red-300">{err}</div>;
  if (!items.length) return <div className="mt-6 text-slate-300">조건에 맞는 포스터가 없어요.</div>;

  // 정상 렌더링
  return (
    <main className="w-full max-w-6xl px-4 mt-5">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
        {items.map((g) => (
          <Link
            key={g.posterGroupId}
            to={`/archive/poster/${g.posterGroupId}`}  
            className="group block rounded-xl overflow-hidden bg-slate-800/60 border border-slate-700 hover:border-slate-500 transition"
          >
            <img
              src={g.imgUrl}
              alt={g.title}
              className="w-full aspect-[3/4] object-cover transition-transform group-hover:scale-[1.02]"
            />
            <div className="p-3">
              <h4 className="text-sm font-semibold text-white truncate">{g.title}</h4>
              <p className="text-xs text-slate-300 line-clamp-2 mt-1">{g.content}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
