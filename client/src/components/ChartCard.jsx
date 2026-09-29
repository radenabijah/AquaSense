import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import { fetchApi } from "../api";

function ChartCard() {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchApi("/water/history?limit=20")
      .then((readings) =>
        setData(
          readings
            .slice()
            .reverse()
            .map((reading) => ({
              ...reading,
              time: new Date(reading.recordedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            })),
        ),
      )
      .catch((requestError) => setError(requestError.message));
  }, []);

  return (
    <div className="bg-[#0B2233] rounded-2xl p-6 border border-cyan-900 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(34,211,238,0.18)]">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-white text-xl font-semibold">
            Water Quality Trend
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            Temperature, pH, and Turbidity over time.
          </p>
          {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
        </div>

        <span className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full text-xs font-semibold">
          Live
        </span>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#1E293B" strokeDasharray="4 4" />

            <XAxis dataKey="time" stroke="#94A3B8" />

            <YAxis stroke="#94A3B8" />

            <Tooltip
              contentStyle={{
                background: "#081A28",
                border: "1px solid #22D3EE",
                borderRadius: "12px",
                color: "#fff",
              }}
            />

            <Legend wrapperStyle={{ color: "#fff" }} />

            {/* Temperature */}
            <Line
              type="monotone"
              dataKey="temperature"
              name="Temperature (°C)"
              stroke="#FB923C"
              strokeWidth={3}
              dot={{ fill: "#FB923C", r: 4 }}
            />

            {/* pH */}
            <Line
              type="monotone"
              dataKey="ph"
              name="pH Level"
              stroke="#22C55E"
              strokeWidth={3}
              dot={{ fill: "#22C55E", r: 4 }}
            />

            {/* Turbidity */}
            <Line
              type="monotone"
              dataKey="turbidity"
              name="Turbidity (NTU)"
              stroke="#22D3EE"
              strokeWidth={3}
              dot={{ fill: "#22D3EE", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ChartCard;