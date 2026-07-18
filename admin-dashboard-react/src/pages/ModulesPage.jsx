import { useEffect, useState } from 'react';
import api from '../api';
import EditModuleModal from '../components/EditModuleModal';

export default function ModulesPage({ goToUpload }) {
  const [modules, setModules] = useState([]);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);

  async function load() {
    try {
      const res = await api.get('/modules');
      setModules(res.data);
    } catch (e) {
      console.error('modules error', e);
    }
  }

  useEffect(() => { load(); }, []);

  async function deleteModule(id) {
    if (!confirm('Delete this module? This cannot be undone.')) return;
    await api.delete(`/modules/${id}`);
    setModules((prev) => prev.filter((m) => m.module_id !== id));
  }

  const filtered = modules.filter((m) => {
    const q = query.toLowerCase();
    return m.title.toLowerCase().includes(q) || (m.category || '').toLowerCase().includes(q);
  });

  return (
    <div className="page">
      <div className="section-header">
        <span className="section-title">Learning Modules</span>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            className="search-input"
            placeholder="Search modules…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn btn-primary btn-sm" onClick={goToUpload}>+ Upload</button>
        </div>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th><th>Category</th><th>Type</th>
                <th>Duration</th><th>Status</th><th>Rating</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.module_id}>
                  <td><strong>{m.title}</strong></td>
                  <td>{m.category || '—'}</td>
                  <td><span className="badge badge-blue">{m.content_type}</span></td>
                  <td>{m.duration_mins ? `${m.duration_mins} min` : '—'}</td>
                  <td>
                    <span className={`badge ${m.is_published ? 'badge-green' : 'badge-gray'}`}>
                      {m.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>{m.avg_rating > 0 ? `⭐ ${parseFloat(m.avg_rating).toFixed(1)}` : '—'}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditing(m)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteModule(m.module_id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="icon">📭</div>
              <p>No modules found.</p>
            </div>
          )}
        </div>
      </div>

      {editing && (
        <EditModuleModal
          module={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}
