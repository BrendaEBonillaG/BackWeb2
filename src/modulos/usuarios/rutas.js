const express = require('express');
const respuesta = require('../../red/respuestas');
const controlador = require('./index');
const seguridad = require('./seguridad');

const router = express.Router();

router.get('/', todos);
router.get('/:id', uno);
router.post('/', seguridad(), agregar);
router.put('/', seguridad(), eliminar);

async function todos(req, res, next) {
    const items = await controlador.todos();
    respuesta.success(req, res, items, 200);
}

async function uno(req, res, next) {
    const item = await controlador.uno(req.params.id);
    respuesta.success(req, res, item, 200);
}

async function agregar(req, res, next) {
    const resultado = await controlador.agregar(req.body);
    const mensaje = req.body.IDUsuario == 0 ? 
        'Item agregado satisfactoriamente' : 
        'Item modificado satisfactoriamente';
    respuesta.success(req, res, mensaje, 201);
}

async function eliminar(req, res, next) {
    const resultado = await controlador.eliminar(req.body);
    const mensaje = resultado.affectedRows === 0 ?
        'El registro ya estaba eliminado o no existe' :
        'Item eliminado satisfactoriamente';
    respuesta.success(req, res, mensaje, 200);
}

module.exports = router; 