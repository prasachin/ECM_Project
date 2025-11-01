import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { startRealtime } from "../utils/Data";

const DataContext = createContext();

export function useData() {
  return useContext(DataContext);
}

export function DataProvider({ children }) {
  const [devices, setDevices] = useState([]);
  const [selected, setSelected] = useState([]);
  const [dataMap, setDataMap] = useState({});
  const wsRef = useRef(null);

  useEffect(() => {
    wsRef.current = startRealtime(onMessage);

    return () => {
      if (wsRef.current) wsRef.current.stop();
    };
  }, []);

  function onMessage(topic, payloadStr) {
    try {
      const payload = JSON.parse(payloadStr);
      const deviceId = payload.deviceId || topic.split("/")[1] || "unknown";

      // ✅ Add device if new
      setDevices((prev) => {
        if (!prev.includes(deviceId)) return [...prev, deviceId];
        return prev;
      });

      // ✅ Store telemetry data
      setDataMap((prev) => {
        const list = prev[deviceId] ? [...prev[deviceId]] : [];
        const maxPoints = 600;

        list.push({
          ts: new Date(payload.ts).getTime(),
          power_w: payload.power_w ?? null,
          energy_wh: payload.energy_wh ?? null,
          co2_ppm: payload.co2_ppm ?? null,
        });

        if (list.length > maxPoints) list.splice(0, list.length - maxPoints);

        return { ...prev, [deviceId]: list };
      });
    } catch (e) {
      console.error("❌ Error processing message:", e, payloadStr);
    }
  }

  function toggleSelect(deviceId) {
    setSelected((prev) =>
      prev.includes(deviceId)
        ? prev.filter((d) => d !== deviceId)
        : [...prev, deviceId]
    );
  }

  const value = {
    devices,
    selected,
    dataMap,
    toggleSelect,
    setSelected,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
