/* eslint-disable no-console */
import {
  navigateToUrl,
  pathToActiveWhen,
  registerApplication,
  start,
} from "single-spa";
import {
  constructApplications,
  constructRoutes,
  constructLayoutEngine,
} from "single-spa-layout";
import microfrontendLayout from "./microfrontend-layout.html";
import { AuthManager } from "lib";

const res = await fetch("/auth.json");

if (!res.ok) throw Error("Could not load auth config");

const authConf = await res.json();
const authManager = new AuthManager(authConf);

// Handle multiple cleanup scenarios
window.addEventListener("unload", () => authManager.destroy());
window.addEventListener("beforeunload", () => authManager.destroy());

window.AuthService = {
  checkAuth: authManager.checkAuth,
  login: authManager.login,
  logout: authManager.logout,
  timeLeft: authManager.timeLeft,
};

// the rest of the root-config
const routes = constructRoutes(microfrontendLayout);
const applications = constructApplications({
  routes,
  loadApp({ name }) {
    // console.log("app name", name);
    // if (name === "@org/login") return System.import(name);
    // if (!authManager.checkAuth()) {
    //   navigateToUrl("/login");
    //   return false;
    // }
    return System.import(name);
  },
});

window.addEventListener("single-spa:before-routing-event", async () => {
  const path = window.location.pathname;
  console.log("navigating to", path);
  if (path == "/auth/post-login") {
    const user = await authManager.handleSigninCallback();
    console.log("user", user);
    navigateToUrl("/");
  }
  if (path !== "/login" && !authManager.checkAuth()) {
    navigateToUrl("/login");
  }
});

const layoutEngine = constructLayoutEngine({ routes, applications });

applications.forEach(registerApplication);
layoutEngine.activate();
start();
