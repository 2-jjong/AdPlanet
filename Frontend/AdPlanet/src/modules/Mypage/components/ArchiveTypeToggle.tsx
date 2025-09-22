// src/modules/Mypage/components/ArchiveToolbar/ArchiveTypeToggle.tsx
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

type View = "logo" | "poster";

export default function ArchiveTypeToggle() {
  const navigate = useNavigate();
  const { kind: kindParam } = useParams();
  const [sp] = useSearchParams();

  // 현재 경로 기준으로 상태 계산
  const currentKind: View = (kindParam === "poster" ? "poster" : "logo");

  // order / tags 보존
  const buildQuerySuffix = () => {
    const next = new URLSearchParams();
    if (sp.get("order") === "OLDEST") next.set("order", "OLDEST");
    const tags = sp.getAll("tags");
    tags.forEach(t => next.append("tags", t));
    if (tags.length > 0 || sp.get("mode") === "tags") next.set("mode", "tags");
    const qs = next.toString();
    return qs ? `?${qs}` : "";
  };

  // 경로 이동: 선택된 태그/정렬을 유지한 채 대상 kind로 이동
  const go = (kind: View) => {
    const path = `/archive/${kind}`;
    // tags 모드를 유지
    const next = new URLSearchParams(buildQuerySuffix().slice(1));
    if (sp.getAll("tags").length > 0 || sp.get("mode") === "tags") {
      next.set("mode", "tags");
    } else {
      next.delete("mode");
    }
    const qs = next.toString();
    navigate(qs ? `${path}?${qs}` : path, { replace: false });
  };

  const Tab = ({ v, label }: { v: View; label: string }) => {
    const active = currentKind === v;
    return (
      <button
        type="button"
        aria-pressed={active}
        onClick={() => go(v)}
        className={[
          "px-6 py-2 text-sm rounded-full transition",
          active
            ? "bg-primary text-[#1D1F33] font-semibold"
            : "text-slate-300 hover:text-white",
        ].join(" ")}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="inline-flex items-center rounded-full bg-[#232544] p-1">
      <Tab v="logo" label="LOGO" />
      <Tab v="poster" label="POSTER" />
    </div>
  );
}
