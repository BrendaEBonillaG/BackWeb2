DROP DATABASE web2;

CREATE DATABASE Web2;
USE Web2;

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Admin';
FLUSH PRIVILEGES;

SELECT * FROM Usuario;
SELECT * FROM Auth;
SELECT * FROM Lugar;
SELECT * FROM Lugar_Servicio;
SELECT * FROM Fotos;
SELECT * FROM Resenas;
SELECT * FROM Comentarios;
SELECT * FROM Servicios;
SELECT * FROM Favoritos;


-- Tabla de usuarios
CREATE TABLE Usuario(
  IDUsuario INT AUTO_INCREMENT PRIMARY KEY,
  Nombre VARCHAR(100) NOT NULL,
  Correo VARCHAR(100) NOT NULL UNIQUE,
  Telefono VARCHAR(20) NOT NULL,
  Foto VARCHAR(255) NULL, -- ruta o URL de la foto
  Activo TINYINT(1) NOT NULL DEFAULT 1 -- 1 = activo, 0 = inactivo
);

CREATE TABLE Auth(
IDAuth INT PRIMARY KEY,
Usuario VARCHAR(30) NOT NULL,
Password VARCHAR(255) NOT NULL -- mejor para hash
);
-- Tabla de lugares (ACTUALIZADA)
CREATE TABLE Lugar(
  IDLugar INT AUTO_INCREMENT PRIMARY KEY,
  Nombre VARCHAR(100) NOT NULL,
  Direccion VARCHAR(200) NOT NULL,
  Info VARCHAR(400) NOT NULL,
  Tipo VARCHAR(50) NOT NULL, -- Hospedaje o turístico
  Latitud DECIMAL(10, 8) NULL, -- Coordenada latitud para el mapa
  Longitud DECIMAL(11, 8) NULL, -- Coordenada longitud para el mapa
  URLMapa VARCHAR(500) NULL, -- URL embed de Google Maps
  Activo TINYINT(1) NOT NULL DEFAULT 1
);

-- Tabla de servicios (pre-cargados)
CREATE TABLE Servicios (
  IDServicios INT AUTO_INCREMENT PRIMARY KEY,
  Nombre VARCHAR(50) NOT NULL,
  Logo VARCHAR(255) NULL, -- ruta o URL del logo
  Activo TINYINT(1) NOT NULL DEFAULT 1
);

-- Relación muchos a muchos Lugar-Servicios
CREATE TABLE Lugar_Servicio (
  IDLugar INT NOT NULL,
  IDServicio INT NOT NULL,
  PRIMARY KEY (IDLugar, IDServicio),
  FOREIGN KEY (IDLugar) REFERENCES Lugar(IDLugar) ON DELETE CASCADE,
  FOREIGN KEY (IDServicio) REFERENCES Servicios(IDServicios) ON DELETE CASCADE
);

-- Tabla de fotos de los lugares
CREATE TABLE Fotos(
  IDFoto INT AUTO_INCREMENT PRIMARY KEY,
  Foto VARCHAR(255) NOT NULL, -- ruta o URL de la foto
  LugarFK INT NOT NULL,
  FOREIGN KEY (LugarFK) REFERENCES Lugar(IDLugar) ON DELETE CASCADE
);

-- Tabla de reseñas
CREATE TABLE Resenas(
  IDResenas INT AUTO_INCREMENT PRIMARY KEY,
  Calificacion INT NOT NULL,
  Fecha DATETIME NOT NULL,
  Texto TEXT NOT NULL,
  Ventajas VARCHAR(200) NOT NULL,
  Recomendacion TINYINT(1) NOT NULL, -- 0 = No, 1 = Sí
  LugarFK INT NOT NULL,
  UsuarioFK INT NOT NULL,
  Activo TINYINT(1) NOT NULL DEFAULT 1,
  FOREIGN KEY (LugarFK) REFERENCES Lugar(IDLugar) ON DELETE CASCADE,
  FOREIGN KEY (UsuarioFK) REFERENCES Usuario(IDUsuario) ON DELETE CASCADE
);

-- Tabla de comentarios
CREATE TABLE Comentarios(
  IDComentarios INT AUTO_INCREMENT PRIMARY KEY,
  Texto TEXT NOT NULL,
  Fecha DATETIME NOT NULL,
  UsuarioFK INT NOT NULL,
  ResenaFK INT NOT NULL,
  Activo TINYINT(1) NOT NULL DEFAULT 1,
  FOREIGN KEY (UsuarioFK) REFERENCES Usuario(IDUsuario) ON DELETE CASCADE,
  FOREIGN KEY (ResenaFK) REFERENCES Resenas(IDResenas) ON DELETE CASCADE
);

-- Tabla de favoritos
CREATE TABLE Favoritos(
  IDFavoritos INT AUTO_INCREMENT PRIMARY KEY,
  UsuarioFK INT NOT NULL,
  LugarFK INT NOT NULL,
  FOREIGN KEY (UsuarioFK) REFERENCES Usuario(IDUsuario) ON DELETE CASCADE,
  FOREIGN KEY (LugarFK) REFERENCES Lugar(IDLugar) ON DELETE CASCADE
);


-- Servicios básicos de hospedaje
INSERT INTO Servicios (Nombre, Logo, Activo) VALUES
('Wi-Fi Gratuito', '/assets/iconos/wifi.png', 1),
('Estacionamiento', '/assets/iconos/parking.png', 1),
('Alberca', '/assets/iconos/pool.png', 1),
('TV por Cable', '/assets/iconos/tv.png', 1);

-- Servicios de alimentación
INSERT INTO Servicios (Nombre, Logo, Activo) VALUES
('Desayuno Incluido', '/assets/iconos/breakfast.png', 1),
('Restaurante', '/assets/iconos/restaurant.png', 1),
('Room Service', '/assets/iconos/room-service.png', 1),
('Bar', '/assets/iconos/bar.png', 1);

-- Servicios de recreación y wellness
INSERT INTO Servicios (Nombre, Logo, Activo) VALUES
('Gimnasio', '/assets/iconos/gym.png', 1),
('Spa', '/assets/iconos/spa.png', 1),
('Jacuzzi', '/assets/iconos/jacuzzi.png', 1),
('Terraza', '/assets/iconos/terrace.png', 1);

-- Servicios adicionales
INSERT INTO Servicios (Nombre, Logo, Activo) VALUES
('Lavandería', '/assets/iconos/laundry.png', 1),
('Recepción 24 Horas', '/assets/iconos/reception.png', 1),
('Traslado Aeropuerto', '/assets/iconos/airport-shuttle.png', 1),
('Alquiler de Autos', '/assets/iconos/car-rental.png', 1);

-- Servicios para mascotas (comunes en NL)
INSERT INTO Servicios (Nombre, Logo, Activo) VALUES
('Pet Friendly', '/assets/iconos/pet-friendly.png', 1);

-- Servicios de accesibilidad
INSERT INTO Servicios (Nombre, Logo, Activo) VALUES
('Acceso para Silla de Ruedas', '/assets/iconos/wheelchair.png', 1),
('Habitaciones Adaptadas', '/assets/iconos/accessible.png', 1),
('Ascensor', '/assets/iconos/elevator.png', 1);



-- Insertar lugares de ejemplo con coordenadas y mapas
INSERT INTO Lugar (Nombre, Direccion, Info, Tipo, Latitud, Longitud, URLMapa, Activo) VALUES
('Playa del Sol', 'Av. Costera 123, Acapulco', 'Hermosa playa con arena blanca y aguas cristalinas', 'Turistico', 16.8531086, -99.8236533, 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3821.234567890123!2d-99.8236533!3d16.8531086!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTbCsDUxJzExLjIiTiA5OcKwNDknMjUuMiJX!5e0!3m2!1ses!2smx!4v1677207420000', 1),

('Museo de Arte Moderno', 'Paseo de la Reforma 123, CDMX', 'Museo con exposiciones nacionales e internacionales', 'Turistico', 19.4326077, -99.1332080, 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3762.500904854035!2d-99.1332080!3d19.4326077!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d1ff38d1a25e9d%3A0xc8c4b05f0e712fe9!2sMuseo%20de%20Arte%20Moderno!5e0!3m2!1ses!2smx!4v1677207420000', 1),

('Hotel Riviera', 'Av. Insurgentes 456, CDMX', 'Hotel 5 estrellas con todas las comodidades', 'Hospedaje', 19.4260451, -99.1618033, 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3762.7841841520737!2d-99.1618033!3d19.4260451!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d1ffc51d89a5b3%3A0x9f6d094df233f17!2sHotel%20Riviera!5e0!3m2!1ses!2smx!4v1677207420000', 1);