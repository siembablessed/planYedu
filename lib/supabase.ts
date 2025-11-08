import AsyncStorage from "@react-native-async-storage/async-storage";

// Check if Supabase is configured before attempting to load
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";
const IS_SUPABASE_CONFIGURED = 
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  SUPABASE_URL !== "YOUR_SUPABASE_URL" && 
  SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY";

// Dynamic import to avoid bundling issues
let supabaseModule: any = null;
let supabaseClient: any = null;

async function loadSupabase() {
  // Don't even try to load if not configured
  if (!IS_SUPABASE_CONFIGURED) {
    return null;
  }

  if (supabaseModule) return supabaseClient;

  try {
    // Use dynamic import with comprehensive error handling
    const module = await Promise.resolve(import("@supabase/supabase-js")).catch((err) => {
      // Suppress error - Supabase not available or not installed
      return null;
    });
    
    if (!module || !module.createClient) return null;
    
    const { createClient } = module;

    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });

    supabaseModule = module;
    return supabaseClient;
  } catch (error: any) {
    // Silently fail - Supabase not available
    return null;
  }
}

// Create a wrapper that handles async loading
export const supabase = {
  auth: {
    getSession: async () => {
      if (!IS_SUPABASE_CONFIGURED) {
        return { data: { session: null }, error: null };
      }
      const client = await loadSupabase();
      if (!client) return { data: { session: null }, error: null };
      return client.auth.getSession();
    },
    onAuthStateChange: (callback: any) => {
      if (!IS_SUPABASE_CONFIGURED) {
        return { data: { subscription: { unsubscribe: () => {} } } };
      }
      // onAuthStateChange is synchronous, but we need to load the client first
      // For now, return a dummy subscription and set up the real one asynchronously
      let subscription: any = { unsubscribe: () => {} };
      
      // Load client and set up the real subscription
      loadSupabase().then((client) => {
        if (client) {
          try {
            const result = client.auth.onAuthStateChange(callback);
            if (result?.data?.subscription) {
              subscription = result.data.subscription;
            }
          } catch (error) {
            console.warn("Error setting up auth state change listener:", error);
          }
        }
      }).catch((error) => {
        console.warn("Error loading Supabase client for auth:", error);
      });
      
      return { 
        data: { 
          subscription 
        } 
      };
    },
    signUp: async (credentials: any) => {
      if (!IS_SUPABASE_CONFIGURED) {
        return { data: null, error: { message: "Supabase not configured" } };
      }
      const client = await loadSupabase();
      if (!client) {
        return { data: null, error: { message: "Supabase not configured" } };
      }
      return client.auth.signUp(credentials);
    },
    signInWithPassword: async (credentials: any) => {
      if (!IS_SUPABASE_CONFIGURED) {
        return { data: null, error: { message: "Supabase not configured" } };
      }
      const client = await loadSupabase();
      if (!client) {
        return { data: null, error: { message: "Supabase not configured" } };
      }
      return client.auth.signInWithPassword(credentials);
    },
    signOut: async () => {
      if (!IS_SUPABASE_CONFIGURED) {
        return { error: { message: "Supabase not configured" } };
      }
      const client = await loadSupabase();
      if (!client) {
        return { error: { message: "Supabase not configured" } };
      }
      return client.auth.signOut();
    },
    resetPasswordForEmail: async (email: string) => {
      if (!IS_SUPABASE_CONFIGURED) {
        return { error: { message: "Supabase not configured" } };
      }
      const client = await loadSupabase();
      if (!client) {
        return { error: { message: "Supabase not configured" } };
      }
      return client.auth.resetPasswordForEmail(email);
    },
  },
};

