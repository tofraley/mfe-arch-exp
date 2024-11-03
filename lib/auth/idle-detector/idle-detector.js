export default class IdleDetector {
  constructor(timeoutMinutes = 15, logoutCallback) {
    this.timeoutMinutes = timeoutMinutes;
    this.logoutCallback = logoutCallback;
    this.lastActivityTime = Date.now();
    this.checkInterval = null;
    this.isTabActive = true;

    this.events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
      "keydown",
      "load",
    ];

    // Bind methods
    this.resetTimer = this.resetTimer.bind(this);
    this.checkIdle = this.checkIdle.bind(this);
    this.timeLeft = this.timeLeft.bind(this);
    this.init = this.init.bind(this);
  }

  init() {
    console.log("Initializing idle detector");
    // Add event listeners for all tracked events
    this.events.forEach((event) => {
      window.addEventListener(event, this.resetTimer);
    });

    // Start the idle check interval
    this.startIdleCheck();

    // Initial reset
    this.resetTimer();
  }

  startIdleCheck() {
    // Check every 10 seconds instead of waiting for the full timeout
    this.checkInterval = setInterval(this.checkIdle, 5000);
    this.resetTimer();
  }

  resetTimer() {
    console.log("Activity detected");
    this.lastActivityTime = Date.now();
  }

  checkIdle() {
    const currentTime = Date.now();
    const idleTime = currentTime - this.lastActivityTime;
    const timeoutInMs = this.timeoutMinutes * 60 * 1000;

    console.log(`idleTime ${idleTime} | timeoutInMs ${timeoutInMs}`);

    if (idleTime >= timeoutInMs) {
      this.endIdleCheck();
      this.logout();
    }
  }

  logout() {
    // Call the logout callback
    console.log("Logging out (idle detector)");
    if (this.logoutCallback) {
      this.logoutCallback();
    }
  }

  endIdleCheck() {
    // Clear the interval
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Remove all event listeners
    this.events.forEach((event) => {
      console.log(`Removing ${event} listener`);
      window.removeEventListener(event, this.resetTimer);
    });
  }

  // write a method that exposes the time left in seconds
  timeLeft() {
    const currentTime = Date.now();
    const idleTime = currentTime - this.lastActivityTime;
    const timeoutInMs = this.timeoutMinutes * 60 * 1000;
    const timeLeftInMs = timeoutInMs - idleTime;
    return Math.max(0, Math.floor(timeLeftInMs / 1000));
  }

  // Clean up method
  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.events.forEach((event) => {
      window.removeEventListener(event, this.resetTimer);
    });
  }
}
