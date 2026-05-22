import { pool } from "../../db";
import type { IUser } from "./user.interface";
import bcrypt from "bcrypt";

const signupUserToDB = async (payload: IUser) => {
  const { name, email, password, role } = payload;

  const hashPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `
     INSERT INTO users(name, email, password, role) VALUES($1, $2, $3, COALESCE($4, 'contributor')) RETURNING *
    `,
    [name, email, hashPassword, role],
  );

  if (result.rows.length === 0) {
    throw new Error("User not created");
  }
  return result.rows[0];
};

export const authService = {
  signupUserToDB,
};
