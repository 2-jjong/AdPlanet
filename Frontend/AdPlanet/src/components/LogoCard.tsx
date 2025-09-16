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
      ].join(" ")}
    >
      {title}
    </div>
  );
}

