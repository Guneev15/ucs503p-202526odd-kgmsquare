# server/app/services/supabase_client.py

from supabase import create_client
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

# Create client only if configured
supabase = create_client(url, key) if url and key else None


# ---------- ACTIVITY LOGGING ----------
def insert_activity(user_id, source, content, metadata=None):
    """Log raw activity (browser, gmail, discord, etc.) into activity_logs."""
    if not supabase:
        return {"skipped": True, "reason": "Supabase not configured"}
    try:
        supabase.table("activity_logs").insert({
            "user_id": user_id,
            "source": source,
            "content": content,
            "metadata": metadata or {},
        }).execute()
        return {"success": True}
    except Exception as e:
        print(f"Error inserting activity: {e}")
        return {"error": str(e)}


def get_activity_logs(user_id, day=None):
    """Fetch all activity logs for a user, optionally filtered by day."""
    if not supabase:
        return []
    try:
        query = supabase.table("activity_logs").select("*").eq("user_id", user_id)
        if day:
            # Properly filter by day with start and end times
            start_time = f"{day}T00:00:00+00:00"
            end_time = f"{day}T23:59:59.999999+00:00"
            query = query.gte("created_at", start_time).lte("created_at", end_time)
        result = query.execute()
        return result.data or []
    except Exception as e:
        print(f"Error fetching activity logs: {e}")
        return []


# ---------- DAILY SUMMARIES ----------
def store_daily_summary(user_id, summary, raw_log):
    """Store daily AI-generated summary into daily_summaries."""
    if not supabase:
        return {"skipped": True, "reason": "Supabase not configured"}
    day = datetime.utcnow().strftime("%Y-%m-%d")
    try:
        supabase.table("daily_summaries").insert({
            "user_id": user_id,
            "day": day,
            "summary": summary,
            "raw_log": raw_log
        }).execute()
        return {"success": True}
    except Exception as e:
        print(f"Error storing daily summary: {e}")
        return {"error": str(e)}


def get_today_summary(user_id):
    """Fetch today's daily summary if exists."""
    today = datetime.utcnow().strftime("%Y-%m-%d")
    try:
        result = supabase.table("daily_summaries") \
            .select("*") \
            .eq("user_id", user_id) \
            .eq("day", today) \
            .execute()
        return result.data[0] if result.data else None
    except Exception as e:
        print(f"Error fetching today's summary: {e}")
        return None


def get_all_summaries(user_id):
    """Fetch all past daily summaries."""
    if not supabase:
        return []
    try:
        result = supabase.table("daily_summaries") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("day", desc=True) \
            .execute()
        return result.data or []
    except Exception as e:
        print(f"Error fetching summaries: {e}")
        return []
