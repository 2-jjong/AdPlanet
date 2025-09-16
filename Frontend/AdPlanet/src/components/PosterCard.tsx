type PosterItem = {
  id: string;
  title: string;
  date?: string;
  imageUrl?: string;
};

export default function PosterCard({ item }: { item: PosterItem }) {
  return (
    <div className="w-[240px] sm:w-[320px] lg:w-[320px]">
      {/* 포스터 썸네일 영역 */}
      <div className="aspect-[3/4] w-full rounded-[32px] bg-gray-200/90 ring-1 ring-black/10 shadow-md overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gray-200" />
        )}
      </div>

      {/* 메타(제목/날짜) — 필요 없으면 제거 가능 */}
      <div className="mt-3 flex items-baseline justify-center">
        {/* <h4 className="text-white/95 font-medium truncate">{item.title}</h4> */}
        <p className="text-xs text-white/50">
          {/* created at :  */}
          {item.date && <time className="">{item.date}</time>}
        </p>
      </div>
    </div>
  );
}
