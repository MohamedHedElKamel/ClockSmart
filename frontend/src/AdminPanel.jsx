import { useState, useEffect } from 'react';
import keycloak from './keycloak';

function AdminPanel() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchAllRequests();
  }, []);

  const fetchAllRequests = () => {
    fetch('http://localhost:8080/api/leave-requests', {
      headers: { Authorization: `Bearer ${keycloak.token}` },
    })
      .then((response) => response.json())
      .then((data) => setRequests(data))
      .catch((error) => console.error('Error fetching leave requests:', error));
  };

  const updateStatus = (requestId, status) => {
    fetch(`http://localhost:8080/api/leave-requests/${requestId}/status?status=${status}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${keycloak.token}` },
    })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to update status');
        return response.json();
      })
      .then(() => fetchAllRequests())
      .catch((error) => console.error('Error updating status:', error));
  };

  const statusPillClass = (s) => {
    const normalized = (s || '').toLowerCase();
    if (normalized.includes('approve')) return 'pill pill-approved';
    if (normalized.includes('reject')) return 'pill pill-rejected';
    return 'pill pill-pending';
  };

  return (
    <div>
      {requests.length === 0 ? (
        <p className="empty-state">No leave requests found.</p>
      ) : (
        <ul className="leave-list">
          {requests.map((req) => (
            <li className="leave-item" key={req.id}>
              <div className="leave-dates">
                <strong>{req.employee?.firstName} {req.employee?.lastName}</strong>
              </div>
              <div className="leave-dates">
                <span>{req.startDate}</span>
                <span className="leave-arrow">→</span>
                <span>{req.endDate}</span>
              </div>
              <div className="leave-reason">{req.reason}</div>
              <span className={statusPillClass(req.status)}>{req.status}</span>

              {req.status === 'PENDING' && (
                <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                  <button className="btn btn-primary" onClick={() => updateStatus(req.id, 'APPROVED')}>
                    Approve
                  </button>
                  <button className="btn btn-ghost" onClick={() => updateStatus(req.id, 'REJECTED')}>
                    Reject
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdminPanel;