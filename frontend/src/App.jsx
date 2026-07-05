import { useState, useEffect } from 'react';
import keycloak from './keycloak';
import './App.css';

function App() {
  const [message, setMessage] = useState('Loading...');
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8080/api/hello')
      .then((response) => response.text())
      .then((data) => setMessage(data))
      .catch((error) => {
        console.error('Error fetching backend:', error);
        setMessage('Failed to reach backend');
      });

    fetch('http://localhost:8080/api/employees', {
      headers: {
        Authorization: `Bearer ${keycloak.token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setEmployees(data))
      .catch((error) => console.error('Error fetching employees:', error));
  }, []);

  return (
    <div>
      <h1>ClockSmart</h1>
      <p>Welcome, {keycloak.tokenParsed?.preferred_username}!</p>
      <p>Backend says: {message}</p>

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