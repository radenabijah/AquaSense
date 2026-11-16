import Sidebar from "../components/SideBar";
import Navbar from "../components/Navbar";
import { useEffect, useMemo, useState } from "react";
import { fetchApi } from "../api";
import {
  FaBell,
  FaCheckCircle,
  FaExclamationTriangle,
  FaFilter,
  FaThermometerHalf,
  FaTint,
  FaWater,
} from "react-icons/fa";

function getAlertStatus(alert) {
  if (alert.status) return alert.status;
  return alert.resolved || alert.severity === "success" ? "resolved" : "active";
}

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyAlertId, setBusyAlertId] = useState("");
  const [deviceStatus, setDeviceStatus] = useState("offline");

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        const [loadedAlerts, loadedDevices] = await Promise.all([
          fetchApi("/alerts"),
          fetchApi("/devices"),
        ]);
        if (active) {
          setAlerts(loadedAlerts);
          setDeviceStatus(loadedDevices[0]?.status || "offline");
          setError("");
        }
      } catch (requestError) {
        if (active) setError(requestError.message);
      }
    };

    loadData();
    const timer = setInterval(loadData, 15000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const filteredAlerts = useMemo(
    () =>
      alerts.filter((alert) => {
        const status = getAlertStatus(alert);
        const matchesDate =
          !selectedDate ||
          new Date(alert.createdAt).toISOString().slice(0, 10) === selectedDate;
        const matchesStatus = selectedStatus === "all" || status === selectedStatus;
        return matchesDate && matchesStatus;
      }),
    [alerts, selectedDate, selectedStatus],
  );
  const activeAlerts = filteredAlerts.filter((alert) => getAlertStatus(alert) !== "resolved");
  const criticalCount = alerts.filter(
    (alert) => alert.severity === "critical" && getAlertStatus(alert) !== "resolved",
  ).length;
  const warningCount = alerts.filter(
    (alert) => alert.severity === "warning" && getAlertStatus(alert) !== "resolved",
  ).length;
  const resolvedCount = alerts.filter((alert) => getAlertStatus(alert) === "resolved").length;

  const parameter = (alert) => {
    if (alert.alertType === "ph" || alert.title.toLowerCase().includes("ph")) return "pH";
    if (alert.alertType === "turbidity" || alert.title.toLowerCase().includes("turbidity")) return "Turbidity";
    if (alert.alertType === "temperature" || alert.title.toLowerCase().includes("temperature")) return "Temperature";
    return "Water Quality";
  };

  const updateStatus = async (alert, status) => {
    setBusyAlertId(alert._id);
    setActionError("");
    try {
      const updatedAlert = await fetchApi(`/alerts/${alert._id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setAlerts((current) =>
        current.map((item) => item._id === updatedAlert._id ? updatedAlert : item),
      );
    } catch (requestError) {
      setActionError(requestError.message);
    } finally {
      setBusyAlertId("");
    }
  };

  const exportHistory = () => {
    const headers = ["Date", "Time", "Location", "Parameter", "Severity", "Status", "Message"];
    const rows = filteredAlerts.map((alert) => {
      const date = new Date(alert.createdAt);
      return [
        date.toLocaleDateString(),
        date.toLocaleTimeString(),
        alert.location || "",
        parameter(alert),
        alert.severity,
        getAlertStatus(alert),
        alert.message,
      ];
    });
    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "alert-history.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen bg-[#03131D]">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-y-auto bg-[#03131D] p-4 sm:p-6 md:ml-20 md:p-8">
        <div className="mx-auto max-w-7xl">
          <Navbar />

          <header className="mb-8 mt-6 flex items-start gap-4">
            <div className="shrink-0 rounded-2xl bg-red-500/20 p-3 sm:p-4">
              <FaBell className="text-3xl text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">Water Quality Alerts</h1>
              <p className="mt-1 text-slate-400">
                Review active conditions, acknowledge alerts, and track when they are resolved.
              </p>
            </div>
          </header>

          {error && <p className="mb-5 text-sm text-red-400">{error}</p>}
          {actionError && <p className="mb-5 text-sm text-red-400">{actionError}</p>}

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <Summary label="Active Critical" value={criticalCount} icon={<FaExclamationTriangle className="text-red-400 text-xl" />} />
            <Summary label="Active Warnings" value={warningCount} icon={<FaBell className="text-yellow-400 text-xl" />} />
            <Summary label="Resolved Alerts" value={resolvedCount} icon={<FaCheckCircle className="text-green-400 text-xl" />} />
            <div className="rounded-2xl border border-cyan-900 bg-[#0B2233] p-5">
              <p className="text-sm text-slate-400">Sensor connection</p>
              <p className={`mt-3 font-semibold capitalize ${
                deviceStatus === "online"
                  ? "text-green-400"
                  : deviceStatus === "stale"
                    ? "text-yellow-400"
                    : "text-red-400"
              }`}>{deviceStatus}</p>
            </div>
          </div>

          <section className="mt-8 rounded-2xl border border-cyan-900 bg-[#0B2233] p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <FaFilter className="text-cyan-400" />
              <h2 className="text-xl font-semibold text-white">Filter alerts</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm text-slate-400">
                Date
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-[#081A28] px-4 py-3 text-white [color-scheme:dark]"
                />
              </label>
              <label className="text-sm text-slate-400">
                Lifecycle status
                <select
                  value={selectedStatus}
                  onChange={(event) => setSelectedStatus(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-[#081A28] px-4 py-3 text-white"
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="resolved">Resolved</option>
                </select>
              </label>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="mb-5 text-2xl font-semibold text-white">Open alerts</h2>
            <div className="space-y-4">
              {activeAlerts.map((alert) => (
                <article
                  key={alert._id}
                  className={`rounded-2xl border bg-[#0B2233] p-5 ${
                    alert.severity === "critical" ? "border-red-700" : "border-yellow-700"
                  }`}
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row">
                    <div>
                      <div className="flex items-center gap-2">
                        {parameter(alert) === "Temperature" && <FaThermometerHalf className="text-orange-400" />}
                        {parameter(alert) === "pH" && <FaTint className="text-green-400" />}
                        {parameter(alert) === "Turbidity" && <FaWater className="text-cyan-400" />}
                        <h3 className="text-lg font-semibold text-white">{alert.title}</h3>
                      </div>
                      <p className="mt-2 text-slate-300">{alert.message}</p>
                      <p className="mt-2 text-sm text-slate-400">
                        Location: {alert.location || "Unknown"} ·
                        {" "}{new Date(alert.createdAt).toLocaleString()}
                      </p>
                      <p className="mt-2 text-sm capitalize text-cyan-300">
                        {alert.severity} · {getAlertStatus(alert)}
                        {alert.acknowledgedAt && ` · acknowledged ${new Date(alert.acknowledgedAt).toLocaleString()}`}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-start gap-2">
                      {getAlertStatus(alert) === "active" && (
                        <button
                          onClick={() => updateStatus(alert, "acknowledged")}
                          disabled={busyAlertId === alert._id}
                          className="rounded-lg bg-yellow-500/20 px-4 py-2 text-sm font-semibold text-yellow-300 disabled:opacity-50"
                        >
                          Acknowledge
                        </button>
                      )}
                      <button
                        onClick={() => updateStatus(alert, "resolved")}
                        disabled={busyAlertId === alert._id}
                        className="rounded-lg bg-green-500/20 px-4 py-2 text-sm font-semibold text-green-300 disabled:opacity-50"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                </article>
              ))}
              {activeAlerts.length === 0 && (
                <p className="rounded-xl border border-slate-700 bg-[#0B2233] p-6 text-center text-slate-400">
                  No open alerts match these filters.
                </p>
              )}
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-cyan-900 bg-[#0B2233] p-4 sm:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">Alert history</h2>
                <p className="mt-1 text-sm text-slate-400">{filteredAlerts.length} alerts</p>
              </div>
              <button
                onClick={exportHistory}
                disabled={!filteredAlerts.length}
                className="rounded-xl bg-cyan-500/20 px-4 py-2 text-cyan-300 disabled:opacity-50"
              >
                Export history
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left">
                <thead className="border-b border-slate-700 text-slate-400">
                  <tr>
                    <th className="py-3">Detected</th>
                    <th>Location</th>
                    <th>Parameter</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Acknowledged</th>
                    <th>Resolved</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlerts.map((alert) => (
                    <tr key={alert._id} className="border-b border-slate-800 text-sm">
                      <td className="py-4 text-slate-300">{new Date(alert.createdAt).toLocaleString()}</td>
                      <td className="text-slate-300">{alert.location || "Unknown"}</td>
                      <td className="text-white">{parameter(alert)}</td>
                      <td className="capitalize text-slate-300">{alert.severity}</td>
                      <td className="capitalize text-cyan-300">{getAlertStatus(alert)}</td>
                      <td className="text-slate-400">
                        {alert.acknowledgedAt
                          ? new Date(alert.acknowledgedAt).toLocaleString()
                          : "—"}
                      </td>
                      <td className="text-slate-400">
                        {alert.resolvedAt ? new Date(alert.resolvedAt).toLocaleString() : "—"}
                      </td>
                      <td className="max-w-sm text-slate-300">{alert.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredAlerts.length === 0 && (
              <p className="py-8 text-center text-slate-400">No alerts match these filters.</p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function Summary({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-cyan-900 bg-[#0B2233] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{label}</p>
        {icon}
      </div>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

export default Alerts;
