import { useAuth } from '../AuthContext';

const TITLES = {
  dashboard: 'Dashboard',
  modules: 'Learning Modules',
  upload: 'Upload Module',
  users: 'User Management',
  reports: 'Reports',
};

export default function Topbar({ page }) {
  const { user } = useAuth();
  const name = user?.full_name || user?.name || '';

  return (
    <header className="topbar">
      <h2>{TITLES[page] || page}</h2>
      <div className="topbar-user">
        <div className="avatar">{name.charAt(0).toUpperCase() || 'A'}</div>
        <span style={{ fontSize: 14, fontWeight: 600 }}>{name}</span>
      </div>
    </header>
  );
}
