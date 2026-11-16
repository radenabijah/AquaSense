import { useEffect, useState } from "react";
import Sidebar from "../components/SideBar";
import Navbar from "../components/Navbar";
import SensorCard from "../components/SensorCard";
import ChartCard from "../components/ChartCard";
import RecentAlerts from "../components/RecentAlerts";
import HistoricalRecordsPreview from "../components/HistoricalRecordsPreview";
import FishRecommendationPreview from "../components/FishRecommendationPreview";
import { fetchApi } from "../api";

const defaultThresholds = {
  temperatureMin: 24,
  temperatureMax: 30,
  phMin: 6.5,
  phMax: 8.5,
  turbidityMax: 25,
};

function getCondition(value, minimum, maximum) {
  if (value === undefined || value === null) return "No data";
  return value < minimum || value > maximum ? "Unsafe" : "Safe";
}

function Dashboard() {
  const [deviceStatus, setDeviceStatus] = useState("offline");
  const [waterData, setWaterData] = useState(null);
  const [settings, setSettings] = useState(defaultThresholds);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadDashboardData = async () => {
      try {
        const [latestWater, loadedDevices, loadedSettings] = await Promise.all([
          fetchApi("/water/latest"),
          fetchApi("/devices"),
          fetchApi("/settings"),
        ]);
        if (active) {
          setWaterData(latestWater);
          const currentDevice = loadedDevices.find(
            (device) => device.deviceId === latestWater?.deviceId,
          );
          setDeviceStatus(currentDevice?.status || "offline");
          setSettings(loadedSettings);
          setError("");
        }
      } catch (requestError) {
        if (active) setError(requestError.message);
      }
    };

    loadDashboardData();
    const refreshTimer = setInterval(loadDashboardData, 5000);
    return () => {
      active = false;
      clearInterval(refreshTimer);
    };
  }, []);

  const latestReading = waterData;
  const thresholdSettings = { ...defaultThresholds, ...settings };
  const statusColor =
    deviceStatus === "online"
      ? "text-green-400"
      : deviceStatus === "stale"
        ? "text-yellow-400"
        : "text-red-400";

  return (
    <div className="flex min-h-screen bg-[#03131D]">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-y-auto bg-[#03131D] p-4 sm:p-6 md:ml-20 md:p-8">
        <div className="mx-auto max-w-7xl">
          <Navbar showTitle showDashboardControls />

          <div className="mb-6 mt-6">
            <h2 className="text-2xl font-bold text-white">Water Quality Overview</h2>
            <p className="mt-1 text-slate-400">
              Monitor the latest water readings and connection health of your sensor.
            </p>
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
          </div>

          <section className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl border border-cyan-900 bg-[#0B2233] p-5">
            <div aria-live="polite">
              <span className="mr-2 text-sm text-slate-400">Floating Device:</span>
              <span className={`font-semibold capitalize ${statusColor}`}>{deviceStatus}</span>
            </div>
            <span className="text-xs text-slate-500">
              {latestReading
                ? `Last reading ${new Date(latestReading.receivedAt || latestReading.recordedAt).toLocaleString()}`
                : "No readings received yet"}
            </span>
            {latestReading?.isDelayed && (
              <span className="text-xs text-yellow-400">
                Latest stored reading was delayed; it may not reflect current conditions.
              </span>
            )}
          </section>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <SensorCard
              type="temperature"
              title="Temperature"
              value={latestReading?.temperature ?? "--"}
              unit="°C"
              status={getCondition(
                latestReading?.temperature,
                thresholdSettings.temperatureMin,
                thresholdSettings.temperatureMax,
              )}
            />
            <SensorCard
              type="ph"
              title="pH Level"
              value={latestReading?.ph ?? "--"}
              unit=""
              status={getCondition(latestReading?.ph, thresholdSettings.phMin, thresholdSettings.phMax)}
            />
            <SensorCard
              type="turbidity"
              title="Turbidity"
              value={latestReading?.turbidity ?? "--"}
              unit="NTU"
              status={
                latestReading
                  ? latestReading.turbidity > thresholdSettings.turbidityMax
                    ? "Unsafe"
                    : "Safe"
                  : "No data"
              }
            />
          </div>

          <div className="mt-8 grid items-stretch gap-5 lg:grid-cols-3">
            <RecentAlerts className="h-full flex flex-col" />
            <FishRecommendationPreview />
            <HistoricalRecordsPreview />
          </div>

          <div className="mt-8">
            <ChartCard />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
