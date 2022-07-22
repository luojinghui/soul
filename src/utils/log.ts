/**
 * Log Print
 *
 * @summary log module
 * @author jinghui-Luo
 *
 * Created at     : 2022-06-22 11:49:36
 * Last modified  : 2022-07-22 13:10:47
 */

import VConsole from 'vconsole';
import { getParameterByName } from './index';

enum Level {
  'info' = 'info',
  'none' = 'none',
}

class Logger {
  public level: Level;
  private vConsole: VConsole | null;

  constructor() {
    this.level = getParameterByName('log') === 'true' ? Level.info : Level.none;

    this.vConsole = null;

    if (this.level === Level.info) {
      this.vConsole = new VConsole();
    }
  }

  setLevel(level: Level) {
    this.level = level;

    if (!this.level) {
      this.vConsole = new VConsole();
    }
  }

  log(title?: any, content?: any, ...rest: any) {
    if (this.level === Level.info) {
      console.log(title, content, ...rest);
    }
  }

  warn(...rest: any) {
    if (this.level === Level.info) {
      console.warn(...rest);
    }
  }
}

const logger = new Logger();

export default logger;
