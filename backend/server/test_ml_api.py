import requests
import json

url = "http://127.0.0.1:8001/analyze"

payload = {
    "conversation": [
        {"sender": "child", "text": "hello", "image_base64": None}
    ],
    "metadata": {
        "sender_id": "device_123",
        "conversation_id": "conv_123",
        "friendship_duration_days": 0,
        "sender_age": 12,
        "receiver_age": 25
    }
}

print(f"Testing {url} with payload...")
try:
    r = requests.post(url, json=payload)
    print(f"Status: {r.status_code}")
    if r.status_code != 200:
        print(f"Response: {r.text}")
    else:
        print("Success!")
except Exception as e:
    print(f"Error: {e}")

# Test with null conversation_id
print("\nTesting with null conversation_id...")
payload_bad = payload.copy()
payload_bad["metadata"]["conversation_id"] = None
r = requests.post(url, json=payload_bad)
print(f"Status: {r.status_code}, Response: {r.text}")
