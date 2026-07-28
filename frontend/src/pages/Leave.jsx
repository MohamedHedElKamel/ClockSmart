import { useOutletContext } from 'react-router-dom';

function Leave() {
  const {
    startDate, setStartDate,
    endDate, setEndDate,
    reason, setReason,
    handleLeaveSubmit,
    leaveRequests,
  } = useOutletContext();

  const statusPillClass = (s) => {
    const normalized = (s || '').toLowerCase();
    if (normalized.includes('approve')) return 'pill pill-approved';
    if (normalized.includes('reject') || normalized.includes('den')) return 'pill pill-rejected';
    return 'pill pill-pending';
  };

  return (
    <div>
      <h1>Leave Requests</h1>

      <section className="card">
        <h2 className="card-title">Request leave</h2>
        <form className="leave-form" onSubmit={handleLeaveSubmit}>
          <div className="field-row">
            <label className="field">
              <span className="field-label">Start date</span>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </label>
            <label className="field">
              <span className="field-label">End date</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </label>
          </div>
          <label className="field">
            <span className="field-label">Reason</span>
            <input type="text" placeholder="e.g. Family vacation" value={reason} onChange={(e) => setReason(e.target.value)} required />
          </label>
          <button className="btn btn-primary" type="submit">Submit request</button>
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
  );
}

export default Leave;