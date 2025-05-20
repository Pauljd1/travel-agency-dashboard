import { Header } from "../../../components";
import { ColumnDirective, ColumnsDirective, GridComponent } from "@syncfusion/ej2-react-grids";
import { useLoaderData } from "react-router";
import { supabase } from "~/supabase/client";
import { cn, formatDate } from "lib/utils";
import {
  type LoaderData,
  type ProfileCreationResponse,
  type UserData,
  type UserServiceResponse
} from "./+types/all-users";

/**
 * Utility for consistent error handling
 */
const handleError = (e: unknown, context: string): string => {
  console.error(`Error in ${context}:`, e);
  return e instanceof Error ? e.message : String(e);
};

const userService = {
  async getProfiles(): Promise<UserServiceResponse> {
    try {
      const { data: profiles, count, error } = await supabase
        .from("profiles")
        .select("*", { count: "exact" });

      if (error) {
        console.error("Error fetching profiles:", error);
        return { users: [], total: 0, error: error.message };
      }

      const transformedProfiles = (profiles || []).map(profile => ({
        ...profile,
        // Ensure image_url is available, with fallback to avatar or default image
        image_url: profile.image_url || profile.avatar || "/assets/images/default-avatar.png"
      }));

      return {
        users: transformedProfiles,
        total: count || 0
      };
    } catch (e) {
      return {
        users: [],
        total: 0,
        error: handleError(e, "getProfiles")
      };
    }
  },

  // Only exported for use in admin actions, not used directly in component
  async createTestProfile(authUser?: any): Promise<ProfileCreationResponse> {
    try {
      if (authUser) {
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: authUser.id,
            user_id: authUser.id,
            name: authUser.user_metadata?.name || "Test User",
            email: authUser.email,
            status: "admin"
          })
          .select();

        if (insertError) {
          return { error: `Failed to create profile: ${insertError.message}` };
        }

        return { profile: newProfile?.[0] };
      } else {
        const testId = `test-${Date.now()}`;
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: testId,
            user_id: testId,
            name: "Test User",
            email: "test@example.com",
            status: "admin"
          })
          .select();

        if (insertError) {
          return { error: `Failed to create test profile: ${insertError.message}` };
        }

        return { profile: newProfile?.[0] };
      }
    } catch (e) {
      return { error: handleError(e, "createTestProfile") };
    }
  }
};

// Loader function
export const loader = async (): Promise<LoaderData> => {
  try {
    const { users, total, error } = await userService.getProfiles();

    if (error) {
      return { users: [], total: 0, error };
    }

    return { users, total };
  } catch (e) {
    return {
      users: [],
      total: 0,
      error: handleError(e, "loader")
    };
  }
};

// Component
function AllUsers() {
  const { users, error, total } = useLoaderData() as LoaderData;

  // Add null check for users
  if (!users && !error) {
    return <div>Loading...</div>;
  }

  return (
    <main className="dashboard wrapper">
      <Header title="Users" description="User management" />

      {error ? (
        <div className="p-4 text-red-500 border border-red-300 rounded bg-red-50">
          {error}
        </div>
      ) : users?.length === 0 ? (
        <div className="p-4 text-amber-700 border border-amber-300 rounded bg-amber-50">
          No users found in the database.
        </div>
      ) : (<GridComponent dataSource={users} gridLines="None">
          <ColumnsDirective>
            <ColumnDirective
              field="name"
              headerText="Name"
              width="200"
              textAlign="Left"
              template={(props: UserData) => (
                <div className="flex items-center gap-1.5 px-4">
                  <img src={props.image_url} alt="user" className="rounded-full size-8 aspect-square"
                       referrerPolicy="no-referrer" />
                  <span>{props.name}</span>
                </div>
              )}
            />
            <ColumnDirective
              field="email"
              headerText="Email Address"
              width="200"
              textAlign="Left"
            />
            <ColumnDirective
              field="joined_at"
              headerText="Date Joined"
              width="140"
              textAlign="Left"
              template={({ joined_at }: { joined_at: string }) => formatDate(joined_at)}
            />
            <ColumnDirective
              field="status"
              headerText="Type"
              width="100"
              textAlign="Left"
              template={({ status }: UserData) => (
                <article
                  className={cn("status-column", status === "user" ? "bg-success-50" : "bg-light-300")}>
                  <div
                    className={cn("size-1.5 rounded-full", status === "user" ? "bg-success-500" : "bg-gray-500")} />
                  <h3
                    className={cn("font-inter text-xs font-medium", status === "user" ? "text-success-700" : "text-gray-500")}>
                    {status}
                  </h3>
                </article>
              )}
            />
          </ColumnsDirective>
        </GridComponent>
      )}
    </main>
  );
}

export default AllUsers;

// Loading fallback for hydration
export function HydrateFallback() {
  return (
    <main className="dashboard wrapper">
      <Header title="Users" description="User management" />
      <div className="animate-pulse">
        <div className="h-10 bg-gray-100 rounded w-full mb-4"></div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 bg-gray-50 rounded w-full mb-2"></div>
        ))}
      </div>
    </main>
  );
}