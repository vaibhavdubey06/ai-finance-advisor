import requests


url = "http://127.0.0.1:8000/financial-advice"
data = {"question": "Should I buy a car or invest in SIP this month?"}


response = requests.post(url, json=data)
print("Response:", response.json())