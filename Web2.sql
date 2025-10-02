CREATE DATABASE Web2;
USE Web2;

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Admin';
FLUSH PRIVILEGES;

-- Tabla de usuarios
CREATE TABLE Usuario(
  IDUsuario INT AUTO_INCREMENT PRIMARY KEY,
  Usuario VARCHAR(30) NOT NULL,
  Nombre VARCHAR(100) NOT NULL,
  Correo VARCHAR(100) NOT NULL UNIQUE,
  Telefono VARCHAR(20) NOT NULL,
  Password VARCHAR(255) NOT NULL, -- mejor para hash
  Foto VARCHAR(255) NULL, -- ruta o URL de la foto
  Activo TINYINT(1) NOT NULL DEFAULT 1 -- 1 = activo, 0 = inactivo
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
