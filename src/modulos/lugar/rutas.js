const express = require('express');
const respuesta = require('../../red/respuestas');
const controlador = require('./index');

const router = express.Router();

router.get('/', todos);
router.get('/:id', uno);
router.get('/tipo/:tipo', porTipo);
router.get('/servicios/todos', obtenerTodosServicios);
router.get('/servicios/:serviciosIds', porServicios);
router.get('/:id/servicios', obtenerServiciosLugar);
router.post('/', agregar);
router.post('/:id/servicios', agregarServicioLugar);
router.put('/', eliminar);
router.delete('/:idLugar/servicios/:idServicio', eliminarServicioLugar);

async function todos(req, res, next) {
    const items = await controlador.todos();
    respuesta.success(req, res, items, 200);
}

async function uno(req, res, next) {
    const item = await controlador.uno(req.params.id);
    respuesta.success(req, res, item, 200);
}

async function porTipo(req, res, next) {
    const items = await controlador.porTipo(req.params.tipo);
    respuesta.success(req, res, items, 200);
}

async function porServicios(req, res, next) {
    const serviciosIds = req.params.serviciosIds.split(',').map(id => parseInt(id));
    const items = await controlador.porServicios(serviciosIds);
    respuesta.success(req, res, items, 200);
}

async function obtenerServiciosLugar(req, res, next) {
    const servicios = await controlador.obtenerServiciosLugar(req.params.id);
    respuesta.success(req, res, servicios, 200);
}

async function obtenerTodosServicios(req, res, next) {
    
    try {
        const servicios = await controlador.obtenerTodosServicios();   
        respuesta.success(req, res, servicios, 200);
    } catch (error) {
        console.error('RUTA - Error:', error);
        next(error);
    }
}

async function agregar(req, res, next) {
    const resultado = await controlador.agregar(req.body);
    const mensaje = req.body.IDLugar == 0 ? 
        'Lugar agregado satisfactoriamente' : 
        'Lugar modificado satisfactoriamente';
    respuesta.success(req, res, mensaje, 201);
}

async function agregarServicioLugar(req, res, next) {
    const resultado = await controlador.agregarServicioLugar(parseInt(req.params.id), parseInt(req.body.idServicio));
    respuesta.success(req, res, 'Servicio agregado al lugar satisfactoriamente', 201);
}

async function eliminar(req, res, next) {
    const resultado = await controlador.eliminar(req.body);
    const mensaje = resultado.affectedRows === 0 ?
        'El registro ya estaba eliminado o no existe' :
        'Lugar eliminado satisfactoriamente';
    respuesta.success(req, res, mensaje, 200);
}

async function eliminarServicioLugar(req, res, next) {
    const resultado = await controlador.eliminarServicioLugar(parseInt(req.params.idLugar), parseInt(req.params.idServicio));
    const mensaje = resultado.affectedRows === 0 ?
        'El servicio no estaba asignado al lugar' :
        'Servicio eliminado del lugar satisfactoriamente';
    respuesta.success(req, res, mensaje, 200);
}

module.exports = router;