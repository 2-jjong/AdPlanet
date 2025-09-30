// Sort, Search, Toggle (Logo/Poster) Bar
import ArchiveTypeToggle from "./ArchiveTypeToggle";
import SortTabs from "./SortTabs";

export default function ArchiveToolbar() {
  return (
    <div className="w-full max-w-6xl md:px-6 pt-10 pb-26">
      <div
        className="
          grid grid-cols-3 items-center
        "
      >
        {/* 좌측: 정렬 */}
        <div className="justify-self-start">
          <SortTabs />
        </div>

        {/* 가운데: 토글 (자동으로 중앙) */}
        <div className="justify-self-center">
          <ArchiveTypeToggle />
        </div>

        {/* 우측: 검색 */}
        <div className="ml-4 justify-self-end flex items-center gap-3">
          <input
            placeholder="검색어를 입력하세요"
            className="w-60 lg:w-72 rounded-md bg-[#232544] px-3 py-2 text-sm outline-none placeholder:text-slate-400"
          />
          <button className="rounded-md border border-primary px-3 py-2 text-sm">
            검색
          </button>
        </div>
      </div>
    </div>
  );
}
