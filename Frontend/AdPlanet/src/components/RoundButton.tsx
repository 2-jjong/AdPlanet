import React from "react";
import clsx from "clsx";

const base =
  "inline-flex items-center justify-center font-medium rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

const sizes = {
  xs: "px-1.5 py-1 text-[10px] md:px-2 md:py-1.5 md:text-xs",
  sm: "px-1 py-1.5 text-xs md:px-4 md:py-2 md:text-base lg:px-5 lg:py-2.5 lg:text-base",
  md: "px-2 py-2 text-sm md:px-5 md:py-2.5 md:text-lg lg:px-6 lg:py-3 lg:text-xl",
  lg: "px-3 py-3 text-base md:px-7 md:py-3.5 md:text-xl lg:px-8 lg:py-4 lg:text-2xl",
};

const variants = {
  primary: "bg-background text-white hover:bg-[#6fc7c3] focus:ring-[#87DEDA]",
  secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-300",
  danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-400",
  fill: "bg-primary text-white hover:bg-[#6fc7c3] focus:ring-[#87DEDA]",
  outline:
    "border-2 border-dotted border-primary text-text-color bg-transparent hover:bg-primary hover:text-white focus:ring-[#87DEDA]",
};

interface ButtonProps {
  text: string;
  size?: keyof typeof sizes; // "sm" | "md" | "lg"
  variant?: keyof typeof variants; // "primary" | "secondary" | "danger"
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}
export const RoundButton: React.FC<ButtonProps> = ({
  text,
  size = "sm",
  variant = "primary",
  type = "button",
  className = "font-jamsil m-2 whitespace-nowrap",
  disabled = false,
  onClick,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(base, sizes[size], variants[variant], className)}
    >
      {text}
    </button>
  );
};
