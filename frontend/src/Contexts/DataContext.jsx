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

      setDevices((prev) => {
        if (!prev.includes(deviceId)) return [...prev, deviceId];
        return prev;
      });

      const ts = Date.now();
      const power_w = (payload.active_power_kW ?? 0) * 1000; 
      const energy_wh = (payload.total_active_energy_kWh ?? 0) * 1000; 
      const emissionFactor = 0.82; 
      const co2_kg = (payload.total_active_energy_kWh ?? 0) * emissionFactor;
      const co2_ppm = co2_kg * 1000; 

      setDataMap((prev) => {
        const list = prev[deviceId] ? [...prev[deviceId]] : [];
        const maxPoints = 600;

        list.push({
          ts,
          power_w,
          energy_wh,
          co2_ppm,
          power_factor: payload.power_factor ?? null,
          pir_motion: payload.pir_motion ?? null,
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
