import React from "react";

interface SectionHeaderProps {
  title: string;
  icon: React.ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, icon }) => {
  return (
    <div className='flex items-center gap-3 pb-3 border-b border-white/10'>
      <div className='p-2 bg-primary/10 rounded-lg'>
        {icon}
      </div>
      <h3 className='text-base font-bold text-text-color'>{title}</h3>
    </div>
  );
};

export default SectionHeader;
