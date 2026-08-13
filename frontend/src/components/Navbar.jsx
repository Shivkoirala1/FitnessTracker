import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/nutrition", label: "Nutrition" },
  { to: "/workout", label: "Workout" },
  { to: "/cardio", label: "Cardio" },
  { to: "/history", label: "History" },
  { to: "/profile", label: "Profile" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  function handleLogout() {
    logout();
    setOpen(false);
    navigate("/login");
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-line bg-ink/95 backdrop-blur supports-[backdrop-filter]:bg-ink/80">
      <div className="max-w-4xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-signal" aria-hidden="true" />
          <span className="font-display font-bold text-xl tracking-wide uppercase">
            Richard<span className="text-signal">Gym</span>
          </span>
        </div>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-6 text-sm font-medium">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) => (isActive ? "text-signal" : "text-muted hover:text-bone transition-colors")}
            >
              {l.label}
            </NavLink>
          ))}
          <button onClick={handleLogout} className="text-muted hover:text-alert transition-colors">
            Log out
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="sm:hidden p-2 -mr-2 text-bone"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div className="sm:hidden border-t border-line bg-ink px-4 pb-4 pt-2 flex flex-col gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `py-2.5 px-2 rounded text-base ${isActive ? "text-signal" : "text-muted"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <button onClick={handleLogout} className="text-left py-2.5 px-2 text-alert text-base">
            Log out
          </button>
        </div>
      )}
    </nav>
  );
}
