from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os
from dotenv import load_dotenv
load_dotenv() 
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = "ECM_Data"

client = None
db = None
telemetry_collection = None


async def connect_to_mongo():
    global client, db, telemetry_collection

    try:
        client = AsyncIOMotorClient(MONGO_URI)
        db = client[DB_NAME]
        telemetry_collection = db["ECM_Data"]
        await db.command("ping")
        print("✅ Connected to MongoDB")
    except Exception as e:
        print("❌ Failed to connect to MongoDB:", e)


async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("🔌 MongoDB connection closed")


async def save_telemetry(data: dict):
    """Save ESP telemetry data grouped by date."""
    date_str = datetime.utcnow().strftime("%Y-%m-%d")
    data["timestamp"] = datetime.utcnow().isoformat()

    await telemetry_collection.update_one(
        {"date": date_str},
        {"$push": {"data": data}},
        upsert=True
    )
