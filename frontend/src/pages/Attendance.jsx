import { useOutletContext } from 'react-router-dom';

function Attendance() {
  const {
    now,
    handleClockIn,
    handleClockOut,
    status,
    attendanceHistory,
  } = useOutletContext();

  return (
    <div>
      <h1>Attendance</h1>

      <section className="punch-card">
        <div className="punch-readout">
          <span className="punch-date">
            {now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
          <span className="punch-time">{now.toLocaleTimeString(undefined, { hour12: true })}</span>
        </div>

        <div className="punch-actions">
          <button className="btn btn-clockin" onClick={handleClockIn}>Clock In</button>
          <button className="btn btn-clockout" onClick={handleClockOut}>Clock Out</button>
        </div>

        {status && <p className="punch-status">{status}</p>}
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
    </div>
  );
}

export default Attendance;