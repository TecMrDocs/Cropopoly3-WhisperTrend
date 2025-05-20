CREATE TABLE "users"(
	"id" SERIAL PRIMARY KEY,
	"email" VARCHAR(50) NOT NULL,
	"name" VARCHAR(50) NOT NULL,
	"last_name" VARCHAR(50) NOT NULL,
	"phone" VARCHAR(50) NOT NULL,
	"position" VARCHAR(50) NOT NULL,
	"password" VARCHAR(150) NOT NULL,
	"plan" VARCHAR(50) NOT NULL,
	"business_name" VARCHAR(50) NOT NULL,
	"industry" VARCHAR(50) NOT NULL,
	"company_size" VARCHAR(50) NOT NULL,
	"scope" VARCHAR(50) NOT NULL,
	"locations" VARCHAR(250) NOT NULL,
	"num_branches" VARCHAR(50) NOT NULL
);