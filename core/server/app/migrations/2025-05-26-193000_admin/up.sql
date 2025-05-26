-- Your SQL goes here
CREATE TABLE "admins"(
	"id" SERIAL PRIMARY KEY,
	"email" VARCHAR(50) NOT NULL,
	"nombres" VARCHAR(50) NOT NULL,
	"apellidos" VARCHAR(50) NOT NULL,
	"contrasena" VARCHAR(150) NOT NULL
);