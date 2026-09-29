import {
  FaBell,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchApi } from "../api";

function RecentAlerts({ className = "" }) {
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchApi("/alerts")
      .then(setAlerts)
      .catch((requestError) => setError(requestError.message));
  }, []);

  const alertStyle = {
    critical: { color: "text-red-400", icon: <FaExclamationTriangle /> },
    warning: { color: "text-yellow-400", icon: <FaExclamationTriangle /> },
    success: { color: "text-green-400", icon: <FaCheckCircle /> },
    info: { color: "text-cyan-400", icon: <FaBell /> },
  };

  const formatAlertTime = (createdAt) =>
    new Date(createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className={`h-full flex flex-col bg-[#0B2233] rounded-2xl p-6 border border-cyan-900 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(34,211,238,0.18)] ${className}`}>
      <div className="flex justify-between items-center gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-500/20 p-3 rounded-xl">
            <FaBell className="text-yellow-400 text-xl" />
          </div>

          <h3 className="text-white text-xl font-semibold">
            Recent Alerts
          </h3>
        </div>

        <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-semibold">
          {alerts.length} New
        </span>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      <div className="flex-1 space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert._id}
            className="h-[104px] flex flex-col bg-[#081A28] rounded-xl p-4 border border-slate-700 transition-all duration-300 hover:border-cyan-500 hover:bg-[#0B2233]"
          >
            <div className="flex justify-between items-start gap-3">
              <div className={`flex min-w-0 items-start gap-3 ${alertStyle[alert.severity]?.color || alertStyle.info.color}`}>
                {alertStyle[alert.severity]?.icon || alertStyle.info.icon}
                <span className="font-semibold text-white leading-5">
                  {alert.title}
                </span>
              </div>

              <span className="shrink-0 text-slate-500 text-xs">
                {formatAlertTime(alert.createdAt)}
              </span>
            </div>

            <p className="text-slate-300 text-sm mt-auto pt-2">{alert.message}</p>
          </div>
        ))}
      </div>

      <Link
        to="/alerts"
        className="block w-full mt-6 py-3 rounded-xl bg-cyan-500/20 text-cyan-300 font-semibold text-center transition-all duration-300 hover:bg-cyan-500 hover:text-white hover:shadow-[0_0_20px_rgba(34,211,238,0.35)]"
      >
        View All Alerts →
      </Link>
    </div>
  );
}

export default RecentAlerts;