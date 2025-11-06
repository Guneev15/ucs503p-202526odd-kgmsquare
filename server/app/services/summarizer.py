#server\app\services\summarizer.py

import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("OPENAI_API_KEY")
API_URL = "https://openrouter.ai/api/v1/chat/completions"

def _local_fallback(activity_log):
    if not activity_log:
        return "No activity found for today."
    
    summary_lines = ["📅 Daily Activity Summary", ""]
    
    # Group activities by source
    sources = {}
    for item in activity_log:
        source = item.get('source', 'unknown')
        if source not in sources:
            sources[source] = []
        sources[source].append(item)
    
    # Create summary by source
    for source, activities in sources.items():
        summary_lines.append(f"{source.title()} Activities:")
        for activity in activities:
            content = activity.get('content', 'Unknown activity')
            timestamp = activity.get('created_at', '')
            if timestamp:
                # Extract time from timestamp like "2025-08-17T14:27:47.582553+00:00"
                time_part = timestamp.split('T')[1][:5] if 'T' in timestamp else ''
                summary_lines.append(f"  • {content} ({time_part})")
            else:
                summary_lines.append(f"  • {content}")
        summary_lines.append("")
    
    summary_lines.append(f"📊 Total activities recorded: {len(activity_log)}")
    return "\n".join(summary_lines)


def summarize_day(activity_log):
    prompt = f"""
You are a personal assistant that summarizes a user's digital day.
Here is the activity log:

{json.dumps(activity_log, indent=2)}

Summarize it as a timeline of meaningful interactions. Focus on topics, purpose, and tasks.
"""

    if not API_KEY:
        # Fallback when API key isn't configured: return a simple local summary
        return _local_fallback(activity_log)

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost",
        "X-Title": "Recall AI Summary"
    }

    data = {
        "model": "openai/gpt-4.1",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 512  # reduce token limit to fit in free quota
    }

    try:
        response = requests.post(API_URL, headers=headers, json=data, timeout=30)
        if response.status_code != 200:
            # On any error from the model API, fall back locally
            return _local_fallback(activity_log)
        return response.json()["choices"][0]["message"]["content"]
    except Exception:
        # Network/timeout/parse errors -> fallback summary
        return _local_fallback(activity_log)
