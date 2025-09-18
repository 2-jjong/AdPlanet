export function LogoCard({
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
        "h-[400px] w-full rounded-2xl overflow-hidden shadow-lg",
        "bg-gray-100 text-black flex items-center justify-center",
        "transition-transform duration-300",
        isActive ? "ring-2 ring-primary" : "",
      ].join(" ")}
    >
      {imgUrl ? (
        // 이미지가 오면 이미지 우선
        <img
          src={imgUrl}
          alt={title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        // 없으면 타이틀만
        <span className="text-base">{title}</span>
      )}
    </div>
  );
}
