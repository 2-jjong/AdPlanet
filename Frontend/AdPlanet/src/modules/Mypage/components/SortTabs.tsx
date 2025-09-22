import { useMemo } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";

type SortKey = "newest" | "oldest" | "tags";

const OPTIONS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "oldest", label: "Oldest" },
  { key: "tags",   label: "Tags"   },
];

export default function SortBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { kind: kindParam } = useParams();
  const [sp] = useSearchParams();

  const kind = (kindParam === "poster" ? "poster" : "logo") as "logo" | "poster";
  const value: SortKey = sp.getAll("tags").length > 0
    ? "tags"
    : sp.get("order") === "OLDEST" ? "oldest" : "newest";

  const setValue = (v: SortKey) => {
    if (v === "tags") {
      const next = new URLSearchParams(location.search);
      next.set("mode", "tags");
      const base = `/archive/${kind}`;
      const qs = next.toString();
      navigate(qs ? `${base}?${qs}` : base, { replace: true });
      return;
    }

    // 목록 화면으로 (경로를 /archive/{kind} 로 되돌리고, 정렬만 쿼리로)
    const next = new URLSearchParams(location.search);
    if (v === "newest") next.delete("order"); else next.set("order", "OLDEST");
    // 태그 모드 아님: 태그/모드 관련 쿼리 제거
    next.delete("mode");
    next.delete("tags");

    const base = `/archive/${kind}`;
    const qs = next.toString();
    navigate(qs ? `${base}?${qs}` : base, { replace: true });
  };

  const Divider = () => <span aria-hidden className="mx-6 h-6 w-px bg-white/30" />;
  const items = useMemo(() => OPTIONS, []);

  return (
    <nav className="flex items-center">
      {items.map((opt, i) => (
        <div key={opt.key} className="flex items-center">
          <button
            type="button"
            aria-pressed={value === opt.key}
            onClick={() => setValue(opt.key)}
            className={[
              "text-lg md:text-xl transition-colors",
              value === opt.key ? "text-primary font-semibold" : "text-white/90 hover:text-white",
            ].join(" ")}
          >
            {opt.label}
          </button>
          {i < items.length - 1 && <Divider />}
        </div>
      ))}
    </nav>
  );
}
