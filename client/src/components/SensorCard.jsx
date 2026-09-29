import { FaTemperatureHigh, FaTint, FaWater } from "react-icons/fa";

function SensorCard({ type, title, value, unit, status }) {
  const config = {
    temperature: {
      icon: <FaTemperatureHigh />,
      color: "text-orange-400",
      bg: "bg-orange-500/20",
    },
    ph: {
      icon: <FaTint />,
      color: "text-green-400",
      bg: "bg-green-500/20",
    },
    turbidity: {
      icon: <FaWater />,
      color: "text-cyan-400",
      bg: "bg-cyan-500/20",
    },
  };

  const sensor = config[type];

  return (
    <div className="font-semibold bg-[#0B2233] rounded-2xl p-6 border border-cyan-900 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(34,211,238,0.18)] cursor-pointer">
      <div className="flex justify-between items-center mb-5">
        <div>
          <p className="text-white text-sm">{title}</p>

          <h2 className="text-4xl font-bold text-white mt-2">
            {value}
            <span className="text-xl ml-1">{unit}</span>
          </h2>
        </div>

        <div className={`${sensor.bg} p-4 rounded-xl`}>
          <div className={`${sensor.color} text-2xl`}>{sensor.icon}</div>
        </div>
      </div>

      <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-semibold">
        {status}
      </span>
    </div>
  );
}

export default SensorCard;