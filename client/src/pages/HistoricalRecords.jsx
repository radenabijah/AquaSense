import Sidebar from "../components/SideBar";
import Navbar from "../components/Navbar";
import ChartCard from "../components/ChartCard";
import { useEffect, useState } from "react";
import { fetchApi } from "../api";
import {
  FaHistory,
  FaSearch,
  FaThermometerHalf,
  FaTint,
  FaWater,
  FaDatabase,
} from "react-icons/fa";

function HistoricalRecords() {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedParameter, setSelectedParameter] = useState("All Parameters");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchApi("/water/history")
      .then((readings) => {
        setRecords(readings);
        setFilteredRecords(readings);
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  const average = (field) =>
    filteredRecords.length
      ? (
          filteredRecords.reduce((total, record) => total + record[field], 0) /
          filteredRecords.length
        ).toFixed(1)
      : "--";

  const applyFilters = () => {
    setFilteredRecords(
      records.filter((record) => {
        const matchesDate =
          !selectedDate ||
          new Date(record.recordedAt).toISOString().slice(0, 10) === selectedDate;
        const matchesParameter =
          selectedParameter === "All Parameters" ||
          record[selectedParameter.toLowerCase()];

        return matchesDate && matchesParameter;
      }),
    );
  };

  const exportData = () => {
    const headers = ["Date", "Time", "Location", "Temperature", "pH", "Turbidity"];
    const rows = filteredRecords.map((record) => [
      new Date(record.recordedAt).toLocaleDateString(),
      new Date(record.recordedAt).toLocaleTimeString(),
      record.location || "Point A",
      `${record.temperature}°C`,
      record.ph,
      `${record.turbidity} NTU`,
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

  return (
    <div className="flex bg-[#03131D] min-h-screen">
      <Sidebar />

      <main className="min-w-0 flex-1 bg-[#03131D] p-4 overflow-y-auto sm:p-6 md:ml-20 md:p-8">
        <div className="max-w-7xl mx-auto">

          <Navbar />

          {/* Page Header */}
          <div className="mt-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="shrink-0 rounded-2xl bg-cyan-500/20 p-3 sm:p-4">
                <FaHistory className="text-cyan-400 text-2xl" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-white sm:text-3xl">
                  Historical Records
                </h1>

                <p className="text-slate-400 mt-1">
                  View and analyze previously recorded water quality readings from the aquaculture pond.
                </p>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">

            <div className="bg-[#0B2233] rounded-2xl p-5 border border-cyan-900 hover:border-cyan-400 transition-all duration-300">
              <div className="flex justify-between items-center">
                <p className="text-slate-400 text-sm">Total Records</p>
                <FaDatabase className="text-cyan-400 text-xl" />
              </div>

              <h2 className="text-3xl text-white font-bold mt-3">
                {records.length}
              </h2>
            </div>

            <div className="bg-[#0B2233] rounded-2xl p-5 border border-cyan-900 hover:border-cyan-400 transition-all duration-300">
              <div className="flex justify-between items-center">
                <p className="text-slate-400 text-sm">Average Temperature</p>
                <FaThermometerHalf className="text-orange-400 text-xl" />
              </div>

              <h2 className="text-3xl text-white font-bold mt-3">
                {average("temperature")}°C
              </h2>
            </div>

            <div className="bg-[#0B2233] rounded-2xl p-5 border border-cyan-900 hover:border-cyan-400 transition-all duration-300">
              <div className="flex justify-between items-center">
                <p className="text-slate-400 text-sm">Average pH</p>
                <FaTint className="text-green-400 text-xl" />
              </div>

              <h2 className="text-3xl text-white font-bold mt-3">
                {average("ph")}
              </h2>
            </div>

            <div className="bg-[#0B2233] rounded-2xl p-5 border border-cyan-900 hover:border-cyan-400 transition-all duration-300">
              <div className="flex justify-between items-center">
                <p className="text-slate-400 text-sm">Average Turbidity</p>
                <FaWater className="text-cyan-400 text-xl" />
              </div>

              <h2 className="text-3xl text-white font-bold mt-3">
                {average("turbidity")} NTU
              </h2>
            </div>
            {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

          </div>

          {/* Filters */}
          <div className="bg-[#0B2233] rounded-2xl p-6 border border-cyan-900 mt-8">
            <div className="flex items-center gap-3 mb-5">
              <FaSearch className="text-cyan-400" />
              <h3 className="text-white text-lg font-semibold">
                Filter Historical Records
              </h3>
            </div>

            <div className="grid md:grid-cols-3 gap-4">

              <div className="bg-[#081A28] rounded-xl px-4 py-3 flex items-center gap-3 border border-slate-700 hover:border-cyan-500 transition">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  aria-label="Filter records by date"
                  className="bg-transparent outline-none text-white w-full cursor-pointer [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
              </div>

              <select
                value={selectedParameter}
                onChange={(event) => setSelectedParameter(event.target.value)}
                className="bg-[#081A28] rounded-xl px-4 py-3 text-white border border-slate-700 hover:border-cyan-500 transition"
              >
                <option>All Parameters</option>
                <option>Temperature</option>
                <option>pH</option>
                <option>Turbidity</option>
              </select>

              <button
                onClick={applyFilters}
                className="rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-white transition font-semibold"
              >
                Apply Filters
              </button>

            </div>
          </div>

          {/* Trend Chart */}
          <div className="mt-8">
            <ChartCard />
          </div>

          {/* Records Table */}
          <div className="mt-8 rounded-2xl border border-cyan-900 bg-[#0B2233] p-4 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(34,211,238,0.18)] sm:p-6">
            <div className="mb-5 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-white text-xl font-semibold">
                Water Quality Record History
              </h3>

              <button
                onClick={exportData}
                disabled={!filteredRecords.length}
                className="rounded-xl bg-cyan-500/20 px-4 py-2 text-cyan-300 transition hover:bg-cyan-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Export Data
              </button>
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full table-fixed text-left">
                <colgroup>
                  <col className="w-[14%]" />
                  <col className="w-[15%]" />
                  <col className="w-[15%]" />
                  <col className="w-[16%]" />
                  <col className="w-[16%]" />
                  <col className="w-[16%]" />
                  <col className="w-[8%]" />
                </colgroup>

                <thead className="text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-3">Date</th>
                    <th className="px-3">Time</th>
                    <th className="px-3">Location</th>
                    <th className="px-3 text-center">Temperature</th>
                    <th className="px-3 text-center">pH</th>
                    <th className="px-3 text-center">Turbidity</th>
                    <th className="px-3 text-center">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRecords.map((record) => (
                    <tr
                      key={record._id}
                      className="border-b border-slate-800 hover:bg-[#081A28] transition-all duration-300"
                    >
                      <td className="py-4 px-3 text-white whitespace-nowrap">
                        {new Date(record.recordedAt).toLocaleDateString()}
                      </td>
                      <td className="px-3 text-slate-300 whitespace-nowrap">
                        {new Date(record.recordedAt).toLocaleTimeString()}
                      </td>

                      <td className="px-3 text-slate-300 whitespace-nowrap">
                        {record.location || "Point A"}
                      </td>

                      <td className="px-3 text-center text-orange-400 font-medium whitespace-nowrap">
                        {record.temperature}°C
                      </td>

                      <td className="px-4 text-center text-green-400 font-medium whitespace-nowrap">
                        {record.ph}
                      </td>

                      <td className="px-4 text-center text-cyan-400 font-medium whitespace-nowrap">
                        {record.turbidity} NTU
                      </td>

                      <td className="px-3 text-center">
                        <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-semibold">
                          Safe
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {filteredRecords.map((record) => (
                <article
                  key={record._id}
                  className="rounded-xl border border-slate-700 bg-[#081A28] p-4"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Recorded
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {new Date(record.recordedAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(record.recordedAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-400">
                      Safe
                    </span>
                  </div>

                  <p className="mb-3 text-xs text-slate-500">
                    Location: <span className="text-slate-300">{record.location || "Point A"}</span>
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-[#0B2233] p-3 text-center">
                      <p className="text-xs text-slate-500">Temperature</p>
                      <p className="mt-1 text-sm font-semibold text-orange-400">
                        {record.temperature}°C
                      </p>
                    </div>
                    <div className="rounded-lg bg-[#0B2233] p-3 text-center">
                      <p className="text-xs text-slate-500">pH</p>
                      <p className="mt-1 text-sm font-semibold text-green-400">
                        {record.ph}
                      </p>
                    </div>
                    <div className="rounded-lg bg-[#0B2233] p-3 text-center">
                      <p className="text-xs text-slate-500">Turbidity</p>
                      <p className="mt-1 text-sm font-semibold text-cyan-400">
                        {record.turbidity} NTU
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {!error && !filteredRecords.length && (
              <p className="py-8 text-center text-slate-400">
                No records match the selected filters.
              </p>
            )}

          </div>

        </div>
      </main>
    </div>
  );
}

export default HistoricalRecords;