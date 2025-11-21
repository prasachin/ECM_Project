import React from "react";
import { useData } from "../Contexts/DataContext";

export default function DeviceSelector({ isDarkMode = false }) {
  const { devices, selected, toggleSelect, setSelected } = useData();

  const themeStyles = {
    cardBg: isDarkMode ? "bg-gray-800" : "bg-white",
    cardBorder: isDarkMode ? "border-gray-700" : "border-gray-200",
    headingText: isDarkMode ? "text-gray-100" : "text-gray-800",
    primaryText: isDarkMode ? "text-gray-200" : "text-gray-800",
    mutedText: isDarkMode ? "text-gray-400" : "text-gray-500",
    emptyText: isDarkMode ? "text-gray-400" : "text-gray-500",
    buttonBg: isDarkMode
      ? "bg-gray-700 hover:bg-gray-600 border-gray-600"
      : "bg-gray-100 hover:bg-gray-200 border-gray-300",
    buttonText: isDarkMode ? "text-gray-200" : "text-gray-700",
    hrColor: isDarkMode ? "border-gray-600" : "border-gray-200",
    checkboxAccent: isDarkMode
      ? "text-blue-400 focus:ring-blue-400"
      : "text-blue-600 focus:ring-blue-500",
  };

  return (
    <div
      className={`${themeStyles.cardBg} rounded-lg border ${themeStyles.cardBorder} shadow-sm p-4 transition-colors duration-300 `}
    >
      <h3
        className={`text-lg font-semibold ${themeStyles.headingText} mb-0 transition-colors duration-300`}
      >
        Appliances
      </h3>
      <div className="mt-3">
        {devices.length === 0 && (
          <div
            className={`${themeStyles.emptyText} text-sm transition-colors duration-300`}
          >
            No devices yet (waiting for MQTT or mock data)
          </div>
        )}
        {devices.map((id) => (
          <div
            className="flex justify-between items-center mb-2 last:mb-0"
            key={id}
          >
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(id)}
                onChange={() => toggleSelect(id)}
                className={`rounded border-gray-300 ${themeStyles.checkboxAccent} transition-colors duration-300`}
              />
              <span
                className={`${themeStyles.primaryText} transition-colors duration-300`}
              >
                {id}
              </span>
            </label>
            <small
              className={`${themeStyles.mutedText} text-xs transition-colors duration-300`}
            >
              live
            </small>
          </div>
        ))}
      </div>
      <hr
        className={`my-4 ${themeStyles.hrColor} transition-colors duration-300`}
      />
      <div className="flex gap-2">
        <button
          className={`px-3 py-1.5 text-sm ${themeStyles.buttonBg} ${themeStyles.buttonText} rounded border transition-colors duration-200`}
          onClick={() => setSelected([])}
        >
          Clear
        </button>
        <button
          className={`px-3 py-1.5 text-sm ${themeStyles.buttonBg} ${themeStyles.buttonText} rounded border transition-colors duration-200`}
          onClick={() => setSelected([...devices])}
        >
          Select All
        </button>
      </div>
    </div>
  );
}
