export class AuthManager {
  constructor(config) {
    this.userManager = new UserManager({
      // Your OIDC configuration
      ...config,
      // Reduce silent renew interval to catch potential idle timeouts
      silentRequestTimeout: 10000,
    });

    this.idleDetector = null;
    this.initializeIdleDetection = this.initializeIdleDetection.bind(this);

    // Initialize idle detection when user is logged in
    this.userManager.events.addUserLoaded(this.initializeIdleDetection);

    // Clean up idle detection when user is unloaded
    this.userManager.events.addUserUnloaded(() => {
      this.destroyIdleDetection();
    });
  }

  initializeIdleDetection() {
    // Destroy existing detector if it exists
    this.destroyIdleDetection();

    // Create new idle detector
    this.idleDetector = new IdleDetector(15, async () => {
      await this.logout();
    });
  }

  destroyIdleDetection() {
    if (this.idleDetector) {
      this.idleDetector.destroy();
      this.idleDetector = null;
    }
  }

  async login() {
    try {
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

  async handleSigninCallback() {
    try {
      const user = await this.userManager.signinRedirectCallback();
      this.initializeIdleDetection();
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
}
