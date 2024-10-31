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
import { IdleDetector } from "./idle-detector";
import { authManager } from "./auth/mock-auth-manager";

// Handle multiple cleanup scenarios
window.addEventListener("unload", () => idleDetector.destroy());
window.addEventListener("beforeunload", () => idleDetector.destroy());

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
    console.log("app name", name);
    // if (name === "@org/app2") return System.import(name);
    // if (!authManager.checkAuth()) {
    //   navigateToUrl("/app2");
    //   return false;
    // }
    return System.import(name);
  },
});

window.addEventListener("single-spa:before-routing-event", () => {
  const path = window.location.pathname;
  if (path !== "/app2" && !authManager.checkAuth()) {
    navigateToUrl("/app2");
  }
});

const layoutEngine = constructLayoutEngine({ routes, applications });

applications.forEach(registerApplication);
layoutEngine.activate();
start();
