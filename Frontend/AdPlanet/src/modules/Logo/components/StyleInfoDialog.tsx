import React from "react";

interface StyleInfoDialogProps {
  open: boolean;
  onClose: () => void;
  imageSrc: string;
  title: string;
  description: string;
  tips?: string[];
}

const StyleInfoDialog: React.FC<StyleInfoDialogProps> = ({ open, onClose, imageSrc, title, description, tips = [] }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-50 w-[92vw] max-w-[720px]">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f1121]/95 shadow-2xl">
          {/* glow border */}
          <div className="pointer-events-none absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-cyan-500/20 via-fuchsia-500/20 to-indigo-500/20 opacity-0 animate-[fadeIn_.6s_ease_forwards]" />

          <div className="grid grid-cols-1 md:grid-cols-[280px,1fr]">
            {/* Image side */}
            <div className="relative p-6 md:p-8 flex items-center justify-center">
              <div className="relative w-56 h-56 md:w-64 md:h-64">
                <img
                  src={imageSrc}
                  alt={title}
                  className="absolute inset-0 w-full h-full object-contain rounded-xl shadow-xl animate-[popIn_.5s_ease]"
                />
              </div>
            </div>

            {/* Info side */}
            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between">
                <h3 className="text-xl md:text-2xl font-bold text-white">{title}</h3>
                <button className="text-white/70 hover:text-white" onClick={onClose}>✕</button>
              </div>
              <p className="mt-3 text-white/80 leading-relaxed animate-[fadeInUp_.4s_ease_.05s_both]">{description}</p>
              {tips.length > 0 && (
                <ul className="mt-4 space-y-2 animate-[fadeInUp_.4s_ease_.1s_both]">
                  {tips.map((t, i) => (
                    <li key={i} className="text-sm text-white/70">• {t}</li>
                  ))}
                </ul>
              )}
              <div className="mt-6 flex justify-end">
                <button
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white font-semibold hover:opacity-95"
                  onClick={onClose}
                >
                  알겠어요
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
        @keyframes popIn { 0% { transform: scale(.92); opacity: 0 } 100% { transform: scale(1); opacity: 1 } }
        @keyframes fadeIn { 0% { opacity: 0 } 100% { opacity: 1 } }
        @keyframes fadeInUp { 0% { opacity: 0; transform: translateY(6px) } 100% { opacity: 1; transform: translateY(0) } }
        `}
      </style>
    </div>
  );
};

export default StyleInfoDialog;


