# Setting Up Supabase Authentication

This guide will help you configure Supabase for authentication in your planYedu app.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Fill in your project details:
   - **Name**: Choose a name for your project
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to your users
5. Click "Create new project" and wait for it to be set up (takes ~2 minutes)

## Step 2: Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll see two important values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (a long string starting with `eyJ...`)

## Step 3: Configure Environment Variables

1. In your project root directory, create a file named `.env`
2. Add the following content (replace with your actual values):

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important**: 
- Replace `https://xxxxx.supabase.co` with your actual Project URL
- Replace `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` with your actual anon/public key
- Do NOT commit the `.env` file to git (it should already be in `.gitignore`)

## Step 4: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the SQL schema from `SETUP_AUTH.md` (if it exists) or create the necessary tables
3. Run the SQL to create the required tables for your app

## Step 5: Configure Authentication

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Enable **Email** provider (it's usually enabled by default)
3. Configure email templates if needed
4. Set up email confirmation settings:
   - **Enable email confirmations**: Toggle based on your preference
   - **Site URL**: Set to your app's URL (for web) or deep link (for mobile)

## Step 6: Restart Your Development Server

After creating/updating the `.env` file:

1. Stop your current development server (Ctrl+C)
2. Restart it:
   ```bash
   npm start
   # or
   npx expo start
   ```

**Important**: Environment variables are only loaded when the server starts, so you must restart after changing `.env`.

## Step 7: Test Authentication

1. Open your app
2. Go to Profile screen
3. Try creating an account
4. Check your email for the confirmation link (if email confirmation is enabled)

## Troubleshooting

### "Supabase not configured" error

- Make sure the `.env` file exists in the project root
- Verify the variable names are exactly: `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Ensure you've restarted the development server after creating/updating `.env`
- Check that your values don't contain quotes or extra spaces

### Authentication not working

- Verify your Supabase project is active
- Check that Email provider is enabled in Authentication settings
- Make sure your database schema is set up correctly
- Check the browser console or Metro bundler logs for detailed error messages

### Environment variables not loading

- For Expo, make sure variable names start with `EXPO_PUBLIC_`
- Restart the development server completely
- Clear cache: `npx expo start -c`

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)

## Security Notes

- Never commit your `.env` file to version control
- The `anon/public` key is safe to use in client-side code (it's designed for this)
- Never expose your `service_role` key in client-side code
- Use Row Level Security (RLS) policies in Supabase to protect your data

