import { useEffect, useState } from "react";
import Sidebar from "../components/SideBar";
import Navbar from "../components/Navbar";
import SensorCard from "../components/SensorCard";
import ChartCard from "../components/ChartCard";
import RecentAlerts from "../components/RecentAlerts";
import HistoricalRecordsPreview from "../components/HistoricalRecordsPreview";
import FishRecommendationPreview from "../components/FishRecommendationPreview";
import { fetchApi } from "../api";

function Dashboard() {
  const [waterData, setWaterData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadLatestWater = async () => {
      try {
        const latestWater = await fetchApi("/water/latest");
        if (active) {
          setWaterData(latestWater);
          setError("");
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message);
        }
      }
    };

    loadLatestWater();
    const refreshTimer = setInterval(loadLatestWater, 5000);

    return () => {
      active = false;
      clearInterval(refreshTimer);
    };
  }, []);

  return (
    <div className="flex bg-[#03131D] min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="min-w-0 flex-1 bg-[#03131D] p-4 overflow-y-auto sm:p-6 md:ml-20 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Navbar */}
          <Navbar showTitle showDashboardControls />

          {/* Welcome */}
          <div className="mt-6 mb-6">
            <h2 className="text-2xl font-bold text-white">
              Water Quality Overview
            </h2>

            <p className="text-slate-400 mt-1">
              Real-time monitoring of temperature, pH, and turbidity in the
              aquaculture pond.
            </p>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>

          {/* Sensor Cards */}
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <SensorCard
              type="temperature"
              title="Temperature"
              value={waterData?.temperature ?? "--"}
              unit="°C"
              status="Optimal"
            />

            <SensorCard
              type="ph"
              title="pH Level"
              value={waterData?.ph ?? "--"}
              unit=""
              status="Safe Range"
            />

            <SensorCard
              type="turbidity"
              title="Turbidity"
              value={waterData?.turbidity ?? "--"}
              unit="NTU"
              status="Clear Water"
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-5 mt-8 items-stretch">
            {/* Recent Alerts */}
            <RecentAlerts className="h-full flex flex-col" />

            {/* Fish Recommendation */}
            <FishRecommendationPreview />

            {/* Historical Records */}
            <HistoricalRecordsPreview />
          </div>

          {/* Water Quality Trend Chart */}
          <div className="mt-8">
            <ChartCard />
          </div>

        </div>
      </main>
    </div>
  );
}

export default Dashboard;