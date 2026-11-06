import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#F7F9FD] lg:grid lg:grid-cols-[230px_minmax(0,1fr)]">
      {/* Desktop Sidebar */}
      <div className="sticky top-0 hidden h-screen overflow-y-auto bg-[#10182E] lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-black/50"
          />

          <div className="relative h-full w-[min(280px,85vw)]">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="absolute right-3 top-3 z-10 rounded-lg bg-[#303E75] p-2 text-white"
            >
              <X size={20} />
            </button>

            <div
              className="h-full"
              onClick={(event) => {
                if (event.target.closest("a")) setMenuOpen(false);
              }}
            >
              <Sidebar />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="min-w-0">
        <div className="sticky top-0 z-20 min-h-[68px] border-b border-[#E8ECF5] bg-white">
          <div className="flex min-w-0 items-center">
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
              className="ml-2 shrink-0 rounded-lg p-2 text-[#17264C] lg:hidden"
            >
              <Menu size={24} />
            </button>

            <div className="min-w-0 flex-1 overflow-hidden">
              <Navbar />
            </div>
          </div>
        </div>

        <main className="min-w-0" key={location.pathname}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
