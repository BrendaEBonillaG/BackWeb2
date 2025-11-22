USE Web2;


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


INSERT INTO Lugar (Nombre, Direccion, Info, Tipo, Latitud, Longitud, URLMapa, Activo) VALUES 
('Fundidora', 'Adolfo Prieto S/N, Obrera, Monterrey', 'Parque urbano en los terrenos de la antigua fundidora. Más de 100 hectáreas con áreas verdes, museos y espacios deportivos. Pulmón verde de la ciudad.', 'Turismo', 25.678731, -100.284155, 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3595.78334752654!2d-100.28383351348283!3d25.678475647801744!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x86629561ff265483%3A0x1b7bd40783c3a9a8!2sParque%20Fundidora!5e0!3m2!1ses!2smx!4v1763765523654!5m2!1ses!2smx', 1),

('Chipinque', 'Carretera a Chipinque Km. 2.5, San Pedro Garza García', 'Parque ecológico con excelente clima y temperatura promedio de 21°C. Uno de los pasajes naturales más importantes de la región.', 'Turismo', 25.619081, -100.360096, 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d9604.431679537945!2d-100.36055500130828!3d25.61830643123721!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8662bc24126e47dd%3A0xee0d395933b0ac0a!2sChipinque%20A.B.P.%20Ecological%20Park!5e0!3m2!1sen!2smx!4v1763765792379!5m2!1sen!2smx', 1),

('Barrio Antiguo', 'Centro, Monterrey', 'Centro histórico con callejuelas empedradas y arquitectura colonial. Vida nocturna con cervecerías, clubes y galerías de arte local.', 'Turismo', 25.667103, -100.306752, 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1798.0646777790255!2d-100.30672569999999!3d25.667006349999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8662be2f0e3c88b7%3A0x5d3bff8365fe4920!2sBarrio%20Antiguo%2C%20Centro%2C%2064000%20Monterrey%2C%20N.L.!5e0!3m2!1ses!2smx!4v1763765915339!5m2!1ses!2smx', 1),

('Museo Marco', 'Juan Zuazua, Centro, Monterrey', 'Museo de Arte Contemporáneo reconocido por su arquitectura moderna y emblemática escultura La Paloma. Exposiciones de artistas nacionales e internacionales.', 'Turismo', 25.664864, -100.309802, 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3596.197867029535!2d-100.3097914!3d25.664734799999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8662be2e03fe39fd%3A0xbb7e3b710c501bb4!2sMuseo%20De%20Arte%20Contempor%C3%A1neo%20De%20Monterrey%20(MARCO)!5e0!3m2!1ses!2smx!4v1763766567017!5m2!1ses!2smx', 1),

('Museo de Historia Mexicana', 'Dr. José Ma. Coss 445, Centro, Monterrey', 'Ubicado junto al Paseo Santa Lucía. Recorre la historia de México desde civilizaciones prehispánicas hasta la actualidad con salas interactivas.', 'Turismo', 25.671762, -100.306503, 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1960.7303698629237!2d-100.30714684605887!3d25.671451207844306!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8662be2b4088a38f%3A0x5f5d2e5119dcc9b!2sMuseo%20de%20Historia%20Mexicana!5e0!3m2!1ses!2smx!4v1763766814191!5m2!1ses!2smx', 1),

('Hotel Fiesta Inn', 'Av. Miguel Alemán km 105, San Nicolás de los Garza', 'Ubicación privilegiada en zona comercial La Fe. Diseño contemporáneo cerca de centros empresariales y de entretenimiento.', 'Hospedaje', 25.720819, -100.216555, 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3594.5036462925914!2d-100.21947352403514!3d25.720853110290815!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8662ea55ff1ae77f%3A0x9fd3df497e7095ff!2sFiesta%20Inn%20Monterrey%20La%20Fe!5e0!3m2!1ses!2smx!4v1763762862245!5m2!1ses!2smx', 1),

('Hotel Gamma', 'Av. Melchor Ocampo 443 Ote, Centro, Monterrey', 'Combina encanto local con respaldo de Fiesta Americana. Espacios diseñados para estancias únicas con servicio cálido.', 'Hospedaje', 25.666157, -100.312630, 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3596.1591768383173!2d-100.31676158308981!3d25.666017625781393!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x866296710b2ebd95%3A0xed468a61529236f3!2sGamma%20Monterrey%20Gran%20Hotel%20Ancira!5e0!3m2!1ses!2smx!4v1763762127914!5m2!1ses!2smx', 1),

('Hotel NH', 'Av. Miguel Alemán 200, Talaverna, Monterrey', 'Ofrece combinación ideal de calidad, comodidad y ubicación. Ambiente de lujo con variedad de servicios para viajeros.', 'Hospedaje', 25.720347, -100.218960, 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3594.557331208454!2d-100.22096648932876!3d25.71907663554644!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14129cdcf1d99f55%3A0xd942de68f8ae380f!2sPaseo%20La%20Fe!5e0!3m2!1ses!2smx!4v1763762732851!5m2!1ses!2smx', 1),

('Hotel Galería MTY', 'Av. Constitución 411, Monterrey', 'Nuevo referente de hospitalidad. Combina elegancia y tecnología para viajeros de negocios que buscan confort y herramientas de trabajo.', 'Hospedaje', 25.666444, -100.322851, 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7403.080175763923!2d-100.32638501149572!3d25.665837811294296!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8662bfec7b8c7773%3A0xae94ec77df29dd7d!2sHotel%20Galer%C3%ADa%20Plaza%20Monterrey!5e0!3m2!1ses!2smx!4v1763762446035!5m2!1ses!2smx', 1),

('Hotel Krystal', 'Corregidora 519, Centro, Monterrey', 'Ubicación inmejorable cerca de Macroplaza. Arquitectura espectacular con vista al Cerro de la Silla. Lobby Bar y restaurante con panorámica.', 'Hospedaje', 25.666739, -100.311710, 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3596.139045016675!2d-100.3116972!3d25.666685100000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8662be2e8a6c7e5d%3A0x5c4cd6b94c62ed2d!2sHotel%20Krystal%20Monterrey!5e0!3m2!1ses!2smx!4v1763761305463!5m2!1ses!2smx', 1);

-- Lugar 1: Hotel Gamma (Centro)
INSERT INTO Lugar_Servicio (IDLugar, IDServicio) VALUES (7, 1);  -- Wi-Fi Gratuito
INSERT INTO Lugar_Servicio (IDLugar, IDServicio) VALUES (7, 2);  -- Estacionamiento
INSERT INTO Lugar_Servicio (IDLugar, IDServicio) VALUES (7, 6);  -- Restaurante
INSERT INTO Lugar_Servicio (IDLugar, IDServicio) VALUES (7, 14); -- Recepción 24 Horas

-- Lugar 2: Hotel Krystal
INSERT INTO Lugar_Servicio (IDLugar, IDServicio) VALUES (10, 1);  -- Wi-Fi Gratuito
INSERT INTO Lugar_Servicio (IDLugar, IDServicio) VALUES (10, 6);  -- Restaurante
INSERT INTO Lugar_Servicio (IDLugar, IDServicio) VALUES (10, 8);  -- Bar
INSERT INTO Lugar_Servicio (IDLugar, IDServicio) VALUES (10, 14); -- Recepción 24 Horas

-- Lugar 3: Hotel Galería MTY
INSERT INTO Lugar_Servicio (IDLugar, IDServicio) VALUES (9, 1);  -- Wi-Fi Gratuito
INSERT INTO Lugar_Servicio (IDLugar, IDServicio) VALUES (9, 2);  -- Estacionamiento
INSERT INTO Lugar_Servicio (IDLugar, IDServicio) VALUES (9, 9);  -- Gimnasio

-- Lugar 4: Hotel NH
INSERT INTO Lugar_Servicio (IDLugar, IDServicio) VALUES (8, 1);  -- Wi-Fi Gratuito
INSERT INTO Lugar_Servicio (IDLugar, IDServicio) VALUES (8, 2);  -- Estacionamiento
INSERT INTO Lugar_Servicio (IDLugar, IDServicio) VALUES (8, 5);  -- Desayuno Incluido
INSERT INTO Lugar_Servicio (IDLugar, IDServicio) VALUES (8, 6);  -- Restaurante

-- Lugar 6: Hotel Fiesta Inn
INSERT INTO Lugar_Servicio (IDLugar, IDServicio) VALUES (6, 1);  -- Wi-Fi Gratuito
INSERT INTO Lugar_Servicio (IDLugar, IDServicio) VALUES (6, 2);  -- Estacionamiento
INSERT INTO Lugar_Servicio (IDLugar, IDServicio) VALUES (6, 3);  -- Alberca
INSERT INTO Lugar_Servicio (IDLugar, IDServicio) VALUES (6, 9);  -- Gimnasio



-- Hotel Fiesta Inn (IDLugar = 6)
INSERT INTO Fotos (Foto, LugarFK) VALUES
('https://image-tc.galaxy.tf/wijpeg-c98wpv1nmscu65k4j53bqksg/fiesta-inn-monterrey-fundidora_photo.jpg', 6),
('https://images.trvl-media.com/lodging/4000000/3710000/3701200/3701160/3bdb3c48.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill', 6),
('https://image-tc.galaxy.tf/wijpeg-4xo704cove36fvnegitf5r3p4/68054014-fiesta-inn-monterrey-fundidora-5616x3744-result.jpg', 6);

-- Hotel Gamma (IDLugar = 7)
INSERT INTO Fotos (Foto, LugarFK) VALUES
('https://cf.bstatic.com/xdata/images/hotel/max1024x768/351153408.jpg?k=dca887d7ab8f40b4c572418d627ece656cbafdbe409c3814b943876e875d2008&o=', 7),
('https://images.trvl-media.com/lodging/10000000/9850000/9844900/9844885/b9a5c4c9.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill', 7),
('https://image-tc.galaxy.tf/wijpeg-cgck35q9hnwexypmhbhkltsf2/_photo.jpg', 7);

-- Hotel NH (IDLugar = 8)
INSERT INTO Fotos (Foto, LugarFK) VALUES
('https://cf.bstatic.com/xdata/images/hotel/max1024x768/656714966.jpg?k=92620a216d410a7ba8b979d372692d84d10efb69e21f2640f538ea00a49f1dee&o=', 8),
('https://images.trvl-media.com/lodging/20000000/19810000/19800500/19800411/3b57d10c.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill', 8),
('https://mecainter.com/wp-content/uploads/2023/04/NH-Collection-Monterrey-San-Pedro-01.png', 8);

-- Hotel Krystal (IDLugar = 10)
INSERT INTO Fotos (Foto, LugarFK) VALUES
('https://imgcy.trivago.com/c_fill,d_dummy.jpeg,e_sharpen:60,f_auto,h_627,q_auto,w_1200/hotelier-images/88/7a/434e48185873c07e8ba8be4e066a0fc9d91d20f32dfb5e72ddf839065227.jpeg', 10),
('https://images.trvl-media.com/lodging/16000000/15500000/15490100/15490056/74cf713c.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill', 10),
('https://ocvmty.com.mx/wp-content/uploads/Lobby_1.jpg', 10);

-- Hotel Galería MTY (IDLugar = 9)
INSERT INTO Fotos (Foto, LugarFK) VALUES
('https://res.cloudinary.com/itermotus/f_auto,w_1200,h_800,c_fit/assets/galeriaplazahotels/monterrey/general/exterior-3.jpg', 9),
('https://res.cloudinary.com/itermotus/f_auto,w_992,h_480,c_fill,g_auto,dpr_2/assets/galeriaplazahotels/hotels/monterrey.jpg', 9),
('https://images.trvl-media.com/lodging/87000000/86150000/86146300/86146216/06d90776.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill', 9);

-- Fundidora (IDLugar = 1)
INSERT INTO Fotos (Foto, LugarFK) VALUES
('https://media.admagazine.com/photos/67eca5c650bed541eea0b131/master/w_1600%2Cc_limit/IMG_9184.png', 1),
('https://escapadas.mexicodesconocido.com.mx/wp-content/uploads/2020/10/120238810_4103759992984031_8247658761315465946_o.jpg', 1),
('https://www.nomada.news/wp-content/uploads/2021/12/parque-fundidora.jpg', 1);

-- Chipinque (IDLugar = 2)
INSERT INTO Fotos (Foto, LugarFK) VALUES
('https://mvsnoticias.com/u/fotografias/m/2023/9/26/f960x540-564940_639015_5050.jpg', 2),
('https://visitmexico.com/media/usercontent/6886d984e4344-chipinque-3_gmxdot_jpg', 2),
('https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/c2/ae/34/caption.jpg?w=1200&h=-1&s=1', 2);

-- Barrio Antiguo (IDLugar = 3)
INSERT INTO Fotos (Foto, LugarFK) VALUES
('https://cdn2.telediario.mx/uploads/media/2024/08/18/barrio-antiguo-jeronimo-villarreal_0_71_1200_758.jpg', 3),
('https://cdn.milenio.com/uploads/media/2023/06/15/jueves-entregado-distintivo-barrio-magico.jpg', 3),
('https://www.entornoturistico.com/wp-content/uploads/2023/01/Mercado-Barrio-Antiguo.jpg', 3);

-- Museo Marco (IDLugar = 4)
INSERT INTO Fotos (Foto, LugarFK) VALUES
('https://es.artealdia.com/var/artealdia_com/storage/images/noticias/el-marco-celebra-sus-veinticinco-anos/568709-1-esl-AR/El-MARCO-celebra-sus-veinticinco-anos_full.jpg', 4),
('https://arquine.com/wp-content/uploads/2024/02/5V3A1998-web.jpg', 4),
('https://www.legorreta.mx/fotos/proyecto_foto/605100820092037.jpg', 4);

-- Museo Historia Mexicana (IDLugar = 5)
INSERT INTO Fotos (Foto, LugarFK) VALUES
('https://www.3museos.com/wp-content/uploads/2015/10/fachada_mhm_1.jpg', 5),
('https://www.3museos.com/wp-content/uploads/2015/05/DSC_6504-1024x678.jpg', 5),
('https://cdn.mexicodestinos.com/lugares/museo-historia-mexicana-monterrey-galeria.jpg', 5);