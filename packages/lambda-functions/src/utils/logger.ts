const LOG_LEVEL = process.env.LOG_LEVEL || 'INFO';

const levels = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const currentLevel = levels[LOG_LEVEL as keyof typeof levels] || levels.INFO;

export const logger = {
  debug: (message: string, meta?: any) => {
    if (currentLevel <= levels.DEBUG) {
      console.log(JSON.stringify({ level: 'DEBUG', message, ...meta }));
    }
  },
  info: (message: string, meta?: any) => {
    if (currentLevel <= levels.INFO) {
      console.log(JSON.stringify({ level: 'INFO', message, ...meta }));
    }
  },
  warn: (message: string, meta?: any) => {
    if (currentLevel <= levels.WARN) {
      console.warn(JSON.stringify({ level: 'WARN', message, ...meta }));
    }
  },
  error: (message: string, meta?: any) => {
    if (currentLevel <= levels.ERROR) {
      console.error(JSON.stringify({ level: 'ERROR', message, ...meta }));
    }
  },
};
