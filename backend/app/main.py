from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# from app.api import websocket 
from app.services.mqtt_service import start_mqtt 

app = FastAPI(title="Energy Tracker Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# app.include_router(websocket.router) 

@app.on_event("startup")
async def startup_event():
    print("🚀 Starting MQTT client...")
    start_mqtt()

@app.get("/")
async def root():
    return {"message": "Energy Tracker Backend (MQTT mode) is running!"}
