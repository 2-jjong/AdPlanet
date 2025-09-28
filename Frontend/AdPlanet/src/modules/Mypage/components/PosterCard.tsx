// src/pages/archive/components/PosterCard.tsx
export function PosterCard({
  title,
  imgUrl,
  isActive,
}: {
  title: string;
  imgUrl?: string;
  isActive?: boolean;
}) {
  return (
    <div
      className={[
        "w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-lg",
        "bg-gray-100 text-black flex items-center justify-center",
        "transition-transform duration-300",
        isActive ? "ring-2 ring-primary" : "",
      ].join(" ")}
    >
      {imgUrl ? (
        <img src={imgUrl} alt={title} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <span className="text-base">{title}</span>
      )}
    </div>
  );
}
