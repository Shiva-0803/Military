
import requests
import json

url = "http://localhost:8000/api/v1/auth/login/"
payload = {
    "username": "admin",
    "password": "0803"
}
headers = {
    "Content-Type": "application/json"
}

try:
    response = requests.post(url, data=json.dumps(payload), headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
