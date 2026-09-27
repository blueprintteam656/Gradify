import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

export default function SupervisorLayout() {
  return (
    <div className="supervisor-layout">
      <Navbar />
      <main className="supervisor-main">
        <Outlet />
      </main>
    </div>
  );
}
