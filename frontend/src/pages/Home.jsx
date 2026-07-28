import { useOutletContext } from 'react-router-dom';

function Home() {
  const { currentEmployee, message } = useOutletContext();

  return (
    <div>
      <h1>Welcome, {currentEmployee?.firstName}!</h1>
      <p>This is your ClockSmart dashboard hub. Use the sidebar to clock in/out, manage leave requests, view your performance dashboard, or ask the AI assistant a question.</p>
      <p style={{ opacity: 0.6 }}>Backend status: {message}</p>
    </div>
  );
}

export default Home;