const express = require('express');
const respuesta = require('../../red/respuestas');
const controlador = require('./index');

const router = express.Router();

router.get('/login', login);



async function login (req, res, next) {
  try {
    const item = await controlador.login(req.params.usuario, req.params.password); 
    respuesta.success(req, res, item, 200);
  } catch (error) {
    next(error); // ← CORREGIDO
  }
};




module.exports = router;
