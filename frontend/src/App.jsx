import { useState, useEffect } from 'react';
import keycloak from './keycloak';
import './App.css';

function App() {
  const [message, setMessage] = useState('Loading...');
  const [employees, setEmployees] = useState([]);
  const [status, setStatus] = useState('');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const employeeId = 1; // temporary - hardcoded for now

  useEffect(() => {
    fetch('http://localhost:8080/api/hello')
      .then((response) => response.text())
      .then((data) => setMessage(data))
      .catch((error) => {
        console.error('Error fetching backend:', error);
        setMessage('Failed to reach backend');
      });

    fetchEmployees();
    fetchLeaveRequests();
  }, []);

  const fetchEmployees = () => {
    fetch('http://localhost:8080/api/employees', {
      headers: { Authorization: `Bearer ${keycloak.token}` },
    })
      .then((response) => response.json())
      .then((data) => setEmployees(data))
      .catch((error) => console.error('Error fetching employees:', error));
  };

  const fetchLeaveRequests = () => {
    fetch(`http://localhost:8080/api/leave-requests/employee/${employeeId}`, {
      headers: { Authorization: `Bearer ${keycloak.token}` },
    })
      .then((response) => response.json())
      .then((data) => setLeaveRequests(data))
      .catch((error) => console.error('Error fetching leave requests:', error));
  };

  const handleClockIn = () => {
    fetch(`http://localhost:8080/api/attendance/clock-in/${employeeId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${keycloak.token}` },
    })
      .then((response) => {
        if (!response.ok) throw new Error('Clock-in failed');
        return response.json();
      })
      .then((data) => setStatus(`Clocked in at ${data.clockIn}`))
      .catch((error) => setStatus(`Error: ${error.message}`));
  };

  const handleClockOut = () => {
    fetch(`http://localhost:8080/api/attendance/clock-out/${employeeId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${keycloak.token}` },
    })
      .then((response) => {
        if (!response.ok) throw new Error('Clock-out failed');
        return response.json();
      })
      .then((data) => setStatus(`Clocked out at ${data.clockOut}`))
      .catch((error) => setStatus(`Error: ${error.message}`));
  };

  const handleLeaveSubmit = (e) => {
    e.preventDefault();
    fetch(`http://localhost:8080/api/leave-requests/${employeeId}`, {
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
        fetchLeaveRequests();
      })
      .catch((error) => console.error('Error submitting leave request:', error));
  };

  return (
    <div>
      <h1>ClockSmart</h1>
      <p>Welcome, {keycloak.tokenParsed?.preferred_username}!</p>
      <p>Backend says: {message}</p>

      <h2>Clock In / Out</h2>
      <button onClick={handleClockIn}>Clock In</button>
      <button onClick={handleClockOut}>Clock Out</button>
      <p>{status}</p>

      <h2>Request Leave</h2>
      <form onSubmit={handleLeaveSubmit}>
        <label>
          Start date:
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
        </label>
        <br />
        <label>
          End date:
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
        </label>
        <br />
        <label>
          Reason:
          <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} required />
        </label>
        <br />
        <button type="submit">Submit Request</button>
      </form>

      <h3>My Leave Requests</h3>
      <ul>
        {leaveRequests.map((req) => (
          <li key={req.id}>
            {req.startDate} → {req.endDate} ({req.reason}) — <strong>{req.status}</strong>
          </li>
        ))}
      </ul>

      <h2>Employees</h2>
      <ul>
        {employees.map((emp) => (
          <li key={emp.id}>
            {emp.firstName} {emp.lastName} — {emp.position}
          </li>
        ))}
      </ul>

      <button onClick={() => keycloak.logout()}>Logout</button>
    </div>
  );
}

export default App;