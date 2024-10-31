export default function Root(props) {
  const isLoggedIn = window.AuthService.checkAuth();

  if (isLoggedIn) {
    return (
      <>
        <div>
          <h1>Welcome to the homepage!</h1>
          <button onClick={window.AuthService.logout}>Logout</button>
        </div>
      </>
    );
  } else {
    return (
      <>
        <h1>Come back and see us sometime👋 </h1>
        <button onClick={window.AuthService.login}>Login</button>
      </>
    );
  }
}
