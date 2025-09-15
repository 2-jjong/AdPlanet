export function LogoCard({
  title,
  isActive,
}: {
  title: string;
  isActive?: boolean;
}) {
  return (
    <div
      className={[
        "h-[400px] w-full rounded-2xl bg-gray-50 text-black shadow-lg",
        "flex items-center justify-center",
        "transition-transform duration-300",
        // 활성 카드만 약간 더 내려서 앞에 돌출된 느낌
        isActive ? "translate-y-20 shadow-2xl" : "",
      ].join(" ")}
    >
      {title}
    </div>
  );
}

