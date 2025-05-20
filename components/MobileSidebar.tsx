import { SidebarComponent } from "@syncfusion/ej2-react-navigations";
import { Link } from "react-router";
import NavItems from "./NavItems";

const MobileSidebar = () => {
  let sidebar: SidebarComponent | null = null;

  const toggleSidebar = () => {
    if (sidebar) {
      sidebar.toggle();
    }
  };

  return (
    <div className="mobile-sidebar wrapper">
      <header className="flex items-center justify-between p-4 border-b">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/assets/icons/logo.svg"
            alt="logo"
            className="size-[30px]"
          />
          <h1 className="font-bold text-xl">Tourvisto</h1>
        </Link>

        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <img src="/assets/icons/menu.svg" alt="menu" className="size-7" />
        </button>
      </header>

      <SidebarComponent
        width={270}
        ref={(Sidebar) => (sidebar = Sidebar)}
        created={() => sidebar?.hide()}
        closeOnDocumentClick={true}
        showBackdrop={true}
        type="over"
        position="Right"
        zIndex={1050}
      >
        <NavItems handleClick={toggleSidebar} />
      </SidebarComponent>
    </div>
  );
};

export default MobileSidebar;
