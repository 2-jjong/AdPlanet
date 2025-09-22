// LogoTagGrid.tsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getLogoList } from "../../../services/logoService";
import type { LogoListItem as LogoCardType, LogoListQuery } from "../../../services/dto/logo.dto";
import { LogoCard } from "./LogoCard";

/** order: NEWEST 생략, OLDEST만 쿼리로 보냄 */
function parseOrder(sp: URLSearchParams): LogoListQuery["order"] | undefined {
  return sp.get("order") === "OLDEST" ? "OLDEST" : undefined;
}

type Props = { tagIds: number[] };

export default function LogoTagGrid({ tagIds }: Props) {
  const [sp] = useSearchParams();
  const [items, setItems] = useState<LogoCardType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const order = parseOrder(sp);

  useEffect(() => {
    if (tagIds.length === 0) {             
      setItems([]);
      setError(null);
      setLoading(false);
      return;
    }

    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        console.debug("[LogoTagGrid] fetch", { order, tagIds }); // 확인용 로그
        const res = await getLogoList({
          ...(order && { order }),
          tagIds,                                              // 서비스에서 CSV 변환하므로 배열 그대로 전달
        });
        if (!alive) return;
        setItems(res.data ?? []);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "Failed to load logos");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [order, tagIds.join(",")]);

  if (tagIds.length === 0) return <div className="mt-10 text-slate-400">태그를 선택해 주세요.</div>;
  if (loading) return <div className="mt-10 text-slate-400">Loading…</div>;
  if (error)   return <div className="mt-10 text-red-300">{error}</div>;
  if (!items.length) return <div className="mt-10 text-slate-400">해당 태그의 로고가 없습니다.</div>;

  return (
    <div className="mt-8 w-full max-w-6xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 bg-slate-800/40 p-8 rounded-xl">
        {items.map((it) => (
          <div key={it.logoId}>
            <LogoCard title={it.name} imgUrl={it.imgUrl} />
          </div>
        ))}
      </div>
    </div>
  );
}