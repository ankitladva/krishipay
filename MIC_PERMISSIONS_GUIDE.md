# 🎤 Microphone Permissions Guide

## Issue: "Speech recognition error: not-allowed"

This error occurs when the browser doesn't have permission to access your microphone.

---

## ✅ **Solution: Grant Microphone Permissions**

### **For Chrome/Edge:**

1. **Click the lock icon** 🔒 in the address bar (left of the URL)
2. Find **"Microphone"** in the permissions list
3. Change it from "Blocked" to **"Allow"**
4. **Refresh the page** (F5 or Cmd+R)

### **For Firefox:**

1. **Click the lock icon** 🔒 in the address bar
2. Click **"Connection Secure"** → **"More Information"**
3. Go to the **"Permissions"** tab
4. Find **"Use the Microphone"**
5. Uncheck **"Use Default"** and select **"Allow"**
6. **Refresh the page**

### **For Safari:**

1. Go to **Safari** → **Settings** → **Websites**
2. Click **"Microphone"** in the left sidebar
3. Find **localhost:3000** in the list
4. Change to **"Allow"**
5. **Refresh the page**

---

## 🔧 **Quick Fix**

When you see the microphone permission popup:
- ✅ Click **"Allow"**
- ❌ Don't click "Block"

If you accidentally blocked it, follow the steps above to unblock.

---

## 🎯 **Features That Need Microphone:**

- ✅ Voice-based loan application
- ✅ Voice authentication
- ✅ Speaking loan requirements
- ✅ Voice consent for loan approval

---

## 🔐 **Privacy & Security**

- ✅ Your voice data is processed locally in the browser
- ✅ No recordings are stored on servers
- ✅ Only transcribed text is sent to the application
- ✅ You can revoke permissions anytime

---

## 🌐 **Browser Compatibility**

### ✅ **Fully Supported:**
- Chrome 80+ (Desktop & Android)
- Edge 80+ (Desktop)

### ⚠️ **Partial Support:**
- Firefox (Text-to-Speech only, no Speech-to-Text)
- Safari (Limited support)

### 💡 **Recommendation:**
Use **Chrome** or **Edge** for the best voice experience.

---

## 🚨 **Still Not Working?**

### Check:
1. ✅ Microphone is connected and working
2. ✅ No other app is using the microphone
3. ✅ Browser is up to date
4. ✅ You're on `http://localhost:3000` (not HTTP production without SSL)

### Test Microphone:
1. Go to: `chrome://settings/content/microphone`
2. Click "Test" to check if your mic works
3. Select the correct microphone device

---

## 📱 **On Mobile:**

### Android (Chrome):
1. Tap the **lock icon** in the address bar
2. Tap **"Permissions"**
3. Enable **"Microphone"**
4. Refresh the page

### iOS (Safari):
1. Go to **Settings** → **Safari** → **Camera & Microphone Access**
2. Enable microphone access
3. Refresh the page in Safari

---

## ✨ **Now Working!**

Once permissions are granted:
- 🎤 Tap the microphone button
- 🗣️ Speak clearly
- ✅ See your speech transcribed in real-time

---

**Need Help?** The app will show a helpful popup if microphone access is denied!

