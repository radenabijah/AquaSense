import {
  FaHistory,
  FaThermometerHalf,
  FaTint,
  FaWater,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchApi } from "../api";

function HistoricalRecordsPreview() {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchApi("/water/history?limit=4")
      .then(setRecords)
      .catch((requestError) => setError(requestError.message));
  }, []);

  return (
    <div className="h-full flex flex-col bg-[#0B2233] rounded-2xl p-6 border border-cyan-900 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(34,211,238,0.18)]">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-cyan-500/20 p-3 rounded-xl">
          <FaHistory className="text-cyan-400 text-xl" />
        </div>

        <h3 className="text-white text-lg font-semibold">
          Historical Records
        </h3>
      </div>

      {/* Recent Records */}
      <div className="space-y-4 flex-1">
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {!error && records.length === 0 && (
          <p className="text-slate-400 text-sm">No historical readings available.</p>
        )}
        {records.map((record) => (
          <div
            key={record._id}
            className="h-[104px] bg-[#081A28] rounded-xl p-4 border border-slate-700 transition-all duration-300 hover:border-cyan-500 hover:bg-[#0B2233]"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-cyan-300 text-sm font-semibold">
                {new Date(record.recordedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>

              <span className="text-slate-500 text-xs">
                {new Date(record.recordedAt).toLocaleDateString()}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">

              <div>
                <FaThermometerHalf className="text-orange-400 mx-auto mb-1" />
                <p className="text-white text-xs font-medium">
                  {record.temperature}°C
                </p>
              </div>

              <div>
                <FaTint className="text-green-400 mx-auto mb-1" />
                <p className="text-white text-xs font-medium">
                  {record.ph}
                </p>
              </div>

              <div>
                <FaWater className="text-cyan-400 mx-auto mb-1" />
                <p className="text-white text-xs font-medium">
                  {record.turbidity} NTU
                </p>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Button */}
      <Link
        to="/historical-records"
        className="w-full mt-6 py-3 rounded-xl bg-cyan-500/20 text-cyan-300 font-semibold transition-all duration-300 hover:bg-cyan-500 hover:text-white hover:shadow-[0_0_20px_rgba(34,211,238,0.35)] text-center"
      >
        View Full History →
      </Link>
    </div>
  );
}

export default HistoricalRecordsPreview;