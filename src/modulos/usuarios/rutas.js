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
    try {
        const items = await controlador.todos();
        respuesta.success(req, res, items, 200);
    } catch (error) {
        next(error);
    }
}

async function uno(req, res, next) {
    try {
        const item = await controlador.uno(req.params.id);
        respuesta.success(req, res, item, 200);
    } catch (error) {
        next(error);
    }
}

async function agregar(req, res, next) {
    try {
        const resultado = await controlador.agregar(req.body);
        
        // Determinar si es creación o actualización
        const esActualizacion = req.body.IDUsuario && req.body.IDUsuario > 0;
        const mensaje = esActualizacion ? 
            'Usuario actualizado satisfactoriamente' : 
            'Usuario creado satisfactoriamente';
            
        respuesta.success(req, res, { 
            mensaje, 
            id: resultado.IDUsuario || req.body.IDUsuario 
        }, esActualizacion ? 200 : 201);
    } catch (error) {
        next(error);
    }
}

async function eliminar(req, res, next) {
    try {
        if (!req.body.IDUsuario) {
            return respuesta.error(req, res, 'IDUsuario es requerido para eliminar', 400);
        }

        const resultado = await controlador.eliminar(req.body);
        const mensaje = resultado.affectedRows === 0 ?
            'El usuario ya estaba eliminado o no existe' :
            'Usuario eliminado satisfactoriamente';
        respuesta.success(req, res, mensaje, 200);
    } catch (error) {
        next(error);
    }
}

module.exports = router;