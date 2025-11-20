from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

from app.api import websocket
from app.services.database import connect_to_mongo, close_mongo_connection

app = FastAPI(title="Energy Tracker Backend")


static_path = Path(__file__).parent / "static"

app.mount("/static", StaticFiles(directory=static_path, html=False), name="static")
app.include_router(websocket.router)

@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    if full_path.startswith(("api/", "telemetry/", "ws/", "static/")):
        raise HTTPException(status_code=404)

    return FileResponse(static_path / "index.html")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()


@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()


@app.get("/api")
async def root():
    return {"message": "Energy Tracker Backend is running!"}
