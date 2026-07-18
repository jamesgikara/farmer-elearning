import { useEffect, useState } from 'react';
import api from '../api';

const ROLE_BADGE = { admin: 'badge-red', officer: 'badge-blue', farmer: 'badge-green' };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');

  async function load() {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (e) {
      console.error('users error', e);
    }
  }

  useEffect(() => { load(); }, []);

  async function toggleActive(id, active) {
    await api.put(`/users/${id}`, { is_active: active });
    setUsers((prev) => prev.map((u) => (u.user_id === id ? { ...u, is_active: active } : u)));
  }

  async function deleteUser(id, name) {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.user_id !== id));
    } catch (e) {
      alert(e.message);
    }
  }

  const filtered = users.filter((u) => {
    const q = query.toLowerCase();
    return (
      u.full_name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.includes(q)
    );
  });

  return (
    <div className="page">
      <div className="section-header">
        <span className="section-title">User Management</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search users…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Location</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.user_id}>
                  <td><strong>{u.full_name}</strong></td>
                  <td style={{ color: 'var(--muted)' }}>{u.email}</td>
                  <td><span className={`badge ${ROLE_BADGE[u.role] || 'badge-gray'}`}>{u.role}</span></td>
                  <td>{u.location || '—'}</td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-green' : 'badge-gray'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: 13 }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-ghost btn-sm" onClick={() => toggleActive(u.user_id, !u.is_active)}>
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.user_id, u.full_name)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="icon">👤</div>
              <p>No users found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
