export default function Root(props) {
  return (
    <>
      <h1>Come back and see us sometime👋 </h1>
      <button onClick={window.AuthService.login}>Login</button>
      <button onClick={() => window.AuthService.navTo("/app1")}>App1</button>
    </>
  );
}
