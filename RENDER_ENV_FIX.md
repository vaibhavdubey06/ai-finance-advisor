# 🔧 RENDER ENVIRONMENT VARIABLE FIX

## 🚨 URGENT: Add Environment Variable to Node.js Service

### **Step 1: Go to Render Dashboard**
1. Go to: https://render.com/dashboard
2. Find your **Node.js service**: `ai-finance-advisor-node`
3. Click on the service name

### **Step 2: Add Environment Variable**
1. Go to **Environment** tab
2. Click **Add Environment Variable**
3. Add this EXACT variable:

```
Name: PYTHON_API_URL
Value: https://ai-finance-advisor-python.onrender.com
```

### **Step 3: Redeploy**
1. Click **Manual Deploy** → **Deploy latest commit**
2. Wait for deployment to complete (2-3 minutes)

## 🎯 What This Fixes:
- ✅ Node.js backend can now connect to Python backend
- ✅ Deep Analysis mode will work
- ✅ 503 errors will be resolved
- ✅ Full AI chat functionality

## 🔍 Test After Fix:
Visit: https://ai-finance-advisor-node.onrender.com/api/advisor
- Should connect to Python backend instead of failing

**This is the final step to make your chat advisor work!** 🚀
