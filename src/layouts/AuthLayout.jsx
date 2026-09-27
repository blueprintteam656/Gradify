import { Outlet } from 'react-router-dom';
import AuthSplitLayout from './AuthSplitLayout';

export default function AuthLayout() {
  return (
    <AuthSplitLayout>
      <Outlet />
    </AuthSplitLayout>
  );
}
