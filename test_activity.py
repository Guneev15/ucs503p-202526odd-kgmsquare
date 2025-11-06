import requests
import json

# Test data
data = {
    "user_id": "test_user",
    "source": "browser",
    "content": "Visited Google Chrome page",
    "metadata": {"url": "https://www.google.com", "title": "Google"}
}

try:
    response = requests.post(
        "http://127.0.0.1:8000/api/activity/log",
        json=data,
        headers={"Content-Type": "application/json"}
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
