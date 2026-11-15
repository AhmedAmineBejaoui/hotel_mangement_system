import pkg from "pg";
const { Client } = pkg;

import { drizzle } from "drizzle-orm/node-postgres";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL must be configured before starting the server");
}

const client = new Client({ connectionString });

client
  .connect()
  .then(() => console.log("Connected to the database"))
  .catch((err) => console.error("Database connection error:", err));

// Création de l'instance Drizzle ORM
const db = drizzle(client);

export { client, db };
