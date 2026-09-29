import Sidebar from "../components/SideBar";
import Navbar from "../components/Navbar";
import SensorCard from "../components/SensorCard";
import { useEffect, useState } from "react";
import { fetchApi } from "../api";
import {
  FaFish,
  FaCheckCircle,
  FaThermometerHalf,
  FaTint,
  FaWater,
} from "react-icons/fa";

const formatRange = ([minimum, maximum], unit = "") =>
  `${minimum}${unit} – ${maximum}${unit}`;

function FishRecommendation() {
  const [currentWater, setCurrentWater] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadCurrentWater = async () => {
      try {
        const result = await fetchApi("/fish-recommendations");
        if (active) {
          setCurrentWater(result.water);
          setRecommendations(result.recommendations);
          setError("");
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message);
        }
      }
    };

    loadCurrentWater();
    const refreshTimer = setInterval(loadCurrentWater, 15000);

    return () => {
      active = false;
      clearInterval(refreshTimer);
    };
  }, []);

  return (
    <div className="flex bg-[#03131D] min-h-screen">
      <Sidebar />

      <main className="min-w-0 flex-1 bg-[#03131D] p-4 overflow-y-auto sm:p-6 md:ml-20 md:p-8">
        <div className="max-w-7xl mx-auto">

          {/* Navbar */}
          <Navbar />

          {/* Page Header */}
          <div className="mt-6 mb-8 flex items-start gap-4">
            <div className="shrink-0 rounded-2xl bg-cyan-500/20 p-3 sm:p-4">
              <FaFish className="text-cyan-400 text-3xl" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                Fish Recommendation
              </h1>

              <p className="text-slate-400 mt-1">
                Recommended fish species based on the current water quality
                conditions measured by AquaSense.
              </p>
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>
          </div>

          {/* Current Water Quality Summary */}
          <div className="bg-[#0B2233] rounded-2xl p-6 border border-cyan-900 shadow-lg hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(34,211,238,0.18)] transition-all duration-300">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-cyan-500/20 p-3 rounded-xl">
                <FaWater className="text-cyan-400 text-xl" />
              </div>

              <h2 className="text-white text-xl font-semibold">
                Current Water Quality Summary
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <SensorCard
                type="temperature"
                title="Temperature"
                value={currentWater?.temperature ?? "--"}
                unit="°C"
                status="Optimal"
              />
              <SensorCard
                type="ph"
                title="pH Level"
                value={currentWater?.ph ?? "--"}
                unit=""
                status="Safe Range"
              />
              <SensorCard
                type="turbidity"
                title="Turbidity"
                value={currentWater?.turbidity ?? "--"}
                unit="NTU"
                status="Clear Water"
              />
            </div>
          </div>

          {/* Recommended Fish */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-6">
              <FaCheckCircle className="text-green-400 text-xl" />

              <h2 className="text-white text-2xl font-semibold">
                Recommended Fish Species
              </h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">

              {recommendations.map((fish) => {
                return (
                <div
                  key={fish.name}
                  className="bg-[#0B2233] rounded-2xl p-6 border border-cyan-900 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(34,211,238,0.18)] cursor-pointer"
                >
                  <div className="mb-5 text-left">
                    <div className="flex flex-col items-start gap-2">
                      <h3 className="text-white text-xl font-bold text-left">
                        {fish.name}
                      </h3>

                      <span
                        className={`${
                          fish.status === "Recommended"
                            ? "bg-green-500/20 text-green-400"
                            : fish.status === "Needs Adjustment"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                        } px-3 py-1 rounded-full text-xs font-semibold text-left`}
                      >
                        {fish.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-300 text-sm leading-relaxed mb-5 text-left">
                    {fish.reason}
                  </p>

                  <div className="grid grid-cols-1 gap-3 text-center sm:grid-cols-3">

                    <div className="bg-[#081A28] rounded-xl p-3 border border-slate-700">
                      <FaThermometerHalf className="text-orange-400 mx-auto mb-2" />

                      <p className="text-slate-400 text-xs">Temperature</p>

                      <p className="text-white text-xs font-semibold mt-1">
                        {formatRange(fish.temperature, "°C")}
                      </p>
                    </div>

                    <div className="bg-[#081A28] rounded-xl p-3 border border-slate-700">
                      <FaTint className="text-green-400 mx-auto mb-2" />

                      <p className="text-slate-400 text-xs">pH</p>

                      <p className="text-white text-xs font-semibold mt-1">
                        {formatRange(fish.ph)}
                      </p>
                    </div>

                    <div className="bg-[#081A28] rounded-xl p-3 border border-slate-700">
                      <FaWater className="text-cyan-400 mx-auto mb-2" />

                      <p className="text-slate-400 text-xs">Turbidity</p>

                      <p className="text-white text-xs font-semibold mt-1">
                        {`< ${fish.turbidity} NTU`}
                      </p>
                    </div>

                  </div>
                </div>
                );
              })}

            </div>
          </div>

          {/* Recommendation Logic */}
          <div className="mt-8 bg-[#0B2233] rounded-2xl p-6 border border-cyan-900 shadow-lg">
            <h2 className="text-white text-xl font-semibold mb-4">
              How AquaSense Generates Fish Recommendations
            </h2>

            <div className="space-y-4 text-slate-300 leading-relaxed">

              <p>
                AquaSense compares the measured water quality parameters with
                predefined aquaculture standards stored in the system database.
              </p>

              <p>
                The recommendation module evaluates the temperature, pH, and
                turbidity ranges required by each fish species.
              </p>

              <p>
                Fish species whose required ranges match the measured water
                quality conditions are labeled as <span className="text-green-400 font-semibold">Recommended</span>.
              </p>

              <p>
                If one or more parameters fall outside the preferred range,
                AquaSense displays <span className="text-yellow-400 font-semibold">Needs Adjustment</span> or{" "}
                <span className="text-red-400 font-semibold">Not Recommended</span>,
                together with the reason.
              </p>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default FishRecommendation;