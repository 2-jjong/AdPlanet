// Newest, Oldest, Tags 버튼 컴포넌트
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

type SortKey = "newest" | "oldest" | "tags";

const OPTIONS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "oldest", label: "Oldest" },
  { key: "tags",   label: "Tags"   },
];

export default function SortBar() {
  const [params, setParams] = useSearchParams();
  const value: SortKey = (params.get("sort") as SortKey) || "newest";

  const setValue = (v: SortKey) => {
    params.set("sort", v);
    setParams(params, { replace: true });
  };

  const Divider = () => (
    <span aria-hidden className="mx-6 h-6 w-px bg-white/30" />
  );

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
              value === opt.key
                ? "text-[#87DEDA] font-semibold"
                : "text-white/90 hover:text-white"
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
