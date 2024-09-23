import fs from "fs";
import path from "path";

class Logger {
  private logFile: string;

  constructor(filename: string) {
    this.logFile = path.join(process.cwd(), "logs", filename);

    // Ensure the logs directory exists
    const dir = path.dirname(this.logFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {recursive: true});
    }
  }

  private formatMessage(level: string, message: string, meta?: object): string {
    const timestamp = new Date().toISOString();
    const metaString = meta ? ` ${JSON.stringify(meta)}` : "";
    return `${timestamp} [${level}] ${message}${metaString}\n`;
  }

  private writeLog(message: string) {
    fs.appendFileSync(this.logFile, message);
    console.log(message.trim());
  }

  info(message: string, meta?: object) {
    const logMessage = this.formatMessage("INFO", message, meta);
    this.writeLog(logMessage);
  }

  warn(message: string, meta?: object) {
    const logMessage = this.formatMessage("WARN", message, meta);
    this.writeLog(logMessage);
  }

  error(message: string, meta?: object) {
    const logMessage = this.formatMessage("ERROR", message, meta);
    this.writeLog(logMessage);
  }
}

// Create a singleton instance
const logger = new Logger("app.log");

export default logger;
