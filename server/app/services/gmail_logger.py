from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
import datetime
import os
import sys

# Add the project root to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(os.path.dirname(current_dir)))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

try:
    from server.app.services.supabase_client import supabase
except ImportError:
    # Fallback for direct execution
    sys.path.insert(0, os.path.dirname(os.path.dirname(current_dir)))
    from services.supabase_client import supabase

SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]

def log_gmail_activity(user_id: str):
    creds = None
    if not creds or not creds.valid:
        flow = InstalledAppFlow.from_client_secrets_file(
            "credentials.json", SCOPES
        )
        creds = flow.run_local_server(port=0)

    service = build("gmail", "v1", credentials=creds)

    # Get recent 10 messages
    results = service.users().messages().list(userId="me", maxResults=10).execute()
    messages = results.get("messages", [])

    logs = []
    for msg in messages:
        m = service.users().messages().get(userId="me", id=msg["id"]).execute()
        snippet = m.get("snippet", "")
        logs.append({
            "user_id": user_id,
            "source": "gmail",
            "content": f"Email: {snippet[:80]}...",
            "metadata": {"id": msg["id"], "date": datetime.datetime.now().isoformat()}
        })

    # Insert into Supabase
    if logs:
        supabase.table("activity_logs").insert(logs).execute()
    return {"logged": len(logs)}
