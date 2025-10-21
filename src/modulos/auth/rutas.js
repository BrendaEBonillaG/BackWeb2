const express = require('express');
const respuesta = require('../../red/respuestas');
const controlador = require('./index');

const router = express.Router();

// Cambia a POST para login
router.post('/login', login);

async function login(req, res, next) {
  try {
    const { Usuario, Password } = req.body;
    const token = await controlador.login(Usuario, Password);
    respuesta.success(req, res, token, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = router;