// src/modules/Mypage/components/ArchiveToolbar/ArchiveTypeToggle.tsx
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  parseKindFromPath,
  isTagsRoute,
  getPathTagCsv,
  csvToIds,
  buildTagsPath,
} from "../../../utils/archiveRouteParser";

type View = "logo" | "poster";

export default function ArchiveTypeToggle() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sp] = useSearchParams();

  // 현재 경로 기준으로 상태 계산
  const currentKind: View = parseKindFromPath(location.pathname) || "logo";
  const onTags = isTagsRoute(location.pathname);

  // order만 보존, view/mode/tagIds는 정리
  const buildQuerySuffix = () => {
    const next = new URLSearchParams(location.search);
    if (sp.get("order") === "OLDEST") next.set("order", "OLDEST");
    else next.delete("order");
    next.delete("view");
    next.delete("mode");
    next.delete("tagIds");
    const qs = next.toString();
    return qs ? `?${qs}` : "";
  };

  // 경로 이동: 태그 화면이면 선택된 태그 유지한 채 대상 kind로, 아니면 /archive/{kind}
  const go = (kind: View) => {
    let path: string;
    if (onTags) {
      const csv = getPathTagCsv(location.pathname);
      const ids = csvToIds(csv);
      path = buildTagsPath(kind, ids);        // /archive/{kind}/tags(/:csv)
    } else {
      path = `/archive/${kind}`;              // /archive/{kind}
    }
    navigate(path + buildQuerySuffix(), { replace: false });
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
