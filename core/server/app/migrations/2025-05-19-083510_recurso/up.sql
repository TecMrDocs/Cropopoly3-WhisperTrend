-- Your SQL goes here
CREATE TABLE "recursos"(
    "id" SERIAL PRIMARY KEY,
    "id_usuario" INTEGER NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" VARCHAR(300) NOT NULL,
    "palabras_rel" VARCHAR(300) NOT NULL
);