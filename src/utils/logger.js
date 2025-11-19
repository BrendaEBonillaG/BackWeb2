const winston = require('winston');
const path = require('path');
const fs = require('fs');

const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const logFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

const consoleFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'HH:mm:ss'
    }),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let log = `${timestamp} [${level}]: ${message}`;
        
        if (Object.keys(meta).length > 0) {
            const cleanMeta = { ...meta };
            delete cleanMeta.stack;
            if (Object.keys(cleanMeta).length > 0) {
                log += ` | ${JSON.stringify(cleanMeta)}`;
            }
        }
        
        return log;
    })
);

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: {
        service: 'backend-web2'
    },
    transports: [
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            maxsize: 10485760, 
            maxFiles: 5,
        }),
        
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            maxsize: 10485760, 
            maxFiles: 5,
        }),

        new winston.transports.File({
            filename: path.join(logsDir, 'http.log'),
            maxsize: 10485760,
            maxFiles: 3,
        })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: consoleFormat
    }));
}

const httpLogger = winston.createLogger({
    level: 'info',
    format: logFormat,
    defaultMeta: { service: 'backend-web2-http' },
    transports: [
        new winston.transports.File({
            filename: path.join(logsDir, 'http.log'),
            maxsize: 10485760,
            maxFiles: 3,
        })
    ]
});

logger.start = (module, action, meta = {}) => {
    logger.info(`INICIANDO: ${action}`, { module, action, ...meta });
};

logger.success = (module, action, meta = {}) => {
    logger.info(`EXITOSO: ${action}`, { module, action, ...meta });
};

logger.error = (module, action, error, meta = {}) => {
    logger.error(`ERROR: ${action}`, { 
        module, 
        action, 
        error: error.message, 
        stack: error.stack,
        ...meta 
    });
};

logger.db = (operation, table, meta = {}) => {
    logger.debug(`DB: ${operation}`, { 
        module: 'database', 
        operation, 
        table, 
        ...meta 
    });
};

module.exports = {
    logger,
    httpLogger
};