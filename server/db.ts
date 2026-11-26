import "dotenv/config";
import pkg from "pg";
const { Client } = pkg;

import { drizzle } from "drizzle-orm/node-postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required. Set it before starting the application.");
}

const client = new Client({ connectionString: databaseUrl });

client
  .connect()
  .then(() => console.log("Connected to the database"))
  .catch((err) => console.error("Database connection error:", err));

const db = drizzle(client);

export { client, db };
