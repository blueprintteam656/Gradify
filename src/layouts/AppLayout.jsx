
import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

export default function AppLayout() {
  return (
    <div className="grid min-h-screen grid-cols-[230px_minmax(0,1fr)] bg-[#F7F9FD]">
      {/* Sidebar */}
      <div className="sticky top-0 h-screen overflow-y-auto bg-[#10182E]">
        <Sidebar />
      </div>

      {/* Main area */}
      <div className="min-w-0">
        <div className="sticky top-0 z-20 min-h-[68px] border-b border-[#E8ECF5] bg-white">
          <Navbar />
        </div>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
