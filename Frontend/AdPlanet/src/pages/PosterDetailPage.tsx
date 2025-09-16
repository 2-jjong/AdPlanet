import { Link, useParams } from "react-router-dom";

export default function PosterDetailPage() {
  const { id } = useParams();
  return (
    <div className="min-h-[50vh] p-6">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">포스터 상세 {id ? `#${id}` : ""}</h1>
        <Link to="/archive/poster" className="rounded-md px-3 py-1 bg-slate-800 hover:bg-slate-700">
          목록으로
        </Link>
      </header>
      <div className="rounded-xl border border-slate-700 p-4 bg-slate-900/40">
        포스터 상세 페이지 준비 중…
      </div>
    </div>
  );
}

// 임시 !!!!!!!!