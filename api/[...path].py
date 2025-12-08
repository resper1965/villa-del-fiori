"""
Vercel Serverless Function Handler for FastAPI - Catch-all route
"""
import sys
import os
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent / "backend" / "src"
sys.path.insert(0, str(backend_path))

# Set environment variables for Vercel
os.environ.setdefault("ENVIRONMENT", "production")
os.environ.setdefault("DEBUG", "False")
os.environ["VERCEL"] = "1"  # Mark that we're running on Vercel

from app.main import app
from mangum import Mangum

# Create ASGI adapter for Vercel
# Vercel passes the path after /api/ as the path parameter
# So /api/v1/auth/login becomes "v1/auth/login" in the handler
# We need to ensure the path is correctly processed
handler = Mangum(app, lifespan="off", api_gateway_base_path="/api")
