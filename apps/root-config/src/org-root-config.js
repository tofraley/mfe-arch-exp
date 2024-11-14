/* eslint-disable no-console */
import { registerApplication, start } from "single-spa";
import {
  constructApplications,
  constructRoutes,
  constructLayoutEngine,
} from "single-spa-layout";
import microfrontendLayout from "./microfrontend-layout.html";
import { getAuthManager } from "lib";

const authManager = await getAuthManager();

function doStart() {
  // Constructing the routes and applications from the layout
  const routes = constructRoutes(microfrontendLayout);
  const applications = constructApplications({
    routes,
    loadApp({ name }) {
      return System.import(name);
    },
  });

  const layoutEngine = constructLayoutEngine({ routes, applications });

  applications.forEach(registerApplication);
  layoutEngine.activate();
  start();
}

const path = window.location.pathname;

switch (path) {
  case "/auth/post-login":
    const user = await authManager.handleSigninCallback(doStart);
    break;
  default:
    if (!(await authManager.checkAuth())) {
      authManager.login(path);
    } else {
      doStart();
    }
    break;
}
