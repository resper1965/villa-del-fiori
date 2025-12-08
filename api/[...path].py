"""
Vercel Serverless Function Handler for FastAPI - Catch-all route
"""
import sys
import os
import json
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent / "backend" / "src"
sys.path.insert(0, str(backend_path))

# Set environment variables for Vercel
os.environ.setdefault("ENVIRONMENT", "production")
os.environ.setdefault("DEBUG", "False")

from app.main import app
from mangum import Mangum

# Create ASGI adapter for Vercel
# The path from Vercel will be like "v1/auth/login" when accessing "/api/v1/auth/login"
# Mangum with api_gateway_base_path="/api" will prepend "/api" to make it "/api/v1/auth/login"
handler = Mangum(app, lifespan="off", api_gateway_base_path="/api")
