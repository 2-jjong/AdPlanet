import React from "react";
import clsx from "clsx";

interface GenerateButtonProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
}

const GenerateButton: React.FC<GenerateButtonProps> = ({ onClick, disabled = false, loading = false, children }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "relative inline-flex items-center justify-center w-full h-12 md:h-14 rounded-xl overflow-hidden",
        "bg-gradient-to-r from-[#D9F6F3] via-[#AEEBE7] to-[#87DEDA] text-white font-bold",
        "shadow-[0_0_20px_rgba(135,222,218,0.35)] hover:shadow-[0_0_30px_rgba(135,222,218,0.5)] transition-shadow",
        disabled && "opacity-60 cursor-not-allowed"
      )}
    >
      <span className="absolute inset-[-200%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(135,222,218,0.5)_330deg,rgba(135,222,218,0.95)_360deg)]" />
      <span className="absolute inset-[3px] rounded-[10px] bg-[#0c0d16]" />
      <span className="relative z-10 flex items-center gap-2">
        {loading && (
          <span className="inline-flex w-4 h-4 border-2 border-[#87DEDA] border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </span>
    </button>
  );
};

export default GenerateButton;


