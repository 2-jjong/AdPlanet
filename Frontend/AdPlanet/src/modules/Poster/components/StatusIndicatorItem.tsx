import React from "react";

interface StatusIndicatorItemProps {
  label: string;
  isCompleted: boolean;
  statusText: string;
}

const StatusIndicatorItem: React.FC<StatusIndicatorItemProps> = ({
  label,
  isCompleted,
  statusText,
}) => {
  return (
    <div className='flex items-center justify-between p-2 rounded-lg bg-background/50'>
      <div className='flex items-center gap-3'>
        <div
          className={`w-3 h-3 rounded-full ${
            isCompleted ? "bg-green-400 animate-pulse" : "bg-gray-400"
          }`}
        />
        <span className='text-sm font-medium'>{label}</span>
      </div>
      <span className='text-xs text-text-color/60'>
        {statusText}
      </span>
    </div>
  );
};

export default StatusIndicatorItem;
