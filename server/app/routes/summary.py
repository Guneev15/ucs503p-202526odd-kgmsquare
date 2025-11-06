from fastapi import APIRouter, Query
from datetime import datetime
from app.services.supabase_client import supabase
import json
import os
import requests

router = APIRouter()

OPENROUTER_KEY = os.getenv("OPENAI_API_KEY") 
API_URL = "https://openrouter.ai/api/v1/chat/completions"

@router.post("/generate")
def generate_summary(user_id: str = Query(...)):
    """Generate and store a daily AI memory summary for a user."""

    today = datetime.utcnow().date().isoformat()
    # Use proper ISO timestamp format for filtering
    start_time = f"{today}T00:00:00+00:00"
    end_time = f"{today}T23:59:59.999999+00:00"
    
    result = (
        supabase.table("activity_logs")
        .select("*")
        .eq("user_id", user_id)
        .gte("created_at", start_time)
        .lte("created_at", end_time)
        .execute()
    )
    logs = result.data or []
    if not logs:
        return {"status": "no_logs", "message": "No activity logs found for today."}

    # Prepare log text for AI
    log_text = "\n".join(
        [f"- {log['content']} ({log['created_at']})" for log in logs[:200]]  # cap for safety
    )

    # Ask LLM for summary
    payload = {
        "model": "openai/gpt-4.1",
        "messages": [
            {"role": "system", "content": "You are a helpful assistant that summarizes daily activity logs."},
            {"role": "user", "content": f"Summarize today's activities:\n{log_text}"}
        ],
        "max_tokens": 512,
    }
    headers = {
        "Authorization": f"Bearer {OPENROUTER_KEY}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        summary_text = response.json()["choices"][0]["message"]["content"].strip()
    except Exception as e:
        return {"status": "error", "message": f"AI summarization failed: {str(e)}"}

    # Store in daily_summaries
    try:
        supabase.table("daily_summaries").insert({
            "user_id": user_id,
            "day": today,
            "summary": summary_text,
            "raw_log": json.dumps(logs)
        }).execute()
    except Exception as e:
        return {"status": "error", "message": str(e)}

    return {"status": "success", "summary": summary_text, "logs_count": len(logs)}


@router.get("/all")
def get_all_summaries(user_id: str = Query(...)):
    """Fetch all past summaries for timeline view."""
    try:
        result = supabase.table("daily_summaries") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .execute()
        
        return {"status": "success", "summaries": result.data or []}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.get("/today")
def get_today_summary(user_id: str = Query(...)):
    """Fetch today's summary if it exists."""
    try:
        today = datetime.utcnow().date().isoformat()
        result = supabase.table("daily_summaries") \
            .select("*") \
            .eq("user_id", user_id) \
            .eq("day", today) \
            .execute()
        
        if result.data:
            return {"status": "success", "summary": result.data[0]}
        else:
            return {"status": "not_found", "message": "No summary found for today. Try generating one first."}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.delete("/clear")
def clear_all_summaries(user_id: str = Query(...), mode: str = Query("hard")):
    """Delete or soft-delete all daily summaries for a user.

    mode: 'hard' will remove rows. 'soft' will try to set a 'deleted' flag on rows (if column exists).
    Falls back to hard delete if soft update fails.
    """
    try:
        if mode == "soft":
            # Attempt a soft-delete by updating a 'deleted' boolean column. If the column doesn't exist,
            # Supabase will raise an error and we'll fall back to hard delete.
            try:
                res = supabase.table("daily_summaries").update({"deleted": True}).eq("user_id", user_id).execute()
                return {"status": "success", "mode": "soft", "updated": res.data}
            except Exception:
                # fallback to hard delete below
                pass

        # hard delete
        res = supabase.table("daily_summaries").delete().eq("user_id", user_id).execute()
        return {"status": "success", "mode": "hard", "deleted": res.data}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.delete("/delete/{summary_id}")
def delete_single_summary(summary_id: str):
    """Delete a single summary by ID from the database."""
    try:
        res = supabase.table("daily_summaries").delete().eq("id", summary_id).execute()
        if res.data:
            return {"status": "success", "message": "Summary deleted successfully", "deleted": res.data}
        else:
            return {"status": "error", "message": "Summary not found or already deleted"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
