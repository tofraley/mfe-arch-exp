import { navigateToUrl } from "single-spa";
import { IdleDetector } from "./idle-detector/idle-detector.js";

export class MockAuthManager {
  isLoggedIn = false;
  idleDetector = null;

  constructor() {
    this.initIdleDetector();
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.checkAuth = this.checkAuth.bind(this);
    this.timeLeft = this.timeLeft.bind(this);
  }

  login() {
    console.log("Logging in");
    navigateToUrl("/");
    this.isLoggedIn = true;
    this.initIdleDetector();
    this.idleDetector.startIdleCheck();
  }

  logout() {
    console.log("Logging out");
    this.isLoggedIn = false;
    navigateToUrl("/login");

    if (this.idleDetector) {
      this.idleDetector.endIdleCheck();
    }
  }

  checkAuth() {
    console.log("Checking auth status:", this.isLoggedIn);
    return this.isLoggedIn;
  }

  initIdleDetector() {
    this.idleDetector = new IdleDetector(1, () => {
      console.log("User session timed out");
      this.logout();
    });
    this.idleDetector.init();
  }

  timeLeft() {
    return this.idleDetector.timeLeft();
  }
  
  destroy() {
    this.idleDetector.destroy();
  }
}

export const authManager = new MockAuthManager();
