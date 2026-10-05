from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import items

app = FastAPI(
    title="Campus Lost & Found API",
    description="API for the Campus Lost & Found Portal",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(items.router, prefix="/api/v1/items", tags=["items"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
