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
// // Listening for specific single-spa routing events
// window.addEventListener("single-spa:before-routing-event", async () => {
//   const path = window.location.pathname;

//   // Handle any routes needed during login flow, i.e. post sign-in redirect
//   if (path == "/auth/post-login") {
//     const user = await authManagerInstance.handleSigninCallback(doStart);
//     // doStart();
//   }

//   // // This works like and auth guard
//   // if (path !== "/login" && !authManagerInstance.checkAuth()) {
//   //   navigateToUrl("/login");
//   //   // authManagerInstance.login();
//   // }
// });

// Handle any routes needed during login flow, i.e. post sign-in redirect
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

// if (path == "/auth/post-login") {
//   const user = await authManager.handleSigninCallback(doStart);
// } else if (!authManager.checkAuth()) {
//   authManager.login();
// }
