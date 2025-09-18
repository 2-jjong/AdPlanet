import React, {useState} from 'react';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

const Accordion: React.FC<AccordionProps> = ({ title, children, defaultOpen = false, isOpen, onToggle }) => {
  const [internalOpen, setInternalOpen] = useState<boolean>(defaultOpen);
  
  // isOpen이 제공되면 외부에서 제어, 그렇지 않으면 내부 상태 사용
  const open = isOpen !== undefined ? isOpen : internalOpen;

  const handleToggle = () => {
    const newOpen = !open;
    if (isOpen === undefined) {
      setInternalOpen(newOpen);
    }
    onToggle?.(newOpen);
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-5 py-3 bg-primary text-background rounded-lg shadow-sm hover:opacity-95 transition"
      >
        <span className="font-semibold text-sm">{title}</span>
        <svg
          className={`w-5 h-5 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="mt-3 border border-white/10 rounded-xl p-5 bg-transparent">
          {children}
        </div>
      )}
    </div>
  );
};

export default Accordion;


