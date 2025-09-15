// LogoCard.tsx
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
        "h-[400px] w-full rounded-2xl bg-gray-50 text-black shadow-lg flex items-center justify-center transition-transform duration-300",
        // 현재 카드만 아래로 16px 정도 내려줌 (원하면 12~24px 사이로 조절)
        isActive ? "translate-y-4" : "",
      ].join(" ")}
    >
      {title}
    </div>
  );
}
