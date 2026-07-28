import { useState, useEffect } from 'react';
import keycloak from './keycloak';
import Layout from './Layout';
import './App.css';

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
  const [attendanceHistory, setAttendanceHistory] = useState([]);

  const isAdmin = keycloak.hasRealmRole('admin');

  useEffect(() => {
    fetch('http://localhost:8080/api/hello')
      .then((response) => response.text())
      .then((data) => setMessage(data))
      .catch((error) => {
        console.error('Error fetching backend:', error);
        setMessage('Failed to reach backend');
      });

    if (isAdmin) {
      fetchEmployees();
    }
    fetchCurrentEmployee();
  }, []);

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

  const contextValue = {
    message,
    employees,
    status,
    leaveRequests,
    startDate, setStartDate,
    endDate, setEndDate,
    reason, setReason,
    currentEmployee,
    now,
    isClockedIn,
    attendanceHistory,
    handleClockIn,
    handleClockOut,
    handleLeaveSubmit,
  };

  return (
    <Layout isAdmin={isAdmin} currentEmployee={currentEmployee} context={contextValue} />
  );
}

export default App;