"""
FastAPI application entry point.

Starts the Uvicorn server with the FastAPI app.
"""

import os

<<<<<<< HEAD
=======

import uvicorn
from dotenv import load_dotenv

>>>>>>> main

import uvicorn
from app.main import create_app
from dotenv import load_dotenv

if __name__ == "__main__":
    load_dotenv()

    app = create_app()

    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", 8000))
    debug = os.getenv("DEBUG", "False") == "True"

    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level="info",
    )
