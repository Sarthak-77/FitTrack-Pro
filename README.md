# FitTrack Pro - Supabase Setup Guide

## 🚀 Quick Start

FitTrack Pro now uses **Supabase** for authentication and database! This makes setup much easier and gives you a production-ready backend.

## Prerequisites

- Node.js v18+ installed
- A Supabase account (free tier is perfect)

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (if you don't have one)
4. Click "New Project"
5. Fill in:
   - **Name**: FitTrack Pro
   - **Database Password**: (choose a strong password)
   - **Region**: Choose closest to you
6. Click "Create new project" (takes ~2 minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, click **Settings** (gear icon)
2. Go to **API** section
3. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

## Step 3: Update Configuration Files

### Update `js/supabase.js`

Open `/Users/sarthakkawatra/Documents/WebTech Hackathon/js/supabase.js` and replace:

```javascript
const supabaseUrl = 'YOUR_PROJECT_URL_HERE';
const supabaseAnonKey = 'YOUR_ANON_KEY_HERE';
```

With your actual values from Step 2.

## Step 4: Set Up Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the SQL from `database_schema.md`
4. Click "Run" to create all tables

The schema creates:
- `daily_stats` - Daily fitness statistics
- `activities` - Workout logs
- `meals` - Meal tracking
- Row Level Security policies (users can only see their own data)

## Step 5: Enable Google OAuth

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Google** and click to expand
3. Toggle "Enable Sign in with Google"
4. You'll need Google OAuth credentials:

### Get Google OAuth Credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure consent screen if prompted
6. Application type: **Web application**
7. Add Authorized redirect URIs:
   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```
   (Replace YOUR_PROJECT_REF with your actual project reference from Supabase URL)
8. Copy **Client ID** and **Client Secret**
9. Paste them into Supabase Google provider settings
10. Click **Save**

## Step 6: Start the Application

```bash
export PATH="/opt/homebrew/bin:$PATH"
npm start
```

Visit: **http://localhost:3000**

## 🎉 You're Done!

You can now:
- ✅ Sign in with Google
- ✅ Sign up with email/password
- ✅ Track activities, meals, and daily stats
- ✅ All data persists in Supabase
- ✅ Real-time updates across tabs

## Testing

1. Click "Continue with Google" to test OAuth
2. Or create an account with email/password
3. Add some activities and meals
4. Check Supabase dashboard → **Table Editor** to see your data

## Troubleshooting

### "Invalid API key"
- Double-check your Supabase URL and anon key in `js/supabase.js`

### Google OAuth not working
- Verify redirect URI matches exactly in Google Console
- Make sure Google provider is enabled in Supabase

### CORS errors
- Supabase handles CORS automatically, but make sure you're accessing via `http://localhost:3000`

## Production Deployment

When ready to deploy:

1. Update `js/supabase.js` with production URL
2. Deploy frontend to Vercel/Netlify
3. Update Google OAuth redirect URI with production URL
4. Add production URL to Supabase **Authentication** → **URL Configuration**

## Database Management

View your data in Supabase:
- **Table Editor**: See all your data
- **Authentication**: Manage users
- **SQL Editor**: Run custom queries

## Next Steps

- Customize the UI colors in `css/styles.css`
- Add more meal/activity types
- Implement data export features
- Add charts and analytics
