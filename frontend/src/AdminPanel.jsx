import { useState, useEffect } from 'react';
import keycloak from './keycloak';

function AdminPanel() {
  const [requests, setRequests] = useState([]);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    position: '',
    password: '',
    role: 'employee',
  });
  const [createStatus, setCreateStatus] = useState('');

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

  const handleCreateUser = (e) => {
    e.preventDefault();
    setCreateStatus('Creating...');

    fetch('http://localhost:8080/api/employees/create-with-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${keycloak.token}`,
      },
      body: JSON.stringify(newUser),
    })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to create user');
        return response.json();
      })
      .then(() => {
        setCreateStatus(`Successfully created ${newUser.firstName} ${newUser.lastName}`);
        setNewUser({
          username: '',
          email: '',
          firstName: '',
          lastName: '',
          position: '',
          password: '',
          role: 'employee',
        });
      })
      .catch((error) => setCreateStatus(`Error: ${error.message}`));
  };

  const statusPillClass = (s) => {
    const normalized = (s || '').toLowerCase();
    if (normalized.includes('approve')) return 'pill pill-approved';
    if (normalized.includes('reject')) return 'pill pill-rejected';
    return 'pill pill-pending';
  };

  return (
    <div>
      <h3>Create New Employee</h3>
      <form onSubmit={handleCreateUser} className="leave-form">
  <div className="field-row">
    <label className="field">
      <span className="field-label">First name</span>
      <input
        type="text"
        value={newUser.firstName}
        onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
        required
      />
    </label>
    <label className="field">
      <span className="field-label">Last name</span>
      <input
        type="text"
        value={newUser.lastName}
        onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
        required
      />
    </label>
  </div>

  <div className="field-row">
    <label className="field">
      <span className="field-label">Username</span>
      <input
        type="text"
        value={newUser.username}
        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
        required
      />
    </label>
    <label className="field">
      <span className="field-label">Email</span>
      <input
        type="email"
        value={newUser.email}
        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
        required
      />
    </label>
  </div>

  <div className="field-row">
    <label className="field">
      <span className="field-label">Position</span>
      <input
        type="text"
        value={newUser.position}
        onChange={(e) => setNewUser({ ...newUser, position: e.target.value })}
        required
      />
    </label>
    <label className="field">
      <span className="field-label">Temporary password</span>
      <input
        type="password"
        value={newUser.password}
        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
        required
      />
    </label>
  </div>

  <label className="field">
    <span className="field-label">Role</span>
    <select
      className="form-control"
      value={newUser.role}
      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
    >
      <option value="employee">Employee</option>
      <option value="admin">Admin</option>
    </select>
  </label>

  <button className="btn btn-primary" type="submit">
    Create Employee
  </button>
  {createStatus && <p className="empty-state">{createStatus}</p>}
</form>

      <h3>Leave Requests</h3>
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