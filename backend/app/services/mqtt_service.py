# import json
# import paho.mqtt.client as mqtt

# BROKER = "broker.emqx.io"
# PORT = 8083
# PATH = "/mqtt"
# TOPIC = "devices/esp32-energy-meter-01/telemetry"  

# def on_connect(client, userdata, flags, reason_code, properties=None):
#     print("✅ Connected to MQTT broker over WebSocket")
#     print(f"🔔 Subscribing to topic: {TOPIC}")
#     client.subscribe(TOPIC)

# def on_message(client, userdata, msg):
#     try:
#         payload = msg.payload.decode()
#         print(f"\n📩 [MQTT] Topic: {msg.topic}")
#         print(f"📦 Raw Payload: {payload}")

#         data = json.loads(payload)
#         voltage = data.get("voltage_V")
#         current = data.get("current_A")
#         power = data.get("active_power_kW")
#         energy = data.get("total_active_energy_kWh")
#         freq = data.get("frequency_Hz")

#         print(
#             f"⚡ Energy Data | V={voltage:.2f} V | I={current:.2f} A | "
#             f"P={power:.2f} kW | E={energy:.2f} kWh | f={freq:.2f} Hz"
#         )

#     except Exception as e:
#         print("⚠️ Error decoding message:", e)

# def start_mqtt():
#     client = mqtt.Client(
#         client_id="fastapi_backend",
#         transport="websockets"
#     )
#     client.on_connect = on_connect
#     client.on_message = on_message

#     # Optional authentication if needed
#     # client.username_pw_set("username", "password")

#     print(f"🔗 Connecting to ws://{BROKER}:{PORT}{PATH}")
#     client.connect(BROKER, PORT, 60)
#     client.loop_start()
