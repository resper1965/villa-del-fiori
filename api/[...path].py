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

try:
    from app.main import app
    from mangum import Mangum
    
    # Create ASGI adapter for Vercel
    # Vercel rewrites /v1/* to /api/v1/*, then passes to this handler
    # The handler receives the full path including /v1
    # Mangum will handle the routing correctly
    handler = Mangum(app, lifespan="off")
except Exception as e:
    # Fallback for debugging
    import traceback
    def handler(event, context):
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": f'{{"error": "Error loading app: {str(e)}", "traceback": "{traceback.format_exc()}"}}'
        }
