from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

from app.api import websocket
from app.services.database import connect_to_mongo, close_mongo_connection

app = FastAPI(title="Energy Tracker Backend")


# Path to React build folder
static_path = Path(__file__).parent / "static"

# Mount static directory
app.mount("/static", StaticFiles(directory=static_path, html=False), name="static")


# Serve index.html for all non-API routes
@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    index_file = static_path / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {"error": "index.html not found in /static"}


# --------------- API & WEBSOCKETS -----------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # optional since frontend is same domain
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


@app.get("/api")
async def root():
    return {"message": "Energy Tracker Backend is running!"}
