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

// Checking the path and handling the authentication callback or silent refresh.
// Only handles auth flow when the app first loads.
// Todo: handle auth flow when the app is refreshed or the user navigates to a different page.
switch (path) {
  case "/auth/post-login":
    const user = await authManager.handleSigninCallback(doStart);
    break;
  case "/ui/silent-refresh.html":
    await authManager.handleSilentRefresh();
    break;
  default:
    if (!(await authManager.checkAuth())) await authManager.login(path);
    else doStart();
    break;
}
