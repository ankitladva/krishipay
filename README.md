# सरल ऋण (Saral Loan) - Voice-First Unified Lending Interface

A responsive web application designed for rural farmers in India to apply for loans using voice commands, backed by MongoDB.

## 🌾 Project Overview

This application provides a **voice-first, accessibility-focused** lending platform tailored for rural farmers with low digital literacy. The interface uses large touch targets, high-contrast colors, and bilingual support (Hindi/English) to ensure usability in bright sunlight and by users with varying technical skills.

## ✨ Key Features

- **Voice-First Interface**: Primary interaction through Web Speech API (STT/TTS)
- **Simple Authentication**: Phone number + Voice biometric login
- **Smart Scheme Matching**: AI-powered matching of government schemes based on user intent
- **Document OCR**: Simulated OCR for extracting data from land records, ID proofs, and equipment photos
- **Geo-Spatial Verification**: Mock satellite-based land valuation
- **Voice Consent**: Final approval through voice confirmation
- **High Contrast UI**: Optimized for outdoor usage with large touch targets (min 48px)

## 🛠️ Tech Stack

### Frontend
- **Next.js 14+** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS** (with accessibility-first configuration)
- **Lucide React** (for professional SVG icons)

### Backend
- **Next.js API Routes** (Serverless functions)
- **MongoDB** (with in-memory mock via `mongodb-memory-server`)
- **Mongoose** (ODM)
- **Iron Session** (Simple session-based auth)

### State Management
- **Zustand** (with persistence)

### Voice
- **Web Speech API** (for Speech-to-Text and Text-to-Speech)

## 📁 Project Structure

```
/app
  /api
    /auth/login/        # Phone + voice biometric authentication
    /auth/logout/       # Logout endpoint
    /schemes/           # Get all government schemes
    /schemes/match/     # Match scheme by user intent
    /loan/create/       # Create loan application
    /upload/            # Document upload with mock OCR
  /page.tsx             # Landing page (marketing + schemes)
  /login/page.tsx       # Authentication page
  /dashboard/page.tsx   # Farmer dashboard with voice intent
  /application/page.tsx # Multi-step loan wizard
  /success/page.tsx     # Success confirmation
  /layout.tsx           # Root layout with VoiceProvider

/components
  /MicButton.tsx              # Voice input component
  /VoiceProvider.tsx          # React Context for voice interactions
  /SchemeCard.tsx             # Government scheme display card
  /DocumentUploadCard.tsx     # Document upload with OCR feedback
  /MapViewer.tsx              # Geo-spatial verification display

/lib
  /db.ts                      # Mock MongoDB connection
  /session.ts                 # Iron Session configuration
  /voice.ts                   # Web Speech API utilities
  /ocr-mock.ts                # Mock OCR extraction
  /seed.ts                    # Database seeding script
  /models/
    /User.ts                  # User schema
    /Scheme.ts                # Government scheme schema
    /LoanApplication.ts       # Loan application schema

/store
  /authStore.ts               # Zustand auth state
  /loanStore.ts               # Zustand loan application state
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Modern browser with Web Speech API support (Chrome/Edge recommended)

### Installation

1. **Clone the repository**
   ```bash
   cd farmerkyc2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   
   Create a `.env.local` file (already created with MongoDB Atlas credentials):
   ```env
   # MongoDB Atlas Connection
   MONGODB_URI=mongodb+srv://ankiitladva_db_user:0ZUygvpFE5cTDpWI@krishipay.taedjoi.mongodb.net/farmerkyc?retryWrites=true&w=majority
   
   # Session secret (for iron-session)
   SESSION_SECRET=complex_password_at_least_32_characters_long_for_security_change_in_production
   ```
   
   **Note:** The app will use MongoDB Atlas if `MONGODB_URI` is set, otherwise it falls back to in-memory MongoDB for development.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🎯 User Flow

### Complete Journey

1. **Landing Page** (`/`)
   - Browse government schemes
   - Read success stories
   - Tap floating mic button to ask questions
   - Click "Login" to proceed

2. **Authentication** (`/login`)
   - Enter 10-digit mobile number
   - Voice biometric: Read the Hindi phrase
   - Auto-registration for new users

3. **Dashboard** (`/dashboard`)
   - Auto-greeting: "नमस्ते! मैं आपकी कैसे मदद कर सकता हूं?"
   - Tap mic and say: "मुझे ट्रैक्टर के लिए ऋण चाहिए"
   - Or use quick action buttons
   - System matches the best scheme
   - Click "Start Application"

4. **Application Wizard** (`/application`)
   
   **Step 1: Document Upload**
   - Upload land records, equipment photos, ID proof
   - Mock OCR extracts name, land area, survey numbers
   - Display extracted data in large text

   **Step 2: Geo-Spatial Verification**
   - Mock map showing land location
   - Display valuation: ₹5,00,000
   - Show confidence level (85-95%)

   **Step 3: Voice Consent**
   - Read application summary via TTS
   - Ask: "क्या आप सहमत हैं?"
   - User says "हां" or clicks green tick button

5. **Success** (`/success`)
   - Animated checkmark
   - Display application ID
   - TTS: "बधाई हो! आपका आवेदन सफलतापूर्वक जमा हो गया है"
   - Return to dashboard

## 📊 Database Schemas

### User
```typescript
{
  phoneNumber: String (unique, 10 digits)
  kycVerified: Boolean
  voicePrintId: String
  language: String (default: 'hi')
  createdAt: Date
  updatedAt: Date
}
```

### Scheme (Government Loan Schemes)
```typescript
{
  title: String
  description: String
  benefits: String
  loanType: String (Tractor, Dairy, Equipment, Land, Seeds, General)
  eligibility: String
  icon: String (Lucide icon name)
  isActive: Boolean
  createdAt: Date
  updatedAt: Date
}
```

### LoanApplication
```typescript
{
  userId: ObjectId (ref: User)
  loanCategory: String
  status: Enum (Draft, Submitted, Approved, Rejected)
  extractedData: {
    name: String
    landArea: Number
    documentType: String
    idNumber: String
  }
  uploadedDocuments: Array<{
    filename: String
    type: String
  }>
  geoValuation: Number
  voiceConsentRecording: String
  matchedSchemeId: ObjectId (ref: Scheme)
  createdAt: Date
  updatedAt: Date
}
```

## 🎨 Design Principles

### Accessibility
- **Large Touch Targets**: Minimum 48px height/width for all interactive elements
- **High Contrast**: Deep blue (#1e40af), bright yellow (#fbbf24), vibrant green (#10b981)
- **Large Fonts**: Base size 20px (1.25rem) with line-height 1.6
- **Focus Indicators**: 4px thick borders with high contrast
- **Motion Sensitivity**: Respects `prefers-reduced-motion`

### Voice-First
- Every interactive screen has a prominent microphone button
- Auto-greetings on page load
- Voice feedback for all actions
- Fallback text input if voice not supported

### Bilingual Support
- Default: Hindi (Devanagari script)
- Secondary: English
- All labels show both languages

### Simplicity
- Minimal text
- Visual cards with icons
- Progress indicators
- Clear call-to-action buttons

## 🧪 Testing

### Manual Testing Checklist

1. **Voice Functionality**
   - [ ] Mic button activates speech recognition
   - [ ] Transcript displays correctly
   - [ ] TTS speaks greeting messages
   - [ ] Intent matching works for keywords (tractor, dairy, etc.)

2. **Authentication**
   - [ ] Phone validation (10 digits)
   - [ ] Voice biometric captures input
   - [ ] New user auto-registration
   - [ ] Session persists on refresh

3. **Dashboard**
   - [ ] Auto-greeting plays
   - [ ] Voice intent matches schemes
   - [ ] Quick actions work
   - [ ] Matched scheme displays correctly

4. **Application Wizard**
   - [ ] File upload accepts images
   - [ ] Mock OCR extracts data
   - [ ] Geo-valuation displays
   - [ ] Voice consent recognition
   - [ ] Application submission successful

5. **Success Page**
   - [ ] Application ID displays
   - [ ] Success message speaks
   - [ ] Navigation buttons work

### Browser Compatibility

✅ **Recommended**:
- Chrome 80+ (Full Web Speech API support)
- Edge 80+

⚠️ **Limited Support**:
- Firefox (TTS only, no STT)
- Safari (Partial support)

❌ **Not Supported**:
- Internet Explorer

## 🔐 Security Considerations

- Session-based authentication with `iron-session`
- HTTP-only cookies
- Input validation for phone numbers
- File type and size validation for uploads
- Sanitized voice inputs (intent matching)

## 🌍 Deployment

### Production Considerations

1. **Replace Mock MongoDB**
   - Use MongoDB Atlas or self-hosted MongoDB
   - Update `lib/db.ts` with real connection string

2. **Real OCR**
   - Integrate Tesseract.js or Google Vision API
   - Update `lib/ocr-mock.ts`

3. **Cloud Storage**
   - Use AWS S3, Cloudinary, or GridFS for document storage
   - Update `/api/upload/route.ts`

4. **Real Maps**
   - Integrate Google Maps API or Mapbox
   - Update `components/MapViewer.tsx`

5. **Environment Variables**
   ```env
   MONGODB_URI=your_production_mongodb_uri
   SESSION_SECRET=strong_random_secret
   NEXT_PUBLIC_MAPS_API_KEY=your_maps_api_key
   NEXT_PUBLIC_OCR_API_KEY=your_ocr_api_key
   ```

### Deploy to Vercel

```bash
npm run build
vercel --prod
```

## 📝 Government Schemes (Seeded)

1. **PM-KISAN योजना** - Direct financial assistance (₹6,000/year)
2. **कृषि यंत्र सब्सिडी** - Tractor subsidy (50% off)
3. **डेयरी उद्यमिता योजना** - Dairy farm setup (33% subsidy)
4. **कृषि अवसंरचना कोष** - Infrastructure loans (₹2 crore, 3% interest subsidy)
5. **किसान क्रेडिट कार्ड** - Crop loans (₹3 lakh at 4%)
6. **प्रधानमंत्री फसल बीमा योजना** - Crop insurance
7. **मृदा स्वास्थ्य कार्ड** - Free soil testing

## 🤝 Contributing

This project is a demonstration of voice-first accessibility design for low-literacy users. Contributions are welcome!

## 📄 License

MIT License - Built for educational and demonstration purposes.

## 👨‍💻 Developer Notes

### Key Dependencies
- `next@latest` - React framework
- `mongoose` - MongoDB ODM
- `mongodb-memory-server` - In-memory MongoDB
- `zustand` - State management
- `iron-session` - Session management
- `lucide-react` - Icon library
- `tailwindcss` - Styling
- `@tailwindcss/forms` - Form styling

### Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Development Tips
- Use Chrome DevTools for debugging Web Speech API
- Check browser console for voice recognition errors
- Test in mobile view for touch target sizes
- Use high contrast mode to verify accessibility

---

**Built with ❤️ for rural farmers in India**

सभी किसानों के लिए सरल और सुलभ ऋण प्रणाली 🌾
