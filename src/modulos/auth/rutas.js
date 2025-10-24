const express = require('express');
const respuesta = require('../../red/respuestas');
const controlador = require('./index');

const router = express.Router();

router.post('/login', login);

async function login(req, res, next) {
    const token = await controlador.login(req.body);
    respuesta.success(req, res, token, 200);
}

module.exports = router;