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
