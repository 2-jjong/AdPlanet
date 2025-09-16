// Logos and Posters toggle component
import { NavLink } from "react-router-dom";
import { useSearchParams } from "react-router-dom";   // 쿼리 파라미터 훅

type View = "logo" | "poster";

export default function ArchiveTypeToggle() {
  const [params, setParams] = useSearchParams();
  const view = (params.get("view") as View) || "logo";

  const setView = (v: View) => {
    params.set("view", v);
    setParams(params, { replace: true }); // 히스토리 오염 방지
  };

  const Tab = ({ v, label }: { v: View; label: string }) => {
    const active = view === v;
    return (
      <button
        type="button"
        aria-pressed={active}
        onClick={() => setView(v)}
        className={[
          "px-6 py-2 text-sm rounded-full transition",
          active
            ? "bg-[#87DEDA] text-[#1D1F33] font-semibold"
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