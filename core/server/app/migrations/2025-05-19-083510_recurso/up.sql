CREATE TABLE "resources"(
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "r_type" VARCHAR(50) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" VARCHAR(300) NOT NULL,
    "related_words" VARCHAR(300) NOT NULL,
    CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);