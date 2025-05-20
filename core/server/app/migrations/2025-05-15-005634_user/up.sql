CREATE TABLE "users"(
	"id" SERIAL PRIMARY KEY,
	"email" VARCHAR(50) NOT NULL,
	"nombres" VARCHAR(50) NOT NULL,
	"apellidos" VARCHAR(50) NOT NULL,
	"telefono" VARCHAR(50) NOT NULL,
	"puesto" VARCHAR(50) NOT NULL,
	"contrasena" VARCHAR(150) NOT NULL,
	"plan" VARCHAR(50) NOT NULL,
	"razon_social" VARCHAR(50) NOT NULL,
	"sector" VARCHAR(50) NOT NULL,
	"tamano_empresa" VARCHAR(50) NOT NULL,
	"alcance" VARCHAR(50) NOT NULL,
	"localidades" VARCHAR(250) NOT NULL,
	"num_sucursales" VARCHAR(50) NOT NULL
);