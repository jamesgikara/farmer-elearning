import { useState } from 'react';
import { useAuth } from './AuthContext';
import LoginPage from './pages/LoginPage';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardPage from './pages/DashboardPage';
import ModulesPage from './pages/ModulesPage';
import UploadPage from './pages/UploadPage';
import UsersPage from './pages/UsersPage';
import ReportsPage from './pages/ReportsPage';

export default function App() {
  const { user } = useAuth();
  const [page, setPage] = useState('dashboard');

  if (!user) return <LoginPage />;

  return (
    <>
      <Sidebar page={page} setPage={setPage} />
      <div className="main">
        <Topbar page={page} />
        {page === 'dashboard' && <DashboardPage />}
        {page === 'modules' && <ModulesPage goToUpload={() => setPage('upload')} />}
        {page === 'upload' && <UploadPage />}
        {page === 'users' && <UsersPage />}
        {page === 'reports' && <ReportsPage />}
      </div>
    </>
  );
}
