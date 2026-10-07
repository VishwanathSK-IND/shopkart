import { NavLink, useNavigate } from "react-router-dom";
import { logoutCustomer } from "../services/api";
import { useCart } from "../context/CartContext";

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition ${
    isActive ? "text-teal-600" : "text-gray-500 hover:text-gray-900"
  }`;

export default function Navbar() {
  const navigate = useNavigate();
  // Total units, derived from the shared cart state, so it updates instantly.
  const { totalUnits, clearCart } = useCart();

  const handleLogout = async () => {
    try {
      await logoutCustomer();
    } finally {
      clearCart();
      navigate("/login", { replace: true });
    }
  };

  return (
    <nav className="w-full bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <span className="text-lg font-semibold text-teal-600 tracking-tight">
          ShopKart
        </span>
        <div className="flex items-center gap-5">
          <NavLink to="/home" className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/products" className={navLinkClass}>
            Products
          </NavLink>
          <NavLink to="/wishlist" className={navLinkClass}>
            Wishlist
          </NavLink>
          <NavLink to="/cart" className={navLinkClass}>
            Cart ({totalUnits})
          </NavLink>
          <NavLink to="/orders" className={navLinkClass}>
            Orders
          </NavLink>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="rounded-full border border-gray-200 px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition"
      >
        Logout
      </button>
    </nav>
  );
}
