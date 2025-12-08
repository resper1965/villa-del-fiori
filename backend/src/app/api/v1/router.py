from fastapi import APIRouter

from app.api.v1.endpoints import auth, processes

api_router = APIRouter()

# Register routers
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(processes.router, prefix="/processes", tags=["processes"])
