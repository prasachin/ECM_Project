import asyncio
import random
from datetime import datetime
from app.models.telemetry import TelemetryData

DEVICE_IDS = ["ac_room1", "fridge_1", "light_corridor", "fan_room2"]

async def generate_data():
    """Async generator yielding random telemetry data."""
    while True:
        for device_id in DEVICE_IDS:
            power = random.uniform(30, 1300 if device_id.startswith("ac") else 300)
            co2 = random.uniform(400, 1000)
            data = TelemetryData(
                deviceId=device_id,
                ts=datetime.utcnow(),
                power_w=round(power, 2),
                energy_wh=round(power / 3600, 2),
                co2_ppm=round(co2, 2),
            )
            yield data
        await asyncio.sleep(1)
