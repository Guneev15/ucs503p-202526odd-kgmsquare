import openai
import json
import os
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

def summarize_day(activity_log):
    prompt = f"""
    You are a personal assistant that summarizes a user's digital day.
    Here is the activity log:

    {json.dumps(activity_log, indent=2)}

    Summarize it as a timeline of meaningful interactions. Focus on topics, purpose, and tasks.
    """

    response = openai.ChatCompletion.create(
        model="openai/gpt-4.1",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )

    return response.choices[0].message.content
