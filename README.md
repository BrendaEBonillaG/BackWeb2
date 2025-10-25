# Backend de Fantravel

## INTEGRANATES
-Luis David Treviño Olvera 1990122

-Joaquin Andres Garcia Salas 1905066

-Jorge Armando Serrano Caballero 1964304

-Brenda Elizabeth Bonilla González 2086032

## paquetes utilizados:
-Express

-Mysql

-Morgan

-Bcrypt

-Json Web Token


## Descripción de la Aplicación
Backend desarrollado con Node.js, Express y MySQL que proporciona una API REST completa para la gestión de usuarios. Incluye autenticación, CRUD de usuarios y manejo de sesiones con arquitectura modular y escalable.

## Características Principales
API RESTful con endpoints para usuarios y autenticación

Base de datos MySQL con tablas normalizadas

Arquitectura modular separada por capas (rutas, controladores, modelos)

Manejo de errores centralizado

Variables de entorno para configuración

Conexión automática y reconexión a base de datos

## Carpetas
- Dentro de SRC:
- modulos: manejo de cada tabla con controladores, rutas, seguriidad, etc.
- middleware: error.js se encarga de la manipulación del middleware dedicadoa la seguridad de la aplicación y manejo de errores mediante codigos personalizados.
- DB: manipulacion de funciones mysql.
- auth: contiene el index para manejo de autentificación del token de usuarios.
- app.js: configuración de paquetes utilizados, middleware y configuracion.js.

  ## Instrucciones de ejecución
 - Prerrequisitos
  -Node.js (versión 14 o superior)
  -MySQL (versión 5.7 o superior)
  -npm o yarn
   1. Clonar el Repositorio
    bash
    git clone [url-del-repositorio]
    cd BackWeb2
  2. Instalar Dependencias
  bash
  npm install
     Utilizar Insomnia para pruebas del api sin utilizar el front.
