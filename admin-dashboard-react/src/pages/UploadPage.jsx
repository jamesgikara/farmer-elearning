import { useEffect, useState } from 'react';
import api from '../api';

const EMPTY_FORM = {
  title: '', description: '', contentType: 'video',
  duration: '', fileUrl: '', thumbUrl: '', publish: false,
};

export default function UploadPage() {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data)).catch(() => setCategories([]));
  }, []);

  function set(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function submit() {
    setError('');
    setSuccess(false);
    if (!form.title.trim() || !categoryId) {
      setError('Title and category are required.');
      return;
    }
    try {
      await api.post('/modules', {
        title: form.title,
        description: form.description,
        category_id: categoryId,
        content_type: form.contentType,
        file_url: form.fileUrl || null,
        thumbnail_url: form.thumbUrl || null,
        duration_mins: parseInt(form.duration, 10) || null,
        is_published: form.publish,
      });
      setSuccess(true);
      setForm(EMPTY_FORM);
      setCategoryId(null);
    } catch (e) {
      setError(e.message || 'Upload failed.');
    }
  }

  return (
    <div className="page">
      <div className="section-header">
        <span className="section-title">Upload New Module</span>
      </div>
      <div className="card" style={{ maxWidth: 700 }}>
        <div className="card-body">
          <div className="grid-2">
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Title *</label>
              <input
                className="form-input"
                placeholder="e.g. Introduction to Maize Farming"
                value={form.title}
                onChange={set('title')}
              />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                rows={3}
                style={{ resize: 'vertical' }}
                placeholder="Brief description…"
                value={form.description}
                onChange={set('description')}
              />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Category *</label>
              <div className="pills">
                {categories.map((c) => (
                  <div
                    key={c.category_id}
                    className={`pill ${categoryId === c.category_id ? 'active' : ''}`}
                    onClick={() => setCategoryId(c.category_id)}
                  >
                    {c.name}
                  </div>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Content type</label>
              <div className="pills">
                {['video', 'text', 'image'].map((t) => (
                  <div
                    key={t}
                    className={`pill ${form.contentType === t ? 'active' : ''}`}
                    onClick={() => setForm((f) => ({ ...f, contentType: t }))}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </div>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Duration (minutes)</label>
              <input
                type="number"
                min="1"
                className="form-input"
                placeholder="e.g. 12"
                value={form.duration}
                onChange={set('duration')}
              />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">File URL (Cloudinary / CDN)</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://…"
                value={form.fileUrl}
                onChange={set('fileUrl')}
              />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Thumbnail URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://…"
                value={form.thumbUrl}
                onChange={set('thumbUrl')}
              />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="checkbox"
                style={{ width: 18, height: 18, accentColor: '#2D6A4F' }}
                checked={form.publish}
                onChange={(e) => setForm((f) => ({ ...f, publish: e.target.checked }))}
                id="uPublish"
              />
              <label htmlFor="uPublish" className="form-label" style={{ marginBottom: 0 }}>
                Publish immediately
              </label>
            </div>
          </div>
          {error && <div className="error-msg">{error}</div>}
          {success && <div style={{ color: 'var(--green-700)', fontSize: 13, marginTop: 8 }}>Module uploaded successfully! 🎉</div>}
          <br />
          <button className="btn btn-primary" onClick={submit}>Upload Module</button>
        </div>
      </div>
    </div>
  );
}
