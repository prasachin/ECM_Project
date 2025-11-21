import { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Chart from "chart.js/auto";

export default function ExportSection({ selected, themeStyles, dataMap }) {
  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(false);

  // ➤ ADDED — dropdown for choosing export type
  const [exportType, setExportType] = useState("pdf");

  async function fetchTelemetryData(start, end) {
    const baseUrl = "https://ecm-project-ws1b.onrender.com/telemetry";
    let dates = [];

    if (!end) {
      dates = [start];
    } else {
      const curr = new Date(start);
      while (curr <= end) {
        dates.push(new Date(curr));
        curr.setDate(curr.getDate() + 1);
      }
    }

    const allData = [];
    for (const d of dates) {
      const formatted = d.toLocaleDateString("en-CA");

      try {
        const res = await fetch(`${baseUrl}/${formatted}`);
        if (res.ok) {
          const doc = await res.json();
          allData.push(...(doc.data || []));
        }
      } catch (e) {
        console.warn("⚠️ Could not fetch", formatted);
      }
    }

    return allData;
  }

  // ➤ ADDED — CSV Export Logic
  async function exportCsv() {
    setLoading(true);
    setShowModal(false);

    const telemetryData = await fetchTelemetryData(startDate, endDate);
    if (!telemetryData.length) {
      alert("No data found for the selected range.");
      setLoading(false);
      return;
    }

    // List ALL fields you want in CSV
    const header = [
      "Date & Time",
      "Power(W)",
      "Energy(Wh)",
      "Voltage(V)",
      "Current(A)",
      "Reactive Power(kVAr)",
      "Apparent Power(kVA)",
      "Power Factor",
      "Import Active Energy(Wh)",
      "Export Active Energy(Wh)",
      "Total Reactive Energy(kVArh)",
      "Import Reactive Energy(kVArh)",
      "Export Reactive Energy(kVArh)",
      "Apparent Energy(kVAh)",
      "Max Demand Active(kW)",
      "Max Demand Reactive(kVAr)",
      "Max Demand Apparent(kVA)",
      "Device ID",
    ];

    const rows = telemetryData.map((e) => [
      e.timestamp ?? "",
      e.active_power_kW !== undefined
        ? (e.active_power_kW * 1000).toFixed(2)
        : "",
      e.total_active_energy_kWh !== undefined
        ? (e.total_active_energy_kWh * 1000).toFixed(2)
        : "",
      e.voltage_V ?? "",
      e.current_A ?? "",
      e.reactive_power_kVAr ?? "",
      e.apparent_power_kVA ?? "",
      e.power_factor ?? "",
      e.import_active_energy_kWh
        ? (e.import_active_energy_kWh * 1000).toFixed(2)
        : "",
      e.export_active_energy_kWh
        ? (e.export_active_energy_kWh * 1000).toFixed(2)
        : "",
      e.total_reactive_energy_kVArh ?? "",
      e.import_reactive_energy_kVArh ?? "",
      e.export_reactive_energy_kVArh ?? "",
      e.apparent_energy_kVAh ?? "",
      e.max_demand_active_power_kW ?? "",
      e.max_demand_reactive_power_kVAr ?? "",
      e.max_demand_apparent_power_kVA ?? "",
      e.deviceId ?? "",
    ]);

    let csv = header.join(",") + "\n";
    rows.forEach((r) => (csv += r.join(",") + "\n"));

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `energy-data-${Date.now()}.csv`;
    a.click();

    window.URL.revokeObjectURL(url);
    setLoading(false);
  }
  // (UNCHANGED) — PDF export
  async function exportPdf() {
    setLoading(true);
    setShowModal(false);

    const telemetryData = await fetchTelemetryData(startDate, endDate);
    if (!telemetryData.length) {
      alert("No data found for the selected range.");
      setLoading(false);
      return;
    }

    const grouped = telemetryData.reduce((acc, entry) => {
      const dateKey = new Date(
        entry.timestamp || entry.ts_ms
      ).toLocaleDateString("en-CA");

      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(entry);
      return acc;
    }, {});

    const doc = new jsPDF({ orientation: "landscape" });
    const now = new Date().toLocaleString();
    const dateKeys = Object.keys(grouped).sort();

    document.querySelectorAll(".temp-chart").forEach((el) => el.remove());

    for (let i = 0; i < dateKeys.length; i++) {
      const date = dateKeys[i];
      const entries = grouped[date];

      const canvas = document.createElement("canvas");
      canvas.className = "temp-chart";
      canvas.width = 800;
      canvas.height = 300;
      canvas.style.position = "absolute";
      canvas.style.left = "-9999px";
      document.body.appendChild(canvas);

      const ctx = canvas.getContext("2d");

      const labels = entries.map((e) =>
        e.timestamp ? new Date(e.timestamp).toLocaleTimeString() : e.ts_ms
      );
      const powerData = entries.map((e) => (e.active_power_kW ?? 0) * 1000);
      const energyData = entries.map(
        (e) => (e.total_active_energy_kWh ?? 0) * 1000
      );
      const voltageData = entries.map((e) => e.voltage_V ?? 0);
      const currentData = entries.map((e) => e.current_A ?? 0);

      if (Chart) {
        const chart = new Chart(ctx, {
          type: "line",
          data: {
            labels,
            datasets: [
              {
                label: "Power (W)",
                data: powerData,
                borderColor: "#3b82f6",
                borderWidth: 2,
                tension: 0.2,
                fill: false,
                pointRadius: 0,
                spanGaps: true,
              },
              {
                label: "Voltage (V)",
                data: voltageData,
                borderColor: "#f59e0b",
                borderWidth: 1.5,
                tension: 0.2,
                fill: false,
                pointRadius: 0,
                spanGaps: true,
              },
              {
                label: "Current (A)",
                data: currentData,
                borderColor: "#ef4444",
                borderWidth: 1.5,
                tension: 0.2,
                fill: false,
                pointRadius: 0,
                spanGaps: true,
              },
            ],
          },
          options: {
            responsive: false,
            animation: false,
            maintainAspectRatio: false,
            plugins: { legend: { position: "bottom" } },
          },
        });

        chart.render();
        await new Promise((r) => setTimeout(r, 300));
        const imgData = canvas.toDataURL("image/png", 1.0);

        if (i > 0) doc.addPage();

        doc.setFontSize(14);
        doc.text(`Energy Usage Report — ${date}`, 14, 16);
        doc.setFontSize(10);
        doc.text(`Generated: ${now}`, 14, 24);

        const pageWidth = doc.internal.pageSize.getWidth();
        const imageWidth = pageWidth - 28;
        const imageHeight = (canvas.height / canvas.width) * imageWidth;

        doc.addImage(imgData, "PNG", 14, 30, imageWidth, imageHeight);

        let y = 30 + imageHeight + 10;
        doc.setFontSize(11);
        doc.text(
          "For the entire data summary please export in the .csv format.",
          14,
          y
        );

        chart.destroy();
        canvas.remove();
      }
    }

    doc.save(
      `energy-report-${
        startDate ? startDate.toISOString().slice(0, 10) : "data"
      }${endDate ? "_to_" + endDate.toISOString().slice(0, 10) : ""}.pdf`
    );

    setLoading(false);
  }

  // ➤ ADDED — handles correct export type
  function handleExport() {
    if (exportType === "pdf") exportPdf();
    else exportCsv();
  }

  return (
    <div
      className={`${themeStyles.cardBg} rounded-lg border ${themeStyles.cardBorder} shadow-sm p-4 transition-colors duration-300`}
    >
      <h3
        className={`text-sm font-medium ${themeStyles.headingText} mb-3 transition-colors duration-300`}
      >
        Export Options
      </h3>

      {/* ➤ ADDED — Export Type Dropdown */}
      <select
        value={exportType}
        onChange={(e) => setExportType(e.target.value)}
        className={`w-full mb-3 px-3 py-2 border rounded-md bg-transparent cursor-pointer ${themeStyles.primaryText}`}
      >
        <option value="pdf" className="text-black">
          Export PDF
        </option>
        <option value="csv" className="text-black">
          Export CSV
        </option>
      </select>

      <button
        onClick={() => setShowModal(true)}
        disabled={loading}
        className={`w-full px-4 py-2 ${themeStyles.buttonPrimary} text-white rounded-lg cursor-pointer`}
      >
        {loading ? "Processing..." : `Export ${exportType.toUpperCase()}`}
      </button>

      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full`}
          >
            <h2 className="text-lg font-semibold mb-4 text-center text-white">
              Select Date Range
            </h2>

            <div className="flex flex-col gap-3 text-white">
              <label className="text-sm">Start Date</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                className="border rounded-md px-3 py-1 w-full"
                maxDate={new Date()}
                dateFormat="yyyy-MM-dd"
              />

              <label className="text-sm">End Date (optional)</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                className="border rounded-md px-3 py-1 w-full"
                minDate={startDate}
                maxDate={new Date()}
                dateFormat="yyyy-MM-dd"
              />
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm rounded-md border text-white cursor-pointer"
              >
                Cancel
              </button>

              {/* ➤ Updated export button uses handleExport() */}
              <button
                onClick={handleExport}
                className={`px-4 py-2 text-sm rounded-md ${themeStyles.buttonPrimary} text-white cursor-pointer`}
                disabled={!startDate}
              >
                Export {exportType.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
