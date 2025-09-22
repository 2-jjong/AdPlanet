import React from "react";
import clsx from "clsx";

interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

const Chip: React.FC<ChipProps> = ({ label, selected = false, onClick, className = "" }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "px-3 py-1.5 rounded-full text-sm transition-colors",
        selected
          ? "bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white shadow"
          : "bg-white/5 text-white/80 hover:bg-white/10 border border-white/10",
        className
      )}
    >
      {label}
    </button>
  );
};

export default Chip;


