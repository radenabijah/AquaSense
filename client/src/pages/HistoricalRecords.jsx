import Sidebar from "../components/SideBar";
import Navbar from "../components/Navbar";
import ChartCard from "../components/ChartCard";
import { useEffect, useState } from "react";
import { fetchApi } from "../api";
import {
  FaHistory,
  FaThermometerHalf,
  FaTint,
  FaWater,
  FaDatabase,
} from "react-icons/fa";

const PAGE_SIZE = 25;

function HistoricalRecords() {
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
    averages: {},
  });
  const [page, setPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const query = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
    });
    if (selectedDate) query.set("date", selectedDate);

    fetchApi(`/water/history?${query}`)
      .then((result) => {
        if (active) {
          setRecords(result.items);
          setPagination(result.pagination);
          setError("");
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      });

    return () => {
      active = false;
    };
  }, [page, selectedDate]);

  const exportData = () => {
    const headers = [
      "Date",
      "Time",
      "Location",
      "Temperature (C)",
      "pH",
      "Turbidity (NTU)",
      "Reading Status",
    ];
    const rows = records.map((record) => [
      new Date(record.recordedAt).toLocaleDateString(),
      new Date(record.recordedAt).toLocaleTimeString(),
      record.location || "",
      record.temperature,
      record.ph,
      record.turbidity,
      record.isDelayed ? "Delayed" : "Recorded",
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "water-quality-records.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const average = (field) =>
    pagination.averages[field] === null || pagination.averages[field] === undefined
      ? "--"
      : Number(pagination.averages[field]).toFixed(1);
  return (
    <div className="flex min-h-screen bg-[#03131D]">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-y-auto bg-[#03131D] p-4 sm:p-6 md:ml-20 md:p-8">
        <div className="mx-auto max-w-7xl">
          <Navbar />

          <div className="mb-6 mt-6 flex items-start gap-4">
            <div className="shrink-0 rounded-2xl bg-cyan-500/20 p-3 sm:p-4">
              <FaHistory className="text-2xl text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">Historical Records</h1>
              <p className="mt-1 text-slate-400">
                Browse and export recorded water-quality readings.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <Summary label="Matching Records" value={pagination.total} icon={<FaDatabase className="text-cyan-400 text-xl" />} />
            <Summary label="Average Temperature" value={`${average("temperature")}°C`} icon={<FaThermometerHalf className="text-orange-400 text-xl" />} />
            <Summary label="Average pH" value={average("ph")} icon={<FaTint className="text-green-400 text-xl" />} />
            <Summary label="Average Turbidity" value={`${average("turbidity")} NTU`} icon={<FaWater className="text-cyan-400 text-xl" />} />
          </div>

          <div className="mt-8 rounded-2xl border border-cyan-900 bg-[#0B2233] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(34,211,238,0.18)]">
            <h2 className="mb-5 text-lg font-semibold text-white">Filter readings</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm text-slate-400">
                Date (UTC)
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => {
                    setPage(1);
                    setSelectedDate(event.target.value);
                  }}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-[#081A28] px-4 py-3 text-white [color-scheme:dark]"
                />
              </label>
              <div className="flex items-end">
                <button
                  onClick={exportData}
                  disabled={!records.length}
                  className="w-full rounded-xl bg-cyan-500/20 px-4 py-3 font-semibold text-cyan-300 hover:bg-cyan-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Export This Page
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <ChartCard date={selectedDate} />
          </div>

          <section className="mt-8 rounded-2xl border border-cyan-900 bg-[#0B2233] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(34,211,238,0.18)] sm:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">Water Quality Record History</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Showing {records.length ? (page - 1) * PAGE_SIZE + 1 : 0}–
                  {(page - 1) * PAGE_SIZE + records.length} of {pagination.total}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1}
                  className="rounded-lg bg-cyan-500/20 px-4 py-2 text-cyan-300 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-300">
                  Page {page} of {Math.max(pagination.totalPages, 1)}
                </span>
                <button
                  onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}
                  disabled={page >= pagination.totalPages}
                  className="rounded-lg bg-cyan-500/20 px-4 py-2 text-cyan-300 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>

            {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="border-b border-slate-700 text-slate-400">
                  <tr>
                    <th className="py-3">Recorded</th>
                    <th>Location</th>
                    <th className="text-center">Temperature</th>
                    <th className="text-center">pH</th>
                    <th className="text-center">Turbidity</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record._id} className="border-b border-slate-800 text-sm transition-colors hover:bg-[#102B3D]">
                      <td className="py-4 text-slate-300">
                        {new Date(record.recordedAt).toLocaleString()}
                      </td>
                      <td className="text-slate-300">{record.location || "Unknown"}</td>
                      <td className="text-center text-orange-400">{record.temperature}°C</td>
                      <td className="text-center text-green-400">{record.ph}</td>
                      <td className="text-center text-cyan-400">{record.turbidity} NTU</td>
                      <td>
                        <span className={record.isDelayed ? "text-yellow-400" : "text-green-400"}>
                          {record.isDelayed ? "Delayed" : "Recorded"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!error && records.length === 0 && (
              <p className="py-8 text-center text-slate-400">No readings match these filters.</p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function Summary({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-cyan-900 bg-[#0B2233] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(34,211,238,0.18)]">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{label}</p>
        {icon}
      </div>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

export default HistoricalRecords;
