import pkg from "pg";
const { Client } = pkg;

import { drizzle } from "drizzle-orm/node-postgres";

const client = new Client({
  host: "localhost",
  user: "postgres",
  password: "Ahmedahmed2004$",
  database: "postgres", 
  port: 5432,
});

client
  .connect()
  .then(() => console.log("Connected to the database"))
  .catch((err) => console.error("Database connection error:", err));

// Création de l'instance Drizzle ORM
const db = drizzle(client);

export { client, db };
