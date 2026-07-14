import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import keycloak from './keycloak';

const COLORS = ['#facc15', '#4ade80', '#f87171']; // yellow, green, red for PENDING/APPROVED/REJECTED

function Dashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8080/api/dashboard/summary', {
      headers: { Authorization: `Bearer ${keycloak.token}` },
    })
      .then((response) => response.json())
      .then((data) => setSummary(data))
      .catch((error) => console.error('Error fetching dashboard summary:', error));
  }, []);

  if (!summary) {
    return <p>Loading dashboard...</p>;
  }

  const hoursData = Object.entries(summary.hoursPerEmployee).map(([name, hours]) => ({
    name,
    hours: parseFloat(hours.toFixed(2)),
  }));

  const leaveData = Object.entries(summary.leaveRequestsByStatus).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  return (
    <div>
     

      <div style={{ marginBottom: '20px' }}>
        <strong>Total Hours Worked:</strong> {summary.totalHoursWorked.toFixed(2)}h
      </div>

      <h3>Hours Worked per Employee</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={hoursData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="hours" fill="#60a5fa" />
        </BarChart>
      </ResponsiveContainer>

      <h3>Leave Requests by Status</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={leaveData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
            {leaveData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Dashboard;