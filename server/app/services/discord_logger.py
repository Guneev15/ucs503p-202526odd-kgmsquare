import discord
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

intents = discord.Intents.default()
intents.message_content = True
client = discord.Client(intents=intents)

USER_ID = "9a1b9e1d-1234-45e7-a987-0abcde123456"  # replace dynamically later

@client.event
async def on_message(message):
    if message.author == client.user:
        return
    
    supabase.table("activity_logs").insert({
        "user_id": USER_ID,
        "source": "discord",
        "content": f"{message.author}: {message.content}",
        "metadata": {"channel": str(message.channel), "timestamp": str(message.created_at)}
    }).execute()

def run_bot():
    client.run("MTQwNjIzNzE4NjM4MjIzMzY2MA.GGBCRf.9COFNyc7LSvOWGF0M-esvCfQL2y4vQz27a_JS8")
