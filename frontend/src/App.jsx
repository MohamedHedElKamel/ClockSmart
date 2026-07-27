import { useState, useEffect } from 'react';
import keycloak from './keycloak';
import './App.css';
import Dashboard from './Dashboard';
import AiChat from './AiChat';
import AdminPanel from './AdminPanel';

function App() {
  const [message, setMessage] = useState('Loading...');
  const [employees, setEmployees] = useState([]);
  const [status, setStatus] = useState('');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [now, setNow] = useState(new Date());
  const [isClockedIn, setIsClockedIn] = useState(false);
  const isAdmin = keycloak.hasRealmRole('admin');
  const [attendanceHistory, setAttendanceHistory] = useState([]);

useEffect(() => {
  fetch('http://localhost:8080/api/hello')
    .then((response) => response.text())
    .then((data) => setMessage(data))
    .catch((error) => {
      console.error('Error fetching backend:', error);
      setMessage('Failed to reach backend');
    });

  if (keycloak.hasRealmRole('admin')) {
    fetchEmployees();
  }
  fetchCurrentEmployee();
}, []);

  // Live ticking clock for the punch-card display
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchEmployees = () => {
    fetch('http://localhost:8080/api/employees', {
      headers: { Authorization: `Bearer ${keycloak.token}` },
    })
      .then((response) => response.json())
      .then((data) => setEmployees(data))
      .catch((error) => console.error('Error fetching employees:', error));
  };

const fetchCurrentEmployee = () => {
  fetch('http://localhost:8080/api/employees/me', {
    headers: { Authorization: `Bearer ${keycloak.token}` },
  })
    .then((response) => response.json())
    .then((data) => {
      setCurrentEmployee(data);
      fetchLeaveRequests(data.id);
      checkClockInStatus(data.id);
    })
    .catch((error) => console.error('Error fetching current employee:', error));
};

const checkClockInStatus = (employeeId) => {
  fetch(`http://localhost:8080/api/attendance/history/${employeeId}`, {
    headers: { Authorization: `Bearer ${keycloak.token}` },
  })
    .then((response) => response.json())
    .then((records) => {
      if (Array.isArray(records)) {
        const hasOpenSession = records.some((r) => r.clockOut === null);
        setIsClockedIn(hasOpenSession);
        
        setAttendanceHistory([...records].reverse());
      } else {
        console.error('Unexpected response for attendance history:', records);
      }
    })
    .catch((error) => console.error('Error checking clock-in status:', error));
};

const fetchLeaveRequests = (employeeId) => {
  fetch(`http://localhost:8080/api/leave-requests/employee/${employeeId}`, {
    headers: { Authorization: `Bearer ${keycloak.token}` },
  })
    .then((response) => response.json())
    .then((data) => {
      if (Array.isArray(data)) {
        setLeaveRequests(data);
      } else {
        console.error('Unexpected response for leave requests:', data);
        setLeaveRequests([]);
      }
    })
    .catch((error) => console.error('Error fetching leave requests:', error));
};

 const handleClockIn = () => {
  fetch(`http://localhost:8080/api/attendance/clock-in/${currentEmployee.id}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${keycloak.token}` },
  })
    .then((response) => {
      if (!response.ok) throw new Error('Clock-in failed');
      return response.json();
    })
    .then((data) => {
      setStatus(`Clocked in at ${data.clockIn}`);
      setIsClockedIn(true);
      
    })
    .then((data) => {
  setStatus(`Clocked in at ${data.clockIn}`);
  setIsClockedIn(true);
  checkClockInStatus(currentEmployee.id);
})
    .catch((error) => setStatus(`Error: ${error.message}`));
};

  const handleClockOut = () => {
  fetch(`http://localhost:8080/api/attendance/clock-out/${currentEmployee.id}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${keycloak.token}` },
  })
    .then((response) => {
      if (!response.ok) throw new Error('Clock-out failed');
      return response.json();
    })
    .then((data) => {
      setStatus(`Clocked out at ${data.clockOut}`);
      setIsClockedIn(false);
    })
    .then((data) => {
  setStatus(`Clocked in at ${data.clockIn}`);
  setIsClockedIn(true);
  checkClockInStatus(currentEmployee.id);
})
    .catch((error) => setStatus(`Error: ${error.message}`));

};

  const handleLeaveSubmit = (e) => {
  e.preventDefault();

  if (new Date(endDate) < new Date(startDate)) {
    setStatus('Error: End date cannot be before start date.');
    return;
  }

  fetch(`http://localhost:8080/api/leave-requests/${currentEmployee.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${keycloak.token}`,
      },
      body: JSON.stringify({ startDate, endDate, reason }),
    })
      .then((response) => {
        if (!response.ok) throw new Error('Leave request failed');
        return response.json();
      })
      .then(() => {
        setStartDate('');
        setEndDate('');
        setReason('');
        fetchLeaveRequests(currentEmployee.id);
      })
      .catch((error) => console.error('Error submitting leave request:', error));
  };

  const statusPillClass = (s) => {
    const normalized = (s || '').toLowerCase();
    if (normalized.includes('approve')) return 'pill pill-approved';
    if (normalized.includes('reject') || normalized.includes('den')) return 'pill pill-rejected';
    return 'pill pill-pending';
  };

  if (!currentEmployee) {
    return (
      <div className="app-shell">
        <div className="loading-card">
          <div className="loading-dot" />
          Loading your employee profile…
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">⏱</span>
          <span className="brand-name">ClockSmart</span>
        </div>
        <div className="topbar-right">
          <div className="welcome">
            <span className="welcome-label">Signed in as</span>
            <span className="welcome-name">
              {currentEmployee.firstName} {currentEmployee.lastName}
            </span>
          </div>
        
          <button className="btn btn-ghost" onClick={() => keycloak.logout()}>
            Log out
          </button>
        </div>
      </header>

      <main className="content">
        <section className="punch-card">
          <div className="punch-readout">
            <span className="punch-date">
              {now.toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span className="punch-time">
              {now.toLocaleTimeString(undefined, { hour12: true })}
            </span>
          </div>

          <div className="punch-actions">
            <button className="btn btn-clockin" onClick={handleClockIn} disabled={isClockedIn}>
               Clock In
            </button>
            <button className="btn btn-clockout" onClick={handleClockOut} disabled={!isClockedIn}>
              Clock Out
            </button>
          </div>

          {status && <p className="punch-status">{status}</p>}
          <p className="punch-backend">Backend status: {message}</p>
        </section>

        <section className="card">
  <h2 className="card-title">My Attendance History</h2>
  {attendanceHistory.length === 0 ? (
    <p className="empty-state">No attendance records yet.</p>
  ) : (
    <ul className="leave-list">
      {attendanceHistory.map((rec) => (
        <li className="leave-item" key={rec.id}>
          <div className="leave-dates">
            <span>{new Date(rec.clockIn).toLocaleString()}</span>
            <span className="leave-arrow">→</span>
            <span>{rec.clockOut ? new Date(rec.clockOut).toLocaleString() : 'Still clocked in'}</span>
          </div>
        </li>
      ))}
    </ul>
  )}
</section>

        <div className="grid-two">
          <section className="card">
            <h2 className="card-title">Request leave</h2>
            <form className="leave-form" onSubmit={handleLeaveSubmit}>
              <div className="field-row">
                <label className="field">
                  <span className="field-label">Start date</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </label>
                <label className="field">
                  <span className="field-label">End date</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </label>
              </div>
              <label className="field">
                <span className="field-label">Reason</span>
                <input
                  type="text"
                  placeholder="e.g. Family vacation"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </label>
              <button className="btn btn-primary" type="submit">
                Submit request
              </button>
            </form>
          </section>

          <section className="card">
            <h2 className="card-title">My leave requests</h2>
            {leaveRequests.length === 0 ? (
              <p className="empty-state">No leave requests yet. Submit one to get started.</p>
            ) : (
              <ul className="leave-list">
                {leaveRequests.map((req) => (
                  <li className="leave-item" key={req.id}>
                    <div className="leave-dates">
                      <span>{req.startDate}</span>
                      <span className="leave-arrow">→</span>
                      <span>{req.endDate}</span>
                    </div>
                    <div className="leave-reason">{req.reason}</div>
                    <span className={statusPillClass(req.status)}>{req.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

       {isAdmin && (
  <section className="card">
    <h2 className="card-title">Employees</h2>
    <ul className="employee-list">
      {employees.map((emp) => (
        <li className="employee-item" key={emp.id}>
          <div className="employee-avatar">
            {emp.firstName?.[0]}
            {emp.lastName?.[0]}
          </div>
          <div className="employee-info">
            <span className="employee-name">
              {emp.firstName} {emp.lastName}
            </span>
            <span className="employee-position">{emp.position}</span>
          </div>
        </li>
      ))}
    </ul>
  </section>
)}
{isAdmin && (
  <section className="card">
    <h2 className="card-title">Admin: Leave Requests</h2>
    <AdminPanel />
  </section>
)}
        <section className="card">
          <h2 className="card-title">Performance Dashboard</h2>
          <Dashboard />
        </section>

        <section className="card">
          <h2 className="card-title">Ask ClockSmart AI</h2>
          <AiChat />
        </section>
      
      </main>
    </div>
  );
}

export default App;