const express = require('express');
const morgan = require('morgan');
const cors = require('cors'); 
const config = require('./config');

const clientes = require('./modulos/clientes/rutas');
const usuarios = require('./modulos/usuarios/rutas');
const auth = require('./modulos/auth/rutas');
const lugares = require('./modulos/lugar/rutas'); 
const favoritos = require('./modulos/favoritos/rutas');
const resenas = require('./modulos/reseñas/rutas');
const comentarios = require('./modulos/comentarios/rutas');

const error = require('./red/errors');

const app = express();

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
    next();
});

// Configuración
app.set('port', config.app.port);

// Rutas
app.use('/api/clientes', clientes);
app.use('/api/usuarios', usuarios);
app.use('/api/auth', auth);
app.use('/api/lugares', lugares); 
app.use('/api/favoritos',favoritos);
app.use('/api/resenas', resenas);
app.use('/api/comentarios', comentarios);
app.use(error);

module.exports = app;