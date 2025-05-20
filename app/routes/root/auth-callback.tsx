import { useNavigate, useLoaderData } from "react-router";
import { useEffect, useState } from "react";
import { supabase } from "~/supabase/client";

export default function AuthCallback() {
  const navigate = useNavigate();
  const loaderData = useLoaderData();
  const [status, setStatus] = useState("Checking authentication...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("AuthCallback component mounted");
    // Supabase will automatically handle the hash fragment
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log(
          "Auth state changed:",
          event,
          session ? "Session exists" : "No session"
        );
        if (event === "SIGNED_IN" && session) {
          console.log("User signed in, redirecting to dashboard");
          // Redirect to dashboard or home page
          navigate("/dashboard");
        }
      }
    );

    // Check if the user is already signed in
    supabase.auth.getSession().then(({ data }) => {
      console.log(
        "Checking existing session:",
        data.session ? "Session exists" : "No session"
      );
      if (data.session) {
        console.log("Existing session found, redirecting to dashboard");
        navigate("/dashboard");
      }
    });

    return () => {
      // Clean up listener when component unmounts
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center p-8 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">
          Processing authentication...
        </h2>
        <p className="mb-4">Please wait while we complete your sign-in.</p>
      </div>
    </div>
  );
}

/**
 * This component is displayed during the initial hydration process
 */
export function HydrateFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center p-8 max-w-md mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 w-64 mx-auto rounded mb-4"></div>
          <div className="h-4 bg-gray-200 w-48 mx-auto rounded"></div>
        </div>
      </div>
    </div>
  );
}
