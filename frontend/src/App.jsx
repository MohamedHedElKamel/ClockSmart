import { useState, useEffect } from 'react';
import keycloak from './keycloak';
import './App.css';

function App() {
  const [message, setMessage] = useState('Loading...');
  const [employees, setEmployees] = useState([]);
  const [status, setStatus] = useState('');

  const employeeId = 1; // temporary - hardcoded for now, we'll link this to the logged-in user later

  useEffect(() => {
    fetch('http://localhost:8080/api/hello')
      .then((response) => response.text())
      .then((data) => setMessage(data))
      .catch((error) => {
        console.error('Error fetching backend:', error);
        setMessage('Failed to reach backend');
      });

    fetchEmployees();
  }, []);

  const fetchEmployees = () => {
    fetch('http://localhost:8080/api/employees', {
      headers: {
        Authorization: `Bearer ${keycloak.token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setEmployees(data))
      .catch((error) => console.error('Error fetching employees:', error));
  };

  const handleClockIn = () => {
    fetch(`http://localhost:8080/api/attendance/clock-in/${employeeId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${keycloak.token}`,
      },
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
      headers: {
        Authorization: `Bearer ${keycloak.token}`,
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error('Clock-out failed');
        return response.json();
      })
      .then((data) => setStatus(`Clocked out at ${data.clockOut}`))
      .catch((error) => setStatus(`Error: ${error.message}`));
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