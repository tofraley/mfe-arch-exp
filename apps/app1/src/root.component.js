import { useState, useEffect } from "react";

export default function Root(props) {
  const [timeLeft, setTimeLeft] = useState(window.AuthService.timeLeft());
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(window.AuthService.timeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div>
      <h1>Welcome to the app!</h1>
      <p>Time left: {timeLeft}</p>
      <button onClick={() => window.AuthService.logout()}>Logout</button>
      <button onClick={() => window.AuthService.checkAuth()}>Check Auth</button>
      <button onClick={() => window.AuthService.navTo("/login")}>Login</button>
      <a href="login">Go!</a>
    </div>
  );
}
