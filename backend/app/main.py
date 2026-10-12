import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.v1 import items, categories, zones, claims, users, upload

app = FastAPI(
    title="Campus Lost & Found API",
    description="API for the Campus Lost & Found Portal",
    version="1.0.0",
)

# CORS middleware for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://192.168.137.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure static directories exist
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(os.path.join(STATIC_DIR, "uploads"), exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Include Routers
app.include_router(items.router, prefix="/api/v1/items", tags=["items"])
app.include_router(categories.router, prefix="/api/v1/categories", tags=["categories"])
app.include_router(zones.router, prefix="/api/v1/zones", tags=["zones"])
app.include_router(claims.router, prefix="/api/v1/claims", tags=["claims"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(upload.router, prefix="/api/v1/upload", tags=["upload"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
