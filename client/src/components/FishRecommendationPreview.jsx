import { FaFish } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchApi } from "../api";

function FishRecommendationPreview() {
  const [fishList, setFishList] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const loadRecommendations = async () => {
      try {
        const result = await fetchApi("/fish-recommendations");
        if (active) {
          setFishList(
            result.recommendations
              .filter((fish) => fish.matchesWaterQuality)
              .slice(0, 4),
          );
          setError("");
        }
      } catch (requestError) {
        if (active) setError(requestError.message);
      }
    };

    loadRecommendations();
    const timer = setInterval(loadRecommendations, 15000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="h-full flex flex-col bg-[#0B2233] rounded-2xl p-6 border border-cyan-900 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(34,211,238,0.18)]">

      <div className="flex items-center gap-3 mb-6">
        <div className="bg-cyan-500/20 p-3 rounded-xl">
          <FaFish className="text-cyan-400 text-xl" />
        </div>

        <h3 className="text-white text-lg font-semibold">
          Philippine-Native Pond Fish
        </h3>
      </div>

      <div className="flex-1 space-y-4">
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {!error && fishList.length === 0 && (
          <p className="text-slate-400 text-sm">
            No species currently match the measured water values.
          </p>
        )}
        {fishList.map((fish) => (
          <div
            key={fish.name}
            className="h-[104px] flex flex-col bg-[#081A28] rounded-xl p-4 border border-slate-700 transition-all duration-300 hover:border-cyan-500 hover:bg-[#0B2233]"
          >
            <div className="flex justify-between items-center mb-2">
              <p className="text-white font-semibold">{fish.name}</p>

              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  fish.status === "Recommended"
                    ? "bg-green-500/20 text-green-400"
                    : fish.status === "Needs Adjustment" || fish.status === "Confirm Salinity"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : fish.status === "Not Recommended"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-slate-500/20 text-slate-300"
                }`}
              >
                {fish.status}
              </span>
            </div>

            <p className="text-slate-400 text-sm mt-auto pt-2">
              {fish.scientificName} · {fish.pondType}
            </p>
          </div>
        ))}
      </div>

      <Link
        to="/fish-recommendation"
        className="block w-full mt-6 py-3 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-white transition font-semibold text-center"
      >
        View Native Pond Fish →
      </Link>

    </div>
  );
}

export default FishRecommendationPreview;