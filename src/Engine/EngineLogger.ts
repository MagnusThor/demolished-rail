export class EngineLogger {
    private static enabled = true; // Add a flag to control logging
  
    /**
     * Enables or disables logging.
     * @param enabled - Whether logging should be enabled or disabled.
     */
    static setEnabled(enabled: boolean) {
      this.enabled = enabled;
    }
  
    /**
     * Logs messages to the console if logging is enabled.
     * @param args - The messages to log.
     */
    static log(...args: any[]) {
      if (this.enabled) {
        console.log(...args);
      }
    }
  }