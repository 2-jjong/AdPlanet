// src/modules/Archive/components/PosterTagBar.tsx
export type PosterTagItem = { id: number; name: string };

type Props = {
  items?: PosterTagItem[];
  selectedIds?: number[];
  onToggle?: (id: number) => void;
  onClear?: () => void;
};

export default function PosterTagBar({
  items = [],
  selectedIds = [],
  onToggle = () => {},
  onClear = () => {},
}: Props) {
  return (
    <div className="mt-8 flex flex-wrap items-center gap-6">
      {items.map(({ id, name }) => {
        const active = selectedIds.includes(id);
        return (
          <button
            key={id}
            onClick={() => onToggle(id)}
            className={`text-lg font-extrabold transition-colors ${
              active ? "text-primary" : "text-slate-200 hover:text-white"
            }`}
          >
            #{name}
          </button>
        );
      })}
      {selectedIds.length > 0 && (
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
