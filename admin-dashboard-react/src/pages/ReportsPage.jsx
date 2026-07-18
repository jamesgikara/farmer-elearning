import { useEffect, useState } from 'react';
import api from '../api';

export default function ReportsPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api.get('/reports/completion').then((res) => setRows(res.data)).catch(() => {});
  }, []);

  return (
    <div className="page">
      <div className="section-header">
        <span className="section-title">Completion Reports</span>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Module</th><th>Category</th><th>Completions</th><th>Downloads</th><th>Avg Rating</th></tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td><strong>{r.title}</strong></td>
                  <td>{r.category || '—'}</td>
                  <td>{r.total_completions}</td>
                  <td>{r.total_downloads}</td>
                  <td>{parseFloat(r.avg_rating).toFixed(1)} ★</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
