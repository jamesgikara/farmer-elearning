import { useState } from 'react';
import api from '../api';
  export default function EditModuleModal({ module, onClose, onSaved }) {
    const [title, setTitle] = useState(module.title);
    const [description, setDescription] = useState(module.description || '');
    const [duration, setDuration] = useState(module.duration_mins || '');
    const [fileUrl, setFileUrl] = useState(module.file_url || '');
    const [thumbUrl, setThumbUrl] = useState(module.thumbnail_url || '');
    const [published, setPublished] = useState(!!module.is_published);
    const [saving, setSaving] = useState(false);

    async function save() {
        setSaving(true);
        try {
          await api.put(`/modules/${module.module_id}`, {
            title,
            description,
            duration_mins: parseInt(duration, 10) || null,
            file_url: fileUrl || null,
            thumbnail_url: thumbUrl || null,
            is_published: published,
          });
          onSaved();
        } finally {
          setSaving(false);
        }
      }
    
      return (
        <div className="overlay">
          <div className="modal">
            <div className="modal-title">Edit Module</div>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                rows={3}
                style={{ resize: 'vertical' }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Duration (minutes)</label>
              <input
                type="number"
                className="form-input"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">File URL (video/PDF — Cloudinary or any CDN)</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://…"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Thumbnail URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://…"
                value={thumbUrl}
                onChange={(e) => setThumbUrl(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="checkbox"
                style={{ width: 18, height: 18, accentColor: '#2D6A4F' }}
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                id="editPublish"
              />
              <label htmlFor="editPublish" className="form-label" style={{ marginBottom: 0 }}>
                Published
              </label>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      );
    }
    
  

  