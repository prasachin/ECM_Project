from pydantic import BaseModel
from typing import Literal
from datetime import datetime

class TelemetryData(BaseModel):
    deviceId: str
    ts: datetime
    power_w: float
    energy_wh: float
    co2_ppm: float
