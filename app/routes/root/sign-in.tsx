import { Link, redirect, useNavigate } from "react-router";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { getCurrentUser, signInWithOAuth } from "~/supabase/auth";
import { useEffect, useState } from "react";
import { supabase } from "~/supabase/client";

export const AuthCallback = () => {
  const navigate = useNavigate();

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
};

export async function clientLoader() {
  try {
    const user = await getCurrentUser();
    if (user) return redirect("/dashboard");
    return null;
  } catch (e) {
    console.log("Error fetching user", e);
    return null;
  }
}

// Add hydrate property to clientLoader to ensure HydrateFallback works correctly
clientLoader.hydrate = true as const;

const SignIn = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        console.log("User already authenticated, redirecting to dashboard");
        window.location.href = "/dashboard";
      }
    };

    checkAuth();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Starting Google sign-in process");
      await signInWithOAuth("google");
      // The redirect happens automatically in signInWithOAuth
    } catch (error) {
      console.error("Google sign-in error:", error);
      setError(error instanceof Error ? error.message : String(error));
      setIsLoading(false);
    }
  };

  return (
    <main className="auth">
      <section className="size-full glassmorphism flex-center px-6">
        <div className="sign-in-card">
          <header className="header">
            <Link to="/">
              <img
                src="/assets/icons/logo.svg"
                alt="logo"
                className="size-[30px]"
              />
            </Link>
            <h1 className="p-28-bold text-dark-100">Tourvisto</h1>
          </header>

          {error && (
            <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg mb-4">
              {error}
            </div>
          )}

          <article>
            <h2 className="p-28-semibold text-dark-100 text-center">
              Start Your Travel Journey
            </h2>
            <p className="p-18-regular text-center text-gray-100 !leading-7">
              Sign in with Google to manage destinations, itineraries, and user
              activity with ease.
            </p>
          </article>

          <ButtonComponent
            type="button"
            className="button-class !h-11 !w-full"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="p-18-semibold text-white">Signing in...</span>
            ) : (
              <>
                <img
                  src="/assets/icons/google.svg"
                  className="size-5"
                  alt="google"
                />
                <span className="p-18-semibold text-white">
                  Sign in with Google
                </span>
              </>
            )}
          </ButtonComponent>
        </div>
      </section>
    </main>
  );
};

/**
 * This component is displayed during the initial hydration process
 * before the client loader completes
 */
export function HydrateFallback() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="hidden md:flex bg-gray-100">
        <div className="animate-pulse w-full h-full"></div>
      </div>
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="animate-pulse h-10 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="animate-pulse h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
          <div className="mt-8 space-y-6">
            <div className="animate-pulse h-12 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
