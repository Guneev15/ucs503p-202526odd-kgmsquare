import os
import sys
import asyncio

# Add project root to sys.path to allow for absolute imports
_project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

from server.app.services.supabase_client import get_all_summaries

USER_ID = "9a1b9e1d-1234-45e7-a987-0abcde123456"

def check_user_data():
    print(f"Checking for data with user_id: {USER_ID}")
    data = get_all_summaries(USER_ID)
    if data:
        print("Data found:")
        for row in data:
            print(row)
    else:
        print("No data found for this user_id.")

if __name__ == "__main__":
    check_user_data()
