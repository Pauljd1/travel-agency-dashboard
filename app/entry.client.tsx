/**
 * Client entry point for the application
 * Handles hydration and initial auth state
 */

import { createBrowserRouter, Outlet, RouterProvider } from "react-router";
import { startTransition, StrictMode, useEffect, useState } from "react";
import { hydrateRoot } from "react-dom/client";
import SignIn, { AuthCallback, clientLoader as signInLoader } from "./routes/root/sign-in";
import AdminLayout, { clientLoader as adminLoader } from "./routes/admin/admin-layout";
import Dashboard from "./routes/admin/dashboard";
import AllUsers from "./routes/admin/all-users";
import Trips from "./routes/admin/trips";
import CreateTrip from "./routes/admin/create-trip";
import { supabase } from "./supabase/client";

// Console log registered routes for debugging
console.log("Client entry point initializing");

// Define the client routes for the browser router
// Loading fallback components for hydration
const DashboardFallback = () => (
  <div className="w-full h-screen bg-white p-8">
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const UsersGridFallback = () => (
  <div className="w-full h-screen bg-white p-8">
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
      <div className="h-12 bg-gray-100 rounded mb-2"></div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-10 bg-gray-50 rounded mb-1"></div>
      ))}
    </div>
  </div>
);

const routes = [
  {
    path: "/",
    element: <Outlet />,
    children: [
      {
        path: "sign-in",
        element: <SignIn />,
        loader: signInLoader,
        HydrateFallback: () => (
          <div className="w-full h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-pulse h-8 bg-gray-200 rounded w-32 mb-4 mx-auto"></div>
              <div className="animate-pulse h-4 bg-gray-200 rounded w-48 mx-auto"></div>
            </div>
          </div>
        )
      },
      {
        path: "auth-callback",
        element: <AuthCallback />,
        HydrateFallback: () => (
          <div className="w-full h-screen flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg">Processing authentication...</p>
            </div>
          </div>
        )
      },
      {
        path: "dashboard",
        element: <AdminLayout />,
        loader: adminLoader,
        HydrateFallback: () => (
          <div className="admin-layout">
            <div className="w-64 h-screen bg-gray-100"></div>
            <div className="flex-1 p-6 bg-white">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                <div className="h-40 bg-gray-100 rounded"></div>
              </div>
            </div>
          </div>
        ),
        children: [
          {
            index: true,
            element: <Dashboard />,
            HydrateFallback: DashboardFallback
          },
          {
            path: "all-users",
            element: <AllUsers />,
            HydrateFallback: UsersGridFallback,
            // Using the same loader as the server side to avoid hydration issues
            loader: async () => {
              const { supabase } = await import("./supabase/client");

              try {
                console.log(
                  "Starting client loader function to fetch profiles..."
                );

                // Now fetch the actual profiles with more debugging
                const { data: profiles, error } = await supabase
                  .from("profiles")
                  .select("*");

                console.log("Profiles query client result:", {
                  profiles,
                  error
                });

                if (error) {
                  console.error("Error fetching profiles:", error);
                  return { users: [], total: 0, error: error.message };
                }

                if (!profiles || profiles.length === 0) {
                  console.log("No profiles found in database");
                  return { users: [], total: 0, noRecords: true };
                }

                console.log(`Successfully loaded ${profiles.length} profiles`);
                return { users: profiles, total: profiles.length };
              } catch (e) {
                console.error("Error in client loader:", e);
                return {
                  users: [],
                  total: 0,
                  error: e instanceof Error ? e.message : String(e)
                };
              }
            }
          },
          {
            path: "trips",
            element: <Trips />,
            HydrateFallback: () => (
              <div className="w-full h-screen bg-white p-8">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="border rounded-lg p-4">
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          },
          {
            path: "trips/create",
            element: <CreateTrip />,
            HydrateFallback: () => (
              <div className="w-full h-screen bg-white p-8">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                  <div className="border rounded-lg p-6">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-10 bg-gray-100 rounded mb-4"></div>
                    <div className="h-10 bg-gray-100 rounded mb-4"></div>
                    <div className="h-10 bg-gray-100 rounded mb-4"></div>
                  </div>
                </div>
              </div>
            )
          }
        ]
      }
    ]
  }
];

// Log routes for debugging
console.log("Client-side routes configuration:", JSON.stringify(routes, null, 2));

// Create the browser router
const router = createBrowserRouter(routes);

function AuthAwareApp() {
  const [authChecked, setAuthChecked] = useState(false);

  // Check auth state when the component mounts
  useEffect(() => {
    console.log("Auth routes:", routes);
    const checkAuth = async () => {
      try {
        console.log("Checking auth state on hydration");

        // Skip auth check for auth callback pages - they handle auth themselves
        if (window.location.pathname === "/auth-callback") {
          console.log("On auth callback page, skipping redirect checks");
          setAuthChecked(true);
          return;
        }

        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error checking session:", error);
          setAuthChecked(true);
          return;
        }

        if (data.session) {
          console.log("Found existing session for user:", data.session.user.id);

          // If user is on login page but already authenticated, redirect to dashboard
          if (
            window.location.pathname === "/sign-in" ||
            window.location.pathname === "/"
          ) {
            console.log("Already authenticated, redirecting to dashboard");
            window.location.href = "/dashboard";
          }
        } else {
          console.log("No active session found");

          // If user is trying to access protected routes without auth, redirect to login
          if (window.location.pathname.startsWith("/dashboard")) {
            console.log(
              "Protected route access without auth, redirecting to login"
            );
            window.location.href = "/sign-in";
          }
        }

        setAuthChecked(true);
      } catch (e) {
        console.error("Error in auth check:", e);
        setAuthChecked(true);
      }
    };

    checkAuth();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log(
          "Auth state changed:",
          event,
          session ? "Has session" : "No session"
        );

        // Handle auth state changes for redirections
        if (event === "SIGNED_IN" && session) {
          if (window.location.pathname === "/sign-in") {
            window.location.href = "/dashboard";
          }
        } else if (event === "SIGNED_OUT") {
          if (window.location.pathname.startsWith("/dashboard")) {
            window.location.href = "/sign-in";
          }
        }
      }
    );

    return () => {
      // Cleanup listener on unmount
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Show a simple loading state until auth is checked
  if (!authChecked) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        Initializing application...
      </div>
    );
  }

  return <RouterProvider router={router} />;
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <AuthAwareApp />
    </StrictMode>
  );
});
