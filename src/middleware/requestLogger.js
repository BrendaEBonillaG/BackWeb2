const { httpLogger } = require('../utils/logger');

const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    // Log de request entrante
    httpLogger.info('📥 REQUEST RECIBIDA', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        contentType: req.get('Content-Type')
    });

    // Interceptar response para loggear cuando termine
    const originalSend = res.send;
    res.send = function(data) {
        const duration = Date.now() - start;
        
        httpLogger.info('📤 RESPONSE ENVIADA', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            contentLength: res.get('Content-Length')
        });

        originalSend.call(this, data);
    };

    next();
};

const errorLogger = (error, req, res, next) => {
    const { logger } = require('../utils/logger');
    
    logger.error('middleware', 'Error no manejado', error, {
        url: req.url,
        method: req.method,
        ip: req.ip,
        body: req.body,
        params: req.params,
        query: req.query
    });

    next(error);
};

module.exports = {
    requestLogger,
    errorLogger
};