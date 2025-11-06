from fastapi import APIRouter, Request, Query
from ..services.search import search_memories

router = APIRouter()

@router.get("/memories")
def search_memories_route(user_id: str = Query(...), query: str = Query(...)):
    result = search_memories(user_id, query)
    return {"result": result}

@router.post("/")
async def search(request: Request):
    body = await request.json()
    user_id = body.get("user_id")
    query = body.get("query")
    answer = search_memories(user_id, query)
    return {"answer": answer}