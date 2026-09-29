import { FaBell, FaCircle, FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { fetchApi } from "../api";

function Navbar({ showTitle = false, showDashboardControls = false }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationError, setNotificationError] = useState("");
  const notificationRef = useRef(null);

  useEffect(() => {
    if (!showNotifications) {
      return undefined;
    }

    const handleOutsideClick = (event) => {
      if (!notificationRef.current?.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showNotifications]);

  const toggleNotifications = async () => {
    const shouldShow = !showNotifications;
    setShowNotifications(shouldShow);

    if (shouldShow && notifications.length === 0 && !notificationError) {
      try {
        setNotifications(await fetchApi("/alerts"));
      } catch (error) {
        setNotificationError(error.message);
      }
    }
  };

  const formatNotificationTime = (createdAt) =>
    createdAt
      ? new Date(createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  return (
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4 pt-16 md:pt-0">

      {showTitle && (
        <div>
          <h1 className="text-3xl font-bold text-white">
            Dashboard
          </h1>

          <p className="text-slate-400">
            IoT Floating Water Quality Monitoring System
          </p>
        </div>
      )}

      {showDashboardControls && (
        <div className="ml-auto flex flex-wrap items-center justify-end gap-3 sm:gap-6">
          <div className="flex items-center gap-2 rounded-xl bg-[#0B2233] px-3 py-2 sm:px-4">
            <FaCircle className="text-green-400 text-xs animate-pulse" />
            <span className="text-green-400 font-medium text-sm">
              ESP32 Online
            </span>
          </div>

          <div ref={notificationRef} className="relative">
            <button
              type="button"
              aria-label="Show notifications"
              title="Show notifications"
              onClick={toggleNotifications}
              className="relative bg-[#0B2233] p-3 rounded-xl hover:bg-cyan-600 transition"
            >
              <FaBell className="text-cyan-300 text-lg" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full z-50 mt-4 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-cyan-400 bg-[#0B2233] p-4 shadow-[0_0_25px_rgba(34,211,238,0.18)]">
                <span className="absolute -top-3 left-5 h-0 w-0 border-x-8 border-x-transparent border-b-8 border-b-cyan-400" />
                <span className="absolute -top-[9px] left-[21px] h-0 w-0 border-x-4 border-x-transparent border-b-4 border-b-[#0B2233]" />
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-white font-semibold">Notifications</h2>
                  <span className="text-xs text-cyan-300">
                    {notifications.length} recent
                  </span>
                </div>

                {notificationError && (
                  <p className="text-sm text-red-400">{notificationError}</p>
                )}

                {!notificationError && notifications.length === 0 && (
                  <p className="text-sm text-slate-400">
                    No recent notifications.
                  </p>
                )}

                <div className="space-y-2">
                  {notifications.slice(0, 3).map((notification) => (
                    <div
                      key={notification._id}
                      className="rounded-xl border border-slate-700 bg-[#081A28] p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-white">
                          {notification.title}
                        </p>
                        <span className="shrink-0 text-xs text-slate-500">
                          {formatNotificationTime(notification.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-300">
                        {notification.message}
                      </p>
                    </div>
                  ))}
                </div>

                <Link
                  to="/alerts"
                  onClick={() => setShowNotifications(false)}
                  className="mt-3 block text-center text-sm font-semibold text-cyan-300 hover:text-white"
                >
                  View all alerts
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-[#0B2233] px-3 py-2">
            <FaUserCircle className="text-cyan-300 text-2xl" />
            <div className="hidden leading-tight sm:block">
              <p className="text-white text-sm font-semibold">Administrator</p>
              <p className="text-slate-400 text-xs">Fish Farmer</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;