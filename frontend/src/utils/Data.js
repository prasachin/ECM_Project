// utils/realtime.js
export function startRealtime(onMessage) {
  const ws = new WebSocket("ws://localhost:8000/ws/telemetry");

  ws.onopen = () => console.log("✅ WebSocket connected to backend");

  ws.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data);
      const topic = `devices/${payload.deviceId}/telemetry`;
      onMessage(topic, JSON.stringify(payload));
    } catch (e) {
      console.error("❌ Error parsing WebSocket data:", e);
    }
  };

  ws.onclose = () => console.log("🔌 WebSocket disconnected");
  ws.onerror = (err) => console.error("⚠️ WebSocket error:", err);

  return {
    stop() {
      ws.close();
    },
  };
}
