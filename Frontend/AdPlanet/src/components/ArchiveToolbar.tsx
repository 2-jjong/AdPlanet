// Sort, Search, Toggle (Logo/Poster) Bar
import ArchiveTypeToggle from "./ArchiveTypeToggle";
import SortTabs from "./SortTabs";

export default function ArchiveLayout() {
  return (

      <div className="mx-auto max-w-6xl px-4 pt-10">

        <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center">
        {/* 좌측: 정렬 */}
        <div className="justify-self-start">
            <SortTabs />
        </div>

        {/* 가운데: 타입 토글 (정중앙 고정) */}
        <div className="justify-self-center">
            <ArchiveTypeToggle />
        </div>

        {/* 우측: 검색 */}
        <div className="justify-self-end flex items-center gap-2">
            <input
            placeholder="Search..."
            className="w-64 rounded-md bg-[#232544] px-3 py-2 text-sm outline-none placeholder:text-slate-400"
            />
            <button className="rounded-md border border-[#87DEDA] px-3 py-2 text-sm">
            검색
            </button>
        </div>
        </div>

      </div>

  );
}
