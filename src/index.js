const app = require('./app');
const { logger } = require('./utils/logger');
const { requestLogger, errorLogger } = require('./middleware/requestLogger');

app.use(requestLogger);

const PORT = app.get('port') || 4000;

process.on('uncaughtException', (error) => {
    logger.error('process', 'Excepción no capturada', error, {
        type: 'uncaughtException'
    });
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('process', 'Promise rechazada no manejada', new Error(reason), {
        type: 'unhandledRejection',
        promise: promise.toString()
    });
    process.exit(1);
});

const server = app.listen(PORT, () => {
    logger.info('server', `Servidor iniciado exitosamente`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        pid: process.pid
    });
    
    console.log("Servidor escuchando en el puerto", PORT);
});

app.use(errorLogger);

process.on('SIGTERM', () => {
    logger.info('server', 'Recibida señal SIGTERM, cerrando servidor gracefulmente');
    server.close(() => {
        logger.info('server', 'Servidor cerrado exitosamente');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('server', 'Recibida señal SIGINT, cerrando servidor');
    server.close(() => {
        logger.info('server', 'Servidor cerrado por interrupción');
        process.exit(0);
    });
});

module.exports = server;