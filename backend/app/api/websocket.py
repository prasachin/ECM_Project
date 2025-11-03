# from fastapi import APIRouter, WebSocket, WebSocketDisconnect
# from app.services.mock_generator import generate_data
# import json

# router = APIRouter()

# @router.websocket("/ws/telemetry")
# async def telemetry_ws(websocket: WebSocket):
#     await websocket.accept()
#     try:
#         async for data in generate_data():
#             await websocket.send_text(data.json())
#     except WebSocketDisconnect:
#         print("WebSocket disconnected")

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json

router = APIRouter()

clients = set()  # frontend clients to broadcast to

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

