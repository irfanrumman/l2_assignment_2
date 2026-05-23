import { Pool } from "pg";
import config from "../configaration";

export const pool = new Pool({
  connectionString: config.connection,
});

export const initDB = async () => {
  try {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,

    role VARCHAR(20) DEFAULT 'contributor' CHECK (role IN('contributor', 'maintainer')),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
    ) 
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS issues(
      id SERIAL PRIMARY KEY,
      
      title VARCHAR(150) NOT NULL,
      description TEXT NOT NULL CHECK (char_length(trim(description)) >=20),
      type VARCHAR(255) NOT NULL CHECK (type IN ('bug', 'feature_request')),
      status VARCHAR(255) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
      reporter_id INT NOT NULL,

      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
      )
      `);
    console.log("db connected");
  } catch (error: any) {
    console.log(error);
  }
};
