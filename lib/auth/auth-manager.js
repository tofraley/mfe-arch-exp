import { UserManager } from "oidc-client";
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
    });

    // Clean up idle detection when user is unloaded
    this.userManager.events.addUserUnloaded(() => {
      this.isLoggedIn = false;
      this.destroyIdleDetection();
    });
  }

  initIdleDetector() {
    // Destroy existing detector if it exists
    this.destroyIdleDetection();

    this.idleDetector = new IdleDetector(1, async () => {
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

  async login() {
    try {
      console.log("authSettings", this.authSettings);
      this.userManager = new UserManager(this.authSettings);
      await this.userManager.signinRedirect();
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  async logout() {
    try {
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

  async handleSigninCallback() {
    try {
      const user = await this.userManager.signinRedirectCallback();
      this.initIdleDetector();
      return user;
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

  checkAuth() {
    console.log("Checking auth status:", this.isLoggedIn);
    return this.isLoggedIn;
  }

  timeLeft() {
    return this.idleDetector?.timeLeft();
  }
}
