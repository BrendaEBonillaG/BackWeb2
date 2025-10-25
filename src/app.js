const express = require('express');
const morgan = require('morgan');
const cors = require('cors'); // ← npm install cors
const config = require('./config');

const clientes = require('./modulos/clientes/rutas');
const usuarios = require('./modulos/usuarios/rutas');
const auth = require('./modulos/auth/rutas');

const error = require('./red/errors');

const app = express();

// 🔧 CONFIGURAR CORS CON PAQUETE
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

//Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log('Body recibido:', req.body);
    console.log('Headers:', req.headers['content-type']);
    next();
});

// Configuración
app.set('port', config.app.port);

// Rutas
app.use('/api/clientes', clientes);
app.use('/api/usuarios', usuarios);
app.use('/api/auth', auth);
app.use(error);

module.exports = app;