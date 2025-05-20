/**
 * This file is a bridge between routes.ts and entry.client.tsx
 * to provide compatible route objects for createBrowserRouter
 */
import { Outlet } from "react-router";
import SignIn, { AuthCallback, clientLoader as signInLoader } from "./routes/root/sign-in";
import AdminLayout, { clientLoader as adminLoader } from "./routes/admin/admin-layout";
import AllUsers from "./routes/admin/all-users";
import Trips from "./routes/admin/trips";
import CreateTrip from "./routes/admin/create-trip";


// Update browserRoutes to precisely match server-side route structure
export const browserRoutes = [
  {
    path: "/",
    element: <Outlet />,
    children: [
      // Authentication routes
      {
        path: "sign-in",
        element: <SignIn />,
        loader: signInLoader
      },
      {
        path: "auth-callback",
        element: <AuthCallback />
      },

      // Admin routes structure
      {
        path: "dashboard",
        element: <AdminLayout />,
        loader: adminLoader,
        children: [
          {
            index: true,
            element: <div>Dashboard Home</div>
          },
          {
            path: "all-users",
            element: <AllUsers />
          }
        ]
      },

      // Make the trips routes direct children of the root but nested in admin layout
      {
        path: "dashboard/trips",
        element: <AdminLayout />,
        loader: adminLoader,
        children: [
          {
            index: true,
            element: <Trips />
          }
        ]
      },
      {
        path: "dashboard/trips/create",
        element: <AdminLayout />,
        loader: adminLoader,
        children: [
          {
            index: true,
            element: <CreateTrip />
          }
        ]
      }
    ]
  }
];
