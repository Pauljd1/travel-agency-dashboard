import { cn } from "lib/utils";
import { Link, NavLink, useLoaderData } from "react-router";
import { sidebarItems } from "~/constants";


export const NavItems = ({ handleClick }: { handleClick?: () => void }) => {
  const user = useLoaderData();
  return (
    <section className="nav-items">
      <Link to="/" className="link-logo">
        <img src="/assets/icons/logo.svg" alt="logo" className="size-[30px]" />
        <h1>TourVisto</h1>
      </Link>
      <div className="container">
        <nav>
          {sidebarItems.map(({ id, href, icon, label }) => (
            <NavLink
              to={href}
              key={id}
              end={href === "/dashboard"} // Only exact match for dashboard
            >
              {({ isActive }: { isActive: boolean }) => (
                <div
                  className={cn("group nav-item", {
                    "bg-primary-500 !text-white": isActive
                  })}
                  onClick={handleClick}
                >
                  <img
                    src={icon}
                    alt={label}
                    className={cn("size-6 group-hover:brightness-0 group-hover:invert", {
                      "brightness-0 invert": isActive,
                      "text-dark-200": !isActive
                    })}
                  />
                  {label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>
        <footer className="nav-footer">
          <img
            src={user?.image_url || "/assets/images/david.webp"}
            alt={user?.name || "User"}
            className="size-10 rounded-full object-cover"
          />
          <article>
            <h2 className="font-semibold">{user?.name}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </article>
          <button
            onClick={() => {
              console.log("logout");
            }}
            className="cursor-pointer hover:bg-gray-100 p-1 rounded-full"
          >
            <img
              src="/assets/icons/logout.svg"
              alt="logout"
              className="size-6"
            />
          </button>
        </footer>
      </div>
    </section>
  );
};

export default NavItems;
