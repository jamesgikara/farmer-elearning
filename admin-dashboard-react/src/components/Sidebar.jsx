import { useAuth } from '../AuthContext';

const NAV_ITEMS = [
  { key: 'dashboard', icon: '📊', label: 'Dashboard' },
  { key: 'modules',   icon: '📚', label: 'Modules' },
  { key: 'upload',    icon: '⬆️', label: 'Upload Module' },
  { key: 'users',     icon: '👥', label: 'Users', adminOnly: true },
  { key: 'reports',   icon: '📈', label: 'Reports', adminOnly: true },
];

export default function Sidebar({ page, setPage }) {
  const { user, logout } = useAuth();
  const isOfficer = user?.role === 'officer';

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>🌱 FarmerLearn</h1>
        <p>Admin Dashboard</p>
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.filter((item) => !(item.adminOnly && isOfficer)).map((item) => (
          <div
            key={item.key}
            className={`nav-item ${page === item.key ? 'active' : ''}`}
            onClick={() => setPage(item.key)}
          >
            <span className="nav-icon">{item.icon}</span> {item.label}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={logout}>
          <span>🚪</span> Sign out
        </button>
      </div>
    </aside>
  );
}
