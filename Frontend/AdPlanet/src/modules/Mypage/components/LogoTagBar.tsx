// src/components/TagBar.tsx
export type LogoTagItem = { id: number; name: string };

type Props = {
  items?: LogoTagItem[];
  selectedIds?: number[];              // 단일/다중 모두 호환
  onToggle?: (id: number) => void;     // 클릭 시 토글(또는 교체) 로직은 부모에서
  onClear?: () => void;                // 선택 전체 해제
  prefix?: string | null;              // 기본 "#", null이면 접두어 제거
  className?: string;                  // 외부에서 여백 등 커스터마이즈
};

export default function TagBar({
  items = [],
  selectedIds = [],
  onToggle = () => {},
  onClear = () => {},
  prefix = "#",
  className = "",
}: Props) {
  return (
    <div className={`mt-8 flex flex-wrap items-center gap-6 ${className}`}>
      {items.map(({ id, name }) => {
        const active = selectedIds.includes(id);
        return (
          <button
            key={id}
            onClick={() => onToggle(id)}
            aria-pressed={active}
            className={`text-lg font-extrabold transition-colors ${
              active ? "text-primary" : "text-slate-200 hover:text-white"
            }`}
            title={name}
          >
            {prefix ? `${prefix}${name}` : name}
          </button>
        );
      })}

      {onClear && selectedIds.length > 0 && (
        <button
          className="text-sm text-slate-400 underline ml-2"
          onClick={onClear}
        >
          clear
        </button>
      )}
    </div>
  );
}
