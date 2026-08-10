import { useState, useEffect } from 'react';
import keycloak from './keycloak';
import { useToast } from './Toast';

const getValidationErrors = (user) => {
  const errors = {};

  if (!/^[a-zA-Z0-9_.]{3,20}$/.test(user.username)) {
    errors.username = 'Username must be 3-20 characters (letters, numbers, dots, underscores only).';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (user.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }
  if (!user.firstName.trim()) {
    errors.firstName = 'First name is required.';
  }
  if (!user.lastName.trim()) {
    errors.lastName = 'Last name is required.';
  }
  if (!user.position.trim()) {
    errors.position = 'Position is required.';
  }

  return errors;
};



function AdminPanel() {
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
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
  const [creating, setCreating] = useState(false);
  const showToast = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [touched, setTouched] = useState({});
  const liveErrors = getValidationErrors(newUser);
 useEffect(() => {
  fetchAllRequests();
  fetchEmployees();
}, []);


const markTouched = (field) => {
  setTouched((prev) => ({ ...prev, [field]: true }));
};


const fetchEmployees = () => {
  fetch('http://localhost:8080/api/employees', {
    headers: { Authorization: `Bearer ${keycloak.token}` },
  })
    .then((response) => response.json())
    .then((data) => setEmployees(data))
    .catch((error) => console.error('Error fetching employees:', error));
};
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
    .then(() => {
      fetchAllRequests();
      showToast(`Leave request ${status.toLowerCase()}.`, 'success');
    })
    .catch((error) => {
      console.error('Error updating status:', error);
      showToast('Failed to update leave request.', 'error');
    });
};

const toggleEnabled = (employeeId, currentlyEnabled) => {
  fetch(`http://localhost:8080/api/employees/${employeeId}/enabled?enabled=${!currentlyEnabled}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${keycloak.token}` },
  })
    .then((response) => {
      if (!response.ok) throw new Error('Failed to update employee status');
      return response.json();
    })
    .then(() => {
      fetchEmployees();
      showToast(`Employee ${!currentlyEnabled ? 'activated' : 'deactivated'}.`, 'success');
    })
    .catch((error) => {
      console.error('Error toggling employee status:', error);
      showToast('Failed to update employee status.', 'error');
    });
};


const handleCreateUser = (e) => {
  e.preventDefault();

  setTouched({
    username: true, email: true, password: true,
    firstName: true, lastName: true, position: true,
  });

  if (Object.keys(liveErrors).length > 0) {
    return;
  }

  setCreating(true);

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
      showToast(`${newUser.firstName} ${newUser.lastName} created successfully!`, 'success');
      setNewUser({
        username: '', email: '', firstName: '', lastName: '',
        position: '', password: '', role: 'employee',
      });
      setTouched({});
      setShowCreateForm(false);
      fetchEmployees();
    })
    .catch((error) => {
      showToast(`Failed to create employee: ${error.message}`, 'error');
    })
    .finally(() => setCreating(false));
};

  const statusPillClass = (s) => {
    const normalized = (s || '').toLowerCase();
    if (normalized.includes('approve')) return 'pill pill-approved';
    if (normalized.includes('reject')) return 'pill pill-rejected';
    return 'pill pill-pending';
  };

  return (
    <div>
      <div className="form-toggle-header">
  <h3 style={{ margin: 0 }}>Employees</h3>
  <button
    className="btn btn-primary"
    onClick={() => setShowCreateForm((prev) => !prev)}
  >
    {showCreateForm ? 'Cancel' : '+ Create Employee'}
  </button>
</div>

<div className={`collapsible ${showCreateForm ? 'collapsible-open' : ''}`}>
  <div className="collapsible-inner">
    <form onSubmit={handleCreateUser} className="leave-form">
      <div className="field-row">
        <label className="field">
          <span className="field-label">First name</span>
          <input
            type="text"
            value={newUser.firstName}
            onChange={(e) => {
              setNewUser({ ...newUser, firstName: e.target.value });
              markTouched('firstName');
            }}
            onBlur={() => markTouched('firstName')}
          />
          {touched.firstName && liveErrors.firstName && (
            <span className="field-error">{liveErrors.firstName}</span>
          )}
        </label>
        <label className="field">
          <span className="field-label">Last name</span>
          <input
            type="text"
            value={newUser.lastName}
            onChange={(e) => {
              setNewUser({ ...newUser, lastName: e.target.value });
              markTouched('lastName');
            }}
            onBlur={() => markTouched('lastName')}
          />
          {touched.lastName && liveErrors.lastName && (
            <span className="field-error">{liveErrors.lastName}</span>
          )}
        </label>
      </div>

      <div className="field-row">
        <label className="field">
          <span className="field-label">Username</span>
          <input
            type="text"
            value={newUser.username}
            onChange={(e) => {
              setNewUser({ ...newUser, username: e.target.value });
              markTouched('username');
            }}
            onBlur={() => markTouched('username')}
          />
          {touched.username && liveErrors.username && (
            <span className="field-error">{liveErrors.username}</span>
          )}
        </label>
        <label className="field">
          <span className="field-label">Email</span>
          <input
            type="email"
            value={newUser.email}
            onChange={(e) => {
              setNewUser({ ...newUser, email: e.target.value });
              markTouched('email');
            }}
            onBlur={() => markTouched('email')}
          />
          {touched.email && liveErrors.email && (
            <span className="field-error">{liveErrors.email}</span>
          )}
        </label>
      </div>

      <div className="field-row">
        <label className="field">
          <span className="field-label">Position</span>
          <input
            type="text"
            value={newUser.position}
            onChange={(e) => {
              setNewUser({ ...newUser, position: e.target.value });
              markTouched('position');
            }}
            onBlur={() => markTouched('position')}
          />
          {touched.position && liveErrors.position && (
            <span className="field-error">{liveErrors.position}</span>
          )}
        </label>
        <label className="field">
          <span className="field-label">Temporary password</span>
          <input
            type="password"
            value={newUser.password}
            onChange={(e) => {
              setNewUser({ ...newUser, password: e.target.value });
              markTouched('password');
            }}
            onBlur={() => markTouched('password')}
          />
          {touched.password && liveErrors.password && (
            <span className="field-error">{liveErrors.password}</span>
          )}
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

      <button className="btn btn-primary" type="submit" disabled={creating}>
        {creating ? 'Creating...' : 'Create Employee'}
      </button>
    </form>
  </div>
</div>

<h3>All Employees</h3>
<ul className="employee-list" style={{ marginBottom: '24px' }}>
  {employees.map((emp) => (
    <li className="employee-item" key={emp.id}>
      <div className="employee-avatar">
        {emp.firstName?.[0]}
        {emp.lastName?.[0]}
      </div>
      <div className="employee-info" style={{ flex: 1 }}>
        <span className="employee-name">
          {emp.firstName} {emp.lastName}
        </span>
        <span className="employee-position">{emp.position}</span>
      </div>
      <button
        className="btn btn-ghost"
        onClick={() => toggleEnabled(emp.id, emp.enabled)}
      >
        {emp.enabled ? 'Deactivate' : 'Activate'}
      </button>
    </li>
  ))}
</ul>

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