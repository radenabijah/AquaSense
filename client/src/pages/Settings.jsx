import Sidebar from "../components/SideBar";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { fetchApi } from "../api";
import {
  FaCog,
  FaThermometerHalf,
  FaTint,
  FaWater,
  FaBell,
  FaSatelliteDish,
  FaFlask,
  FaSave,
} from "react-icons/fa";

function Settings() {
  const [settings, setSettings] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchApi("/settings")
      .then(setSettings)
      .catch((requestError) => setError(requestError.message));
  }, []);

  const updateSetting = (field, value) => {
    setSettings((current) => ({ ...current, [field]: value }));
  };

  const saveSettings = async () => {
    try {
      const savedSettings = await fetchApi("/settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      });
      setSettings(savedSettings);
      setMessage("Settings saved successfully.");
      setError("");
    } catch (requestError) {
      setError(requestError.message);
      setMessage("");
    }
  };

  return (
    <div className="flex bg-[#03131D] min-h-screen">
      <Sidebar />

      <main className="min-w-0 flex-1 bg-[#03131D] p-4 overflow-y-auto sm:p-6 md:ml-20 md:p-8">
        <div className="max-w-7xl mx-auto">

          {/* Navbar */}
          <Navbar />

          {/* Header */}
          <div className="mt-6 mb-8 flex items-start gap-4">
            <div className="shrink-0 rounded-2xl bg-cyan-500/20 p-3 sm:p-4">
              <FaCog className="text-cyan-400 text-3xl" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                AquaSense Settings
              </h1>

              <p className="text-slate-400 mt-1">
                Configure monitoring thresholds, notifications, pH regulation,
                and floating platform settings.
              </p>
            </div>
          </div>

          {/* Water Quality Thresholds */}
          <div className="bg-[#0B2233] rounded-2xl p-6 border border-cyan-900 shadow-lg hover:border-cyan-400 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-cyan-500/20 p-3 rounded-xl">
                <FaWater className="text-cyan-400 text-xl" />
              </div>

              <h2 className="text-white text-xl font-semibold">
                Water Quality Thresholds
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">

              {/* Temperature */}
              <div className="bg-[#081A28] rounded-xl p-5 border border-slate-700 hover:border-cyan-500 transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <FaThermometerHalf className="text-orange-400" />
                  <p className="text-white font-semibold">Temperature (°C)</p>
                </div>

                <label className="text-slate-400 text-sm">Minimum</label>

                <input
                  type="number"
                  value={settings?.temperatureMin ?? ""}
                  onChange={(event) => updateSetting("temperatureMin", Number(event.target.value))}
                  className="w-full mt-2 mb-4 bg-[#03131D] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-cyan-500 outline-none"
                />

                <label className="text-slate-400 text-sm">Maximum</label>

                <input
                  type="number"
                  value={settings?.temperatureMax ?? ""}
                  onChange={(event) => updateSetting("temperatureMax", Number(event.target.value))}
                  className="w-full mt-2 bg-[#03131D] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-cyan-500 outline-none"
                />
              </div>

              {/* pH */}
              <div className="bg-[#081A28] rounded-xl p-5 border border-slate-700 hover:border-cyan-500 transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <FaTint className="text-green-400" />
                  <p className="text-white font-semibold">pH Level</p>
                </div>

                <label className="text-slate-400 text-sm">Minimum</label>

                <input
                  type="number"
                  step="0.1"
                  value={settings?.phMin ?? ""}
                  onChange={(event) => updateSetting("phMin", Number(event.target.value))}
                  className="w-full mt-2 mb-4 bg-[#03131D] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-cyan-500 outline-none"
                />

                <label className="text-slate-400 text-sm">Maximum</label>

                <input
                  type="number"
                  step="0.1"
                  value={settings?.phMax ?? ""}
                  onChange={(event) => updateSetting("phMax", Number(event.target.value))}
                  className="w-full mt-2 bg-[#03131D] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-cyan-500 outline-none"
                />
              </div>

              {/* Turbidity */}
              <div className="bg-[#081A28] rounded-xl p-5 border border-slate-700 hover:border-cyan-500 transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <FaWater className="text-cyan-400" />
                  <p className="text-white font-semibold">Turbidity (NTU)</p>
                </div>

                <label className="text-slate-400 text-sm">
                  Maximum Safe Value
                </label>

                <input
                  type="number"
                  value={settings?.turbidityMax ?? ""}
                  onChange={(event) => updateSetting("turbidityMax", Number(event.target.value))}
                  className="w-full mt-2 bg-[#03131D] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-cyan-500 outline-none"
                />

                <p className="text-slate-500 text-xs mt-3">
                  Alerts will trigger when turbidity exceeds this value.
                </p>
              </div>

            </div>
          </div>

          {/* Automated pH Regulation */}
          <div className="bg-[#0B2233] rounded-2xl p-6 border border-cyan-900 mt-8 shadow-lg hover:border-cyan-400 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-cyan-500/20 p-3 rounded-xl">
                <FaFlask className="text-cyan-400 text-xl" />
              </div>

              <h2 className="text-white text-xl font-semibold">
                Automated pH Regulation
              </h2>
            </div>

            <div className="space-y-5">

              <div className="flex justify-between items-center bg-[#081A28] p-4 rounded-xl border border-slate-700 hover:border-cyan-500 transition-all duration-300">
                <div>
                  <p className="text-white font-medium">
                    Enable Automatic Dosing Pump
                  </p>

                  <p className="text-slate-400 text-sm">
                    Automatically inject pH solution when water exceeds safe thresholds.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings?.automaticDosing ?? false}
                    onChange={(event) => updateSetting("automaticDosing", event.target.checked)}
                    className="sr-only peer"
                  />

                  <div className="w-12 h-6 bg-slate-700 rounded-full peer peer-checked:bg-cyan-500 transition-all"></div>

                  <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-6"></div>
                </label>
              </div>

              <div className="grid md:grid-cols-2 gap-5">

                <div>
                  <label className="text-slate-400 text-sm">
                    pH Target Value
                  </label>

                  <input
                    type="number"
                    step="0.1"
                    value={settings?.phTarget ?? ""}
                    onChange={(event) => updateSetting("phTarget", Number(event.target.value))}
                    className="w-full mt-2 bg-[#081A28] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-sm">
                    Dosing Interval (seconds)
                  </label>

                  <input
                    type="number"
                    value={settings?.dosingInterval ?? ""}
                    onChange={(event) => updateSetting("dosingInterval", Number(event.target.value))}
                    className="w-full mt-2 bg-[#081A28] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none"
                  />
                </div>

              </div>

            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-[#0B2233] rounded-2xl p-6 border border-cyan-900 mt-8 shadow-lg hover:border-cyan-400 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-cyan-500/20 p-3 rounded-xl">
                <FaBell className="text-cyan-400 text-xl" />
              </div>

              <h2 className="text-white text-xl font-semibold">
                Notification Settings
              </h2>
            </div>

            <div className="space-y-5">

              {[
                ["Dashboard Alert Notifications", "dashboardAlerts"],
                ["Critical Water Quality Alerts", "criticalAlerts"],
                ["Dosing Pump Activation Alerts", "dosingAlerts"],
                ["ESP32 Connection Notifications", "connectionAlerts"],
              ].map(([item, field]) => (
                <div
                  key={item}
                  className="flex justify-between items-center bg-[#081A28] p-4 rounded-xl border border-slate-700 hover:border-cyan-500 transition-all duration-300"
                >
                  <p className="text-white">{item}</p>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings?.[field] ?? false}
                      onChange={(event) => updateSetting(field, event.target.checked)}
                      className="sr-only peer"
                    />

                    <div className="w-12 h-6 bg-slate-700 rounded-full peer peer-checked:bg-cyan-500 transition-all"></div>

                    <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-6"></div>
                  </label>
                </div>
              ))}

            </div>
          </div>

          {/* Floating Platform Configuration */}
          <div className="bg-[#0B2233] rounded-2xl p-6 border border-cyan-900 mt-8 shadow-lg hover:border-cyan-400 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-cyan-500/20 p-3 rounded-xl">
                <FaSatelliteDish className="text-cyan-400 text-xl" />
              </div>

              <h2 className="text-white text-xl font-semibold">
                Floating Platform Configuration
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">

              <div>
                <label className="text-slate-400 text-sm">
                  Sampling Interval
                </label>

                <select
                  value={settings?.samplingInterval ?? "Every 5 Seconds"}
                  onChange={(event) => updateSetting("samplingInterval", event.target.value)}
                  className="w-full mt-2 bg-[#081A28] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none"
                >
                  <option>Every 5 Seconds</option>
                  <option>Every 10 Seconds</option>
                  <option>Every 30 Seconds</option>
                  <option>Every 1 Minute</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-sm">
                  Default Sampling Point
                </label>

                <select
                  value={settings?.samplingPoint ?? "Point A"}
                  onChange={(event) => updateSetting("samplingPoint", event.target.value)}
                  className="w-full mt-2 bg-[#081A28] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none"
                >
                  <option>Point A</option>
                  <option>Point B</option>
                  <option>Point C</option>
                  <option>Point D</option>
                </select>
              </div>

            </div>

            <div className="grid md:grid-cols-3 gap-5 mt-6">

              <div className="bg-[#081A28] rounded-xl p-5 border border-slate-700 text-center hover:border-cyan-500 transition-all duration-300">
                <p className="text-slate-400 text-sm">ESP32 Status</p>

                <h3 className="text-green-400 text-xl font-bold mt-2">
                  Connected
                </h3>
              </div>

              <div className="bg-[#081A28] rounded-xl p-5 border border-slate-700 text-center hover:border-cyan-500 transition-all duration-300">
                <p className="text-slate-400 text-sm">Wi-Fi Status</p>

                <h3 className="text-green-400 text-xl font-bold mt-2">
                  Connected
                </h3>
              </div>

              <div className="bg-[#081A28] rounded-xl p-5 border border-slate-700 text-center hover:border-cyan-500 transition-all duration-300">
                <p className="text-slate-400 text-sm">Battery Level</p>

                <h3 className="text-white text-xl font-bold mt-2">
                  92%
                </h3>
              </div>

            </div>
          </div>

          {/* Save Settings */}
          <div className="mt-8 flex justify-end">
            <div className="flex w-full flex-col items-stretch gap-4 sm:w-auto sm:flex-row sm:items-center">
              {error && <p className="text-red-400 text-sm">{error}</p>}
              {message && <p className="text-green-400 text-sm">{message}</p>}
              <button
                onClick={saveSettings}
                disabled={!settings}
                className="flex items-center justify-center gap-3 rounded-2xl bg-cyan-500 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-cyan-400 hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] disabled:cursor-not-allowed disabled:opacity-50"
              >
              <FaSave />
              Save Settings
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Settings;