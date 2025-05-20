import { NavLink } from "react-router";

export const NavItems = ({ items }) => {
  return (
    <nav className="nav-items">
      <ul>
        <li>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <span className="icon">📊</span>
            <span>Dashboard</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/dashboard/all-users" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <span className="icon">👥</span>
            <span>Users</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/dashboard/trips" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <span className="icon">✈️</span>
            <span>Trips</span>
          </NavLink>
        </li>
        {/* More navigation items can be added here */}
      </ul>
    </nav>
  );
};
