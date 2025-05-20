import { supabase } from "./client";

// Ensure we have access to the crypto API for UUID generation
// UUID generation removed as we're using auth user IDs for profiles

export type User = {
  id: string;
  email: string;
  name?: string;
  imageUrl?: string | null;
  joinedAt?: Date | string;
};

export type OAuthProvider = "google" | "github" | "facebook" | "twitter";

export const getExistingUser = async (id: string) => {
  try {
    const { data, error, count } = await supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .eq("user_id", id);

    if (error) throw error;

    return count && count > 0 ? data[0] : null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

export const storeUserData = async () => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) throw new Error("User not found");

    const user = authData.user;

    // Get session to check for access token
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.provider_token || sessionData.session?.access_token;

    const profilePicture = accessToken
      ? await getGooglePicture(accessToken)
      : null;

    // Check for image in user metadata if Google API didn't return one
    const userImage = profilePicture || user.user_metadata?.picture || user.user_metadata?.avatar_url;

    const { data: createdUser, error } = await supabase
      .from("profiles")
      .insert({
        id: user.id, // Use the auth user ID as the profile ID
        user_id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split("@")[0],
        image_url: userImage,
        joined_at: new Date().toISOString(),
        status: "admin" // Set as admin by default
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create profile:", error);

      // Provide more specific error handling for foreign key constraint violations
      if (error.code === "23503" && error.message.includes("profiles_id_fkey")) {
        console.error("Foreign key constraint violation: The profile ID must match an auth user ID.");
        // The user ID doesn't exist in the auth.users table
      }

      // Instead of redirecting, we'll return null and let the caller handle it
      return null;
    }

    return createdUser;
  } catch (error) {
    console.error("Error storing user data:", error);
    return null;
  }
};

const getGooglePicture = async (token: string) => {
  try {
    // Check if we have a valid token before making the request
    if (!token || token.trim() === "") {
      console.log("No valid token for Google picture, skipping request");
      return null;
    }

    // Try first with the People API (requires specific scopes)
    try {
      const peopleResponse = await fetch(
        "https://people.googleapis.com/v1/people/me?personFields=photos",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (peopleResponse.ok) {
        const data = await peopleResponse.json();
        console.log("Successfully retrieved user photo from People API");
        return data.photos?.[0]?.url || null;
      }

      console.log("People API request failed, trying UserInfo endpoint");
    } catch (err) {
      console.log("Error with People API, falling back to UserInfo endpoint:", err);
    }

    // Fallback to UserInfo endpoint which is more commonly available
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!userInfoResponse.ok) {
      console.warn(
        `Google UserInfo API returned status ${userInfoResponse.status}: ${userInfoResponse.statusText}`
      );
      return null;
    }

    const userData = await userInfoResponse.json();
    console.log("Successfully retrieved user info from UserInfo endpoint");
    return userData.picture || null;
  } catch (error) {
    console.error("Error fetching Google picture:", error);
    return null; // Just return null on error, don't interrupt the flow
  }
};

export const signInWithOAuth = async (provider: OAuthProvider) => {
  try {
    // Check if running in browser
    if (typeof window === "undefined") {
      throw new Error(
        "OAuth sign-in can only be performed in a browser environment"
      );
    }

    // First clear any existing session to avoid conflicts
    await supabase.auth.signOut();
    console.log("Cleared any existing sessions before OAuth sign-in");

    console.log("Starting OAuth sign-in with provider:", provider);

    // Make sure to use the full URL for the redirect
    const redirectUrl = new URL(
      "/auth-callback",
      window.location.origin
    ).toString();
    console.log("Redirect URL:", redirectUrl);

    // Attempt the OAuth sign-in
    const { error, data } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: false, // Ensure browser redirects
        queryParams: {
          access_type: "offline",
          prompt: "consent"
        }
      }
    });

    if (error) {
      console.error("Error during OAuth session creation:", error);
      throw error;
    }

    console.log("OAuth sign-in initiated successfully", data);

    // Safely try to store in localStorage
    try {
      window.localStorage.setItem("authInProgress", "true");
    } catch (e) {
      console.warn("Could not store auth progress in localStorage:", e);
    }

    // Supabase OAuth sign-in automatically redirects the user
    return data;
  } catch (error) {
    console.error("Error during OAuth session creation:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error during logout:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error during logout:", error);
    return false;
  }
};

export const getCurrentUser = async () => {
  try {
    console.log("getCurrentUser: Checking for session");

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      console.error("getCurrentUser: Session error:", sessionError);
      return null;
    }

    console.log("getCurrentUser: Session info:", {
      exists: !!sessionData.session,
      expiresAt: sessionData.session?.expires_at,
      userId: sessionData.session?.user?.id
    });

    if (!sessionData.session) {
      console.log(
        "getCurrentUser: No active session from getSession, trying getUser directly"
      );

      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError) {
        console.error(
          "getCurrentUser: Error getting user directly:",
          userError
        );
        return null;
      }

      if (userData.user) {
        console.log("getCurrentUser: User found directly:", userData.user.id);
        return userData.user;
      }

      console.log("getCurrentUser: No user found by any method");
      return null;
    }

    console.log("getCurrentUser: Session found, getting user details");
    // If we have a session, proceed to get the user
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error("getCurrentUser: Error getting user:", error);
      throw error;
    }

    console.log("getCurrentUser: User retrieved successfully:", data.user?.id);
    return data.user;
  } catch (error) {
    console.error("getCurrentUser: Error fetching current user:", error);
    return null;
  }
};

export const getAllUsers = async (limit: number, offset: number) => {
  try {
    // Use "profiles" table directly since that's what exists in the database
    const { data: users, count } = await supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .range(offset, offset + limit - 1);

    const total = count || 0;

    if (total === 0) return { users: [], total };

    return { users, total };
  } catch (e) {
    console.log("Error fetching users");
    return { users: [], total: 0 };
  }
};
