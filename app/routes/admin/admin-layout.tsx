import { Outlet, redirect } from "react-router";
import { SidebarComponent } from "@syncfusion/ej2-react-navigations";
import { MobileSidebar, NavItems } from "../../../components";
import { getCurrentUser, getExistingUser, storeUserData } from "~/supabase/auth";

export async function clientLoader() {
  try {
    console.log("Admin layout loader started");

    // First try to get the user directly
    const user = await getCurrentUser();
    console.log("getCurrentUser result:", user ? "User found" : "No user found");

    if (!user) {
      console.log("No user found, redirecting to sign-in");
      return redirect("/sign-in");
    }

    console.log("User found, ID:", user.id);
    const existingUser = await getExistingUser(user.id);
    console.log("Existing user check:", existingUser ? "User exists in database" : "User not in database");

    if (existingUser?.status === "user") {
      console.log("User has 'user' status, redirecting to root");
      return redirect("/");
    }

    if (existingUser) {
      console.log("Returning existing user data");
      return existingUser;
    } else {
      console.log("Storing new user data");
      return await storeUserData();
    }
  } catch (e) {
    console.error("Error in admin clientLoader:", e);
    return redirect("/sign-in");
  }
}

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <div className="lg:hidden">
        <MobileSidebar />
      </div>
      <aside className="w-full max-w-[270px] hidden lg:block bg-white shadow-md">
        <SidebarComponent width={270} enableGestures={false}>
          <NavItems />
        </SidebarComponent>
      </aside>
      <main className="children">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;