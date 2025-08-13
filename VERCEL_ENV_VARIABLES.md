# 🔧 VERCEL ENVIRONMENT VARIABLES

## Copy and paste these EXACT values into your Vercel dashboard:

### **Step 1: Go to Vercel Dashboard**
1. Go to: https://vercel.com/dashboard
2. Select your project: `ai-finance-advisor`
3. Go to **Settings** → **Environment Variables**

### **Step 2: Add Each Variable Individually**

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyCq7mRny3QomU-ctaFqmbsGbYueOzoDavs
VITE_FIREBASE_AUTH_DOMAIN=finance-app-6346d.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=finance-app-6346d
VITE_FIREBASE_STORAGE_BUCKET=finance-app-6346d.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=78385795138
VITE_FIREBASE_APP_ID=1:78385795138:web:ff8f5ddd9129cf06f6dddb
VITE_FIREBASE_MEASUREMENT_ID=G-NMFC54W1HP

# Backend API URLs
VITE_NODE_API_URL=https://ai-finance-advisor-node.onrender.com
VITE_PYTHON_API_URL=https://ai-finance-advisor-python.onrender.com
```

### **Step 3: For Each Variable:**
1. Click **"Add New"**
2. Enter **Name** (e.g., `VITE_FIREBASE_API_KEY`)
3. Enter **Value** (e.g., `AIzaSyCq7mRny3QomU-ctaFqmbsGbYueOzoDavs`)
4. Select **Environment**: `Production`, `Preview`, and `Development`
5. Click **Save**

### **Step 4: Redeploy**
After adding ALL variables:
1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Wait for completion

## 🎯 Expected Result:
- ✅ No Firebase errors
- ✅ Backend API connections work
- ✅ CORS errors resolved
- ✅ Full app functionality

## 🚨 Critical: 
**You MUST add these to Vercel - your local .env file doesn't work in production!**
