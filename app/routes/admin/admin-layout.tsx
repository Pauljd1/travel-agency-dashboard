import { Outlet } from "react-router";

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <div className="lg:hidden">MobileSidebar</div>
      <aside className="w-full max-w-[270px] hidden lg:block">Sidebar</aside>
      <aside className="children">
        <Outlet />
      </aside>
    </div>
  );
};

export default AdminLayout;
