import { useOutletContext } from 'react-router-dom';

function Home() {
  const { currentEmployee } = useOutletContext();

  return (
    <div>
      <section className="hero-banner">
        <div className="hero-overlay">
          <h1 className="hero-title">Welcome back, {currentEmployee?.firstName}!</h1>
          <p className="hero-subtitle">
            Use the sidebar to clock in/out, manage leave requests, view your performance
            dashboard, or ask the AI assistant a question.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Home;