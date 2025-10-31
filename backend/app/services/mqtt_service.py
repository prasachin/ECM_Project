# backend/app/services/mqtt_service.py
import json
import websocket

BROKER_URL = "ws://broker.emqx.io:8083/mqtt"

def on_message(ws, message):
    try:
        print("📩 Raw message:", message)
        data = json.loads(message)
        topic = data.get("topic")
        payload = data.get("payload", {})

        if isinstance(payload, str):
            payload = json.loads(payload)

        device_id = payload.get("device_id", "unknown")
        voltage = payload.get("voltage_V")
        current = payload.get("current_A")
        power = payload.get("active_power_kW")
        energy = payload.get("total_active_energy_kWh")
        freq = payload.get("frequency_Hz")

        print(f"[{device_id}] V={voltage} V | I={current} A | P={power} kW | E={energy} kWh | f={freq} Hz")

    except Exception as e:
        print("⚠️ Error decoding message:", e)

def on_error(ws, error):
    print("❌ WebSocket Error:", error)

def on_close(ws, code, msg):
    print(f"🔌 Connection closed ({code}): {msg}")

def on_open(ws):
    print("✅ Connected to WebSocket broker (8083)")

def start_mqtt():
    """Entry point to start WebSocket-based MQTT listener."""
    print(f"🔗 Connecting to {BROKER_URL}")
    ws = websocket.WebSocketApp(
        BROKER_URL,
        on_open=on_open,
        on_message=on_message,
        on_error=on_error,
        on_close=on_close,
    )
    ws.run_forever()
