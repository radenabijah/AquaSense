import Sidebar from "../components/SideBar";
import Navbar from "../components/Navbar";
import SensorCard from "../components/SensorCard";
import { useEffect, useState } from "react";
import { fetchApi } from "../api";
import {
  FaFish,
  FaInfoCircle,
  FaThermometerHalf,
  FaTint,
  FaWater,
} from "react-icons/fa";

const formatRange = ([minimum, maximum], unit = "") =>
  `${minimum}${unit} – ${maximum}${unit}`;

const statusClass = {
  Recommended: "bg-green-500/20 text-green-400",
  "Needs Adjustment": "bg-yellow-500/20 text-yellow-400",
  "Confirm Salinity": "bg-yellow-500/20 text-yellow-400",
  "Not Recommended": "bg-red-500/20 text-red-400",
  "Waiting for reading": "bg-slate-500/20 text-slate-300",
};

function FishRecommendation() {
  const [currentWater, setCurrentWater] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [catalogueInitialized, setCatalogueInitialized] = useState(false);
  const [error, setError] = useState("");
  const recommendationGroups = ["Freshwater", "Brackish water"].map((pondType) => ({
    pondType,
    fish: recommendations.filter(
      (fish) => fish.pondType === pondType && fish.matchesWaterQuality,
    ),
  }));

  useEffect(() => {
    let active = true;
    const loadCurrentWater = async () => {
      try {
        const result = await fetchApi("/fish-recommendations");
        if (active) {
          setCurrentWater(result.water);
          setRecommendations(result.recommendations);
          setCatalogueInitialized(result.catalogueInitialized);
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
                Philippine-Native Pond Fish
              </h1>

              <p className="text-slate-400 mt-1">
                See which Philippine-native pond species match the latest
                measured water conditions.
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
                status={currentWater ? "Latest reading" : "No data"}
              />
              <SensorCard
                type="ph"
                title="pH Level"
                value={currentWater?.ph ?? "--"}
                unit=""
                status={currentWater ? "Latest reading" : "No data"}
              />
              <SensorCard
                type="turbidity"
                title="Turbidity"
                value={currentWater?.turbidity ?? "--"}
                unit="NTU"
                status={currentWater ? "Latest reading" : "No data"}
              />
            </div>
          </div>

          <aside className="mt-8 rounded-2xl border border-yellow-700 bg-yellow-500/10 p-5 text-yellow-100">
            <div className="flex items-start gap-3">
              <FaInfoCircle className="mt-1 shrink-0 text-yellow-300" />
              <p className="text-sm leading-relaxed">
                Native to the Philippines does not mean found only here. These
                preliminary matches compare temperature, pH, and turbidity
                with screening ranges. Salinity is not measured, so brackish
                species require confirmation. Verify pond conditions and
                local BFAR guidance before stocking.
              </p>
            </div>
          </aside>

          {/* Philippine-native pond fish */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-white text-2xl font-semibold">
                Philippine-Native Pond Species
              </h2>
            </div>

            {!catalogueInitialized && !error && (
              <p className="mb-6 rounded-xl border border-yellow-700 bg-yellow-500/10 p-4 text-sm text-yellow-100">
                The fish catalogue is empty. From the server folder, run{" "}
                <code className="font-semibold">npm run seed:fish</code> to
                add the pond species to MongoDB.
              </p>
            )}
            {!currentWater && catalogueInitialized && !error && (
              <p className="mb-6 rounded-xl border border-slate-700 bg-[#0B2233] p-4 text-sm text-slate-300">
                Waiting for a sensor reading. Matching species will appear
                here after a reading is received.
              </p>
            )}
            {currentWater && recommendations.every((fish) => !fish.matchesWaterQuality) && (
              <p className="mb-6 rounded-xl border border-slate-700 bg-[#0B2233] p-4 text-sm text-slate-300">
                No species currently match all measured water values.
              </p>
            )}
            <div className="space-y-8">
              {recommendationGroups.map(({ pondType, fish: fishInGroup }) => (
                <section key={pondType}>
                  <h3 className="mb-4 text-xl font-semibold text-white">
                    {pondType}
                  </h3>
                  {fishInGroup.length === 0 ? (
                    <p className="text-sm text-slate-400">
                      No species in this group match the current readings.
                    </p>
                  ) : (
                    <div className="grid gap-6 lg:grid-cols-2">
                      {fishInGroup.map((fish) => (
                        <article
                          key={fish.name}
                          className="rounded-2xl border border-cyan-900 bg-[#0B2233] p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(34,211,238,0.18)]"
                        >
                          <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                              <h4 className="text-xl font-bold text-white">{fish.name}</h4>
                              <p className="mt-1 text-sm italic text-slate-400">
                                {fish.scientificName}
                              </p>
                            </div>
                            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusClass[fish.status] || statusClass["Waiting for reading"]}`}>
                              {fish.status}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed text-slate-300">
                            {fish.reason}
                          </p>
                          <p className="mt-3 text-xs leading-relaxed text-slate-400">
                            {fish.distribution}
                          </p>
                          <div className="mt-5 grid grid-cols-1 gap-3 text-center sm:grid-cols-3">
                            <div className="rounded-xl border border-slate-700 bg-[#081A28] p-3">
                              <FaThermometerHalf className="mx-auto mb-2 text-orange-400" />
                              <p className="text-xs text-slate-400">Temperature</p>
                              <p className="mt-1 text-xs font-semibold text-white">
                                {formatRange(fish.temperature, "°C")}
                              </p>
                            </div>
                            <div className="rounded-xl border border-slate-700 bg-[#081A28] p-3">
                              <FaTint className="mx-auto mb-2 text-green-400" />
                              <p className="text-xs text-slate-400">pH</p>
                              <p className="mt-1 text-xs font-semibold text-white">
                                {formatRange(fish.ph)}
                              </p>
                            </div>
                            <div className="rounded-xl border border-slate-700 bg-[#081A28] p-3">
                              <FaWater className="mx-auto mb-2 text-cyan-400" />
                              <p className="text-xs text-slate-400">Turbidity</p>
                              <p className="mt-1 text-xs font-semibold text-white">
                                ≤ {fish.turbidity} NTU
                              </p>
                            </div>
                          </div>
                          <a
                            href={fish.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-4 inline-block text-sm font-semibold text-cyan-300 underline hover:text-white"
                          >
                            View species reference
                          </a>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>
          </div>

          {/* Recommendation Logic */}
          <div className="mt-8 bg-[#0B2233] rounded-2xl p-6 border border-cyan-900 shadow-lg">
            <h2 className="text-white text-xl font-semibold mb-4">
              How AquaSense Generates Fish Recommendations
            </h2>

            <div className="space-y-4 text-slate-300 leading-relaxed">

              <p>
                Each card compares the latest reading with that species'
                screening ranges. A freshwater species is marked{" "}
                <span className="font-semibold text-green-400">Recommended</span>{" "}
                when the three measured values fit. A brackish-water match is
                marked <span className="font-semibold text-yellow-400">Confirm Salinity</span>{" "}
                because the current hardware does not measure salinity.
              </p>
              <p>
                These are preliminary screening ranges, not a guarantee of
                successful culture. The list is selected rather than
                exhaustive; native means naturally occurring in the
                Philippines, not necessarily endemic.
              </p>
              <p>
                Distribution and culture references are linked on each
                species. The{" "}
                <a
                  href="https://www.fao.org/fishery/culturedspecies/en"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-cyan-300 underline hover:text-white"
                >
                  FAO Cultured Aquatic Species Information Programme
                </a>{" "}
                is a global aquaculture reference, not a Philippines-only
                species list.
              </p>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default FishRecommendation;