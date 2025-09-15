// Logos and Posters toggle component
import { NavLink } from "react-router-dom";

export default function ArchiveTypeToggle() {
  const tabs = [
    { to: "/archive/logo", label: "LOGO" },
    { to: "/archive/poster", label: "POSTER" },
  ];

  return (
    <div className="inline-flex items-center rounded-full bg-[#232544] p-1">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            [
              "px-6 py-2 text-sm rounded-full transition",
              isActive
                ? "bg-[#87DEDA] text-[#1D1F33] font-semibold"
                : "text-slate-300 hover:text-white",
            ].join(" ")
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
}
