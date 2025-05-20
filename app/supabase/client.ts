// app/supabase/client.ts
import { createClient } from "@supabase/supabase-js";

export const supabaseConfig = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  usersTable: import.meta.env.VITE_SUPABASE_USERS_TABLE,
  tripsTable: import.meta.env.VITE_SUPABASE_TRIPS_TABLE
};

// Check for environment variables
if (!supabaseConfig.supabaseUrl || !supabaseConfig.supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

// Detect if we're running on server or client
const isServer = typeof window === "undefined";

// Configure Supabase differently for server and client
const supabase = createClient(
  supabaseConfig.supabaseUrl,
  supabaseConfig.supabaseKey,
  {
    auth: {
      persistSession: !isServer, // Only persist session on client
      autoRefreshToken: !isServer, // Only auto-refresh on client
      storageKey: "travel-agency-auth",
      detectSessionInUrl: !isServer, // Only detect URL on client
      flowType: "implicit"
    },
    global: {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    }
  }
);

// Log the Supabase instance for debugging
console.log("Supabase client initialized", isServer ? "on server" : "in browser");

// Only run client-side operations in browser context
if (!isServer) {
  // This will only run in the browser
  supabase.auth.getSession().then(({ data }) => {
    console.log("Initial browser session check:", data.session ? "Found session" : "No session");
  });
}

export { supabase };