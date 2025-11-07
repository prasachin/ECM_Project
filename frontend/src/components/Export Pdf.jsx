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

  async function fetchTelemetryData(start, end) {
    const baseUrl = "http://localhost:8000/telemetry";
    let dates = [];

    // If end date not selected → single date export
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

      console.log("Fetching data for", formatted);
      try {
        const res = await fetch(`${baseUrl}/${formatted}`);
        if (res.ok) {
          const doc = await res.json();
          allData.push(...(doc.data || []));
        }
      } catch (e) {
        console.warn("⚠️ Could not fetch data for", formatted);
      }
    }

    return allData;
  }

  async function exportPdf() {
    setLoading(true);
    setShowModal(false);

    const telemetryData = await fetchTelemetryData(startDate, endDate);
    console.log("Fetched telemetry data:", telemetryData);
    if (!telemetryData.length) {
      alert("No data found for the selected range.");
      setLoading(false);
      return;
    }

    // Group data by date
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

    // 🧹 Cleanup any leftover temp canvases
    document.querySelectorAll(".temp-chart").forEach((el) => el.remove());

    for (let i = 0; i < dateKeys.length; i++) {
      const date = dateKeys[i];
      const entries = grouped[date];

      // 🖼️ Create an offscreen canvas for the chart
      const canvas = document.createElement("canvas");
      canvas.className = "temp-chart";
      canvas.width = 800;
      canvas.height = 300;
      canvas.style.position = "absolute";
      canvas.style.left = "-9999px";
      canvas.style.top = "0";
      document.body.appendChild(canvas);
      const ctx = canvas.getContext("2d");

      // 📊 Generate the chart
      const labels = entries.map((e) =>
        e.timestamp ? new Date(e.timestamp).toLocaleTimeString() : e.ts_ms
      );
      const powerData = entries.map((e) => (e.active_power_kW ?? 0) * 1000); // → W
      const energyData = entries.map(
        (e) => (e.total_active_energy_kWh ?? 0) * 1000
      ); // → Wh
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
                backgroundColor: "#3b82f6",
                borderWidth: 2,
                tension: 0.2,
                fill: false,
                pointRadius: 0,
                pointHoverRadius: 4,
                pointBackgroundColor: "#3b82f6",
                spanGaps: true,
              },
              {
                label: "Energy (Wh)",
                data: energyData,
                borderColor: "#22c55e",
                backgroundColor: "#22c55e",
                borderWidth: 2,
                tension: 0.2,
                fill: false,
                pointRadius: 0,
                pointHoverRadius: 4,
                pointBackgroundColor: "#22c55e",
                spanGaps: true,
              },
              {
                label: "Voltage (V)",
                data: voltageData,
                borderColor: "#f59e0b",
                backgroundColor: "#f59e0b",
                borderWidth: 1.5,
                tension: 0.2,
                fill: false,
                pointRadius: 0,
                pointHoverRadius: 4,
                pointBackgroundColor: "#f59e0b",
                spanGaps: true,
              },
              {
                label: "Current (A)",
                data: currentData,
                borderColor: "#ef4444",
                backgroundColor: "#ef4444",
                borderWidth: 1.5,
                tension: 0.2,
                fill: false,
                pointRadius: 0,
                pointHoverRadius: 4,
                pointBackgroundColor: "#ef4444",
                spanGaps: true,
              },
            ],
          },
          options: {
            animation: false,
            responsive: false,
            maintainAspectRatio: false,
            scales: {
              x: {
                title: { display: true, text: "Time" },
                ticks: { maxTicksLimit: 8 },
              },
              y: {
                title: { display: true, text: "Values" },
              },
            },
            plugins: {
              legend: { position: "bottom" },
              title: {
                display: true,
                text: `Energy Usage — ${date}`,
                font: { size: 14 },
              },
            },
            elements: {
              line: { borderJoinStyle: "round", borderCapStyle: "round" },
            },
          },
        });
        chart.render();

        // 🕒 Wait briefly to ensure canvas pixels are available
        await new Promise((r) => setTimeout(r, 300));

        // 🧾 Capture chart image
        const imgData = canvas.toDataURL("image/png", 1.0);

        // 🗒️ Add a new page (except first)
        if (i > 0) doc.addPage();

        // 🧠 PDF header
        doc.setFontSize(14);
        doc.text(`Energy Usage Report — ${date}`, 14, 16);
        doc.setFontSize(10);
        doc.text(`Generated: ${now}`, 14, 24);

        // 📈 Chart image
        const pageWidth = doc.internal.pageSize.getWidth();
        const imageWidth = pageWidth - 28;
        const imageHeight = (canvas.height / canvas.width) * imageWidth;
        doc.addImage(
          imgData,
          "PNG",
          14,
          30,
          imageWidth,
          imageHeight,
          undefined,
          "FAST"
        );

        // 📋 Data summary below
        let y = 30 + imageHeight + 10;
        doc.setFontSize(11);
        doc.text("Telemetry Data Summary", 14, y);
        y += 6;
        doc.setFontSize(9);

        // By default show all entries in the summary (paginated). If you want
        // to limit the number of lines in the generated PDF, change MAX_SUMMARY_LINES.
        const MAX_SUMMARY_LINES = 1000; // safety cap
        const summaryEntries = entries.slice(0, Math.min(entries.length, MAX_SUMMARY_LINES));

        summaryEntries.forEach((entry, idx) => {
          const line = `${idx + 1}. Power: ${
            entry.active_power_kW
              ? (entry.active_power_kW * 1000).toFixed(2)
              : "—"
          } W | Energy: ${
            entry.total_active_energy_kWh
              ? (entry.total_active_energy_kWh * 1000).toFixed(2)
              : "—"
          } Wh | Voltage: ${entry.voltage_V ?? "—"} V | Current: ${
            entry.current_A ?? "—"
          } A | Time: ${
            entry.timestamp
              ? new Date(entry.timestamp).toLocaleTimeString()
              : "—"
          }`;
          doc.text(line, 14, y);
          y += 6;
          if (y > 180) {
            doc.addPage();
            y = 14;
          }
        });

        chart.destroy();
        canvas.remove();
      } else {
        console.error(
          "⚠️ Chart.js not found — please import it before using exportPdf()"
        );
      }
    }

    // 💾 Save final report
    doc.save(
      `energy-report-${
        startDate ? startDate.toISOString().slice(0, 10) : "data"
      }${endDate ? "_to_" + endDate.toISOString().slice(0, 10) : ""}.pdf`
    );

    setLoading(false);
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
      <button
        onClick={() => setShowModal(true)}
        disabled={loading}
        className={`w-full px-4 cursor-pointer py-2 ${themeStyles.buttonPrimary} disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg border border-transparent transition-colors duration-200 flex items-center justify-center gap-2`}
      >
        {loading ? (
          "Generating PDF..."
        ) : (
          <>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export PDF Report
          </>
        )}
      </button>
      {/* {selected.length === 0 && (
        <p
          className={`text-xs ${themeStyles.mutedText} mt-2 transition-colors duration-300`}
        >
          Select devices to enable export
        </p>
      )} */}

      {/* 🗓️ Date range modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full`}
          >
            <h2 className="text-lg font-semibold mb-4 text-center">
              Select Date Range
            </h2>

            <div className="flex flex-col gap-3 text-white">
              <label className="text-sm">Start Date</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => {
                  setStartDate(date);
                  console.log("Start date set to", date);
                }}
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
                className="px-4 py-2 text-sm rounded-md border"
              >
                Cancel
              </button>
              <button
                onClick={exportPdf}
                className={`px-4 py-2 text-sm rounded-md ${themeStyles.buttonPrimary} text-white`}
                disabled={!startDate}
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
