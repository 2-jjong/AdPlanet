import React from "react";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // deg
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const TiltCard: React.FC<TiltCardProps> = ({ children, className = "", maxTilt = 10, onClick }) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [style, setStyle] = React.useState<React.CSSProperties>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = (x / rect.width) * 2 - 1;
    const py = (y / rect.height) * 2 - 1;
    const tiltX = -(py * maxTilt);
    const tiltY = px * maxTilt;
    setStyle({ transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02,1.02,1.02)` });
  };

  const handleLeave = () => {
    setStyle({ transform: "rotateX(0deg) rotateY(0deg) scale3d(1,1,1)", transition: "transform .2s ease" });
    setTimeout(() => setStyle({}), 200);
  };

  return (
    <div
      ref={ref}
      className={"[transform-style:preserve-3d] will-change-transform " + className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
};

export default TiltCard;


