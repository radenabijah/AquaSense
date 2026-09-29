import Sidebar from "../components/SideBar";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { fetchApi } from "../api";
import {
  FaBell,
  FaExclamationTriangle,
  FaCheckCircle,
  FaWater,
  FaThermometerHalf,
  FaTint,
  FaClock,
  FaFilter,
} from "react-icons/fa";

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("All Severity");
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchApi("/alerts")
      .then((loadedAlerts) => {
        setAlerts(loadedAlerts);
        setFilteredAlerts(loadedAlerts);
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  const statusLabel = (alert) =>
    alert.resolved || alert.severity === "success"
      ? "Resolved"
      : alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1);

  const parameter = (alert) => {
    if (alert.title.toLowerCase().includes("ph")) return "pH";
    if (alert.title.toLowerCase().includes("turbidity")) return "Turbidity";
    if (alert.title.toLowerCase().includes("temperature")) return "Temperature";
    return "Water Quality";
  };

  const applyFilter = () => {
    setFilteredAlerts(
      alerts.filter((alert) => {
        const matchesDate =
          !selectedDate ||
          new Date(alert.createdAt).toISOString().slice(0, 10) === selectedDate;
        const matchesSeverity =
          selectedSeverity === "All Severity" ||
          statusLabel(alert) === selectedSeverity;
        return matchesDate && matchesSeverity;
      }),
    );
  };

  const exportHistory = () => {
    const headers = ["Date", "Time", "Parameter", "Value", "Status"];
    const rows = filteredAlerts.map((alert) => {
      const date = new Date(alert.createdAt);
      return [
        date.toLocaleDateString(),
        date.toLocaleTimeString(),
        parameter(alert),
        alert.message,
        statusLabel(alert),
      ];
    });
    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    link.download = "alert-history.csv";
    link.click();
  };

  const activeAlerts = filteredAlerts.filter((alert) => !alert.resolved && alert.severity !== "success");
  const criticalCount = alerts.filter((alert) => alert.severity === "critical" && !alert.resolved).length;
  const warningCount = alerts.filter((alert) => alert.severity === "warning" && !alert.resolved).length;
  const resolvedCount = alerts.filter((alert) => alert.resolved || alert.severity === "success").length;

  return (
    <div className="flex bg-[#03131D] min-h-screen">
      <Sidebar />

      <main className="min-w-0 flex-1 bg-[#03131D] p-4 overflow-y-auto sm:p-6 md:ml-20 md:p-8">
        <div className="max-w-7xl mx-auto">

          {/* Navbar */}
          <Navbar />

          {/* Page Header */}
          <div className="mt-6 mb-8 flex items-start gap-4">
            <div className="shrink-0 rounded-2xl bg-red-500/20 p-3 sm:p-4">
              <FaBell className="text-red-400 text-3xl" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                Water Quality Alerts
              </h1>

              <p className="text-slate-400 mt-1">
                Monitor unsafe water quality conditions and view alert history from AquaSense.
              </p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">

            <div className="bg-[#0B2233] rounded-2xl p-5 border border-red-800 hover:border-red-500 transition-all duration-300 hover:-translate-y-1">
              <div className="flex justify-between items-center">
                <p className="text-slate-400 text-sm">Critical Alerts</p>
                <FaExclamationTriangle className="text-red-400 text-xl" />
              </div>

              <h2 className="text-3xl text-white font-bold mt-3">{criticalCount}</h2>

              <p className="text-red-400 text-sm mt-2">
                Immediate attention required.
              </p>
            </div>

            <div className="bg-[#0B2233] rounded-2xl p-5 border border-yellow-800 hover:border-yellow-500 transition-all duration-300 hover:-translate-y-1">
              <div className="flex justify-between items-center">
                <p className="text-slate-400 text-sm">Warning Alerts</p>
                <FaBell className="text-yellow-400 text-xl" />
              </div>

              <h2 className="text-3xl text-white font-bold mt-3">{warningCount}</h2>

              <p className="text-yellow-400 text-sm mt-2">
                Water quality approaching unsafe limits.
              </p>
            </div>

            <div className="bg-[#0B2233] rounded-2xl p-5 border border-green-800 hover:border-green-500 transition-all duration-300 hover:-translate-y-1">
              <div className="flex justify-between items-center">
                <p className="text-slate-400 text-sm">Resolved Alerts</p>
                <FaCheckCircle className="text-green-400 text-xl" />
              </div>

              <h2 className="text-3xl text-white font-bold mt-3">{resolvedCount}</h2>

              <p className="text-green-400 text-sm mt-2">
                Water conditions returned to safe range.
              </p>
            </div>
            {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

            <div className="bg-[#0B2233] rounded-2xl p-5 border border-cyan-900 hover:border-cyan-400 transition-all duration-300 hover:-translate-y-1">
              <div className="flex justify-between items-center">
                <p className="text-slate-400 text-sm">System Status</p>
                <FaWater className="text-cyan-400 text-xl" />
              </div>

              <h2 className="text-xl text-green-400 font-bold mt-3">
                Monitoring Active
              </h2>

              <p className="text-slate-400 text-sm mt-2">
                ESP32 is continuously monitoring the pond.
              </p>
            </div>

          </div>

          {/* Active Alerts */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-5">
              <FaExclamationTriangle className="text-red-400 text-xl" />

              <h2 className="text-white text-2xl font-semibold">
                Active Alerts
              </h2>
            </div>

            <div className="space-y-5">

              {activeAlerts.map((alert) => (
                <div
                  key={alert._id}
                  className={`bg-[#0B2233] rounded-2xl p-6 border shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer ${
                    alert.severity === "critical"
                      ? "border-red-700 hover:border-red-500"
                      : "border-yellow-700 hover:border-yellow-500"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">

                    <div>
                      <h3 className="text-white text-xl font-semibold">
                        {alert.title}
                      </h3>

                      <p className="text-slate-400 text-sm mt-1">
                        Point A
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        alert.severity === "critical"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {statusLabel(alert)}
                    </span>

                  </div>

                  <p className="text-slate-300 mb-4">{alert.message}</p>

                  <div className="grid md:grid-cols-3 gap-4">

                    <div className="bg-[#081A28] rounded-xl p-3 border border-slate-700">
                      <p className="text-slate-500 text-xs">Parameter Value</p>

                      <p className="text-white font-semibold mt-1">
                        {alert.message}
                      </p>
                    </div>

                    <div className="bg-[#081A28] rounded-xl p-3 border border-slate-700">
                      <p className="text-slate-500 text-xs">Location</p>

                      <p className="text-white font-semibold mt-1">
                        Point A
                      </p>
                    </div>

                    <div className="bg-[#081A28] rounded-xl p-3 border border-slate-700 flex items-center gap-2">
                      <FaClock className="text-cyan-400" />

                      <div>
                        <p className="text-slate-500 text-xs">Detected</p>

                        <p className="text-white font-semibold">
                          {new Date(alert.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                  </div>

                  <button
                    onClick={() => setSelectedAlert(alert)}
                    className="w-full mt-5 py-3 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-white transition-all duration-300 font-semibold"
                  >
                    View Alert Details →
                  </button>
                </div>
              ))}

            </div>
          </div>

          {/* Alert History */}
          <div className="mt-8 rounded-2xl border border-cyan-900 bg-[#0B2233] p-4 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(34,211,238,0.18)] sm:p-6">

            <div className="mb-5 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <FaFilter className="text-cyan-400" />

                <h2 className="text-white text-xl font-semibold">
                  Alert History
                </h2>
              </div>

              <button
                onClick={exportHistory}
                disabled={!filteredAlerts.length}
                className="rounded-xl bg-cyan-500/20 px-4 py-2 text-cyan-300 transition-all duration-300 hover:bg-cyan-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Export History
              </button>
            </div>

            {/* Filter Bar */}
            <div className="mb-6 grid gap-3 md:grid-cols-3 md:gap-4">

              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="bg-[#081A28] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />

              <select
                value={selectedSeverity}
                onChange={(event) => setSelectedSeverity(event.target.value)}
                className="bg-[#081A28] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none"
              >
                <option>All Severity</option>
                <option>Critical</option>
                <option>Warning</option>
                <option>Resolved</option>
              </select>

              <button
                onClick={applyFilter}
                className="rounded-xl bg-cyan-500/20 py-3 text-cyan-300 transition-all duration-300 hover:bg-cyan-500 hover:text-white"
              >
                Apply Filter
              </button>

            </div>

            {/* History Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">

                <thead className="border-b border-slate-700 text-slate-400">
                  <tr>
                    <th className="py-3 text-left">Date</th>
                    <th className="text-left">Time</th>
                    <th className="text-left">Parameter</th>
                    <th className="text-left">Value</th>
                    <th className="text-left">Status</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredAlerts.map((alert) => (
                    <tr
                      key={alert._id}
                      className="border-b border-slate-800"
                    >
                      <td className="py-4 text-white">
                        {new Date(alert.createdAt).toLocaleDateString()}
                      </td>

                      <td className="text-slate-300">
                        {new Date(alert.createdAt).toLocaleTimeString()}
                      </td>

                      <td className="text-white flex items-center gap-2 py-4">

                        {parameter(alert) === "Temperature" && (
                          <FaThermometerHalf className="text-orange-400" />
                        )}

                        {parameter(alert) === "pH" && (
                          <FaTint className="text-green-400" />
                        )}

                        {parameter(alert) === "Turbidity" && (
                          <FaWater className="text-cyan-400" />
                        )}

                        {parameter(alert)}

                      </td>

                      <td className="text-cyan-300 font-medium">
                        {alert.message}
                      </td>

                      <td>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            statusLabel(alert) === "Critical"
                              ? "bg-red-500/20 text-red-400"
                              : statusLabel(alert) === "Warning"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-green-500/20 text-green-400"
                          }`}
                        >
                          {statusLabel(alert)}
                        </span>
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {filteredAlerts.map((alert) => (
                <article
                  key={alert._id}
                  className="rounded-xl border border-slate-700 bg-[#081A28] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      {parameter(alert) === "Temperature" && (
                        <FaThermometerHalf className="shrink-0 text-orange-400" />
                      )}
                      {parameter(alert) === "pH" && (
                        <FaTint className="shrink-0 text-green-400" />
                      )}
                      {parameter(alert) === "Turbidity" && (
                        <FaWater className="shrink-0 text-cyan-400" />
                      )}
                      <p className="font-semibold text-white">{parameter(alert)}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                        statusLabel(alert) === "Critical"
                          ? "bg-red-500/20 text-red-400"
                          : statusLabel(alert) === "Warning"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {statusLabel(alert)}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-cyan-300">
                    {alert.message}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
                    <span>{new Date(alert.createdAt).toLocaleTimeString()}</span>
                  </div>
                </article>
              ))}
            </div>

            {!error && !filteredAlerts.length && (
              <p className="py-8 text-center text-slate-400">
                No alerts match the selected filters.
              </p>
            )}

          </div>

          {selectedAlert && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
              role="presentation"
              onClick={() => setSelectedAlert(null)}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="alert-details-title"
                className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-cyan-700 bg-[#0B2233] p-4 shadow-2xl shadow-cyan-950/40 sm:p-6"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-cyan-400 text-sm font-semibold uppercase tracking-wide">
                      Alert Details
                    </p>
                    <h2 id="alert-details-title" className="text-white text-2xl font-bold mt-2">
                      {selectedAlert.title}
                    </h2>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      statusLabel(selectedAlert) === "Critical"
                        ? "bg-red-500/20 text-red-400"
                        : statusLabel(selectedAlert) === "Warning"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-green-500/20 text-green-400"
                    }`}
                  >
                    {statusLabel(selectedAlert)}
                  </span>
                </div>

                <p className="text-slate-300 leading-relaxed mt-5">
                  {selectedAlert.message}
                </p>

                <div className="grid gap-4 sm:grid-cols-2 mt-6">
                  <div className="rounded-xl border border-slate-700 bg-[#081A28] p-4">
                    <p className="text-slate-500 text-xs">Parameter</p>
                    <p className="text-white font-semibold mt-1">
                      {parameter(selectedAlert)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-700 bg-[#081A28] p-4">
                    <p className="text-slate-500 text-xs">Location</p>
                    <p className="text-white font-semibold mt-1">Point A</p>
                  </div>

                  <div className="rounded-xl border border-slate-700 bg-[#081A28] p-4">
                    <p className="text-slate-500 text-xs">Detected</p>
                    <p className="text-white font-semibold mt-1">
                      {new Date(selectedAlert.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-700 bg-[#081A28] p-4">
                    <p className="text-slate-500 text-xs">Alert ID</p>
                    <p className="text-white font-semibold mt-1 break-all">
                      {selectedAlert._id}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setSelectedAlert(null)}
                    className="rounded-xl bg-cyan-500 px-5 py-2.5 text-white font-semibold hover:bg-cyan-400 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Alert Notification Logic */}
          <div className="mt-8 bg-[#0B2233] rounded-2xl p-6 border border-cyan-900 shadow-lg">
            <h2 className="text-white text-xl font-semibold mb-4">
              How AquaSense Generates Alerts
            </h2>

            <div className="space-y-4 text-slate-300 leading-relaxed">
              <p>
                AquaSense continuously compares the measured temperature, pH, and
                turbidity values against predefined safe thresholds for aquaculture.
              </p>

              <p>
                If any parameter exceeds its safe range, the system immediately
                creates an alert, displays it on the dashboard, and records it in
                the alert history.
              </p>

              <p>
                Once the water quality returns to the acceptable range, the alert
                status is marked as <span className="text-green-400 font-semibold">Resolved</span> and remains in the history for monitoring and analysis.
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Alerts;