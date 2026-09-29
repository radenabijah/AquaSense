import { FaCheckCircle, FaTint, FaThermometerHalf, FaWater } from "react-icons/fa";

function WaterStatus() {
  return (
    <div className="bg-[#0B2233] rounded-2xl p-6 border border-cyan-900 shadow-lg h-full">

      <div className="flex items-center justify-between mb-5">
        <h3 className="text-white text-xl font-semibold">
          Current Water Status
        </h3>

        <FaCheckCircle className="text-green-400 text-2xl" />
      </div>

      <div className="bg-green-500/10 border border-green-500 rounded-xl p-4 mb-5">
        <p className="text-green-400 font-bold text-lg">
          SAFE FOR AQUACULTURE
        </p>

        <p className="text-green-300 text-sm mt-1">
          All monitored parameters are within the acceptable range.
        </p>
      </div>

      <div className="space-y-4 text-slate-300">

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FaThermometerHalf className="text-orange-400" />
            Temperature
          </div>

          <span className="text-white font-semibold">28.4°C</span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FaTint className="text-green-400" />
            pH
          </div>

          <span className="text-white font-semibold">7.2</span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FaWater className="text-sky-400" />
            Turbidity
          </div>

          <span className="text-white font-semibold">13 NTU</span>
        </div>

      </div>

      <div className="mt-8">
        <p className="text-slate-500 text-xs">
          Last updated: Just now
        </p>
      </div>

    </div>
  );
}

export default WaterStatus;