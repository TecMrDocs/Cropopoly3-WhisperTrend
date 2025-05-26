-- Your SQL goes here
CREATE TABLE "admins"(
	"id" SERIAL PRIMARY KEY,
	"email" VARCHAR(50) NOT NULL,
	"name" VARCHAR(50) NOT NULL,
	"last_name" VARCHAR(50) NOT NULL,
	"password" VARCHAR(150) NOT NULL
);