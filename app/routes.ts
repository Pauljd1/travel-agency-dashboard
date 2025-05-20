import { layout, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  // Admin routes
  layout("routes/admin/admin-layout.tsx", [
    route("dashboard", "routes/admin/dashboard.tsx"),
    route("all-users", "routes/admin/all-users.tsx"),
    route("trips", "routes/admin/trips.tsx"),
    route("trips/create", "routes/admin/create-trip.tsx")
  ]),

  // Authentication routes
  route("sign-in", "routes/root/sign-in.tsx"),
  route("auth-callback", "routes/root/sign-in.tsx", {
    id: "auth-callback"
  })
] satisfies RouteConfig;