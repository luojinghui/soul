/**
 * Log Print
 *
 * @summary log module
 * @author jinghui-Luo
 *
 * Created at     : 2022-06-22 11:49:36
 * Last modified  : 2022-08-23 21:16:54
 */

import VConsole from 'vconsole';
import { getParameterByName, getMillTime } from './index';

enum Level {
  'info' = 'info',
  'none' = 'none',
}

class Logger {
  public level: Level;

  constructor() {
    this.level = getParameterByName('log') === 'true' ? Level.info : Level.none;

    if (this.level === Level.info) {
      const vConsole = new VConsole();
    }
  }

  setLevel(level: Level) {
    this.level = level;

    if (!this.level) {
      const vConsole = new VConsole();
    }
  }

  log(title: string, content: any = '', ...rest: any[]) {
    if (this.level === Level.info) {
      console.log(`[${getMillTime()}]`, title, content, ...rest);
    }
  }

  importantLog(content: string) {
    console.info(`[${getMillTime()}]`, content);
  }

  warn(...rest: any) {
    if (this.level === Level.info) {
      console.warn(`[${getMillTime()}]`, ...rest);
    }
  }
}

const logger = new Logger();

export default logger;
