/* eslint-disable no-console */
import { navigateToUrl, registerApplication, start } from "single-spa";
import {
  constructApplications,
  constructRoutes,
  constructLayoutEngine,
} from "single-spa-layout";
import microfrontendLayout from "./microfrontend-layout.html";
import AuthManager from "lib";

const res = await fetch("/auth.json");

if (!res.ok) throw Error("Could not load auth config");

const authManager = new AuthManager(await res.json());

// Handle multiple cleanup scenarios
window.addEventListener("unload", () => authManager.destroy());
window.addEventListener("beforeunload", () => authManager.destroy());

// Attaching an object with auth methods to window
// as a simple way to share across microfrontends
window.AuthService = {
  checkAuth: authManager.checkAuth,
  login: authManager.login,
  logout: authManager.logout,
  timeLeft: authManager.timeLeft,
};

const routes = constructRoutes(microfrontendLayout);
const applications = constructApplications({
  routes,
  loadApp({ name }) {
    return System.import(name);
  },
});

// Listening for specific single-spa routing events
window.addEventListener("single-spa:before-routing-event", async () => {
  const path = window.location.pathname;

  // Handle any routes needed during login flow, i.e. post sign-in redirect
  if (path == "/auth/post-login") {
    const user = await authManager.handleSigninCallback();
    console.log("user", user);
    navigateToUrl("/");
  }

  // This works like and auth guard
  if (path !== "/login" && !authManager.checkAuth()) {
    navigateToUrl("/login");
  }
});

const layoutEngine = constructLayoutEngine({ routes, applications });

applications.forEach(registerApplication);
layoutEngine.activate();
start();
