import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { connectMQTT } from "../utils/mqttClient";

const DataContext = createContext();

export function useData() {
  return useContext(DataContext);
}

export function DataProvider({ children }) {
  const [devices, setDevices] = useState([]);
  const [selected, setSelected] = useState([]);
  const [dataMap, setDataMap] = useState({});

  const clientRef = useRef(null);

  useEffect(() => {
    // ✅ Use EMQX WebSocket URL (port 8083)
    // Example: ws://broker.emqx.io:8083/mqtt
    const mqttUrl = import.meta.env.VITE_MQTT_URL || "wss://broker.emqx.io:8084/mqtt";

    console.log("🌐 Connecting to MQTT broker:", mqttUrl);

    clientRef.current = connectMQTT(
      mqttUrl,
      {}, // options
      onMessage,
      () => {
        console.log("✅ MQTT connected to", mqttUrl);

        // ✅ Subscribe to ESP32 topic
        const topic = "devices/esp32-energy-meter-01/telemetry";
        try {
          clientRef.current.subscribe(topic, { qos: 0 }, (err) => {
            if (err) console.error("❌ MQTT subscribe error:", err);
            else console.log(`📡 Subscribed to topic: ${topic}`);
          });
        } catch (e) {
          console.error("❌ MQTT subscribe failed:", e);
        }
      },
      (err) => console.error("❌ MQTT error:", err)
    );

    // Cleanup on unmount
    return () => {
      if (clientRef.current) {
        console.log("🧹 Disconnecting MQTT client...");
        clientRef.current.end();
      }
    };
  }, []);

  // --- MQTT message handler ---
  function onMessage(topic, payloadBuffer) {
    try {
      // Convert payload to string and parse JSON
      const payloadStr =
        typeof payloadBuffer === "string"
          ? payloadBuffer
          : payloadBuffer.toString();

      const payload = JSON.parse(payloadStr);

      console.log("📩 Received MQTT Message:");
      console.log("   🏷️ Topic:", topic);
      console.log("   📦 Raw:", payloadStr);
      console.log("   🔍 Parsed:", payload);

      // Extract deviceId from topic path
      const deviceId = topic.split("/")[1] || "unknown";

      // Add device to list if new
      setDevices((prev) => {
        if (!prev.includes(deviceId)) return [...prev, deviceId];
        return prev;
      });

      // Store telemetry
      setDataMap((prev) => {
        const list = prev[deviceId] ? [...prev[deviceId]] : [];
        const maxPoints = 600;

        list.push({
          ts: payload.timestamp_ms || Date.now(),
          voltage_V: payload.voltage_V ?? null,
          current_A: payload.current_A ?? null,
          active_power_kW: payload.active_power_kW ?? null,
          total_active_energy_kWh: payload.total_active_energy_kWh ?? null,
          power_factor: payload.power_factor ?? null,
          frequency_Hz: payload.frequency_Hz ?? null,
        });

        if (list.length > maxPoints) list.splice(0, list.length - maxPoints);

        return { ...prev, [deviceId]: list };
      });
    } catch (e) {
      console.error("❌ Error parsing MQTT message:", e, payloadBuffer);
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

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}
