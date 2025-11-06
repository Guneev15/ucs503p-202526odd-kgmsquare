from fastapi import APIRouter, Request
from app.services.supabase_client import insert_activity

router = APIRouter()

@router.post("/log")
async def log_activity(request: Request):
    body = await request.json()
    user_id = body.get("user_id")
    source = body.get("source")
    content = body.get("content")
    metadata = body.get("metadata", {})
    
    result = insert_activity(user_id, source, content, metadata)
    return {"status": "ok", "result": result}


@router.post("/logs")
async def log_activity_alias(request: Request):
    """Alias route kept for backwards compatibility with older extension builds.
    Forwards the request to the same insert handler.
    """
    # Reuse the same logic as /log
    body = await request.json()
    user_id = body.get("user_id")
    source = body.get("source")
    content = body.get("content")
    metadata = body.get("metadata", {})
    result = insert_activity(user_id, source, content, metadata)
    return {"status": "ok", "result": result}
