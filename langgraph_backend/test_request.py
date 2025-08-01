"""
1. Use requests to POST to http://localhost:8000/financial-advice
2. Send JSON with a query field, like: {"query": "Should I buy a new car or invest in mutual funds?"}
3. Print the response
"""

import requests


url = "http://localhost:8000/financial-advice"
data = {"question": "Should I buy a new car or invest in mutual funds?"}

response = requests.post(url, json=data)
print("Raw response:", response.text)
print("Response:", response.json())
