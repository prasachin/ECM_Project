from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import websocket 

app = FastAPI(title="Energy Tracker Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(websocket.router) 


@app.get("/")
async def root():
    return {"message": "Energy Tracker Backend is running!"}
