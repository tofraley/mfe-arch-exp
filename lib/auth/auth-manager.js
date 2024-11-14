import { UserManager } from "oidc-client";
import { navigateToUrl } from "single-spa";
import IdleDetector from "./idle-detector/idle-detector";

export class AuthManager {
  idleDetector = null;
  authSettings = null;
  isLoggedIn = false;

  constructor(config) {
    console.log("Constructing AuthManager", config);

    this.authSettings = config;

    this.userManager = new UserManager({
      // Your OIDC configuration
      ...config,
      // Reduce silent renew interval to catch potential idle timeouts
      silentRequestTimeout: 10000,
    });

    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.checkAuth = this.checkAuth.bind(this);
    this.initIdleDetector = this.initIdleDetector.bind(this);
    this.timeLeft = this.timeLeft.bind(this);

    // Initialize idle detection when user is logged in
    this.userManager.events.addUserLoaded(() => {
      this.isLoggedIn = true;
      this.initIdleDetector;
      console.log("user loaded");
    });

    // Clean up idle detection when user is unloaded
    this.userManager.events.addUserUnloaded(() => {
      this.isLoggedIn = false;
      this.destroyIdleDetection();
      console.log("user unloaded");
    });
  }

  initIdleDetector() {
    // Destroy existing detector if it exists
    this.destroyIdleDetection();

    this.idleDetector = new IdleDetector(15, async () => {
      console.log("User session timed out");
      await this.logout();
    });

    console.log("idle detector created", this.idleDetector != null);

    this.idleDetector.init();
  }

  destroyIdleDetection() {
    if (this.idleDetector) {
      this.idleDetector.destroy();
      this.idleDetector = null;
    }
  }

  async login(redirectUrl = "/") {
    try {
      console.log("authSettings", this.authSettings);
      this.userManager = new UserManager(this.authSettings);
      await this.userManager.signinRedirect({ state: { redirectUrl } });
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  async logout() {
    try {
      console.log("Logging out (auth manager)");
      this.destroyIdleDetection();
      await this.userManager.signoutRedirect();
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  }

  destroy() {
    this.destroyIdleDetection();
  }

  handleSigninCallback(callback) {
    try {
      return this.userManager.signinRedirectCallback().then((user) => {
        // this.initIdleDetector();
        console.log("callback doStart()");
        callback();
        navigateToUrl(user.state.redirectUrl);
        console.log("redirectUrl", user.state.redirectUrl);
        return user;
      });
    } catch (error) {
      console.error("Sign-in callback failed:", error);
      throw error;
    }
  }

  getUser() {
    return this.userManager.getUser();
  }

  // Optional: Method to manually reset the idle timer
  resetIdleTimer() {
    if (this.idleDetector) {
      this.idleDetector.resetTimer();
    }
  }

  async checkAuth() {
    const user = await this.getUser();
    this.isLoggedIn = user && !user.expired;
    console.log("is logged in", this.isLoggedIn);
    return this.isLoggedIn;
  }

  timeLeft() {
    return this.idleDetector?.timeLeft();
  }
}

let authManagerInstance = null;

export async function getAuthManager() {
  if (!authManagerInstance) {
    await setupAuthManager();
  }

  return authManagerInstance;
}

export async function setupAuthManager() {
  const authConfig = await fetchAuthConfig();
  authManagerInstance = new AuthManager(authConfig);
  setupWindow();
}

async function fetchAuthConfig() {
  try {
    const response = await fetch("/auth.json");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.error("There was a problem fetching the auth config:", error);
    throw error;
  }
}

function setupWindow() {
  // Handle multiple cleanup scenarios
  window.addEventListener("unload", () => authManagerInstance.destroy());
  window.addEventListener("beforeunload", () => authManagerInstance.destroy());

  // Attaching an object with auth methods to window
  // as a simple way to share across microfrontends
  window.AuthService = {
    checkAuth: authManagerInstance.checkAuth,
    login: authManagerInstance.login,
    logout: authManagerInstance.logout,
    timeLeft: authManagerInstance.timeLeft,
    checkAuth: authManagerInstance.checkAuth,
    navTo: navigateToUrl,
  };
}
