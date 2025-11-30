# 🗄️ Database Setup - MongoDB Atlas

## ✅ Configuration Complete

The application is now configured to use **MongoDB Atlas** (cloud database).

---

## 📋 Connection Details

- **Database:** `farmerkyc`
- **Cluster:** `krishipay.taedjoi.mongodb.net`
- **Username:** `ankiitladva_db_user`
- **Connection Type:** MongoDB Atlas (Cloud)

---

## 🔧 How It Works

### Connection Logic (`lib/db.ts`)

1. **If `MONGODB_URI` environment variable is set:**
   - Connects to MongoDB Atlas (cloud database)
   - Data persists across app restarts
   - All users, schemes, and loan applications are saved

2. **If `MONGODB_URI` is NOT set:**
   - Falls back to in-memory MongoDB (for development)
   - Data is lost when app restarts
   - Useful for testing without affecting production data

---

## 📁 Environment Variables

The `.env.local` file contains:

```env
MONGODB_URI=mongodb+srv://ankiitladva_db_user:0ZUygvpFE5cTDpWI@krishipay.taedjoi.mongodb.net/farmerkyc?retryWrites=true&w=majority
SESSION_SECRET=complex_password_at_least_32_characters_long_for_security_change_in_production
```

**⚠️ Important:** 
- `.env.local` is in `.gitignore` (not committed to git)
- Never commit credentials to version control
- Use `.env.example` as a template for other developers

---

## 🔍 Viewing Users in Database

### Option 1: Via API Endpoint (Recommended)

Create `/app/api/admin/users/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';

export async function GET() {
  try {
    await connectDB();
    
    const totalUsers = await User.countDocuments();
    const usersToday = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) }
    });
    
    const allUsers = await User.find()
      .sort({ createdAt: -1 })
      .select('phoneNumber createdAt kycVerified language')
      .lean();
    
    return NextResponse.json({
      totalUsers,
      usersToday,
      users: allUsers,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
```

Then visit: `http://localhost:3000/api/admin/users`

### Option 2: MongoDB Atlas Web Interface

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Login with your credentials
3. Navigate to your cluster → Collections
4. Select `farmerkyc` database
5. View collections: `users`, `schemes`, `loanapplications`

### Option 3: MongoDB Compass (Desktop App)

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect using connection string:
   ```
   mongodb+srv://ankiitladva_db_user:0ZUygvpFE5cTDpWI@krishipay.taedjoi.mongodb.net/farmerkyc
   ```
3. Browse collections and query data

---

## 📊 Database Collections

### 1. `users`
- Stores all registered users
- Fields: `phoneNumber`, `kycVerified`, `voicePrintId`, `language`, `createdAt`, `updatedAt`

### 2. `schemes`
- Stores government loan schemes
- Seeded automatically on first run via `lib/seed.ts`

### 3. `loanapplications`
- Stores all loan applications
- References `users` and `schemes`

---

## ✅ Verification

After starting the app, you should see:

```
✅ MongoDB Atlas connected
```

If you see:
```
✅ MongoDB connected (In-Memory - Development Mode)
⚠️  Note: Set MONGODB_URI environment variable to use MongoDB Atlas
```

Then check that `.env.local` exists and contains `MONGODB_URI`.

---

## 🔒 Security Notes

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Rotate credentials** if exposed
3. **Use IP whitelist** in MongoDB Atlas for production
4. **Enable authentication** and use strong passwords
5. **Use environment-specific secrets** for production

---

## 🚀 Next Steps

1. ✅ Database connection configured
2. ✅ Environment variables set
3. ⏭️ Create admin dashboard to view users (optional)
4. ⏭️ Add user statistics API endpoint (optional)

---

## 📝 Troubleshooting

### Connection Failed?
- Check MongoDB Atlas IP whitelist (allow `0.0.0.0/0` for testing)
- Verify credentials in `.env.local`
- Check network connectivity

### Data Not Persisting?
- Ensure `MONGODB_URI` is set in `.env.local`
- Restart the development server after changing `.env.local`
- Check MongoDB Atlas cluster status

### Want to Switch Back to In-Memory?
- Remove or comment out `MONGODB_URI` in `.env.local`
- Restart the app

---

**✅ Database setup complete! All data will now persist in MongoDB Atlas.**

