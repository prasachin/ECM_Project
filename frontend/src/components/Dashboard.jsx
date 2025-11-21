import React, { useMemo, useRef } from "react";
import DeviceSelector from "./DeviceSelector";
import EnergyChart from "./EnergyChart";
import DataTable from "./DataTable";
import { useData } from "../Contexts/DataContext";
import ExportSection from "./Export Pdf";

export default function Dashboard({ isDarkMode = false }) {
  const { selected, dataMap } = useData();

  const series = useMemo(() => {
    const obj = {};
    selected.forEach((id) => {
      obj[id] = dataMap[id] || [];
    });
    return obj;
  }, [selected, dataMap]);

  const themeStyles = {
    mainBg: isDarkMode ? "bg-gray-900" : "bg-gray-50",
    cardBg: isDarkMode ? "bg-gray-800" : "bg-white",
    cardBorder: isDarkMode ? "border-gray-700" : "border-gray-200",

    primaryText: isDarkMode ? "text-gray-100" : "text-gray-900",
    secondaryText: isDarkMode ? "text-gray-300" : "text-gray-600",
    mutedText: isDarkMode ? "text-gray-400" : "text-gray-500",
    headingText: isDarkMode ? "text-gray-100" : "text-gray-800",

    buttonPrimary: isDarkMode
      ? "bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600"
      : "bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300",

    emptyStateBg: isDarkMode ? "bg-gray-700" : "bg-gray-50",
    emptyStateBorder: isDarkMode ? "border-gray-600" : "border-gray-300",
    emptyStateIcon: isDarkMode ? "text-gray-500" : "text-gray-400",
    emptyStateText: isDarkMode ? "text-gray-300" : "text-gray-500",
    emptyStateHeading: isDarkMode ? "text-gray-200" : "text-gray-900",
  };

  return (
    <div
      className={`min-h-screen ${themeStyles.mainBg} p-4 lg:p-6 transition-colors duration-300`}
    >
      <div className="max-w-[90vw] mx-auto">
        <div className="mb-6">
          <h1
            className={`text-5xl font-bold ${themeStyles.primaryText} mb-2 flex items-center justify-center transition-colors duration-300`}
          >
            Energy Dashboard
          </h1>
          <p
            className={`${themeStyles.secondaryText} text-2xl flex items-center justify-center transition-colors duration-300`}
          >
            Monitor and analyze your appliance energy consumption in real-time
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 justify-between gap-6">
          <div className="lg:col-span-4 xl:col-span-3 space-y-4 ">
            <DeviceSelector isDarkMode={isDarkMode} />
            <div
              className={`${themeStyles.cardBg} rounded-lg border ${themeStyles.cardBorder} shadow-sm p-4 transition-colors duration-300`}
            >
              <ExportSection
                selected={selected}
                themeStyles={themeStyles}
                isDarkMode={isDarkMode}
              />
            </div>

            <div
              className={`${themeStyles.cardBg} rounded-lg border ${themeStyles.cardBorder} shadow-sm p-4 transition-colors duration-300`}
            >
              <h3
                className={`text-sm font-medium ${themeStyles.headingText} mb-3 transition-colors duration-300`}
              >
                Quick Stats
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span
                    className={`text-xs ${themeStyles.mutedText} transition-colors duration-300`}
                  >
                    Selected Devices
                  </span>
                  <span
                    className={`text-sm font-medium ${themeStyles.primaryText} transition-colors duration-300`}
                  >
                    {selected.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span
                    className={`text-xs ${themeStyles.mutedText} transition-colors duration-300`}
                  >
                    Total Available
                  </span>
                  <span
                    className={`text-sm font-medium ${themeStyles.primaryText} transition-colors duration-300`}
                  >
                    {Object.keys(dataMap).length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            <div
              className={`${themeStyles.cardBg} rounded-lg border ${themeStyles.cardBorder} shadow-sm p-6 transition-colors duration-300`}
            >
              <div className="mb-4">
                <h2
                  className={`text-lg font-semibold ${themeStyles.headingText} transition-colors duration-300`}
                >
                  Energy Consumption Chart
                </h2>
                <p
                  className={`text-sm ${themeStyles.secondaryText} mt-1 transition-colors duration-300`}
                >
                  Real-time energy monitoring across selected devices
                </p>
              </div>
              {selected.length === 0 ? (
                <div
                  className={`flex items-center justify-center h-64 ${themeStyles.emptyStateBg} rounded-lg border-2 border-dashed ${themeStyles.emptyStateBorder} transition-colors duration-300`}
                >
                  <div className="text-center">
                    <svg
                      className={`w-12 h-12 ${themeStyles.emptyStateIcon} mx-auto mb-4 transition-colors duration-300`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    <h3
                      className={`text-lg font-medium ${themeStyles.emptyStateHeading} mb-2 transition-colors duration-300`}
                    >
                      No Devices Selected
                    </h3>
                    <p
                      className={`${themeStyles.emptyStateText} transition-colors duration-300`}
                    >
                      Select one or more appliances from the sidebar to view
                      energy data
                    </p>
                  </div>
                </div>
              ) : (
                <EnergyChart seriesData={series} isDarkMode={isDarkMode} />
              )}
            </div>
            <DataTable isDarkMode={isDarkMode} />
          </div>
        </div>
      </div>
    </div>
  );
}
