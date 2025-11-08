#server\main.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os, sys
from dotenv import load_dotenv
load_dotenv()

# Ensure imports work whether run as `uvicorn server.main:app` from repo root
# or as `uvicorn main:app` from the server folder.
_server_dir = os.path.dirname(os.path.abspath(__file__))
_project_root = os.path.dirname(_server_dir)
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

# Always import routers via the package path so internal relative imports resolve.
from server.app.routes.summary import router as summary_router
from server.app.routes.search import router as search_router
from server.app.routes.activity import router as activity_router

app = FastAPI()

# Allow frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Correct router inclusion
app.include_router(summary_router, prefix="/api/summary", tags=["summary"])
app.include_router(search_router, prefix="/api/search", tags=["search"])
app.include_router(activity_router, prefix="/api/activity", tags=["activity"])


@app.get("/")
def root():
    return {"message": "Recall AI FastAPI backend running."}
