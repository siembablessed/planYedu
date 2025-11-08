# Authentication & Sync Setup Guide

This app now includes authentication and real-time collaboration features using Supabase.

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Note your project URL and anon key from Settings > API

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set Up Database Tables

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  color TEXT NOT NULL,
  budget NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  shared_with TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo',
  priority TEXT NOT NULL DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  price NUMERIC,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create budget_categories table
CREATE TABLE IF NOT EXISTS budget_categories (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  allocated NUMERIC DEFAULT 0,
  spent NUMERIC DEFAULT 0,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create budget_expenses table
CREATE TABLE IF NOT EXISTS budget_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  category_id TEXT REFERENCES budget_categories(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  vendor TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  is_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_expenses ENABLE ROW LEVEL SECURITY;

-- Create policies for events
CREATE POLICY "Users can view their own events" ON events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own events" ON events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events" ON events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events" ON events
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for projects (including shared projects)
CREATE POLICY "Users can view their own or shared projects" ON projects
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid()::text = ANY(shared_with)
  );

CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own or shared projects" ON projects
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    auth.uid()::text = ANY(shared_with)
  );

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for tasks (through projects)
CREATE POLICY "Users can view tasks in their projects" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = tasks.project_id 
      AND (projects.user_id = auth.uid() OR auth.uid()::text = ANY(projects.shared_with))
    )
  );

CREATE POLICY "Users can insert tasks in their projects" ON tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = tasks.project_id 
      AND (projects.user_id = auth.uid() OR auth.uid()::text = ANY(projects.shared_with))
    )
  );

CREATE POLICY "Users can update tasks in their projects" ON tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = tasks.project_id 
      AND (projects.user_id = auth.uid() OR auth.uid()::text = ANY(projects.shared_with))
    )
  );

CREATE POLICY "Users can delete tasks in their projects" ON tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = tasks.project_id 
      AND (projects.user_id = auth.uid() OR auth.uid()::text = ANY(projects.shared_with))
    )
  );

-- Create policies for budget_categories
CREATE POLICY "Users can view their own budget categories" ON budget_categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budget categories" ON budget_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget categories" ON budget_categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget categories" ON budget_categories
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for budget_expenses
CREATE POLICY "Users can view their own budget expenses" ON budget_expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budget expenses" ON budget_expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget expenses" ON budget_expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget expenses" ON budget_expenses
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_categories_updated_at BEFORE UPDATE ON budget_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_expenses_updated_at BEFORE UPDATE ON budget_expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4. Enable Realtime (Optional but Recommended)

In Supabase Dashboard:
1. Go to Database > Replication
2. Enable replication for: events, projects, tasks, budget_categories, budget_expenses

### 5. Features Included

✅ Email/Password Authentication
✅ Sign Up / Sign In / Sign Out
✅ Password Reset
✅ Real-time data sync
✅ Collaborative editing (share projects with spouse/partners)
✅ Cloud data persistence
✅ Offline support (with AsyncStorage fallback)

### 6. Usage

After setup, users can:
- Sign up with email/password
- All data syncs to Supabase automatically
- Share projects by adding user IDs to `shared_with` array
- Real-time updates when collaborators make changes
- Data persists across devices

## Notes

- The app will work offline and sync when online
- Shared projects allow multiple users to collaborate
- All data is secured with Row Level Security policies
- User authentication is handled by Supabase Auth

