import { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
  LabelList,
} from 'recharts';
import keycloak from './keycloak';
import './Dashboard.css';

// Matches the status pill colors used elsewhere in the app
const STATUS_COLORS = {
  PENDING: '#e8a33d',
  APPROVED: '#2f9e64',
  REJECTED: '#e1574c',
};
const FALLBACK_COLORS = ['#e8a33d', '#2f9e64', '#e1574c', '#5c6784'];

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

  const hoursData = useMemo(() => {
    if (!summary) return [];
    return Object.entries(summary.hoursPerEmployee)
      .map(([name, hours]) => ({ name, hours: parseFloat(hours.toFixed(2)) }))
      .sort((a, b) => b.hours - a.hours);
  }, [summary]);

  const leaveData = useMemo(() => {
    if (!summary) return [];
    return Object.entries(summary.leaveRequestsByStatus).map(([status, count]) => ({
      name: status,
      value: count,
    }));
  }, [summary]);

  const totalLeaveRequests = leaveData.reduce((sum, d) => sum + d.value, 0);
  const employeeCount = hoursData.length;
  const avgHours = employeeCount ? summary?.totalHoursWorked / employeeCount : 0;
  const topFive = hoursData.slice(0, 5);

  if (!summary) {
    return (
      <div className="dash-loading">
        <div className="dash-loading-dot" />
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1 className="dash-heading">Dashboard</h1>

      {/* KPI row */}
      <div className="kpi-row">
        <div className="kpi-card">
          <span className="kpi-label">Total hours worked</span>
          <span className="kpi-value">{summary.totalHoursWorked.toFixed(1)}h</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Employees tracked</span>
          <span className="kpi-value">{employeeCount}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Avg hours / employee</span>
          <span className="kpi-value">{avgHours.toFixed(1)}h</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Leave requests</span>
          <span className="kpi-value">{totalLeaveRequests}</span>
        </div>
      </div>

      <div className="dash-grid">
        {/* Hours per employee */}
        <section className="dash-card dash-card-wide">
          <h2 className="dash-card-title">Hours worked per employee</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hoursData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#e2e5ec" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: '#5c6784' }}
                axisLine={{ stroke: '#e2e5ec' }}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 12, fill: '#5c6784' }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: 'rgba(28,37,65,0.04)' }}
                contentStyle={{
                  borderRadius: 10,
                  border: '1px solid #e2e5ec',
                  fontSize: 13,
                }}
              />
              <Bar dataKey="hours" fill="#e8a33d" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Leave requests donut */}
        <section className="dash-card">
          <h2 className="dash-card-title">Leave requests by status</h2>
          <div className="donut-wrap">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={leaveData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={64}
                  outerRadius={95}
                  paddingAngle={2}
                >
                  {leaveData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.name] || FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: '1px solid #e2e5ec', fontSize: 13 }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={28}
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, color: '#5c6784' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-center">
              <span className="donut-total">{totalLeaveRequests}</span>
              <span className="donut-total-label">total</span>
            </div>
          </div>
        </section>

        {/* Top 5 leaderboard */}
        <section className="dash-card">
          <h2 className="dash-card-title">Top 5 by hours</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={topFive}
              layout="vertical"
              margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={90}
                tick={{ fontSize: 12, fill: '#1c2541' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(28,37,65,0.04)' }}
                contentStyle={{ borderRadius: 10, border: '1px solid #e2e5ec', fontSize: 13 }}
              />
              <Bar dataKey="hours" fill="#1c2541" radius={[0, 6, 6, 0]} barSize={16}>
                <LabelList dataKey="hours" position="right" style={{ fontSize: 12, fill: '#5c6784' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Leave status proportion bar */}
        <section className="dash-card dash-card-wide">
          <h2 className="dash-card-title">Leave request mix</h2>
          <div className="proportion-bar">
            {leaveData.map((entry, index) => {
              const pct = totalLeaveRequests ? (entry.value / totalLeaveRequests) * 100 : 0;
              const color = STATUS_COLORS[entry.name] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
              return (
                <div
                  key={entry.name}
                  className="proportion-segment"
                  style={{ width: `${pct}%`, background: color }}
                  title={`${entry.name}: ${entry.value}`}
                />
              );
            })}
          </div>
          <div className="proportion-legend">
            {leaveData.map((entry, index) => {
              const color = STATUS_COLORS[entry.name] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
              const pct = totalLeaveRequests ? ((entry.value / totalLeaveRequests) * 100).toFixed(0) : 0;
              return (
                <div className="proportion-legend-item" key={entry.name}>
                  <span className="proportion-dot" style={{ background: color }} />
                  {entry.name} · {entry.value} ({pct}%)
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;