import os
import requests
from dotenv import load_dotenv
from .supabase_client import get_all_summaries

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENAI_API_KEY")

def search_memories(user_id, query):
    summaries = get_all_summaries(user_id)[:5]  
    context = "\n".join([s['summary'] for s in summaries])


    prompt = f"Search the following memory logs:\n{context}\n\nQuery: {query}\nAnswer:"

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
    "model": "openai/gpt-4.1",
    "messages": [
        {"role": "user", "content": prompt}
    ],
    "max_tokens": 512, 
}


    response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=data)

    if response.status_code == 200:
        return response.json()["choices"][0]["message"]["content"]
    else:
        raise Exception(f"OpenRouter GPT-4.1 error {response.status_code}: {response.text}")
