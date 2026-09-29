import { NavLink } from "react-router-dom";
import { useRef, useState } from "react";
import {
  FaChartLine,
  FaFish,
  FaBell,
  FaHistory,
  FaCog,
  FaLeaf,
  FaBars,
  FaTimes,
} from "react-icons/fa";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: <FaChartLine /> },
  { name: "Historical Records", path: "/historical-records", icon: <FaHistory /> },
  { name: "Fish Recommendation", path: "/fish-recommendation", icon: <FaFish /> },
  { name: "Alerts", path: "/alerts", icon: <FaBell /> },
  { name: "Settings", path: "/settings", icon: <FaCog /> },
];

function Sidebar() {
  const [expanded, setExpanded] = useState(
    () => sessionStorage.getItem("sidebar-expanded") === "true",
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const collapseTimer = useRef(null);

  const handleMouseEnter = () => {
    if (collapseTimer.current) {
      clearTimeout(collapseTimer.current);
    }
    setExpanded(true);
    sessionStorage.setItem("sidebar-expanded", "true");
  };

  const handleMouseLeave = () => {
    collapseTimer.current = setTimeout(() => {
      setExpanded(false);
      sessionStorage.setItem("sidebar-expanded", "false");
    }, 200);
  };

  return (
    <>
      <button
        type="button"
        aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((current) => !current)}
        className="fixed left-4 top-4 z-[60] rounded-xl bg-[#0B2233] p-3 text-cyan-300 shadow-lg md:hidden"
      >
        {mobileOpen ? <FaTimes /> : <FaBars />}
      </button>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
        />
      )}

      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed left-0 top-0 z-50 flex min-h-screen flex-col border-r border-cyan-900 bg-[#06141F]
        transition-all duration-300 ease-in-out
        ${mobileOpen ? "translate-x-0 w-72" : "-translate-x-full w-72"}
        md:translate-x-0 ${expanded ? "md:w-72" : "md:w-20"}`}
      >
      {/* Logo */}
      <div className="px-4 py-6 border-b border-cyan-900">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-500 p-3 rounded-xl text-white text-xl">
            <FaLeaf />
          </div>

          {(expanded || mobileOpen) && (
            <div className="transition-opacity duration-300">
              <h1 className="text-white font-bold text-lg">AquaSense</h1>
              <p className="text-cyan-400 text-xs">IoT Monitoring System</p>
            </div>
          )}
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 mt-6 px-2 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.25)]"
                  : "text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-300 hover:translate-x-1"
              }`
            }
          >
            {/* Icon */}
            <span className="text-xl min-w-[24px] flex justify-center">
              {item.icon}
            </span>

            {/* Text only when sidebar expands */}
            {(expanded || mobileOpen) && (
              <span className="font-medium whitespace-nowrap transition-opacity duration-300">
                {item.name}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Status */}
      <div className="p-3 border-t border-cyan-900">
        <div className="bg-[#0B2233] rounded-xl p-3 border border-slate-700 transition-all duration-300 hover:border-cyan-500 hover:bg-[#102C40]">
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>

            {(expanded || mobileOpen) && (
              <span className="text-green-400 text-sm font-semibold">
                ESP32 Online
              </span>
            )}
          </div>

          {(expanded || mobileOpen) && (
            <p className="text-slate-500 text-xs mt-2 text-center">
              Floating Platform Connected
            </p>
          )}
        </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;