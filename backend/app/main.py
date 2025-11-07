from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import websocket
from app.services.database import connect_to_mongo, close_mongo_connection

app = FastAPI(title="Energy Tracker Backend")



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(websocket.router)

@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()

@app.get("/")
async def root():
    return {"message": "Energy Tracker Backend is running!"}
