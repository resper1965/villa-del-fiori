from fastapi import APIRouter

from app.api.v1.endpoints import auth, processes, approvals, entities, validation, ingestion, chat, admin

api_router = APIRouter()

# Register routers
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(processes.router, prefix="/processes", tags=["processes"])
api_router.include_router(approvals.router, prefix="/approvals", tags=["approvals"])
api_router.include_router(entities.router, prefix="/entities", tags=["entities"])
api_router.include_router(validation.router, prefix="/validation", tags=["validation"])
api_router.include_router(ingestion.router, prefix="/ingestion", tags=["ingestion"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
