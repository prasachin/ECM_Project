from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import app.services.database as db
from fastapi import HTTPException
import json

router = APIRouter()

clients = set()

@router.websocket("/ws/telemetry")
async def telemetry_ws(websocket: WebSocket):
    await websocket.accept()
    print("✅ WebSocket connected")

    clients.add(websocket)

    try:
        while True:
            msg = await websocket.receive_text()
            print("📥 Raw message:", msg)

            try:
                data = json.loads(msg)
                print("📦 Parsed JSON:", data)

                await db.save_telemetry(data)

            except json.JSONDecodeError:
                print("⚠️ Received non-JSON message")

            for client in clients:
                if client != websocket:
                    try:
                        await client.send_text(msg)
                    except Exception:
                        pass

    except WebSocketDisconnect:
        print("❌ WebSocket disconnected")
        clients.remove(websocket)


@router.get("/telemetry/{date}")
async def get_telemetry_by_date(date: str):
    """
    Retrieve telemetry data for a given date (YYYY-MM-DD)
    """
    doc = await db.telemetry_collection.find_one({"date": date}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="No data found for that date")
    return doc