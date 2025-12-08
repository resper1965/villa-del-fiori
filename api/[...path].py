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

from app.main import app
from mangum import Mangum

# Create ASGI adapter for Vercel - this is the handler that Vercel will call
handler = Mangum(app, lifespan="off")
