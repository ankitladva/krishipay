# 🚀 Quick Start Guide - सरल ऋण

## Start the Application (5 Minutes)

### 1. Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open **http://localhost:3000** in Chrome or Edge (for full voice support).

### 2. Test the Complete Flow

#### **Step 1: Landing Page** (`/`)
- Browse government schemes displayed on the homepage
- Click **"Login"** button (top-right)
- Or tap the floating mic button and say "ऋण चाहिए"

#### **Step 2: Login** (`/login`)
- Enter: `9876543210` (any 10-digit number)
- Voice Biometric: Tap "रिकॉर्ड करें" and read the Hindi phrase
- Or just click "आगे बढ़ें" to proceed

**Auto-Registration**: First-time users are automatically registered.

#### **Step 3: Dashboard** (`/dashboard`)
- Listen to the greeting: "नमस्ते! मैं आपकी कैसे मदद कर सकता हूं?"
- **Option A**: Tap the large mic button and say "ट्रैक्टर के लिए ऋण"
- **Option B**: Click one of the 4 quick action buttons (Tractor, Dairy, Equipment, Land)
- The system will match a government scheme
- Click **"आवेदन शुरू करें"** (Start Application)

#### **Step 4: Application Wizard** (`/application`)

**Sub-Step 1: Document Upload**
- Click on any of the 3 upload cards
- Select any image from your device (JPG/PNG)
- Mock OCR will extract data and display it
- Upload at least 2 documents
- Click **"आगे बढ़ें"**

**Sub-Step 2: Geo-Spatial Verification**
- View the mock map with land pin
- See valuation: ₹5,00,000
- Confidence: 85-95%
- Click **"आगे बढ़ें"**

**Sub-Step 3: Voice Consent**
- Review application summary
- **Option A**: Click green **"हां / Yes"** button
- **Option B**: Tap **"बोलें"** and say "हां"
- Click **"आवेदन जमा करें"** (Submit Application)

#### **Step 5: Success** (`/success`)
- See animated green checkmark
- Hear: "बधाई हो! आपका आवेदन सफलतापूर्वक जमा हो गया है"
- Note your Application ID
- Click **"डैशबोर्ड पर वापस जाएं"**

## 🎤 Voice Commands to Try

| English | Hindi | Result |
|---------|-------|--------|
| "I need a tractor loan" | "मुझे ट्रैक्टर के लिए ऋण चाहिए" | Matches Tractor Subsidy Scheme |
| "I want dairy loan" | "मुझे डेयरी ऋण चाहिए" | Matches Dairy Entrepreneurship Scheme |
| "Equipment loan" | "उपकरण ऋण" | Matches Equipment/Infrastructure Scheme |
| "General loan" | "सामान्य ऋण" | Matches PM-KISAN or KCC |
| "Yes" | "हां" | Confirms consent |

## 🌐 Browser Requirements

### ✅ Fully Supported (Voice + All Features)
- **Google Chrome 80+** (Recommended)
- **Microsoft Edge 80+**

### ⚠️ Partial Support (No Voice Input)
- Firefox (Text-to-Speech only, no Speech-to-Text)
- Safari (Limited voice support)

### 💡 Tip
If voice doesn't work, you can still use all features via button clicks and text input.

## 📱 Test on Mobile

1. Get your local IP address:
   ```bash
   # On Mac/Linux
   ifconfig | grep "inet "
   
   # On Windows
   ipconfig
   ```

2. Open on mobile browser:
   ```
   http://YOUR_LOCAL_IP:3000
   ```
   Example: `http://192.168.1.100:3000`

3. Grant microphone permissions when prompted

## 🗄️ Database

The app uses **in-memory MongoDB** (no installation needed):
- Auto-starts on first API call
- Pre-seeded with 7 government schemes
- Data resets on server restart (perfect for testing)

### View Seeded Schemes

The following schemes are automatically available:
1. PM-KISAN योजना (General - ₹6,000/year)
2. कृषि यंत्र सब्सिडी (Tractor - 50% subsidy)
3. डेयरी उद्यमिता योजना (Dairy - 33% subsidy)
4. कृषि अवसंरचना कोष (Equipment - ₹2 crore loan)
5. किसान क्रेडिट कार्ड (General - ₹3 lakh at 4%)
6. प्रधानमंत्री फसल बीमा योजना (General - crop insurance)
7. मृदा स्वास्थ्य कार्ड (Seeds - free soil testing)

## 🎨 UI/UX Features to Notice

### Accessibility
- **Large Touch Targets**: All buttons minimum 48px
- **High Contrast**: Colors optimized for bright sunlight
- **Large Fonts**: Base 20px for easy reading
- **Thick Focus Borders**: 4px for keyboard navigation

### Animations
- Pulsing mic button when listening
- Bouncing checkmark on success
- Scale-in animations for cards
- Wave animation for voice input

### Bilingual
- Every label shows Hindi + English
- Voice recognition works in both languages
- TTS speaks in Hindi by default

## 🐛 Troubleshooting

### Microphone Not Working?
1. Check browser permissions (allow microphone)
2. Use Chrome/Edge (best support)
3. Use HTTPS in production (required for mic access)
4. Fallback: Use button clicks instead of voice

### Build Errors?
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Port 3000 Already in Use?
```bash
# Use a different port
npm run dev -- -p 3001
```

## 📊 API Endpoints

Test the APIs directly:

```bash
# Get all schemes
curl http://localhost:3000/api/schemes

# Match a scheme
curl -X POST http://localhost:3000/api/schemes/match \
  -H "Content-Type: application/json" \
  -d '{"userIntent": "tractor loan"}'

# Login (creates session)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "9876543210", "voicePrint": "test123"}'
```

## 🚀 Production Deployment

### Quick Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables for Production

Add these in Vercel dashboard:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
SESSION_SECRET=generate_strong_32_character_secret
NODE_ENV=production
```

## 📚 Next Steps

1. **Customize Schemes**: Edit `lib/seed.ts` to add your schemes
2. **Real Database**: Replace mock DB with MongoDB Atlas
3. **Real OCR**: Integrate Tesseract.js or Google Vision API
4. **Real Maps**: Add Google Maps API for actual geo-spatial verification
5. **SMS Notifications**: Add Twilio for application status updates

## 💡 Quick Tips

- **Voice Testing**: Speak clearly and close to the mic
- **Demo Mode**: Works offline with all mock data
- **Mobile Testing**: Use Chrome on Android for best results
- **Clear Data**: Refresh page to reset Zustand stores

---

**Ready to start?** Run `npm run dev` and open http://localhost:3000

सभी किसानों के लिए सरल और सुलभ ऋण प्रणाली 🌾

