import { useEffect, useState } from 'react';
import api from '../api';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [catEngagement, setCatEngagement] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [s, c] = await Promise.all([
          api.get('/reports/summary'),
          api.get('/reports/category-engagement'),
        ]);
        setSummary(s.data);
        setCatEngagement(c.data);
      } catch (e) {
        console.error('dashboard error', e);
      }
    })();
  }, []);

  const maxComp = Math.max(...catEngagement.map((r) => r.completions), 1);

  return (
    <div className="page">
      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeftColor: '#2D6A4F' }}>
          <div className="stat-icon">👩‍🌾</div>
          <div className="stat-value">{summary?.total_farmers ?? '—'}</div>
          <div className="stat-label">Total Farmers</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#3A86FF' }}>
          <div className="stat-icon">📚</div>
          <div className="stat-value">{summary?.published_modules ?? '—'}</div>
          <div className="stat-label">Published Modules</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#E07A5F' }}>
          <div className="stat-icon">✅</div>
          <div className="stat-value">{summary?.total_completions ?? '—'}</div>
          <div className="stat-label">Total Completions</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#F4A261' }}>
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{summary ? `${summary.avg_rating || '0.00'} ★` : '—'}</div>
          <div className="stat-label">Avg. Module Rating</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Category Engagement</span>
        </div>
        <div className="card-body">
          {catEngagement.map((r) => {
            const pct = Math.round((r.completions / maxComp) * 100);
            return (
              <div key={r.category} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{r.category}</span>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                    {r.module_count} modules · {r.completions} completions
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
