export function startRealtime(onMessage) {
  const ws = new WebSocket("ws://localhost:8000/ws/telemetry");

  ws.onmessage = (event) => {
    const payload = JSON.parse(event.data);
    const topic = `devices/${payload.deviceId}/telemetry`;
    onMessage(topic, JSON.stringify(payload));
  };

  ws.onclose = () => console.log("WebSocket disconnected");
  ws.onerror = (err) => console.error("WebSocket error:", err);

  return {
    stop() {
      ws.close();
    },
  };
}
