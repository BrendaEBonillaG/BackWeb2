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

-- Tabla de servicios (pre-cargados)
CREATE TABLE Servicios (
  IDServicios INT AUTO_INCREMENT PRIMARY KEY,
  Nombre VARCHAR(50) NOT NULL,
  Logo VARCHAR(255) NULL, -- ruta o URL del logo
  Activo TINYINT(1) NOT NULL DEFAULT 1
);

-- Tabla de lugares
CREATE TABLE Lugar(
  IDLugar INT AUTO_INCREMENT PRIMARY KEY,
  Nombre VARCHAR(100) NOT NULL,
  Direccion VARCHAR(200) NOT NULL,
  Info VARCHAR(400) NOT NULL,
  Tipo VARCHAR(50) NOT NULL, -- Hospedaje o turístico
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