-- Your SQL goes here
CREATE TABLE "sales"(
    "id" SERIAL PRIMARY KEY,
    "resource_id" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "units_sold" INTEGER NOT NULL,
    CONSTRAINT "fk_resource_id" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE
);