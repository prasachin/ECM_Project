import React, { useMemo, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import "chartjs-adapter-date-fns";
ChartJS.register(
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title
);

export default function EnergyChart({ seriesData, isDarkMode }) {
  const chartRef = useRef(null);
  const [metric, setMetric] = useState("power_w");

  const datasets = useMemo(() => {
    const colors = [
      "#1f77b4",
      "#ff7f0e",
      "#2ca02c",
      "#d62728",
      "#9467bd",
      "#8c564b",
      "#e377c2",
      "#7f7f7f",
    ];
    return Object.keys(seriesData).map((deviceId, i) => {
      const points = seriesData[deviceId] || [];
      return {
        label: deviceId,
        data: points.map((p) => ({ x: p.ts, y: p[metric] })),
        tension: 0.2,
        borderColor: colors[i % colors.length],
        backgroundColor: "rgba(0,0,0,0)",
        borderWidth: 2,
        pointRadius: 0,
      };
    });
  }, [seriesData, metric]);

  const data = { datasets };

  const options = {
    animation: false,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text:
          metric === "power_w"
            ? "Power (W) over time"
            : "Power Factor over time",
      },
    },
    scales: {
      x: {
        type: "time",
        time: { unit: "minute", tooltipFormat: "PPpp" },
        ticks: { maxRotation: 0 },
      },
      y: {
        title: {
          display: true,
          text: metric === "power_w" ? "Power (W)" : "Power Factor",
        },
        beginAtZero: true,
        suggestedMax: metric === "power_factor" ? 1 : undefined,
      },
    },
  };

  const buttonClasses = `absolute top-2 right-2 text-sm px-3 py-1 rounded-md border -mt-9  ${
    isDarkMode
      ? "bg-gray-700 text-gray-100 border-gray-600 hover:bg-gray-600"
      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
  } shadow-sm cursor-pointer transition-colors duration-200`;

  function toggleMetric() {
    setMetric((prev) => (prev === "power_w" ? "power_factor" : "power_w"));
  }

  const currentLabel =
    metric === "power_w"
      ? "Show Power Factor Vs Time"
      : "Show Power (W) Vs Time";

  return (
    <div style={{ height: 360 }} className="relative">
      <button onClick={toggleMetric} className={buttonClasses}>
        {currentLabel}
      </button>
      <Line ref={chartRef} data={data} options={options} />
      {metric === "power_factor" &&
        datasets.every((ds) => ds.data.every((pt) => pt.y == null)) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              No power factor data available.
            </p>
          </div>
        )}
    </div>
  );
}
