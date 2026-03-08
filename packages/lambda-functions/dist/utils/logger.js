"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const LOG_LEVEL = process.env.LOG_LEVEL || 'INFO';
const levels = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
};
const currentLevel = levels[LOG_LEVEL] || levels.INFO;
exports.logger = {
    debug: (message, meta) => {
        if (currentLevel <= levels.DEBUG) {
            console.log(JSON.stringify({ level: 'DEBUG', message, ...meta }));
        }
    },
    info: (message, meta) => {
        if (currentLevel <= levels.INFO) {
            console.log(JSON.stringify({ level: 'INFO', message, ...meta }));
        }
    },
    warn: (message, meta) => {
        if (currentLevel <= levels.WARN) {
            console.warn(JSON.stringify({ level: 'WARN', message, ...meta }));
        }
    },
    error: (message, meta) => {
        if (currentLevel <= levels.ERROR) {
            console.error(JSON.stringify({ level: 'ERROR', message, ...meta }));
        }
    },
};
//# sourceMappingURL=logger.js.map